import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    await connectMongoDB();
    const doc = await Product.findOne({ slug }).lean();
    if (!doc) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
