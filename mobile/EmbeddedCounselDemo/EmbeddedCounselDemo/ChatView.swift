//
//  ChatView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct ChatView: View {
    let urlString: String
    
    var body: some View {
        WebView(urlString: urlString)
            .navigationTitle("Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .tabBar)
    }
} 
