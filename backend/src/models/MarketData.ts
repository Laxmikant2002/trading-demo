import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface IMarketData extends Model {
  id: number;
  symbol: string;
  price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h?: number;
  timestamp: Date;
  ma_20?: number;
  ma_50?: number;
  rsi_14?: number;
  isDelayed: boolean;
}

const MarketData = sequelize.define<IMarketData>(
  "MarketData",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    change_24h: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    high_24h: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    low_24h: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    volume_24h: {
      type: DataTypes.DECIMAL(30, 8),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ma_20: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    ma_50: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
    rsi_14: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    isDelayed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "market_data",
    indexes: [
      {
        unique: true,
        fields: ["symbol", "timestamp"],
      },
      {
        fields: ["symbol", "timestamp"],
      },
    ],
  },
);

export default MarketData;
