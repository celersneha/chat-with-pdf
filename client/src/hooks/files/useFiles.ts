import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

export const useFiles = () => {
  const { getToken } = useAuth();
  const query = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const token = await getToken();
      const api = axiosInstance(token ?? undefined);
      const res = await api.get("/api/files/get-files");
      return res.data.files;
    },
  });

  useEffect(() => {
    if (query.isError) {
      const error: any = query.error;
      toast(error?.data?.error || "Failed to fetch files");
    }
  }, [query.isError, query.error]);

  return query;
};
