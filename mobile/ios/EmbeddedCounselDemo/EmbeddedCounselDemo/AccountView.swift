//
//  AccountView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/13/25.
//

import SwiftUI
import SafariServices

struct AccountView: View {
    @Binding var presentAccessCodeModal: Bool
    @Binding var tabSelection: TabSelection

    @AppStorage("token") private var token: String?
    @AppStorage("userType") private var userType: UserType?

    var body: some View {
        SafariView(url: URL(string: "http://localhost:3000/layout")!)
    }
}
