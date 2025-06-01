## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database Setup (with Docker)

By default, the app returns a static list of advocates, so you can run it without a database. For full functionality, follow these steps to run a local Postgres database using Docker and connect it to the app.

### 1. Start Postgres with Docker

The project includes a `docker-compose.yml` file to make this easy.

```bash
docker compose up -d
```
- This will launch a Postgres container in the background.
- Default credentials and database name are set in your `.env` file.

### 2. Create the Database

Connect to your running Postgres container and create the database (if not auto-created):

```bash
docker exec -it <container_name> psql -U postgres
CREATE DATABASE solaceassignment;
```
Replace `<container_name>` with the name of your running Postgres container (find it with `docker ps`).

### 3. Configure Environment Variables

- Edit the `.env` file to ensure the `DATABASE_URL` matches your Docker Postgres credentials. Example:
  ```env
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/solaceassignment
  ```
- Uncomment or update any relevant lines in `.env` and in `src/app/api/advocates/route.ts` if you want to use the database.

### 4. Run Database Migrations

Apply the schema to your new database using Drizzle Kit:

```bash
npx drizzle-kit push
```
- This command will create the `advocates` table and any other schema defined in `src/db/schema.ts`.

### 5. Seed the Database

Populate your database with sample data:

```bash
curl -X POST http://localhost:3000/api/seed
```
- This will insert example advocates for you to test with.

### 6. Run the App

```bash
npm run dev
```
- The app will now use your local Postgres database for all advocate data.

---

## Troubleshooting

- **Port conflicts:** If Postgres fails to start, make sure nothing else is running on port 5432.
- **Database connection errors:** Double-check your `DATABASE_URL` in `.env` and that your Docker container is running.
- **Migrations not working:** Ensure the database exists and credentials are correct. Try restarting Docker if issues persist.
- **Seeding fails:** Confirm the app and database are running, and that `/api/seed` is enabled.

---

## Additional Notes
- You can use any local or remote Postgres instance if you prefer not to use Docker. Just update your `.env` accordingly.
- The app is designed to fall back to static/mock data if the database is not available, so you can always develop without DB setup.

```bash
