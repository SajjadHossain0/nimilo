# Contributing

Bug reports, documentation improvements, and focused pull requests are welcome.

## Report a bug

Open an issue in this repository and include:

- Ubuntu/distribution version and the output of `gnome-shell --version`.
- Whether the session uses Wayland or Xorg.
- The installed extension version and `~/.local/bin/mochi status` output.
- Steps to reproduce, expected behavior, and what happened.
- Relevant lines from the GNOME Shell journal, after checking them for personal information.

## Develop a change

1. Fork the repository and create a branch for one focused change.
2. Keep the default view limited to eyes on black.
3. Preserve timer, watcher, signal, cursor, and modal-grab cleanup.
4. Run the checks documented in the README.
5. Install the changed source and load it in a fresh GNOME 46 session before reporting desktop validation.

## Manual desktop checks

- A ten-second idle timeout shows the eyes after input stops.
- Movement, keypress, click, and touch dismiss the overlay.
- The seven expressions, colors, brightness, and timeout settings work.
- Settings persist after logout/login.
- Disabling while visible restores desktop input and the cursor.
- Session locking and monitor changes remove the overlay cleanly.
- Cursor failure does not leave the desktop input grabbed or dismiss the eyes unnecessarily.

State which checks you performed in the pull request. Mocked tests do not establish native desktop compatibility. Do not expand `shell-version` metadata without validating the corresponding GNOME APIs and desktop behavior.

## License

By submitting a contribution, you agree to make it available under this project's MIT License. Preserve existing notices and add any required attribution for material you contribute.
