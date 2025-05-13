//
//  MainTabView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct MainTabView: View {
    
    @State private var presentAccessCodeModal: Bool = true
    
    var body: some View {
        ZStack {
            TabView {
                HomeView(presentAccessCodeModal: $presentAccessCodeModal)
                    .tabItem {
                        Label("Home", systemImage: "house")
                    }
                ChatView()
                    .tabItem {
                        Label("Chat", systemImage: "bubble.left.and.text.bubble.right")
                    }
            }
            
            if presentAccessCodeModal {
                AccessCodeView(isPresented: $presentAccessCodeModal)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.white)
            }
        }
    }
}
