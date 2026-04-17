"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlay, FiCopy, FiTrash2 } from "react-icons/fi";
import MonacoEditor from "@/Components/MonacoEditor";

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
  ruby: {
    name: "Ruby",
    code: 'puts "Hello, World!"',
    language: "ruby",
  },
  go: {
    name: "Go",
    code: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}',
    language: "go",
  },
  bash: {
    name: "Bash",
    code: 'echo "Hello, World!"',
    language: "bash",
  },
  c: {
    name: "C",
    code: '#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}',
    language: "c",
  },
  lua: {
    name: "Lua",
    code: 'print("Hello, World!")',
    language: "lua",
  },
};

export default function Debug() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.code);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCompatible, setIsCompatible] = useState(true);

  useEffect(() => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallViewport = typeof window !== "undefined" && window.innerWidth < 900;
    setIsCompatible(!(isMobileAgent || isSmallViewport));
  }, []);

  const executeCode = async () => {
    try {
      setLoading(true);
      setError("");
      setOutput("Executing...");

      // JavaScript runs directly in browser (instant!)
      if (language === "javascript") {
        setOutput(""); // Clear the "Executing..." message
        try {
          const consoleLogs = [];
          const mockConsole = {
            log: (...args) =>
              consoleLogs.push(
                args
                  .map((arg) =>
                    typeof arg === "object"
                      ? JSON.stringify(arg, null, 2)
                      : String(arg)
                  )
                  .join(" ")
              ),
            error: (...args) =>
              consoleLogs.push("ERROR: " + args.map((arg) => String(arg)).join(" ")),
            warn: (...args) =>
              consoleLogs.push("WARN: " + args.map((arg) => String(arg)).join(" ")),
          };

          const userFunction = new Function("console", code);
          userFunction(mockConsole);

          const output = consoleLogs.join("\n");
          setOutput(output || "Code executed successfully with no output.");
          setError("");
          setLoading(false);
          return;
        } catch (err) {
          setError(err.message || "JavaScript execution failed");
          setOutput("");
          setLoading(false);
          return;
        }
      }

      // Other languages: execute via API (no installation required!)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for API

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
        setError("⏱️ Execution timeout - code is taking too long to run. Try optimizing your code.");
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "🌐 Network error - Unable to reach execution service. Please check your internet connection and try again.",
        );
      } else {
        setError(err.message || "❌ Error executing code. Please try again.");
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

  if (!isCompatible) {
    return (
      <main className="min-h-dvh bg-background text-foreground px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto bg-surface border border-border rounded-3xl p-8 text-center shadow-xl dark:bg-surface">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Code Tester Not Available</h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Your current browser or device is not supported for the interactive code tester.
            You can still use other site features while we keep the tester optimized for compatible environments.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-foreground px-3 sm:px-4 py-6 sm:py-8">
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
            className="bg-surface backdrop-blur-lg border border-border rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col"
          >
            <div className="flex flex-col gap-4">
              {/* LANGUAGE SELECTOR */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-300">
                  Select Language
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 text-center  overflow-y-auto">
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
                <div className="w-full h-48 sm:h-60 md:h-80 border border-white/10 rounded-lg overflow-hidden bg-surface-muted/80 dark:bg-black/50">
                  <MonacoEditor
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
            className="bg-surface backdrop-blur-lg border border-border rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col min-h-96 sm:min-h-auto"
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
              <div className="flex-1 bg-surface-muted rounded-lg p-3 sm:p-4 border border-border overflow-y-auto font-mono text-xs sm:text-sm">
                {error ? (
                  <div className="text-red-300 whitespace-pre-wrap break-words space-y-2">
                    {error.split("\n").map((line, idx) => (
                      <div
                        key={idx}
                        className={`${
                          line.includes("ERROR") || line.includes("❌")
                            ? "text-red-400 font-semibold"
                            : line.includes("HINT") || line.includes("💡")
                              ? "text-yellow-400 font-semibold"
                              : line.includes("FIXES") || line.includes("🔧")
                                ? "text-blue-400 font-semibold"
                                : line.includes("📍")
                                  ? "text-cyan-300"
                                  : "text-red-300"
                        }`}
                      >
                        {line}
                      </div>
                    ))}
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
              <div className="text-xs text-gray-400 bg-surface-muted/70 rounded-lg p-2 sm:p-3 dark:bg-white/5">
                <p className="font-semibold mb-1">💡 Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Supports {Object.keys(LANGUAGES).length}+ languages</li>
                  <li>Use console.log/print for output</li>
                  <li>Timeout: 15 seconds max</li>
                  <li>If service is unavailable, try again in a few moments</li>
                  <li>Check your internet connection if errors occur</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FOOTER - QUICK SNIPPETS */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 pt-8 border-t border-white/20"
        >
          <div className="bg-gradient-to-r from-slate-900/50 via-blue-900/30 to-slate-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-400/20">
            {/* Footer Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                Quick Test Examples
              </h2>
              <p className="text-sm text-gray-400">
                Jump-start your coding with pre-built code snippets across multiple languages
              </p>
            </div>

            {/* Snippets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
              {[
                {
                  label: "Loop Test",
                  lang: "javascript",
                  snippet:
                    "for (let i = 1; i <= 5; i++) {\n  console.log('Number: ' + i);\n}",
                  icon: "🔄",
                },
                {
                  label: "Array Operation",
                  lang: "python",
                  snippet:
                    "numbers = [1, 2, 3, 4, 5]\nprint('Sum:', sum(numbers))\nprint('Average:', sum(numbers) / len(numbers))",
                  icon: "📊",
                },
                {
                  label: "Conditional Logic",
                  lang: "javascript",
                  snippet:
                    "const age = 25;\nif (age >= 18) {\n  console.log('Adult');\n} else {\n  console.log('Minor');\n}",
                  icon: "❓",
                },
                {
                  label: "Function Test",
                  lang: "python",
                  snippet:
                    "def greet(name):\n  return f'Hello, {name}!'\n\nprint(greet('World'))",
                  icon: "⚙️",
                },
                {
                  label: "Error Handling",
                  lang: "javascript",
                  snippet:
                    "try {\n  const x = 10 / 0;\n  console.log(x);\n} catch (error) {\n  console.log('Caught error:', error.message);\n}",
                  icon: "⚠️",
                },
                {
                  label: "String Manipulation",
                  lang: "python",
                  snippet:
                    "text = 'Hello World'\nprint('Original:', text)\nprint('Uppercase:', text.upper())\nprint('Reversed:', text[::-1])",
                  icon: "✨",
                },
              ].map((snippet, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setLanguage(snippet.lang);
                    setCode(snippet.snippet);
                    setOutput("");
                    setError("");
                  }}
                  className="text-left p-4 sm:p-5 rounded-xl bg-white/8 border border-blue-400/30 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xl">{snippet.icon}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-400/20 text-blue-200 group-hover:bg-cyan-400/30 transition-colors">
                      {snippet.lang.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-cyan-300 mb-1 group-hover:text-cyan-200 transition-colors">
                    {snippet.label}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    Click to load snippet
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Footer Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400">
                  {Object.keys(LANGUAGES).length}+
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Languages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">6</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Snippets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  15s
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Timeout</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">♾️</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Tests</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Text */}
          <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
            <p>
              💡 Pro Tip: Use these snippets to learn, test, and debug code in your preferred
              language
            </p>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}
