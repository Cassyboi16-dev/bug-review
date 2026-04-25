"use client";

import { useEffect, useRef, useState } from "react";

const LANGUAGE_LABELS = {
  bash: "Bash",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  go: "Go",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  php: "PHP",
  python: "Python",
  ruby: "Ruby",
  rust: "Rust",
  sql: "SQL",
  swift: "Swift",
  tsx: "TSX",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
};

const LANGUAGE_ALIASES = {
  c: "cpp",
  cs: "csharp",
  csharp: "csharp",
  html: "html",
  js: "javascript",
  jsx: "jsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  tsx: "tsx",
  yml: "yaml",
};

const LANGUAGE_KEYWORDS = {
  bash: [
    "case",
    "do",
    "done",
    "echo",
    "elif",
    "else",
    "esac",
    "export",
    "fi",
    "for",
    "function",
    "if",
    "in",
    "local",
    "return",
    "then",
    "while",
  ],
  cpp: [
    "auto",
    "bool",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "delete",
    "else",
    "false",
    "for",
    "if",
    "include",
    "int",
    "namespace",
    "new",
    "nullptr",
    "private",
    "public",
    "return",
    "static",
    "std",
    "struct",
    "switch",
    "template",
    "this",
    "throw",
    "true",
    "try",
    "using",
    "void",
    "while",
  ],
  csharp: [
    "async",
    "await",
    "bool",
    "class",
    "else",
    "false",
    "for",
    "foreach",
    "if",
    "int",
    "namespace",
    "new",
    "null",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "string",
    "this",
    "true",
    "using",
    "var",
    "void",
  ],
  css: [
    "display",
    "flex",
    "grid",
    "relative",
    "absolute",
    "fixed",
    "inherit",
    "important",
  ],
  go: [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "false",
    "for",
    "func",
    "go",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "struct",
    "switch",
    "true",
    "type",
    "var",
  ],
  java: [
    "class",
    "else",
    "extends",
    "false",
    "final",
    "for",
    "if",
    "implements",
    "import",
    "interface",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "this",
    "true",
    "void",
    "while",
  ],
  javascript: [
    "as",
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "delete",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "null",
    "of",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "undefined",
    "var",
    "while",
  ],
  json: ["false", "null", "true"],
  jsx: [
    "as",
    "async",
    "await",
    "const",
    "export",
    "false",
    "from",
    "function",
    "if",
    "import",
    "let",
    "new",
    "null",
    "return",
    "true",
    "undefined",
    "var",
  ],
  php: [
    "class",
    "echo",
    "else",
    "elseif",
    "false",
    "function",
    "if",
    "namespace",
    "new",
    "null",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "true",
    "use",
  ],
  python: [
    "and",
    "as",
    "async",
    "await",
    "class",
    "def",
    "elif",
    "else",
    "False",
    "for",
    "from",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "None",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "True",
    "try",
    "while",
    "with",
    "yield",
  ],
  ruby: [
    "begin",
    "class",
    "def",
    "do",
    "else",
    "elsif",
    "end",
    "false",
    "if",
    "module",
    "nil",
    "puts",
    "require",
    "return",
    "self",
    "true",
    "unless",
    "when",
  ],
  rust: [
    "async",
    "await",
    "const",
    "else",
    "enum",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "let",
    "loop",
    "match",
    "mod",
    "mut",
    "pub",
    "return",
    "self",
    "static",
    "struct",
    "trait",
    "true",
    "use",
    "while",
  ],
  sql: [
    "and",
    "as",
    "case",
    "delete",
    "from",
    "group",
    "having",
    "insert",
    "into",
    "join",
    "limit",
    "not",
    "null",
    "on",
    "or",
    "order",
    "select",
    "set",
    "table",
    "update",
    "values",
    "where",
  ],
  swift: [
    "class",
    "else",
    "enum",
    "extension",
    "false",
    "for",
    "func",
    "if",
    "import",
    "in",
    "let",
    "nil",
    "private",
    "protocol",
    "public",
    "return",
    "self",
    "struct",
    "true",
    "var",
  ],
  typescript: [
    "as",
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "else",
    "enum",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "implements",
    "import",
    "interface",
    "let",
    "new",
    "null",
    "private",
    "protected",
    "public",
    "readonly",
    "return",
    "static",
    "this",
    "throw",
    "true",
    "try",
    "type",
    "undefined",
    "var",
    "while",
  ],
  tsx: [
    "as",
    "async",
    "await",
    "const",
    "export",
    "extends",
    "false",
    "from",
    "function",
    "if",
    "import",
    "interface",
    "let",
    "new",
    "null",
    "return",
    "true",
    "type",
    "undefined",
    "var",
  ],
  yaml: ["false", "null", "true"],
};

const TOKEN_CLASSNAMES = {
  comment: "text-slate-400",
  function: "text-sky-400",
  keyword: "text-cyan-300",
  number: "text-amber-300",
  plain: "text-foreground",
  string: "text-emerald-300",
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeLanguage(language) {
  if (!language) return "";
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] || normalized;
}

export function formatLanguageLabel(language) {
  const normalized = normalizeLanguage(language);
  if (!normalized) return "Plain text";
  return LANGUAGE_LABELS[normalized] || language.trim();
}

function getCommentPattern(language) {
  if (["python", "ruby", "bash", "yaml"].includes(language)) {
    return "#.*$";
  }
  if (language === "sql") {
    return "--.*$";
  }
  if (["html", "xml"].includes(language)) {
    return "<!--.*?-->";
  }
  return "\\/\\/.*$";
}

function getTokenRegex(language) {
  const normalized = normalizeLanguage(language);
  const keywords = LANGUAGE_KEYWORDS[normalized] || LANGUAGE_KEYWORDS.javascript;
  const keywordPattern = keywords.length
    ? `\\b(?:${keywords.map(escapeRegex).join("|")})\\b`
    : null;
  const parts = [
    getCommentPattern(normalized),
    "\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`",
  ];

  if (keywordPattern) parts.push(keywordPattern);

  parts.push("\\b\\d+(?:\\.\\d+)?\\b");
  parts.push("\\b[A-Za-z_][\\w$]*(?=\\s*\\()");

  return new RegExp(parts.join("|"), "gm");
}

function getTokenType(token, language) {
  const normalized = normalizeLanguage(language);

  if (
    token.startsWith("//") ||
    token.startsWith("#") ||
    token.startsWith("--") ||
    token.startsWith("<!--")
  ) {
    return "comment";
  }

  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'")) ||
    (token.startsWith("`") && token.endsWith("`"))
  ) {
    return "string";
  }

  if (/^\d+(?:\.\d+)?$/.test(token)) {
    return "number";
  }

  const keywords =
    LANGUAGE_KEYWORDS[normalized] || LANGUAGE_KEYWORDS.javascript || [];
  if (keywords.includes(token)) {
    return "keyword";
  }

  if (/^[A-Za-z_][\w$]*$/.test(token)) {
    return "function";
  }

  return "plain";
}

function tokenizeLine(line, language) {
  const regex = getTokenRegex(language);
  const tokens = [];
  let cursor = 0;
  let match = regex.exec(line);

  while (match) {
    const value = match[0];
    const start = match.index;

    if (start > cursor) {
      tokens.push({ value: line.slice(cursor, start), type: "plain" });
    }

    tokens.push({ value, type: getTokenType(value, language) });
    cursor = start + value.length;
    match = regex.exec(line);
  }

  if (cursor < line.length) {
    tokens.push({ value: line.slice(cursor), type: "plain" });
  }

  if (!tokens.length) {
    tokens.push({ value: " ", type: "plain" });
  }

  return tokens;
}

function HighlightedCode({ code, language, compact = false }) {
  const lines = (code || "").replace(/\r\n/g, "\n").split("\n");

  return (
    <pre
      className={`overflow-x-auto whitespace-pre-wrap break-words font-mono ${
        compact ? "text-xs leading-5" : "text-sm leading-6"
      }`}
    >
      <code>
        {lines.map((line, lineIndex) => (
          <span key={`line-${lineIndex}`} className="block min-h-[1.5em]">
            {tokenizeLine(line, language).map((token, tokenIndex) => (
              <span
                key={`token-${lineIndex}-${tokenIndex}`}
                className={TOKEN_CLASSNAMES[token.type] || TOKEN_CLASSNAMES.plain}
              >
                {token.value}
              </span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function CodeSnippetPreview({
  code,
  language,
  compact = false,
  className = "",
  allowCopy = true,
}) {
  const [copied, setCopied] = useState(false);
  if (!code?.trim()) return null;

  const copyCode = async () => {
    if (!allowCopy) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface-muted/70 ${className}`.trim()}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Code snippet
        </span>
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          {!allowCopy && (
            <span className="rounded-full border border-border px-2 py-0.5">
              Copy locked
            </span>
          )}
          <span>{formatLanguageLabel(language)}</span>
        </div>
      </div>
      {allowCopy && (
        <div className="flex justify-end px-3 pt-2">
          <button
            type="button"
            onClick={copyCode}
            className="text-[11px] font-semibold text-primary-500 hover:underline"
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      )}
      <div className="px-3 py-3">
        <HighlightedCode code={code} language={language} compact={compact} />
      </div>
    </div>
  );
}

export function CodeSnippetEditor({
  value,
  onChange,
  language,
  placeholder,
  rows = 8,
}) {
  const overlayRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.scrollTop = 0;
    overlayRef.current.scrollLeft = 0;
  }, [language]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface-muted/70">
      <div className="absolute right-3 top-3 z-20">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value || "");
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          }}
          className="text-[11px] font-semibold text-primary-500 hover:underline"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      {!value && (
        <div className="pointer-events-none absolute inset-x-0 top-0 px-4 py-3 pr-24 text-sm text-text-muted">
          {placeholder}
        </div>
      )}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-auto px-4 py-3"
      >
        <HighlightedCode code={value || " "} language={language} />
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => {
          if (!overlayRef.current) return;
          overlayRef.current.scrollTop = event.currentTarget.scrollTop;
          overlayRef.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
        rows={rows}
        spellCheck={false}
        className="relative z-10 w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-transparent caret-foreground outline-none selection:bg-primary-500/30"
      />
    </div>
  );
}

export function RichTextWithCode({ text, className = "" }) {
  if (!text?.trim()) return null;

  const blocks = [];
  const regex = /```([\w#+-]*)\n([\s\S]*?)```/g;
  let cursor = 0;
  let match = regex.exec(text);

  while (match) {
    if (match.index > cursor) {
      blocks.push({
        type: "text",
        value: text.slice(cursor, match.index).trim(),
      });
    }

    blocks.push({
      type: "code",
      language: match[1],
      value: match[2].replace(/\n$/, ""),
    });

    cursor = match.index + match[0].length;
    match = regex.exec(text);
  }

  if (cursor < text.length) {
    blocks.push({ type: "text", value: text.slice(cursor).trim() });
  }

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <CodeSnippetPreview
              key={`block-${index}`}
              code={block.value}
              language={block.language}
            />
          );
        }

        if (!block.value) return null;

        return (
          <p
            key={`block-${index}`}
            className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85"
          >
            {block.value}
          </p>
        );
      })}
    </div>
  );
}
