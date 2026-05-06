import { model, models, Schema } from "mongoose";

const productSchema = new Schema(
  {
    prodId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    imgSrc: { type: String, required: true },
    fileKey: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: "General" },
    price: { type: String, required: true },
    description: { type: String, default: "" },
    brand: { type: String, default: "" },
    ratingAvg: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", productSchema);

export default Product;
