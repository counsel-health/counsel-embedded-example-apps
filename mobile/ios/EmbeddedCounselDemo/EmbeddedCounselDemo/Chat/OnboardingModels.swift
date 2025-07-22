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
    let body: String?
    
    init(title: String, subtitle: String? = nil, imageName: String? = nil, checklist: [Checklist] = [], body: String? = nil) {
        self.title = title
        self.subtitle = subtitle
        self.imageName = imageName
        self.checklist = checklist
        self.body = body
    }
}

struct Checklists {
    let checklist: [Checklist] = [
        .init(title: "Health Information Privacy Policy", url: "https://www.counselhealth.com/hipaa-statement"),
        .init(title: "Privacy Agreement", url: "https://www.counselhealth.com/privacy-policy"),
        .init(title: "Informed Consent", url: "https://www.google.com"),
        .init(title: "Terms of Use", url: "https://www.counselhealth.com/terms-of-service")
    ]
}

struct OnboardingPages {
    let pages: [OnboardingPage] = [
        .init(title: "Get personalized advice on anything — even the awkward stuff.", imageName: "onboarding1"),
        .init(title: "Get treated with prescriptions, labs, and more when needed.", imageName: "onboarding2"),
        .init(title: "Meet your health and lifestyle goals with medical-grade advice", imageName: "onboarding3"),
        .init(title: "Our Policies", subtitle: "Please review our policies to understand your rights, our terms and privacy practices.", imageName: nil, checklist: Checklists().checklist, body: "Data security is of utmost importance at Counsel. All communications are secure and encrypted. Only your personal physician advisor will have access to the health information you share."),
        .init(title: "Congrats! You have free access for 7 days.", imageName: nil)
    ]
}
