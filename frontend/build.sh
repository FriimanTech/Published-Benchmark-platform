#!/bin/bash
set -e

# Remove package-lock.json to force npm install to regenerate it
rm -f package-lock.json

# Install dependencies
npm install --no-package-lock

# Build the Next.js application
npm run build
