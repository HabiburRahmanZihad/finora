import { Injectable } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
}

/**
 * Verifies bearer tokens minted by Better Auth's JWT plugin (running in
 * apps/web) against its JWKS endpoint, per Better Auth's own documented
 * verification approach (jose + createRemoteJWKSet).
 */
@Injectable()
export class JwtVerifierService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;

  constructor() {
    const authUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    this.issuer = authUrl;
    this.audience = authUrl;
    this.jwks = createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
  }

  async verify(token: string): Promise<AuthenticatedUser> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return this.toUser(payload);
  }

  private toUser(payload: JWTPayload): AuthenticatedUser {
    return {
      id: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
    };
  }
}
