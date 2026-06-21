import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Moon, Sun, Flame, CheckCircle, Activity, Droplet, Smile, Edit2, Trash2, Calendar, Download, Home, BarChart3, Settings } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

// 6 Days of realistic baseline data with full timestamps
const initialLogs = [
  { id: 1, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), sleep: 7.5, water: 2000, mood: 4, energy: 3, symptoms: ['Fatigue'], meds: ['Vitamin D3'], notes: 'Good day overall' },
  { id: 2, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), sleep: 6.0, water: 1500, mood: 3, energy: 2, symptoms: ['Headache'], meds: ['Vitamin D3', 'Magnesium'], notes: 'Headache in afternoon' },
  { id: 3, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), sleep: 8.0, water: 2500, mood: 5, energy: 4, symptoms: [], meds: ['Vitamin D3', 'Magnesium'], notes: 'Excellent recovery day' },
  { id: 4, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), sleep: 5.5, water: 1200, mood: 2, energy: 1, symptoms: ['Headache', 'Brain Fog'], meds: [], notes: 'Stressful day' },
  { id: 5, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), sleep: 7.0, water: 1800, mood: 4, energy: 3, symptoms: ['Fatigue'], meds: ['Vitamin D3'], notes: 'Recovery good' },
  { id: 6, date: new Date(Date.now()).toISOString(), sleep: 8.5, water: 2500, mood: 5, energy: 5, symptoms: [], meds: ['Vitamin D3', 'Magnesium'], notes: 'Feeling great!' },
];

const defaultGoals = {
  sleep: 8,
  water: 2500,
  mood: 4,
  energy: 4
};

export default function App() {
  // Theme & Auth States
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // View Navigation
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, analytics, settings

  // Daily Tracker Form States
  const [logs, setLogs] = useState(initialLogs);
  const [goals, setGoals] = useState(defaultGoals);
  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(1000);
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [notes, setNotes] = useState('');

  // Edit Mode
  const [editingId, setEditingId] = useState(null);

  // Fixed Trackers arrays
  const symptomsList = ['Headache', 'Fatigue', 'Brain Fog', 'Insomnia', 'Anxiety', 'Nausea', 'Dizziness'];
  const medicationList = ['Vitamin D3', 'Magnesium', 'Omega-3', 'Prescription A', 'Aspirin', 'Multivitamin'];

  useEffect(() => {
    const savedSession = localStorage.getItem('activeUser');
    if (savedSession) {
      const userData = JSON.parse(savedSession);
      setUser(userData);
      const userLogs = localStorage.getItem(`logs_${userData.email}`);
      if (userLogs) setLogs(JSON.parse(userLogs));
      const userGoals = localStorage.getItem(`goals_${userData.email}`);
      if (userGoals) setGoals(JSON.parse(userGoals));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`logs_${user.email}`, JSON.stringify(logs));
    }
  }, [logs, user]);

  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Please fill out all registration fields.');
      return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    if (isSignUp) {
      if (storedUsers.find(u => u.email === email)) {
        setAuthError('User already exists with this email.');
        return;
      }
      const newUser = { email, password, streak: 5, joinDate: new Date().toISOString() };
      storedUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
      localStorage.setItem('activeUser', JSON.stringify(newUser));
      localStorage.setItem(`logs_${email}`, JSON.stringify(initialLogs));
      localStorage.setItem(`goals_${email}`, JSON.stringify(defaultGoals));
      setUser(newUser);
    } else {
      const matchedUser = storedUsers.find(u => u.email === email && u.password === password);
      if (matchedUser) {
        localStorage.setItem('activeUser', JSON.stringify(matchedUser));
        setUser(matchedUser);
      } else {
        setAuthError('Invalid authentication credentials.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    setUser(null);
    setCurrentView('dashboard');
  };

  const toggleTarget = (item, list, setList) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = logs.map(log => 
        log.id === editingId 
          ? { ...log, sleep: parseFloat(sleep), water: parseInt(water), mood: parseInt(mood), energy: parseInt(energy), symptoms: selectedSymptoms, meds: selectedMeds, notes }
          : log
      );
      setLogs(updated);
      setEditingId(null);
    } else {
      const newLog = {
        id: Math.max(...logs.map(l => l.id), 0) + 1,
        date: new Date().toISOString(),
        sleep: parseFloat(sleep),
        water: parseInt(water),
        mood: parseInt(mood),
        energy: parseInt(energy),
        symptoms: selectedSymptoms,
        meds: selectedMeds,
        notes
      };
      setLogs([...logs, newLog]);
    }
    
    setSleep(7);
    setWater(1000);
    setMood(4);
    setEnergy(4);
    setSelectedSymptoms([]);
    setSelectedMeds([]);
    setNotes('');
  };

  const handleEditEntry = (log) => {
    setEditingId(log.id);
    setSleep(log.sleep);
    setWater(log.water);
    setMood(log.mood);
    setEnergy(log.energy);
    setSelectedSymptoms(log.symptoms || []);
    setSelectedMeds(log.meds || []);
    setNotes(log.notes || '');
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm('Delete this entry?')) {
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  // Analytics Calculations
  const last7Logs = logs.slice(-7);
  const totalFatigueCount = logs.filter(l => l.symptoms?.includes('Fatigue')).length;
  const averageSleep = (logs.reduce((acc, curr) => acc + curr.sleep, 0) / logs.length).toFixed(1);
  const averageMood = (logs.reduce((acc, curr) => acc + curr.mood, 0) / logs.length).toFixed(1);
  const averageWater = Math.round(logs.reduce((acc, curr) => acc + curr.water, 0) / logs.length);
  const averageEnergy = (logs.reduce((acc, curr) => acc + curr.energy, 0) / logs.length).toFixed(1);
  
  // Symptom frequency
  const symptomFreq = {};
  logs.forEach(log => {
    log.symptoms?.forEach(s => {
      symptomFreq[s] = (symptomFreq[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Chart Data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: darkMode ? '#f3f4f6' : '#1f2937' } }
    },
    scales: {
      x: { grid: { color: darkMode ? '#374151' : '#e5e7eb' }, ticks: { color: darkMode ? '#9ca3af' : '#4b5563' } },
      y: { grid: { color: darkMode ? '#374151' : '#e5e7eb' }, ticks: { color: darkMode ? '#9ca3af' : '#4b5563' } }
    }
  };

  const mainChartData = {
    labels: last7Logs.map((l, i) => {
      const d = new Date(l.date);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
    datasets: [
      { label: 'Sleep (hrs)', data: last7Logs.map(l => l.sleep), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.3 },
      { label: 'Mood (1-5)', data: last7Logs.map(l => l.mood), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3 },
      { label: 'Energy (1-5)', data: last7Logs.map(l => l.energy), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.3 }
    ]
  };

  const waterChartData = {
    labels: last7Logs.map((l, i) => {
      const d = new Date(l.date);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [{
      label: 'Water (ml)',
      data: last7Logs.map(l => l.water),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 2
    }]
  };

  const symptomChartData = {
    labels: topSymptoms.map(s => s[0]),
    datasets: [{
      label: 'Frequency',
      data: topSymptoms.map(s => s[1]),
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'],
      borderWidth: 0
    }]
  };

  const moodDistribution = {
    labels: ['Very Bad', 'Bad', 'Okay', 'Good', 'Great'],
    datasets: [{
      label: 'Mood Distribution',
      data: [
        logs.filter(l => l.mood === 1).length,
        logs.filter(l => l.mood === 2).length,
        logs.filter(l => l.mood === 3).length,
        logs.filter(l => l.mood === 4).length,
        logs.filter(l => l.mood === 5).length
      ],
      backgroundColor: ['#dc2626', '#ea580c', '#eab308', '#84cc16', '#10b981'],
      borderWidth: 0
    }]
  };

  const theme = darkMode ? styles.dark : styles.light;

  if (!user) {
    return (
      <div style={{ ...styles.authContainer, backgroundColor: theme.bg }}>
        <div style={{ ...styles.authCard, backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
          <h2 style={styles.brandTitle}>💓 Health Journal</h2>
          <p style={{ color: theme.textMuted, textAlign: 'center', marginBottom: '2rem' }}>Health Tracking & Wellness Insights</p>
          {authError && <div style={styles.errorBadge}>{authError}</div>}
          <form onSubmit={handleAuth} style={styles.form}>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...styles.input, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} />
            <button type="submit" style={styles.primaryButton}>{isSignUp ? 'Create Account' : 'Sign In'}</button>
          </form>
          <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={styles.textButton}>
            {isSignUp ? 'Already have an account? Sign in' : 'No account? Create one'}
          </button>
        </div>
      </div>
    );
  }

  const hydrationTarget = goals.water;
  const currentHydration = logs[logs.length - 1]?.water || 0;
  const hydrationPercentage = Math.min(Math.round((currentHydration / hydrationTarget) * 100), 100);

  // Get wellness recommendations
  const getRecommendations = () => {
    const recs = [];
    if (averageSleep < 7) recs.push('💤 Try to get at least 7-8 hours of sleep. You\'re averaging ' + averageSleep + ' hours.');
    if (averageWater < 2000) recs.push('💧 Increase water intake. Current average: ' + averageWater + 'ml, target: 2500ml.');
    if (totalFatigueCount > 3) recs.push('⚡ Fatigue detected ' + totalFatigueCount + ' times. Consider energy management strategies.');
    if (averageMood < 3) recs.push('😊 Your mood has been lower than usual. Consider relaxation activities.');
    if (averageEnergy < 3) recs.push('🔋 Low energy levels detected. Ensure adequate rest and nutrition.');
    if (recs.length === 0) recs.push('✨ Great job! Keep maintaining these healthy habits.');
    return recs;
  };

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div style={{ ...styles.dashboardContainer, backgroundColor: theme.bg, color: theme.text }}>
        <header style={{ ...styles.navbar, backgroundColor: theme.card, borderColor: theme.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#3b82f6" />
            <h1 style={styles.navTitle}>💓 Health Journal</h1>
          </div>
          <div style={styles.userSection}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ ...styles.iconButton, borderColor: theme.border, color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ ...styles.streakBadge }}><Flame size={16} fill="#f97316" color="#f97316" /> {user.streak || 5} Day Streak</div>
            <button onClick={() => setCurrentView('settings')} style={{ ...styles.iconButton, borderColor: theme.border, color: theme.text }}>
              <Settings size={18} />
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        </header>

        <nav style={styles.tabNav}>
          <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'dashboard' ? '#3b82f6' : 'transparent', color: currentView === 'dashboard' ? '#3b82f6' : theme.textMuted }}>
            <Home size={16} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('analytics')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'analytics' ? '#3b82f6' : 'transparent', color: currentView === 'analytics' ? '#3b82f6' : theme.textMuted }}>
            <BarChart3 size={16} /> Analytics
          </button>
          <button onClick={() => setCurrentView('entries')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'entries' ? '#3b82f6' : 'transparent', color: currentView === 'entries' ? '#3b82f6' : theme.textMuted }}>
            <Calendar size={16} /> Entries
          </button>
        </nav>

        <main style={styles.gridContainer}>
          {/* Daily Input Section */}
          <section style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={styles.cardTitle}>{editingId ? '✏️ Edit Entry' : '📝 Today\'s Entry'}</h2>
              {editingId && <button onClick={() => { setEditingId(null); setSleep(7); setWater(1000); setMood(4); setEnergy(4); setSelectedSymptoms([]); setSelectedMeds([]); setNotes(''); }} style={styles.secondaryButton}>Cancel</button>}
            </div>
            <form onSubmit={handleLogSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sleep: <span style={{ color: '#3b82f6' }}>{sleep} hrs</span> (Target: {goals.sleep})</label>
                <input type="range" min="0" max="24" step="0.5" value={sleep} onChange={(e) => setSleep(e.target.value)} style={styles.rangeInput} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Energy Level: <span style={{ color: '#f59e0b' }}>{energy}/5</span></label>
                <div style={styles.moodRow}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button key={num} type="button" onClick={() => setEnergy(num)} style={{ ...styles.moodBtn, backgroundColor: energy === num ? '#f59e0b' : theme.inputBg, color: energy === num ? '#fff' : theme.text }}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Water Intake: <span style={{ color: '#3b82f6' }}>{water}ml</span> / {hydrationTarget}ml</label>
                <div style={styles.fluidRow}>
                  <button type="button" onClick={() => setWater(water + 250)} style={styles.actionPill}><Droplet size={14} /> +250ml</button>
                  <button type="button" onClick={() => setWater(water + 500)} style={styles.actionPill}><Droplet size={14} /> +500ml</button>
                  <input type="number" min="0" value={water} onChange={(e) => setWater(e.target.value)} style={{ ...styles.input, flex: 0.5, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Mood: <span style={{ color: '#10b981' }}>{mood}/5</span></label>
                <div style={styles.moodRow}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button key={num} type="button" onClick={() => setMood(num)} style={{ ...styles.moodBtn, backgroundColor: mood === num ? '#10b981' : theme.inputBg, color: mood === num ? '#fff' : theme.text }}>
                      <Smile size={16} style={{ opacity: mood === num ? 1 : 0.4 }} /> {num}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Symptoms</label>
                <div style={styles.chipRow}>
                  {symptomsList.map(s => {
                    const has = selectedSymptoms.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleTarget(s, selectedSymptoms, setSelectedSymptoms)} style={{ ...styles.chip, backgroundColor: has ? '#ef4444' : theme.inputBg, color: has ? '#fff' : theme.text }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Medications</label>
                <div style={styles.medicationRow}>
                  {medicationList.map(m => {
                    const taken = selectedMeds.includes(m);
                    return (
                      <div key={m} onClick={() => toggleTarget(m, selectedMeds, setSelectedMeds)} style={{ ...styles.medRowItem, backgroundColor: theme.inputBg, borderColor: taken ? '#10b981' : theme.border }}>
                        <CheckCircle size={16} color={taken ? '#10b981' : '#9ca3af'} fill={taken ? 'rgba(16,185,129,0.2)' : 'none'} />
                        <span style={{ fontSize: '0.875rem', textDecoration: taken ? 'line-through' : 'none', opacity: taken ? 0.5 : 1 }}>{m}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How are you feeling? Any notes?" style={{ ...styles.textarea, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }} />
              </div>

              <button type="submit" style={styles.submitButton}>{editingId ? 'Update Entry' : 'Log Entry'}</button>
            </form>
          </section>

          {/* Analytics & Insights Section */}
          <div style={styles.analyticsColumn}>
            {/* Quick Stats */}
            <div style={{ ...styles.statsGrid }}>
              <div style={{ ...styles.statCard, backgroundColor: theme.card, borderColor: theme.border }}>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Avg Sleep</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#3b82f6' }}>{averageSleep}h</div>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: theme.card, borderColor: theme.border }}>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Avg Mood</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981' }}>{averageMood}/5</div>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: theme.card, borderColor: theme.border }}>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Avg Energy</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>{averageEnergy}/5</div>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: theme.card, borderColor: theme.border }}>
                <div style={{ fontSize: '0.875rem', color: theme.textMuted }}>Total Entries</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#8b5cf6' }}>{logs.length}</div>
              </div>
            </div>

            {/* Hydration Progress */}
            <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
              <h3 style={styles.cardTitle}>💧 Hydration Progress</h3>
              <div style={styles.progressLayout}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{hydrationPercentage}%</span>
                <div style={styles.trackBg}>
                  <div style={{ ...styles.trackFill, width: `${hydrationPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
              <h3 style={styles.cardTitle}>🎯 Wellness Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {getRecommendations().map((rec, i) => (
                  <div key={i} style={{ fontSize: '0.875rem', color: theme.textMuted, padding: '0.5rem', borderLeft: '3px solid #3b82f6', paddingLeft: '0.75rem' }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chart */}
            <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border, flex: 1 }}>
              <h3 style={styles.cardTitle}>📊 7-Day Trends</h3>
              <div style={styles.chartArea}>
                <Line data={mainChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Analytics View
  if (currentView === 'analytics') {
    return (
      <div style={{ ...styles.dashboardContainer, backgroundColor: theme.bg, color: theme.text }}>
        <header style={{ ...styles.navbar, backgroundColor: theme.card, borderColor: theme.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#3b82f6" />
            <h1 style={styles.navTitle}>💓 Health Journal</h1>
          </div>
          <div style={styles.userSection}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ ...styles.iconButton, borderColor: theme.border, color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        </header>

        <nav style={styles.tabNav}>
          <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'dashboard' ? '#3b82f6' : 'transparent', color: currentView === 'dashboard' ? '#3b82f6' : theme.textMuted }}>
            <Home size={16} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('analytics')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'analytics' ? '#3b82f6' : 'transparent', color: currentView === 'analytics' ? '#3b82f6' : theme.textMuted }}>
            <BarChart3 size={16} /> Analytics
          </button>
          <button onClick={() => setCurrentView('entries')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'entries' ? '#3b82f6' : 'transparent', color: currentView === 'entries' ? '#3b82f6' : theme.textMuted }}>
            <Calendar size={16} /> Entries
          </button>
        </nav>

        <main style={styles.gridContainer}>
          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>📊 Water Intake Analysis</h2>
            <div style={styles.chartArea}>
              <Bar data={waterChartData} options={chartOptions} />
            </div>
          </div>

          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>🤒 Top Symptoms</h2>
            <div style={styles.chartArea}>
              <Pie data={symptomChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: darkMode ? '#f3f4f6' : '#1f2937' } } } }} />
            </div>
          </div>

          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>😊 Mood Distribution</h2>
            <div style={styles.chartArea}>
              <Pie data={moodDistribution} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: darkMode ? '#f3f4f6' : '#1f2937' } } } }} />
            </div>
          </div>

          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>📈 Summary Statistics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.statLine}>
                <span>Total Entries:</span>
                <strong>{logs.length}</strong>
              </div>
              <div style={styles.statLine}>
                <span>Avg Sleep:</span>
                <strong>{averageSleep} hours</strong>
              </div>
              <div style={styles.statLine}>
                <span>Avg Water:</span>
                <strong>{averageWater}ml</strong>
              </div>
              <div style={styles.statLine}>
                <span>Avg Mood:</span>
                <strong>{averageMood}/5</strong>
              </div>
              <div style={styles.statLine}>
                <span>Avg Energy:</span>
                <strong>{averageEnergy}/5</strong>
              </div>
              <div style={styles.statLine}>
                <span>Most Common Symptom:</span>
                <strong>{topSymptoms.length > 0 ? topSymptoms[0][0] : 'None'}</strong>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Entries View
  if (currentView === 'entries') {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return (
      <div style={{ ...styles.dashboardContainer, backgroundColor: theme.bg, color: theme.text }}>
        <header style={{ ...styles.navbar, backgroundColor: theme.card, borderColor: theme.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#3b82f6" />
            <h1 style={styles.navTitle}>💓 Health Journal</h1>
          </div>
          <div style={styles.userSection}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ ...styles.iconButton, borderColor: theme.border, color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        </header>

        <nav style={styles.tabNav}>
          <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'dashboard' ? '#3b82f6' : 'transparent', color: currentView === 'dashboard' ? '#3b82f6' : theme.textMuted }}>
            <Home size={16} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('analytics')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'analytics' ? '#3b82f6' : 'transparent', color: currentView === 'analytics' ? '#3b82f6' : theme.textMuted }}>
            <BarChart3 size={16} /> Analytics
          </button>
          <button onClick={() => setCurrentView('entries')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'entries' ? '#3b82f6' : 'transparent', color: currentView === 'entries' ? '#3b82f6' : theme.textMuted }}>
            <Calendar size={16} /> Entries
          </button>
        </nav>

        <main style={{ ...styles.gridContainer, gridTemplateColumns: '1fr' }}>
          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>📅 All Entries</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedLogs.map(log => (
                <div key={log.id} style={{ ...styles.entryCard, backgroundColor: theme.inputBg, borderColor: theme.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: theme.textMuted, marginBottom: '0.5rem' }}>
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <span><strong>Sleep:</strong> {log.sleep}h</span>
                        <span><strong>Water:</strong> {log.water}ml</span>
                        <span><strong>Mood:</strong> {log.mood}/5</span>
                        <span><strong>Energy:</strong> {log.energy}/5</span>
                      </div>
                      {log.symptoms && log.symptoms.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Symptoms:</strong> {log.symptoms.join(', ')}
                        </div>
                      )}
                      {log.meds && log.meds.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Meds:</strong> {log.meds.join(', ')}
                        </div>
                      )}
                      {log.notes && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: theme.textMuted, fontStyle: 'italic' }}>
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditEntry(log)} style={styles.iconButtonSmall} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteEntry(log.id)} style={{ ...styles.iconButtonSmall, color: '#ef4444' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Settings View
  if (currentView === 'settings') {
    return (
      <div style={{ ...styles.dashboardContainer, backgroundColor: theme.bg, color: theme.text }}>
        <header style={{ ...styles.navbar, backgroundColor: theme.card, borderColor: theme.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#3b82f6" />
            <h1 style={styles.navTitle}>💓 Health Journal</h1>
          </div>
          <div style={styles.userSection}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ ...styles.iconButton, borderColor: theme.border, color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        </header>

        <nav style={styles.tabNav}>
          <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'dashboard' ? '#3b82f6' : 'transparent', color: currentView === 'dashboard' ? '#3b82f6' : theme.textMuted }}>
            <Home size={16} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('analytics')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'analytics' ? '#3b82f6' : 'transparent', color: currentView === 'analytics' ? '#3b82f6' : theme.textMuted }}>
            <BarChart3 size={16} /> Analytics
          </button>
          <button onClick={() => setCurrentView('entries')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'entries' ? '#3b82f6' : 'transparent', color: currentView === 'entries' ? '#3b82f6' : theme.textMuted }}>
            <Calendar size={16} /> Entries
          </button>
          <button onClick={() => setCurrentView('settings')} style={{ ...styles.tabBtn, borderBottomColor: currentView === 'settings' ? '#3b82f6' : 'transparent', color: currentView === 'settings' ? '#3b82f6' : theme.textMuted }}>
            <Settings size={16} /> Settings
          </button>
        </nav>

        <main style={styles.gridContainer}>
          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>⚙️ Health Goals</h2>
            <form style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Sleep (hours): <span style={{ color: '#3b82f6' }}>{goals.sleep}</span></label>
                <input type="range" min="4" max="12" step="0.5" value={goals.sleep} onChange={(e) => setGoals({...goals, sleep: parseFloat(e.target.value)})} style={styles.rangeInput} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Water (ml): <span style={{ color: '#3b82f6' }}>{goals.water}</span></label>
                <input type="range" min="1000" max="4000" step="100" value={goals.water} onChange={(e) => setGoals({...goals, water: parseInt(e.target.value)})} style={styles.rangeInput} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Mood (1-5): <span style={{ color: '#10b981' }}>{goals.mood}</span></label>
                <input type="range" min="1" max="5" value={goals.mood} onChange={(e) => setGoals({...goals, mood: parseInt(e.target.value)})} style={styles.rangeInput} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Energy (1-5): <span style={{ color: '#f59e0b' }}>{goals.energy}</span></label>
                <input type="range" min="1" max="5" value={goals.energy} onChange={(e) => setGoals({...goals, energy: parseInt(e.target.value)})} style={styles.rangeInput} />
              </div>

              <button type="button" onClick={() => localStorage.setItem(`goals_${user.email}`, JSON.stringify(goals))} style={styles.submitButton}>Save Goals</button>
            </form>
          </div>

          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>👤 Account Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Email:</span>
                <strong>{user.email}</strong>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Member Since:</span>
                <strong>{new Date(user.joinDate).toLocaleDateString()}</strong>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Current Streak:</span>
                <strong>{user.streak || 5} days</strong>
              </div>
              <div style={styles.infoRow}>
                <span style={{ color: theme.textMuted }}>Total Entries:</span>
                <strong>{logs.length}</strong>
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, backgroundColor: theme.card, borderColor: theme.border }}>
            <h2 style={styles.cardTitle}>📊 Export Data</h2>
            <button 
              onClick={() => {
                const data = JSON.stringify({ user: { email: user.email }, logs, goals }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `healthjournal_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              style={styles.submitButton}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} /> Download as JSON
            </button>
          </div>
        </main>
      </div>
    );
  }
}

// Full Design System
const styles = {
  light: { bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', text: '#0f172a', textMuted: '#64748b', inputBg: '#f1f5f9' },
  dark: { bg: '#0b0f19', card: '#111827', border: '#1f2937', text: '#f9fafb', textMuted: '#9ca3af', inputBg: '#1f2937' },

  authContainer: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', transition: 'background-color 0.3s ease' },
  authCard: { width: '100%', maxWidth: '440px', padding: '3rem 2.5rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' },
  brandTitle: { fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', margin: '0', color: '#3b82f6' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  input: { padding: '0.85rem 1rem', border: '1px solid', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.2s', fontFamily: 'inherit' },
  textarea: { padding: '0.85rem 1rem', border: '1px solid', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.2s', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' },
  primaryButton: { padding: '0.85rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  secondaryButton: { padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
  textButton: { background: 'none', border: 'none', color: '#3b82f6', marginTop: '1.5rem', width: '100%', cursor: 'pointer', fontSize: '0.875rem' },

  dashboardContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s ease' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', borderBottom: '1px solid', transition: 'all 0.3s' },
  navTitle: { fontSize: '1.35rem', margin: 0, fontWeight: '800' },
  premiumTag: { fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.5rem', borderRadius: '40px', fontWeight: 'bold' },
  userSection: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  iconButton: { padding: '0.5rem', border: '1px solid', borderRadius: '8px', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' },
  iconButtonSmall: { padding: '0.5rem', border: '1px solid transparent', borderRadius: '6px', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#3b82f6', transition: 'all 0.2s' },
  streakBadge: { display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(249,115,22,0.1)', color: '#ea580c', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' },
  logoutButton: { padding: '0.45rem 0.9rem', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s' },

  tabNav: { display: 'flex', gap: '0', padding: '0 5%', borderBottom: '1px solid', transition: 'all 0.3s', overflowX: 'auto' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', borderBottom: '2px solid', transition: 'all 0.2s', whiteSpace: 'nowrap' },

  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', padding: '2.5rem 5%', width: '100%', boxSizing: 'border-box' },
  card: { borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: 'background-color 0.3s' },
  analyticsColumn: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' },
  statCard: { borderRadius: '12px', padding: '1.25rem', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' },
  cardTitle: { fontSize: '1.2rem', fontWeight: '700', margin: '0' },
  label: { fontSize: '0.875rem', fontWeight: '600' },
  rangeInput: { width: '100%', accentColor: '#3b82f6', cursor: 'pointer' },
  fluidRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  actionPill: { padding: '0.4rem 0.8rem', border: 'none', borderRadius: '20px', backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' },
  moodRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  moodBtn: { flex: 1, minWidth: '60px', padding: '0.6rem', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', transition: 'all 0.2s' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  chip: { padding: '0.4rem 0.9rem', borderRadius: '30px', border: 'none', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
  medicationRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  medRowItem: { padding: '0.65rem 0.85rem', border: '1px solid', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', transition: 'all 0.2s' },
  submitButton: { padding: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  alertPanel: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem', lineHeight: '1.4' },
  progressLayout: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  trackBg: { flex: 1, backgroundColor: 'rgba(156,163,175,0.2)', height: '14px', borderRadius: '20px', overflow: 'hidden' },
  trackFill: { backgroundColor: '#3b82f6', height: '100%', borderRadius: '20px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
  chartArea: { minHeight: '280px', height: '100%', position: 'relative' },
  entryCard: { borderRadius: '12px', padding: '1.25rem', border: '1px solid', transition: 'all 0.2s' },
  statLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', fontSize: '0.95rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', fontSize: '0.95rem' },
  errorBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500' }
};