//
//  OnboardingPagesView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct OnboardingPagesView: View {

    @Binding var isPresented: Bool
    @State private var currentPage = 0

    private let onboardingPages = OnboardingPages()
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(onboardingPages.pages.indices, id: \.self) { idx in
                    Tab(value: idx) {
                        OnboardingPageView(page: onboardingPages.pages[idx])
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
                    .foregroundStyle(.brandDarkBlue)
                    .frame(maxWidth: .infinity)
                    .padding(8)
            }
            .buttonStyle(.borderedProminent)
            .tint(.brandLightBlue)
            .padding()
        }
        .navigationBarHidden(true)
    }
}
