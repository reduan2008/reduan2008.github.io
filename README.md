# Roblox AI Script Generator

Generador de scripts de Luau para Roblox basado en IA ejecutada localmente.

## Requisitos para usar esta web

Para que el chat pueda generar respuestas desde tu ordenador:

1. Instala Ollama desde [ollama.com](https://ollama.com).
2. Descarga el modelo ejecutando este comando en tu terminal:
   ```bash
   ollama run nutboy02/Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-uncenfull
   ```
3. Inicia el servidor de Ollama permitiendo las peticiones de la página web:
   - Windows (PowerShell): `$env:OLLAMA_ORIGINS="*" ; ollama serve`
   - Linux/Mac: `OLLAMA_ORIGINS="*" ollama serve`
4. Entra a https://reduan2008.github.io y comienza a escribir prompts.

## Funcionalidad

La web hace peticiones HTTP POST a `http://localhost:11434/api/chat` usando el modelo configurado por defecto:

`nutboy02/Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-uncenfull`

El sistema está preparado para responder con código Luau técnico y funcional para Roblox sin advertencias ni disclaimers.
