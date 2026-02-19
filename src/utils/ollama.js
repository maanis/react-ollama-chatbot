// Utility function to interact with Ollama
const OLLAMA_URL = 'http://localhost:11434/api/chat';

export async function sendMessageToOllama(message, conversation) {
    const fullMessages = [...conversation, { role: 'user', content: message }];

    // Determine response length based on the message
    const lowerMessage = message.toLowerCase();
    const needsLongResponse = /\b(explain|describe|how to|write|create|develop|analyze|compare|list|steps)\b/.test(lowerMessage) || message.length > 100;
    const numPredict = needsLongResponse ? 300 : 150;

    return fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'qwen2.5:0.5b', // Change to your preferred model
            messages: fullMessages,
            stream: true,
        }),
    });
}