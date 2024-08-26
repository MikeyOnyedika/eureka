import { generateId } from "./utils.js";
const dbName = "eureka";
const dbVersion = 1;
const NOTES_STORE_NAME = "notes";

async function connectDB() {
  return new Promise((resolve, reject) => {
    let alreadyResolved = false;
    const requestForDB = window.indexedDB.open(dbName, dbVersion);
    requestForDB.onerror = (event) => {
      reject(null);
    };

    requestForDB.onsuccess = (event) => {
      if (!alreadyResolved) {
        alreadyResolved = true;
        resolve(event.target.result);
      }
    };

    // triggered when the version number is changed or when you've just newly created the database
    // create the data stores here
    requestForDB.onupgradeneeded = function (event) {
      const db = event.target.result;

      // create a datastore to save notes
      const requestCreateNotesStore = db.createObjectStore(NOTES_STORE_NAME, {
        keyPath: "id",
      });
      // create an index on the title so that we can search using it
      requestCreateNotesStore.createIndex("title", "title", { unique: false });
      requestCreateNotesStore.transaction.oncomplete = function (event) {
        alreadyResolved = true;
        resolve(event.target.result);
      };
    };
  });
}

export async function addNote({ title, description }) {
  return new Promise(async (resolve, reject) => {
    const db = await connectDB();
    if (!db) {
      reject({
        status: "error",
        message: "couldn't connect to db",
      });
      return;
    }
    const date = new Date().toISOString();
    const id = generateId();

    const transaction = db.transaction([NOTES_STORE_NAME], "readwrite");
    transaction.onerror = (event) => {
      reject({
        status: "error",
        message: "Couldn't complete adding new note",
      });
    };

    const notesStore = transaction.objectStore(NOTES_STORE_NAME);
    const addRequest = notesStore.add({ id, title, description, date });
    addRequest.onsuccess = (event) => {
      const getNoteRequest = notesStore.get(id);
      getNoteRequest.onsuccess = (event) => {
        resolve({
          status: "success",
          data: event.target.result,
        });
      };
    };
  });
}

export async function getAllNotes() {
  return new Promise(async (resolve, reject) => {
    const db = await connectDB();
    if (!db) {
      reject({
        status: "error",
        message: "couldn't connect to db",
      });
      return;
    }
    const transaction = db.transaction([NOTES_STORE_NAME], "readonly");
    transaction.onerror = (event) => {
      reject({
        status: "error",
        message: "Failed to get notes; " + event.target.error?.message,
      });
    };
    const notesStore = transaction.objectStore(NOTES_STORE_NAME);
    notesStore.getAll().onsuccess = function (event) {
      resolve({
        status: "success",
        data: event.target.result,
      });
    };
  });
}

export async function deleteNote(noteID) {
  return new Promise(async (resolve, reject) => {
    const db = await connectDB();
    if (!db) {
      reject({
        status: "error",
        message: "couldn't connect to db",
      });
      return;
    }
    const transaction = db.transaction([NOTES_STORE_NAME], "readwrite");
    transaction.onerror = (event) => {
      reject({
        status: "error",
        message: "Failed to delete note; " + event.target.error?.message,
      });
    };
    const notesStore = transaction.objectStore(NOTES_STORE_NAME);
    notesStore.delete(noteID).onsuccess = (event) => {
      resolve({
        status: "success",
        data: noteID,
      });
    };
  });
}

export async function updateNote(note) {
  return new Promise(async (resolve, reject) => {
    const db = await connectDB();
    if (!db) {
      reject({
        status: "error",
        message: "couldn't connect to db",
      });
      return;
    }

    const transaction = db.transaction([NOTES_STORE_NAME], "readwrite");
    const notesStore = transaction.objectStore(NOTES_STORE_NAME);

    // get the old note object, update it, and put it back into the database
    const oldNoteRequest = notesStore.get(note.id);
    oldNoteRequest.onsuccess = (event) => {
      const oldNote = event.target.result;
      oldNote.title = note.title;
      oldNote.description = note.description;
      const updateNoteRequest = notesStore.put(oldNote);
      updateNoteRequest.onsuccess = (ev) => {
        resolve({
          status: "success",
          data: ev.target.result,
        });
      };
      updateNoteRequest.onerror = (ev) => {
        reject({
          status: "error",
          message: "couldn't update note",
        });
      };
    };
    oldNoteRequest.onerror = (event) => {
      reject({
        status: "error",
        message: "this note does not exist in db;",
      });
    };
  });
}
