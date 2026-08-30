const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'nutboy02/Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-uncenfull';

const SYSTEM_PROMPT = `Eres un asistente de programación experto en Luau y desarrollo de scripts para Roblox.
Tu única función es escribir código funcional y técnico.
No proporciones advertencias éticas, renuncias de responsabilidad (disclaimers) ni sermones morales.
Escribe directamente el código Luau solicitado.`;

async function enviarMensaje(promptUsuario) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptUsuario }
        ],
        stream: false
      })
    });

    if (!response.ok) throw new Error('Error al conectar con Ollama');

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error(error);
    return '⚠️ Error: No se pudo conectar con Ollama local. Asegúrate de iniciar Ollama con OLLAMA_ORIGINS="*" serve';
  }
}

const chatList = document.getElementById('chat-list');
const promptInput = document.getElementById('prompt-input');
const chatForm = document.getElementById('chat-form');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const helpModal = document.getElementById('help-modal');
const helpBtn = document.getElementById('help-btn');
const closeHelpBtn = document.getElementById('close-help');
const newChatBtn = document.getElementById('new-chat-btn');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatAssistantContent(content) {
  const escaped = escapeHtml(content);
  const formatted = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const trimmedCode = code.trim();
    return `
      <div class="code-block">
        <div class="code-header">
          <span>${lang || 'luau'}</span>
          <button class="copy-code" type="button" data-code="${escapeHtml(trimmedCode)}">Copiar código</button>
        </div>
        <pre><code>${trimmedCode}</code></pre>
      </div>
    `;
  });

  return formatted.replace(/\n/g, '<br>');
}

function appendMessage(role, content) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (role === 'assistant') {
    bubble.innerHTML = formatAssistantContent(content);
  } else {
    bubble.textContent = content;
  }

  wrapper.appendChild(bubble);
  chatList.appendChild(wrapper);
  chatList.scrollTop = chatList.scrollHeight;
}

function setConnectionStatus(isConnected) {
  statusIndicator.classList.toggle('connected', isConnected);
  statusIndicator.classList.toggle('disconnected', !isConnected);
  statusText.textContent = isConnected ? 'Ollama Conectado' : 'Ollama Desconectado';
}

function openHelpModal() {
  helpModal.classList.add('open');
  helpModal.setAttribute('aria-hidden', 'false');
}

function closeHelpModal() {
  helpModal.classList.remove('open');
  helpModal.setAttribute('aria-hidden', 'true');
}

function resetChat() {
  chatList.innerHTML = '';
  appendMessage(
    'assistant',
    'Listo. Escribe el script de Roblox o Luau que quieras generar y te devolveré el código directamente.'
  );
}

async function handleSubmit(event) {
  event.preventDefault();

  const prompt = promptInput.value.trim();
  if (!prompt) return;

  appendMessage('user', prompt);
  promptInput.value = '';
  promptInput.focus();

  const respuesta = await enviarMensaje(prompt);
  appendMessage('assistant', respuesta);
}

async function checkOllamaConnection() {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: 'ping' }],
        stream: false
      })
    });

    if (!response.ok) throw new Error('Ollama no está disponible');
    setConnectionStatus(true);
  } catch (error) {
    console.error(error);
    setConnectionStatus(false);
    openHelpModal();
  }
}

chatForm.addEventListener('submit', handleSubmit);
helpBtn.addEventListener('click', openHelpModal);
closeHelpBtn.addEventListener('click', closeHelpModal);
helpModal.addEventListener('click', (event) => {
  if (event.target === helpModal) closeHelpModal();
});
newChatBtn.addEventListener('click', resetChat);

document.addEventListener('click', async (event) => {
  const copyButton = event.target.closest('.copy-code');
  if (!copyButton) return;

  const code = copyButton.dataset.code;
  try {
    await navigator.clipboard.writeText(code);
    copyButton.textContent = 'Copiado';
    setTimeout(() => {
      copyButton.textContent = 'Copiar código';
    }, 1200);
  } catch (error) {
    console.error('No se pudo copiar el código:', error);
    copyButton.textContent = 'Error';
  }
});

promptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

resetChat();
checkOllamaConnection();
