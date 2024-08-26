import { addNote, updateNote } from "./db.js";
import { renderNotesList, NoteItem } from "./components.js";
import { getDOMEls, closeNoteForm, openNoteForm, store } from "./uiStore.js";
import { formMode } from "./constants.js";
const { noteForm, closeFormBtn, notesList, newnoteBtn, noNotesNoticeEl } =
  getDOMEls();

newnoteBtn.addEventListener("click", (e) => {
  openNoteForm();
});

closeFormBtn.addEventListener("click", (e) => {
  closeNoteForm();
});

noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { notesFormDescriptionEl: descriptionEl, notesFormTitleEl: titleEl } =
    getDOMEls();
  if (!titleEl.value || !descriptionEl.value) {
    alert("Title or description was not set");
    return;
  }
  if (store.noteFormMode === formMode.EDIT) {
    store.selectedNote.title = titleEl.value;
    store.selectedNote.description = descriptionEl.value;
    // updating the data in the database
    const res = await updateNote({
      ...store.selectedNote,
    });
    if (res.status === "success") {
      const noteEl = notesList.querySelector(`#${store.selectedNote.id}`);
      const noteTitle = noteEl.querySelector(".title");
      const noteDescription = noteEl.querySelector(".description");
      noteTitle.textContent = store.selectedNote.title;
      noteDescription.textContent = store.selectedNote.description;
      alert("Note updated successfully!");
    } else {
      alert(res.message);
    }
  } else {
    // saving the data to the database
    const res = await addNote({
      title: titleEl.value,
      description: descriptionEl.value,
    });
    if (res.status === "success") {
      titleEl.value = "";
      descriptionEl.value = "";
      alert("Note added successfully!");
      // add the new note to the DOM
      notesList.prepend(NoteItem(res.data));
      // hide the no-notes-notice element
      noNotesNoticeEl.dataset.listEmpty = false;
    } else {
      alert(res.message);
    }
  }
});

renderNotesList(notesList);
