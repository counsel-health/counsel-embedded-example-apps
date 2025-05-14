//
//  OnboardingPage.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingView: View {

    @Binding var isPresented: Bool
    @State private var currentPage = 0

    private let onboardingPages = OnboardingPages()
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(onboardingPages.pages.indices, id: \.self) { idx in
                    Tab(value: idx) {
                        VStack(spacing: 16) {
                            Text(onboardingPages.pages[idx].title)
                                .font(.title)
                                .fontWeight(.semibold)
                                .multilineTextAlignment(.leading)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.bottom, onboardingPages.pages[idx].subtitle != nil ? 0 : 24)
                            if let subtitle = onboardingPages.pages[idx].subtitle {
                                Text(subtitle)
                                    .font(.subheadline)
                                    .multilineTextAlignment(.leading)
                                    .foregroundStyle(Color(.systemGray))
                                    .padding(.bottom, 24)
                            }
                            ForEach(onboardingPages.pages[idx].checklist) { checklist in
                                HStack {
                                    Label(checklist.title, systemImage: "arrow.up.forward.square")
                                }
                            }
                            if let imageName = onboardingPages.pages[idx].imageName {
                                Image(imageName)
                                    .resizable()
                                    .scaledToFit()
                            }
                        }
                        .padding(.horizontal, 32)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
            }
            .tabViewStyle(.page)
            .frame(maxHeight: .infinity)
            
            Button(action: {
                withAnimation {
                    if currentPage < onboardingPages.pages.count - 1 {
                        currentPage += 1
                    } else {
                        // show loading spinner
                        // get signed app url
                        // if succeed, dismiss, else show error modal
                        isPresented = false
                    }
                }
            }) {
                Text("Next")
                    .frame(maxWidth: .infinity)
                    .padding(8)
            }
            .buttonStyle(.borderedProminent)
            .padding()
        }
        .navigationBarHidden(true)
    }
}
