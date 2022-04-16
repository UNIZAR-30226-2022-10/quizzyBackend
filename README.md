# quizzyBackend
backend repository

## Technologies
- Express
- Prisma ORM
- Socket.io
- PostgreSQL
- and more to come...

## Setup

### Node.js server setup

**NOTE:** Requires Node.js LTS version

Go to the repository folder's root and enter this in the command line:
```
npm install
```
This will install all the packages and development dependencies for the project
in order to work properly.

### Database setup

This project uses PostgreSQL 14.2 for storing the data. You can install the database in two ways:

#### Dockerized database (recommended)

You only need to have docker and docker-compose installed on your machine. 

First of all, create a .env file in the `database` folder with the following variables:

```
POSTGRES_USER="..."
POSTGRES_PASSWORD="..."
POSTGRES_DB="..."
```

Now enter the following command on the console:

```
docker-compose up
```

And now you have the database ready for work!

#### Standalone database
This method is ideal if you already have a PostgreSQL instance on your machine. If you haven't, you will have to install a PostgreSQL 14.2 copy on your machine.

After that, initialize the PostgreSQL database (using the CLI `psql` client or with PgAdmin 4) with the following command:

```
\i database/insert.sql
```

### Putting it together

Once you have the database installed in your development environment, create a `.env` file in order for the [Prisma ORM](https://www.prisma.io/docs/getting-started/quickstart) to connect to the database properly. The template can be found here:

```bash
DB_USER="..."
DB_PASSWORD="..."
DB_HOST="..."
DB_PORT="..."
DB_DATABASE="..."
TOKEN_SECRET="..."

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?"
```
- `DB_USER`: The user of the database.
- `DB_PASSWORD`: `DB_USER`'s password for the database.
- `DB_HOST`: The host address of the machine in which the database runs (for example `localhost`).
- `DB_PORT`: The port to which the database endpoint listens.
- `DB_DATABASE`: The database name.
- `TOKEN_SECRET`: The secret value for signing JWTs.

Following that, generate the model if you haven't done that already:
```
npx prisma db pull
```
After generating the model, you can generate the Prisma client with the following command:

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