"""Extract oracle bone images for our curated character set from the HUST-OBC dataset.

The full HUST-OBC dataset (~140k images) is far larger than we need. This script
copies just one representative oracle bone image per curated character into
`public/obc/`, using the filenames referenced in `src/data/characters.js`.

USAGE
-----
1. Download HUST-OBC.zip (see README) and extract it so you have a folder like:
       <dataroot>/HUST-OBC/deciphered/
   containing per-ID image folders plus `ID_to_chinese.json` and
   `chinese_to_ID.json`.
2. Run:
       python scripts/extract_obc.py --dataroot "C:/path/to/HUST-OBC"
3. Extracted images land in `public/obc/` and the app will render them.

Notes
-----
- We map a modern character -> ID via `chinese_to_ID.json`, then pick the first
  image in that ID's folder as the representative form. You can re-run with
  --index N to choose a different sample if the first is unclear.
- Attribution: HUST-OBC (Wang et al., 2024), CC BY 4.0. Keep the citation in the
  app footer / README.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

# The (char, output-filename) pairs must match `obcImage` fields in
# src/data/characters.js.
CURATED = [
    ("日", "ri.png"),
    ("月", "yue.png"),
    ("山", "shan.png"),
    ("水", "shui.png"),
    ("木", "mu.png"),
    ("火", "huo.png"),
    ("人", "ren.png"),
    ("目", "mu_eye.png"),
    ("口", "kou.png"),
    ("手", "shou.png"),
    ("雨", "yu.png"),
    ("明", "ming.png"),
]

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".bmp"}


def load_mapping(deciphered: Path) -> dict:
    """Return a {chinese_char: [ID, ...]} mapping from the dataset JSON."""
    candidates = [
        deciphered / "chinese_to_ID.json",
        deciphered / "Chinese_to_ID.json",
    ]
    for c in candidates:
        if c.exists():
            with open(c, encoding="utf-8") as f:
                raw = json.load(f)
            # Normalise values to lists of string IDs.
            norm = {}
            for k, v in raw.items():
                if isinstance(v, list):
                    norm[k] = [str(x) for x in v]
                else:
                    norm[k] = [str(v)]
            return norm
    raise FileNotFoundError(
        f"Could not find chinese_to_ID.json in {deciphered}. "
        "Check your --dataroot points at the extracted HUST-OBC folder."
    )


def first_image(folder: Path, index: int = 0) -> Path | None:
    imgs = sorted(p for p in folder.iterdir() if p.suffix.lower() in IMAGE_EXTS)
    if not imgs:
        return None
    return imgs[min(index, len(imgs) - 1)]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dataroot",
        required=True,
        help="Path to the extracted HUST-OBC folder (containing 'deciphered').",
    )
    parser.add_argument(
        "--index",
        type=int,
        default=0,
        help="Which sample image to take per character (default: first).",
    )
    args = parser.parse_args()

    dataroot = Path(args.dataroot)
    deciphered = dataroot / "deciphered"
    if not deciphered.exists():
        # Allow pointing directly at the deciphered folder too.
        if (dataroot / "chinese_to_ID.json").exists():
            deciphered = dataroot
        else:
            print(f"ERROR: {deciphered} not found.", file=sys.stderr)
            return 1

    out_dir = Path(__file__).resolve().parent.parent / "public" / "obc"
    out_dir.mkdir(parents=True, exist_ok=True)

    mapping = load_mapping(deciphered)

    ok, missing = [], []
    for char, out_name in CURATED:
        ids = mapping.get(char)
        if not ids:
            missing.append((char, "no ID in dataset"))
            continue
        # Try each ID until we find a folder with an image.
        chosen = None
        for _id in ids:
            folder = deciphered / str(_id)
            if folder.is_dir():
                img = first_image(folder, args.index)
                if img:
                    chosen = img
                    break
        if not chosen:
            missing.append((char, f"no image found for IDs {ids}"))
            continue
        dest = out_dir / out_name
        shutil.copyfile(chosen, dest)
        ok.append((char, dest.name))

    print(f"\nExtracted {len(ok)} images to {out_dir}:")
    for char, name in ok:
        print(f"  {char} -> {name}")
    if missing:
        print(f"\n{len(missing)} not found:")
        for char, why in missing:
            print(f"  {char}: {why}")
        print(
            "\nTip: some characters may be stored under a variant form. "
            "Check ID_to_chinese.json and adjust CURATED if needed."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
