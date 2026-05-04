import Product from "@/libs/models/Product";
import { connectMongoDB } from "@/libs/MongoConnect";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectMongoDB();
    await Product.findByIdAndUpdate(id, {
      name: body.name,
      category: body.category,
      price: body.price,
      ...(body.imgSrc !== undefined && { imgSrc: body.imgSrc }),
      ...(body.fileKey !== undefined && { fileKey: body.fileKey }),
      ...(body.subcategory !== undefined && { subcategory: body.subcategory }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.brand !== undefined && { brand: body.brand }),
    });
    return NextResponse.json({ message: "Product Updated Successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Something Went Wrong" },
      { status: 400 }
    );
  }
}
