# MawahebMena

This project is built as a monorepo using [Turborepo](https://turbo.build). The projects inside consist of a [Remix run](https://remix.run/) app for the frontend, a [NestJS](https://nestjs.com/) app for the backend.

## Project Structure

### The apps folder

The projetc is an npm project built with turbo repo. The `apps` directory contains the Remix run and NExtJS apps. Running `npm install` from the root directory will install all the dependencies in the `apps` directory. Each package/app is 100% [TypeScript](https://www.typescriptlang.org/)

## Getting started

Firstly, make sure the project has all of its dependencies. From the root directory, run:

```sh
npm install
```

This would install all the project's and apps' dependencies. no need to go inside the apps directory

To start dev mode, fron the root directory run:

```sh
npm run dev
```

## Frontend File structure

The bulk of the applicaiton code is present in the `routes` directory. Each file in this directory is a route itself, and each folder is a sub-route. All the components used by one route are present in thesame folder of that route, and the shared components are present in the `shared` folder outside the `routes`. This is indeed the [recommended Remix Run](https://remix.run/docs/en/main/file-conventions/routes#scaling) way.

# The Database

`# TODO`

# Documentation

## User Documentation

The `docs` folder is the full project's user manual. This explains how the app works. This is not a developer's documentation, rather it's about how the user would expect to interact with the full app. The code's documentation is separate.

The app docs are built with [Docusaurus](https://docusaurus.io/docs)

## Frontend Documentation

Using [StoryBook](https://storybook.js.org/) for documenting react components

`# TODO`

Using JSDocs

## API Documentation

Using [OpenAPI Specification](https://swagger.io/specification/) (formerly Swagger)

`# TODO`

## Database Documentation

The database is built with the ORM tool: [drizzle](https://orm.drizzle.team/).

The DB diagraming is done with [dbdiagram.io](dbdiagram.io)

`# TODO`

# Testing

`# TODO`
