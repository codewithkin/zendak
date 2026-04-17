import { AppError } from "../../lib/errors";
import { sendInviteEmail } from "../../lib/mailer";
import { hashPassword } from "../../lib/password";
import { generateReadablePassword } from "../../lib/password-generator";
import { authRepository } from "../auth/auth.repository";
import type { InviteUserInput } from "./users.schema";
import { usersRepository } from "./users.repository";

export const usersService = {
	async findAll(adminId: string) {
		const admin = await authRepository.findById(adminId);
		if (!admin) {
			throw AppError.notFound("Admin not found");
		}
		if (!admin.businessId) {
			throw AppError.badRequest("Complete workspace onboarding before managing users");
		}
		return usersRepository.findAllByBusinessId(admin.businessId);
	},

	async invite(adminId: string, input: InviteUserInput) {
		const admin = await authRepository.findById(adminId);
		if (!admin) {
			throw AppError.notFound("Admin not found");
		}
		if (!admin.businessId) {
			throw AppError.badRequest("Complete workspace onboarding before inviting users");
		}

		const existing = await authRepository.findByEmail(input.email);
		if (existing) {
			throw AppError.conflict("A user with this email already exists");
		}

		const business = await usersRepository.findBusinessById(admin.businessId);
		const workspaceName = business?.name ?? "Zendak";

		const plainPassword = generateReadablePassword();
		const hashed = await hashPassword(plainPassword);

		const user = await usersRepository.createInvitedUser({
			email: input.email,
			name: input.name,
			password: hashed,
			role: input.role,
			businessId: admin.businessId,
		});

		await sendInviteEmail({
			to: input.email,
			recipientName: input.name,
			adminName: admin.name,
			workspaceName,
			temporaryPassword: plainPassword,
		});

		return user;
	},
};
