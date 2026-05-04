import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

interface WithAddresses { savedAddresses: unknown[] }

/** GET /api/profile/addresses?email=xxx */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    await connectMongoDB();
    const user = await User.findOne({ email }).select("savedAddresses").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ addresses: (user as unknown as WithAddresses).savedAddresses ?? [] });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

/** POST /api/profile/addresses — add a new address */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    const entry = {
      label:   String(body.label   ?? "Home"),
      name:    String(body.name    ?? ""),
      address: String(body.address ?? ""),
      city:    String(body.city    ?? ""),
      zip:     String(body.zip     ?? ""),
      country: String(body.country ?? ""),
    };
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $push: { savedAddresses: entry } },
      { new: true }
    ).select("savedAddresses").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ addresses: (user as unknown as WithAddresses).savedAddresses });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
