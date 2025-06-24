//
//  OnboardingPageView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingPageView: View {
    
    let page: OnboardingPage
    @Binding var checklistStates: [UUID: Bool]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(page.title)
                .font(.title)
                .fontWeight(.semibold)
                .foregroundStyle(.brandMidGreen)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, page.subtitle != nil ? 0 : 24)
            if let subtitle = page.subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .multilineTextAlignment(.leading)
                    .foregroundStyle(Color(.systemGray))
                    .padding(.bottom, 24)
            }
            ForEach(page.checklist) { checklist in
                ChecklistRowView(
                    checklist: checklist,
                    isChecked: Binding(
                        get: { checklistStates[checklist.id] ?? false },
                        set: { checklistStates[checklist.id] = $0 }
                    )
                )
            }
            if let body = page.body {
                Text(body)
                    .font(.subheadline)
                    .multilineTextAlignment(.leading)
                    .foregroundStyle(Color(.systemGray))
            }
            if let imageName = page.imageName {
                Image(imageName)
                    .resizable()
                    .scaledToFit()
            }
        }
        .padding(.horizontal, 32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
