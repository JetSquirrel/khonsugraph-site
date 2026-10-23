#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
npm --prefix docs ci
npm run build
