import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Award, 
  Plus, 
  Minus,
  PieChart as PieChartIcon, 
  BarChart3, 
  CheckCircle2, 
  Flame, 
  Zap,
  Maximize2,
  Minimize2,
  Calendar,
  TrendingUp,
  Target,
  Edit3
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
  // Full-screen mode toggle state
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Internal fallback state if props aren't passed
  const [internalTimerRunning, setInternalTimerRunning] = useState(false);
  const [internalElapsedSeconds, setInternalElapsedSeconds] = useState(0);

  const timerRunning = externalTimerRunning !== undefined ? externalTimerRunning : internalTimerRunning;
  const setTimerRunning = externalSetTimerRunning || setInternalTimerRunning;
  const elapsedSeconds = externalElapsedSeconds !== undefined ? externalElapsedSeconds : internalElapsedSeconds;
  const setElapsedSeconds = externalSetElapsedSeconds || setInternalElapsedSeconds;

  // Selected Active Category for Live Stopwatch & Quick Logging
  const [selectedCategoryForLogging, setSelectedCategoryForLogging] = useState('GenAI & Prompting');

  // Category time distribution breakdown (in hours) - ALL CATEGORIES ARE EDITABLE
  const [categoryBreakdown, setCategoryBreakdown] = useState({
    'GenAI & Prompting': 1.8,
    'Machine Learning': 1.0,
    'Data Science & Analytics': 0.5,
    'Web Dev & Cloud': 0.2,
  });

  // Daily activity distribution (Mon - Sun)
  const dailyHistory = [
    { day: 'Mon', hours: 0.8, color: '#c084fc' },
    { day: 'Tue', hours: 1.0, color: '#60a5fa' },
    { day: 'Wed', hours: 0.7, color: '#6ee7b7' },
    { day: 'Thu', hours: 0.5, color: '#fcd34d' },
    { day: 'Fri', hours: 0.5, color: '#c084fc' },
    { day: 'Sat', hours: 0.0, color: 'rgba(255,255,255,0.1)' },
    { day: 'Sun', hours: 0.0, color: 'rgba(255,255,255,0.1)' },
  ];

  // Active slice hover tooltip state
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Helper to adjust hours for ANY specific category
  const handleCategoryHoursChange = (categoryName, deltaHours) => {
    setCategoryBreakdown((prev) => {
      const currentVal = prev[categoryName] || 0;
      const newVal = Math.max(0, Math.round((currentVal + deltaHours) * 100) / 100);
      const updated = { ...prev, [categoryName]: newVal };
      
      // Calculate new total logged hours
      const newTotal = Object.values(updated).reduce((sum, v) => sum + v, 0);
      setLoggedHours(Math.round(newTotal * 10) / 10);
      
      return updated;
    });
  };

  // Ticking effect for live stopwatch (only run if external state is not provided)
  useEffect(() => {
    if (externalTimerRunning !== undefined) return;
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, externalTimerRunning, setElapsedSeconds]);

  // Quick add time handler for selected category
  const handleQuickAdd = (minutes) => {
    const hoursToAdd = minutes / 60;
    handleCategoryHoursChange(selectedCategoryForLogging, hoursToAdd);

    if (onAddXp) {
      onAddXp(minutes === 15 ? 15 : minutes === 30 ? 30 : 60);
    }
  };

  // Reset timer
  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pie Chart Calculations (SVG Donut Slices)
  const totalCatHours = useMemo(() => {
    return Object.values(categoryBreakdown).reduce((sum, val) => sum + val, 0);
  }, [categoryBreakdown]);

  const remainingGoalHours = Math.max(0, Math.round((targetHours - totalCatHours) * 10) / 10);

  const pieData = useMemo(() => {
    const colors = {
      'GenAI & Prompting': '#c084fc',         // Neon Purple
      'Machine Learning': '#60a5fa',         // Neon Blue
      'Data Science & Analytics': '#6ee7b7', // Neon Emerald
      'Web Dev & Cloud': '#fcd34d',          // Neon Yellow
      'Remaining Goal': 'rgba(255, 255, 255, 0.1)',
    };

    const items = [
      ...Object.entries(categoryBreakdown).map(([label, val]) => ({
        label,
        value: val,
        color: colors[label] || '#a855f7',
      })),
    ];

    if (remainingGoalHours > 0) {
      items.push({
        label: 'Remaining Goal',
        value: remainingGoalHours,
        color: colors['Remaining Goal'],
      });
    }

    const pieTotal = targetHours > 0 ? targetHours : totalCatHours;
    let accumulatedAngle = 0;

    return items.map((item) => {
      const percentage = (item.value / pieTotal) * 100;
      const angle = (item.value / pieTotal) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      return {
        ...item,
        percentage: Math.round(percentage * 10) / 10,
        startAngle,
        angle,
      };
    });
  }, [categoryBreakdown, remainingGoalHours, targetHours, totalCatHours]);

  // Convert polar coordinates to SVG arc path
  const getArcPath = (cx, cy, radius, innerRadius, startAngle, angle) => {
    if (angle >= 360) {
      angle = 359.99;
    }
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

  const progressPercent = Math.min(100, Math.round((loggedHours / targetHours) * 100));

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999, 
        backdropFilter: 'blur(24px)', 
        WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(5, 8, 16, 0.98)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: isFullScreen ? '12px' : '24px'
      }}
    >
      <div 
        className="modal-content animate-fade-in glass-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: isFullScreen ? '1400px' : '840px', 
          width: isFullScreen ? '97vw' : '94%', 
          height: isFullScreen ? '94vh' : 'auto',
          maxHeight: '95vh',
          padding: '24px 30px', 
          borderRadius: '24px', 
          border: '1px solid rgba(168, 85, 247, 0.45)',
          background: 'linear-gradient(145deg, rgba(11, 16, 30, 0.99), rgba(15, 23, 42, 1))',
          boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Top Header Control Buttons: Mode Toggle & Close */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 20 }}>
          <button 
            type="button"
            className="modal-close-btn" 
            onClick={() => setIsFullScreen(!isFullScreen)} 
            aria-label={isFullScreen ? 'Exit full screen' : 'Full screen mode'}
            title={isFullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
            style={{ position: 'relative', top: 0, right: 0, background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button 
            type="button"
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Close analytics modal"
            style={{ position: 'relative', top: 0, right: 0, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingRight: '100px', flexWrap: 'wrap' }}>
          <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.22)', border: '1px solid rgba(168, 85, 247, 0.45)', color: '#c084fc' }}>
            <PieChartIcon size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                Full-Screen Time Analytics Center
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 700 }}>
                LIVE REAL-TIME
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Edit and customize hours for any category, track live study stopwatch logs, and monitor weekly progress.
            </p>
          </div>
        </div>

        {/* MAIN FULL-SCREEN WORKSPACE GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isFullScreen ? 'repeat(auto-fit, minmax(330px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px', 
          alignItems: 'start',
          flex: 1
        }}>
          
          {/* PANEL 1: Editable Category Time Breakdown */}
          <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ alignSelf: 'flex-start', marginBottom: '16px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChartIcon size={18} color="#c084fc" /> Category Time Breakdown
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Click +/- on any category to edit hours</span>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Edit3 size={11} /> All Editable
              </span>
            </div>

            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '260px', height: '260px' }}>
              <svg width="260" height="260" viewBox="0 0 260 260" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.25))' }}>
                <defs>
                  <linearGradient id="pieGradGenAI" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d8b4fe" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="pieGradAIML" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="pieGradData" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a7f3d0" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {pieData.map((slice, idx) => {
                  const isHovered = hoveredSlice === slice.label;
                  const radius = isHovered ? 114 : 108;
                  const innerRadius = 66;
                  const pathD = getArcPath(130, 130, radius, innerRadius, slice.startAngle, slice.angle);

                  return (
                    <path
                      key={idx}
                      d={pathD}
                      fill={slice.label.includes('GenAI') ? 'url(#pieGradGenAI)' : slice.label.includes('Machine') ? 'url(#pieGradAIML)' : slice.label.includes('Data') ? 'url(#pieGradData)' : slice.color}
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        cursor: 'pointer',
                        opacity: hoveredSlice && !isHovered ? 0.55 : 1,
                        stroke: 'rgba(15, 23, 42, 0.9)',
                        strokeWidth: '4',
                      }}
                      onMouseEnter={() => setHoveredSlice(slice.label)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Info Ring Overlay */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  textAlign: 'center', 
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
                }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f3e8ff', lineHeight: 1 }}>
                  {hoveredSlice ? pieData.find(p => p.label === hoveredSlice)?.value + 'h' : `${loggedHours}h`}
                </span>
                <span style={{ fontSize: '0.74rem', color: hoveredSlice ? '#c084fc' : 'var(--text-muted)', fontWeight: 600, marginTop: '3px' }}>
                  {hoveredSlice || `Goal: ${targetHours}h`}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700, marginTop: '2px' }}>
                  {progressPercent}% Achieved
                </span>
              </div>
            </div>

            {/* Fully Editable Category Cards with Quick Controls */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {pieData.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '10px 14px', 
                    borderRadius: '12px', 
                    background: hoveredSlice === item.label ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${hoveredSlice === item.label ? 'rgba(168, 85, 247, 0.4)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredSlice(item.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#f3e8ff' }}>{item.value} hrs</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: '6px' }}>
                        {item.percentage}%
                      </span>

                      {/* Interactive Edit / Adjust Buttons for ALL Categories */}
                      {item.label !== 'Remaining Goal' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCategoryHoursChange(item.label, -0.25); }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '1px 6px', fontSize: '0.7rem', height: '22px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            title={`Subtract 15 mins from ${item.label}`}
                          >
                            <Minus size={11} /> 15m
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleCategoryHoursChange(item.label, 0.25); }}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '1px 6px', fontSize: '0.7rem', height: '22px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            title={`Add 15 mins to ${item.label}`}
                          >
                            <Plus size={11} /> 15m
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar-container" style={{ height: '4px', marginTop: '2px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, item.percentage)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL 2: Daily Activity Bar Chart & Weekly Trends */}
          <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#60a5fa" /> Weekly Study Activity
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Last 7 Days</span>
            </div>

            {/* Daily Vertical Bar Chart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '20px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              {dailyHistory.map((d, i) => {
                const maxH = 1.5;
                const barHeight = Math.min(100, Math.max(10, (d.hours / maxH) * 100));
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '0.72rem', color: '#f3e8ff', fontWeight: 700 }}>
                      {d.hours > 0 ? `${d.hours}h` : '-'}
                    </span>
                    <div style={{ width: '28px', height: '120px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', padding: '2px' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${barHeight}%`, 
                          background: `linear-gradient(to top, ${d.color}, #d8b4fe)`, 
                          borderRadius: '6px',
                          transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: d.hours > 0 ? `0 0 10px ${d.color}` : 'none'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>{d.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Weekly Target Progress Card */}
            <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3e8ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} color="#c084fc" /> Target Goal Status
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6ee7b7' }}>
                  {loggedHours}h / {targetHours}h
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: '8px' }}>
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #a855f7, #10b981)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                {progressPercent >= 100 ? '🎉 Weekly target completed! Great job maintaining study consistency.' : `Need ${remainingGoalHours} more hours to complete your weekly learning goal.`}
              </p>
            </div>
          </div>

          {/* PANEL 3: Live Session Controls & Target Selector */}
          <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#10b981" /> Live Session Control Center
            </h3>

            {/* Stopwatch Display */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: timerRunning ? '#ef4444' : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: timerRunning ? '#ef4444' : 'var(--text-dim)', display: 'inline-block' }} />
                {timerRunning ? 'LIVE STOPWATCH RUNNING' : 'STOPWATCH READY'}
              </div>

              <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'monospace', color: timerRunning ? '#6ee7b7' : 'var(--text-main)', letterSpacing: '2px' }}>
                {formatTime(elapsedSeconds)}
              </div>

              {/* Stopwatch Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
                {!timerRunning ? (
                  <button 
                    type="button" 
                    onClick={() => setTimerRunning(true)} 
                    className="btn btn-primary btn-block" 
                    style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700 }}
                  >
                    <Play size={16} fill="white" /> Start Timer
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setTimerRunning(false)} 
                    className="btn btn-secondary btn-block" 
                    style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.5)' }}
                  >
                    <Pause size={16} fill="#fca5a5" /> Pause Timer
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={handleResetTimer} 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 14px' }}
                  title="Reset stopwatch"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Active Category Target Selector */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Target Category for Logging:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.keys(categoryBreakdown).map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setSelectedCategoryForLogging(catName)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      border: selectedCategoryForLogging === catName ? '1px solid #c084fc' : '1px solid var(--border-color)',
                      background: selectedCategoryForLogging === catName ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: selectedCategoryForLogging === catName ? '#f3e8ff' : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{catName}</span>
                    {selectedCategoryForLogging === catName && (
                      <span style={{ fontSize: '0.7rem', background: '#c084fc', color: '#0f172a', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Log Buttons for Selected Active Category */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Log Time to [{selectedCategoryForLogging}]:
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => handleQuickAdd(15)} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem' }}>
                  <Plus size={13} /> +15m
                </button>
                <button type="button" onClick={() => handleQuickAdd(30)} className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem' }}>
                  <Plus size={13} /> +30m
                </button>
                <button type="button" onClick={() => handleQuickAdd(60)} className="btn btn-primary btn-sm" style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem' }}>
                  <Plus size={13} /> +1h
                </button>
              </div>
            </div>

            {/* Gamified Rewards Box */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Flame size={24} color="#f59e0b" />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fcd34d', display: 'block' }}>Study Streak Boost</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Every 30 mins studied earns +25 AI Tutor XP points!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>IntelliLearn AI Time Analytics Hub • All categories fully editable in real time.</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimeAnalyticsModal;
