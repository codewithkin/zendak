import { AppError } from "../../lib/errors";
import { signToken } from "../../lib/jwt";
import { hashPassword, verifyPassword } from "../../lib/password";
import type { LoginInput, SignupInput } from "./auth.schema";
import { authRepository } from "./auth.repository";

export const authService = {
	async signup(input: SignupInput) {
		const existing = await authRepository.findByEmail(input.email);
		if (existing) {
			throw AppError.conflict("Email already registered");
		}

		const hashed = await hashPassword(input.password);
		const user = await authRepository.createUser({
			email: input.email,
			password: hashed,
			name: input.name,
			role: input.role as "ADMIN" | "ACCOUNTANT" | "OPERATIONS" | "DRIVER" | undefined,
		});

		const token = await signToken({
			sub: user.id,
			email: user.email,
			role: user.role,
		});

		return { user, token };
	},

	async login(input: LoginInput) {
		const user = await authRepository.findByEmail(input.email);
		if (!user) {
			throw AppError.unauthorized("Invalid email or password");
		}

		if (!user.active) {
			throw AppError.forbidden("Account is deactivated");
		}

		const valid = await verifyPassword(user.password, input.password);
		if (!valid) {
			throw AppError.unauthorized("Invalid email or password");
		}

		const token = await signToken({
			sub: user.id,
			email: user.email,
			role: user.role,
		});

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
			token,
		};
	},

	async me(userId: string) {
		const user = await authRepository.findById(userId);
		if (!user) {
			throw AppError.notFound("User not found");
		}
		return user;
	},
};
