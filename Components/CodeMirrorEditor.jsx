"use client";

import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { php } from "@codemirror/lang-php";

import { oneDark } from "@codemirror/theme-one-dark";

import { autocompletion } from "@codemirror/autocomplete";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";

import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";

const languageMap = {
  javascript: javascript,
  python: python,
  html: html,
  sql: sql,
  cpp: cpp,
  java: java,
  rust: rust,
  php: php,
  go: javascript,
  csharp: javascript,
  ruby: javascript,
  kotlin: javascript,
  swift: javascript,
  r: javascript,
  bash: javascript,
};

export default function CodeMirrorEditor({
  code,
  onChange,
  language = "javascript",
  readOnly = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;

    const languageSupport = languageMap[language]
      ? languageMap[language]()
      : javascript();

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      foldGutter(),
      history(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle),
      bracketMatching(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      languageSupport,
      autocompletion(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.editable.of(!readOnly),
      oneDark,
    ];

    const state = EditorState.create({
      doc: code,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, readOnly, onChange]);

  useEffect(() => {
    if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code,
        },
      });
    }
  }, [code]);

  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}