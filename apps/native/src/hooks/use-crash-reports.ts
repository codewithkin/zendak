import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

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

export interface CreateCrashReportInput {
	truckId: string;
	tripId?: string;
	description: string;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	location?: string;
	photos: { url: string; s3Key: string; sizeBytes: number }[];
}

export function useCrashReports() {
	return useQuery({
		queryKey: ["crash-reports"],
		queryFn: async () => {
			const { data } = await apiClient.http.get<{ items: CrashReport[]; total: number }>(
				"/api/crash-reports",
			);
			return data;
		},
	});
}

export function useCreateCrashReport() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateCrashReportInput) => {
			const { data } = await apiClient.http.post<CrashReport>("/api/crash-reports", input);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["crash-reports"] });
		},
	});
}

export function useRequestUpload() {
	return useMutation({
		mutationFn: async (input: { filename: string; contentType: string; sizeBytes: number }) => {
			const { data } = await apiClient.http.post<{
				uploadUrl: string;
				publicUrl: string;
				key: string;
			}>("/api/uploads", input);
			return data;
		},
	});
}
