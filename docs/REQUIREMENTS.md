# MeetN-Sniff Frontend Requirements

This file documents the official project requirements from the frontend perspective.

The backend requirements are listed separately in the backend repository.

## Frontend Scope

| Requirement | Frontend Status | Frontend Evidence |
|---|---|---|
| M1: Frontend must be an individual component | Done | Separate frontend repository with its own `package.json`, `vite.config.js`, `npm run dev` and `npm run build`. |
| M2: Frontend must be an individual component (HTML/CSS/JS) | Done | Vue 3 + Vite compiles `.vue` single-file components to standard HTML, CSS and JavaScript. Entry point is `index.html`, output is `dist/`. |
| M3: FE/BE communication over HTTP(S) | Done | All API calls go through `src/api.js` using `fetch()` to `http://localhost:3000/api`. |
| M4: AJAX/asynchronous data transfer | Done | Every backend call uses `async/await` with `fetch()`. No page reloads. Data is loaded and rendered reactively via Vue 3 refs. |
| M5: BE endpoints return JSON | Done | `src/api.js` parses all responses with `response.json()`. A 204 guard returns `null` for empty responses. |
| M6: BE manages resources with GET, POST, PUT and DELETE | Done | The frontend triggers all four methods. See M7 for per-method evidence. |
| M7: Frontend consumes GET, POST, PUT and DELETE | Done | See endpoint evidence table below. |
| M8: System consumes at least one external REST service | Done | Google Maps JavaScript API is loaded and used in `src/components/ParkMap.vue`. OpenWeather and Open-Meteo are consumed via the backend. |
| M9: Session management | Done | JWT is stored in `localStorage` on login/register. `src/router.js` guards all protected routes with `requiresAuth`. The NavBar logout calls `POST /auth/logout` to revoke the token server-side, then clears `localStorage` and redirects to `/login`. |

## Should Requirements

| Requirement | Frontend Status | Frontend Evidence |
|---|---|---|
| S1: At least two external REST services | Done | Google Maps JavaScript API (FE, `src/components/ParkMap.vue`), OpenWeather (via BE, shown as weather strip in `src/components/ParkDetails.vue`), Open-Meteo (via BE). |
| S2: Second FE component using at least three BE endpoints | Done | `src/views/Profile.vue` is a distinct view that calls `GET /users/me`, `PATCH /users/me`, `DELETE /users/me`, `GET /users/me/favorites` and `DELETE /users/me/favorites/:parkId`. |
| S3: W3C-compliant frontend | Partial | HTML and CSS produced by this repository are valid. The Google Maps JavaScript SDK injects non-compliant HTML at runtime that cannot be controlled by the frontend. Validating `/login` or `/profile` (no map rendered) produces a near-clean result. |
| S4: Responsive frontend | Done | `src/views/Home.vue` and `src/components/NavBar.vue` include `@media (max-width: 768px)` breakpoints. The three-column layout stacks vertically on mobile. Auth pages are centered cards and are responsive by default. |

## Could Requirements

| Requirement | Frontend Status | Frontend Evidence |
|---|---|---|
| C1: At least three external REST services | Done | Google Maps JavaScript API (FE), OpenWeather (via BE, `GET /parks/:id/weather`), Open-Meteo (via BE, `GET /parks/:id/forecast`). |
| C2: BE endpoints return JSON and XML | Done | Backend scope. The backend supports `?format=xml` on selected park endpoints. |
| C3: FE consumes a PATCH endpoint | Done | `src/views/Profile.vue` calls `PATCH /api/users/me` through `Auth.updateProfile()` in `src/api.js` to save profile changes. |

## M7 Endpoint Evidence

| Method | Endpoint | Triggered from |
|---|---|---|
| GET | `GET /parks` | `src/views/Home.vue` on mount |
| GET | `GET /parks/:id` | `src/components/ParkDetails.vue` on park select |
| GET | `GET /parks/:id/weather` | `src/components/ParkDetails.vue` on park select |
| GET | `GET /parks/:parkId/reviews` | `src/components/ParkDetails.vue` on park select |
| GET | `GET /users/me` | `src/views/Profile.vue` on mount |
| GET | `GET /users/me/favorites` | `src/views/Profile.vue` on mount, `src/components/ParkDetails.vue` on park select |
| GET | `GET /auth/me` | `src/api.js` `Auth.getCurrentUser()` |
| POST | `POST /auth/register` | `src/views/Register.vue` on form submit |
| POST | `POST /auth/login` | `src/views/Login.vue` on form submit |
| POST | `POST /auth/logout` | `src/components/NavBar.vue` on sign out |
| POST | `POST /parks/:parkId/reviews` | `src/components/ParkDetails.vue` review form submit |
| POST | `POST /users/me/favorites/:parkId` | `src/components/ParkDetails.vue` Save button |
| PUT | `PUT /parks/:id` | `src/components/ParkDetails.vue` inline park edit form (creator only) |
| PATCH | `PATCH /users/me` | `src/views/Profile.vue` Save changes button |
| DELETE | `DELETE /reviews/:id` | `src/components/ParkDetails.vue` Delete button on own review |
| DELETE | `DELETE /users/me/favorites/:parkId` | `src/components/ParkDetails.vue` Save button (unfavorite), `src/views/Profile.vue` Remove button |
| DELETE | `DELETE /users/me` | `src/views/Profile.vue` Delete account button |
