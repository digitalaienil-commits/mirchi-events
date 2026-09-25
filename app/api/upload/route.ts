import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { savePoster } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  try {
    return NextResponse.json({ url: await savePoster(file) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
