import { Schema, model } from "mongoose";

const accessSchema = new Schema({
    userAgent: String,
    cookies: String,
    ip: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Access = model("Access", accessSchema);

export async function findAccessById(id) {
  return await Access.findById(id);
}

export async function findAccessByUser(user) {
  return await Access.find({ user: user });
}