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
            HStack {
                Text(checklist.title)
                    .lineLimit(1)
                    .fixedSize(horizontal: true, vertical: false)
                    .foregroundStyle(.brandMidGreen)
                Button {
                    if let url = URL(string: checklist.url) {
                        openURL(url)
                    }
                } label: {
                    Image(systemName: "arrow.up.right.square")
                }
            }
            Spacer()
            Toggle(isOn: $isChecked) {}
        }
        .tint(.brandMidGreen)
    }
}
