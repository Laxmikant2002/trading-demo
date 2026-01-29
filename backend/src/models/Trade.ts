import mongoose, { Schema, Document } from "mongoose";

export interface ITrade extends Document {
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  type: string;
  timestamp: Date;
}

const TradeSchema: Schema = new Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ITrade>("Trade", TradeSchema);
