/* Web Worker for executing Python 3 test cases via Pyodide */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let pyodideReadyPromise = null;

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { source, name, tests } = event.data;
  try {
    const pyodide = await getPyodide();
    const payload = JSON.stringify({ source, name, tests });
    pyodide.globals.set("__payload_json", payload);

    const rawResult = await pyodide.runPythonAsync(`
import ast, io, json, os, sys, traceback

STRICT_STR_FUNCS = ("clean_spaces", "caesar_encrypt", "mask_card", "rle_encode", "decode_string", "reverse_text")

def __norm_str(s, func_name=""):
    s = s.strip()
    if func_name in STRICT_STR_FUNCS:
        return s
    s = s.lower().rstrip(".!?").strip()
    for p in (",", ":", ";", "-"):
        s = p.join(seg.strip() for seg in s.split(p))
    return " ".join(s.split())

def __is_equiv(a, b, func_name=""):
    if a == b and (type(a) is type(b) or (isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool))):
        return True
    if isinstance(a, bool) or isinstance(b, bool):
        if isinstance(a, str) and isinstance(b, bool):
            return a.strip().lower() == str(b).lower()
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) <= 1e-4
    if isinstance(a, str) and isinstance(b, (int, float)):
        try:
            return abs(float(a.strip()) - float(b)) <= 1e-4
        except Exception:
            return False
    if isinstance(a, str) and isinstance(b, str):
        return __norm_str(a, func_name) == __norm_str(b, func_name)
    if isinstance(b, list) and not isinstance(a, (str, bytes, dict)) and hasattr(a, "__iter__"):
        a_list = list(a)
        if len(a_list) != len(b):
            return False
        if all(__is_equiv(x, y, func_name) for x, y in zip(a_list, b)):
            return True
        if func_name == "anagram_groups":
            try:
                na = sorted(sorted(str(x) for x in g) for g in a_list)
                nb = sorted(sorted(str(x) for x in g) for g in b)
                return na == nb
            except Exception:
                return False
        return False
    if isinstance(a, dict) and isinstance(b, dict):
        if len(a) != len(b):
            return False
        b_map = {str(k).strip(): v for k, v in b.items()}
        for k, v in a.items():
            sk = str(k).strip()
            if sk not in b_map or not __is_equiv(v, b_map[sk], func_name):
                return False
        return True
    return False

def __run_suite():
    data = json.loads(__payload_json)
    source = data["source"]
    func_name = data["name"]
    tests = data["tests"]

    # Clean up temporary practice files before run
    for fname in ("practice.txt", "notes.txt", "quiz.txt"):
        if os.path.exists(fname):
            try:
                os.remove(fname)
            except Exception:
                pass

    env = {}
    try:
        exec(source, env)
    except Exception as exc:
        return json.dumps({
            "error": f"{type(exc).__name__}: {exc}"
        })

    if func_name not in env or not callable(env[func_name]):
        return json.dumps({
            "error": f"Function '{func_name}' was not found or is not callable. Check your function name and indentation."
        })

    fn = env[func_name]
    results = []
    for args, expected in tests:
        for fname in ("practice.txt", "notes.txt", "quiz.txt"):
            if os.path.exists(fname):
                try:
                    os.remove(fname)
                except Exception:
                    pass
        try:
            # Copy list/dict args so in-place mutation doesn't corrupt display
            call_args = json.loads(json.dumps(args))
            call_buf = io.StringIO()
            old_out = sys.stdout
            sys.stdout = call_buf
            try:
                actual = fn(*call_args)
            finally:
                sys.stdout = old_out
            if actual is None and expected is not None:
                printed = call_buf.getvalue().rstrip(chr(10))
                if printed:
                    if isinstance(expected, str):
                        actual = printed
                    else:
                        try:
                            actual = ast.literal_eval(printed.strip())
                        except Exception:
                            actual = printed
            passed = __is_equiv(actual, expected, func_name or "")
            results.append({
                "pass": bool(passed),
                "expected": expected,
                "actual": repr(actual)
            })
        except Exception as exc:
            results.append({
                "pass": False,
                "expected": expected,
                "actual": None,
                "error": f"{type(exc).__name__}: {exc}"
            })
    return json.dumps({"results": results})

__run_suite()
`);

    self.postMessage(JSON.parse(rawResult));
  } catch (err) {
    self.postMessage({
      error:
        "Python runtime error: " +
        (err && err.message ? err.message : String(err)),
    });
  }
};
