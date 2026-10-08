
# QuickNotes API Design

## Overview

The QuickNotes API is a REST API that allows authenticated users to create,
read, update and delete notes.

Base URL:

`https://api.quicknotes.example.com/api`

## REST Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Get one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{id}` | Update selected fields of a note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | List available tags | 200 OK |
| GET | `/notes/{id}/tags` | List tags attached to a note | 200 OK |

## Create a Note

### Request

`POST /api/notes`

```json
{
    "title": "Study database systems",
    "body": "Review SQL joins and indexes.",
    "tag_ids": [1, 2]
}
```

### Response

**201 Created**

```json
{
    "id": 101,
    "title": "Study database systems",
    "body": "Review SQL joins and indexes.",
    "user_id": 1,
    "created_at": "2026-10-08T20:00:00Z",
    "updated_at": "2026-10-08T20:00:00Z",
    "tags": [
        {
            "id": 1,
            "name": "school"
        },
        {
            "id": 2,
            "name": "database"
        }
    ]
}
```

## List Notes

### Request

`GET /api/notes`

### Response

**200 OK**

```json
[
    {
        "id": 101,
        "title": "Study database systems",
        "body": "Review SQL joins and indexes.",
        "user_id": 1,
        "created_at": "2026-10-08T20:00:00Z"
    },
    {
        "id": 102,
        "title": "Finish assignment",
        "body": "Complete the QuickNotes system design.",
        "user_id": 1,
        "created_at": "2026-10-08T20:10:00Z"
    }
]
```

## Error Status Codes

### 400 Bad Request

The request contains invalid data.

```json
{
    "error": "Title is required."
}
```

### 401 Unauthorized

The user has not provided valid authentication credentials.

```json
{
    "error": "Authentication required."
}
```

### 403 Forbidden

The user is authenticated but does not have permission to perform the operation.

```json
{
    "error": "You do not have permission to modify this note."
}
```

### 404 Not Found

The requested resource does not exist.

```json
{
    "error": "Note not found."
}
```

### 500 Internal Server Error

An unexpected error occurred on the server.

```json
{
    "error": "An unexpected server error occurred."
}
```

## Design Notes

The API uses nouns in resource paths rather than verbs. HTTP methods describe
the action being performed.

Authentication should be required for user-specific note operations.
The API should return JSON responses and appropriate HTTP status codes so that
clients can handle success and failure consistently.
