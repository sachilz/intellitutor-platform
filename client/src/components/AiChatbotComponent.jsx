import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, clearChatSession } from '../api/tutorApi';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Wrench,
  ExternalLink,
  Trash2,
  X,
  MessageSquare
} from 'lucide-react';

export default function AiChatbotComponent({ courseId = 'java-101', userId = 'student1@intellilearn.com' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hello! I am your **Project-Aware & Web-Aware AI Assistant** for IntelliTutor.\nAsk me anything about our microservices architecture, API Gateway, Keycloak OAuth2, Docker setup, troubleshooting errors, or general technical topics!",
      category: 'PROJECT_SPECIFIC',
      sourceType: 'PROJECT',
      webSearchUsed: false,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => 'session-' + Math.random().toString(36).substring(2, 9));
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const q = queryText || input;
    if (!q || !q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(q, sessionId, courseId, userId);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          category: res.category,
          sourceType: res.sourceType,
          webSearchUsed: res.webSearchUsed,
          sources: res.sources || [],
          troubleshooting: res.troubleshooting,
          providerUsed: res.providerUsed
        }
      ]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "⚠️ Couldn't connect to AI Chatbot service via API Gateway. Please ensure `tutor-service` (port 8085) and Gateway (port 8080) are running.",
          category: 'GENERAL_KNOWLEDGE',
          sourceType: 'GENERAL',
          webSearchUsed: false,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      await clearChatSession(sessionId);
    } catch (e) {
      console.warn('Clear session warning:', e);
    }
    const newId = 'session-' + Math.random().toString(36).substring(2, 9);
    setSessionId(newId);
    setMessages([
      {
        sender: 'ai',
        text: "Conversation cleared. How can I assist you with IntelliTutor platform or tech topics today?",
        category: 'PROJECT_SPECIFIC',
        sourceType: 'PROJECT',
        webSearchUsed: false,
        sources: []
      }
    ]);
  };

  const renderBadge = (msg) => {
    if (msg.sender === 'user') return null;

    if (msg.category === 'PROJECT_TROUBLESHOOTING') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>
          <Wrench size={12} /> 🔧 Project Troubleshooter
        </span>
      );
    }

    if (msg.webSearchUsed) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#93c5fd', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>
          <Globe size={12} /> 🌐 Web Search Used
        </span>
      );
    }

    if (msg.sourceType === 'PROJECT') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#86efac', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>
          <BookOpen size={12} /> 🟢 Project Knowledge
        </span>
      );
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#e9d5ff', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '6px' }}>
        <Sparkles size={12} /> 🤖 General Knowledge
      </span>
    );
  };

  return (
    <div
      style={{
        background: '#0a0e1a',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '1.25rem',
        color: '#f8fafc',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              IntelliTutor AI Chatbot
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Project-Aware + Web-Aware RAG Engine</span>
          </div>
        </div>
        <button
          onClick={handleClearSession}
          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Clear Session Memory"
        >
          <Trash2 size={13} /> Reset Chat
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        {[
          'What services exist in IntelliTutor?',
          'Why is quiz-service returning 401?',
          'What is the latest Spring Boot version?',
          'How does API Gateway rate limiting work?'
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#c7d2fe', padding: '0.35rem 0.65rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages Scroll Window */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {renderBadge(m)}
            <div
              style={{
                maxWidth: '85%',
                padding: '0.85rem 1.1rem',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#0f172a',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                fontSize: '0.88rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-line',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {m.text}

              {/* Troubleshooting Card Details */}
              {m.troubleshooting && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#020617', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: '4px' }}>Likely Cause: {m.troubleshooting.likelyCause}</div>
                  <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>
                    <strong>Recommended Diagnostic Checks:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {m.troubleshooting.recommendedChecks.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Source Citations */}
              {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <strong>📌 Citations & Sources:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {m.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url.startsWith('http') ? src.url : '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.45rem', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        {src.title} {src.url.startsWith('http') && <ExternalLink size={10} />}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '0.82rem' }}>
            <span className="spinner"></span> AI is analyzing project knowledge & web context...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Chatbot about microservices, APIs, errors, or tech concepts..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: '#0f172a',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '10px',
            color: '#f8fafc',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
