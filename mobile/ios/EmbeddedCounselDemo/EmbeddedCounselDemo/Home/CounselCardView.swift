//
//  CounselCardView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct CounselCardView: View {
    
    @Binding var tabSelection: TabSelection
    
    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 8) {
                Text("FREE for a limited time")
                    .foregroundStyle(.brandDarkBlue)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(3)
                    .background(
                        RoundedRectangle(cornerRadius: 4)
                            .fill(.brandLightBlue.opacity(0.2))
                    )
                    .padding(.bottom)
                Text("Got questions? Get smarter about your health and lifestyle with an expert doctor")
                    .font(.system(.title2, weight: .semibold))
                    .padding(.bottom)
                ChecklistItem(title: "Get advice")
                ChecklistItem(title: "Optimize your lifestyle")
                ChecklistItem(title: "Order labs")
                ChecklistItem(title: "Get treatment")
                    .padding(.bottom)
                Button(action: {
                    tabSelection = .chat
                }) {
                    Text("Message a doctor today")
                        .foregroundStyle(.brandDarkBlue)
                        .frame(maxWidth: .infinity)
                        .padding(8)
                }
                .buttonStyle(.borderedProminent)
                .tint(.brandLightBlue)
            }
        }
    }
}
