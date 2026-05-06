import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function verifyCurrentPassword(plain: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

/** POST /api/profile/password — change password for email/password accounts */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new passwords are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ message: "New password must differ from your current password." }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email }).lean();
    if (!user || Array.isArray(user)) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const doc = user as { passwordHash?: string };
    if (!doc.passwordHash) {
      return NextResponse.json(
        { message: "This account does not use a password. Sign in with Google or contact support." },
        { status: 400 }
      );
    }

    const currentOk = await verifyCurrentPassword(currentPassword, doc.passwordHash);
    if (!currentOk) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { $set: { passwordHash } });

    return NextResponse.json({ message: "Password updated." });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
