//
//  ChatViewOnboarding.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 8/6/25.
//

import SwiftUI

// This view is used to show the native onboarding pages for UserType main users only
// This will show native screens for onboarding and then switch to the chat WebView
struct ChatViewUserTypeMain: View {
    let chatUrl: URL?
    @Binding var isLoading: Bool
    @State private var showOnboarding: Bool = true

    
    var body: some View {
        NavigationStack {
            ZStack {
                // Only show the native onboarding pages if the user is a main user and the onboarding pages are not already shown
                // User type onboarding specifies that onboarding is handled by the WebView
                if showOnboarding {
                    OnboardingPagesView(isPresented: $showOnboarding)
                        .zIndex(1)
                        .transition(.opacity)
                } else if let chatUrl = chatUrl {
                    VStack {
                        WebView(url: chatUrl, showLoadingScreen: $isLoading)
                    }
                }
                if isLoading && !showOnboarding {
                    // Loading screen is default state if no chat URL is available or onboarding is not shown
                    VStack(spacing: 0) {
                        ProgressView()
                            .scaleEffect(1.5)
                            .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemBackground))
                    .zIndex(2)
                    .transition(.opacity)
                }
            }
            .animation(.easeOut(duration: 0.5), value: showOnboarding)
            .padding(.bottom, 5)
        }
    }
}
