# FitTogether

A community web app for local swimmers and gym-goers — crowdsourced busyness reports, buddy matching, and fitness challenges, built with SvelteKit.

## Walkthrough Videos

<!-- Add walkthrough videos below. Use markdown video embeds or linked thumbnails. -->
<!-- Example: -->
<!-- [![Demo Video](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID) -->

| Video | Description |
| ----- | ----------- |
| [Overview](https://www.loom.com/share/6b4d1e1bd83b457b9bbb60c13cd91dcd) | Full app walkthrough |
| _Coming soon_ | Buddy system demo |
| _Coming soon_ | Challenges & leaderboards |

## What It Does

- **Crowdsourced Busyness** — See how busy your local pool or gym is right now. Check in and report busyness levels (Low/Medium/High) with visual indicators, interactive Leaflet maps, and place search via Nominatim.
- **Buddy Finder** — Find workout partners filtered by activity (swim/gym) and schedule (morning/evening/weekend). Send buddy requests, and contact accepted buddies via WhatsApp — but only when they've set themselves as active at a venue (anti-harassment by design).
- **Fitness Challenges** — Join challenges like "Swim 5km in a Week", log workouts, track progress with visual bars, and compete on per-challenge leaderboards.

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Language  | TypeScript                     |
| Database  | Neon (PostgreSQL serverless)   |
| ORM       | Prisma v6                      |
| Auth      | Auth.js (Google OAuth)         |
| Styling   | TailwindCSS v4                 |
| Maps      | Leaflet + OpenStreetMap        |
| Geocoding | Nominatim (free)               |

## User Stories (Summary)

### Busyness (7 stories)

View locations with busyness levels, check in to report, see timestamps, browse an interactive map with color-coded markers, search & add places, see visual crowding indicators, and view location detail pages.

### Buddy Finder (9 stories)

Set profile preferences, browse & filter users, write a bio, send/accept/decline buddy requests, see connection status, contact accepted buddies via WhatsApp (only when active), toggle active status (At Gym / At Pool / Offline), and see green dot indicators for active users.

### Challenges (5 stories)

Browse challenges with participant counts, join challenges, log workouts, view leaderboards, and track progress with visual bars.

### Profile & Auth (4 stories)

Sign in with Google, view profile with history, edit preferences & WhatsApp number, and manage incoming buddy requests.

### Safety (3 stories)

WhatsApp hidden until buddy request accepted AND user is active, reject unwanted requests, go offline anytime to stop contact.

> 28 user stories implemented. See [user-stories.md](user-stories.md) for the full list. See [Project.md](Project.md) for the complete specification.

## Setup

```bash
npm install
cp .env.example .env  # fill in DATABASE_URL, AUTH_SECRET, Google OAuth creds
npx prisma db push
npx prisma db seed
npm run dev
```

### Environment Variables

| Variable             | Description                        |
| -------------------- | ---------------------------------- |
| `DATABASE_URL`       | Neon PostgreSQL connection string  |
| `AUTH_SECRET`        | Random secret for Auth.js sessions |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID             |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret         |

## Developing

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

```sh
npm run build
```

Preview the production build with `npm run preview`.

> To deploy, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
