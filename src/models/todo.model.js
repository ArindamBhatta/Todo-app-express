import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadLine: {
      type: Date,
      default: null,
    },
    urgencyType: {
      type: String,
      enum: [
        "urgentImportant",
        "urgentNotImportant",
        "notUrgentImportant",
        "notUrgentNotImportant",
      ],
      default: "notUrgentNotImportant",
    },
    targetedDeadLine: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model not the User schema
      required: true,
    },
  },
  { timestamps: true },
);

export const Todo = mongoose.model("Todo", todoSchema);
