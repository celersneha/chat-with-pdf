import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

export const useUploadFile = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = await getToken();
      const api = axiosInstance(token ?? undefined);
      return api.post("/api/files/upload", formData);
    },
    onSuccess: () => {
      toast("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: any) => {
      toast(error?.data?.error || "File upload failed");
    },
  });
};
