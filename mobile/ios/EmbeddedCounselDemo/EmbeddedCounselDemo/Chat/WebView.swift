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
        configuration.userContentController = userContentController
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        // webView.translatesAutoresizingMaskIntoConstraints = false
        // https://stackoverflow.com/questions/63136482/wkwebview-how-to-disable-adjustedcontentinset-when-keyboard-is-shown/63136483#63136483
        // NotificationCenter.default.removeObserver(webView, name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        // NotificationCenter.default.removeObserver(webView, name: UIResponder.keyboardWillShowNotification, object: nil)
        // NotificationCenter.default.removeObserver(webView, name: UIResponder.keyboardWillHideNotification, object: nil)

        webView.allowsBackForwardNavigationGestures = false   // Disable swiping to navigate 
        webView.scrollView.contentInsetAdjustmentBehavior = .never;
        webView.scrollView.backgroundColor = .red;

        // webView.scrollView.contentInsetAdjustmentBehavior = .never
        // webView.scrollView.automaticallyAdjustsScrollIndicatorInsets = false
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(showLoadingScreen: $showLoadingScreen)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        @Binding var showLoadingScreen: Bool
        
        init(showLoadingScreen: Binding<Bool>) {
            _showLoadingScreen = showLoadingScreen
        }

        // Hide loading screen when the web view finishes loading
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            showLoadingScreen = false
            // webView.scrollView.contentSize = webView.bounds.size
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
