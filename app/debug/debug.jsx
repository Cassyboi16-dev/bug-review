"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlay, FiCopy, FiTrash2 } from "react-icons/fi";
import CodeMirrorEditor from "@/Components/CodeMirrorEditor";

const LANGUAGES = {
  javascript: {
    name: "JavaScript",
    code: "console.log('Hello, World!');",
    language: "javascript",
  },
  python: {
    name: "Python",
    code: "print('Hello, World!')",
    language: "python",
  },
  java: {
    name: "Java",
    code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
    language: "java",
  },
  cpp: {
    name: "C++",
    code: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}',
    language: "cpp",
  },
  csharp: {
    name: "C#",
    code: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}',
    language: "csharp",
  },
  php: {
    name: "PHP",
    code: '<?php\necho "Hello, World!";\n?>',
    language: "php",
  },
  ruby: { name: "Ruby", code: 'puts "Hello, World!"', language: "ruby" },
  go: {
    name: "Go",
    code: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}',
    language: "go",
  },
  rust: {
    name: "Rust",
    code: 'fn main() {\n  println!("Hello, World!");\n}',
    language: "rust",
  },
  kotlin: {
    name: "Kotlin",
    code: 'fun main() {\n  println("Hello, World!")\n}',
    language: "kotlin",
  },
  swift: { name: "Swift", code: 'print("Hello, World!")', language: "swift" },
  r: { name: "R", code: 'print("Hello, World!")', language: "r" },
  bash: { name: "Bash", code: 'echo "Hello, World!"', language: "bash" },
  html: {
    name: "HTML",
    code: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>",
    language: "html",
  },
  sql: {
    name: "SQL",
    code: 'SELECT "Hello, World!" as greeting;',
    language: "sql",
  },
};

export default function Debug() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.code);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeCode = async () => {
    try {
      setLoading(true);
      setError("");
      setOutput("Executing...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const result = await response.json();

        if (response.status === 401) {
          setError(
            "❌ You must be signed in to use the code tester. Please sign in and try again.",
          );
        } else {
          setError(result.error || "Failed to execute code");
        }
        setOutput("");
        return;
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setOutput("");
      } else if (result.output) {
        setOutput(result.output);
        setError("");
      } else {
        setOutput("Code executed successfully with no output.");
        setError("");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("⏱️ Execution timeout - code is taking too long to run");
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "🌐 Network error - Unable to reach execution service. Please check your connection and try again.",
        );
      } else {
        setError(err.message || "❌ Error executing code");
      }
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGES[lang].code);
    setOutput("");
    setError("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const clearCode = () => {
    setCode(LANGUAGES[language].code);
    setOutput("");
    setError("");
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2 sm:mb-3">
            {"<Code Snippet Tester />"}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Test your code snippets and debug errors in real-time
          </p>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* CODE EDITOR SECTION */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col"
          >
            <div className="flex flex-col gap-4">
              {/* LANGUAGE SELECTOR */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-300">
                  Select Language
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {Object.entries(LANGUAGES).map(([key, { name }]) => (
                    <button
                      key={key}
                      onClick={() => changeLanguage(key)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all truncate ${
                        language === key
                          ? "bg-emerald-500 text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                      title={name}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* CODE EDITOR */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs sm:text-sm font-semibold text-gray-300">
                  Code
                </label>
                <div className="w-full h-48 sm:h-60 md:h-80 border border-white/10 rounded-lg overflow-hidden bg-black/50">
                  <CodeMirrorEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={executeCode}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-blue-400 text-black font-semibold px-4 sm:px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-none"
                >
                  <FiPlay />
                  {loading ? "Running..." : "Execute"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyCode}
                  className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base flex-1 sm:flex-none"
                >
                  <FiCopy />
                  <span className="hidden sm:inline">Copy</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCode}
                  className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all text-sm sm:text-base flex-1 sm:flex-none"
                >
                  <FiTrash2 />
                  <span className="hidden sm:inline">Reset</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* CONSOLE OUTPUT SECTION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col min-h-96 sm:min-h-auto"
          >
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-300">
                  Console Output
                </label>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                    error
                      ? "bg-red-500/20 text-red-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {error ? "Error" : "Output"}
                </span>
              </div>

              {/* OUTPUT DISPLAY */}
              <div className="flex-1 bg-black/50 rounded-lg p-3 sm:p-4 border border-white/10 overflow-y-auto font-mono text-xs sm:text-sm">
                {error ? (
                  <div className="text-red-400 whitespace-pre-wrap break-words">
                    {error}
                  </div>
                ) : output ? (
                  <div className="text-emerald-300 whitespace-pre-wrap break-words">
                    {output}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Run your code to see output here...
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="text-xs text-gray-400 bg-white/5 rounded-lg p-2 sm:p-3">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Supports {Object.keys(LANGUAGES).length}+ languages</li>
                  <li>Use console.log/print for output</li>
                  <li>Timeout: 15 seconds</li>
                  <li>Perfect for debugging</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* QUICK SNIPPETS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-emerald-300 mb-4">
            Quick Test Examples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                label: "Loop Test",
                lang: "javascript",
                snippet:
                  "for (let i = 1; i <= 5; i++) {\n  console.log('Number: ' + i);\n}",
              },
              {
                label: "Array Operation",
                lang: "python",
                snippet:
                  "numbers = [1, 2, 3, 4, 5]\nprint('Sum:', sum(numbers))\nprint('Average:', sum(numbers) / len(numbers))",
              },
              {
                label: "Conditional Logic",
                lang: "javascript",
                snippet:
                  "const age = 25;\nif (age >= 18) {\n  console.log('Adult');\n} else {\n  console.log('Minor');\n}",
              },
              {
                label: "Function Test",
                lang: "python",
                snippet:
                  "def greet(name):\n  return f'Hello, {name}!'\n\nprint(greet('World'))",
              },
              {
                label: "Error Handling",
                lang: "javascript",
                snippet:
                  "try {\n  const x = 10 / 0;\n  console.log(x);\n} catch (error) {\n  console.log('Caught error:', error.message);\n}",
              },
              {
                label: "String Manipulation",
                lang: "python",
                snippet:
                  "text = 'Hello World'\nprint('Original:', text)\nprint('Uppercase:', text.upper())\nprint('Reversed:', text[::-1])",
              },
            ].map((snippet, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setLanguage(snippet.lang);
                  setCode(snippet.snippet);
                  setOutput("");
                  setError("");
                }}
                className="text-left p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-400/5 transition-all"
              >
                <p className="text-xs sm:text-sm font-semibold text-emerald-300 mb-1">
                  {snippet.label}
                </p>
                <p className="text-xs text-gray-400">
                  {snippet.lang.toUpperCase()}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
