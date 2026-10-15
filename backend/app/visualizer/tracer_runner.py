"""
Tracer Runner – runs inside the sandbox subprocess.
Reads JSON from stdin: {code, stdin_lines, max_steps}.
Executes Python code with sys.settrace in a restricted environment,
captures step-by-step state, variables, call stack, and stdout,
and prints the resulting trace as JSON to the real stdout.
"""
import sys
import io
import json
from types import ModuleType, FunctionType

# Save references to real stdout/stdin before any redirection
REAL_STDOUT = sys.__stdout__
REAL_STDIN = sys.__stdin__

ALLOWED_MODULE_NAMES = {
    "math",
    "random",
    "string",
    "itertools",
    "collections",
    "functools",
    "statistics",
}


class StepLimitExceeded(Exception):
    """Raised to break out of execution when max_steps is reached."""
    pass


class CappedStringIO(io.StringIO):
    """StringIO capped at max_chars to avoid memory exhaustion."""
    def __init__(self, max_chars=10000):
        super().__init__()
        self.max_chars = max_chars
        self.total_chars = 0

    def write(self, s):
        if not s or self.total_chars >= self.max_chars:
            return 0
        remaining = self.max_chars - self.total_chars
        chunk = s[:remaining]
        self.total_chars += len(chunk)
        return super().write(chunk)


def serialize_val(val, depth=0):
    """
    JSON-safe serialization capped by depth and item count.
    Adds 'id' for collections so frontend can track object identity / shared references.
    """
    if val is None or isinstance(val, (bool, int, float)):
        return val

    if isinstance(val, str):
        return val[:500]

    if depth >= 3:
        return {"type": "object", "repr": repr(val)[:100]}

    if isinstance(val, (list, tuple, set)):
        type_name = "list" if isinstance(val, list) else ("tuple" if isinstance(val, tuple) else "set")
        items = [serialize_val(x, depth + 1) for x in list(val)[:50]]
        return {
            "type": type_name,
            "id": id(val),
            "items": items,
            "length": len(val),
        }

    if isinstance(val, dict):
        entries = []
        for k, v in list(val.items())[:50]:
            entries.append({
                "key": serialize_val(k, depth + 1),
                "value": serialize_val(v, depth + 1),
            })
        return {
            "type": "dict",
            "id": id(val),
            "entries": entries,
            "length": len(val),
        }

    if isinstance(val, (FunctionType, type(len))):
        name = getattr(val, "__name__", "<func>")
        return {"type": "function", "name": name}

    if isinstance(val, ModuleType):
        return {"type": "module", "name": getattr(val, "__name__", "<module>")}

    # Default fallback for arbitrary objects
    return {"type": "object", "repr": repr(val)[:100]}


def serialize_scope(scope_dict):
    """Serialize dictionary of variables excluding dunders and builtins."""
    res = {}
    for k, v in scope_dict.items():
        if k.startswith("__"):
            continue
        if isinstance(v, (ModuleType, FunctionType)) and getattr(v, "__module__", "") == "builtins":
            continue
        res[k] = serialize_val(v)
    return res


def run_tracer():
    try:
        raw_input = REAL_STDIN.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
    except Exception as e:
        REAL_STDOUT.write(json.dumps({
            "steps": [],
            "truncated": False,
            "error": {"type": "InputError", "message": f"Failed to parse runner input: {str(e)}", "line": None},
            "final_stdout": "",
        }))
        return

    code = payload.get("code", "")
    stdin_lines = list(payload.get("stdin_lines", []))
    max_steps = int(payload.get("max_steps", 500))

    # Pre-import allowed modules
    imported_modules = {}
    for mod in ALLOWED_MODULE_NAMES:
        try:
            imported_modules[mod] = __import__(mod)
        except ImportError:
            pass

    def mock_input(prompt=""):
        if prompt:
            sys.stdout.write(str(prompt))
        if stdin_lines:
            return stdin_lines.pop(0)
        return ""

    def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
        root = name.split(".")[0]
        if root in ALLOWED_MODULE_NAMES:
            return __import__(name, globals, locals, fromlist, level)
        raise ImportError(f"Importing '{name}' is not allowed in sandbox.")

    # Restricted builtins
    safe_builtins = {
        "print": print,
        "len": len,
        "range": range,
        "int": int,
        "float": float,
        "str": str,
        "bool": bool,
        "list": list,
        "dict": dict,
        "set": set,
        "tuple": tuple,
        "enumerate": enumerate,
        "zip": zip,
        "map": map,
        "filter": filter,
        "sum": sum,
        "min": min,
        "max": max,
        "abs": abs,
        "round": round,
        "sorted": sorted,
        "reversed": reversed,
        "isinstance": isinstance,
        "type": type,
        "any": any,
        "all": all,
        "pow": pow,
        "divmod": divmod,
        "chr": chr,
        "ord": ord,
        "True": True,
        "False": False,
        "None": None,
        "Exception": Exception,
        "ValueError": ValueError,
        "TypeError": TypeError,
        "IndexError": IndexError,
        "KeyError": KeyError,
        "ZeroDivisionError": ZeroDivisionError,
        "NameError": NameError,
        "AttributeError": AttributeError,
        "StopIteration": StopIteration,
        "input": mock_input,
        "__import__": safe_import,
    }

    user_globals = {
        "__builtins__": safe_builtins,
        "__name__": "__main__",
        "__doc__": None,
    }

    stdout_capture = CappedStringIO(max_chars=10000)
    sys.stdout = stdout_capture

    steps = []
    truncated = False
    runtime_error = None
    step_count = 0
    prev_scope = {}

    def trace_dispatch(frame, event, arg):
        nonlocal step_count, truncated, prev_scope

        # Only trace frames from student code
        if frame.f_code.co_filename != "<student>":
            return None

        if step_count >= max_steps:
            truncated = True
            raise StepLimitExceeded(f"Stopped after {max_steps} steps (possible infinite loop)")

        step_count += 1

        func_name = frame.f_code.co_name
        current_line = frame.f_lineno

        # Current frame locals
        curr_locals = serialize_scope(frame.f_locals)

        # Globals: user defined globals only, excluding functions/modules and dunder
        curr_globals = {}
        for k, v in user_globals.items():
            if k.startswith("__") or k in safe_builtins:
                continue
            if isinstance(v, (ModuleType, FunctionType)):
                continue
            curr_globals[k] = serialize_val(v)

        # Build call stack: newest frame on top
        call_stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == "<student>":
                call_stack.append({
                    "func": f.f_code.co_name,
                    "line": f.f_lineno,
                    "locals": serialize_scope(f.f_locals),
                })
            f = f.f_back

        # Determine changed variables since previous step
        active_scope = curr_locals if func_name != "<module>" else curr_globals
        changed = []
        for var_name, var_val in active_scope.items():
            if var_name not in prev_scope or prev_scope[var_name] != var_val:
                changed.append(var_name)
        # Snapshot for next comparison
        prev_scope = active_scope.copy()

        # Return value if return event
        return_val = None
        if event == "return":
            return_val = serialize_val(arg)

        step_obj = {
            "step": step_count,
            "event": event,
            "line": current_line,
            "func": func_name,
            "locals": curr_locals,
            "globals": curr_globals,
            "call_stack": call_stack,
            "stdout": stdout_capture.getvalue(),
            "return_value": return_val,
            "changed": changed,
        }
        steps.append(step_obj)

        return trace_dispatch

    # Compile and execute
    try:
        compiled = compile(code, "<student>", "exec")
        sys.settrace(trace_dispatch)
        exec(compiled, user_globals)
    except StepLimitExceeded as e:
        truncated = True
        last_line = steps[-1]["line"] if steps else None
        runtime_error = {
            "type": "StepLimit",
            "message": str(e),
            "line": last_line,
        }
    except Exception as e:
        # Extract line number from traceback if possible
        err_line = None
        tb = sys.exc_info()[2]
        while tb:
            if tb.tb_frame.f_code.co_filename == "<student>":
                err_line = tb.tb_lineno
            tb = tb.tb_next
        if err_line is None and steps:
            err_line = steps[-1]["line"]

        runtime_error = {
            "type": e.__class__.__name__,
            "message": str(e),
            "line": err_line,
        }
    finally:
        sys.settrace(None)
        sys.stdout = REAL_STDOUT

    final_stdout = stdout_capture.getvalue()
    result = {
        "steps": steps,
        "truncated": truncated,
        "error": runtime_error,
        "final_stdout": final_stdout,
    }

    REAL_STDOUT.write(json.dumps(result))


if __name__ == "__main__":
    run_tracer()
