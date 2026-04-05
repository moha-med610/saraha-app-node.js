import mongoose, { Schema, Types, model } from "mongoose";

const messageSchema = new Schema(
  {
    body: {
      type: String,
      required: function () {
        if (!this.attachments || this.attachments.length === 0) {
          return true;
        } else {
          return false;
        }
      },
    },
    attachments: [
      {
        type: String,
      },
    ],
    receivedUserId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    strict: true,
    strictQuery: true,
    validateBeforeSave: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  },
);

messageSchema.index({ receivedUserId: 1 });

export const Messages =
  mongoose.models.Message || model("Message", messageSchema);
