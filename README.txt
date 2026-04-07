# Arkenza Health AI Backend

## Render kurulum
1. Bu klasörü GitHub'a yükle.
2. Render'da **New > Web Service** seç.
3. Repo'yu bağla.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variable ekle:
   - `GEMINI_API_KEY` = senin Gemini API anahtarın
7. Deploy bitince şu endpoint oluşur:
   - `https://senin-servisin.onrender.com/analyze-health-photo`

## HTML tarafında
Sağlık bölümündeki **Gemini Backend URL** alanına şunu yaz:
`https://senin-servisin.onrender.com/analyze-health-photo`
