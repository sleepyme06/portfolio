// src/api/chat.js
// Reads SSE stream from FastAPI /chat endpoint.
// Falls back cleanly to local message if server is offline or fails.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * streamChat(messages, onChunk, onError)
 * Sends history array to backend, invokes onChunk(deltaText) for each SSE token.
 */
export async function streamChat(messages, onChunk, onError) {
  try {
    const validMessages = messages
      .filter(m => (m.type === 'user' || m.type === 'system') && m.text && m.text.trim().length > 0)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: validMessages,
      }),
    });

    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete trailing line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);

        if (data === '[DONE]') {
          return;
        }

        if (data.startsWith('[ERROR]')) {
          throw new Error(data.slice(8));
        }

        // Restore escaped newlines sent by SSE server
        const unescaped = data.replace(/\\n/g, '\n');
        onChunk(unescaped);
      }
    }
  } catch (err) {
    if (onError) {
      onError(err);
    } else {
      console.error('Chat API Error:', err);
    }
  }
}
