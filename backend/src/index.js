import "dotenv/config";
import express from "express";
import { supabase } from "./shared/database/supabase.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

/*
/api
*/

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});