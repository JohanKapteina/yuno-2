import Cocoa
import WebKit

final class YunoAppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKNavigationDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var ytLoginWindow: NSWindow?
    private let webURL = URL(string: "https://johankapteina.github.io/yuno-2/")!
    private let safariUserAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15"

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()

        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.preferences.setValue(true, forKey: "fullScreenEnabled")
        config.allowsAirPlayForMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.customUserAgent = safariUserAgent
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.setValue(false, forKey: "drawsBackground")

        let bgColor = NSColor(red: 245.0 / 255.0, green: 245.0 / 255.0, blue: 247.0 / 255.0, alpha: 1.0)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1320, height: 860),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Yuno 2.0"
        window.appearance = NSAppearance(named: .aqua)
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
        webView.reloadFromOrigin()
    }

    @objc private func openInBrowser() {
        NSWorkspace.shared.open(webURL)
    }

    /// Opens a persistent YouTube login window sharing the same WKWebsiteDataStore
    /// so YouTube Premium works ad-free inside embedded videos permanently.
    @objc private func openYouTubeLogin() {
        if let existing = ytLoginWindow {
            existing.makeKeyAndOrderFront(nil)
            return
        }

        let loginConfig = WKWebViewConfiguration()
        loginConfig.websiteDataStore = .default()
        let loginWebView = WKWebView(frame: .zero, configuration: loginConfig)
        loginWebView.customUserAgent = safariUserAgent

        let loginWin = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 520, height: 680),
            styleMask: [.titled, .closable, .resizable],
            backing: .buffered,
            defer: false
        )
        loginWin.title = "YouTube Premium anmelden (einmalig)"
        loginWin.appearance = NSAppearance(named: .aqua)
        loginWin.center()
        loginWin.contentView = loginWebView
        loginWin.isReleasedWhenClosed = false
        loginWin.makeKeyAndOrderFront(nil)
        ytLoginWindow = loginWin

        let url = URL(string: "https://www.youtube.com")!
        loginWebView.load(URLRequest(url: url))
    }

    private func loadApp() {
        let request = URLRequest(url: webURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 20)
        webView.load(request)
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()

        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "YouTube Premium anmelden…", action: #selector(openYouTubeLogin), keyEquivalent: "y")
        appMenu.addItem(withTitle: "Yuno 2.0 im Browser öffnen", action: #selector(openInBrowser), keyEquivalent: "o")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Yuno 2.0 ausblenden", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Yuno 2.0 beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu

        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Bearbeiten")
        editMenu.addItem(withTitle: "Ausschneiden", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Kopieren", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Einsetzen", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Alles auswählen", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu

        let viewMenuItem = NSMenuItem()
        mainMenu.addItem(viewMenuItem)
        let viewMenu = NSMenu(title: "Ansicht")
        viewMenu.addItem(withTitle: "Neu laden", action: #selector(reloadPage), keyEquivalent: "r")
        viewMenu.addItem(withTitle: "Vollbild ein/aus", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        viewMenuItem.submenu = viewMenu

        let windowMenuItem = NSMenuItem()
        mainMenu.addItem(windowMenuItem)
        let windowMenu = NSMenu(title: "Fenster")
        windowMenu.addItem(withTitle: "Minimieren", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Schließen", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        windowMenuItem.submenu = windowMenu

        NSApp.mainMenu = mainMenu
    }

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

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let html = """
        <!doctype html>
        <html lang="de"><head><meta charset="utf-8"><style>
        body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F5F7;color:#1D1D1F;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
        .card{max-width:440px;padding:32px;border-radius:24px;background:#FFFFFF;border:1px solid rgba(0,0,0,0.08);text-align:center;box-shadow:0 12px 32px rgba(0,0,0,0.06);}
        h2{margin:0 0 8px;font-size:20px;font-weight:800;} p{color:#6E6E73;font-size:14px;line-height:1.5;}
        button{margin-top:16px;background:#0071E3;color:#fff;border:0;padding:10px 22px;border-radius:999px;font-weight:700;cursor:pointer;}
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
