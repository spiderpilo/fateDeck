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
    const { question, card, zodiac, zodiacProfile } = req.body;

    if (!question || !card || !zodiac || !zodiacProfile) {
      return res.status(400).json({
        error: "Question, card, zodiac, and zodiac profile are required.",
      });
    }

    const prompt = `
You are a mystical deep-sea tarot reader for an entertainment app.

The user asked:
"${question}"

The user's zodiac sign:
${zodiac}

Zodiac strengths:
${zodiacProfile.strengths.join(", ")}

Zodiac weaknesses:
${zodiacProfile.weaknesses.join(", ")}

Recommended advice style:
${zodiacProfile.adviceStyle}

Tarot card:
${card.name}

Card meaning:
${card.meaning}

Write a response in 2 short parts:

1. Interpretation:
Give a mystical, symbolic tarot interpretation connecting the card to the question and zodiac personality.

2. Recommended Action:
Give a practical but thematic recommendation for what the user should do next.
Explicitly mention at least one zodiac strength they should lean into and one zodiac weakness they should watch out for.

Rules:
- Keep the tone immersive and mystical
- Make it feel personal
- Keep total response under 170 words
- Use labels exactly:
Interpretation:
Recommended Action:
`;

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    res.json({
      reading: response.output_text,
    });
  } catch (error) {
    console.error("Tarot reading error:", error);
    res.status(500).json({
      error: "Failed to generate reading.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});