"""
Fetch F1 session telemetry via FastF1 and export as JSON for the frontend.

Usage:
    python fetch_session.py --year 2024 --gp monza --session R
    python fetch_session.py --year 2024 --gp monza --session Q

Session types: FP1, FP2, FP3, Q, R
"""

import argparse
import json
from pathlib import Path

import fastf1
import pandas as pd


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CACHE_DIR = Path(__file__).resolve().parent / ".fastf1_cache"


def setup_cache():
    CACHE_DIR.mkdir(exist_ok=True)
    fastf1.Cache.enable_cache(str(CACHE_DIR))


def fetch_lap_data(session):
    """Extract lap times, compounds, and stint info for all drivers."""
    laps = session.laps
    records = []
    for _, lap in laps.iterrows():
        lt = lap["LapTime"]
        records.append({
            "driver": lap["Driver"],
            "lap_number": int(lap["LapNumber"]),
            "lap_time_s": lt.total_seconds() if pd.notna(lt) else None,
            "compound": lap["Compound"],
            "stint": int(lap["Stint"]) if pd.notna(lap["Stint"]) else None,
            "is_personal_best": bool(lap["IsPersonalBest"]),
            "sector1_s": lap["Sector1Time"].total_seconds() if pd.notna(lap.get("Sector1Time")) else None,
            "sector2_s": lap["Sector2Time"].total_seconds() if pd.notna(lap.get("Sector2Time")) else None,
            "sector3_s": lap["Sector3Time"].total_seconds() if pd.notna(lap.get("Sector3Time")) else None,
            "tyre_life": int(lap["TyreLife"]) if pd.notna(lap.get("TyreLife")) else None,
        })
    return records


def fetch_telemetry(session, drivers, lap_type="fastest"):
    """Extract speed/throttle/brake telemetry for selected drivers' fastest laps."""
    telemetry = {}
    for drv in drivers:
        try:
            drv_laps = session.laps.pick_drivers(drv)
            if lap_type == "fastest":
                lap = drv_laps.pick_fastest()
            else:
                lap = drv_laps[drv_laps["LapNumber"] == int(lap_type)].iloc[0]

            tel = lap.get_telemetry()
            telemetry[drv] = {
                "distance": tel["Distance"].tolist(),
                "speed": tel["Speed"].tolist(),
                "throttle": tel["Throttle"].tolist(),
                "brake": tel["Brake"].astype(int).tolist(),
                "gear": tel["nGear"].tolist(),
                "lap_time_s": lap["LapTime"].total_seconds() if pd.notna(lap["LapTime"]) else None,
            }
        except Exception as e:
            print(f"  Skipping {drv}: {e}")
    return telemetry


def fetch_results(session):
    """Extract session results (grid positions, finishing order)."""
    results = session.results
    records = []
    for _, row in results.iterrows():
        records.append({
            "driver": row["Abbreviation"],
            "full_name": row["FullName"],
            "team": row["TeamName"],
            "team_color": f"#{row['TeamColor']}" if pd.notna(row.get("TeamColor")) else None,
            "position": int(row["Position"]) if pd.notna(row.get("Position")) else None,
            "grid_position": int(row["GridPosition"]) if pd.notna(row.get("GridPosition")) else None,
        })
    return records


def build_session_json(year, gp, session_type):
    """Load a session and build the full JSON payload."""
    print(f"Loading {year} {gp} {session_type}...")
    session = fastf1.get_session(year, gp, session_type)
    session.load()

    drivers = list(session.results["Abbreviation"])

    print("  Fetching lap data...")
    laps = fetch_lap_data(session)

    print("  Fetching telemetry for all drivers' fastest laps...")
    telemetry = fetch_telemetry(session, drivers)

    print("  Fetching results...")
    results = fetch_results(session)

    return {
        "year": year,
        "event": session.event["EventName"],
        "session_type": session_type,
        "total_laps": int(session.total_laps) if hasattr(session, "total_laps") and session.total_laps else None,
        "results": results,
        "laps": laps,
        "telemetry": telemetry,
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch F1 session data")
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--gp", type=str, required=True, help="Grand Prix name (e.g. monza, spa, silverstone)")
    parser.add_argument("--session", type=str, default="R", help="Session type: FP1, FP2, FP3, Q, R")
    args = parser.parse_args()

    setup_cache()
    data = build_session_json(args.year, args.gp, args.session)

    gp_slug = args.gp.lower().replace(" ", "-")
    session_map = {"FP1": "fp1", "FP2": "fp2", "FP3": "fp3", "Q": "qualifying", "R": "race"}
    session_slug = session_map.get(args.session, args.session.lower())

    out_dir = DATA_DIR / str(args.year) / gp_slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{session_slug}.json"

    with open(out_file, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved to {out_file}")


if __name__ == "__main__":
    main()
