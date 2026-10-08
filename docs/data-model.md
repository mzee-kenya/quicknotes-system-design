
# QuickNotes Data Model

## Entities

The database contains four main entities:

### Users

The `users` table stores the accounts that use QuickNotes.

Columns:

- `user_id` - INTEGER, primary key
- `name` - TEXT, required
- `email` - TEXT, required and unique
- `created_at` - TEXT, required

### Notes

The `notes` table stores notes created by users.

Columns:

- `note_id` - INTEGER, primary key
- `user_id` - INTEGER, foreign key
- `title` - TEXT, required
- `body` - TEXT
- `created_at` - TEXT, required
- `updated_at` - TEXT, required

### Tags

The `tags` table stores reusable labels that can be assigned to notes.

Columns:

- `tag_id` - INTEGER, primary key
- `name` - TEXT, required and unique

### Note Tags

The `note_tags` table connects notes and tags.

Columns:

- `note_id` - INTEGER, foreign key
- `tag_id` - INTEGER, foreign key

The combination of `note_id` and `tag_id` is the primary key.

---

## Relationships

A user has a **one-to-many relationship** with notes.

One user can create many notes, while each note belongs to one user.

Notes and tags have a **many-to-many relationship**.

One note can have many tags, and one tag can be attached to many notes.

The `note_tags` table is required as a join table to represent this many-to-many
relationship.

---

## CREATE TABLE Statements

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (note_id, tag_id),

    FOREIGN KEY (note_id)
        REFERENCES notes(note_id),

    FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
);
```

## Example SQL Queries

### 1. Find all notes belonging to a user

```sql
SELECT *
FROM notes
WHERE user_id = 1;
```

### 2. Find notes with a specific title

```sql
SELECT note_id, title, created_at
FROM notes
WHERE title LIKE '%database%';
```

### 3. Find notes and their tags

This query uses a JOIN.

```sql
SELECT
    notes.title,
    tags.name AS tag
FROM notes
JOIN note_tags
    ON notes.note_id = note_tags.note_id
JOIN tags
    ON note_tags.tag_id = tags.tag_id;
```

### 4. Count notes for each user

```sql
SELECT
    users.name,
    COUNT(notes.note_id) AS note_count
FROM users
LEFT JOIN notes
    ON users.user_id = notes.user_id
GROUP BY users.user_id, users.name;
```

## Index

I would create an index on `notes.user_id`.

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This index would make it faster to retrieve all notes belonging to a particular
user, which is a common operation when displaying a user's notes.

## SQL or NoSQL?

I would choose SQL for QuickNotes because the system has clear relationships
between users, notes and tags. A user can own many notes, while notes and tags
have a many-to-many relationship. SQL databases provide foreign keys,
transactions, constraints and JOIN operations that are useful for maintaining
this structured data. SQL is therefore a good choice for maintaining data
integrity as the application grows.
