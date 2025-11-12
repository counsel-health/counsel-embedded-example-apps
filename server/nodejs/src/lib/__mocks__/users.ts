import { User } from "@/db/schemas/user";

/**
 * Creates a mock user for testing
 */
export const createMockUser = (id: string): User => ({
  id,
  name: "John Doe",
  email: "john@example.com",
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
      conditions: ["diabetes"],
      medications: ["insulin"],
    },
  },
});

/**
 * Creates a mock user with custom data
 */
export const createMockUserWithData = (overrides: Partial<User>): User => {
  const baseUser = createMockUser(overrides.id || "user-default");
  return {
    ...baseUser,
    ...overrides,
    info: {
      ...baseUser.info,
      ...(overrides.info || {}),
      address: {
        ...baseUser.info.address,
        ...(overrides.info?.address || {}),
      },
      medicalProfile: {
        ...baseUser.info.medicalProfile,
        ...(overrides.info?.medicalProfile || {}),
      },
    },
  };
};

/**
 * Sample users for different test scenarios
 */
export const mockUsers = {
  basic: createMockUser("user-basic"),
  withConditions: (() => {
    const user = createMockUser("user-with-conditions");
    return {
      ...user,
      info: {
        ...user.info,
        medicalProfile: {
          conditions: ["diabetes", "hypertension"],
          medications: ["insulin", "metformin"],
        },
      },
    };
  })(),
  minimal: (() => {
    const user = createMockUser("user-minimal");
    return {
      ...user,
      name: "Jane Doe",
      email: "jane@example.com",
      info: {
        ...user.info,
        medicalProfile: {
          conditions: [],
          medications: [],
        },
      },
    };
  })(),
} as const;

