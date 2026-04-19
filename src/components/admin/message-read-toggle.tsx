"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Circle } from "lucide-react";

export function MessageReadToggle({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("contact_messages").update({ is_read: !isRead }).eq("id", id);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isRead
          ? "text-green-600 hover:bg-green-50"
          : "text-muted-foreground hover:bg-secondary"
      }`}
      title={isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
    >
      {isRead ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
    </button>
  );
}
