#!/bin/bash
# Fix ad-hoc code signing for Hermes Desktop builds on macOS 15+ (Sequoia)
#
# macOS 15.7 enforces Team ID matching across all loaded libraries.
# The Electron Framework binary has a code signature from Electron's build
# with a different Team ID than ad-hoc signed components.
#
# Fix: remove ALL existing signatures first, then sign uniformly with ad-hoc.
#
# Usage after installing a new .dmg build:
#   bash fix-codesign.sh

APP="/Applications/Hermes Agent.app"

if [ ! -d "$APP" ]; then
  echo "❌ Hermes Agent.app not found at $APP"
  echo "   Install the .dmg first, then run this script."
  exit 1
fi

echo "🔧 Step 1/4 — Removing ElectronAsarIntegrity (Electron 39+ hash check)..."
plutil -remove ElectronAsarIntegrity "$APP/Contents/Info.plist" 2>/dev/null && echo "  ✅ Done"

echo ""
echo "🔧 Step 2/4 — Removing existing code signatures from all binaries..."
# Framework binaries
codesign --remove-signature "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework" 2>/dev/null
for fw in ReactiveObjC Squirrel Mantle; do
  codesign --remove-signature "$APP/Contents/Frameworks/${fw}.framework/Versions/A/${fw}" 2>/dev/null
done
# dylibs
find "$APP" -name "*.dylib" -type f -exec codesign --remove-signature {} \; 2>/dev/null
# Helper app binaries
find "$APP" -path "*/MacOS/*" -type f -exec codesign --remove-signature {} \; 2>/dev/null
echo "  ✅ All signatures stripped"

echo ""
echo "🔑 Step 3/4 — Re-signing all components (inside-out)..."
cd "$APP/Contents"

# Frameworks
find . -name "*.framework" -type d | while read fw; do
  codesign --force --sign - "$fw" 2>/dev/null && echo "  ✅ Framework: $(basename "$fw")"
done

# dylibs (silent)
find . -name "*.dylib" -type f -exec codesign --force --sign - {} \; 2>/dev/null

# Helper .app bundles
find . -name "*.app" -type d -maxdepth 1 | while read app; do
  codesign --force --sign - "$app" 2>/dev/null && echo "  ✅ Helper: $(basename "$app")"
done

# Main binary
codesign --force --sign - "$APP/Contents/MacOS/Hermes Agent" 2>/dev/null
echo "  ✅ Main binary"

# Whole bundle
codesign --force --sign - "$APP" 2>/dev/null
echo "  ✅ App bundle"

echo ""
echo "✅ Step 4/4 — Done. Hermes Agent is ready to launch."
echo "   Run: open \"$APP\""
