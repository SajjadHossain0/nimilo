#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Md. Sajjad Hossain
set -euo pipefail
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec /usr/bin/python3 "$script_dir/mochi.py" install
