import { PayloadRequest } from "payload";
import { OAuth2Plugin, defaultGetToken } from "payload-oauth2";

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
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
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
    return { email: user.email, sub: user.sub };
  },
  getToken: async (code: string, req: PayloadRequest) => {
    const redirectUri = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/users/oauth/callback`;
    const token = await defaultGetToken(
      process.env.AUTHENTIK_TOKEN_ENDPOINT || "",
      process.env.AUTHENTIK_CLIENT_ID || "",
      process.env.AUTHENTIK_CLIENT_SECRET || "",
      redirectUri,
      code,
    );
    ////////////////////////////////////////////////////////////////////////////
    // Consider this section afterToken hook
    ////////////////////////////////////////////////////////////////////////////
    req.payload.logger.info("Received token:" + token + " 👀");
    if (req.user) {
      req.payload.update({
        collection: "users",
        id: req.user.id,
        data: {},
      });
    }
    return token;
  },
  successRedirect: () => {
    return "/admin";
  },
  failureRedirect: (req, err) => {
    req.payload.logger.error(err);
    return "/admin/login";
  },
});