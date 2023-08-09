import { JSONContent } from "@tiptap/react";
import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { AiFillDelete } from "react-icons/Ai";
import styles from "./App.module.css";
import { Note } from "./types";
import storage from "./storage";
import debounce from "./debounce";
import NoteEditor from "./NoteEditor";
import { extractTags } from "./utils";
import { generateText } from "./utils";
import StarterKit from "@tiptap/starter-kit";
import Multiselect from "multiselect-react-dropdown";

const extensions = [StarterKit];
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
      content: content,
      title,
      tags: extractTags(generateText(content)),
    };
    setNotes((notes) => ({
      ...notes,
      [noteId]: updatedNote,
    }));
    saveNote(updatedNote);
  };

  const handleCreateNewNote = () => {
    const defaultContent = JSON.parse(
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"New note"}]}]}'
    );

    const newNote = {
      id: uuid(),
      title: "New note",
      content: defaultContent,
      updateAt: new Date(),
      tags: [],
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
    console.log(options);
    console.log("handleChangeActiveNote");
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

  const options = useMemo(() => {
    return Object.keys(notes)
      .reduce<string[]>((allTags, noteId) => {
        return allTags.concat(notes[noteId].tags);
      }, [])
      .filter((tag, index, allTags) => allTags.indexOf(tag) === index)
      .map((tag) => ({
        name: tag,
        id: tag,
      }));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <Multiselect
          options={options}
          /* selectedValues={this.state.selectedValue} 
          onSelect={this.onSelect} 
          onRemove={this.onRemove}  */
          className={styles.multiselect}
          displayValue="name"
        />
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
          extensions={extensions}
          content={{
            type: "doc",
            content: [],
          }}
        />
      ) : (
        <div className={styles.noteWrite}>
          <p>Create a new note or select an existing one.</p>
          {/* <img src="../src/public/iconwritting.png" alt="Example Image" /> */}
        </div>
      )}
    </div>
  );
}
export default App;
