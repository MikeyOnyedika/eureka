import { formMode, ssKeys } from "./constants.js";

class Store {
  #_noteFormMode;
  #_selectedNote;
  constructor() {
    this.noteFormMode = formMode.NEW;
    this.selectedNote = null;
  }
  get noteFormMode() {
    return this.#_noteFormMode;
  }
  set noteFormMode(newMode) {
    if (newMode !== formMode.NEW && newMode !== formMode.EDIT) {
      throw "Invalid mode";
    }
    window.sessionStorage.setItem(ssKeys.NOTE_FORM_MODE, newMode);
    this.#_noteFormMode = newMode;
  }
  get selectedNote() {
    return this.#_selectedNote;
  }
  set selectedNote(note) {
    // avoid json.stringify if note is set to null
    if (note === null) {
      // since no selectedNote, noteFormMode should be set to add a new note
      this.noteFormMode = formMode.NEW;
      window.sessionStorage.setItem(ssKeys.SELECTED_NOTE, note);
    } else {
      this.noteFormMode = formMode.EDIT;
      window.sessionStorage.setItem(ssKeys.SELECTED_NOTE, JSON.stringify(note));
    }
    this.#_selectedNote = note;
  }
}

export const store = new Store();

export function openNoteForm() {
  const { inputBox } = getDOMEls();
  inputBox.classList.add("input-box--note");
  inputBox.classList.remove("input-box--search");
  // update the text of the note form submit button to reflect form mode
  updateSubmitNoteBtn(store.noteFormMode);
}

function updateSubmitNoteBtn(mode) {
  const { submitNoteBtn } = getDOMEls();
  if (mode === formMode.EDIT) {
    submitNoteBtn.textContent = "update note";
    submitNoteBtn.value = "edit";
  } else {
    submitNoteBtn.textContent = "add note";
    submitNoteBtn.value = "add";
  }
}

export function closeNoteForm() {
  //reset the selectedNote which will also reset noteFormMode to new
  store.selectedNote = null;
  // clear the note form
  clearNotesForm();
  // close it
  const { inputBox } = getDOMEls();
  inputBox.classList.add("input-box--search");
  inputBox.classList.remove("input-box--note");
  // update the text of the note form submit button
  updateSubmitNoteBtn(formMode.NEW);
}

export function clearNotesForm() {
  const { notesFormDescriptionEl, notesFormTitleEl } = getDOMEls();
  notesFormDescriptionEl.value = "";
  notesFormTitleEl.value = "";
}

export function getDOMEls() {
  const noteForm = document.getElementById("note-form");
  const closeFormBtn = noteForm.querySelector("#closeForm");
  const notesList = document.getElementById("notes-list");
  const inputBox = document.getElementById("input-box");
  const newnoteBtn = document.getElementById("newnote");
  const notesEls = notesList.querySelectorAll(".note-item");
  const notesFormTitleEl = noteForm.querySelector("#note-title");
  const notesFormDescriptionEl = noteForm.querySelector("#note-desc");
  const submitNoteBtn = document.getElementById("submit-note");
  const noNotesNoticeEl = document.querySelector(".no-notes-notice");
  return {
    noteForm,
    closeFormBtn,
    notesList,
    inputBox,
    newnoteBtn,
    notesEls,
    notesFormDescriptionEl,
    notesFormTitleEl,
    noteFormMode: store,
    submitNoteBtn,
    noNotesNoticeEl,
  };
}
