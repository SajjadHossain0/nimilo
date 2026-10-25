#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Md. Sajjad Hossain
"""Per-user Mochi installer and settings. Standard library only; no root access."""
import argparse
import ast
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

UUID = 'mochi-screensaver@sajjad.local'
SCHEMA = 'org.gnome.shell.extensions.mochi-screensaver'
DATA = Path(os.environ.get('XDG_DATA_HOME', Path.home() / '.local/share'))
TARGET = DATA / 'gnome-shell/extensions' / UUID
EMOTIONS = ['normal', 'happy', 'angry', 'surprised', 'sleepy', 'blinking', 'looking-around']
COLORS = ['mint', 'ice', 'white', 'amber']


def run(*arguments, check=True):
    return subprocess.run(arguments, check=check, text=True, capture_output=True)


def require_tools():
    missing = [name for name in ['gnome-shell', 'gnome-extensions', 'gsettings', 'glib-compile-schemas'] if not shutil.which(name)]
    if missing:
        raise RuntimeError('Run this inside your Ubuntu GNOME desktop session. Missing: ' + ', '.join(missing))


def shell_enabled(enable):
    raw = run('gsettings', 'get', 'org.gnome.shell', 'enabled-extensions').stdout.strip()
    enabled = ast.literal_eval(raw.removeprefix('@as '))
    if not isinstance(enabled, list) or not all(isinstance(item, str) for item in enabled):
        raise RuntimeError('Cannot read GNOME enabled extensions; no change made.')
    enabled = [item for item in enabled if item != UUID]
    if enable:
        enabled.append(UUID)
    run('gsettings', 'set', 'org.gnome.shell', 'enabled-extensions', json.dumps(enabled))


def setting(key, value=None):
    arguments = ['gsettings', '--schemadir', str(TARGET / 'schemas')]
    if value is None:
        return run(*arguments, 'get', SCHEMA, key).stdout.strip()
    run(*arguments, 'set', SCHEMA, key, str(value))


def install():
    require_tools()
    version = run('gnome-shell', '--version').stdout
    if not re.search(r'\b46\.', version):
        raise RuntimeError(f'This package targets GNOME 46 (Ubuntu 24.04). Your version: {version.strip()}')
    source = Path(__file__).resolve().parent / 'extension'
    if not (source / 'metadata.json').is_file():
        raise RuntimeError('Extract the entire ZIP before running install.sh.')
    binary = Path.home() / '.local/bin/mochi'
    marker = '# Mochi Screensaver managed launcher'
    if binary.exists() and marker not in binary.read_text():
        raise RuntimeError(f'{binary} already exists and belongs to another app; no change made.')
    # Stop the old instance before replacing files. GJS caches imported modules;
    # the updated code is loaded after logout/login, not by changing the timer.
    run('gnome-extensions', 'disable', UUID, check=False)
    TARGET.mkdir(parents=True, exist_ok=True)
    # These are only Mochi files; existing extension settings remain intact.
    shutil.copytree(source, TARGET, dirs_exist_ok=True)
    run('glib-compile-schemas', '--strict', str(TARGET / 'schemas'))
    shutil.copy2(__file__, TARGET / 'mochi.py')
    binary.parent.mkdir(parents=True, exist_ok=True)
    target_literal = repr(str(TARGET / 'mochi.py'))
    binary.write_text(f'#!/usr/bin/python3\n{marker}\nimport runpy\nrunpy.run_path({target_literal}, run_name="__main__")\n')
    binary.chmod(0o755)
    shell_enabled(True)
    run('gnome-extensions', 'enable', UUID, check=False)
    print('Installed Mochi Screensaver v2. Configured idle time: ' + setting('idle-seconds').removeprefix('uint32 ') + ' seconds.')
    print('Save your work, then log out and log in ONCE to load the UPDATED extension code.')
    print('After login it starts automatically; no browser or internet is needed.')
    print('Change time: ~/.local/bin/mochi time 300')
    print('Change expression: ~/.local/bin/mochi emotion sleepy')
    print('Stop: ~/.local/bin/mochi disable')
    if run('gsettings', 'get', 'org.gnome.shell', 'disable-user-extensions').stdout.strip() == 'true':
        print('GNOME currently has all user extensions disabled. Enable them in the Extensions app.')


def main():
    parser = argparse.ArgumentParser(description='Mochi Screensaver for Ubuntu 24.04 / GNOME 46')
    parser.add_argument('command', choices=['install', 'time', 'emotion', 'color', 'brightness', 'enable', 'disable', 'status'])
    parser.add_argument('value', nargs='?')
    args = parser.parse_args()
    if args.command == 'install':
        install()
        return
    if not (TARGET / 'schemas/gschemas.compiled').is_file():
        raise RuntimeError('Mochi is not installed. Extract the ZIP and run bash install.sh first.')
    if args.command in ['enable', 'disable']:
        shell_enabled(args.command == 'enable')
        run('gnome-extensions', args.command, UUID, check=False)
        print('Mochi ' + ('enabled.' if args.command == 'enable' else 'disabled.'))
        return
    if args.command == 'status':
        for key in ['idle-seconds', 'emotion', 'color', 'brightness']:
            print(f'{key}: {setting(key)}')
        print(run('gnome-extensions', 'info', UUID, check=False).stdout.strip())
        return
    if args.value is None:
        parser.error('Provide a value. Example: mochi time 300')
    if args.command in ['time', 'brightness']:
        try:
            value = int(args.value)
        except ValueError:
            parser.error('Use a whole number.')
        minimum, maximum = (10, 86400) if args.command == 'time' else (10, 100)
        if not minimum <= value <= maximum:
            parser.error(f'Value must be between {minimum} and {maximum}.')
        key = 'idle-seconds' if args.command == 'time' else 'brightness'
    else:
        allowed = EMOTIONS if args.command == 'emotion' else COLORS
        if args.value not in allowed:
            parser.error('Choose: ' + ', '.join(allowed))
        key, value = args.command, json.dumps(args.value)
    setting(key, value)
    print(f'{key}: {setting(key)}')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError, ValueError) as error:
        print('Mochi: ' + str(error), file=sys.stderr)
        if isinstance(error, subprocess.CalledProcessError):
            print(error.stderr.strip(), file=sys.stderr)
        sys.exit(1)
