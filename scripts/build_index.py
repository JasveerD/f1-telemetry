"""
Scan the data/ directory and build data/index.json for the frontend picker.

Output format: { "2024": { "monza": ["race", "qualifying"], ... }, ... }
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def build_index():
    index = {}
    for year_dir in sorted(DATA_DIR.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.isdigit():
            continue
        year = year_dir.name
        index[year] = {}
        for gp_dir in sorted(year_dir.iterdir()):
            if not gp_dir.is_dir():
                continue
            sessions = [f.stem for f in sorted(gp_dir.glob("*.json"))]
            if sessions:
                index[year][gp_dir.name] = sessions
    return index


def main():
    index = build_index()
    out = DATA_DIR / "index.json"
    with open(out, "w") as f:
        json.dump(index, f, indent=2)
    print(f"Index written to {out}")
    for year, gps in index.items():
        for gp, sessions in gps.items():
            print(f"  {year}/{gp}: {', '.join(sessions)}")


if __name__ == "__main__":
    main()
