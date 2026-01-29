import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolio extends Document {
  userId: string;
  holdings: Array<{
    symbol: string;
    quantity: number;
    averagePrice: number;
  }>;
  cash: number;
}

const PortfolioSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  holdings: [
    {
      symbol: { type: String, required: true },
      quantity: { type: Number, required: true },
      averagePrice: { type: Number, required: true },
    },
  ],
  cash: { type: Number, default: 10000 },
});

export default mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);
