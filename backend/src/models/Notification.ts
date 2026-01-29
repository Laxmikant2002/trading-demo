import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface INotification extends Model {
  id: number;
  userId: number;
  type:
    | "trade_confirmation"
    | "balance_alert"
    | "price_alert"
    | "margin_call"
    | "system";
  title: string;
  message: string;
  data?: any;
  channels: ("in_app" | "email" | "sms" | "push")[];
  isRead: boolean;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Notification = sequelize.define<INotification>(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "trade_confirmation",
        "balance_alert",
        "price_alert",
        "margin_call",
        "system",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    channels: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["in_app"],
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    indexes: [
      {
        fields: ["userId", "isRead"],
      },
      {
        fields: ["userId", "createdAt"],
      },
      {
        fields: ["type"],
      },
    ],
  },
);

export default Notification;
