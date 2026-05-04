import { model, models, Schema } from "mongoose";

const productRatingSchema = new Schema(
  {
    prodId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

productRatingSchema.index({ prodId: 1, userId: 1 }, { unique: true });

const ProductRating =
  models.ProductRating || model("ProductRating", productRatingSchema);

export default ProductRating;
