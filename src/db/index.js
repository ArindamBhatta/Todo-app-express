import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

class ConnectDB {
  static instance = null;
  isConnected = false;

  constructor() {
    if (ConnectDB.instance) {
      return ConnectDB.instance;
    }
    ConnectDB.instance = this;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log("Database is already connected");
      return;
    }
    try {
      const connection = await mongoose.connect(
        `${process.env.MONGODB_URI}/${DB_NAME}`,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      );
      this.isConnected = true;
      console.log(
        `🚀 MongoDB connected! DB HOST: ${connection.connection.host}`,
      );
      console.log("Database connected successfully");
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    }
  }
}

const database = new ConnectDB();
export default database;
