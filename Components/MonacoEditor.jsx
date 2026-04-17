"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/50 flex items-center justify-center text-gray-400">
      Loading Editor...
    </div>
  ),
});

const LANGUAGE_CONFIG = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  go: "go",
  bash: "bash",
  c: "c",
  lua: "lua",
};

export default function MonacoEditor({
  code,
  onChange,
  language = "javascript",
  readOnly = false,
  className = "",
}) {
  const editorRef = useRef(null);
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  useEffect(() => {
    const updateEditorTheme = () => {
      const isDark = document.documentElement.classList.contains("dark") ||
        (!document.documentElement.classList.contains("light") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setEditorTheme(isDark ? "vs-dark" : "light");
    };

    updateEditorTheme();
    window.addEventListener("theme-change", updateEditorTheme);
    return () => window.removeEventListener("theme-change", updateEditorTheme);
  }, []);

  const handleEditorChange = (value) => {
    if (onChange && !readOnly) {
      onChange(value);
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const monacoLanguage = LANGUAGE_CONFIG[language] || "javascript";

  return (
    <div className={`w-full h-full ${className}`}>
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme={editorTheme}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Fira Code, "Monaco", "Courier New", monospace',
          lineNumbersMinChars: 2,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          smoothScrolling: true,
          cursorBlinking: "blink",
          autoIndent: "full",
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
      />
    </div>
  );
}
