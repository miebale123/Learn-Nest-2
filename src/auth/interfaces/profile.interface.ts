export interface Profile {
  user: {
    email: string;
    provider: string;
    providerId: string;
    accessToken?: string;
  };
}
