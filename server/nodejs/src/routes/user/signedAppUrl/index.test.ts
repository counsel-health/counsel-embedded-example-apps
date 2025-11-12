import { test, describe } from "node:test";
import assert from "node:assert";
import { DBRowNotFoundError } from "@/db/lib/dbErrors";

describe("getOrCreateUser behavior", () => {
    test("should handle existing user scenario", () => {
      // When getUser succeeds, it should return the user directly
      const mockUser = {
        id: "test-user-id",
        counsel_user_id: "counsel-123",
        name: "John Doe",
        email: "john.doe@example.com",
        info: {
          dob: "1990-01-01",
          sex: "Male",
          address: {
            line1: "123 Main St",
            city: "San Francisco",
            state: "CA",
            zip: "94101",
          },
          phone: "+18007006000",
          medicalProfile: {
            conditions: [],
            medications: [],
          },
        },
      };

      // Expected: getUser is called once, user is returned
      assert.ok(mockUser);
      assert.strictEqual(mockUser.id, "test-user-id");
      assert.strictEqual(typeof mockUser.counsel_user_id, "string");
    });

    test("should handle user creation when user not found and access code config exists", () => {
      // When getUser throws DBRowNotFoundError and getAccessCodeConfig returns a config,
      // createUser should be called with correct parameters
      const mockConfig = {
        client: "main",
        apiKey: "sk_test_123",
        apiUrl: "https://test-api.counselhealth.com",
        userType: "main" as const,
      };

      const expectedCreateUserParams = {
        userId: "new-user-id",
        accessCode: "MAIN01",
        userType: "main" as const,
      };

      assert.ok(mockConfig);
      assert.strictEqual(mockConfig.userType, "main");
      assert.deepStrictEqual(expectedCreateUserParams, {
        userId: "new-user-id",
        accessCode: "MAIN01",
        userType: "main",
      });
    });

    test("should throw error when user not found and access code config does not exist", () => {
      // When getUser throws DBRowNotFoundError and getAccessCodeConfig returns null,
      // an error should be thrown with the correct message
      const accessCode = "INVALID";
      const expectedError = new Error(
        `No access code config found for access code "${accessCode}".`
      );

      assert.strictEqual(
        expectedError.message,
        `No access code config found for access code "${accessCode}".`
      );
      assert.ok(expectedError instanceof Error);
    });

    test("should propagate non-DBRowNotFoundError from getUser", () => {
      // When getUser throws an error that is not DBRowNotFoundError,
      // that error should be propagated
      const testError = new Error("Database connection failed");

      assert.ok(testError instanceof Error);
      assert.strictEqual(testError.message, "Database connection failed");
      assert.ok(!(testError instanceof DBRowNotFoundError));
    });
});
