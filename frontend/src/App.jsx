import { useState, useEffect } from "react";

const CLAUDE_INPUT_ONE =
  "What are the five most important news stories today? Your audience is an intelligent and educated American. The format of your repsponse is exactly five paragraphs, each paragraph is a summary of the most important news story. I repeat, your response is exactly five paragraphs, one for each news story.";

const CLAUDE_INPUT_TWO_PREFIX =
  "Write five entire news articles based on the five quick paragraphs given below, one article per paragraph. " +
  "Make it real, using real life and up to date information. Put it in the style of a New York Times article.\n\n";

async function askClaude(prompt) {
  const res = await fetch("http://localhost:3001/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data.response;
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [initResponse1, setInitResponse1] = useState("");
  const [initResponse2, setInitResponse2] = useState("");
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    async function runInitialQueries() {
      try {
        const response1 = await askClaude(CLAUDE_INPUT_ONE);
        setInitResponse1(response1);

        const response2 = await askClaude(CLAUDE_INPUT_TWO_PREFIX + response1);
        setInitResponse2(response2);
      } catch (err) {
        setInitError(err.message);
      } finally {
        setInitLoading(false);
      }
    }
    runInitialQueries();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResponse(data.response);
      }
    } catch {
      setError("Could not reach the backend. Is it running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Ask Claude</h1>

      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <strong>Initial Prompt:</strong>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
            {CLAUDE_INPUT_ONE}
          </p>
        </div>

        {initLoading ? (
          <p style={{ color: "#888" }}>Running initial queries...</p>
        ) : initError ? (
          <p style={{ color: "red" }}>Error: {initError}</p>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>News Summaries:</strong>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
                {initResponse1}
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Full Articles:</strong>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
                {initResponse2}
              </p>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          style={{ width: "100%", fontSize: 16, padding: 8, boxSizing: "border-box" }}
          placeholder="Type your question here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 8, padding: "8px 20px", fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 16 }}>Error: {error}</p>
      )}

      {response && (
        <div style={{ marginTop: 24 }}>
          <strong>Claude says:</strong>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{response}</p>
        </div>
      )}
    </div>
  );
}
