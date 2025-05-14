//
//  OnboardingPageView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingPageView: View {
    
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 16) {
            Text(page.title)
                .font(.title)
                .fontWeight(.semibold)
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
                HStack {
                    Label(checklist.title, systemImage: "arrow.up.forward.square")
                }
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
