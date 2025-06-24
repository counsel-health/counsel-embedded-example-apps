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
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        let userContentController = WKUserContentController()
        
        // Inject viewport meta tag script to set the viewport to the device width
        let viewportScript = WKUserScript(
            source: """
                if (!document.querySelector('meta[name="viewport"]')) {
                    var meta = document.createElement('meta');
                    meta.setAttribute('name', 'viewport');
                    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
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
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        uiView.load(request)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Check if the navigation is for a new window/tab (target="_blank")
            if navigationAction.targetFrame == nil {
                // This is a new window/tab request, open in OS browser
                if let url = navigationAction.request.url {
                    UIApplication.shared.open(url)
                }
                decisionHandler(.cancel)
                return
            }
            
            // Allow normal navigation within the webview
            decisionHandler(.allow)
        }
    }
}
