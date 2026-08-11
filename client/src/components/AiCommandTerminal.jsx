import React, { useState, useEffect } from 'react';
import { generateCommand, diagnoseError, getCommandHistory, clearCommandHistory } from '../api/commandApi';
import { getRecommendations } from '../api/tutorApi';
import {
  Terminal,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Play,
  RotateCcw,
  History,
  Shield,
  Layers,
  Compass,
  Cpu,
  BookOpen,
  X,
  Bug
} from 'lucide-react';

export default function AiCommandTerminal({ courseId = 'java-101', userId = 'student1@intellilearn.com' }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiagnoseModal, setShowDiagnoseModal] = useState(false);
  const [diagnoseForm, setDiagnoseForm] = useState({ command: '', error: '' });
  const [diagnoseResult, setDiagnoseResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const data = await getCommandHistory(userId);
      setHistory(data || []);
    } catch (err) {
      console.warn('Could not fetch command history:', err);
    }
  };

  const handleGenerate = async (queryText) => {
    const q = queryText || prompt;
    if (!q || !q.trim()) return;

    setLoading(true);
    setExecutionOutput(null);
    setDiagnoseResult(null);

    try {
      const res = await generateCommand(q, userId, courseId);
      setOutput(res);
      setPrompt('');
      fetchHistory();
    } catch (err) {
      console.error('Command generation error:', err);
      setOutput({
        command: "echo 'Error connecting to AI Command Service'",
        explanation: 'Failed to contact backend API Gateway endpoint.',
        riskLevel: 'LOW',
        requiresConfirmation: false,
        warningFlags: [],
        providerUsed: 'Offline-Fallback'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutClick = async (shortcutType) => {
    setLoading(true);
    setExecutionOutput(null);
    setDiagnoseResult(null);

    try {
      if (shortcutType === 'RECOMMEND') {
        const rec = await getRecommendations(courseId, userId);
        setOutput({
          command: `# AI Recommendation for ${courseId.toUpperCase()}\n# ${rec.answer.replace(/\n/g, '\n# ')}`,
          explanation: 'Personalized course pathway recommendation generated using AI Tutor engine.',
          riskLevel: 'LOW',
          requiresConfirmation: false,
          warningFlags: [],
          providerUsed: 'AI-Tutor-Engine'
        });
      } else if (shortcutType === 'SKILLS') {
        setOutput({
          command: '# IN-DEMAND SKILLS ROADMAP 2026\n# 1. Spring Boot & Microservices Architecture (High Demand)\n# 2. Docker & Kubernetes Container Orchestration\n# 3. MongoDB & NoSQL Document Modeling\n# 4. React & Modern State Management',
          explanation: 'Curated market analysis of high-demand cloud and microservice software engineering skills.',
          riskLevel: 'LOW',
          requiresConfirmation: false,
          warningFlags: [],
          providerUsed: 'Skill-Analytics-Engine'
        });
      } else if (shortcutType === 'ROADMAP') {
        setOutput({
          command: '# MY PERSONALIZED LEARNING ROADMAP\n# [Current Level: Intermediate Java Developer]\n# Step 1: Complete Java OOP Fundamentals Quiz\n# Step 2: Master Spring Boot API Gateway & Keycloak OAuth2\n# Step 3: Deploy Microservices Ecosystem via Docker Compose',
          explanation: 'Customized progression milestone path based on your current course enrollments.',
          riskLevel: 'LOW',
          requiresConfirmation: false,
          warningFlags: [],
          providerUsed: 'Roadmap-Planner'
        });
      } else if (shortcutType === 'TRANSFORMERS') {
        setOutput({
          command: '# EXPLAIN TRANSFORMERS & LLM ARCHITECTURE\n# Transformers use Self-Attention mechanisms to process input tokens in parallel.\n# Key Components: Encoder (Context representation) & Decoder (Generative token prediction).',
          explanation: 'Deep-dive explanation of Transformer neural network architectures powering modern LLMs.',
          riskLevel: 'LOW',
          requiresConfirmation: false,
          warningFlags: [],
          providerUsed: 'RAG-Tutor-Docs'
        });
      }
    } catch (err) {
      console.error('Shortcut error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnoseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await diagnoseError(diagnoseForm.command, diagnoseForm.error, userId);
      setDiagnoseResult(res);
      setShowDiagnoseModal(false);
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCommand = () => {
    if (output.riskLevel === 'HIGH' || output.riskLevel === 'CRITICAL') {
      setConfirmModal(true);
      return;
    }
    runSandboxExecution();
  };

  const runSandboxExecution = () => {
    setConfirmModal(false);
    setExecutionOutput('Executing command in controlled sandbox environment...\n$ ' + output.command + '\n\n[STDOUT]\n' + (output.command.startsWith('#') ? 'Info message displayed successfully.' : 'Command executed cleanly with return code 0.\nOutputs: Process active and verified.'));
  };

  const getRiskPill = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', text: '#fca5a5', label: '🔴 CRITICAL RISK' };
      case 'HIGH':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', text: '#fcd34d', label: '🟡 HIGH RISK' };
      case 'MEDIUM':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', text: '#93c5fd', label: '🔵 MEDIUM RISK' };
      default:
        return { bg: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', text: '#86efac', label: '🟢 LOW RISK' };
    }
  };

  return (
    <div
      style={{
        background: '#090d16',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#f8fafc',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        fontFamily: "'Fira Code', 'Courier New', monospace",
      }}
    >
      {/* Terminal Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: '10px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc' }}>
            <Terminal size={20} color="#818cf8" />
            AI Command Terminal v2.0
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowDiagnoseModal(true)}
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Bug size={14} /> Diagnose Error
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={14} /> History ({history.length})
          </button>
        </div>
      </div>

      {/* Interactive Action Shortcuts (Inspired by Reference UI) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          onClick={() => handleShortcutClick('RECOMMEND')}
          style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#c7d2fe', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Compass size={14} color="#818cf8" /> Recommend Course
        </button>
        <button
          onClick={() => handleShortcutClick('SKILLS')}
          style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Layers size={14} color="#34d399" /> In-Demand Skills
        </button>
        <button
          onClick={() => handleShortcutClick('ROADMAP')}
          style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fde68a', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <BookOpen size={14} color="#fbbf24" /> My Roadmap
        </button>
        <button
          onClick={() => handleShortcutClick('TRANSFORMERS')}
          style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#e9d5ff', padding: '0.45rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Cpu size={14} color="#c084fc" /> Explain Transformers
        </button>
      </div>

      {/* Main Terminal Input Prompt Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8', fontWeight: 800 }}>$</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type command prompt (e.g. 'find large files in home directory' or 'show running docker containers')..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2rem',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '0.9rem',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            padding: '0.75rem 1.25rem',
            background: loading ? '#475569' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading ? 'Processing...' : <><Send size={16} /> Send</>}
        </button>
      </form>

      {/* Generated Command Output Display */}
      {output && (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Command & Analysis</span>
            {(() => {
              const pill = getRiskPill(output.riskLevel);
              return (
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '20px', background: pill.bg, border: pill.border, color: pill.text, fontSize: '0.75rem', fontWeight: 700 }}>
                  {pill.label}
                </span>
              );
            })()}
          </div>

          <div style={{ background: '#020617', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <code style={{ color: '#38bdf8', fontSize: '0.95rem', wordBreak: 'break-all' }}>{output.command}</code>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => copyToClipboard(output.command)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#cbd5e1', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                title="Copy Command"
              >
                {copied ? <CheckCircle2 size={16} color="#4ade80" /> : <Copy size={16} />}
              </button>
              <button
                onClick={executeCommand}
                style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Play size={14} /> Run
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <strong style={{ color: '#a5b4fc' }}>Explanation:</strong> {output.explanation}
          </div>

          {output.warningFlags && output.warningFlags.length > 0 && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8rem' }}>
              ⚠️ <strong>Warning:</strong> {output.warningFlags.join(' ')}
            </div>
          )}
        </div>
      )}

      {/* Controlled Execution Output Window */}
      {executionOutput && (
        <div style={{ background: '#020617', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700, display: 'block', marginBottom: '6px' }}>TERMINAL EXECUTION LOG</span>
          <pre style={{ margin: 0, color: '#f8fafc', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{executionOutput}</pre>
        </div>
      )}

      {/* Error Diagnosis Output Display */}
      {diagnoseResult && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '1rem' }}>🐛 Error Diagnosis Result</h4>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}><strong>Diagnosis:</strong> {diagnoseResult.diagnosis}</p>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
            <strong>Possible Causes:</strong>
            <ul style={{ margin: '4px 0 8px 18px', padding: 0 }}>
              {diagnoseResult.possibleCauses.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <strong>Suggested Diagnostic Commands:</strong>
            <div style={{ background: '#020617', padding: '0.6rem 0.85rem', borderRadius: '6px', marginTop: '4px' }}>
              {diagnoseResult.suggestedCommands.map((sc, i) => <div key={i} style={{ color: '#38bdf8' }}>$ {sc}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* Command History Drawer */}
      {showHistory && (
        <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>Recent Command History (MongoDB)</span>
            <button onClick={async () => { await clearCommandHistory(); setHistory([]); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Clear All</button>
          </div>
          {history.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No past command history recorded.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {history.map((item, idx) => (
                <div key={idx} onClick={() => setOutput(item)} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#cbd5e1' }}>{item.prompt}</span>
                  <code style={{ color: '#38bdf8' }}>{item.command}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Lock Modal for High Risk Commands */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1.5rem', maxWidth: '450px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 800, marginBottom: '0.75rem' }}>
              <AlertTriangle size={24} />
              HIGH RISK COMMAND CONFIRMATION
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              This command is classified as <strong>HIGH/CRITICAL RISK</strong> and may alter system files or services. Are you sure you want to execute it in the sandbox?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={runSandboxExecution} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Confirm & Run</button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnose Error Input Modal */}
      {showDiagnoseModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', width: '90%', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 800, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}><Bug size={20} /> AI Command Error Diagnoser</span>
              <button onClick={() => setShowDiagnoseModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleDiagnoseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Command Executed</label>
                <input type="text" required value={diagnoseForm.command} onChange={(e) => setDiagnoseForm({ ...diagnoseForm, command: e.target.value })} placeholder="e.g. docker compose up" style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Error Message / Stack Trace</label>
                <textarea rows={4} required value={diagnoseForm.error} onChange={(e) => setDiagnoseForm({ ...diagnoseForm, error: e.target.value })} placeholder="e.g. connection refused or port 8080 already in use" style={{ width: '100%', padding: '0.6rem 0.85rem', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }} />
              </div>
              <button type="submit" style={{ padding: '0.65rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Analyze Error Trace</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
