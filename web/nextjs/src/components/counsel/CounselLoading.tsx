import { Skeleton } from "@/components/ui/skeleton";

export default function CounselLoading() {
  return (
    <div className="relative py-4 flex flex-col gap-y-3 w-full h-full items-center justify-start">
      <Skeleton className="h-full w-[calc(100%-200px)] rounded-xl" />
    </div>
  );
}
