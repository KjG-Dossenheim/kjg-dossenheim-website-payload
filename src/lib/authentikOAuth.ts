import { OAuth2Plugin } from "payload-oauth2";

// Authentik OAuth
export const authentikOAuth = OAuth2Plugin({
  enabled:
    typeof process.env.AUTHENTIK_CLIENT_ID === "string" &&
    typeof process.env.AUTHENTIK_CLIENT_SECRET === "string" &&
    typeof process.env.AUTHENTIK_TOKEN_ENDPOINT === "string" &&
    typeof process.env.AUTHENTIK_AUTHORIZATION_URL === "string" &&
    typeof process.env.AUTHENTIK_USERINFO_ENDPOINT === "string",
  strategyName: "authentik",
  useEmailAsIdentity: true,
  serverURL: process.env.SITE_URL || "",
  clientId: process.env.AUTHENTIK_CLIENT_ID || "",
  clientSecret: process.env.AUTHENTIK_CLIENT_SECRET || "",
  authCollection: "users",
  tokenEndpoint: process.env.AUTHENTIK_TOKEN_ENDPOINT || "",
  scopes: [
    "openid",
    "profile",
    "email",
    "offline_access",
  ],
  providerAuthorizationUrl: process.env.AUTHENTIK_AUTHORIZATION_URL || "",
  getUserInfo: async (accessToken: string) => {
    const response = await fetch(process.env.AUTHENTIK_USERINFO_ENDPOINT || "", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await response.json();

    // Split name into first name and last name
    const nameParts = user.name ? user.name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return { email: user.email, sub: user.sub, firstName, lastName };
  },
  successRedirect: () => {
    return "/admin";
  },
  failureRedirect: (req, err) => {
    req.payload.logger.error(err);
    return "/admin/login";
  },
});