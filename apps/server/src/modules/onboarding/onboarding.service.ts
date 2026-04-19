import { TRIAL_DAYS } from "@zendak/plans";

import { AppError } from "../../lib/errors";
import type { OnboardingInput } from "./onboarding.schema";
import { onboardingRepository } from "./onboarding.repository";
import { authRepository } from "../auth/auth.repository";

export const onboardingService = {
	async onboard(userId: string, input: OnboardingInput) {
		const user = await authRepository.findById(userId);
		if (!user) {
			throw AppError.notFound("User not found");
		}

		if (user.role !== "ADMIN") {
			throw AppError.forbidden("Only admin users can complete onboarding");
		}

		if (user.onboardedAt) {
			throw AppError.conflict("Onboarding already completed");
		}

		const trialEndsAt = new Date();
		trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

		const business = await onboardingRepository.createBusiness({
			name: input.businessName,
			location: input.location,
			truckCount: input.truckCount,
			employeeCount: input.employeeCount,
			phone: input.phone,
			ownerId: userId,
			trialEndsAt,
		});

		const updatedUser = await onboardingRepository.markUserOnboarded(userId, business.id);

		return { user: updatedUser, business };
	},
};
