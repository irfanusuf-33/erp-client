"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, Bold, Italic, Underline, Link, List, Paragraph, Heading, Essentials, Indent, BlockQuote, Table, TableToolbar, FontColor, FontBackgroundColor, Alignment } from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const ckConfig = {
  licenseKey: "GPL",
  plugins: [Essentials, Bold, Italic, Underline, Link, List, Paragraph, Heading, Indent, BlockQuote, Table, TableToolbar, FontColor, FontBackgroundColor, Alignment],
  toolbar: ["heading", "|", "bold", "italic", "underline", "|", "fontColor", "fontBackgroundColor", "|", "alignment", "|", "bulletedList", "numberedList", "indent", "outdent", "|", "link", "blockQuote", "insertTable", "|", "undo", "redo"],
  table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
};

export default function CKEditorWrapper({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <>
      <style>{`.ck-editor__editable { min-height: 250px !important; }`}</style>
      <CKEditor
      editor={ClassicEditor}
      data={value}
      onChange={(_event: any, editor: any) => onChange(editor.getData())}
      config={ckConfig}
    />
    </>
  );
}
