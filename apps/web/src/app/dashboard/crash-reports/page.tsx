"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@zendak/ui/components/badge";
import { Button } from "@zendak/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@zendak/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@zendak/ui/components/select";
import { Skeleton } from "@zendak/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@zendak/ui/components/table";
import { Alert01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@zendak/ui/components/icon";

import { useCrashReports, type CrashReport } from "@/hooks/use-crash-reports";

const severityVariant: Record<CrashReport["severity"], "default" | "secondary" | "warning" | "destructive"> = {
	LOW: "secondary",
	MEDIUM: "default",
	HIGH: "warning",
	CRITICAL: "destructive",
};

const statusVariant: Record<CrashReport["status"], "default" | "secondary" | "success" | "outline"> = {
	SUBMITTED: "default",
	UNDER_REVIEW: "secondary",
	RESOLVED: "success",
	DISMISSED: "outline",
};

const STATUSES: CrashReport["status"][] = ["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];

export default function CrashReportsPage() {
	const { reports, total, isLoading, fetchReports, updateStatus } = useCrashReports();
	const [statusFilter, setStatusFilter] = useState<string>("all");

	useEffect(() => {
		fetchReports(statusFilter === "all" ? {} : { status: statusFilter });
	}, [fetchReports, statusFilter]);

	const handleStatusChange = async (reportId: string, newStatus: CrashReport["status"]) => {
		try {
			await updateStatus(reportId, newStatus);
			toast.success("Status updated");
		} catch {
			toast.error("Failed to update status");
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4 p-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
						<Icon icon={Alert01Icon} size={20} className="text-destructive" />
					</div>
					<div>
						<h1 className="text-lg font-semibold text-foreground">Crash Reports</h1>
						<p className="text-xs text-muted-foreground">{total} total reports</p>
					</div>
				</div>

				<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
					<SelectTrigger className="w-44">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						{STATUSES.map((s) => (
							<SelectItem key={s} value={s}>
								{s.replace("_", " ")}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Reports</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Driver</TableHead>
								<TableHead>Truck</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Severity</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Photos</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reports.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
										No crash reports found
									</TableCell>
								</TableRow>
							) : (
								reports.map((report) => (
									<TableRow key={report.id}>
										<TableCell className="font-medium">
											{report.driver?.user?.name ?? "Unknown"}
										</TableCell>
										<TableCell>{report.truck?.plateNumber ?? "—"}</TableCell>
										<TableCell className="max-w-[200px] truncate">
											{report.description}
										</TableCell>
										<TableCell>
											<Badge variant={severityVariant[report.severity]}>
												{report.severity}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={statusVariant[report.status]}>
												{report.status.replace("_", " ")}
											</Badge>
										</TableCell>
										<TableCell>{report.photos.length}</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(report.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<Select
												value={report.status}
												onValueChange={(v) => {
													if (v) handleStatusChange(report.id, v as CrashReport["status"]);
												}}
											>
												<SelectTrigger className="h-8 w-36 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{STATUSES.map((s) => (
														<SelectItem key={s} value={s}>
															{s.replace("_", " ")}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
