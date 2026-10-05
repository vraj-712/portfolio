#!/usr/bin/env bash
# Vercel install step, wired in via vercel.json "installCommand".
#
# Vercel builds on Amazon Linux 2023, which ships none of the system libraries
# headless Chromium links against. Without them scripts/prerender.mjs can't
# launch a browser and the deploy serves an empty <div id="root"> to crawlers.
# The package list was derived from `ldd chrome-headless-shell` in an
# amazonlinux:2023 container, then verified by a full prerender there.
set -euo pipefail

dnf install -y -q \
  nss nspr atk at-spi2-atk at-spi2-core dbus-libs systemd-libs alsa-lib mesa-libgbm \
  libX11 libxcb libXcomposite libXdamage libXext libXfixes libXrandr libxkbcommon \
  fontconfig dejavu-sans-fonts # without fontconfig, Chromium aborts on the first web font

bun install
npx playwright install --only-shell chromium
