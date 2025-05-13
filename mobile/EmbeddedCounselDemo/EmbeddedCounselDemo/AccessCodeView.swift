//
//  AccessCodeView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/12/25.
//
import SwiftUI

struct AccessCodeView: View {

    @Binding var isPresented: Bool
    @State private var accessCode: String = ""
    @State private var showButtonLoading: Bool = false
    @State private var showErrorModal: Bool = false
    @AppStorage("token") private var token: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Embedded Corp Demo App")
                .font(.system(.largeTitle, weight: .bold))
            Text("Ask the Counsel Team for an access code to play with the demo")
                .font(.system(.subheadline))
                .foregroundStyle(.blue)
                .padding(.bottom, 80)
            SecureField(text: $accessCode, prompt: Text("Enter access code").font(.system(.subheadline)))
            {
                Text("Access code")
            }
            .padding(8)
            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.gray))
            Button(action: {
                showButtonLoading = true
                Task {
                    do {
                        let newToken = try await API.User.fetchToken(accessCode: accessCode)
                        token = newToken // store in UserDefaults
                        showButtonLoading = false
                        isPresented = false
                    } catch {
                        showButtonLoading = false
                        showErrorModal = true
                    }
                }
            }) {
                if showButtonLoading {
                    ProgressView()
                        .tint(.white)
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Login")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(.horizontal, 32)
        .alert("Error", isPresented: $showErrorModal) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Either the access code was invalid or the network failed. Please try again.")
        }
    }
}
