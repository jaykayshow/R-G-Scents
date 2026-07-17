import * as jwt from "jsonwebtoken";

export interface TokenPayload {
  sub: string;
  [key: string]: unknown;
}

/**
 * Thin wrapper around jsonwebtoken so customer and admin auth can each hold
 * their own instance, signed with their own secret. Never shared between
 * the two auth domains.
 */
export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as jwt.SignOptions["expiresIn"] });
  }

  verify<T extends TokenPayload>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
