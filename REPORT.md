# Build Report: NameDrill

## The Problem

People who meet many new faces — teachers, salespeople, managers, conference attendees — struggle to remember names. The embarrassment of forgetting someone's name is universal, yet no good web tool exists for this specific problem. Name Shark (the only decent solution) died in 2017.

**Source:** [r/AppIdeas](https://www.reddit.com/r/AppIdeas/comments/1qwapxl/idea_an_app_to_make_facename_flashcards/) — *"I'd slap down money so fast for an app like this."* (6 upvotes, 13 comments)

## Why This Problem

Scored highest across all criteria:
- **Urgency (9/10):** Teachers face this every semester. Salespeople face it weekly.
- **Impact (9/10):** Millions of professionals affected (3.7M teachers in US alone)
- **Novelty (10/10):** No good web-based solution exists
- **Feasibility (9/10):** Client-side only, no backend needed
- **Bookmark test (10/10):** Users would return daily to study names

## What I Built

**NameDrill** — A gamified face/name flashcard web app with spaced repetition.

### Core Features
- **Deck Management:** Create/edit/delete decks for different groups
- **Photo Upload:** Upload and auto-compress photos (400px, JPEG 0.7)
- **4 Study Modes:**
  - Classic Flash — see face, recall name, self-grade
  - Multiple Choice — see face, pick from 4 names
  - Reverse — see name, pick from 4 faces
  - Speed Round — 60-second rapid-fire typing
- **SM-2 Spaced Repetition:** Same algorithm as Anki, optimal review scheduling
- **Progress Tracking:** Per-card accuracy, deck mastery %, due count
- **Export/Import:** Full data backup as JSON

### Design Decisions
- **No backend:** All data in localStorage. Privacy-first, zero setup.
- **No auth:** No payments, no accounts needed. Just open and use.
- **Photo compression:** Resize to 400px and JPEG 0.7 to keep localStorage usage manageable.
- **Face-first learning:** The key insight — you see faces and need to recall names, not vice versa.
- **Gamification:** Multiple choice and speed rounds make learning fun, not boring.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- SM-2 algorithm implementation
- localStorage persistence
- GitHub Pages deployment

## Links
- **Live:** https://cody-nixon.github.io/namedrill/
- **GitHub:** https://github.com/cody-nixon/namedrill

## What Works
- Full create → study → review flow
- All 4 study modes functional
- Spaced repetition correctly schedules reviews
- Photo upload with compression
- Export/import for backup
- Mobile-responsive design
- Dark mode

## Limitations
- No cloud sync (localStorage only, ~5MB limit)
- No team sharing features
- No AI face recognition (manual photo upload required)
- No crop/edit for uploaded photos

## What I'd Do Next (Startup Path)
1. **Cloud sync** — Optional accounts with encrypted cloud storage
2. **Team features** — Share decks with coworkers, import from company directory
3. **LinkedIn import** — Pull names and faces from connections
4. **Study streaks** — Gamification to drive daily return visits
5. **Analytics dashboard** — Which names are hardest, best study times
6. **Mobile app** — PWA or native with camera capture
7. **Premium tier** — Unlimited decks, team features, cloud backup — $5/mo

## Time Spent
~2 hours: Research (30min) → Decision (10min) → Plan (15min) → Build (45min) → Test & Deploy (20min)
