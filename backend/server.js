import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from .env automatically

app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Claude API call failed: " + err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
