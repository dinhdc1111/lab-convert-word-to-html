import Editor from "@monaco-editor/react";

export default function CodeBlock({ html, onChange }) {
  return (
    <Editor
      height="100%"
      defaultLanguage="html"
      theme="vs-dark"
      value={html}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        padding: { top: 10, bottom: 10 },
      }}
    />
  );
}
