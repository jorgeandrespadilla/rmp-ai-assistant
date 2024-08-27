# AI Rate My Professor

This project is a Rate My Professor AI Assistant that can understand and respond to complex queries about professors and courses. This app was built using Next.js, TypeScript, Python, PostgreSQL, OpenAI and Pinecone.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Python 3.10 or higher

### Installation

1. Clone the repository.
2. Create a copy of the `.env.local.example` file and rename it to `.env.local`. Fill in the environment variables with your Firebase project configuration.
3. Configure the environment for running the Next.js app:
   - Install the dependencies by running `npm install`.
4. Configure the environment for running the Python scripts:
   - Create a Python virtual environment by running `python -m venv venv`.
   - Activate the virtual environment in your terminal by running `venv/Scripts/activate` on Windows or `source venv/bin/activate` on macOS and Linux.
   - Install the required Python packages by running `pip install -r requirements.txt`.
   
### Running the Next.js App

Start the development server by running `npm run dev`. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Running the Scripts

To run the Python scripts, you need to activate the virtual environment by running `source venv/bin/activate` in your terminal. You can deactivate the virtual environment by running `deactivate`.

1. RAG Ingestion Script: This script ingests the Rate My Professor reviews into Pinecone.
   - Run the script by running `python scripts/rag_ingestion.py`.

## Database Migrations (Local Environment)

> We need to use `dotenv-cli` to load environment variables from the `.env.local` file instead of the default `.env` file used by Prisma. This is already configured in the NPM scripts.

The following commands should only be used in a development environment because they can cause data loss. Do not run these commands in production.

### Creating a Database	with Docker

To create a PostgreSQL database using Docker, you can use the following command:

```bash
docker run --name ai-rmp -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

Replace `mysecretpassword` with your desired password. To generate a random password, you can use the following command with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"
```

Or with Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

> The default username is `postgres` (you can change this by adding the `-e POSTGRES_USER=myusername` flag). 

To stop the container, you can use the following command:

```bash
docker stop ai-rmp
```

To remove the container, you can use the following command:

```bash
docker rm ai-rmp
```

### Experiment with the Database

To easily prototype the database, you can use the following command to apply the changes to the database schema, without creating a migration:

```bash
npm run db:prototype:push
```

> With this command you can continue to iterate on your Prisma schema until you are ready to create a migration.

### Reset the Database

To reset the database, you can use the following command:

```bash
npm run db:prototype:reset
```

### Creating Migrations

> Any step taken to prototype the database are not preserved - `db:push` does not generate a history.

To create a new migration, run the following command:

```bash
npm run db:migrate:dev -- --name <migration-name>
```

> Replace `<migration-name>` with the name of the migration using snake_case format (e.g. `init-db`). We strongly recommend using the following format: `[action]-[table]-[description]` (e.g. `create-professors-table`). 

This command does three things:

1. Create a new SQL migration file for this migration in the `prisma/migrations` directory.
2. Execute the SQL migration file against the database.
3. Run `prisma generate` under the hood (which installed the @prisma/client package and generated a tailored Prisma Client API based on your models).

### Applying Migrations

To apply the migrations, use the following command:

```bash
npm run db:migrate:dev
```

### Common Issues

To work with migrations when developing your application in a team, see the recommended [Team Development Workflow](https://www.prisma.io/docs/orm/prisma-migrate/workflows/team-development).

To customize migrations and avoid data loss when renaming fields or tables, see the [Customizing Migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations) documentation.

## Database Migrations (Production)

### Deploying Migrations

In production and testing environments, use the following command to apply migrations:

```bash
npm run db:migrate:deploy
```

> **Note:** migrate deploy should generally be part of an automated CI/CD pipeline, and we do not recommend running this command locally to deploy changes to a production database.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
