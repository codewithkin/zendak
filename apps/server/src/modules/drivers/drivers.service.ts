import { AppError } from "../../lib/errors";
import { hashPassword } from "../../lib/password";
import { authRepository } from "../auth/auth.repository";
import type { CreateDriverInput, UpdateDriverInput } from "./drivers.schema";
import { driversRepository } from "./drivers.repository";

export const driversService = {
	async create(input: CreateDriverInput) {
		const existingEmail = await authRepository.findByEmail(input.email);
		if (existingEmail) {
			throw AppError.conflict("Email already registered");
		}

		const existingLicense = await driversRepository.findByLicenseNo(input.licenseNo);
		if (existingLicense) {
			throw AppError.conflict("License number already registered");
		}

		const hashed = await hashPassword(input.password);
		const user = await authRepository.createUser({
			email: input.email,
			password: hashed,
			name: input.name,
			role: "DRIVER",
		});

		return driversRepository.create({
			userId: user.id,
			licenseNo: input.licenseNo,
			phone: input.phone,
		});
	},

	async findAll() {
		return driversRepository.findAll();
	},

	async findById(id: string) {
		const driver = await driversRepository.findById(id);
		if (!driver) {
			throw AppError.notFound("Driver not found");
		}
		return driver;
	},

	async findByUserId(userId: string) {
		const driver = await driversRepository.findByUserId(userId);
		if (!driver) {
			throw AppError.notFound("Driver profile not found");
		}
		return driver;
	},

	async update(id: string, input: UpdateDriverInput) {
		const driver = await driversRepository.findById(id);
		if (!driver) {
			throw AppError.notFound("Driver not found");
		}

		if (input.licenseNo && input.licenseNo !== driver.licenseNo) {
			const existing = await driversRepository.findByLicenseNo(input.licenseNo);
			if (existing) {
				throw AppError.conflict("License number already registered");
			}
		}

		return driversRepository.update(id, {
			licenseNo: input.licenseNo,
			phone: input.phone,
		});
	},
};
