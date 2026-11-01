# F1 Telemetry Dashboard

Interactive F1 telemetry visualization — lap times, speed traces, throttle/brake/gear overlays, and tire strategy timelines built from real session data via [FastF1](https://github.com/theOehrly/Fast-F1).

Live at [jasveerd.github.io/f1-telemetry](https://jasveerd.github.io/f1-telemetry)

## Setup

```bash
cd scripts
pip install -r requirements.txt
```

## Add a session

```bash
python scripts/fetch_session.py --year 2024 --gp monza --session R
python scripts/build_index.py
```

Session types: `FP1`, `FP2`, `FP3`, `Q`, `R`

## Run locally

```bash
cd src
python -m http.server 8000
```

Then open `http://localhost:8000`.
