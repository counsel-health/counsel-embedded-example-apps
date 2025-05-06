import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "lucide-react";

export default function CounselLoading() {
  return (
    <div className="relative py-4 flex flex-col gap-y-3 w-full h-full items-center justify-start">
      <Skeleton className="h-full w-[calc(100%-200px)] rounded-xl" />
      <LoaderCircle className="w-8 h-8 text-neutral-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
