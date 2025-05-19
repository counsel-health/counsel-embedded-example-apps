//
//  CardView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct CardView<Content: View>: View {
    
    private let content: Content
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    var body: some View {
        content
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .shadow(color: Color(.sRGBLinear, white: 0, opacity: 0.2), radius: 1, x: 0, y: 1)
            )
    }
}
