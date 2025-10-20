<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="90" />
</p>

<h2 align="center">🧠 LLM Lab</h2>
<p align="center">
  A full-stack experimentation environment for testing and visualizing <b>LLM parameter effects</b> (Temperature, Top-P, Model, etc.)
  <br/>
  Built with <b>NestJS</b> + <b>Next.js</b> + <b>OpenAI API</b> + <b>Prisma</b>.
</p>

<p align="center">
  <a href="https://nestjs.com" target="_blank"><img src="https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs" /></a>
  <a href="https://nextjs.org" target="_blank"><img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=next.js" /></a>
  <a href="https://openai.com" target="_blank"><img src="https://img.shields.io/badge/AI-OpenAI-74AA9C?style=for-the-badge&logo=openai" /></a>
  <a href="https://www.prisma.io/" target="_blank"><img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" /></a>
</p>

---

## 🚀 Overview

**LLM Parameter Lab** lets developers visually test how different language model parameters — like **temperature**, **top-p**, and **model type** — affect AI responses.  
It provides:
- 🧩 **Streaming API responses** (SSE) for real-time token output  
- 📊 **Automatic metric calculation** (coherence, punctuation, length)  
- 💾 **Experiment logging** via **Prisma + SQLite**  
- 💬 **Frontend UI** for testing prompts and comparing experiments  
- 🌗 **Dark themed interface** with auto-scroll and chat-style interaction  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Backend** | NestJS, TypeScript, OpenAI SDK, Prisma ORM |
| **Database** | SQLite (development) |
| **LLM Provider** | OpenAI GPT-4o-mini / GPT-4.1 / GPT-3.5-Turbo |
| **Streaming** | Server-Sent Events (SSE) |
| **Charts** | Recharts.js for metric visualization |

---

## 🧰 Backend Setup (NestJS)

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run start:dev

# Or for production
pnpm run start:prod

```
---

## Environment Variables

```bash
OPENAI_API_KEY=sk-xxxxxxx
DATABASE_URL="file:./dev.db"
```
---

## 💻 Frontend Setup (Next.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
---

## 📊 Metrics

```bash
Each experiment automatically logs these metrics
words -> Total words in response
sentences -> Sentence count
coherence -> Ratio (sentences / words) × 10 — rounded to 2 decimals
punctuation -> Punctuation density — rounded to 2 decimals
