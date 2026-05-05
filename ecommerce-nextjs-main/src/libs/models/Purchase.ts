import { model, models, Schema } from "mongoose";

/**
 * One row = one purchase signal for recommendations and trending analytics.
 * userId matches `localStorage` "user" string used on the storefront checkout.
 */
const purchaseSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    prodId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

const Purchase = models.Purchase || model("Purchase", purchaseSchema);

export default Purchase;
