import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogListLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-2xl p-4 space-y-3 bg-white">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountSectionLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-2xl border p-5 md:p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderDetailLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-9 w-72" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 space-y-3">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-white border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
