//
//  ChecklistRowView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct ChecklistRowView: View {
    
    let checklist: Checklist
    @Binding var isChecked: Bool

    @Environment(\.openURL) private var openURL
    
    var body: some View {
        HStack {
            Text(checklist.title)
                .lineLimit(2)
                .foregroundStyle(.brandMidGreen)
                .layoutPriority(1)
            
            Button {
                if let url = URL(string: checklist.url) {
                    openURL(url)
                }
            } label: {
                Image(systemName: "arrow.up.right.square")
            }
            .padding(.leading, 8)
            
            Spacer()
            
            Toggle(isOn: $isChecked) {}
        }
        .tint(.brandMidGreen)
    }
}
