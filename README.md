# NameDrill 🧠

**Never forget a name again** — Gamified face/name flashcards with spaced repetition.

🔗 **Live:** [https://cody-nixon.github.io/namedrill/](https://cody-nixon.github.io/namedrill/)

## The Problem

Teachers, salespeople, managers, and conference attendees meet dozens of new people and struggle to remember names. The only decent solution (Name Shark) died in 2017. Existing flashcard apps aren't designed for face/name matching.

Source: [r/AppIdeas](https://www.reddit.com/r/AppIdeas/comments/1qwapxl/idea_an_app_to_make_facename_flashcards/) — *"I'd slap down money so fast for an app like this."*

## Features

- **📚 Deck Management** — Create decks for different groups (classes, teams, events)
- **📸 Photo Upload** — Upload photos with automatic compression and cropping
- **🎯 Multiple Choice** — See a face, pick from 4 names
- **🔄 Reverse Mode** — See a name, pick from 4 faces
- **⚡ Speed Round** — 60-second rapid fire typing challenge
- **🧠 Classic Flash** — Self-graded flashcards with flip reveal
- **📈 Spaced Repetition** — SM-2 algorithm (same as Anki) schedules reviews at optimal intervals
- **📊 Progress Tracking** — Per-card accuracy, deck mastery percentage
- **💾 Export/Import** — Backup and restore all your data as JSON
- **🌙 Dark Mode** — Easy on the eyes
- **📱 Mobile-First** — Responsive design, works great on phones

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Lucide React icons
- SM-2 spaced repetition algorithm
- localStorage (no backend, fully private)
- GitHub Pages deployment

## Run Locally

```bash
git clone https://github.com/cody-nixon/namedrill.git
cd namedrill
npm install
npm run dev
```

## How It Works

1. **Create a deck** — Name it after your class, team, or event
2. **Add people** — Upload photos and enter names
3. **Study** — Choose from 4 study modes
4. **Review** — SM-2 schedules cards at optimal intervals for long-term retention
5. **Track progress** — Watch your mastery percentage climb

## Privacy

All data stays in your browser's localStorage. No accounts, no cloud, no tracking. Your photos never leave your device.

## License

MIT
