# StudyResourceHub

## 🚨 The Problem: Information Overload
In today's digital age, the internet is flooded with educational content. When students receive a syllabus, they often spend **hours** jumping between YouTube, documentation sites, and blogs just to find the right materials to study. This constant context-switching leads to:
- **Decision Fatigue:** Too many options cause confusion about where to start.
- **Wasted Prep Time:** Time spent searching for quality tutorials is time lost from actual studying.
- **Inconsistent Quality:** Students often land on outdated or poorly explained articles.

## 💡 The Solution: StudyResourceHub
**StudyResourceHub** completely eliminates the friction of finding study materials. 

By simply pasting a course syllabus into the dashboard, students instantly receive a highly customized, AI-driven learning roadmap. The application automatically dissects the topics and curates top-tier resources from across the web.

### Key Features
- **Dynamic Syllabus Parsing:** Paste your entire syllabus, and the app breaks it down into actionable topics.
- **Customized Resource Fetching:** Get exact matches from the **YouTube Data API** and high-quality articles via the **Google Custom Search API**.
- **Pro Controls:** Tailor your learning experience by choosing exactly how many videos (YouTube) or articles (GeeksforGeeks, General Web) you want per topic.
- **Premium UI:** A distraction-free, midnight dark mode interface built with Next.js, Shadcn UI, and Tailwind CSS.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **APIs Used:** YouTube Data API v3, Google Custom Search API
- **Deployment:** Vercel (Ready)

## 🚀 Getting Started Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with your Google API keys:
   ```env
   YOUTUBE_API_KEY=your_api_key
   GOOGLE_SEARCH_API_KEY=your_search_api_key
   GOOGLE_SEARCH_CX=your_search_engine_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) inside your browser.
