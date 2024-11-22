import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      min: 10,
      type: String,
    },
    filePath: {
      type: String,
    },
    answer:{
      type: String,
      default: null,
    },
    replied:{
      type: Boolean,
      default: false,
    },
    onTask: {
      type: Boolean,
      default: false,
    },
    usingOnTraining: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["text", "file"],
    },
  },
  { timestamps: true }
);

export const Request = model("request", requestSchema);

export function createRequest(type, data ,user) {
  if (type === "text") {
    return Request.create({type: type, content: data, author: user ? user._id : null});
  } else {
    return Request.create({type: type, filePath: data, author: user ? user._id : null});
  }
}