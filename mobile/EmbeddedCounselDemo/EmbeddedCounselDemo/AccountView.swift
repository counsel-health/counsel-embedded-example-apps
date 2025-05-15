//
//  AccountView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/13/25.
//

import SwiftUI

struct AccountView: View {

    @Binding var presentAccessCodeModal: Bool
    @Binding var tabSelection: TabSelection

    @AppStorage("token") private var token: String?

    var body: some View {
        NavigationStack {
            VStack {
                Spacer()
                AsyncButton(title: "Sign out") {
                    token = nil // clear token
                    presentAccessCodeModal = true
                    do {
                        try await API.User.signOutChat()
                    } catch {
                        // noop
                    }
                    tabSelection = .home
                }
            }
            .navigationTitle("Account")
            .padding(32)
            .background(Color(.systemGray6).ignoresSafeArea())
        }
    }
}
