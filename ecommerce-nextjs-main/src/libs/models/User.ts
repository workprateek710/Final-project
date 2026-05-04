import { model, models, Schema } from "mongoose";

const addressSchema = new Schema({
  label:   { type: String, default: "Home" },
  name:    { type: String, default: "" },
  address: { type: String, default: "" },
  city:    { type: String, default: "" },
  zip:     { type: String, default: "" },
  country: { type: String, default: "" },
});

const paymentSchema = new Schema({
  label:          { type: String, default: "My Card" },
  cardholderName: { type: String, default: "" },
  cardLast4:      { type: String, default: "" },
  expiry:         { type: String, default: "" },
  cardType:       { type: String, default: "card" }, // visa | mastercard | amex | card
});

const userSchema = new Schema(
  {
    email:          { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name:           { type: String, default: "" },
    passwordHash:   { type: String, required: true },
    phone:          { type: String, default: "" },
    bio:            { type: String, default: "" },
    // legacy single address kept for backward compat
    address:        { type: String, default: "" },
    city:           { type: String, default: "" },
    zip:            { type: String, default: "" },
    country:        { type: String, default: "" },
    // multi-address / multi-payment
    savedAddresses: { type: [addressSchema], default: [] },
    savedPayments:  { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
export default User;
