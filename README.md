# StrongTrack AI

StrongTrack AI is a modern AI-powered fitness web app that behaves like a personal trainer.

## What was updated
- UI rebuilt with **Tailwind CSS** (no custom stylesheet required for core layout).
- AI chat section removed and replaced with **Daily Motivation Quotes**.
- Added `exercisegif/` folder for local exercise demos.
- To avoid noisy PR diffs saying **"Binary files are not supported"**, the repo now uses text-based SVG placeholders in `exercisegif/*.svg`.
- Weekly planner, live workout mode, pose-based feedback, diet planner, protein tracking, progress charting, print and PDF export retained.

## Why "Binary files are not supported" appears
That message is shown by Git hosting UIs whenever a commit includes binary assets (like GIFs), because they cannot be line-diffed like code files.

## Run locally
```bash
python3 -m http.server 4173
```
Then open `http://localhost:4173`.
