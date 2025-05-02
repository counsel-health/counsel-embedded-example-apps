//
//  MenuView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct MenuView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(destination: ChatView(urlString: "https://www.google.com")) {
                    Text("Chat with Counsel")
                }
            }
            .navigationTitle("Menu")
        }
    }
}
