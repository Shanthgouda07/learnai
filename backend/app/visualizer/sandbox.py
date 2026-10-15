"""
Sandbox runner for the tracer subprocess.
Executes tracer_runner.py in an isolated subprocess with strict timeouts,
resource limits (on POSIX systems), and output caps.
"""
import sys
import os
import json
import logging
import tempfile
import subprocess
from typing import Dict, Any, List, Optional
from app.visualizer.validator import validate_code

logger = logging.getLogger(__name__)

MAX_OUTPUT_BYTES = 2 * 1024 * 1024  # 2 MB cap
TRACER_RUNNER_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "tracer_runner.py")
)


def _get_preexec_fn():
    """Returns a preexec_fn with resource limits on POSIX platforms."""
    if sys.platform == "win32":
        logger.warning(
            "Windows platform detected: POSIX resource limits (setrlimit) unavailable. "
            "Relying on subprocess timeout and AST validator for isolation."
        )
        return None

    try:
        import resource

        def set_limits():
            # CPU time limit: 3 seconds
            resource.setrlimit(resource.RLIMIT_CPU, (3, 3))
            # Virtual memory address space: 256 MB
            mem_bytes = 256 * 1024 * 1024
            try:
                resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))
            except (ValueError, OSError):
                pass
            # File creation size: 0 (cannot write new files)
            try:
                resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))
            except (ValueError, OSError):
                pass
            # Prevent fork bombs
            if hasattr(resource, "RLIMIT_NPROC"):
                try:
                    resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
                except (ValueError, OSError):
                    pass

        return set_limits
    except ImportError:
        return None


def run_in_sandbox(
    code: str,
    stdin_lines: Optional[List[str]] = None,
    max_steps: int = 500,
    timeout_sec: float = 3.0,
) -> Dict[str, Any]:
    """
    Run Python code inside the sandbox tracer.
    Performs static AST validation first, then invokes tracer_runner.py.
    """
    # 1. Static validation check
    validation = validate_code(code)
    if not validation["ok"]:
        return {
            "steps": [],
            "truncated": False,
            "error": {
                "type": "SecurityError" if "SyntaxError" not in (validation["error"] or "") else "SyntaxError",
                "message": validation["error"],
                "line": validation["line"],
            },
            "final_stdout": "",
        }

    # 2. Prepare payload
    payload = json.dumps({
        "code": code,
        "stdin_lines": stdin_lines or [],
        "max_steps": max_steps,
    })

    # 3. Environment: clean env with minimal OS requirements if Windows
    clean_env = {}
    if sys.platform == "win32":
        # Keep SYSTEMROOT / PATH if needed for python.exe loading DLLs
        for key in ["SYSTEMROOT", "SystemDrive", "windir", "PATH", "TEMP", "TMP"]:
            if key in os.environ:
                clean_env[key] = os.environ[key]

    kwargs = {}
    if sys.platform == "win32" and hasattr(subprocess, "CREATE_NO_WINDOW"):
        kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

    preexec = _get_preexec_fn()

    with tempfile.TemporaryDirectory() as temp_dir:
        cmd = [sys.executable, "-I", TRACER_RUNNER_PATH]
        try:
            proc = subprocess.run(
                cmd,
                input=payload.encode("utf-8"),
                capture_output=True,
                timeout=timeout_sec,
                cwd=temp_dir,
                env=clean_env,
                preexec_fn=preexec,
                **kwargs,
            )

        except subprocess.TimeoutExpired:
            return {
                "steps": [],
                "truncated": True,
                "error": {
                    "type": "Timeout",
                    "message": "Your code took too long. Check for infinite loops.",
                    "line": None,
                },
                "final_stdout": "",
            }
        except Exception as e:
            return {
                "steps": [],
                "truncated": False,
                "error": {
                    "type": "SubprocessError",
                    "message": f"Execution failed: {str(e)}",
                    "line": None,
                },
                "final_stdout": "",
            }

        # 4. Check output size cap
        if len(proc.stdout) > MAX_OUTPUT_BYTES:
            return {
                "steps": [],
                "truncated": True,
                "error": {
                    "type": "OutputTooLarge",
                    "message": "Execution output exceeded limit (2 MB)",
                    "line": None,
                },
                "final_stdout": "",
            }

        stdout_text = proc.stdout.decode("utf-8", errors="replace").strip()

        if proc.returncode != 0 and not stdout_text:
            stderr_text = proc.stderr.decode("utf-8", errors="replace").strip()
            return {
                "steps": [],
                "truncated": False,
                "error": {
                    "type": "ExecutionError",
                    "message": stderr_text or f"Process exited with code {proc.returncode}",
                    "line": None,
                },
                "final_stdout": "",
            }

        try:
            return json.loads(stdout_text)
        except json.JSONDecodeError:
            return {
                "steps": [],
                "truncated": False,
                "error": {
                    "type": "OutputFormatError",
                    "message": "Failed to parse tracer output JSON.",
                    "line": None,
                },
                "final_stdout": stdout_text[:500],
            }
