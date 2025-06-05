# Solace Candidate Assignment

A modern, full-stack web app for managing and searching a directory of healthcare advocates. Built with Next.js, TypeScript, Drizzle ORM, and robust testing.

---

## 🚀 Overview

This project is a candidate assessment for Solace Health. It demonstrates best practices in modern React, full-stack TypeScript, typed database access, and comprehensive testing.

- **Search & filter** a paginated list of advocates (doctors, therapists, etc).
- **REST API** with advanced search (name, city, degree, specialty).
- **Fully typed** from database to UI.
- **Production-grade testing** with Jest, React Testing Library, and MSW.

---

## ✨ Features

- **Advocate Directory:** Paginated, searchable, filterable.
- **API:** REST endpoints for advocates, with search and pagination.
- **Database Integration:** Drizzle ORM schema, seed data, and migrations.
- **Modern React:** Hooks, SWR for data fetching, functional components.
- **Testing:** Unit/integration tests, API mocking.
- **Configurable:** Works out-of-the-box with mock data, or connect your own Postgres DB.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React 18, TypeScript
- **Backend/API:** Next.js API routes, Drizzle ORM
- **Database:** Postgres (via Docker, or bring your own)
- **Testing:** Jest, React Testing Library, MSW
- **Styling:** Tailwind CSS (if enabled)
- **Other:** Docker, ESLint, Prettier

---

## 🗂️ Folder Structure

```
.
├── src/
│   ├── app/           # Next.js pages, API routes, layout
│   ├── components/    # React UI components
│   ├── db/            # Drizzle ORM schema, DB connection, seed scripts
│   ├── mocks/         # MSW server for test API mocking
│   ├── tests/         # Jest/RTL test files
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions (debounce, etc)
├── public/            # Static assets
├── drizzle/           # Drizzle migration files
├── .env               # Environment variables
├── ...                # Config files (see SETUP.md)
```

---

# 📁 File & Component Breakdown

### `/src/app/`

- **`page.tsx`**
  - **What:** The main entry point for the UI. Renders the `AdvocateGrid` with a default `pageSize`.
  - **Why:** Keeps the root page clean and focused, delegating all data fetching and state to the grid component. This promotes separation of concerns and makes the main page easy to reason about.

- **`layout.tsx`**
  - **What:** Defines the global app layout (header, footer, etc).
  - **Why:** Ensures consistent structure and styling across all pages, following Next.js App Router conventions for maintainability.

- **`api/advocates/route.ts`**
  - **What:** Implements the `/api/advocates` REST endpoint. Handles GET requests, parses query params, builds a dynamic SQL query with Drizzle ORM, and returns paginated advocate data as JSON.
  - **Why:** 
    - **Drizzle ORM** is used for type-safe, composable SQL queries, reducing runtime errors and improving maintainability.
    - **Dynamic filtering:** The `ilike` operator enables partial, case-insensitive search across multiple fields (first name, last name, city, degree).
    - **Raw SQL for JSON:** The `sql\`EXISTS...\`` fragment allows searching inside the JSON `specialties` array, which is not natively supported by most ORMs—this is a pragmatic solution for advanced search needs.
    - **Pagination:** `.limit()` and `.offset()` are used for efficient, scalable data loading, supporting infinite scroll on the frontend.
    - **Error handling:** Returns clear errors for DB issues, improving DX and debuggability.

---

### `/src/components/`

- **`AdvocateGrid.tsx`**
  - **What:** Renders a paginated, searchable grid of advocates. Handles search, infinite scroll, debouncing, and loading states.
  - **Why:**
    - **SWR Infinite:** Used for efficient, cache-friendly pagination and data fetching, making infinite scroll easy and performant.
    - **Debounce:** The custom debounce utility prevents excessive API calls as the user types, improving performance and user experience.
    - **Intersection Observer:** Automatically loads more data when the user scrolls near the bottom, providing a modern, seamless infinite scroll experience.
    - **State separation:** `searchTerm` (input) vs. `finalSearchTerm` (actual query) allows for debounced updates and precise control over when the search is triggered.
    - **Refs for observer and fetching state:** Ensures lazy loading is robust and prevents race conditions.

- **`AdvocateCard.tsx`**
  - **What:** Renders a single advocate’s details, with specialty highlighting and toggling.
  - **Why:**
    - **Memoization:** `useMemo` is used to efficiently compute matching specialties and toggle logic, avoiding unnecessary re-renders.
    - **User-centric design:** Highlights only relevant specialties when searching, but allows users to toggle and see all specialties for transparency.
    - **Component memoization:** The card is wrapped in `React.memo` to avoid unnecessary re-renders when parent state changes, improving performance in large lists.

---

### `/src/db/`

- **`schema.ts`**
  - **What:** Drizzle ORM schema for the `advocates` table, including a custom JSONB type for specialties.
  - **Why:**
    - **Custom JSONB:** Enables storing and querying arrays of specialties, which is more flexible than a flat string column.
    - **Type safety:** All columns are explicitly typed, reducing bugs and improving editor autocompletion.
    - **Default timestamps:** Ensures all records are timestamped for future auditability or sorting.

  #### About the Custom JSONB in `schema.ts`
  - **What:**
    - The `specialties` column is defined as a custom JSONB type using Drizzle ORM’s `customType` helper. This allows us to store an array of specialties (strings) for each advocate directly in a single database column.
  - **Why use custom JSONB?**
    - **Flexible Data Modeling:** Healthcare advocates can have a variable number of specialties. Using a JSONB array allows us to store any number of specialties per advocate, without the need for a separate join table or fixed columns.
    - **Efficient Reads:** For most UI and API use-cases, we want to fetch all of an advocate’s specialties at once. Storing them as a JSONB array allows us to retrieve the entire list in a single query, avoiding additional joins and simplifying the data model.
    - **Advanced Querying:** By leveraging PostgreSQL’s JSONB features and Drizzle’s ability to embed raw SQL (see the `sql\`EXISTS...\`` fragment in the API route), we can efficiently search within the specialties array for partial matches. This enables robust search functionality (e.g., “find all advocates with a specialty containing ‘cardio’”) that would be more complex and less performant with a normalized join table.
    - **Type Safety:** Drizzle’s `customType` ensures that TypeScript understands the shape of the data (an array of strings), providing autocompletion and compile-time checks throughout the codebase.
    - **Schema Evolution:** If the structure of specialties ever needs to change (e.g., adding subfields or metadata), JSONB allows for easy schema evolution without disruptive migrations.
  - **How is it implemented?**
    ```typescript
    export const customJsonb = <TData>(name: string) =>
      customType<{ data: TData; driverData: string }>({
        dataType() {
          return "jsonb";
        },
        toDriver(value: TData) {
          return value;
        },
      })(name);

    const advocates = pgTable("advocates", {
      // ...
      specialties: customJsonb<string[]>("specialties").notNull(),
      // ...
    });
    ```
    - This defines a reusable helper for JSONB columns, then uses it to store an array of strings in the `specialties` field.
  - **Summary:**
    - Using a custom JSONB type for specialties gives us maximum flexibility, efficient querying, and strong type safety, all of which are essential for a modern, evolving application like this one.

- **`index.ts`**
  - **What:** Initializes the database connection.
  - **Why:** Centralizes DB setup, making it easy to swap DBs or update connection logic in one place.

- **`seed/advocates.ts`**
  - **What:** Contains seed data for the advocates table.
  - **Why:** Provides realistic test data for local development and testing, making it easy to demo and validate features.

---

### `/src/types/`

- **`advocate.ts`**
  - **What:** TypeScript type definition for an Advocate.
  - **Why:** Ensures type safety across the app, from DB to API to UI, reducing runtime errors and improving maintainability.

---

### `/src/utils/`

- **`debounce.ts`**
  - **What:** Generic debounce function for delaying execution.
  - **Why:** Prevents rapid, repeated API calls as users type, improving both performance and backend stability.

---

### `/src/tests/`

- **`AdvocateGrid.test.tsx`**
  - **What:** Tests grid rendering, search, and reset logic. Mocks SWR Infinite to isolate UI logic.
  - **Why:** Ensures the grid behaves correctly under various states, and that UI logic is robust and independent of backend changes.

- **`AdvocateCard.test.tsx`**
  - **What:** Tests card rendering and specialty filtering/toggling.
  - **Why:** Validates that specialty highlighting and toggling work as intended, ensuring a consistent user experience.

---

### `/src/mocks/`

- **`server.ts`**
  - **What:** Sets up MSW (Mock Service Worker) for API mocking in tests.
  - **Why:** Ensures tests are reliable, fast, and not dependent on a real API or database, enabling true unit/integration testing.

---

### `/public/`

- **`next.svg`, `vercel.svg`**
  - **What:** Default Next.js assets.
  - **Why:** Can be safely deleted if not used in the UI.

---

### `/drizzle/`

- **What:** Drizzle ORM migration files (SQL and metadata).
- **Why:** Used for schema migrations and DB versioning, enabling safe, repeatable updates to the database structure.

---

### **Notable Patterns & Practices**

- **Type Safety:** Types are enforced from DB to API to UI for reliability.
- **Separation of Concerns:** API, UI, DB, and utilities are modular and cleanly separated.
- **Testing:** MSW is used for API mocking, ensuring tests are fast, reliable, and isolated.
- **Modern React:** Hooks, SWR, Intersection Observer, and debounce patterns are used for a responsive, modern UX.
- **Performance:** Memoization and debouncing are used throughout to keep the UI fast even with large datasets.

---

## 📦 Key Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm start` — Run production build
- `npm test` — Run all tests

See `SETUP.md` for full setup, DB, and environment details.

---

## 🧪 Testing

- All major components and API logic are covered by tests.
- MSW is used to mock API responses for reliable, isolated tests.
- Run `npm test` to execute the full test suite.

---

## 🤝 Contributing

1. Fork and clone the repo.
2. Install dependencies: `npm i`
3. Run the dev server: `npm run dev`
4. See `SETUP.md` for DB and environment setup.

---

## 👤 Credits

Developed by Wil Gatlin for Solace Health.

---

For detailed setup, database, and environment instructions, see [SETUP.md](./SETUP.md).
