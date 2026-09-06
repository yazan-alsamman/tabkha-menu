"""Convert generated category heroes into the responsive WebP set the menu ships."""

from __future__ import annotations

import base64
import json
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(r"C:\Users\LENOVO\.cursor\projects\d-TabkhaMenu\assets")
IMG_OUT = ROOT / "public" / "images" / "categories"
DATA_OUT = ROOT / "src" / "data" / "generated"
WIDTHS = (480, 900, 1400)

FILES = {
    "breakfast": "tabkha-breakfast.png",
    "soups": "tabkha-soups.png",
    "salads-east": "tabkha-salads.png",
    "doughs": "tabkha-doughs.png",
    "cold-appetizers": "tabkha-cold-appetizers.png",
    "hot-appetizers": "tabkha-hot-appetizers.png",
    "hot-dishes-eastern": "tabkha-hot-eastern.png",
    "hot-dishes-western": "tabkha-hot-western.png",
    "pizza": "tabkha-pizza.png",
    "pasta": "tabkha-pasta.png",
    "sandwich-eastern": "tabkha-sandwich-eastern.png",
    "sandwich-western": "tabkha-sandwich-western.png",
    "grills": "tabkha-grills.png",
    "daily-dish": "tabkha-daily-dish.png",
}


def main() -> None:
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    for old in IMG_OUT.glob("*.webp"):
        old.unlink()

    manifest: dict[str, dict] = {}
    for slug, name in FILES.items():
        path = SRC / name
        if not path.exists():
            raise SystemExit(f"missing {path}")
        src = Image.open(path).convert("RGB")
        sizes: list[int] = []
        for width in WIDTHS:
            height = max(1, round(src.height * width / src.width))
            src.resize((width, height), Image.LANCZOS).save(
                IMG_OUT / f"{slug}-{width}.webp", "WEBP", quality=84, method=6
            )
            sizes.append(width)
        buf = BytesIO()
        src.resize((24, max(1, round(24 * src.height / src.width)))).filter(
            ImageFilter.GaussianBlur(0.7)
        ).save(buf, "WEBP", quality=42)
        manifest[slug] = {
            "widths": sizes,
            "aspectRatio": round(src.width / src.height, 4),
            "placeholder": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(),
        }
        print(f"  {slug}: {src.width}x{src.height} -> {sizes}")

    DATA_OUT.mkdir(parents=True, exist_ok=True)
    (DATA_OUT / "images.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("wrote images.json")


if __name__ == "__main__":
    main()
