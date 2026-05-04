import User from "@/libs/models/User";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

interface WithAddresses { savedAddresses: unknown[] }

/** PUT /api/profile/addresses/[id] — edit address */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    const fields: Record<string, string> = {};
    for (const k of ["label", "name", "address", "city", "zip", "country"]) {
      if (body[k] !== undefined) fields[`savedAddresses.$.${k}`] = String(body[k]);
    }
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email, "savedAddresses._id": id },
      { $set: fields },
      { new: true }
    ).select("savedAddresses").lean();
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ addresses: (user as unknown as WithAddresses).savedAddresses });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}

/** DELETE /api/profile/addresses/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { savedAddresses: { _id: id } } },
      { new: true }
    ).select("savedAddresses").lean();
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ addresses: (user as unknown as WithAddresses).savedAddresses });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
