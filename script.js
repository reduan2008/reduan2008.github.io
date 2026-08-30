const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
const GEMINI_API_KEY = "TU_API_KEY_AQUÍ";

const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const messagesContainer = document.getElementById("messages");
const thinkingIndicator = document.getElementById("thinking-indicator");
const newChatButton = document.getElementById("new-chat-button");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderCodeBlocks(content) {
  const escaped = escapeHtml(content);

  const withBlocks = escaped.replace(/```(\w+)?\s*([\s\S]*?)```/g, (_, language, code) => {
    const lang = (language || "text").trim();
    const cleaned = code.trim();

    return `
      <div class="code-block">
        <div class="code-header">
          <span>${lang}</span>
          <button class="copy-code-button" type="button" data-copy="${encodeURIComponent(cleaned)}">
            Copiar
          </button>
        </div>
        <pre><code>${cleaned}</code></pre>
      </div>
    `;
  });

  return withBlocks
    .replace(/\n/g, "<br>")
    .replace(/  /g, " &nbsp;");
}

function appendMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  if (role === "assistant") {
    bubble.innerHTML = renderCodeBlocks(content);
  } else {
    bubble.textContent = content;
  }

  row.appendChild(bubble);
  messagesContainer.appendChild(row);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setThinking(isThinking) {
  thinkingIndicator.classList.toggle("hidden", !isThinking);
}

async function sendMessage(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userMessage }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error al conectar con Gemini:", error);
    return "Error al conectar con la IA. Revisa la consola o la API Key.";
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";
  userInput.style.height = "auto";
  setThinking(true);

  try {
    const response = await sendMessage(text);
    appendMessage("assistant", response);
  } finally {
    setThinking(false);
  }
}

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 220)}px`;
});

chatForm.addEventListener("submit", handleSubmit);

newChatButton.addEventListener("click", () => {
  messagesContainer.innerHTML = "";
  appendMessage(
    "assistant",
    "Nuevo chat iniciado. Puedes empezar a escribir tu próxima pregunta."
  );
});

document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest(".copy-code-button");
  if (!copyButton) return;

  const raw = decodeURIComponent(copyButton.dataset.copy || "");
  try {
    await navigator.clipboard.writeText(raw);
    copyButton.textContent = "Copiado";
    setTimeout(() => {
      copyButton.textContent = "Copiar";
    }, 1200);
  } catch (error) {
    console.error("No se pudo copiar:", error);
    copyButton.textContent = "Error";
  }
});

appendMessage(
  "assistant",
  "Hola. Soy tu asistente de Gemini. Puedes preguntarme lo que quieras: programación, explicación de código, análisis, ideas o ayuda técnica."
);
