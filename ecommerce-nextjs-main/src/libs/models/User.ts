import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name:         { type: String, default: "" },
    passwordHash: { type: String, required: true },
    // profile fields
    phone:        { type: String, default: "" },
    bio:          { type: String, default: "" },
    // shipping / saved address
    address:      { type: String, default: "" },
    city:         { type: String, default: "" },
    zip:          { type: String, default: "" },
    country:      { type: String, default: "" },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);

export default User;
