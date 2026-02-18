# exercisegif folder

This folder is where local exercise demo assets should be stored.

## Why "Binary files are not supported" appears
Git hosting UIs often cannot render textual diffs for binary media files (GIF/PNG/MP4), so PRs show:

> Binary files are not supported

That message is expected when binary assets are committed.

## Current setup
To keep PR diffs readable, this repo uses SVG placeholder demo files (`*.svg`) which are text-based and diff-friendly.
You can replace any placeholder SVG with real media files for production.
