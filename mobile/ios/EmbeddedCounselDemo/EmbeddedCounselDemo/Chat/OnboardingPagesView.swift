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
    @State private var checklistStates: [UUID: Bool] = [:]

    private let onboardingPages = OnboardingPages()
    
    private var canProceed: Bool {
        let currentPageData = onboardingPages.pages[currentPage]
        if currentPageData.checklist.isEmpty {
            return true
        }
        return currentPageData.checklist.allSatisfy { checklist in
            checklistStates[checklist.id] == true
        }
    }
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(onboardingPages.pages.indices, id: \.self) { idx in
                    Tab(value: idx) {
                        OnboardingPageView(
                            page: onboardingPages.pages[idx],
                            checklistStates: $checklistStates
                        )
                    }
                }
            }
            .tabViewStyle(.page)
            .frame(maxHeight: .infinity).frame(maxWidth: .infinity)
            
            Button(action: {
                withAnimation {
                    if currentPage < onboardingPages.pages.count - 1 {
                        currentPage += 1
                    } else {
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
            .disabled(!canProceed)
            .opacity(canProceed ? 1.0 : 0.5)
            .padding()
        }
        .background(.white)
        .navigationBarHidden(true)
    }
}
