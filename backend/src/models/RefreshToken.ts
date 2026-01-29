import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { IUser } from "./User";

export interface IRefreshToken extends Model {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
}

const RefreshToken = sequelize.define<IRefreshToken>(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "refresh_tokens",
  },
);

// Import User here to avoid circular dependency
import User from "./User";
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

export default RefreshToken;
