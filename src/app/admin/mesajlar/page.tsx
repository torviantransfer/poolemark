import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/helpers";
import { MessageSquare, Mail, CheckCircle } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/delete-button";
import { MessageReadToggle } from "@/components/admin/message-read-toggle";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-white/90 backdrop-blur shadow-sm px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mesajlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {messages?.length || 0} mesaj
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {unreadCount} okunmamış
              </span>
            )}
          </p>
        </div>
        <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>

      <div className="space-y-3">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-5 transition-colors ${
                !msg.is_read ? "border-primary/30 bg-accent/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {msg.email}
                    </span>
                    {msg.phone && <span>{msg.phone}</span>}
                    <span>{formatDateTime(msg.created_at)}</span>
                  </div>
                  {msg.subject && (
                    <p className="text-sm font-medium text-foreground/80 mb-1">
                      {msg.subject}
                    </p>
                  )}
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <MessageReadToggle id={msg.id} isRead={msg.is_read} />
                  <AdminDeleteButton id={msg.id} table="contact_messages" label={msg.name} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-16 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            Henüz mesaj yok
          </div>
        )}
      </div>
    </div>
  );
}
