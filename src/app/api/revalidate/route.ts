import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { paths } = await request.json();

    if (Array.isArray(paths)) {
      for (const path of paths) {
        if (typeof path === "string") {
          revalidatePath(path);
        }
      }
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Revalidation başarısız." }, { status: 500 });
  }
}
