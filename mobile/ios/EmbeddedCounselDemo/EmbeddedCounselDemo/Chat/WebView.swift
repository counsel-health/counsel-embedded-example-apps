//
//  WebView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI
@preconcurrency import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    @Binding var showLoadingScreen: Bool
    var onClose: () -> Void = {}

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        // Enable JavaScript to open new windows
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true

        // Inject viewport meta tag script to set the viewport to the device width
        let viewportScript = WKUserScript(
            source: """
                if (!document.querySelector('meta[name="viewport"]')) {
                    var meta = document.createElement('meta');
                    meta.setAttribute('name', 'viewport');
                    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-visual');
                    document.head.appendChild(meta);
                }
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(viewportScript)

        // Bridge `window.postMessage({ type: "counsel:..." })` from the Counsel
        // web app to the native `counsel` script-message handler. The web app
        // may also call window.webkit.messageHandlers.counsel.postMessage(...)
        // directly; both paths land in the same coordinator method below.
        let bridgeScript = WKUserScript(
            source: """
                console.log('[counsel-bridge] installed');
                window.addEventListener('message', function(event) {
                    try {
                        var serialized;
                        try { serialized = JSON.stringify(event.data); } catch (e) { serialized = String(event.data); }
                        console.log('[counsel-bridge] received message', event.origin, serialized);
                        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.counselDebug) {
                            window.webkit.messageHandlers.counselDebug.postMessage({ origin: event.origin, data: serialized });
                        }
                    } catch (e) {
                        console.log('[counsel-bridge] debug forward failed', e);
                    }

                    var data = event.data;
                    if (!data || typeof data !== 'object') return;
                    if (typeof data.type !== 'string') return;
                    if (data.type.indexOf('counsel:') !== 0) return;
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.counsel) {
                        window.webkit.messageHandlers.counsel.postMessage(JSON.stringify(data));
                    }
                });
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(bridgeScript)
        userContentController.add(context.coordinator, name: "counsel")
        userContentController.add(context.coordinator, name: "counselDebug")

        configuration.userContentController = userContentController

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.bounces = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(showLoadingScreen: $showLoadingScreen, onClose: onClose)
    }

    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        @Binding var showLoadingScreen: Bool
        let onClose: () -> Void

        init(showLoadingScreen: Binding<Bool>, onClose: @escaping () -> Void) {
            _showLoadingScreen = showLoadingScreen
            self.onClose = onClose
        }

        // Handle counsel:* events forwarded from the embedded Counsel web app.
        // The Counsel web app posts a JSON-encoded string; we parse it here.
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "counselDebug" {
                print("[counsel-bridge] saw message: \(message.body)")
                return
            }

            guard message.name == "counsel",
                  let json = message.body as? String,
                  let data = json.data(using: .utf8),
                  let body = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let type = body["type"] as? String else {
                print("[counsel] unrecognized message body: \(message.body)")
                return
            }

            print("[counsel] event: \(type) body=\(body)")
            switch type {
            case "counsel:ready":
                showLoadingScreen = false
            case "counsel:close":
                onClose()
            default:
                print("[counsel] unhandled event: \(type)")
            }
        }

        // Fallback: if counsel:ready never fires (e.g. the web app hasn't shipped
        // that event yet), still hide the loading screen once the document loads.
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("[counsel] WKWebView didFinish navigation — hiding loading screen as fallback")
            showLoadingScreen = false
        }

        private func openInExternalBrowser(_ url: URL) {
            print("Opening URL in external browser: \(url)")

            UIApplication.shared.open(url, options: [:]) { success in
                print("External browser open success: \(success)")
            }
        }

        // Handle target="_blank" links
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            print("decidePolicyFor called with URL: \(navigationAction.request.url)")
            print("Current webView URL: \(webView.url?.absoluteString ?? "none")")
            if navigationAction.targetFrame == nil {
                if let url = navigationAction.request.url {
                    openInExternalBrowser(url)
                }
                decisionHandler(.cancel)
                return
            }

            decisionHandler(.allow)
        }

        // Handle window.open() calls
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            print("createWebView called with URL: \(navigationAction.request.url)")
            print("Current webView URL: \(webView.url?.absoluteString ?? "none")")
            if let url = navigationAction.request.url, url != webView.url {
                openInExternalBrowser(url)
            }
            // Always return nil to prevent creating new WebViews
            return nil
        }
    }
}
