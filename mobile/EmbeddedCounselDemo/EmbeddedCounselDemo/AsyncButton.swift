//
//  AsyncButton.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct AsyncButton: View {
    let title: String
    let action: () async throws -> Void
    var onError: ((Error) -> Void)? = nil
    @State private var isLoading = false

    init(title: String, action: @escaping () async throws -> Void,
         onError: ((Error) -> Void)? = nil) {
        self.title = title
        self.action = action
        self.onError = onError
    }

    var body: some View {
        Button {
            isLoading = true
            Task {
                do {
                    try await action()
                } catch {
                    onError?(error)
                }
                isLoading = false
            }
        } label: {
            if isLoading {
                ProgressView()
                    .tint(.white)
                    .frame(maxWidth: .infinity)
                    .padding(8)
            } else {
                Text(title)
                    .foregroundStyle(.brandDarkBlue)
                    .frame(maxWidth: .infinity)
                    .padding(8)
            }
        }
        .buttonStyle(.borderedProminent)
        .tint(.brandLightBlue)
    }
}
