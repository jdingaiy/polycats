"""Use the project's isolated Python environment when installed."""
import os
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
python = root / '.venv' / 'bin' / 'python'
if python.is_file() and Path(sys.prefix).resolve() != (root / '.venv').resolve():
    os.execv(str(python), [str(python), str(root / 'server' / 'serve.py'), *sys.argv[1:]])
import importlib.util
if not all(importlib.util.find_spec(name) for name in ('rembg','pillow_heif')):
    print('Install image import dependencies first:\npython3 -m venv .venv\n.venv/bin/pip install -r requirements.txt', file=sys.stderr)
    sys.exit(1)
os.execv(sys.executable, [sys.executable, str(root / 'server' / 'serve.py'), *sys.argv[1:]])
