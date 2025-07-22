//
//  ResponseModels.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/3/25.
//

import Foundation

struct SignedAppResponse: Codable {
    let url: String
}

enum UserType: String, Codable {
    case main
    case onboarding
}

struct AccessCodeTokenResponse: Codable {
    let token: String
    let userType: UserType
}
