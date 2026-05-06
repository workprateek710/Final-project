import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

interface WithPayments { savedPayments: unknown[] }

function inferCardType(num: string): string {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (n.startsWith("6")) return "discover";
  return "card";
}

/** GET /api/profile/payments?email=xxx */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    await connectMongoDB();
    const user = await User.findOne({ email }).select("savedPayments").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ payments: (user as unknown as WithPayments).savedPayments ?? [] });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

function normalizeCvv(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "").slice(0, 4);
}

/** POST /api/profile/payments — add payment (demo: may store CVV — do not use real cards) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    const rawCard = String(body.cardNumber ?? "").replace(/\s/g, "");
    const cardLast4 = rawCard.slice(-4);
    const cvv = normalizeCvv(body.cvv);
    const entry = {
      label:          String(body.label          ?? "My Card"),
      cardholderName: String(body.cardholderName ?? ""),
      cardLast4,
      expiry:         String(body.expiry         ?? ""),
      cvv,
      cardType:       inferCardType(rawCard),
    };
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $push: { savedPayments: entry } },
      { new: true }
    ).select("savedPayments").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ payments: (user as unknown as WithPayments).savedPayments });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
