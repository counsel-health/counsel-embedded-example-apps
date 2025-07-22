//
//  ChatView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct ChatView: View {
    @State private var chatUrl: URL?
    @State private var showErrorModal = false
    @AppStorage("token") private var token: String?
    @AppStorage("userType") private var userType: UserType?
    // Stores whether to show the native onboarding pages
    @State private var showOnboarding: Bool = true
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Only show the native onboarding pages if the user is a main user and the onboarding pages are not already shown
                // User type onboarding specifies that onboarding is handled by the WebView
                if showOnboarding && userType != .onboarding {
                    OnboardingPagesView(isPresented: $showOnboarding)
                        .zIndex(1)
                        .transition(.opacity)
                } else if let chatUrl = chatUrl {
                    WebView(url: chatUrl)
                } else {
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
        .task {
            guard chatUrl == nil else { return }

            do {
                let url = try await API.User.fetchChatURL(token: token)
                chatUrl = url
            } catch {
                showErrorModal = true
            }
        }
        .alert("Error", isPresented: $showErrorModal) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Unable to load chat. Please try again later.")
        }
        .onChange(of: token) { _, newToken in
            // When the user signs out (token cleared), reset chat state
            if newToken == nil {
                chatUrl = nil
                showOnboarding = true
            }
        }
    }
}
