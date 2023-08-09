//import { Content } from "@tiptap/react";

import { JSONContent } from "@tiptap/react";

export type Note = {
  id: string;
  title: string;
  content: JSONContent;
  updateAt: Date;
  tags: string[];
};
