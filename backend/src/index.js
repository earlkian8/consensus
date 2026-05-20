import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// routes
app.use("/api", apiRouter);

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
