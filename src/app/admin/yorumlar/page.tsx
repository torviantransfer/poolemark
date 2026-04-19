import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/helpers";
import { Star } from "lucide-react";
import { ReviewApproveToggle } from "@/components/admin/review-approve-toggle";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { ReviewReplyForm } from "@/components/admin/review-reply-form";

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = params.filter || "all";

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*, user:users!user_id(first_name, last_name), product:products!product_id(name, slug)")
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("is_approved", false);
  if (filter === "approved") query = query.eq("is_approved", true);

  const { data: reviews } = await query;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yorumlar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ürün yorumlarını yönetin
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { value: "all", label: "Tümü" },
          { value: "pending", label: "Onay Bekliyor" },
          { value: "approved", label: "Onaylı" },
        ].map((f) => (
          <a
            key={f.value}
            href={`/admin/yorumlar?filter=${f.value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground/70 hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${!review.is_approved ? "border-amber-200" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm">
                      {review.user?.first_name} {review.user?.last_name}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {!review.is_approved && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Onay Bekliyor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    <a href={`/products/${review.product?.slug}`} target="_blank" className="text-primary hover:underline">
                      {review.product?.name}
                    </a>
                    {" · "}
                    {formatDate(review.created_at)}
                  </p>
                  <p className="text-sm text-foreground/80">{review.comment}</p>
                  <ReviewReplyForm reviewId={review.id} existingReply={review.admin_reply ?? null} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ReviewApproveToggle id={review.id} isApproved={review.is_approved} />
                  <AdminDeleteButton id={review.id} table="reviews" label="Yorum" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm p-16 text-center text-muted-foreground">
            <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
            {filter === "pending" ? "Onay bekleyen yorum yok" : "Henüz yorum yok"}
          </div>
        )}
      </div>
    </div>
  );
}
