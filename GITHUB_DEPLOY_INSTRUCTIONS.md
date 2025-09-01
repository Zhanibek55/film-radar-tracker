# 🚀 Инструкции по деплою на GitHub Pages

## 📋 Шаги для создания репозитория и деплоя:

### 1. **Создать GitHub репозиторий**

1. Зайди на https://github.com
2. Нажми "New repository" (зеленая кнопка)
3. Назови репозиторий: `film-radar`
4. Сделай его **Public** (для GitHub Pages)
5. НЕ добавляй README, .gitignore, license (у нас уже есть)
6. Нажми "Create repository"

### 2. **Подключить локальный репозиторий**

```bash
# Добавить remote origin (замени YOUR_USERNAME на свой GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/film-radar.git

# Переименовать ветку в main
git branch -M main

# Запушить код
git push -u origin main
```

### 3. **Настроить GitHub Pages**

1. Зайди в репозиторий на GitHub
2. Перейди в **Settings** (вкладка)
3. Скролль до секции **Pages** (слева в меню)
4. В **Source** выбери **GitHub Actions**
5. Сохрани настройки

### 4. **Запуск автоматического деплоя**

После пуша в main ветку:
- ✅ Автоматически запустится GitHub Action
- ✅ Соберется приложение (`npm run build`)
- ✅ Запустятся Playwright тесты
- ✅ Деплой на GitHub Pages

**Сайт будет доступен по адресу:**
`https://YOUR_USERNAME.github.io/film-radar/`

## 🧪 Что протестируется автоматически:

### **Build Process:**
- ✅ Установка зависимостей
- ✅ TypeScript компиляция
- ✅ Vite сборка для продакшена
- ✅ Оптимизация ассетов

### **Playwright E2E Tests:**
- ✅ Загрузка главной страницы
- ✅ Навигация по вкладкам
- ✅ Отображение карточек фильмов
- ✅ Фильтрация контента
- ✅ Адаптивный дизайн
- ✅ Обработка ошибок

### **Performance Tests:**
- ✅ Время загрузки < 3 сек
- ✅ Lighthouse Score 90+
- ✅ Responsive design

## 📊 Мониторинг деплоя:

### **GitHub Actions:**
1. Зайди в репозиторий
2. Перейди на вкладку **Actions**
3. Увидишь статус сборки и тестов
4. Можешь посмотреть логи и результаты

### **Playwright Reports:**
- Отчеты тестов сохраняются как артефакты
- Можно скачать HTML отчет с детальными результатами
- Скриншоты и видео для упавших тестов

## 🔧 Настройки проекта для GitHub Pages:

### **Vite конфиг:**
```typescript
base: process.env.NODE_ENV === 'production' ? '/film-radar/' : '/'
```

### **React Router:**
```typescript
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

### **GitHub Actions:**
```yaml
- Build приложение
- Тестирование с Playwright
- Автоматический деплой на Pages
```

## 🎯 После деплоя:

1. **Проверь сайт**: `https://YOUR_USERNAME.github.io/film-radar/`
2. **Запусти парсинг**: кнопка "Обновить" для загрузки данных
3. **Протестируй вкладки**: Свежие, Качество, Фильмы, Сериалы
4. **Проверь TMDB постеры**: должны загружаться реальные изображения

## 🚀 Готово!

После выполнения этих шагов у тебя будет:
- 🌐 Живой сайт на GitHub Pages
- 🧪 Автоматические тесты при каждом коммите
- 📊 Мониторинг производительности
- 🔄 CI/CD пайплайн

**Film Radar будет доступен всему миру!** 🎉