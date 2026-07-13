# Kumi - 日本語シャドイング練習アプリ

Aplikasi latihan berbicara bahasa Jepang dengan teknik Shadowing dan Duet Mode.

## Fitur

- **Dynamic Scenario Generator** - Generate percakapan bahasa Jepang dari topik apapun
- **Shadowing UI (Karaoke Mode)** - Tampilan teks dengan highlight sinkron
- **Duet Recording & Playback** - Rekam suara Anda dan putar bersama AI

## Tech Stack

- **Frontend**: Vue.js 3 + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + D1
- **LLM**: DeepSeek API
- **TTS**: Voicevox / Azure Neural TTS

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

### Frontend (Cloudflare Pages)
```bash
npm run build
# Upload dist/ folder to Cloudflare Pages
```

### Backend (Cloudflare Workers)
```bash
# Configure wrangler.toml with your credentials
npm run worker:deploy
```

## Environment Variables

Create a `.dev.vars` file in the worker directory:

```
DEEPSEEK_API_KEY=your_deepseek_api_key
TTS_API_KEY=your_tts_api_key
```

## Lisensi

MIT
