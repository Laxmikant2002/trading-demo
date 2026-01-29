import mongoose, { Schema, Document } from "mongoose";

export interface IAsset extends Document {
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  lastUpdated: Date;
}

const AssetSchema: Schema = new Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model<IAsset>("Asset", AssetSchema);
