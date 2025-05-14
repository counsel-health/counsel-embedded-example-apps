//
//  AccountView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/13/25.
//

import SwiftUI

struct AccountView: View {

    @Binding var presentAccessCodeModal: Bool
    @AppStorage("token") private var token: String?

    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                Button(action: {
                    token = nil // clear token
                    presentAccessCodeModal = true
                    Task {
                        do {
                            try await API.User.signOutChat()
                        } catch {
                            // noop
                        }
                    }
                }) {
                    Text("Sign out")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal)
                .padding(.bottom, 24)
            }
            .navigationTitle("Account")
        }
    }
}
