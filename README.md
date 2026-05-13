# Fighter Metrics

## Description
Fighter Metrics is a UFC performance and trend analytics platform that aggregates fighter statistics, upcoming event data, and divisional trends into one unified web application. Users can search for UFC fighters by their ESPN athlete ID, view their fight records and stats, save fighters to a personal dashboard, and explore who's on the current UFC card all powered by the ESPN unofficial UFC API and a Supabase database.

## Target Browsers
- Chrome 120+ (desktop & Android)
- Safari 16+ (desktop & iOS)
- Firefox 120+ (desktop)
- Edge 120+ (desktop)

The application is responsive and works on modern mobile browsers. iOS Safari and Android Chrome are fully supported.



## Developer Manual

### Audience
This document is written for future developers who will take over the Fighter Metrics codebase. It assumes general knowledge of web development, Node.js, and REST APIs, but no prior knowledge of this system's design.

---

### Installation

**Prerequisites:**
- Node.js v18 or higher
- npm v9 or higher
- A Supabase account and project

**Steps:**

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/fighter-metrics.git
cd fighter-metrics
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
```

4. Set up the Supabase database — run the following SQL in your Supabase SQL editor:
```sql
CREATE TABLE fighters (
  id SERIAL PRIMARY KEY,
  espn_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  division TEXT,
  record TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Running the Application

**Development (with auto-reload):**
```bash
npm start
```
The server will start on `http://localhost:3000`

**Production:**
The app is deployed to Vercel. Any push to the `main` branch triggers an automatic deployment via Vercel's CI/CD pipeline.

---

### Running Tests

No automated tests are currently implemented. To manually test:

1. Visit `http://localhost:3000` and confirm the home page loads with upcoming events
2. Visit `/fighters` and search for athlete ID `2335639` (Jon Jones) — confirm profile loads
3. Save a fighter and confirm it appears in the saved list
4. Visit `/about` and confirm the animated stats load
5. Delete a saved fighter and confirm it's removed

---

### API Endpoints

#### `GET /api/fighters`
Returns all saved fighters from the Supabase database.

**Response:**
```json
{ "success": true, "data": [ { "id": 1, "espn_id": "2335639", "name": "Jon Jones", "division": "Heavyweight", "record": "27-1-0", "nationality": "American" } ] }
```

---

#### `POST /api/fighters`
Saves a fighter to the Supabase database. If the fighter already exists (by `espn_id`), it is updated.

**Request body:**
```json
{ "name": "Jon Jones", "espn_id": "2335639", "division": "Heavyweight", "record": "27-1-0", "nationality": "American" }
```

**Response:**
```json
{ "success": true, "data": [ { ... } ] }
```

---

#### `GET /api/ufc/scoreboard`
Proxies the ESPN unofficial UFC scoreboard API. Returns current and upcoming UFC event data including fight cards, fighter names, and event schedules.

**Response:** ESPN API JSON object containing `leagues`, `events`, and `calendar` arrays.

---

#### `GET /api/ufc/athlete/:id`
Proxies the ESPN core athlete API for a given ESPN athlete ID. Returns full fighter profile data.

**Example:** `GET /api/ufc/athlete/2335639`

**Response:** ESPN athlete JSON object with name, record, height, weight, age, birthplace, and position.

---

#### `DELETE /api/fighters/:espn_id`
Deletes a saved fighter from the Supabase database by ESPN athlete ID.

**Response:**
```json
{ "success": true }
```

---

### Known Bugs & Limitations

- **Fighter search requires ESPN athlete ID** — there is no name-based search currently because ESPN's athlete search endpoint is inconsistent for MMA. A future improvement would be to build a lookup table of known fighter IDs.
- **Win method chart on home page** — when no live fight results are available from the scoreboard, the chart falls back to historical average data. Future work should pull result history from a dedicated stats source.
- **No user authentication** — saved fighters are shared across all users of the same deployment. Future work should add Supabase Auth to give each user their own dashboard.

---

### Roadmap for Future Development

1. Add name-based fighter search using a pre-seeded Supabase lookup table
2. Implement user authentication with Supabase Auth
3. Add a Compare page for side-by-side fighter stat comparisons
4. Add a Championships page tracking title fight history by division
5. Add division-level filtering and analytics (finish rate by weight class)
6. Integrate more granular fight stats (significant strikes, takedown accuracy) from ufcstats.com
