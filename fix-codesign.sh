#!/bin/bash
# Fix code signing for ad-hoc Hermes Desktop builds on macOS 15+
# Run this after installing a new .dmg build:
#   bash fix-codesign.sh

APP="/Applications/Hermes Agent.app"

if [ ! -d "$APP" ]; then
  echo "❌ Hermes Agent.app not found at $APP"
  echo "   Install the .dmg first, then run this script."
  exit 1
fi

echo "🔑 Re-signing all frameworks, libraries, and helpers..."

cd "$APP/Contents"

# Sign all frameworks
find . -name "*.framework" -type d | while read fw; do
  codesign --force --sign - "$fw" 2>/dev/null
  echo "  ✅ $(basename "$fw")"
done

# Sign all dylibs
find . -name "*.dylib" -type f | while read lib; do
  codesign --force --sign - "$lib" 2>/dev/null
  echo "  ✅ $(basename "$lib")"
done

# Sign all helper apps
find . -name "*.app" -type d -maxdepth 1 | while read app; do
  codesign --force --sign - "$app" 2>/dev/null
  echo "  ✅ $(basename "$app")"
done

# Sign helper executables
find . -path "*/MacOS/Helper*" -type f 2>/dev/null | while read helper; do
  codesign --force --sign - "$helper" 2>/dev/null
done

# Sign main binary
codesign --force --sign - "$APP/Contents/MacOS/Hermes Agent" 2>/dev/null
echo "  ✅ Hermes Agent binary"

# Sign the whole bundle
codesign --force --sign - "$APP" 2>/dev/null
echo "  ✅ App bundle"

echo ""
echo "✅ Done. Hermes Agent is ready to launch."
echo "   Run: open \"$APP\""
