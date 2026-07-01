# Todo List

A clean, fast todo list app — **Spring Boot backend + a polished vanilla-JS frontend**, with **no database**. All data lives in memory for the lifetime of the process, so there's nothing to install or configure.

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green)

## Features

- **Full CRUD** — add, edit (inline), toggle complete, delete tasks
- **Priorities** — Low / Medium / High with colored badges
- **Filters** — All / Active / Completed
- **Live stats** — total, active, done, and a completion progress bar
- **Clear completed** in one click
- **Light / dark theme** — follows your OS preference, remembers your choice
- **Responsive** and keyboard-accessible, with subtle motion (respects `prefers-reduced-motion`)
- **No database** — in-memory, thread-safe store

## Requirements

- **Java 17+** (that's it — the bundled Maven Wrapper downloads Maven for you)

## Run it

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Then open **http://localhost:8080** — the frontend is served by the same server.

To build a runnable jar instead:

```bash
./mvnw clean package
java -jar target/todolist-1.0.0.jar
```

## REST API

Base path: `/api/todos`

| Method   | Path                     | Description                       |
|----------|--------------------------|-----------------------------------|
| `GET`    | `/api/todos`             | List all todos (newest first)     |
| `GET`    | `/api/todos/{id}`        | Get one todo                      |
| `POST`   | `/api/todos`             | Create a todo                     |
| `PUT`    | `/api/todos/{id}`        | Replace a todo                    |
| `PATCH`  | `/api/todos/{id}/toggle` | Flip the completed flag           |
| `DELETE` | `/api/todos/{id}`        | Delete one todo                   |
| `DELETE` | `/api/todos/completed`   | Delete all completed todos        |

**Create / update body:**

```json
{ "title": "Buy milk", "priority": "HIGH", "completed": false }
```

`priority` (`LOW` \| `MEDIUM` \| `HIGH`) and `completed` are optional and default
to `MEDIUM` and `false`. `title` is required (1–200 chars). Validation failures
return `400` with a `fields` map; unknown ids return `404` — both as consistent
JSON error bodies.

## Project structure

```
src/main/java/com/example/todolist/
├── TodoListApplication.java        # entry point
├── controller/TodoController.java  # REST endpoints
├── service/TodoService.java        # in-memory store + business logic
├── model/                          # Todo, TodoRequest, Priority
└── exception/                      # not-found + global error handling

src/main/resources/static/          # frontend (served at /)
├── index.html
├── css/style.css
└── js/app.js
```

## Notes

- Data is **not persisted** — restarting the server clears all todos. This is by
  design (the app is intentionally database-free).
