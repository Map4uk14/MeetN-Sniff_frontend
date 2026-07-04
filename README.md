# Meet & Sniff — Frontend

A web app that helps dog owners in Vienna find nearby walks and meetups using Maps.

The Vue 3 frontend of **Meet & Sniff**, a full-stack web application built by a student team at **FH Campus Wien**. I was responsible for the **frontend**: building the UI and connecting it to the REST backend.

🔗 **Backend repository:** [MeetN-Sniff_backend](https://github.com/Map4uk14/MeetN-Sniff_backend)

---

## Tech stack

- **Vue 3** (`<script setup>` single-file components)
- **Vite** (dev server & build)
- **JavaScript**, **CSS**, **HTML**
- Talks to a separate REST backend (see link above)

## Features

- [x] User registration / login — JWT-based auth with protected routes; session persists via localStorage
- [x] Park discovery & map view — browse dog parks on an interactive Google Map with tag filtering and click-to-pan
- [x] Reviews & ratings — submit, view, and delete reviews per park with star ratings; average rating auto-recalculates
- [x] Favorites — save/unsave parks from the park details view, manage them from your profile
- [x] Profile management — edit display name, bio, and dog info; delete account with full data cleanup

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs locally with Vite's dev server. For the best editing experience in VS Code, install the official **Vue (Volar)** extension.

## Project structure

```
src/        # Vue components, views, and app logic
public/     # static assets
docs/       # documentation and screenshots
```

## My role

Frontend developer on a student team. I built the user interface in Vue 3 + Vite and integrated it with the team's REST backend ([~47 commits](https://github.com/Map4uk14/MeetN-Sniff_frontend/commits/main/)).

## Team & context

Built as a team project at FH Campus Wien (Computer Science and Digital Communications).
