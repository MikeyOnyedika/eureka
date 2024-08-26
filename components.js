import { getAllNotes, deleteNote } from "./db.js";
import { getDOMEls, openNoteForm, store } from "./uiStore.js";

export async function renderNotesList(notesList) {
  const res = await getAllNotes();
  // Render notes onto the notesList on success
  if (res.status === "success") {
    const { noNotesNoticeEl } = getDOMEls();
    if (res.data.length === 0) {
      noNotesNoticeEl.dataset.listEmpty = true;
    } else {
      noNotesNoticeEl.dataset.listEmpty = false;
      res.data.forEach((note) => notesList.appendChild(NoteItem({ ...note })));
    }
  } else {
    alert("Couldn't fetch notes");
  }
}

export function NoteItem(note) {
  const { id, date, title, description } = note;
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    year: "numeric",
    day: "2-digit",
  });
  const fDate = formatter.format(new Date(date));

  // create the li element
  const listItem = document.createElement("li");
  listItem.id = id;

  // Create the div element
  const noteItem = document.createElement("div");
  noteItem.id = id;
  noteItem.className = "note-item";

  // Create the date and button container
  const dateContainer = document.createElement("div");
  const dateParagraph = document.createElement("p");
  dateParagraph.textContent = fDate;
  const buttonContainer = document.createElement("div");
  const editButton = document.createElement("button");
  editButton.className = "edit-btn";
  editButton.textContent = "edit";
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "delete";
  buttonContainer.appendChild(editButton);
  buttonContainer.appendChild(deleteButton);
  dateContainer.appendChild(dateParagraph);
  dateContainer.appendChild(buttonContainer);

  // Create the title and description elements
  const titleElement = document.createElement("h3");
  titleElement.className = "title";
  titleElement.textContent = title;
  const descriptionElement = document.createElement("p");
  descriptionElement.className = "description";
  descriptionElement.textContent = description;

  // put the div inside the li element
  listItem.appendChild(noteItem);

  // Append the elements to the root div
  noteItem.appendChild(dateContainer);
  noteItem.appendChild(titleElement);
  noteItem.appendChild(descriptionElement);

  const { notesFormTitleEl, notesFormDescriptionEl } = getDOMEls();
  // add event listener on the edit-btn
  editButton.addEventListener("click", async (e) => {
    // set selectedNote to the current note
    store.selectedNote = note;
    // open noteform; opens in edit mode because setting store.selectedNote also sets the noteFormMode
    openNoteForm();
    // pass the title and description of the note to be edited into the noteForm. Set notes form mode to "edit"
    notesFormTitleEl.value = store.selectedNote.title;
    notesFormDescriptionEl.value = store.selectedNote.description;
  });

  // add event listener to the delete-btn
  deleteButton.addEventListener("click", async (e) => {
    const res = await deleteNote(id);
    if (res.status === "success") {
      window.requestAnimationFrame(() => {
        listItem.remove();
        const { notesEls } = getDOMEls();
        // TODO: check if the notes list is empty, if so, display the no-notes-notice element
        if (notesEls.length === 0) {
          const { noNotesNoticeEl } = getDOMEls();
          noNotesNoticeEl.dataset.listEmpty = true;
        }
        alert("note has been deleted");
      });
    } else {
      alert("oops, note could not be deleted");
    }
  });

  return listItem;
}
