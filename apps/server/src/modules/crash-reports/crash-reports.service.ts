import { AppError } from "../../lib/errors";

type CrashSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type CrashReportStatus = "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
import type { AuthUser } from "../../types";
import { notificationsService } from "../notifications/notifications.service";
import { crashReportsRepository } from "./crash-reports.repository";

export const crashReportsService = {
	async create(
		user: AuthUser,
		businessId: string,
		data: {
			truckId: string;
			tripId?: string;
			description: string;
			severity: CrashSeverity;
			location?: string;
			photos: { key: string; url: string; sizeBytes: number }[];
		},
	) {
		const driverId = await crashReportsRepository.getDriverIdFromUserId(user.id);
		if (!driverId) throw AppError.forbidden("Only drivers can submit crash reports");

		const report = await crashReportsRepository.create({
			driverId,
			truckId: data.truckId,
			tripId: data.tripId,
			description: data.description,
			severity: data.severity,
			location: data.location,
			photos: data.photos.map((p) => ({
				url: p.url,
				s3Key: p.key,
				sizeBytes: BigInt(p.sizeBytes),
			})),
		});

		// Track storage
		const totalBytes = data.photos.reduce((sum, p) => sum + BigInt(p.sizeBytes), 0n);
		if (totalBytes > 0n) {
			crashReportsRepository.incrementBusinessStorage(businessId, totalBytes).catch(() => {});
		}

		// Notify admins and operations
		notificationsService
			.notifyByRole({
				businessId,
				roles: ["ADMIN", "OPERATIONS"],
				title: "New crash report",
				message: `${user.email} submitted a ${data.severity.toLowerCase()} severity crash report`,
				type: "crash_report",
				metadata: { crashReportId: report.id, severity: data.severity },
			})
			.catch(() => {});

		return report;
	},

	async list(
		user: AuthUser,
		opts: {
			page: number;
			limit: number;
			status?: CrashReportStatus;
			severity?: CrashSeverity;
		},
	) {
		// Drivers see only their own
		let driverId: string | undefined;
		if (user.role === "DRIVER") {
			driverId = await crashReportsRepository.getDriverIdFromUserId(user.id);
			if (!driverId) throw AppError.forbidden("Driver profile not found");
		}

		return crashReportsRepository.list({ ...opts, driverId });
	},

	async getById(id: string) {
		const report = await crashReportsRepository.findById(id);
		if (!report) throw AppError.notFound("Crash report not found");
		return report;
	},

	async updateStatus(id: string, status: CrashReportStatus, businessId: string) {
		const report = await crashReportsRepository.findById(id);
		if (!report) throw AppError.notFound("Crash report not found");

		const updated = await crashReportsRepository.updateStatus(id, status);

		// Notify the driver about status change
		notificationsService
			.notifyUser({
				userId: report.driver.userId,
				title: "Crash report updated",
				message: `Your crash report status has been changed to ${status.toLowerCase().replace("_", " ")}`,
				type: "crash_report_status",
				metadata: { crashReportId: id, status },
			})
			.catch(() => {});

		return updated;
	},
};
