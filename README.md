# Frontend-only Mock Backend (development)

This project has been configured to run entirely in the browser for local development using a small in-memory mock backend.

Why we did this
- Avoid needing hosted backend environment variables, service keys, or confirmed emails while developing the frontend UI.
- Let developers iterate quickly on pages and flows without network dependencies.

What the mock provides
- `src/lib/backendMock.ts` — an in-memory shim that implements the minimal backend API the app uses:
  - auth helpers: getUser(), signInWithPassword({email, password}), signUp({email, password}), signOut()
  - onAuthStateChange(callback) (returns a subscription with unsubscribe())
  - simple table queries via from(table) with select, eq, in, maybeSingle, single, insert and head/count support
- `src/lib/mockSeed.ts` — dev-only seeder that preloads test student/advisor/admin profiles and a few readiness scores. It is dynamically imported at startup in development (`src/main.tsx`).

How to use locally
1. Install dependencies and start the dev server (PowerShell):

```powershell
cd "d:\PROJECTS\Rediness tracker\project"
npm install
npm run dev
```

2. Open the Vite local URL (e.g. http://localhost:5173). In development the mock is pre-seeded with test users. You can sign in with the seeded emails in `src/lib/mockSeed.ts` (or any email — the mock will create a transient mock user).

Notes and limitations

- The mock stores data in memory only — it resets on full page reload. If you want persistence across reloads, consider editing the backend shim (for example `src/lib/backendClient.ts` or `src/lib/backendMock.ts`) to persist `db` into `localStorage`.
- The mock intentionally implements only the API surface the frontend needs. If you encounter a missing method or different return shape, the easiest fix is to extend the backend shim (or the mock) to match the expected behavior.

How to revert to a real hosted backend

If you later want to restore a real hosted backend, create a client module (for example `src/lib/backendClient.ts`) that initializes the client with your service URL and key and install the appropriate SDK for your backend provider.

3. Remove the mock seeder import from `src/main.tsx` (or guard it so it does not run in production). For example, remove or comment out the dynamic import:

```ts
if (import.meta.env.DEV) {
  void import('./lib/mockSeed');
}
```

4. If you need the seeded profile rows in your real hosted backend project, either:
  - Run server-side seeding with a service_role key (not recommended to store in repo), or
  - Use the SQL editor in your hosted backend project and insert the rows manually using INSERT statements. The test user IDs used by the previous dev run are in `src/lib/mockSeed.ts` if you want to match them.

Security note
- The in-memory mock is for local development only. Do not ship it to production. All dev-only imports are guarded by `import.meta.env.DEV` to avoid accidental bundling.

Questions or changes
- If you want persistent dev data (localStorage), automatic seed toggles, or a richer mock (update/delete, nested selects), tell me which features you want and I can implement them.

## Server API contract (/api) and example Spring Boot controllers

When running in production the frontend expects a RESTful backend under the `/api` prefix. The development adapter (`src/lib/api.ts`) proxies to the in-memory mock in `DEV` and switches to these REST endpoints in production. The minimal endpoints the frontend expects are listed below.

Minimal endpoints
- GET  /api/auth/user
  - Returns the currently authenticated user (or null)
- POST /api/auth/signin
  - Body: { email, password }
  - Returns session/user object
- POST /api/auth/signup
  - Body: { email, password }
  - Creates user and returns created user/session
- POST /api/auth/signout
  - Signs out the current session (server-side cookie/session management)
- GET  /api/{table}
  - Query params implement simple filters such as `user_id=...`, `student_id=...`, or `select=id,full_name`.
  - Returns array of rows matching filters.
- POST /api/{table}
  - Body: object or array of objects to insert. Returns created rows.

These endpoints are intentionally minimal. Your Spring Boot backend can implement richer semantics, but keeping this surface will let the existing frontend run without changes.

Example Spring Boot controller skeletons

Below are very small controller examples (Java + Spring Boot) showing how the routes above might be implemented. These are intentionally minimal and omit persistence/service layers — they illustrate the mapping and request/response shapes expected by the frontend.

AuthController.java

```java
package com.example.readinesstracker.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/user")
    public ResponseEntity<?> getUser() {
        // return currently authenticated user or null
        return ResponseEntity.ok(Map.of("user", null));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        // Authenticate and return user/session
        return ResponseEntity.ok(Map.of("user", Map.of("id", "u-1", "email", email)));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody Map<String, String> body) {
        // Create a user and return created user/session
        return ResponseEntity.ok(Map.of("user", Map.of("id", "u-2", "email", body.get("email"))));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut() {
        // Invalidate session/cookie
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
```

TableController.java (generic table access)

```java
package com.example.readinesstracker.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TableController {

    @GetMapping("/{table}")
    public ResponseEntity<?> listTable(
        @PathVariable String table,
        @RequestParam Map<String, String> allRequestParams
    ) {
        // Interpret select and simple equality filters and return matching rows
        // Example: /api/student_profiles?user_id=u-1&select=id,full_name
        List<Map<String, Object>> rows = List.of();
        return ResponseEntity.ok(rows);
    }

    @PostMapping("/{table}")
    public ResponseEntity<?> insertIntoTable(@PathVariable String table, @RequestBody Object payload) {
        // Accept an object or array and persist; return created rows
        return ResponseEntity.ok(payload);
    }
}
```

Notes for backend implementers
- Authentication/session handling: the example uses very small stubs. Implement proper authentication (JWT, session cookies, OAuth) as appropriate.
- Filtering and `select`: the frontend uses simple `eq`, `in`, `maybeSingle` and `single` patterns. Implement lightweight query parsing for query params (or provide richer endpoints) and return JSON arrays or single objects accordingly.
- CORS and cookies: configure CORS and cookie settings so your frontend can call these endpoints in production.

If you want, I can scaffold a minimal Spring Boot project (pom.xml + these controllers + DTOs) that compiles and runs locally so you can wire it to the frontend.
