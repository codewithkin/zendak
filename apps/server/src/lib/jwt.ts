import { env } from "@zendak/env/server";
import { SignJWT, jwtVerify } from "jose";

import type { Role } from "../types";

export interface JwtPayload {
	sub: string;
	email: string;
	role: Role;
}

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = "zendak";
const EXPIRATION = "7d";

export async function signToken(payload: JwtPayload): Promise<string> {
	return new SignJWT({ email: payload.email, role: payload.role })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(payload.sub)
		.setIssuer(ISSUER)
		.setIssuedAt()
		.setExpirationTime(EXPIRATION)
		.sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
	const { payload } = await jwtVerify(token, secret, { issuer: ISSUER });
	return {
		sub: payload.sub as string,
		email: payload.email as string,
		role: payload.role as Role,
	};
}
