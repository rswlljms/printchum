export type MockAccount = {
  name: string;
  email: string;
  plan: "Studio";
  aiCreditsRemaining: number;
};

export const mockAccount: MockAccount = {
  name: "Studio Owner",
  email: "owner@example.com",
  plan: "Studio",
  aiCreditsRemaining: 184,
};
