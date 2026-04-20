import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  truckId: string | null;
  driverId: string | null;
  createdAt: string;
  truck?: { plateNumber: string } | null;
  driver?: { user: { name: string } } | null;
  reporter?: { name: string } | null;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  severity: IssueSeverity;
  truckId?: string;
  driverId?: string;
}

export function useIssues() {
  return useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const { data } = await apiClient.http.get<Issue[]>("/api/issues");
      return data;
    },
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateIssueInput) => {
      const { data } = await apiClient.http.post<Issue>("/api/issues", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}
