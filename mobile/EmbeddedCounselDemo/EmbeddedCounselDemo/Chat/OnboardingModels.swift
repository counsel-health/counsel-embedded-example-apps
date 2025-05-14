//
//  OnboardingModels.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import Foundation

struct Checklist: Identifiable {
    let id = UUID()
    let title: String
    let url: String
}

struct OnboardingPage {
    let title: String
    let subtitle: String?
    let imageName: String?
    let checklist: [Checklist]
    
    init(title: String, subtitle: String? = nil, imageName: String? = nil, checklist: [Checklist] = []) {
        self.title = title
        self.subtitle = subtitle
        self.imageName = imageName
        self.checklist = checklist
    }
}

struct Checklists {
    let checklist: [Checklist] = [
        .init(title: "Health Information Privacy Policy", url: "https://www.google.com"),
        .init(title: "Privacy Agreement", url: "https://www.google.com"),
        .init(title: "Informed Consent", url: "https://www.google.com"),
        .init(title: "Terms of Use", url: "https://www.google.com")
    ]
}

struct OnboardingPages {
    let pages: [OnboardingPage] = [
        .init(title: "Get personalized advice on anything — even the awkward stuff.", imageName: "onboarding1"),
        .init(title: "Get treated with prescriptions, labs, and more when needed.", imageName: "onboarding2"),
        .init(title: "Meet your health and lifestyle goals with medical-grade advice", imageName: "onboarding3"),
        .init(title: "Our Policies", subtitle: "Please review our policies to understand your rights, our terms and privacy practices.", imageName: nil, checklist: Checklists().checklist),
        .init(title: "Congrats! You have free access for 30 days.", imageName: nil)
    ]
}
