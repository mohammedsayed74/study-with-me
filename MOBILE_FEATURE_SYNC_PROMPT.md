# 📱 Mobile App Feature Sync — Handoff Prompt

> **Give this entire file to the AI assistant to continue this task.**

---

## Project Overview

This is the **Study With Me** full-stack app.

| Layer        | Path                 | Tech                        |
| ------------ | -------------------- | --------------------------- |
| Backend      | `/backend`           | Node.js / Express / MongoDB |
| Web frontend | `/frontend`          | React + Vite                |
| Mobile app   | `/frontendMobileApp` | React Native + Expo Router  |

The mobile app is in `/frontendMobileApp`. The web app is in `/frontend`.

---

## What Needs To Be Done

Two features exist in the **web** that are missing from the **mobile app**. Both must be implemented in the mobile app with the **same styling and visual language** as the web.

---

## Feature 1: Year Picker on Register Screen (STUDENT ONLY)

### Web Reference

File: `frontend/src/pages/Signup.jsx` (lines 190–208)

When the user selects `"student"` as their role, a **year selector** appears below the role toggle:

```jsx
{
  formData.role === "student" && (
    <div className="auth-input-group">
      <span className="material-symbols-outlined input-icon">
        calendar_today
      </span>
      <select
        name="year"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        required
      >
        <option value={1}>Year 1</option>
        <option value={2}>Year 2</option>
        <option value={3}>Year 3</option>
        <option value={4}>Year 4</option>
      </select>
      <span className="material-symbols-outlined input-icon-right-inert">
        expand_more
      </span>
    </div>
  );
}
```

The `year` value (default `1`) is sent to the API:

```js
await axios.post("/api/users/signUp", { ...formData, year });
```

### Mobile File To Edit

`frontendMobileApp/app/auth/register.js`

### What To Add

1. Add `const [year, setYear] = useState(1);` state (only relevant when `role === "student"`).

2. After the role toggle buttons (`{["student", "teacher"].map(...)}`), conditionally show a horizontal row of year pills:

```jsx
{
  role === "student" && (
    <View style={{ marginBottom: SPACING.sm }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: COLORS.muted,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Academic Year
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[1, 2, 3, 4].map((y) => {
          const isActive = year === y;
          return (
            <TouchableOpacity
              key={y}
              onPress={() => setYear(y)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: RADIUS.button,
                borderWidth: 1.5,
                borderColor: isActive ? COLORS.navy2 : COLORS.border,
                backgroundColor: isActive ? COLORS.navy2 : COLORS.white,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  color: isActive ? "#fff" : COLORS.muted,
                }}
              >
                Year {y}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
```

3. Add `year` to the `registerUser()` call:

```js
const result = await registerUser({
  name: fullName,
  email,
  password,
  role,
  year,
});
```

**Behavior:** If role is `"teacher"`, the year picker must NOT appear and `year` should not be sent (or send `undefined`).

---

## Feature 2: Replace Home Tab with Dashboard

### Web Reference Files

- `frontend/src/pages/Dashboard.jsx` — top-level layout + role detection
- `frontend/src/components/dashboard/StudentDashboard.jsx` — student view
- `frontend/src/components/dashboard/DoctorDashboard.jsx` — teacher view
- `frontend/src/components/dashboard/DashboardCard.jsx` — section card wrapper
- `frontend/src/components/dashboard/StatusBadge.jsx` — status pill
- `frontend/src/components/dashboard/RejectModal.jsx` — reject with reason modal
- `frontend/src/pages/dashboard.css` — all styling tokens

### Web Design Tokens → Mobile Theme Mapping

| Web CSS Variable             | Mobile Value              |
| ---------------------------- | ------------------------- |
| `--dash-primary: #2b8cee`    | `#2b8cee`                 |
| `--dash-bg: #f4f7fb`         | `COLORS.card` = `#F5F8FF` |
| `--dash-surface: #ffffff`    | `COLORS.white`            |
| `--dash-text: #1a1d26`       | `COLORS.text`             |
| `--dash-text-muted: #94a3b8` | `COLORS.muted`            |
| `--dash-border: #e2e8f0`     | `COLORS.border`           |
| `--dash-success: #10b981`    | `COLORS.success`          |
| `--dash-warning: #f59e0b`    | `#f59e0b`                 |
| `--dash-danger: #ef4444`     | `COLORS.error`            |
| `--dash-purple: #8b5cf6`     | `#8b5cf6`                 |
| `--dash-radius: 16`          | `RADIUS.card` (20) or 16  |

Mobile theme is in: `frontendMobileApp/src/theme/theme.js`

### Files To Modify

#### A) `frontendMobileApp/app/(tabs)/_layout.js`

Change the home tab:

- `title`: `"Home"` → `"Dashboard"`
- `tabBarIcon`: `"home"` → `"grid"` (Ionicons)

#### B) `frontendMobileApp/app/(tabs)/home.js` — FULL REWRITE

> **Do not rename the file.** Expo Router uses filename as the route; the tab navigates to `/(tabs)/home`. Only the content changes.

The new screen should:

1. **Decode the JWT from AsyncStorage** to get `user.name`, `user.role` (use `jwtDecode` from `jwt-decode` — install it with `npm install jwt-decode` if not present).

2. **Show a header** with:
   - Greeting: `"Hello, {user.name} 👋"`
   - Subtitle: `"Welcome back! Here is your latest overview."`
   - Role badge pill showing the role

3. **Show stat cards** in a 2-column grid (matching web's `.dash-stats-row`):
   - **Student** (4 cards): Total Uploads (blue), Approved (green), Pending (amber), Ratings Given (purple)
   - **Teacher** (3 cards): Pending Requests (amber), Top Rated Files (blue), Active Contributors (green)

4. **Show data section cards** (matching web's `.dash-card`):
   - Each card has a header with icon + title + count badge
   - Show skeleton loading (3 animated placeholder rows) while fetching
   - Show empty state when no data

   **Student sections:**
   - "My Latest Ratings" — table rows: File name | Course code | Star rating (1–5 ★) | Date
   - "My Latest Uploads" — table rows: File name | Course | Date | Status badge

   **Teacher sections:**
   - "Pending Upload Requests" — rows: Title | Student | Subject | Date | View button | Approve/Reject buttons
   - "Highest Rated Files" — rows: Title | Avg rating | Review count | Uploader
   - "Most Active Contributors" — rows: Rank badge (#1=gold, #2=silver, #3=bronze) | Avatar (initial letter) | Name/role | Uploads | Approved

5. **Reject Modal**: When teacher taps "Reject", show a modal with:
   - Reason options (radio-style): `plagiarism`, `low_quality`, `wrong_subject`, `other`
   - Optional note textarea
   - Cancel / Confirm buttons

#### C) NEW: `frontendMobileApp/src/services/dashboardService.js`

Create this file with the following API calls (using `fetch` + `API_BASE_URL` from `../config/api`):

```js
import { API_BASE_URL } from "../config/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function getStudentRatings(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/student/my-ratings`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getStudentUploads(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/student/my-uploads`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getDoctorTopRated(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/top-rated`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getDoctorContributors(token) {
  const res = await fetch(
    `${API_BASE_URL}/api/dashboard/doctor/top-contributors`,
    { headers: authHeaders(token) },
  );
  const data = await res.json();
  return data.data || [];
}

export async function getDoctorPending(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/pending`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function approveMaterial(id, token) {
  await fetch(`${API_BASE_URL}/api/materials/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export async function rejectMaterial(id, reason, note, token) {
  await fetch(`${API_BASE_URL}/api/dashboard/doctor/reject/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ rejectionReason: reason, rejectionNote: note }),
  });
}
```

---

## Existing Mobile App Conventions

- **Routing**: Expo Router file-based. Tabs in `app/(tabs)/`. Auth screens in `app/auth/`.
- **Theme**: Always import from `../../src/theme/theme` — use `COLORS`, `RADIUS`, `SPACING`, `TYPO`.
- **Icons**: `@expo/vector-icons` → `Ionicons` component.
- **Navigation**: `router.replace()` or `router.push()` from `expo-router`.
- **Storage**: `AsyncStorage` from `@react-native-async-storage/async-storage` for token.
- **API**: `fetch()` with `API_BASE_URL` from `../../src/config/api`.
- **No StyleSheet**: Styles are written as inline objects directly on components (no `StyleSheet.create` pattern).

---

## What NOT To Do

- Do NOT rename `home.js` — it must stay as `home.js`.
- Do NOT add a sidebar navigation (no sidebar on mobile — use the bottom tab bar instead).
- Do NOT use TailwindCSS, web-specific CSS, or any web-only libraries.
- Do NOT change the backend. All API endpoints already exist and work.
- Do NOT change any other screens (courses, profile, login) unless the register year picker requires it.

---

## Acceptance Criteria

- [ ] Register screen: Year picker appears when role = "student", hidden when role = "teacher"
- [ ] Register screen: `year` value is sent in the API call body
- [ ] Dashboard tab: Tab bar shows "Dashboard" with grid icon instead of "Home" with home icon
- [ ] Dashboard screen: Decoded user from JWT determines whether student or teacher view shows
- [ ] Student dashboard: 4 stat cards, ratings list, uploads list with status badges
- [ ] Teacher dashboard: 3 stat cards, pending requests with approve/reject, top files, contributors
- [ ] Reject modal: Shows reason picker + optional note field, submits and removes item on confirm
- [ ] Loading skeleton: Visible while API calls are in progress
- [ ] Empty state: Shown when lists have no data
