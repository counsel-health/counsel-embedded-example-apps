//
//  HealthScoreCardView.swift
//  EmbeddedCounselDemo
//
//  Created by Counsel on 5/14/25.
//

import SwiftUI

struct HealthScoreCardView: View {
    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 4) {
                Text("Health Score")
                    .padding(.bottom)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("87/100")
                    .font(.system(.title))
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("+2 points from last week")
                    .font(.system(.callout))
                    .foregroundStyle(.gray)
                    .padding(.bottom)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
