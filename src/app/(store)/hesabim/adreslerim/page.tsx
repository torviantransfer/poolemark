"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  ChevronRight,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { TURKISH_CITIES } from "@/constants";
import type { Address } from "@/types";

export default function AddressesPage() {
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadAddresses();
  }, [user]);

  async function loadAddresses() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setCity("");
    setDistrict("");
    setNeighborhood("");
    setPostalCode("");
    setAddressLine("");
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(addr: Address) {
    setTitle(addr.title);
    setFirstName(addr.first_name);
    setLastName(addr.last_name);
    setPhone(addr.phone);
    setCity(addr.city);
    setDistrict(addr.district);
    setNeighborhood(addr.neighborhood || "");
    setPostalCode(addr.postal_code || "");
    setAddressLine(addr.address_line);
    setIsDefault(addr.is_default);
    setEditingId(addr.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      const supabase = createClient();
      const payload = {
        user_id: user.id,
        title,
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
        district,
        neighborhood: neighborhood || null,
        postal_code: postalCode || null,
        address_line: addressLine,
        is_default: isDefault,
      };

      if (isDefault) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
      }

      if (editingId) {
        await supabase.from("addresses").update(payload).eq("id", editingId);
      } else {
        await supabase.from("addresses").insert(payload);
      }

      resetForm();
      loadAddresses();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    loadAddresses();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Adreslerim</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Adreslerim</h1>
            {!showForm && (
              <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Yeni Adres
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-5 md:p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}</h2>
                <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Adres Başlığı</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ev, İş..." required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="firstName">Ad</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Select value={city} onValueChange={(v) => setCity(v ?? "")}>
                    <SelectTrigger id="city" className="mt-1">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {TURKISH_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">İlçe</Label>
                  <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Mahalle</Label>
                  <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="postalCode">Posta Kodu</Label>
                  <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="addressLine">Adres</Label>
                <Input id="addressLine" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Sokak, bina no, daire no..." required className="mt-1" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm">Varsayılan adres olarak ayarla</span>
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingId ? "Güncelle" : "Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>İptal</Button>
              </div>
            </form>
          )}

          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-2xl border p-5 relative">
                  {addr.is_default && (
                    <span className="absolute top-3 right-3 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                      Varsayılan
                    </span>
                  )}
                  <p className="font-semibold text-foreground">{addr.title}</p>
                  <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
                    <p>{addr.first_name} {addr.last_name}</p>
                    <p>{addr.address_line}</p>
                    {addr.neighborhood && <p>{addr.neighborhood}</p>}
                    <p>{addr.district}, {addr.city} {addr.postal_code}</p>
                    <p>{addr.phone}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => startEdit(addr)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:bg-red-50" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <div className="text-center py-16">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Kayıtlı adresiniz yok</h2>
              <p className="text-sm text-muted-foreground mt-1">Sipariş verebilmek için bir teslimat adresi ekleyin.</p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
