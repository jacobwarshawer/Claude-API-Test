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
    const tools = [{ type: "web_search_20260209", name: "web_search" }];
    const messages = [{ role: "user", content: prompt }];

    let response;
    do {
      response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        tools,
        messages,
      });

      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
      }
    } while (response.stop_reason === "pause_turn");

    const textBlocks = response.content.filter((b) => b.type === "text");
    const text = textBlocks[textBlocks.length - 1]?.text ?? "";
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
