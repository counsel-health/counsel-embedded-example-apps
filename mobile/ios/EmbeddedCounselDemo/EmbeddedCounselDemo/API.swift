//
//  API.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/13/25.
//

import Foundation

enum API {
    enum User {
        static func fetchChatURL(token: String?) async throws -> URL? {
            guard let token = token else {
                return nil
            }

            guard let urlBaseString = Bundle.main.infoDictionary?["baseUrl"] as? String,
                  let url = URL(string: "\(urlBaseString)/user/signedAppUrl") else {
                throw URLError(.badURL)
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let bearerToken = "Bearer \(token)"
            request.setValue(bearerToken, forHTTPHeaderField: "Authorization")
            
            let (data, response) = try await URLSession.shared.data(for: request)

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 400 {
                throw APIError.tokenExpired
            }

            let signedAppResponse = try JSONDecoder().decode(SignedAppResponse.self, from: data)
            let signedUrl = URL(string: signedAppResponse.url)

            return signedUrl
        }
        
        static func fetchToken(accessCode: String) async throws -> (token: String, userType: UserType) {
            guard let urlBaseString = Bundle.main.infoDictionary?["baseUrl"] as? String,
                  let url = URL(string: "\(urlBaseString)/user/signUp") else {
                throw URLError(.badURL)
            }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue(accessCode, forHTTPHeaderField: "accessCode")

            let body: [String: String] = ["accessCode": accessCode]
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(AccessCodeTokenResponse.self, from: data)

            return (response.token, response.userType)
        }
        
        static func signOutChat(token: String) async throws -> Void {
            guard let urlBaseString = Bundle.main.infoDictionary?["baseUrl"] as? String,
                  let url = URL(string: "\(urlBaseString)/user/signOut") else {
                throw URLError(.badURL)
            }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let bearerToken = "Bearer \(token)"
            request.setValue(bearerToken, forHTTPHeaderField: "Authorization")
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                throw APIError.badStatusCode
            }
        }
    }
}

enum APIError: Error {
    case badStatusCode
    case tokenExpired
}
