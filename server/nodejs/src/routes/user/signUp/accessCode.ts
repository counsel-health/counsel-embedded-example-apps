import { getAccessCodeConfig } from "@/envConfig";

export type AccessCodeCheck =
  | {
      success: true;
      client: string;
      accessCode: string;
      userType: "main" | "onboarding";
    }
  | {
      success: false;
      error: string;
    };

export function checkAccessCode(accessCode: string): AccessCodeCheck {
  const normalizedAccessCode = accessCode.trim().toUpperCase();
  const config = getAccessCodeConfig(normalizedAccessCode);
  if (!config) {
    return { success: false, error: "Invalid access code" };
  }
  return {
    success: true,
    client: config.client,
    accessCode: normalizedAccessCode,
    userType: config.userType,
  };
}
