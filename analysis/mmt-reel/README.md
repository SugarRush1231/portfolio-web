# MMT vertical portfolio film

- Final: `out/mmt-portfolio.mp4`, 1080×1920, 24 seconds, 30 fps, H.264 + AAC.
- Silent: `out/mmt-portfolio-silent.mp4`.
- `watch.html`: native video player, starts at 50% playback volume.
- `index.html`: editable frame preview with play/pause, seeking and volume. Serve the portfolio root over localhost so its original UI assets are available.
- `BRIEF.md`: shot plan and factual boundaries.
- `references/SOURCES.md`: what was reviewed from the eight user-provided repositories.
- `CREDITS.md`: font/music/sound sources and the music credit for an upload description.

The UI is the existing source-derived web replica. This is a product interface presentation; no timed performance, completed download, or translation result is presented as an actual recorded processing run. Example subtitle text is labelled in the film.

## Local preview

Run `python analysis/mmt-reel/serve.py` from the portfolio root, then open `http://127.0.0.1:8879/index.html#project-mmt`. The installed aiohttp server supports byte ranges for video seeking; Python's basic `http.server` does not.

## Rebuild

From the portfolio root, with the installed Playwright and Edge runtime:

1. `node analysis/mmt-reel/render.cjs probe` for stills and deterministic seek checks.
2. `python analysis/mmt-reel/audio.py` for the mixed WAV and bass envelope.
3. `node analysis/mmt-reel/render.cjs full` for the silent master (two temporal samples per 30 fps frame).
4. Mux the silent MP4 and `out/audio.wav` with ffmpeg, copying video and encoding audio to AAC. Keep the full 24-second timeline.

Run `python analysis/mmt-reel/verify.py` after final mux. Keyframe images and the QA report stay in `out/`.
