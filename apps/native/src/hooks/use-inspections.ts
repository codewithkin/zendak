import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export type InspectionResult = "PASS" | "FAIL" | "NEEDS_ATTENTION";

export interface InspectionReport {
  id: string;
  truckId: string;
  driverId: string;
  tires: InspectionResult;
  brakes: InspectionResult;
  lights: InspectionResult;
  fluids: InspectionResult;
  body: InspectionResult;
  overall: InspectionResult;
  notes: string | null;
  mileage: number | null;
  createdAt: string;
}

export interface CreateInspectionInput {
  truckId: string;
  tires: InspectionResult;
  brakes: InspectionResult;
  lights: InspectionResult;
  fluids: InspectionResult;
  body: InspectionResult;
  overall: InspectionResult;
  notes?: string;
  mileage?: number;
}

export function useCreateInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInspectionInput) => {
      const { data } = await apiClient.http.post<InspectionReport>("/api/inspections", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}
