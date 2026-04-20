"use client";
import { useCallback, useState } from "react";

import { apiClient } from "@/lib/api";

export interface CrashReport {
	id: string;
	description: string;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	status: "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
	location?: string;
	truckId: string;
	tripId?: string;
	driverId: string;
	photos: { id: string; url: string }[];
	createdAt: string;
	truck?: { plateNumber: string; model: string };
	driver?: { user: { name: string } };
}

type CrashReportStatus = CrashReport["status"];

export function useCrashReports() {
	const [reports, setReports] = useState<CrashReport[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const fetchReports = useCallback(async (params?: { status?: string; page?: number }) => {
		setIsLoading(true);
		try {
			const query = new URLSearchParams();
			if (params?.status) query.set("status", params.status);
			if (params?.page) query.set("page", String(params.page));
			const qs = query.toString();
			const data = await apiClient.get<{ items: CrashReport[]; total: number }>(
				`/api/crash-reports${qs ? `?${qs}` : ""}`,
			);
			setReports(data.items);
			setTotal(data.total);
		} catch {
			// Silently fail
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateStatus = useCallback(async (id: string, status: CrashReportStatus) => {
		await apiClient.patch(`/api/crash-reports/${id}/status`, { status });
		setReports((prev) =>
			prev.map((r) => (r.id === id ? { ...r, status } : r)),
		);
	}, []);

	return { reports, total, isLoading, fetchReports, updateStatus };
}
