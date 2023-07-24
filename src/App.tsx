import { JSONContent } from "@tiptap/react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { AiFillDelete } from "react-icons/Ai";
import styles from "./App.module.css";
import { Note } from "./types";
import storage from "./storage";
import debounce from "./debounce";
import NoteEditor from "./NoteEditor";

const STORAGE_KEY = "notes";

const loadNotes = () => {
  const noteIds = storage.get<string[]>(STORAGE_KEY, []);
  const notes: Record<string, Note> = {};
  noteIds.forEach((id) => {
    const note = storage.get<Note>(`${STORAGE_KEY}:${id}`);
    if (note) {
      notes[note.id] = {
        ...note,
        updateAt: new Date(note.updateAt),
      };
    }
  });
  return notes;
};

const saveNote = debounce((note: Note) => {
  const noteIds = storage.get<string[]>(STORAGE_KEY, []);
  const noteIdsWithoutNote = noteIds.filter((id) => id !== note.id);
  storage.set(STORAGE_KEY, [...noteIdsWithoutNote, note.id]);
  storage.set(`${STORAGE_KEY}:${note.id}`, note);
}, 200);

function App() {
  const [notes, setNotes] = useState<Record<string, Note>>(() => loadNotes());
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const activeNote = activeNoteId ? notes[activeNoteId] : null;

  const handleChangeNoteContent = (
    noteId: string,
    content: JSONContent,
    title = "New note"
  ) => {
    const updatedNote = {
      ...notes[noteId],
      updateAt: new Date(),
      content,
      title,
    };
    setNotes((notes) => ({
      ...notes,
      [noteId]: updatedNote,
    }));
    saveNote(updatedNote);
  };

  const handleCreateNewNote = () => {
    const newNote = {
      id: uuid(),
      title: "New note",
      content: `<h1>New note</h1>`,
      updateAt: new Date(),
    };
    setNotes((notes) => ({
      ...notes,
      [newNote.id]: newNote,
    }));
    setActiveNoteId(newNote.id);
    saveNote(newNote);
  };

  const handleChangeActiveNote = (id: string) => {
    setActiveNoteId(id);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => {
      const updatedNotes = { ...prevNotes };
      delete updatedNotes[noteId];
      return updatedNotes;
    });
    setActiveNoteId(null);
    storage.remove(`${STORAGE_KEY}:${noteId}`);
  };

  const notesList = Object.values(notes).sort(
    (a, b) => b.updateAt.getTime() - a.updateAt.getTime()
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <button className={styles.sidebarButton} onClick={handleCreateNewNote}>
          New Note
        </button>
        <div className={styles.sidebarList}>
          {notesList.map((note) => (
            <div
              key={note.id}
              className={
                note.id === activeNoteId
                  ? styles.sidebarItemActive
                  : styles.sidebarItem
              }
            >
              <div className={styles.sidebarItemContent}>
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.sidebarItemTitle}
                  onClick={() => handleChangeActiveNote(note.id)}
                >
                  {note.title}
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  <AiFillDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {activeNote ? (
        <NoteEditor
          note={activeNote}
          onChange={(content, title) =>
            handleChangeNoteContent(activeNote.id, content, title)
          }
        />
      ) : (
        <div>Create a new note or select an existing one.</div>
      )}
    </div>
  );
}

export default App;
