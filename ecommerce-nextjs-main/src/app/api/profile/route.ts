import User from "@/libs/models/User";
import Purchase from "@/libs/models/Purchase";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

const SAFE_FIELDS = "email name phone bio address city zip country createdAt";

/** GET /api/profile?email=xxx */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    await connectMongoDB();
    const user = await User.findOne({ email }).select(SAFE_FIELDS).lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

/** PUT /api/profile  — update profile fields */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });

    const allowed = ["name", "phone", "bio", "address", "city", "zip", "country"];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = String(body[key]);
    }

    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    ).select(SAFE_FIELDS).lean();

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "Profile updated", user });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

/** DELETE /api/profile  — delete account + purchase history */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    if (body.confirm !== "DELETE") {
      return NextResponse.json({ message: "Send confirm: 'DELETE' to proceed" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOneAndDelete({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await Purchase.deleteMany({ userId: email });
    return NextResponse.json({ message: "Account and purchase history deleted." });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
