import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

export const useUploadFile = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken();
      const api = axiosInstance(token ?? undefined);
      const bytes = await file.arrayBuffer();
      const buffer = Array.from(new Uint8Array(bytes));
      return api.post("/api/files/upload", {
        file: buffer,
        fileName: file.name,
        fileType: file.type,
      });
    },
    onSuccess: (data) => {
      toast("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: any) => {
      toast(error?.data?.error || "File upload failed");
    },
  });
};
