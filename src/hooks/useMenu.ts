import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchMenu } from "@/services/menu";

export function useMenu() {
  const [params] = useSearchParams();
  const preview = params.get("preview") === "1";
  return useQuery({
    queryKey: ["menu", preview ? "draft" : "live"],
    queryFn: () => fetchMenu({ preview }),
    staleTime: preview ? 0 : 45_000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}
