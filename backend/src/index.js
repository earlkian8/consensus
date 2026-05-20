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

// sample post
app.post("/send", async (req, res) => {
  try {
    const { email, message } = req.body;

    // validation
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }

    const { data, error } = await supabase.from("messages").insert([
        {
          email,
          message,
        },
      ]).select().single();

    if (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.status(201).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});