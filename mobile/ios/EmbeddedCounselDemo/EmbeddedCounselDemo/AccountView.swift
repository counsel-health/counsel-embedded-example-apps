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
    @AppStorage("userType") private var userType: UserType?

    var body: some View {
        NavigationStack {
           VStack(alignment: .leading, spacing: 16) {              
                // Profile Card containing both profile info and sign out button
                VStack(spacing: 0) {
                    // Top Profile Section
                    HStack(alignment: .top, spacing: 16) {
                        // Left side - User info
                        VStack(alignment: .leading, spacing: 8) {
                            Text("John Doe")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Text("john.doe@example.com")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        // Right side - Profile Image
                        Circle()
                            .fill(Color.blue.gradient)
                            .frame(width: 4, height: 60)
                            .overlay {
                                Text("JD")
                                    .font(.title3)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                            }
                    }.padding(.bottom, 36)
                    
                    // Sign out button
                    AsyncButton(title: "Sign out") {
                        do {
                            try await API.User.signOutChat(token: token!)
                        } catch {
                            print("Error signing out: \(error)")
                            // noop
                        }
                        token = nil // clear token
                        userType = nil // clear user type
                        presentAccessCodeModal = true
                        tabSelection = .home
                    }
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemBackground))
                        .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 2)
                )
        
            }
            .padding(.horizontal)
            .padding(.bottom, 5)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .navigationTitle("Account")
            .background(Color(.systemGray6).ignoresSafeArea())
        }
    }
}
