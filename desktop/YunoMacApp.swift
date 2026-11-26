import Cocoa
import WebKit

final class YunoAppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKNavigationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private let webURL = URL(string: "https://johankapteina.github.io/yuno-2/")!

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.preferences.setValue(true, forKey: "fullScreenEnabled")
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.setValue(false, forKey: "drawsBackground")

        let bgColor = NSColor(red: 11.0 / 255.0, green: 15.0 / 255.0, blue: 25.0 / 255.0, alpha: 1.0)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1320, height: 860),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Yuno 2.0 — Visueller Wissensatlas"
        window.appearance = NSAppearance(named: .darkAqua)
        window.backgroundColor = bgColor
        window.titlebarAppearsTransparent = false
        window.minSize = NSSize(width: 900, height: 620)
        window.center()
        window.setFrameAutosaveName("Yuno2MainWindow")
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        NSApp.activate(ignoringOtherApps: true)
        loadApp()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    @objc private func reloadPage() {
        webView.reload()
    }

    @objc private func openInBrowser() {
        NSWorkspace.shared.open(webURL)
    }

    private func loadApp() {
        let request = URLRequest(url: webURL, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 20)
        webView.load(request)
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()

        // App Menu
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Yuno 2.0 im Browser öffnen", action: #selector(openInBrowser), keyEquivalent: "o")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Yuno 2.0 ausblenden", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Yuno 2.0 beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu

        // Edit Menu (enables Copy/Paste inside web inputs)
        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Bearbeiten")
        editMenu.addItem(withTitle: "Ausschneiden", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Kopieren", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Einsetzen", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Alles auswählen", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu

        // View Menu
        let viewMenuItem = NSMenuItem()
        mainMenu.addItem(viewMenuItem)
        let viewMenu = NSMenu(title: "Ansicht")
        viewMenu.addItem(withTitle: "Neu laden", action: #selector(reloadPage), keyEquivalent: "r")
        viewMenu.addItem(withTitle: "Vollbild ein/aus", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        viewMenuItem.submenu = viewMenu

        // Window Menu
        let windowMenuItem = NSMenuItem()
        mainMenu.addItem(windowMenuItem)
        let windowMenu = NSMenu(title: "Fenster")
        windowMenu.addItem(withTitle: "Minimieren", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Schließen", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        windowMenuItem.submenu = windowMenu

        NSApp.mainMenu = mainMenu
    }

    // Open target="_blank" external links (Wikimedia, YouTube) in default macOS browser
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            NSWorkspace.shared.open(url)
        }
        return nil
    }

    // Support <input type="file"> for JSON Backup Import inside WKWebView
    func webView(
        _ webView: WKWebView,
        runOpenPanelWith parameters: WKOpenPanelParameters,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping ([URL]?) -> Void
    ) {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = parameters.allowsMultipleSelection
        panel.beginSheetModal(for: window) { response in
            completionHandler(response == .OK ? panel.urls : nil)
        }
    }

    // Friendly offline/retry screen if internet is temporarily unavailable
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let html = """
        <!doctype html>
        <html lang="de"><head><meta charset="utf-8"><style>
        body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0B0F19;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
        .card{max-width:440px;padding:32px;border-radius:20px;background:#131B2E;border:1px solid rgba(255,255,255,0.08);text-align:center;}
        h2{margin:0 0 8px;font-size:20px;} p{color:#94A3B8;font-size:14px;line-height:1.5;}
        button{margin-top:16px;background:#6366F1;color:#fff;border:0;padding:10px 20px;border-radius:10px;font-weight:600;cursor:pointer;}
        </style></head><body><div class="card">
        <h2>Yuno 2.0 konnte nicht geladen werden</h2>
        <p>\(error.localizedDescription)</p>
        <button onclick="location.href='https://johankapteina.github.io/yuno-2/'">Erneut versuchen</button>
        </div></body></html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = YunoAppDelegate()
app.delegate = delegate
app.run()
