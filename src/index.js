import dotenv from "dotenv";
import database from "./db/index.js";
import app from "./app.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await database.connect();
    app.listen(port, () => {
      console.log(`⚙️ Server is running at port: ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
