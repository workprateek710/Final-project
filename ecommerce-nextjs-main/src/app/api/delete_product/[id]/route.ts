import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectMongoDB();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product Deleted Successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
