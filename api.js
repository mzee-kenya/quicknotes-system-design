
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const notesList = document.querySelector("#notes-list");

let notes = [];

/*
 * Reusable function for making API requests.
 * It checks response.ok so HTTP errors are handled properly.
 */
async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // DELETE requests can return an empty response.
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

/*
 * Updates the status message and applies either
 * the success or error style.
 */
function showStatus(message, type = "") {
    statusMessage.textContent = message;

    statusMessage.classList.remove("success", "error");

    if (type) {
        statusMessage.classList.add(type);
    }
}

/*
 * Creates the HTML elements for one note.
 * textContent is used for user/API text to avoid injecting HTML.
 */
function createNoteElement(note) {
    const listItem = document.createElement("li");
    listItem.className = "note";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body || "";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", function () {
        deleteNote(note.id, listItem, deleteButton);
    });

    listItem.appendChild(title);
    listItem.appendChild(body);
    listItem.appendChild(deleteButton);

    return listItem;
}

/*
 * Displays all notes currently stored in the notes array.
 */
function renderNotes() {
    notesList.textContent = "";

    if (notes.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No notes available.";
        emptyMessage.className = "empty-state";

        notesList.appendChild(emptyMessage);
        return;
    }

    for (const note of notes) {
        notesList.appendChild(createNoteElement(note));
    }
}

/*
 * GET /posts?_limit=10
 */
async function loadNotes() {
    loadButton.disabled = true;
    showStatus("Loading notes...");

    try {
        const loadedNotes = await request(`${API_URL}?_limit=10`);

        notes = loadedNotes;

        renderNotes();

        showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    } catch (error) {
        showStatus(
            "Could not load notes. Please try again later.",
            "error"
        );

        console.error(error);
    } finally {
        loadButton.disabled = false;
    }
}

/*
 * POST /posts
 */
async function createNote(title, body) {
    submitButton.disabled = true;
    showStatus("Creating note...");

    try {
        const newNote = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        /*
         * JSONPlaceholder returns a simulated created note.
         * It does not permanently store POST requests.
         * We add the returned note to our local array so it
         * appears in the current browser session.
         */
        notes.unshift(newNote);

        renderNotes();

        showStatus(
            `Note created (status 201, id ${newNote.id}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        showStatus(
            "Could not create the note. Please try again.",
            "error"
        );

        console.error(error);
    } finally {
        submitButton.disabled = false;
    }
}

/*
 * DELETE /posts/{id}
 */
async function deleteNote(id, listItem, deleteButton) {
    deleteButton.disabled = true;
    showStatus("Deleting note...");

    try {
        await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        /*
         * JSONPlaceholder simulates DELETE requests and does not
         * permanently change its database. We therefore remove
         * the note from our local array and page after success.
         */
        notes = notes.filter(function (note) {
            return note.id !== id;
        });

        renderNotes();

        showStatus(
            `Note ${id} deleted successfully.`,
            "success"
        );
    } catch (error) {
        showStatus(
            "Could not delete the note. Please try again.",
            "error"
        );

        console.error(error);

        // Re-enable the button if deletion failed.
        deleteButton.disabled = false;
    }
}

/*
 * Validate the form before sending a POST request.
 */
noteForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (title === "") {
        showStatus("A note title is required.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus(
            "The title must be 100 characters or fewer.",
            "error"
        );
        titleInput.focus();
        return;
    }

    createNote(title, body);
});

/*
 * Load notes when the user clicks the Load Notes button.
 */
loadButton.addEventListener("click", loadNotes);
