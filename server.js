import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/tarot-reading", async (req, res) => {
  try {
    const { question, card } = req.body;

    if (!question || !card) {
      return res.status(400).json({
        error: "Question and card are required.",
      });
    }

    const prompt = `
You are a mystical deep-sea tarot reader.

User question:
"${question}"

Tarot card:
${card.name}

Card meaning:
${card.meaning}

Give a short mystical interpretation connecting the card to the user's question.
Keep it under 120 words.
`;

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    res.json({
      reading: response.output_text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate reading.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});