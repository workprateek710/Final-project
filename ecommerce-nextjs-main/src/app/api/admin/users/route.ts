import User from "@/libs/models/User";
import Purchase from "@/libs/models/Purchase";
import ProductRating from "@/libs/models/ProductRating";
import { requireAdminSession } from "@/libs/adminAuth";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin-only: remove a storefront user and their purchase/rating rows (same userId string as checkout).
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) return NextResponse.json({ message: "email required" }, { status: 400 });

    const adminEmail = session.user.email.toLowerCase();
    if (email === adminEmail) {
      return NextResponse.json({ message: "You cannot delete the account you are logged in with." }, { status: 400 });
    }

    await connectMongoDB();
    const removed = await User.findOneAndDelete({ email });
    if (!removed) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const activityUserId = String(removed.email ?? email).trim().toLowerCase();
    await Promise.all([
      Purchase.deleteMany({ userId: activityUserId }),
      ProductRating.deleteMany({ userId: activityUserId }),
    ]);

    return NextResponse.json({ message: "User deleted." });
  } catch (e) {
    return NextResponse.json({ message: String(e) }, { status: 500 });
  }
}
