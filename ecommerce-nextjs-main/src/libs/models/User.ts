import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);

export default User;
