import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMaintenanceMode = () => {
  return useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      // Prioritize environment variable if set to 'true'
      if (import.meta.env.VITE_MAINTENANCE_MODE === "true") {
        return true;
      }

      try {
        // Fetching from the specified cloudops config endpoint
        // const response = await axios.get("https://cloudops.com/citypuluse/me");

        // return response.data?.underMaintenance === true;

        return true;
      } catch (error) {
        console.error("Failed to fetch maintenance status:", error);
        return false;
      }
    },
    // Refetch every 1 minute to check for updates
    refetchInterval: 60000,
    // Ensure it doesn't retry too many times on failure to avoid noise
    retry: 1,
  });
};
