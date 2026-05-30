import { mcpHandler } from "@better-auth/oauth-provider";
import { type UserId, parseUserId } from "../../shared/index.ts";

export type McpAuthConfig = {
  issuer: string;
  audience: string;
  jwksUrl: string;
};

// `jwksOrigin` is where the server itself reaches its JWKS to verify tokens. It
// defaults to the public `baseURL` but should be the server's own loopback
// (e.g. http://localhost:3000) in deployments where `baseURL` is fronted by a
// dev proxy (Vite) or reverse proxy (Caddy) — verifying a token must not depend
// on a round-trip back through that proxy. issuer/audience stay public to match
// the JWT's claims.
export const deriveMcpAuthConfig = (
  baseURL: string,
  jwksOrigin: string = baseURL,
): McpAuthConfig => ({
  issuer: `${baseURL}/api/auth`,
  audience: `${baseURL}/mcp`,
  jwksUrl: `${jwksOrigin}/api/auth/jwks`,
});

export type AuthedMcpHandler = (req: Request, actor: UserId) => Promise<Response>;

export const createMcpAuthGuard =
  (config: McpAuthConfig) =>
  (handler: AuthedMcpHandler): ((req: Request) => Promise<Response>) =>
    mcpHandler(
      {
        verifyOptions: { issuer: config.issuer, audience: config.audience },
        jwksUrl: config.jwksUrl,
      },
      (req, jwt) => {
        if (typeof jwt.sub !== "string") {
          return new Response(JSON.stringify({ error: "invalid_token" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }
        return handler(req, parseUserId(jwt.sub));
      },
    );
