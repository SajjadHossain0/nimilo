# Changelog

## 2.0.0 — Open source source package

- Package the existing native extension version 2 for public source distribution.
- Add English and Bengali documentation, MIT licensing, contributing instructions, and a preview.
- Make geometry and mocked lifecycle tests independent of the original build workspace.

The GNOME extension's integer metadata version remains `2`.

## Extension version 2

- Use the GNOME 46-compatible `Meta.CursorTracker.get_for_display()` path when the newer backend method is unavailable.
- Keep the eyes visible if cursor hiding fails.
- Restore desktop input, remove timers/watchers, and destroy the overlay on dismissal.
- Include version-prefixed activation and error messages in the journal.

## Extension version 1

- Introduce the native eyes-only screensaver with idle activation, seven expressions, color and brightness settings, and per-user installation.
