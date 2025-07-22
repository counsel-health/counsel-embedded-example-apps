//
//  EmbeddedCounselDemoApp.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

@main
struct EmbeddedCounselDemoApp: App {
    @AppStorage("token") private var token: String?
    @StateObject private var navigationCoordinator = NavigationCoordinator()
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(navigationCoordinator)
                .preferredColorScheme(.light)
                .onAppear {
                    // Set initial state once at app level
                    navigationCoordinator.updateAuthState(isAuthenticated: token != nil)
                }
                .onOpenURL { url in
                    navigationCoordinator.handleDeepLink(url, isAuthenticated: token != nil)
                }
                .onChange(of: token) { _, newToken in
                    navigationCoordinator.updateAuthState(isAuthenticated: newToken != nil)
                }
        }
    }
}
