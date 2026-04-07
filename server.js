import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Arkenza AI çalışıyor" });
});

app.post("/analyze-health-photo", async (req, res) => {
  try {
    const { imageBase64, mimeType, selectedIssue, note } = req.body;

    const prompt = `
Büyükbaş hayvan sağlığı değerlendirmesi yap.
Kesin tanı koyma.

Belirti: ${selectedIssue}
Not: ${note}

Kısa ve net yaz:
- Risk
- Olası durum
- İlk müdahale
- İzleme
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Yorum yok";

    res.json({ result: text });

  } catch (e) {
    res.status(500).json({ error: "AI hata verdi" });
  }
});

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
