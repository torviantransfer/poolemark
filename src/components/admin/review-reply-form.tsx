"use client";

import { useState } from "react";
import { MessageSquareReply } from "lucide-react";

interface Props {
  reviewId: string;
  existingReply: string | null;
}

export function ReviewReplyForm({ reviewId, existingReply }: Props) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(existingReply ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reviewId, admin_reply: reply }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
    }
  }

  return (
    <div className="mt-3">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <MessageSquareReply className="h-3.5 w-3.5" />
          {existingReply ? "Cevabı Düzenle" : "Cevap Yaz"}
        </button>
      )}

      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Müşteriye cevap yazın..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-4 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
            </button>
            <button
              onClick={() => { setOpen(false); setReply(existingReply ?? ""); }}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              İptal
            </button>
            {reply && (
              <button
                onClick={() => setReply("")}
                className="h-8 px-3 text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Cevabı Sil
              </button>
            )}
          </div>
        </div>
      )}

      {!open && existingReply && (
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-800">
          <span className="font-semibold text-xs text-blue-600 block mb-0.5">PooleMark cevabı:</span>
          {existingReply}
        </div>
      )}
    </div>
  );
}
