export interface IntegrationToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string | null;
  expiresAt: string;
}
