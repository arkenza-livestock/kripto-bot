import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 10000;

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "Arkenza Health AI Backend",
    endpoint: "/analyze-health-photo"
  });
});

app.post("/analyze-health-photo", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY tanımlı değil." });
    }

    const { imageBase64, mimeType, selectedIssue, note } = req.body || {};

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Görsel verisi eksik." });
    }

    const prompt = `
Sen büyükbaş hayvan sağlığı için çalışan yardımcı bir AI'sın.
Kesin tanı koyma. Veteriner yerine geçme.

Kullanıcının seçtiği belirti/hastalık: ${selectedIssue || "Belirtilmedi"}
Ek not: ${note || "Yok"}

Görevin:
- Risk düzeyi
- Olası durum
- İlk yapılacak güvenli adım
- İzlenecek belirtiler
- Resmi veteriner gerekip gerekmediği

Yanıtı SADECE şu JSON formatında ver:
{
  "risk": "...",
  "possible_issue": "...",
  "first_action": "...",
  "watch": "...",
  "official_help": "...",
  "note": "Bu çıktı tanı değildir."
}

Şarbon, şap, brusella gibi ciddi şüphelerde:
- izolasyon
- resmi veteriner bildirimi
- hayvan/karkasa uygunsuz müdahale etmeme
vurgusunu güçlü yap.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini isteği başarısız.",
        detail: data
      });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        risk: "Bilinmiyor",
        possible_issue: rawText,
        first_action: "Veteriner değerlendirmesi önerilir.",
        watch: "Genel durum izlenmeli.",
        official_help: "Gerekebilir",
        note: "Bu çıktı tanı değildir."
      };
    }

    return res.json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: "Sunucu hatası",
      detail: String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: ${PORT}`);
});
