import {
  JSONContent,
  generateText,
  EditorContent,
  useEditor,
  Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./NoteEditor.module.css";
import { Note } from "./types";
import { extractTags } from "./utils";

const extensions = [StarterKit];

type Props = {
  note: Note;
  onChange: (content: JSONContent, title?: string, tags?: string[]) => void;
  extensions: any[];
  content: JSONContent;
};

const NoteEditor = ({ note, onChange }: Props) => {
  const editor = useEditor(
    {
      extensions,
      content: note.content,
      editorProps: {
        attributes: {
          class: styles.textEditor,
        },
      },
      onUpdate: ({ editor }) => {
        const editorContent = editor.getJSON();
        const firstNodeContent = editorContent.content?.[0];
        onChange(
          editorContent,
          firstNodeContent && generateText(firstNodeContent, extensions)
        );
      },
    },
    [note.id]
  );

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const generateAndDisplayTags = () => {
    if (!editor) return null;

    const tags = extractTags(editor.getHTML());
    const uniqueTags = Array.from(new Set(tags));
    return uniqueTags.map((tag) => <div key={tag}>#{tag}</div>);
  };

  const highlightContent = (text: Editor | null) => {
    //return text.replace(/\b(\d\w+)\b/g, '<span style="color: blue;"></span>');

    // console.log(text);

    return text?.getHTML() ? text.getHTML() : "";

    // if (text == null) {
    //   return "<div>No editor content available.</div>";
    // } else {
    //   const textHtml = text.getHTML();

    //   console.log(textHtml);

    //   const regex = /\b(\d\w+)\b/g;
    //   const returnText = textHtml.replace(
    //     regex,
    //     (match) => `<span style="color: yellow">${match}</span>`
    //   );

    //   console.log(returnText);

    //   // return returnText;

    //   return text.getHTML();

    //   return textHtml.replace(
    //     regex,
    //     (match) => `<span style="color: yellow">${match}</span>`
    //   );
    // }

    // console.log("else");

    //return "";

    // const regex = /\b(\d\w+)\b/g;
    // return text.replace(
    //   regex,
    //   (match) => `<span style="color: yellow">${match}</span>`
    // );
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          className={
            editor?.isActive("bold")
              ? styles.toolbarButtonActive
              : styles.toolbarButton
          }
          onClick={toggleBold}
        >
          Bold
        </button>
        <button
          className={
            editor?.isActive("italic")
              ? styles.toolbarButtonActive
              : styles.toolbarButton
          }
          onClick={toggleItalic}
        >
          Italic
        </button>
      </div>
      {/* <EditorContent
        editor={editor}
        className={styles.textEditorContent}
        //content={highlightContent(editor)}
        dangerouslySetInnerHTML={{
          __html: highlightContent(editor)
        }}
      /> */}

      <EditorContent
        editor={editor}
        className={styles.textEditorContent}
        content={highlightContent(editor)}
        // dangerouslySetInnerHTML={{ __html: highlightContent(editor) }}
      />

      <div className={styles.tagsContainer}>{generateAndDisplayTags()}</div>
    </div>
  );
};

export default NoteEditor;
