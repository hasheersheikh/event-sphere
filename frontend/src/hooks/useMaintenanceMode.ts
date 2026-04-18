import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMaintenanceMode = () => {
  return useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      try {
        // Fetching from the specified cloudops config endpoint
        // const response = await axios.get("https://cloudops.com/citypuluse/me");
        
        // // Based on user description: "it will return some cofiguramation token in which under maintaince mode is be true"
        // // Adjusting to common response patterns if detailed schema isn't provided
        // const isMaintenance = response.data?.underMaintenance === true || 
        //                      response.data?.isUnderMaintenance === true ||
        //                      response.data?.maintenance?.enabled === true;
        
        return false;
      } catch (error) {
        console.error("Failed to fetch maintenance status:", error);
        // Default to false to avoid locking the site on API failure
        return false;
      }
    },
    // Refetch every 1 minute to check for updates
    refetchInterval: 60000,
    // Ensure it doesn't retry too many times on failure to avoid noise
    retry: 1,
  });
};
