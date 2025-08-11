//
//  ChatView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct ChatView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var chatUrl: URL?
    @State private var showErrorModal = false
    @State private var isLoading = false
    @AppStorage("token") private var token: String?
    @AppStorage("userType") private var userType: UserType?

    
    var body: some View {
        NavigationStack {
            if userType == .onboarding {
                ChatViewUserTypeOnboarding(chatUrl: chatUrl, isLoading: $isLoading)
            } else {
                ChatViewUserTypeMain(chatUrl: chatUrl, isLoading: $isLoading)
            }
        }
        .task {
            await fetchChatURL()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                // App became active (reopened), fetch a fresh URL
                Task {
                    await fetchChatURL()
                }
            }
        }
        .alert("Error", isPresented: $showErrorModal) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Unable to load chat. Please try signing out and signing in again.")
        }
        .onChange(of: token) { _, newToken in
            // When the user signs out (token cleared), reset chat state
            if newToken == nil {
                chatUrl = nil
            }
        }
    }
    
    private func fetchChatURL() async {
        guard token != nil else { return }
        
        do {
            isLoading = true
            print("Fetching chat URL")
            let url = try await API.User.fetchChatURL(token: token)
            chatUrl = url
        } catch {
            print("Error fetching chat URL: \(error)")
            if let error = error as? APIError, error == .tokenExpired {
                // Token expired
                token = nil
                userType = nil
            }
            isLoading = false
            showErrorModal = true
        }
    }
}
