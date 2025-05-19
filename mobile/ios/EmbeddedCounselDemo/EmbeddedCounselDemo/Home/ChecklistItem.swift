//
//  ChecklistItem.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/13/25.
//

import SwiftUI

struct ChecklistItem: View {
    let title: String
    
    var body: some View {
        Label {
            Text(title)
        } icon: {
            Image(systemName: "checkmark.circle")
                .renderingMode(.template)
                .foregroundColor(.brandDarkBlue)
        }
    }
}
