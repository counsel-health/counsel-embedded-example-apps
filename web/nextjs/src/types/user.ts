export type User = {
  id: string;
  name: string;
  memberSince: string;
  plan: string;
  medicalConditions: string;
  medications: string;
  email: string;
  phone: string;
};

export type UserType = "main" | "onboarding";
