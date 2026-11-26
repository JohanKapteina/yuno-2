#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/johanneumeier/yuno-2"
APP_NAME="Yuno 2.0"
APP_BUNDLE="$HOME/Applications/${APP_NAME}.app"
ICONSET_DIR="/tmp/yuno2.iconset"

mkdir -p "$HOME/Applications"
rm -rf "$APP_BUNDLE" "$ICONSET_DIR"
mkdir -p "$APP_BUNDLE/Contents/MacOS" "$APP_BUNDLE/Contents/Resources" "$ICONSET_DIR"

# 1. Generate clean Apple Light AppIcon.icns directly via Swift CoreGraphics
cat << 'EOF' > /tmp/gen_yuno_icon.swift
import Cocoa

let size = CGFloat(1024)
let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(size),
    pixelsHigh: Int(size),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
let ctx = NSGraphicsContext(bitmapImageRep: rep)!
NSGraphicsContext.current = ctx

// Pure white Apple squircle background
let rect = CGRect(x: 44, y: 44, width: size - 88, height: size - 88)
let bgPath = NSBezierPath(roundedRect: rect, xRadius: 210, yRadius: 210)
NSColor.white.setFill()
bgPath.fill()

// Subtle light border
NSColor(red: 229/255, green: 229/255, blue: 234/255, alpha: 1).setStroke()
bgPath.lineWidth = 10
bgPath.stroke()

// Soft Apple gray dial
let dial = NSBezierPath(ovalIn: CGRect(x: 192, y: 192, width: 640, height: 640))
NSColor(red: 245/255, green: 245/255, blue: 247/255, alpha: 1).setFill()
dial.fill()
NSColor(red: 0/255, green: 113/255, blue: 227/255, alpha: 1).setStroke()
dial.lineWidth = 26
dial.stroke()

// Inner dashed ring
let innerRing = NSBezierPath(ovalIn: CGRect(x: 292, y: 292, width: 440, height: 440))
NSColor(red: 209/255, green: 209/255, blue: 214/255, alpha: 1).setStroke()
innerRing.lineWidth = 12
innerRing.setLineDash([20, 18], count: 2, phase: 0)
innerRing.stroke()

// Bottom half of compass needle (Apple Blue)
let southNeedle = NSBezierPath()
southNeedle.move(to: CGPoint(x: 512, y: 246))
southNeedle.line(to: CGPoint(x: 598, y: 512))
southNeedle.line(to: CGPoint(x: 426, y: 512))
southNeedle.close()
NSColor(red: 0/255, green: 113/255, blue: 227/255, alpha: 1).setFill()
southNeedle.fill()

// Top half of compass needle (Apple Orange)
let northNeedle = NSBezierPath()
northNeedle.move(to: CGPoint(x: 512, y: 778))
northNeedle.line(to: CGPoint(x: 598, y: 512))
northNeedle.line(to: CGPoint(x: 426, y: 512))
northNeedle.close()
NSColor(red: 255/255, green: 107/255, blue: 0/255, alpha: 1).setFill()
northNeedle.fill()

// Center pivot
let centerDot = NSBezierPath(ovalIn: CGRect(x: 468, y: 468, width: 88, height: 88))
NSColor.white.setFill()
centerDot.fill()
NSColor(red: 29/255, green: 29/255, blue: 31/255, alpha: 1).setStroke()
centerDot.lineWidth = 16
centerDot.stroke()

NSGraphicsContext.restoreGraphicsState()

let pngData = rep.representation(using: .png, properties: [:])!
try pngData.write(to: URL(fileURLWithPath: "/tmp/yuno2_1024.png"))
EOF

swift /tmp/gen_yuno_icon.swift

for sz in 16 32 128 256 512; do
  sips -z $sz $sz /tmp/yuno2_1024.png --out "$ICONSET_DIR/icon_${sz}x${sz}.png" >/dev/null
  double=$((sz * 2))
  sips -z $double $double /tmp/yuno2_1024.png --out "$ICONSET_DIR/icon_${sz}x${sz}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET_DIR" -o "$APP_BUNDLE/Contents/Resources/AppIcon.icns"

cat << 'EOF' > "$APP_BUNDLE/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>de</string>
    <key>CFBundleDisplayName</key>
    <string>Yuno 2.0</string>
    <key>CFBundleExecutable</key>
    <string>Yuno2</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.johann.yuno2</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Yuno 2.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.1.0</string>
    <key>CFBundleVersion</key>
    <string>2</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

swiftc -O \
  -framework Cocoa \
  -framework WebKit \
  "$PROJECT_DIR/desktop/YunoMacApp.swift" \
  -o "$APP_BUNDLE/Contents/MacOS/Yuno2"

chmod +x "$APP_BUNDLE/Contents/MacOS/Yuno2"
rm -rf "$ICONSET_DIR" /tmp/gen_yuno_icon.swift /tmp/yuno2_1024.png

echo "Built clean Apple Light macOS app at: $APP_BUNDLE"
