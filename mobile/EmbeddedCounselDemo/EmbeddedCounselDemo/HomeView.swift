//
//  HomeView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/1/25.
//

import SwiftUI

struct HomeView: View {
    
    @Binding var presentAccessCodeModal: Bool
    
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading) {
                HStack(spacing: 24) {
                    NavigationLink(destination: AccountView(presentAccessCodeModal: $presentAccessCodeModal)) {
                        Image(systemName: "person.crop.circle")
                            .resizable()
                            .frame(width: 36, height: 36)
                            .padding(.top, 24)
                            .padding(.leading, 24)
                    }
                    Spacer()
                }
            }
            List {
                // TODO: insert card UI
            }
        }
    }
}
