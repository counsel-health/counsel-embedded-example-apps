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
    @EnvironmentObject var navigationCoordinator: NavigationCoordinator
    @AppStorage("token") private var token: String?
    
    var body: some View {
        ZStack {
            TabView(selection: $navigationCoordinator.selectedTab) {
                Tab("", systemImage: "house", value: .home) {
                    HomeView(tabSelection: $navigationCoordinator.selectedTab)
                }
                Tab("", systemImage: "bubble", value: .chat) {
                    ChatView()
                }
                Tab("", systemImage: "person", value: .account) {
                    AccountView(presentAccessCodeModal: $navigationCoordinator.presentAccessCodeModal, tabSelection: $navigationCoordinator.selectedTab)
                }
            }

            if navigationCoordinator.presentAccessCodeModal && token == nil {
                AccessCodeView(isPresented: $navigationCoordinator.presentAccessCodeModal)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.white)
            }
        }
    }
}
