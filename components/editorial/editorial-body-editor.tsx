"use client";

import { useImperativeHandle } from "react";
import { deserializeMd, serializeMd } from "@platejs/markdown";
import { insertImage } from "@platejs/media";
import { Plate, usePlateEditor } from "platejs/react";
import { Toaster } from "sonner";
import { EditorKit } from "@/components/editor/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

export type EditorialBodyEditorHandle = {
  getMarkdown: () => string;
  setMarkdown: (markdown: string) => void;
  insertImage: (url: string) => void;
};

type EditorialBodyEditorProps = {
  id: string;
  initialMarkdown: string;
  ref?: React.Ref<EditorialBodyEditorHandle | null>;
};

export function EditorialBodyEditor({
  id,
  initialMarkdown,
  ref,
}: EditorialBodyEditorProps) {
  const editor = usePlateEditor({
    id,
    plugins: EditorKit,
    value: (instance) => deserializeMd(instance, initialMarkdown),
  });

  useImperativeHandle(ref, () => ({
    getMarkdown: () => serializeMd(editor),
    setMarkdown: (markdown: string) => {
      editor.tf.setValue(deserializeMd(editor, markdown));
    },
    insertImage: (url: string) => {
      if (!editor.selection) {
        const end = editor.api.end([]);
        if (end) editor.tf.select(end);
      }
      insertImage(editor, url);
      editor.tf.focus();
    },
  }));

  return (
    <>
      <Plate editor={editor}>
        <EditorContainer className="h-128 rounded-lg border">
          <Editor
            id={id}
            variant="none"
            className="min-h-112 px-6 py-4 text-base"
            placeholder="Write the article..."
          />
        </EditorContainer>
      </Plate>
      <Toaster />
    </>
  );
}
