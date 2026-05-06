import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface WithPayments { savedPayments: unknown[] }

function inferCardType(num: string): string {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (n.startsWith("6")) return "discover";
  return "card";
}

/** PUT /api/profile/payments/[id] — edit label, cardholderName, expiry (no card number stored) */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    const paymentId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    const fields: Record<string, string> = {};
    for (const k of ["label", "cardholderName", "expiry"]) {
      if (body[k] !== undefined) fields[`savedPayments.$.${k}`] = String(body[k]);
    }
    const rawCard = String(body.cardNumber ?? "").replace(/\D/g, "");
    if (rawCard.length >= 4) {
      fields["savedPayments.$.cardLast4"] = rawCard.slice(-4);
      fields["savedPayments.$.cardType"] = inferCardType(rawCard);
    }
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email, "savedPayments._id": paymentId },
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
    const paymentId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { savedPayments: { _id: paymentId } } },
      { new: true }
    ).select("savedPayments").lean();
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ payments: (user as unknown as WithPayments).savedPayments });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
