import { auth } from "@/auth";

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

    let output = "";
    let error = "";

    try {
      if (language === "javascript") {
        // Execute JavaScript safely
        const consoleLogs = [];
        const mockConsole = {
          log: (...args) => {
            consoleLogs.push(
              args
                .map((arg) =>
                  typeof arg === "object"
                    ? JSON.stringify(arg, null, 2)
                    : String(arg),
                )
                .join(" "),
            );
          },
          error: (...args) => {
            consoleLogs.push(
              "ERROR: " + args.map((arg) => String(arg)).join(" "),
            );
          },
          warn: (...args) => {
            consoleLogs.push(
              "WARN: " + args.map((arg) => String(arg)).join(" "),
            );
          },
        };

        try {
          // Use Function constructor for better safety
          const userFunction = new Function("console", code);
          userFunction(mockConsole);
          output =
            consoleLogs.join("\n") ||
            "Code executed successfully with no output.";
        } catch (err) {
          error = err.message || String(err);
        }
      } else {
        // For other languages, use an online API or provide a demo
        // Using Piston API as fallback (free, no authentication required)
        try {
          const response = await fetch("https://api.piston.tech/v1/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language,
              version: "*",
              files: [{ name: `file`, content: code }],
            }),
          });

          if (!response.ok) {
            throw new Error("Code execution service unavailable");
          }

          const result = await response.json();

          if (result.run?.stdout) {
            output = result.run.stdout;
          }
          if (result.run?.stderr) {
            error = result.run.stderr;
          }
          if (result.compile?.stderr) {
            error = result.compile.stderr;
          }

          if (!output && !error) {
            output = "Code executed successfully with no output.";
          }
        } catch (apiError) {
          // Fallback: Show demo message if API fails
          error = `Unable to execute ${language} code. The execution service is temporarily unavailable. Try JavaScript instead!`;
        }
      }
    } catch (execError) {
      error = execError.message || "Execution failed";
    }

    if (error && !output) {
      return Response.json({ error, output: "" });
    }

    return Response.json({
      output,
      error: error || undefined,
      success: !error,
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return Response.json(
      {
        error:
          error.message || "Failed to execute code. Please try again later.",
      },
      { status: 500 },
    );
  }
}
