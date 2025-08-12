import SwiftUI

struct ChatViewUserTypeOnboarding: View {
    let chatUrl: URL?
    @Binding var isLoading: Bool
    
    var body: some View {
        NavigationStack {
            ZStack {
                if let chatUrl = chatUrl {
                    WebView(url: URL(string: "http://localhost:3000/layout")!, showLoadingScreen: $isLoading)
                        .ignoresSafeArea(.keyboard)
                }
                
                if isLoading {
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
            .animation(.easeOut(duration: 0.5), value: isLoading)
            .onAppear {
                // Reset loading state when view appears
                if chatUrl != nil {
                    isLoading = true
                }
            }
        }
    }
}
