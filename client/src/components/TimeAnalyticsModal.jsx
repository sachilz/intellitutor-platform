import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Minus,
  PieChart as PieChartIcon, 
  BarChart3, 
  Flame, 
  Zap,
  Calendar,
  TrendingUp,
  Target,
  Edit3,
  Timer,
  Award
} from 'lucide-react';

const TimeAnalyticsModal = ({ 
  isOpen, 
  onClose, 
  loggedHours, 
  setLoggedHours, 
  targetHours = 5.0, 
  onAddXp,
  timerRunning: externalTimerRunning,
  setTimerRunning: externalSetTimerRunning,
  elapsedSeconds: externalElapsedSeconds,
  setElapsedSeconds: externalSetElapsedSeconds
}) => {
  const [internalTimerRunning, setInternalTimerRunning] = useState(false);
  const [internalElapsedSeconds, setInternalElapsedSeconds] = useState(0);

  const timerRunning = externalTimerRunning !== undefined ? externalTimerRunning : internalTimerRunning;
  const setTimerRunning = externalSetTimerRunning || setInternalTimerRunning;
  const elapsedSeconds = externalElapsedSeconds !== undefined ? externalElapsedSeconds : internalElapsedSeconds;
  const setElapsedSeconds = externalSetElapsedSeconds || setInternalElapsedSeconds;

  const [selectedCategory, setSelectedCategory] = useState('GenAI & Prompting');
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const [categoryBreakdown, setCategoryBreakdown] = useState({
    'GenAI & Prompting': 1.8,
    'Machine Learning': 1.0,
    'Data Science & Analytics': 0.5,
    'Web Dev & Cloud': 0.2,
  });

  const dailyHistory = [
    { day: 'Mon', hours: 0.8 },
    { day: 'Tue', hours: 1.0 },
    { day: 'Wed', hours: 0.7 },
    { day: 'Thu', hours: 0.5 },
    { day: 'Fri', hours: 0.5 },
    { day: 'Sat', hours: 0.0 },
    { day: 'Sun', hours: 0.0 },
  ];

  const categoryColors = {
    'GenAI & Prompting': '#a855f7',
    'Machine Learning': '#6366f1',
    'Data Science & Analytics': '#06b6d4',
    'Web Dev & Cloud': '#f59e0b',
    'Remaining Goal': 'rgba(255,255,255,0.06)',
  };

  const handleCategoryHoursChange = (categoryName, deltaHours) => {
    setCategoryBreakdown((prev) => {
      const currentVal = prev[categoryName] || 0;
      const newVal = Math.max(0, Math.round((currentVal + deltaHours) * 100) / 100);
      const updated = { ...prev, [categoryName]: newVal };
      const newTotal = Object.values(updated).reduce((sum, v) => sum + v, 0);
      setLoggedHours(Math.round(newTotal * 10) / 10);
      return updated;
    });
  };

  useEffect(() => {
    if (externalTimerRunning !== undefined) return;
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, externalTimerRunning, setElapsedSeconds]);

  const handleQuickAdd = (minutes) => {
    const hoursToAdd = minutes / 60;
    handleCategoryHoursChange(selectedCategory, hoursToAdd);
    if (onAddXp) onAddXp(minutes === 15 ? 15 : minutes === 30 ? 30 : 60);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
  };

  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCatHours = useMemo(() => {
    return Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);
  }, [categoryBreakdown]);

  const remainingGoalHours = Math.max(0, Math.round((targetHours - totalCatHours) * 10) / 10);
  const progressPercent = Math.min(100, Math.round((loggedHours / targetHours) * 100));

  const pieData = useMemo(() => {
    const items = [
      ...Object.entries(categoryBreakdown).map(([label, val]) => ({
        label, value: val, color: categoryColors[label] || '#a855f7',
      })),
    ];
    if (remainingGoalHours > 0) {
      items.push({ label: 'Remaining Goal', value: remainingGoalHours, color: categoryColors['Remaining Goal'] });
    }
    const pieTotal = targetHours > 0 ? targetHours : totalCatHours;
    let accumulatedAngle = 0;
    return items.map((item) => {
      const percentage = (item.value / pieTotal) * 100;
      const angle = (item.value / pieTotal) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      return { ...item, percentage: Math.round(percentage * 10) / 10, startAngle, angle };
    });
  }, [categoryBreakdown, remainingGoalHours, targetHours, totalCatHours]);

  const getArcPath = (cx, cy, radius, innerRadius, startAngle, angle) => {
    if (angle >= 360) angle = 359.99;
    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const ix1 = cx + innerRadius * Math.cos(endRad);
    const iy1 = cy + innerRadius * Math.sin(endRad);
    const ix2 = cx + innerRadius * Math.cos(startRad);
    const iy2 = cy + innerRadius * Math.sin(startRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;
  };

  // SVG circular progress for stopwatch
  const timerRadius = 80;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const maxTimerSeconds = 3600; // 1 hour max
  const timerStrokeDashoffset = timerCircumference - (Math.min(elapsedSeconds, maxTimerSeconds) / maxTimerSeconds) * timerCircumference;

  const maxBarHours = Math.max(...dailyHistory.map(d => d.hours), 1);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(2, 4, 10, 0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <style>{`
        @keyframes tamFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes tamPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes tamGlow { 0%, 100% { box-shadow: 0 0 15px rgba(168,85,247,0.2); } 50% { box-shadow: 0 0 30px rgba(168,85,247,0.4); } }
        @keyframes tamBarGrow { from { height: 0%; } }
        .tam-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 24px; transition: all 0.2s ease; }
        .tam-panel:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1200px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
          background: 'linear-gradient(145deg, #0c1021 0%, #111827 50%, #0f172a 100%)',
          border: '1px solid rgba(99,102,241,0.15)', borderRadius: '28px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(99,102,241,0.08)',
          animation: 'tamFadeIn 0.35s ease',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '28px 32px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 60%)',
          borderRadius: '28px 28px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(99,102,241,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={24} color="#818cf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e2e8f0', margin: 0 }}>
                  Study Analytics
                </h2>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px',
                  background: timerRunning ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.12)',
                  color: timerRunning ? '#f87171' : '#4ade80',
                  border: `1px solid ${timerRunning ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.25)'}`,
                  display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: timerRunning ? '#f87171' : '#4ade80', animation: timerRunning ? 'tamPulse 1s infinite' : 'none' }} />
                  {timerRunning ? 'Recording' : 'Ready'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0' }}>
                Track study time, manage goals, and monitor weekly progress
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ padding: '24px 32px 28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

          {/* PANEL 1: Live Stopwatch */}
          <div className="tam-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Timer size={16} color="#818cf8" /> Live Session
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>
                {selectedCategory}
              </span>
            </div>

            {/* Circular stopwatch */}
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" r={timerRadius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                <circle
                  cx="90" cy="90" r={timerRadius} fill="none"
                  stroke={timerRunning ? '#818cf8' : 'rgba(99,102,241,0.3)'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={timerCircumference}
                  strokeDashoffset={timerStrokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Inter', monospace", color: timerRunning ? '#e2e8f0' : '#94a3b8', letterSpacing: '1px' }}>
                  {formatTime(elapsedSeconds)}
                </div>
                <div style={{ fontSize: '0.7rem', color: timerRunning ? '#818cf8' : '#475569', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {timerRunning ? 'In Progress' : 'Paused'}
                </div>
              </div>
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {!timerRunning ? (
                <button
                  onClick={() => setTimerRunning(true)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(34,197,94,0.3)', transition: 'all 0.15s ease',
                  }}
                >
                  <Play size={16} fill="#fff" /> Start
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(false)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                  }}
                >
                  <Pause size={16} fill="#fff" /> Pause
                </button>
              )}
              <button
                onClick={handleResetTimer}
                style={{
                  width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Quick log buttons */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Quick Log
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[15, 30, 60].map(min => (
                  <button
                    key={min}
                    onClick={() => handleQuickAdd(min)}
                    style={{
                      padding: '10px 8px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#818cf830'; e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <Plus size={12} /> {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Category selector */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Log To Category
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.keys(categoryBreakdown).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 12px', borderRadius: '10px', textAlign: 'left',
                      background: selectedCategory === cat ? `${categoryColors[cat]}12` : 'transparent',
                      border: `1px solid ${selectedCategory === cat ? `${categoryColors[cat]}30` : 'rgba(255,255,255,0.04)'}`,
                      color: selectedCategory === cat ? categoryColors[cat] : '#64748b',
                      fontSize: '0.78rem', fontWeight: selectedCategory === cat ? 700 : 600,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColors[cat] }} />
                      {cat}
                    </div>
                    {selectedCategory === cat && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, background: categoryColors[cat], color: '#0f172a', padding: '1px 6px', borderRadius: '4px' }}>
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL 2: Category Breakdown + Donut */}
          <div className="tam-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <PieChartIcon size={16} color="#a855f7" /> Time Distribution
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>
                {loggedHours}h / {targetHours}h
              </span>
            </div>

            {/* Donut chart */}
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {pieData.map((slice, idx) => {
                  const isHovered = hoveredSlice === slice.label;
                  const radius = isHovered ? 88 : 84;
                  const innerRadius = 56;
                  const pathD = getArcPath(100, 100, radius, innerRadius, slice.startAngle, slice.angle);
                  return (
                    <path
                      key={idx} d={pathD} fill={slice.color}
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        cursor: 'pointer',
                        opacity: hoveredSlice && !isHovered ? 0.4 : 1,
                        stroke: '#0c1021', strokeWidth: '3',
                      }}
                      onMouseEnter={() => setHoveredSlice(slice.label)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#e2e8f0' }}>
                  {hoveredSlice ? pieData.find(p => p.label === hoveredSlice)?.value + 'h' : `${loggedHours}h`}
                </span>
                <span style={{ fontSize: '0.68rem', color: hoveredSlice ? '#a855f7' : '#64748b', fontWeight: 600, maxWidth: '80px', textAlign: 'center', lineHeight: 1.2, marginTop: '2px' }}>
                  {hoveredSlice || `${progressPercent}% of goal`}
                </span>
              </div>
            </div>

            {/* Category breakdown list */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pieData.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '12px',
                    background: hoveredSlice === item.label ? `${item.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${hoveredSlice === item.label ? `${item.color}25` : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.15s ease', cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredSlice(item.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1' }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>{item.value}h</span>
                    <span style={{ fontSize: '0.68rem', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>{item.percentage}%</span>
                    {item.label !== 'Remaining Goal' && (
                      <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCategoryHoursChange(item.label, -0.25); }}
                          style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#94a3b8', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                          }}
                        >
                          <Minus size={11} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCategoryHoursChange(item.label, 0.25); }}
                          style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: `${item.color}15`, border: `1px solid ${item.color}30`,
                            color: item.color, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL 3: Weekly Activity + Goal */}
          <div className="tam-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <TrendingUp size={16} color="#22c55e" /> Weekly Activity
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> This Week
              </span>
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingBottom: '0' }}>
              {dailyHistory.map((d, i) => {
                const barPercent = d.hours > 0 ? Math.max(8, (d.hours / maxBarHours) * 100) : 4;
                const isToday = i === new Date().getDay() - 1;
                const barColor = d.hours > 0.7 ? '#22c55e' : d.hours > 0.3 ? '#818cf8' : d.hours > 0 ? '#a855f7' : 'rgba(255,255,255,0.04)';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '0.72rem', color: d.hours > 0 ? '#e2e8f0' : '#334155', fontWeight: 700 }}>
                      {d.hours > 0 ? `${d.hours}h` : '—'}
                    </span>
                    <div style={{
                      width: '100%', maxWidth: '32px', height: '120px',
                      background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                      display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
                      border: isToday ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    }}>
                      <div style={{
                        width: '100%', height: `${barPercent}%`, borderRadius: '6px',
                        background: d.hours > 0 ? `linear-gradient(to top, ${barColor}, ${barColor}90)` : 'rgba(255,255,255,0.03)',
                        transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: d.hours > 0 ? `0 0 10px ${barColor}30` : 'none',
                        animation: 'tamBarGrow 0.8s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: isToday ? 800 : 600,
                      color: isToday ? '#818cf8' : '#475569',
                    }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Goal Progress */}
            <div style={{
              padding: '18px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))',
              border: '1px solid rgba(99,102,241,0.12)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={14} color="#818cf8" /> Weekly Goal
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: progressPercent >= 100 ? '#4ade80' : '#a5b4fc' }}>
                  {loggedHours}h / {targetHours}h
                </span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  width: `${progressPercent}%`,
                  background: progressPercent >= 100 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '10px 0 0 0', lineHeight: 1.5 }}>
                {progressPercent >= 100 
                  ? '🎉 Weekly target achieved! Outstanding consistency.' 
                  : `${remainingGoalHours}h remaining. Keep it up!`}
              </p>
            </div>

            {/* Streak boost card */}
            <div style={{
              padding: '16px', borderRadius: '14px',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Flame size={20} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>Study Streak Boost</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Every 30 mins earns +25 XP points
                </div>
              </div>
              <Zap size={18} color="#fbbf24" style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 32px', borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontSize: '0.75rem', color: '#334155',
        }}>
          <Sparkles size={12} color="#475569" />
          IntelliLearn Study Analytics • Real-time tracking
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimeAnalyticsModal;
