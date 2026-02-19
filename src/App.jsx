import React, { useState, useRef, useEffect } from "react";
import { sendMessageToOllama } from "./utils/ollama";
import Prism from 'prismjs';
import './styles/prism-theme.css';
import 'prismjs/components/prism-python';


// ─────────────────────────────────────────────────────────────
// Code Block Component
// ─────────────────────────────────────────────────────────────
const CodeBlock = ({ code, lang }) => {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="relative bg-[#1a1b1e] rounded-lg p-4 my-4 border border-zinc-700">
      <pre className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
        <code
          ref={codeRef}
          className={`language-${lang || 'text'} p-0 rounded-md bg-[#0d1117]`}
          style={{ color: 'inherit' }}
        >
          {code}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-zinc-600 hover:bg-zinc-500 text-zinc-200 px-2 py-1 rounded text-xs transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Parse Content Function
// ─────────────────────────────────────────────────────────────
const parseContent = (content) => {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*|\*.*?\*|###.*|##.*|#.*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || '';
        const code = match[2];
        return <CodeBlock key={index} code={code} lang={lang} />;
      }
    } else if (part.startsWith('###')) {
      return <h3 key={index} className="text-xl font-semibold text-zinc-300 my-2">{part.replace(/^###\s*/, '')}</h3>;
    } else if (part.startsWith('##')) {
      return <h2 key={index} className="text-2xl font-bold text-zinc-200 my-2">{part.replace(/^##\s*/, '')}</h2>;
    } else if (part.startsWith('#')) {
      return <h1 key={index} className="text-3xl font-extrabold text-zinc-100 my-3">{part.replace(/^#\s*/, '')}</h1>;
    } else if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-zinc-200">{part.replace(/\*\*/g, '')}</strong>;
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-zinc-300">{part.replace(/\*/g, '')}</em>;
    }
    return (
      <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
        {part}
      </span>
    );
  });
};
const Icons = {
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  ),
  ThumbsUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
  ),
  ThumbsDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" /></svg>
  ),
  Reload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
  ),
  Mic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
  ),
  Image: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
  Text: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
  Chart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
};

// ─────────────────────────────────────────────────────────────
// Message Components
// ─────────────────────────────────────────────────────────────
const UserMessage = ({ text }) => (
  <div className="flex flex-col items-end mb-8 animate-fadeIn">
    <div className="bg-[#1a1b1e] text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-md max-w-[85%] sm:max-w-[70%] text-[15px]">
      {text}
    </div>
    <div className="flex gap-3 mt-2 text-zinc-500 mr-1">
      <button className="hover:text-zinc-300 transition-colors"><Icons.Copy /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.Edit /></button>
    </div>
  </div>
);

const AiMessage = ({ content }) => (
  <div className="flex flex-col items-start mb-8 animate-fadeIn">
    <div className="text-zinc-200 max-w-[95%] sm:max-w-[85%] text-[15px] leading-relaxed">
      {parseContent(content)}
    </div>
    <div className="flex gap-3 mt-4 text-zinc-500 ml-1">
      <button className="hover:text-zinc-300 transition-colors"><Icons.Copy /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.Edit /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.ThumbsUp /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.ThumbsDown /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.Reload /></button>
      <button className="hover:text-zinc-300 transition-colors"><Icons.Download /></button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Action Chip Component
// ─────────────────────────────────────────────────────────────
const ActionChip = ({ icon, label, colorClass }) => (
  <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800/80 bg-[#13141a]/80 hover:bg-[#1a1c23] transition-colors text-sm text-zinc-300 whitespace-nowrap">
    <span className={colorClass}>{icon}</span>
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Main UI Component
// ─────────────────────────────────────────────────────────────
export default function ChatInterface() {
  const [conversation, setConversation] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const handleScroll = () => {
    const element = messagesEndRef.current?.parentElement;
    if (element) {
      const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
      setIsUserScrolling(!isAtBottom);
    }
  };

  useEffect(() => {
    const element = messagesEndRef.current?.parentElement;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const element = messagesEndRef.current?.parentElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, []);

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputText };
    setConversation(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText("");
    setIsLoading(true);

    // Add assistant message placeholder
    setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await sendMessageToOllama(messageToSend, conversation);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              accumulated += data.message.content;
              setConversation(prev => {
                const newConv = [...prev];
                newConv[newConv.length - 1].content = accumulated;
                return newConv;
              });
            }
          } catch {
            // Ignore invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setConversation(prev => {
        const newConv = [...prev];
        newConv[newConv.length - 1].content = 'Sorry, I couldn\'t connect to Ollama. Make sure it\'s running.';
        return newConv;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] font-sans flex flex-col items-center">

      {/* ── Header / Logo ── */}
      <header className="w-full py-8 flex justify-center bg-[#0b0c10]">
        {/* Double Diamond Logo recreating the image */}
        <div className="relative w-8 h-8">
          <div className="absolute top-0 left-0 w-6 h-6 bg-zinc-300 rounded-sm rotate-45 transform origin-center"></div>
          <div className="absolute top-0 right-0 w-6 h-6 bg-zinc-600 rounded-sm rotate-45 transform origin-center mix-blend-screen opacity-80"></div>
        </div>
      </header>

      {/* ── Chat Canvas ── */}
      <main className="flex-1 w-full max-w-3xl px-4 overflow-y-auto pb-40 bg-[#0b0c10]">
        {conversation.map((msg, index) => (
          msg.role === 'user' ? (
            <UserMessage key={index} text={msg.content} />
          ) : (
            <AiMessage key={index} content={msg.content} />
          )
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* ── Bottom Input Area ── */}
      <div className="fixed bottom-0 w-full max-w-4xl px-4 pb-8 pt-4 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10] to-transparent">

        <div className="relative mx-auto max-w-3xl">
          {/* Ambient Blue Glow strictly behind the right side */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/15 blur-[60px] pointer-events-none rounded-full"></div>

          {/* Input Box */}
          <div className="relative flex items-end gap-3 bg-[#13151a] border border-zinc-800/80 rounded-[1.25rem] px-4 py-3 shadow-2xl">


            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Voxa AI..."
              className="flex-1 h-646 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none text-[15p1x] resize-none  overflow-y-auto leading-relaxed py-[10px]"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />



            {/* Blue Send Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="relative flex-shrink-0 w-[38px] h-[38px] bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-gray-600 rounded-full flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {/* Little sparkles mimicking the image */}
              <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-pulse blur-[1px]"></div>
              <div className="absolute top-1 -left-2 w-0.5 h-0.5 bg-white rounded-full animate-ping"></div>

              <Icons.Send />
            </button>
          </div>

          {/* Action Chips */}

        </div>

      </div>

    </div>
  );
}