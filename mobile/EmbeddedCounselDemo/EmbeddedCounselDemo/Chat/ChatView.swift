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
    
    @State private var showOnboarding = true
    
    var body: some View {
        NavigationStack {
            if showOnboarding {
                OnboardingPagesView(isPresented: $showOnboarding)
            } else {
                Group {
                    if let chatUrl = chatUrl {
                        WebView(url: chatUrl)
                            .ignoresSafeArea(edges: .bottom)
                    } else {
                        ProgressView()
                    }
                }
                .navigationTitle("Chat")
                .navigationBarTitleDisplayMode(.inline)
            }
        }
        .task {
            do {
                let url = try await API.User.fetchChatURL(token: token)
                chatUrl = url
            } catch {
                showErrorModal = true
            }
        }
        .onDisappear {
            chatUrl = nil
        }
        .alert("Error", isPresented: $showErrorModal) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Unable to load chat. Please try again later.")
        }
    }
}
