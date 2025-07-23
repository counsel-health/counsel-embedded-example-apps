//
//  NavigationCoordinator.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

@MainActor
class NavigationCoordinator: ObservableObject {
    @Published var selectedTab: TabSelection = .home
    @Published var presentAccessCodeModal: Bool = true
    
    func handleDeepLink(_ url: URL, isAuthenticated: Bool) {
        if url.path.starts(with: "/dashboard/chat") && isAuthenticated {
            selectedTab = .chat
            print("Deep link handled: \(url.path)")
        } else {
            print("Not a supported deep link: \(url.path)")
        }
    }
    
    func updateAuthState(isAuthenticated: Bool) {
        presentAccessCodeModal = !isAuthenticated
    }
} 