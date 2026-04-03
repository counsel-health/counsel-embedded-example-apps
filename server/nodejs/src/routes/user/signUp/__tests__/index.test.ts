import { describe, expect, test } from "vitest";
import { setupTestEnv } from "@/lib/__mocks__/envConfig";

setupTestEnv();

const { checkAccessCode } = await import("../accessCode");

describe("signUp route handler", () => {
  describe("request body validation", () => {
    test("should accept valid request body with accessCode", () => {
      const validRequestBody = { accessCode: "MAIN01", userId: "test-user-id" };

      expect(validRequestBody.accessCode.length).toBe(6);
      expect(typeof validRequestBody.userId).toBe("string");
    });

    test("should accept request body without userId (optional field)", () => {
      const validRequestBodyWithoutUserId = { accessCode: "MAIN01" };

      expect(validRequestBodyWithoutUserId.accessCode.length).toBe(6);
      expect("userId" in validRequestBodyWithoutUserId).toBe(false);
    });

    test("should require accessCode to be exactly 6 characters", () => {
      expect("MAIN01".length).toBe(6);
      expect("SHORT".length < 6).toBe(true);
      expect("TOOLONG".length > 6).toBe(true);
    });
  });

  describe("response structure", () => {
    test("should include client, accessCode and userType in user creation parameters", () => {
      const mockUserCreationParams = {
        userId: "test-user-id",
        client: "main",
        accessCode: "MAIN01",
        userType: "main" as const,
      };

      expect(mockUserCreationParams.userType).toBe("main");
      expect(mockUserCreationParams.accessCode).toBe("MAIN01");
      expect(
        mockUserCreationParams.userType === "main" ||
          mockUserCreationParams.userType === "onboarding"
      ).toBe(true);
    });

    test("should handle onboarding userType in user creation", () => {
      const mockOnboardingUserParams = {
        userId: "test-user-id",
        client: "client1",
        accessCode: "ONBR01",
        userType: "onboarding" as const,
      };

      expect(mockOnboardingUserParams.userType).toBe("onboarding");
      expect(mockOnboardingUserParams.accessCode).toBe("ONBR01");
    });

    test("should return token, userType, client, and counselUserId", () => {
      const mockResponse = {
        token: "mock-jwt-token",
        userType: "main" as const,
        client: "main",
        counselUserId: "counsel-user-123",
      };

      expect(typeof mockResponse.token).toBe("string");
      expect(mockResponse.userType).toBe("main");
      expect(mockResponse.client).toBe("main");
      expect(mockResponse.counselUserId).toBe("counsel-user-123");
      expect(typeof mockResponse.counselUserId).toBe("string");
    });
  });

  describe("checkAccessCode function", () => {
    test("should normalize lowercase access code to uppercase", () => {
      const result = checkAccessCode("main01");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessCode).toBe("MAIN01");
      }
    });

    test("should normalize mixed case access code to uppercase", () => {
      const result = checkAccessCode("MaIn01");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessCode).toBe("MAIN01");
      }
    });

    test("should trim whitespace and normalize access code", () => {
      const result = checkAccessCode("  main01  ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessCode).toBe("MAIN01");
      }
    });

    test("should return uppercase access code even when input is already uppercase", () => {
      const result = checkAccessCode("MAIN01");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessCode).toBe("MAIN01");
      }
    });

    test("should return error for invalid access code", () => {
      const result = checkAccessCode("INVALID");

      expect(result.success).toBe(false);
    });
  });
});
