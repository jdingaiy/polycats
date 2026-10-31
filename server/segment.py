"""Local image segmentation and bounded polygon extraction; no image uploads to third parties."""
import base64
import io
import os
from pathlib import Path
import threading
import warnings

os.environ.setdefault('OMP_NUM_THREADS', '4')
os.environ.setdefault('U2NET_HOME', str(Path(__file__).resolve().parents[1] / '.cache' / 'rembg'))
from PIL import Image, ImageOps, UnidentifiedImageError
import pillow_heif
import numpy as np
from scipy import ndimage
from skimage.measure import find_contours, approximate_polygon

pillow_heif.register_heif_opener()
Image.MAX_IMAGE_PIXELS = 40_000_000
MODEL = 'birefnet-general-lite'
_session = None
_lock = threading.Lock()


def _infer(image):
    global _session
    from rembg import new_session, remove
    with _lock:
        if _session is None:
            _session = new_session(MODEL, providers=['CPUExecutionProvider'])
        return remove(image, session=_session).getchannel('A')


def extract_outline(alpha, max_vertices=15):
    labels, count = ndimage.label(np.asarray(alpha) >= 128)
    if not count:
        raise ValueError('没有找到清晰主体，请换一张背景更清楚的图片。')
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    selected = ndimage.binary_fill_holes(labels == np.argmax(sizes))
    if selected.sum() < 100:
        raise ValueError('主体太小，请上传主体更清楚的图片。')
    contours = find_contours(np.pad(selected, 1), .5)
    def area(p):
        return abs(np.sum(p[:-1, 1] * p[1:, 0] - p[1:, 1] * p[:-1, 0]))
    outer = max(contours, key=area) - 1
    def simplify(tolerance):
        p = approximate_polygon(outer, tolerance=tolerance)
        return p[:-1] if len(p) > 1 and np.linalg.norm(p[0] - p[-1]) < 1e-6 else p
    lo, hi = 0., 1.
    while len(simplify(hi)) > max_vertices:
        hi *= 2
    candidates = []
    for _ in range(26):
        tolerance = (lo + hi) / 2
        p = simplify(tolerance)
        if len(p) > max_vertices:
            lo = tolerance
        else:
            hi = tolerance
            if len(p) >= 3:
                candidates.append((tolerance, p))
    if not candidates:
        raise ValueError('无法提取有效轮廓，请换一张图片。')
    _, p = min(candidates, key=lambda v: v[0])
    points = [[float(x), float(y)] for y, x in p]
    xs, ys = [v[0] for v in points], [v[1] for v in points]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    scale = 440 / max(max(xs) - min(xs), max(ys) - min(ys), 1)
    board = [[round((x-cx)*scale+250, 2), round((y-cy)*scale+250, 2)] for x, y in points]
    return board, {'x': 250-cx*scale, 'y': 250-cy*scale, 'width': alpha.width*scale, 'height': alpha.height*scale}


def process_image(data):
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            image = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image = image.convert('RGBA')
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ValueError('无法读取图片，请使用 JPG、PNG、WebP 或 HEIC 图片。') from exc
    alpha = image.getchannel('A')
    # Existing transparency is already a cutout and should not be segmented again.
    if alpha.getextrema()[0] < 128:
        mask = alpha
    else:
        mask = _infer(image.convert('RGB'))
    points, placement = extract_outline(mask)
    preview = io.BytesIO()
    image.save(preview, 'PNG')
    return {'points': points, 'vertices': len(points), 'placement': placement,
            'image': 'data:image/png;base64,' + base64.b64encode(preview.getvalue()).decode('ascii')}
