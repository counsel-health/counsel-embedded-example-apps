//
//  OnboardingPage.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingPage {
    let title: String
    let subtitle: String?
    let imageName: String?
    
    init(title: String, subtitle: String? = nil, imageName: String? = nil) {
        self.title = title
        self.subtitle = subtitle
        self.imageName = imageName
    }
}

struct OnboardingView: View {

    @Binding var isPresented: Bool
    @State private var currentPage = 0

    private let onboardingPages: [OnboardingPage] = [
        .init(title: "Get personalized advice on anything — even the awkward stuff.", imageName: "onboarding1"),
        .init(title: "Get treated with prescriptions, labs, and more when needed.", imageName: "onboarding2"),
        .init(title: "Meet your health and lifestyle goals with medical-grade advice", imageName: "onboarding3"),
        .init(title: "Our Policies", subtitle: "Please review our policies to understand your rights, our terms and privacy practices.", imageName: nil),
        .init(title: "Congrats! You have free access for 30 days.", imageName: nil)
    ]
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(onboardingPages.indices, id: \.self) { idx in
                    VStack(spacing: 16) {
                        Text(onboardingPages[idx].title)
                            .font(.title)
                            .fontWeight(.semibold)
                            .multilineTextAlignment(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, onboardingPages[idx].subtitle != nil ? 0 : 24)
                        if let subtitle = onboardingPages[idx].subtitle {
                            Text(subtitle)
                                .font(.subheadline)
                                .multilineTextAlignment(.leading)
                                .foregroundStyle(Color(.systemGray))
                                .padding(.bottom, 24)
                        }
                        if let imageName = onboardingPages[idx].imageName {
                            Image(imageName)
                                .resizable()
                                .scaledToFit()
                        }
                    }
                    .padding(.horizontal, 32)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
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
