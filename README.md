# Mochi Screensaver

An offline, eyes-only screensaver for **Ubuntu 24.04 and GNOME Shell 46**.

Mochi appears after a configurable period without keyboard or mouse input. Move the mouse, press a key, click, or touch the screen to return to your work. The display stays black except for a pair of animated eyes.

![Normal white Mochi eyes on a black background](docs/preview.svg)

Created by **Md. Sajjad Hossain** as a desktop companion to an ESP32 robot project. Licensed under the [MIT License](LICENSE).

[বাংলা নির্দেশনা](README_BN.md) · [Configuration](#configuration) · [Troubleshooting](#troubleshooting) · [Contributing](CONTRIBUTING.md)

## Features

- System-wide inactivity detection through Mutter, including when other applications have focus.
- Seven expressions: normal, happy, angry, surprised, sleepy, blinking, and looking around.
- Four eye colors and adjustable eye brightness.
- A five-minute default idle timeout, configurable from 10 seconds to 24 hours.
- One pair of eyes per connected monitor.
- Settings that persist across restarts and logins for the same user account.
- Procedural animation with a 128 × 64 logical coordinate system and subtle position drift.
- Animation runs at approximately 30 FPS while the screen is visible.
- No browser, account, API key, internet connection, or separate background Python daemon is required to use it.

## Compatibility

| Component | Requirement |
| --- | --- |
| Desktop | GNOME Shell **46** |
| Target distribution | Ubuntu **24.04 LTS** |
| Display session | GNOME Wayland or GNOME Xorg |
| Installer | Python 3.12 and Bash, as supplied by Ubuntu 24.04 |
| Desktop tools | `gnome-shell`, `gnome-extensions`, `gsettings`, `glib-compile-schemas` |

The installer checks the GNOME Shell version and stops on other versions. This release does not declare support for GNOME 47+, KDE, Xfce, Windows, or macOS.

Check your desktop version:

```bash
gnome-shell --version
```

This is a screensaver overlay. Your computer remains awake while it is displayed; animation cannot run during actual suspend. Ubuntu's lock screen remains in control when the session locks.

## Installation

1. Download this repository as a ZIP from **Code → Download ZIP**, then extract it. You can also use a Git clone of the repository.
2. Open a terminal in the project root: the directory containing `install.sh`, `mochi.py`, and `extension/`.
3. Install for your current user:

   ```bash
   bash install.sh
   ```

4. Save your work, **log out, and log back in once**. GNOME must load the extension code in a fresh session. Locking and unlocking the screen does not do this.
5. Confirm that GNOME reports **Version: 2**, **Enabled: Yes**, and **State: ACTIVE**:

   ```bash
   gnome-extensions info mochi-screensaver@sajjad.local
   ```

The installer does not require `sudo`. It creates a user extension and a command launcher. It preserves your saved Mochi settings when reinstalling and preserves the enabled entries for other extensions.

If the display blanks before Mochi can appear, review **Settings → Power → Blank Screen** and use a setting appropriate for your desired display behavior. The installer does not change display power, suspend, or lock-screen settings.

### Quick test

```bash
~/.local/bin/mochi time 10
```

Leave the mouse and keyboard untouched for 15 seconds. Check that the eyes appear, then move the mouse to confirm that your desktop returns. Restore the five-minute timeout afterwards:

```bash
~/.local/bin/mochi time 300
```

An `ACTIVE` extension state confirms that GNOME enabled the extension; it does not replace this visual and input test.

## Configuration

Run these commands from any directory after installation. Each command saves its value for your user account. Configuration changes do **not** require reinstalling or logging out.

### Idle timeout

Values are whole seconds, from **10** to **86400**.

| Timeout | Command |
| --- | --- |
| 10 seconds, for testing | `~/.local/bin/mochi time 10` |
| 1 minute | `~/.local/bin/mochi time 60` |
| 2 minutes | `~/.local/bin/mochi time 120` |
| 5 minutes | `~/.local/bin/mochi time 300` |
| 10 minutes | `~/.local/bin/mochi time 600` |

### Eye color

| Color | Command |
| --- | --- |
| White | `~/.local/bin/mochi color white` |
| Mint | `~/.local/bin/mochi color mint` |
| Ice blue | `~/.local/bin/mochi color ice` |
| Amber | `~/.local/bin/mochi color amber` |

For persistent white eyes, run `~/.local/bin/mochi color white` once. The choice remains saved across logins and restarts until you select another color or reset the settings.

### Expressions

| Expression | Command |
| --- | --- |
| Normal | `~/.local/bin/mochi emotion normal` |
| Happy | `~/.local/bin/mochi emotion happy` |
| Angry | `~/.local/bin/mochi emotion angry` |
| Surprised | `~/.local/bin/mochi emotion surprised` |
| Sleepy | `~/.local/bin/mochi emotion sleepy` |
| Blinking | `~/.local/bin/mochi emotion blinking` |
| Looking around | `~/.local/bin/mochi emotion looking-around` |

`sleepy` changes the expression; it does not suspend the laptop.

### Brightness

Set a whole number from **10** to **100**:

```bash
~/.local/bin/mochi brightness 85
```

This controls the rendered eyes rather than the display's hardware brightness.

### Enable, disable, and inspect

| Action | Command |
| --- | --- |
| Disable Mochi | `~/.local/bin/mochi disable` |
| Enable Mochi again | `~/.local/bin/mochi enable` |
| Show settings and extension information | `~/.local/bin/mochi status` |

### Restore defaults

There is no separate `mochi reset` command in this release. Restore the four default values with:

```bash
~/.local/bin/mochi time 300
~/.local/bin/mochi color mint
~/.local/bin/mochi emotion normal
~/.local/bin/mochi brightness 85
```

## Updating

Update your clone, or extract a newer source archive, then run `bash install.sh` from its project root. Save your work and log out and back in to load the updated JavaScript. Your existing Mochi configuration stays saved for the same user account.

Editing a source checkout alone does not update the installed extension copy.

## Troubleshooting

### The extension is active but no eyes appear

1. Confirm the running version is **2** with `gnome-extensions info mochi-screensaver@sajjad.local`.
2. Use the ten-second test above without touching the keyboard or mouse.
3. Check whether the lock screen, a system modal dialog, or display power settings are taking precedence.
4. Inspect the GNOME Shell logs:

   ```bash
   journalctl -b --no-pager _COMM=gnome-shell | grep -i mochi | tail -n 40
   ```

Version 2 logs use the `Mochi Screensaver v2` prefix. Version 1 used a newer cursor API that is unavailable on GNOME 46; version 2 uses the compatible API and keeps the eyes visible if cursor hiding fails.

### The extension is missing after installation

Log out and back in to let GNOME discover it. If GNOME's global user-extension switch is disabled, enable user extensions in the Extensions application.

### The launcher is missing

Use the full path `~/.local/bin/mochi`, not just `mochi`. If that file does not exist, run `bash install.sh` from an extracted source directory.

### An argument is rejected

Use one of the documented expression or color names. Time must be an integer between 10 and 86400 seconds; brightness must be an integer between 10 and 100.

## Project structure

| Path | Purpose |
| --- | --- |
| `extension/extension.js` | GNOME idle monitoring, overlay, input handling, and cleanup |
| `extension/eyes.js` | Eye geometry and Cairo painting |
| `extension/metadata.json` | Extension identity and supported Shell version |
| `extension/schemas/` | GSettings schema and defaults |
| `mochi.py` | Per-user installer and configuration CLI |
| `install.sh` | Installer entry point |
| `tests/extension.test.mjs` | Geometry and mocked Shell lifecycle regression checks |
| `docs/PUBLISH_BN.md` | Maintainer's first GitHub publication steps |

Installed locations:

- Launcher: `~/.local/bin/mochi`
- Extension by default: `~/.local/share/gnome-shell/extensions/mochi-screensaver@sajjad.local/` (uses `XDG_DATA_HOME` when configured)
- GSettings schema: `org.gnome.shell.extensions.mochi-screensaver`

The native extension is independent of any hosted Mochi website. This repository does not contain ESP32 firmware, an OLED driver, or a hardware connection.

## Development and validation

Runtime use does not require Node.js. For development, use Node.js 18+ to run the included mock-based tests:

```bash
bash -n install.sh
python3 -c "import ast, pathlib; ast.parse(pathlib.Path('mochi.py').read_text())"
node --check extension/extension.js
node --check extension/eyes.js
node --experimental-vm-modules tests/extension.test.mjs
```

`npm test` runs the same mock-based checks without installing any npm dependencies. The package manifest is private to prevent accidental npm publication; this does not affect the GitHub repository's visibility or the MIT License.

The tests cover animation bounds for all seven expressions, the GNOME 46 cursor API path, idle activation, dismissal, modal-grab failures, cursor failures, and cleanup. They simulate GNOME interfaces; they do not run a real GNOME Shell session. Perform the quick test on a supported desktop when validating a release.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the manual checks to run before submitting a change.

## Author and license

**Md. Sajjad Hossain**

Copyright © 2026 Md. Sajjad Hossain. Project source and documentation are available under the [MIT License](LICENSE). You may use, modify, and redistribute the software, including commercially, while retaining the required copyright and permission notices. System dependencies retain their own licenses.
