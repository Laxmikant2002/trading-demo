import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>("Order", OrderSchema);
