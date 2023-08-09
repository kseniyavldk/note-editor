import { JSONContent } from "@tiptap/react";

export const extractTags = (content: string): string[] => {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  return matches ? matches.map((match) => match.slice(1)) : [];
};

export const generateText = (content: JSONContent): string => {
  const contentString = JSON.stringify(content);

  const tagRegex = /<[^>]*>/g;
  return contentString.replace(tagRegex, "");
};
