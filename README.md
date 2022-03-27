# quizzyBackend
backend repository

## Technologies
- Express
- Prisma ORM
- Socket.io
- PostgreSQL
- and more to come...

## Setup

**NOTE:** Requires Node.js LTS version

Go to the repository folder's root and enter this in the command line:
```
npm install
```
This will install all the packages and development dependencies for the project
in order to work properly.

Now create a `.env` file in order for the [Prisma ORM](https://www.prisma.io/docs/getting-started/quickstart) to connect to the database properly. The template can be found here:

```bash
DB_USER="..."
DB_PASSWORD="..."
DB_HOST="..."
DB_PORT="..."
DB_DATABASE="..."

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?"
```
- `DB_USER`: The user of the database.
- `DB_PASSWORD`: `DB_USER`'s password for the database.
- `DB_HOST`: The host address of the machine in which the database runs (for example `localhost`).
- `DB_PORT`: The port to which the database endpoint listens.
- `DB_DATABASE`: The database name.

After that, you can generate the Prisma client with the following command:

```
npx prisma generate
```

You can check the database's status in the browser with Prisma Studio by entering the following command:

```
npx prisma studio
```

Now you should be able to start the development server with the options provided by the `npm` scripts:

- `npm run dev`: Start the server in development mode (hot reloading with `nodemon`)

## Testing

The testing framework used in this project is Jest (and Supertest for testing API requests).

Each route should have its own unit test file. In order to execute tests, launch

```
npm run test
```

Or if you want to test individual routes and modules:

```
npm run test -- <filename>
```