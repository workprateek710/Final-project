import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

interface WithPayments { savedPayments: unknown[] }

/** PUT /api/profile/payments/[id] — edit label, cardholderName, expiry (no card number stored) */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    const fields: Record<string, string> = {};
    for (const k of ["label", "cardholderName", "expiry"]) {
      if (body[k] !== undefined) fields[`savedPayments.$.${k}`] = String(body[k]);
    }
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email, "savedPayments._id": id },
      { $set: fields },
      { new: true }
    ).select("savedPayments").lean();
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ payments: (user as unknown as WithPayments).savedPayments });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

/** DELETE /api/profile/payments/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { savedPayments: { _id: id } } },
      { new: true }
    ).select("savedPayments").lean();
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ payments: (user as unknown as WithPayments).savedPayments });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
