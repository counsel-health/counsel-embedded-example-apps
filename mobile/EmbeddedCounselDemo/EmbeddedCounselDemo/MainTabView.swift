//
//  MainTabView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

enum TabSelection: Hashable {
  case home, chat, account
}

struct MainTabView: View {

    @State private var selection: TabSelection = .home
    @State private var presentAccessCodeModal: Bool = true
    
    var body: some View {
        ZStack {
            TabView(selection: $selection) {
                Tab("", systemImage: "house", value: .home) {
                    HomeView(tabSelection: $selection)
                }
                Tab("", systemImage: "bubble.left.and.text.bubble.right", value: .chat) {
                    ChatView()
                }
                Tab("", systemImage: "person.crop.circle", value: .account) {
                    AccountView(presentAccessCodeModal: $presentAccessCodeModal)
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
