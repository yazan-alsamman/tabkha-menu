"""Derive the web asset set from the original Tabkha brand PDFs.

The design files in `referenses/` are the single source of truth for the brand.
This script turns them into the SVGs and responsive images the app ships, so the
assets can always be regenerated instead of being hand-traced.

    python scripts/extract_assets.py

Requires: PyMuPDF, Pillow.
"""

from __future__ import annotations

import io
import json
import re
import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / "referenses"
BRAND_OUT = ROOT / "public" / "brand"
IMG_OUT = ROOT / "public" / "images" / "categories"
DATA_OUT = ROOT / "src" / "data" / "generated"

LOGO_PDF = REFS / "Restaurant Facade Logo2.pdf"
MENU_PDF = REFS / "tabkha & more.pdf"

BACKGROUND_FILL = "#eddfce"

# Clusters are separated by wide horizontal gaps in the facade artwork.
CLUSTER_GAP = 300
# Word gaps inside the Arabic wordmark are much tighter than the cluster gaps.
WORD_GAP = 120


def shape_rects(page: fitz.Page) -> list[fitz.Rect]:
    """Bounding boxes of every drawn shape, minus the full-bleed background."""
    return [
        d["rect"]
        for d in page.get_drawings()
        if d["rect"].width < page.rect.width * 0.9
    ]


def cluster(rects: list[fitz.Rect], gap: float) -> list[fitz.Rect]:
    """Group shapes into bounding boxes separated by at least `gap` horizontally."""
    rects = sorted(rects, key=lambda r: r.x0)
    groups: list[list[fitz.Rect]] = [[rects[0]]]
    for r in rects[1:]:
        if r.x0 - max(x.x1 for x in groups[-1]) > gap:
            groups.append([r])
        else:
            groups[-1].append(r)
    return [
        fitz.Rect(
            min(r.x0 for r in g),
            min(r.y0 for r in g),
            max(r.x1 for r in g),
            max(r.y1 for r in g),
        )
        for g in groups
    ]


PATH_RE = re.compile(r"<path[^>]*?/>")
TRANSLATE_RE = re.compile(r"matrix\([^)]*?,\s*([-\d.]+)\s*,\s*[-\d.]+\s*\)")


def write_svg(page_svg: str, box: fitz.Rect, dest: Path, pad: float = 0.0) -> None:
    """Emit one region of the artwork as a standalone SVG containing only its paths.

    Each path carries an absolute translate in page-point space, so a region can be
    isolated by that translate rather than by clipping the whole page.
    """
    x0, y0 = box.x0 - pad, box.y0 - pad
    w, h = box.width + pad * 2, box.height + pad * 2

    kept = []
    for path in PATH_RE.findall(page_svg):
        if BACKGROUND_FILL in path.lower():
            continue
        m = TRANSLATE_RE.search(path)
        if m is None or not (box.x0 - 1 <= float(m.group(1)) <= box.x1 + 1):
            continue
        # Let the mark inherit colour so one file serves every brand surface.
        kept.append(path.replace('fill="#233025"', 'fill="currentColor"'))

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} '
        f'{w:.2f} {h:.2f}" fill="currentColor" role="img" aria-hidden="true">'
        + "".join(kept)
        + "</svg>"
    )
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(svg, encoding="utf-8")
    print(f"  {dest.relative_to(ROOT)}  {len(kept)} paths  ({w:.0f}x{h:.0f})")


def extract_logo() -> None:
    print("Logo artwork")
    doc = fitz.open(LOGO_PDF)
    page = doc[0]
    boxes = cluster(shape_rects(page), CLUSTER_GAP)
    if len(boxes) != 3:
        raise SystemExit(f"expected 3 logo clusters, found {len(boxes)}")
    latin, mark, arabic = boxes

    # Arabic reads right-to-left, so "طبخة" is the right-most word group.
    arabic_words = cluster(
        [r for r in shape_rects(page) if arabic.x0 <= r.x0 <= arabic.x1], WORD_GAP
    )
    tabkha = arabic_words[-1]
    page_svg = page.get_svg_image()
    doc.close()

    write_svg(page_svg, mark, BRAND_OUT / "petal-mark.svg")
    write_svg(page_svg, latin, BRAND_OUT / "wordmark-latin.svg")
    write_svg(page_svg, arabic, BRAND_OUT / "wordmark-ar.svg")
    write_svg(page_svg, tabkha, BRAND_OUT / "glyph-tabkha.svg")


# Each category takes its hero from the photography already art-directed into the
# printed menu. (page number, x0, y0, x1, y1) in PDF points.
CATEGORY_CROPS: dict[str, tuple[int, float, float, float, float]] = {
    "breakfast": (2, 8, 95, 195, 370),
    "soups": (3, 25, 165, 245, 390),
    "salads-east": (3, 330, 545, 555, 800),
    "doughs": (4, 5, 90, 165, 300),
    "cold-appetizers": (5, 0, 0, 567, 118),
    "hot-appetizers": (5, 345, 500, 555, 690),
    "hot-dishes-eastern": (6, 5, 300, 195, 500),
    "hot-dishes-western": (6, 400, 600, 555, 760),
    "pizza": (7, 310, 8, 555, 155),
    "pasta": (7, 120, 650, 470, 810),
    "sandwich-eastern": (8, 15, 95, 230, 245),
    "sandwich-western": (8, 330, 390, 555, 530),
    "grills": (9, 430, 90, 555, 360),
    "daily-dish": (9, 20, 705, 545, 818),
}

WIDTHS = (480, 900, 1400)


def extract_category_images() -> None:
    print("Category photography")
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(MENU_PDF)
    manifest: dict[str, dict] = {}

    for slug, (page_no, x0, y0, x1, y1) in CATEGORY_CROPS.items():
        page = doc[page_no - 1]
        pix = page.get_pixmap(dpi=300, clip=fitz.Rect(x0, y0, x1, y1))
        src = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")

        sizes = []
        for w in WIDTHS:
            if w > src.width:
                continue
            h = round(src.height * w / src.width)
            src.resize((w, h), Image.LANCZOS).save(
                IMG_OUT / f"{slug}-{w}.webp", "WEBP", quality=82, method=6
            )
            sizes.append(w)

        # Inline placeholder so cards never flash an empty box on slow mobile data.
        buf = io.BytesIO()
        src.resize((20, max(1, round(20 * src.height / src.width)))).filter(
            ImageFilter.GaussianBlur(0.6)
        ).save(buf, "WEBP", quality=40)
        import base64

        manifest[slug] = {
            "widths": sizes,
            "aspectRatio": round(src.width / src.height, 4),
            "placeholder": "data:image/webp;base64,"
            + base64.b64encode(buf.getvalue()).decode(),
        }
        print(f"  {slug}: {src.width}x{src.height} -> {sizes}")

    doc.close()
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    (DATA_OUT / "images.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"  {(DATA_OUT / 'images.json').relative_to(ROOT)}")


def extract_og_image() -> None:
    """Open Graph card, cut from the menu cover so sharing looks on-brand."""
    doc = fitz.open(MENU_PDF)
    pix = doc[0].get_pixmap(dpi=300, clip=fitz.Rect(0, 90, 567, 388))
    img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    img = img.resize((1200, 630), Image.LANCZOS)
    img.save(ROOT / "public" / "og-image.jpg", "JPEG", quality=88, optimize=True)
    doc.close()
    print("  public/og-image.jpg  1200x630")


if __name__ == "__main__":
    if not LOGO_PDF.exists() or not MENU_PDF.exists():
        raise SystemExit(f"Source PDFs not found in {REFS}")
    if BRAND_OUT.exists():
        shutil.rmtree(BRAND_OUT)
    extract_logo()
    extract_category_images()
    extract_og_image()
    print("Done.")
