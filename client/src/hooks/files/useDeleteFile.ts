import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

export const useDeleteFile = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const token = await getToken();
      const api = axiosInstance(token ?? undefined);
      await api.delete(`/api/files/delete-file/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast("File deleted successfully");
    },
    onError: (error: any) => {
      toast(error?.data?.error || "Failed to delete file");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};
