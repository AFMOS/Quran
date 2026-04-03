# AI Chat Setup (Gemini)

## Deploy to Netlify

1. Push to GitHub and connect repo to Netlify
2. In Netlify: Site settings → Environment variables
3. Add `GEMINI_API_KEY` = your Gemini API key
4. Deploy

## Local testing

```bash
npm i -g netlify-cli
netlify dev
```

Then open http://localhost:8888

## Usage

1. Select a word or ayah on any page
2. Click "اسأل عن هذا" (Ask about this)
3. Choose اشتقاق (etymology) or تفسير (tafseer)
4. Use the input at bottom for follow-up questions
