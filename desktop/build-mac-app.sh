#!/bin/zsh
set -euo pipefail

PROJECT_DIR="/Users/johanneumeier/yuno-2"
APP_NAME="Yuno 2.0"
APP_BUNDLE="$HOME/Applications/${APP_NAME}.app"
ICONSET_DIR="/tmp/yuno2.iconset"

mkdir -p "$HOME/Applications"
rm -rf "$APP_BUNDLE" "$ICONSET_DIR"
mkdir -p "$APP_BUNDLE/Contents/MacOS" "$APP_BUNDLE/Contents/Resources" "$ICONSET_DIR"

# 1. Generate high-resolution AppIcon.icns directly via Swift CoreGraphics (zero external deps)
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
let cg = ctx.cgContext

// Rounded obsidian squircle background
let rect = CGRect(x: 44, y: 44, width: size - 88, height: size - 88)
let bgPath = NSBezierPath(roundedRect: rect, xRadius: 210, yRadius: 210)
NSColor(red: 11/255, green: 15/255, blue: 25/255, alpha: 1).setFill()
bgPath.fill()

// Subtle top-left indigo glow
let colors = [
    NSColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 0.32).cgColor,
    NSColor(red: 11/255, green: 15/255, blue: 25/255, alpha: 0.0).cgColor
] as CFArray
if let grad = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 1]) {
    cg.saveGState()
    bgPath.addClip()
    cg.drawRadialGradient(grad, startCenter: CGPoint(x: 340, y: 740), startRadius: 20, endCenter: CGPoint(x: 512, y: 512), endRadius: 560, options: [])
    cg.restoreGState()
}

// Fine 1px editorial border
NSColor(white: 1.0, alpha: 0.16).setStroke()
bgPath.lineWidth = 8
bgPath.stroke()

// Outer dashed orbit ring
let outerRing = NSBezierPath(ovalIn: CGRect(x: 202, y: 202, width: 620, height: 620))
NSColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 0.65).setStroke()
outerRing.lineWidth = 18
outerRing.setLineDash([28, 18], count: 2, phase: 0)
outerRing.stroke()

// Inner cyan atlas ring
let innerRing = NSBezierPath(ovalIn: CGRect(x: 296, y: 296, width: 432, height: 432))
NSColor(red: 56/255, green: 189/255, blue: 248/255, alpha: 0.85).setStroke()
innerRing.lineWidth = 12
innerRing.stroke()

// Crosshair axes
let axes = NSBezierPath()
axes.move(to: CGPoint(x: 512, y: 196))
axes.line(to: CGPoint(x: 512, y: 828))
axes.move(to: CGPoint(x: 196, y: 512))
axes.line(to: CGPoint(x: 828, y: 512))
NSColor(white: 1.0, alpha: 0.16).setStroke()
axes.lineWidth = 8
axes.stroke()

// Golden compass diamond needle
let diamond = NSBezierPath()
diamond.move(to: CGPoint(x: 512, y: 742))
diamond.line(to: CGPoint(x: 590, y: 512))
diamond.line(to: CGPoint(x: 512, y: 282))
diamond.line(to: CGPoint(x: 434, y: 512))
diamond.close()
NSColor(red: 245/255, green: 158/255, blue: 11/255, alpha: 0.96).setFill()
diamond.fill()

// Center pivot
let centerDot = NSBezierPath(ovalIn: CGRect(x: 470, y: 470, width: 84, height: 84))
NSColor(red: 11/255, green: 15/255, blue: 25/255, alpha: 1).setFill()
centerDot.fill()
NSColor(white: 0.98, alpha: 1).setStroke()
centerDot.lineWidth = 12
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

# 2. Write Info.plist
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
    <string>2.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# 3. Compile native Swift WKWebView desktop app
swiftc -O \
  -framework Cocoa \
  -framework WebKit \
  "$PROJECT_DIR/desktop/YunoMacApp.swift" \
  -o "$APP_BUNDLE/Contents/MacOS/Yuno2"

chmod +x "$APP_BUNDLE/Contents/MacOS/Yuno2"
rm -rf "$ICONSET_DIR" /tmp/gen_yuno_icon.swift /tmp/yuno2_1024.png

echo "Built native macOS app at: $APP_BUNDLE"
