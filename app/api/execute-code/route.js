import { auth } from "@/auth";

// Language execution commands - for validation only
const LANGUAGE_COMMANDS = {
  javascript: { name: "JavaScript", execution: "browser" },
  python: { name: "Python", execution: "api" },
  java: { name: "Java", execution: "api" },
  cpp: { name: "C++", execution: "api" },
  c: { name: "C", execution: "api" },
  csharp: { name: "C#", execution: "api" },
  php: { name: "PHP", execution: "api" },
  ruby: { name: "Ruby", execution: "api" },
  go: { name: "Go", execution: "api" },
  bash: { name: "Bash", execution: "api" },
  lua: { name: "Lua", execution: "api" },
};

// Error message hints for different languages
const ERROR_HINTS = {
  python: {
    "IndentationError": "Make sure your code indentation is consistent (use spaces or tabs, not both)",
    "NameError": "You're using a variable that hasn't been defined. Check the spelling and make sure it's declared",
    "TypeError": "You're using a value with a type that doesn't support that operation",
    "SyntaxError": "Check your code syntax. Make sure parentheses, brackets, and quotes are balanced",
  },
  java: {
    "error: cannot find symbol": "The class or variable you're using doesn't exist or hasn't been imported",
    "error: ';' expected": "Add a semicolon at the end of your statement",
    "error: class .* is public, should be declared in a file named": "The public class name must match the file name",
  },
  javascript: {
    "ReferenceError": "You're using a variable that hasn't been defined. Check spelling",
    "SyntaxError": "Check your code for missing braces, parentheses, or incorrect syntax",
    "TypeError": "You're trying to call something that isn't a function, or accessing a property incorrectly",
  },
  cpp: {
    "error: '.*' was not declared": "You need to declare this variable before using it",
    "error: expected ';'": "Add a semicolon at the end of your statement",
    "#include": "Make sure you're including the right headers for your functions",
  },
  php: {
    "Parse error": "Check for missing semicolons, parentheses, or quotes",
    "Fatal error": "There's a critical error - check if functions or classes exist",
    "Notice": "This is a warning - a variable might not be defined",
  },
  go: {
    "undefined": "The function or variable hasn't been declared",
  },
  ruby: {
    "undefined method": "The method you're calling doesn't exist or is misspelled",
  },
  bash: {
    "command not found": "Check the command spelling",
  },
  lua: {
    "nil value": "You're trying to use a nil (empty) value",
  },
  csharp: {
    "error CS": "Check your C# syntax and namespaces",
  },
  c: {
    "error: '.*' was not declared": "You need to declare this variable before using it",
  },
};

export async function POST(req) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return Response.json(
        { error: "Unauthorized: Please sign in to use the code tester" },
        { status: 401 },
      );
    }

    const { language, code } = await req.json();

    if (!language || !code) {
      return Response.json(
        { error: "Language and code are required" },
        { status: 400 },
      );
    }

    // Validate language
    if (!LANGUAGE_COMMANDS[language]) {
      return Response.json(
        {
          error: `Language '${language}' is not supported. Supported languages: ${Object.keys(LANGUAGE_COMMANDS).join(", ")}`,
        },
        { status: 400 },
      );
    }

    let output = "";
    let error = "";

    try {
      if (language === "javascript") {
        // Execute JavaScript locally (client-safe)
        output = executeJavaScript(code);
      } else {
        // Execute other languages via API (no installation required)
        const result = await executeViaAPI(language, code);
        output = result.output;
        error = result.error;
      }
    } catch (execError) {
      error = execError.message || "Execution failed";
    }

    // Format error with hints
    if (error) {
      error = formatErrorMessage(error, language);
    }

    return Response.json({
      output: output.trim() || (error ? "" : "Code executed successfully with no output."),
      error: error ? error.trim() : undefined,
      success: !error,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return Response.json(
      {
        error: error.message || "Failed to execute code. Please try again later.",
      },
      { status: 500 },
    );
  }
}

// Execute JavaScript safely
function executeJavaScript(code) {
  const consoleLogs = [];
  const mockConsole = {
    log: (...args) => {
      consoleLogs.push(
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ")
      );
    },
    error: (...args) => {
      consoleLogs.push("ERROR: " + args.map((arg) => String(arg)).join(" "));
    },
    warn: (...args) => {
      consoleLogs.push("WARN: " + args.map((arg) => String(arg)).join(" "));
    },
  };

  try {
    const userFunction = new Function("console", code);
    userFunction(mockConsole);
    return consoleLogs.join("\n");
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}

// Execute code via external API service (Judge0 or Piston)
async function executeViaAPI(language, code) {
  // Language mapping for Judge0 API
  const JUDGE0_LANGUAGES = {
    python: 71,      // Python 3
    java: 62,        // Java (OpenJDK 13.0.1)
    cpp: 54,         // C++ (GCC 9.2.0)
    c: 50,           // C (GCC 9.2.0)
    csharp: 51,      // C# (Mono 6.6.0.161)
    php: 68,         // PHP 7.4.1
    ruby: 71,        // Ruby 2.7.0
    go: 60,          // Go 1.13.5
    bash: 46,        // Bash 4.4.20
    lua: 64,         // Lua 5.3
  };

  const languageId = JUDGE0_LANGUAGES[language];
  if (!languageId) {
    throw new Error(`Language ${language} not supported in API`);
  }

  try {
    // Submit to Judge0
    const submitResponse = await fetch("https://judge0-ce.p.rapidapi.com/submissions", {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.JUDGE0_API_KEY || "",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: "",
      }),
      timeout: 5000,
    });

    if (!submitResponse.ok) {
      // Fallback to Piston API if Judge0 fails
      return executeViaPiston(language, code);
    }

    const submission = await submitResponse.json();
    const token = submission.token;

    // Poll for result with timeout
    let attempts = 0;
    const maxAttempts = 30; // ~15 seconds with 500ms intervals

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const resultResponse = await fetch(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_API_KEY || "",
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
          timeout: 5000,
        }
      );

      if (!resultResponse.ok) continue;

      const result = await resultResponse.json();

      if (result.status.id > 2) {
        // Compilation or execution complete
        let output = "";
        let error = "";

        if (result.status.id === 3) {
          // Accepted (status code 3)
          output = result.stdout ? Buffer.from(result.stdout, "base64").toString() : "";
        } else if (result.status.id === 4) {
          // Wrong Answer / Runtime Error
          error = result.stderr ? Buffer.from(result.stderr, "base64").toString() : result.compile_output ? Buffer.from(result.compile_output, "base64").toString() : "Execution failed";
        } else if (result.status.id === 5) {
          // Time Limit Exceeded
          error = "Execution timeout - code took too long to run";
        } else if (result.status.id === 6) {
          // Compilation Error
          error = result.compile_output ? Buffer.from(result.compile_output, "base64").toString() : "Compilation error";
        } else {
          error = result.stderr ? Buffer.from(result.stderr, "base64").toString() : "Execution failed";
        }

        return { output: output.trim(), error: error.trim() };
      }

      attempts++;
    }

    throw new Error("API request timeout - execution service is slow");
  } catch (error) {
    // Fallback to Piston if Judge0 fails
    console.warn("Judge0 failed, trying Piston API:", error.message);
    return executeViaPiston(language, code);
  }
}

// Fallback: Execute via Piston API with retry
async function executeViaPiston(language, code) {
  const PISTON_LANGUAGES = {
    python: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "csharp",
    php: "php",
    ruby: "ruby",
    go: "go",
    bash: "bash",
    lua: "lua",
  };

  const pistonLanguage = PISTON_LANGUAGES[language];
  if (!pistonLanguage) {
    throw new Error(`Language ${language} not supported`);
  }

  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://api.piston.tech/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLanguage,
          version: "*",
          files: [{ content: code }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      let output = result.run?.stdout || "";
      let error = result.compile?.stderr || result.run?.stderr || "";

      if (result.run?.signal) {
        error = (error || "Program terminated") + ` (Signal: ${result.run.signal})`;
      }

      return { output: output.trim(), error: error.trim() };
    } catch (apiError) {
      lastError = apiError;

      const isNetworkError =
        apiError.message?.includes("fetch") ||
        apiError.message?.includes("timeout") ||
        apiError.message?.includes("AbortError");

      if (isNetworkError && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      break;
    }
  }

  throw new Error(
    `Execution service temporarily unavailable. Please try again in a moment. (${lastError?.message})`
  );
}

// Format error message with helpful hints
function formatErrorMessage(errorMessage, language) {
  if (!errorMessage) return "";

  let formattedError = errorMessage;
  const hints = ERROR_HINTS[language] || {};

  // Extract line number if present
  const lineMatch = errorMessage.match(/line (\d+)|:(\d+):/);
  const lineNumber = lineMatch ? lineMatch[1] || lineMatch[2] : null;

  // Find matching hints
  let hint = "";
  for (const [keyword, hintText] of Object.entries(hints)) {
    if (errorMessage.includes(keyword)) {
      hint = hintText;
      break;
    }
  }

  // Format the error message
  let result = "❌ ERROR\n";
  result += "─".repeat(50) + "\n";
  result += formattedError;

  if (lineNumber) {
    result += `\n📍 Line: ${lineNumber}`;
  }

  if (hint) {
    result += `\n\n💡 HINT:\n${hint}`;
  }

  // Add common fixes
  const commonFixes = getCommonFixes(errorMessage, language);
  if (commonFixes.length > 0) {
    result += `\n\n🔧 COMMON FIXES:\n`;
    commonFixes.forEach((fix, idx) => {
      result += `${idx + 1}. ${fix}\n`;
    });
  }

  return result;
}

// Get common fixes based on error message
function getCommonFixes(errorMessage, language) {
  const fixes = [];

  if (errorMessage.includes("undefined") || errorMessage.includes("not defined")) {
    fixes.push("Declare the variable before using it");
    fixes.push("Check the spelling of the variable name");
    if (language === "javascript" || language === "typescript") {
      fixes.push("Make sure you imported the required module");
    }
  }

  if (errorMessage.includes("SyntaxError") || errorMessage.includes("Parse error")) {
    fixes.push("Check for missing or extra semicolons");
    fixes.push("Make sure all parentheses, brackets, and braces are balanced");
    fixes.push("Verify quotes are properly closed (both ' and \")");
  }

  if (errorMessage.includes("TypeError")) {
    fixes.push("Ensure you're calling a function (not a variable)");
    fixes.push("Check that the object has the property you're accessing");
    fixes.push("Verify the data type matches what the operation expects");
  }

  if (errorMessage.includes("IndentationError")) {
    fixes.push("Use consistent indentation throughout your code");
    fixes.push("Don't mix tabs and spaces");
    fixes.push("Ensure function and class bodies are properly indented");
  }

  if (errorMessage.includes("cannot find symbol") || errorMessage.includes("not declared")) {
    fixes.push("Import the necessary package or class");
    fixes.push("Check that you've declared the variable/function");
    fixes.push("Verify the class name matches exactly (case-sensitive)");
  }

  if (errorMessage.includes("expected")) {
    fixes.push("Add the missing character (usually a semicolon or parenthesis)");
    fixes.push("Review the line indicated in the error message");
  }

  if (errorMessage.includes("Timeout") || errorMessage.includes("timeout")) {
    fixes.push("Check for infinite loops (while(true), etc.)");
    fixes.push("Simplify your code");
    fixes.push("Add print statements to debug where it's stuck");
  }

  return fixes.slice(0, 3); // Return max 3 fixes
}
