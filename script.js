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
const form = document.getElementById('chat-form');
const statusPill = document.getElementById('status-pill');
const modal = document.getElementById('help-modal');
const openModalBtn = document.getElementById('open-help');
const closeModalBtn = document.getElementById('close-help');
const quickPrompts = document.querySelectorAll('.quick-prompt');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMessageContent(content) {
  const escaped = escapeHtml(content);
  const withCodeBlocks = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const trimmedCode = code.trim();
    return `
      <div class="code-block">
        <div class="code-header">
          <span>${lang || 'luau'}</span>
          <button class="copy-code" data-code="${escapeHtml(trimmedCode)}">Copiar Código</button>
        </div>
        <pre><code>${trimmedCode}</code></pre>
      </div>
    `;
  });

  return withCodeBlocks
    .replace(/\n/g, '<br>')
    .replace(/\s{2}/g, ' &nbsp;');
}

function appendMessage(role, content) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role === 'user' ? 'message-user' : 'message-ai'}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (role === 'assistant') {
    bubble.innerHTML = formatMessageContent(content);
  } else {
    bubble.textContent = content;
  }

  wrapper.appendChild(bubble);
  chatList.appendChild(wrapper);
  chatList.scrollTop = chatList.scrollHeight;
}

function setStatus(text, type = 'idle') {
  statusPill.textContent = text;
  statusPill.dataset.state = type;
}

async function handleSubmit(event) {
  event.preventDefault();

  const prompt = promptInput.value.trim();
  if (!prompt) return;

  appendMessage('user', prompt);
  promptInput.value = '';
  promptInput.focus();

  setStatus('Generando...', 'loading');

  const respuesta = await enviarMensaje(prompt);
  appendMessage('assistant', respuesta);

  setStatus('Listo', 'success');
  setTimeout(() => setStatus('Conectado', 'idle'), 1200);
}

function openHelp() {
  modal.classList.add('open');
}

function closeHelp() {
  modal.classList.remove('open');
}

form.addEventListener('submit', handleSubmit);

openModalBtn.addEventListener('click', openHelp);
closeModalBtn.addEventListener('click', closeHelp);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeHelp();
});

quickPrompts.forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.prompt;
    promptInput.focus();
  });
});

document.addEventListener('click', async (event) => {
  const copyButton = event.target.closest('.copy-code');
  if (!copyButton) return;

  const text = copyButton.dataset.code;
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = 'Copiado';
    setTimeout(() => {
      copyButton.textContent = 'Copiar Código';
    }, 1200);
  } catch (error) {
    console.error('No se pudo copiar el código:', error);
    copyButton.textContent = 'Error';
  }
});

appendMessage(
  'assistant',
  'Listo. Escribe el script que quieres generar para Roblox/Luau y te devolveré el código técnico directamente.'
);
setStatus('Conectado', 'idle');
