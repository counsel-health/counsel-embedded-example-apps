//
//  CounselCardView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct CounselCardView: View {
    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 8) {
                Text("FREE for a limited time")
                    .padding(.bottom)
                Text("Got questions? Get smarter about your health and lifestyle with an expert doctor")
                    .font(.system(.title, weight: .semibold))
                    .padding(.bottom)
                ChecklistItem(title: "Get advice")
                ChecklistItem(title: "Optimize your lifestyle")
                ChecklistItem(title: "Order labs")
                ChecklistItem(title: "Get treatment")
                    .padding(.bottom)
                Button(action: {
                    // tap tab view
                }) {
                    Text("Message a doctor today")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
    }
}
