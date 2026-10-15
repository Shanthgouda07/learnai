"""
Static code validator for student Python code.
Runs AST checks BEFORE execution to catch unsafe imports, builtins,
and dunder attribute accesses with friendly, clear error messages.
"""
import ast
from typing import Dict, Any, Optional

ALLOWED_MODULES = {
    "math",
    "random",
    "string",
    "itertools",
    "collections",
    "functools",
    "statistics",
}

FORBIDDEN_NAMES = {
    "open",
    "exec",
    "eval",
    "compile",
    "__import__",
    "globals",
    "locals",
    "vars",
    "getattr",
    "setattr",
    "delattr",
    "breakpoint",
    "exit",
    "quit",
    "builtins",
    "__builtins__",
    "memoryview",
    "help",
    "license",
    "copyright",
    "credits",
}

DANGEROUS_ATTRS = {
    "__class__",
    "__bases__",
    "__subclasses__",
    "__mro__",
    "__dict__",
    "__code__",
    "__globals__",
    "__closure__",
    "__builtins__",
    "__import__",
    "__reduce__",
    "__reduce_ex__",
    "__getstate__",
    "__setstate__",
    "_module",
    "_globals",
    "gi_frame",
    "f_globals",
    "f_locals",
    "f_builtins",
    "f_code",
    "tb_frame",
}

MAX_CODE_LENGTH = 5000


def validate_code(code: str) -> Dict[str, Any]:
    """
    Validate Python code for safety.
    Returns:
        {"ok": True, "error": None, "line": None} if safe
        {"ok": False, "error": str, "line": int | None} if rejected
    """
    if len(code) > MAX_CODE_LENGTH:
        return {
            "ok": False,
            "error": f"Code length ({len(code)} chars) exceeds the maximum allowed ({MAX_CODE_LENGTH} characters).",
            "line": None,
        }

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "ok": False,
            "error": f"SyntaxError: {e.msg}",
            "line": e.lineno,
        }

    for node in ast.walk(tree):
        # 1. Check imports: import X or from X import Y
        if isinstance(node, ast.Import):
            for alias in node.names:
                root_module = alias.name.split(".")[0]
                if root_module not in ALLOWED_MODULES:
                    return {
                        "ok": False,
                        "error": f"Importing '{alias.name}' is not allowed. Allowed modules: {', '.join(sorted(ALLOWED_MODULES))}.",
                        "line": getattr(node, "lineno", None),
                    }
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                root_module = node.module.split(".")[0]
                if root_module not in ALLOWED_MODULES:
                    return {
                        "ok": False,
                        "error": f"Importing from '{node.module}' is not allowed. Allowed modules: {', '.join(sorted(ALLOWED_MODULES))}.",
                        "line": getattr(node, "lineno", None),
                    }

        # 2. Check forbidden names (calls or name references like open, exec, eval, etc.)
        if isinstance(node, ast.Name):
            if node.id in FORBIDDEN_NAMES:
                return {
                    "ok": False,
                    "error": f"Using '{node.id}' is forbidden for security reasons.",
                    "line": getattr(node, "lineno", None),
                }

        # 3. Check dunder and dangerous attribute access (e.g. obj.__class__, obj.__bases__, obj._module)
        if isinstance(node, ast.Attribute):
            attr = node.attr
            if (attr.startswith("__") and attr.endswith("__")) or attr in DANGEROUS_ATTRS:
                return {
                    "ok": False,
                    "error": f"Accessing restricted attribute '{attr}' is not allowed for security reasons.",
                    "line": getattr(node, "lineno", None),
                }

    return {"ok": True, "error": None, "line": None}

