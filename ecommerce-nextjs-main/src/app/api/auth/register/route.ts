import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    await connectMongoDB();
    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, name: name || email.split("@")[0], passwordHash });

    return NextResponse.json({ message: "Account created. You can sign in now." });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 400 });
  }
}
