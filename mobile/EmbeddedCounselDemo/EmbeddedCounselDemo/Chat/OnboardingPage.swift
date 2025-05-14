//
//  OnboardingPage.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingPage {
    let text: String
    let imageName: String?
}

struct OnboardingView: View {
    @Binding var isPresented: Bool
    @State private var currentPage = 0
    private let onboardingPages: [OnboardingPage] = [
        .init(text: "Get personalized advice on anything — even the awkward stuff.", imageName: "onboarding1"),
        .init(text: "Get treated with prescriptions, labs, and more when needed.", imageName: "onboarding2"),
        .init(text: "Meet your health and lifestyle goals with medical-grade advice", imageName: "onboarding3"),
        .init(text: "Our Policies", imageName: nil),
        .init(text: "Congrats! You have free access for 30 days.", imageName: nil)
    ]
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(onboardingPages.indices, id: \.self) { idx in
                    VStack(spacing: 16) {
                        Text(onboardingPages[idx].text)
                            .font(.title)
                            .fontWeight(.semibold)
                            .multilineTextAlignment(.leading)
                            .padding(.bottom, 24)
                        if let imageName = onboardingPages[idx].imageName {
                            Image(imageName)
                                .resizable()
                                .scaledToFit()
                        }
                    }
                    .padding(.horizontal, 16)
                    .frame(maxHeight: .infinity)
                    .tag(idx)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .always))
            .frame(maxHeight: .infinity)
            
            Button(action: {
                withAnimation {
                    if currentPage < onboardingPages.count - 1 {
                        currentPage += 1
                    } else {
                        isPresented = false
                    }
                }
            }) {
                Text("Next")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .padding()
        }
        .navigationBarHidden(true)
    }
}
