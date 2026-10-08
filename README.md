```markdown
# QuickNotes System Design

QuickNotes is a system-design project for building an online note-taking
service. The project has two main parts: a browser-based API client using the
JSONPlaceholder practice API and system-design documents describing how a real
QuickNotes backend could be built for approximately 1 million users.

## Project Structure

```text
quicknotes-system-design/
│
├── index.html
├── api.js
├── style.css
├── README.md
│
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Features

The API client can:

- Load 10 notes using GET.
- Display note titles and bodies.
- Create notes using POST.
- Delete notes using DELETE.
- Show loading, success, error and empty states.
- Validate note titles.
- Disable buttons while requests are running.
- Safely display API data using `textContent`.

## How to Run the API Client

1. Clone the repository:

```bash
git clone https://github.com/mzee-kenya/quicknotes-system-design.git
```

2. Open the project folder.

3. Open `index.html` in a browser.

For the best development experience, the project can also be opened using
VS Code Live Server.

The API client uses the JSONPlaceholder practice API, so an internet connection
is required for API requests.

## System Design Documents

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I Learned

### 1. Working with APIs

I learned how a frontend application can communicate with an API using
`fetch`, HTTP methods and JSON. I also learned how to handle successful and
failed HTTP responses.

### 2. Database Design

I learned how to identify entities and relationships and represent them using
primary keys, foreign keys and join tables. I also learned why indexes are
important for frequently used queries.

### 3. System Architecture

I learned how components such as load balancers, caches, read replicas,
queues and workers can be combined to build a system that can scale.

### 4. Git and Project Organization

I learned how meaningful commits can show the development history of a project
and how documentation can help backend engineers understand a system before
implementation begins.

## Project Goal

The goal of this project is not only to build a working API client but also to
demonstrate how QuickNotes could evolve into a reliable and scalable online
service.
```