# 🎬 Film Radar

**Отслеживание новых фильмов и сериалов в хорошем качестве**

[![Build and Deploy](https://github.com/username/film-radar/actions/workflows/ci.yml/badge.svg)](https://github.com/username/film-radar/actions/workflows/ci.yml)
[![Playwright Tests](https://img.shields.io/badge/tests-playwright-green.svg)](https://github.com/username/film-radar/actions)

## 🚀 Live Demo

**🌐 [https://username.github.io/film-radar/](https://username.github.io/film-radar/)**

## ✨ Features

### 🔥 **Умная фильтрация контента**
- **"Свежие"** - фильмы за последние 7 дней, сериалы за 3 дня
- **"Качество"** - только высококачественные релизы (1080p+ WEB-DL/BluRay)
- **"Топ рейтинг"** - фильмы и сериалы с IMDB 8.0+
- **По типам** - отдельно фильмы и сериалы

### 🎯 **TMDB интеграция**
- Реальные постеры и описания фильмов
- Актуальные рейтинги и метаданные
- Информация о жанрах и длительности
- Русскоязычные описания

### ⚡ **Система оценки качества**
- Автоматическая оценка торрентов (0-100 баллов)
- Приоритет BluRay и WEB-DL релизов
- Фильтрация низкокачественного контента

### 🖼️ **Современный UI**
- Адаптивный дизайн для всех устройств
- Темная тема с кинематографическими цветами
- Индикаторы свежести контента
- Плавные анимации и переходы

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **APIs**: TMDB API + YTS + торрент-трекеры
- **Testing**: Playwright E2E tests
- **Deployment**: GitHub Pages + GitHub Actions

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase       │    │   External APIs │
│                 │    │                  │    │                 │
│ • Movie Cards   │◄──►│ • PostgreSQL DB  │◄──►│ • TMDB API      │
│ • Tabs/Filters  │    │ • Edge Functions │    │ • YTS API       │
│ • Quality Score │    │ • Real-time sync │    │ • Torrent RSS   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/username/film-radar.git
cd film-radar

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Environment Setup

Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

### Run Playwright Tests

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test film-radar.spec.ts
```

### Test Coverage

- ✅ Main page loading and navigation
- ✅ Tab switching and filtering logic
- ✅ Movie card display and interactions
- ✅ Fresh content detection
- ✅ Quality filtering
- ✅ Responsive design (mobile/tablet)
- ✅ Error handling and edge cases

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### GitHub Pages Deployment

The app automatically deploys to GitHub Pages when you push to `main` branch:

1. **Build** - Creates optimized production build
2. **Test** - Runs Playwright E2E tests
3. **Deploy** - Publishes to GitHub Pages

## 🔧 Configuration

### Database Schema

Key tables and fields:
```sql
movies:
- tmdb_id, poster_tmdb_url, backdrop_url
- torrent_release_date, source_quality_score
- genres[], runtime, popularity, vote_count

episodes:
- tmdb_id, still_path, vote_average
- overview, runtime
```

### Quality Scoring System

```javascript
2160p BluRay    → 100 points
1080p WEB-DL    → 80 points  
720p WEB-DL     → 65 points
480p            → 40 points
CAMRIP          → 10 points
```

### Freshness Logic

```javascript
Movies:  Fresh if torrent_release_date < 7 days
Series:  Fresh if last_episode_date < 3 days
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Write Playwright tests for new features
- Follow TypeScript strict mode
- Use semantic commit messages
- Ensure responsive design
- Test on multiple browsers

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🐛 Known Issues

- Some torrent sources may be temporarily unavailable
- TMDB API rate limiting during heavy usage
- Mobile Safari specific CSS quirks

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie metadata
- [YTS](https://yts.mx/) for high-quality movie torrents
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for UI components

---

**⭐ Star this repo if you find it useful!**