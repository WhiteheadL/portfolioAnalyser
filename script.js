/* =============================================
   PortfolioAI v2 — script.js
   Advanced Technologies · UWE Bristol 2025-26
   ============================================= */

/* -----------------------------------------------
   BACKGROUND PARTICLE CANVAS
----------------------------------------------- */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], width, height;

  function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }

  function createParticle() {
    return { x: Math.random() * width, y: Math.random() * height, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, size: Math.random()*1.5+0.5, opacity: Math.random()*0.4+0.1 };
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 14000);
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(79,142,247,${p.opacity})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,142,247,${0.06*(1-dist/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize(); initParticles(); draw();
})();


/* -----------------------------------------------
   APP STATE
----------------------------------------------- */
const state = {
  apiKey: '',
  v1Content: '',
  v1Url: '',
  v1Results: null,
  v2Results: null,
  chatContext: null,   // { suggestionTitle, suggestionDesc, history[] }
};

const CATEGORIES = ['Visual Design','Interactivity','Content','Performance','Accessibility','Navigation'];


/* -----------------------------------------------
   STEP MANAGEMENT
----------------------------------------------- */
function setStep(n) {
  ['stepInput','stepResults','stepCompare'].forEach((id, i) => {
    document.getElementById(id).style.display = (i === n-1) ? 'block' : 'none';
  });
  document.querySelectorAll('.step-pip').forEach((pip, i) => {
    pip.classList.remove('active','done');
    if (i+1 === n) pip.classList.add('active');
    if (i+1 < n) pip.classList.add('done');
  });
}


/* -----------------------------------------------
   UTILITY
----------------------------------------------- */
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function setLoading(btnId, loaderId, textId, isLoading) {
  const btn  = document.getElementById(btnId);
  const ldr  = document.getElementById(loaderId);
  const txt  = document.getElementById(textId);
  if (btn) btn.disabled = isLoading;
  if (ldr) ldr.style.display = isLoading ? 'flex' : 'none';
  if (txt) txt.style.display = isLoading ? 'none' : 'inline';
}

function animateCounter(el, target) {
  let cur = 0;
  const step = target / 30;
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur);
    if (cur >= target) clearInterval(iv);
  }, 30);
}


/* -----------------------------------------------
   RADAR CHART (Canvas API)
----------------------------------------------- */
function drawRadar(categoryScores) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  const R = Math.min(W,H)*0.38;
  const n = CATEGORIES.length;
  const angles = CATEGORIES.map((_,i) => (Math.PI*2/n)*i - Math.PI/2);

  ctx.clearRect(0,0,W,H);

  // Draw grid rings
  for (let ring = 1; ring <= 5; ring++) {
    const r = R * (ring/5);
    ctx.beginPath();
    angles.forEach((a,i) => {
      const x = cx + r*Math.cos(a), y = cy + r*Math.sin(a);
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw spokes
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R*Math.cos(a), cy + R*Math.sin(a));
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Draw data polygon
  ctx.beginPath();
  CATEGORIES.forEach((cat, i) => {
    const score = (categoryScores[cat] || 5) / 10;
    const r = R * score;
    const x = cx + r*Math.cos(angles[i]);
    const y = cy + r*Math.sin(angles[i]);
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(79,142,247,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(79,142,247,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots at vertices
  CATEGORIES.forEach((cat, i) => {
    const score = (categoryScores[cat] || 5) / 10;
    const r = R * score;
    const x = cx + r*Math.cos(angles[i]);
    const y = cy + r*Math.sin(angles[i]);
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle = '#4f8ef7';
    ctx.fill();
  });

  // Labels
  ctx.font = '600 10px Space Mono, monospace';
  ctx.fillStyle = 'rgba(136,146,168,0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const labelOffsets = [0,-14,14,14,14,-14];
  const labelOffsetX = [0,0,0,0,0,0];
  CATEGORIES.forEach((cat, i) => {
    const lx = cx + (R+26)*Math.cos(angles[i]);
    const ly = cy + (R+26)*Math.sin(angles[i]) + (labelOffsets[i]||0);
    const shortName = cat.replace(' Design','').replace('ility','ility');
    ctx.fillText(shortName.length > 10 ? shortName.substring(0,10) : shortName, lx, ly);
  });
}


/* -----------------------------------------------
   GEMINI API CALL
----------------------------------------------- */
async function callGemini(apiKey, prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err?.error?.message || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiChat(apiKey, history) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 600 } }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || 'API error'); }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function buildAnalysisPrompt(url, content) {
  return `You are an expert web designer and UX consultant specialising in portfolio websites for computer science and creative technology students.

Analyse the following portfolio website content and provide detailed, actionable feedback.

${url ? `Portfolio URL (for reference): ${url}` : ''}

Portfolio Content / Description:
${content}

Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text. Use exactly this structure:

{
  "score": <integer 1-10>,
  "summary": "<2-3 sentence overall assessment>",
  "categoryScores": {
    "Visual Design": <integer 1-10>,
    "Interactivity": <integer 1-10>,
    "Content": <integer 1-10>,
    "Performance": <integer 1-10>,
    "Accessibility": <integer 1-10>,
    "Navigation": <integer 1-10>
  },
  "suggestions": [
    {
      "title": "<short descriptive title>",
      "description": "<2-3 sentence specific, actionable suggestion>",
      "priority": "<high|medium|low>",
      "category": "<Visual Design|Interactivity|Content|Performance|Accessibility|Navigation>"
    }
  ]
}

Provide 6-10 suggestions. Be specific and technical. Focus on: animations and interactivity, modern 2024-25 design trends, AI-powered features that could be added, accessibility, and mobile responsiveness.`;
}


/* -----------------------------------------------
   PARSE GEMINI JSON RESPONSE
----------------------------------------------- */
function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi,'').replace(/```/g,'').trim();
  try { return JSON.parse(cleaned); }
  catch(e) { throw new Error('Could not parse Gemini response as JSON. Please try again.'); }
}


/* -----------------------------------------------
   BUILD SUGGESTION CARD
----------------------------------------------- */
function buildSuggestionCard(s, index, includeChat = true) {
  const priority = (s.priority || 'medium').toLowerCase();
  const card = document.createElement('div');
  card.className = `suggestion-card priority-${priority}`;
  card.style.animationDelay = `${index * 0.05}s`;
  card.dataset.category = s.category || 'General';

  const chatBtn = includeChat
    ? `<button class="ask-gemini-btn" data-title="${escapeHTML(s.title)}" data-desc="${escapeHTML(s.description)}">
        💬 Ask Gemini about this
       </button>`
    : '';

  card.innerHTML = `
    <div class="sug-meta">
      <span class="sug-priority">${priority}</span>
      <span class="sug-category">${escapeHTML(s.category || '')}</span>
    </div>
    <div class="sug-title">${escapeHTML(s.title || '')}</div>
    <div class="sug-desc">${escapeHTML(s.description || '')}</div>
    ${chatBtn}
  `;

  if (includeChat) {
    card.querySelector('.ask-gemini-btn').addEventListener('click', () => {
      openChatModal(s.title, s.description);
    });
  }

  return card;
}


/* -----------------------------------------------
   DISPLAY RESULTS (Step 2)
----------------------------------------------- */
function displayResults(data) {
  state.v1Results = data;

  // Score
  const score = Math.min(10, Math.max(0, Number(data.score) || 0));
  animateCounter(document.getElementById('scoreNumber'), score);
  setTimeout(() => { document.getElementById('scoreFill').style.width = `${score*10}%`; }, 120);

  // Summary
  document.getElementById('summaryCard').textContent = data.summary || '';

  // Radar chart
  drawRadar(data.categoryScores || {});

  // Suggestions
  const grid = document.getElementById('suggestionsGrid');
  grid.innerHTML = '';
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
  const order = { high:0, medium:1, low:2 };
  suggestions.sort((a,b) => (order[a.priority]??1) - (order[b.priority]??1));
  suggestions.forEach((s,i) => grid.appendChild(buildSuggestionCard(s,i,true)));

  setStep(2);
  document.getElementById('analyser').scrollIntoView({ behavior:'smooth', block:'start' });
}


/* -----------------------------------------------
   CATEGORY FILTER TABS
----------------------------------------------- */
document.getElementById('filterTabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;

  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const cat = tab.dataset.cat;
  document.querySelectorAll('#suggestionsGrid .suggestion-card').forEach(card => {
    const match = cat === 'All' || card.dataset.category === cat;
    card.classList.toggle('hidden', !match);
  });
});


/* -----------------------------------------------
   CHAT MODAL
----------------------------------------------- */
function openChatModal(title, desc) {
  state.chatContext = {
    suggestionTitle: title,
    suggestionDesc: desc,
    history: [
      {
        role: 'user',
        text: `I am reviewing a portfolio website improvement suggestion. Here is the suggestion:\n\nTitle: ${title}\n\nDescription: ${desc}\n\nPlease be ready to answer follow-up questions about how to implement this suggestion or explore it further.`
      },
      {
        role: 'model',
        text: `I'm ready to help you implement or explore this suggestion about **${title}**. What would you like to know? You could ask me for code examples, design references, step-by-step guidance, or alternatives.`
      }
    ]
  };

  const chatWindow = document.getElementById('chatWindow');
  chatWindow.innerHTML = '';

  const sys = document.createElement('div');
  sys.className = 'chat-bubble system';
  sys.textContent = `Discussing: "${title}"`;
  chatWindow.appendChild(sys);

  const intro = document.createElement('div');
  intro.className = 'chat-bubble ai';
  intro.textContent = `I'm ready to help you implement or explore this suggestion. What would you like to know? You could ask for code examples, design references, step-by-step guidance, or alternatives.`;
  chatWindow.appendChild(intro);

  document.getElementById('chatModalTitle').textContent = title;
  document.getElementById('chatModal').style.display = 'flex';
  document.getElementById('chatInput').value = '';
  document.getElementById('chatInput').focus();
}

document.getElementById('closeChatModal').addEventListener('click', () => {
  document.getElementById('chatModal').style.display = 'none';
});

document.getElementById('chatModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('chatModal')) {
    document.getElementById('chatModal').style.display = 'none';
  }
});

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});

document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg || !state.apiKey) return;

  const chatWindow = document.getElementById('chatWindow');
  const sendBtn = document.getElementById('chatSendBtn');

  // Add user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = msg;
  chatWindow.appendChild(userBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  input.value = '';
  sendBtn.disabled = true;

  // Add to history
  state.chatContext.history.push({ role: 'user', text: msg });

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-bubble ai';
  typing.textContent = '...';
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const reply = await callGeminiChat(state.apiKey, state.chatContext.history);
    state.chatContext.history.push({ role: 'model', text: reply });
    typing.textContent = reply;
  } catch(e) {
    typing.textContent = `Error: ${e.message}`;
    typing.style.color = 'var(--danger)';
  }

  sendBtn.disabled = false;
  chatWindow.scrollTop = chatWindow.scrollHeight;
  input.focus();
}


/* -----------------------------------------------
   STEP 1 — ANALYSE BUTTON
----------------------------------------------- */
document.getElementById('analyseBtn').addEventListener('click', async () => {
  hideError('errorMsg');

  const apiKey  = document.getElementById('apiKey').value.trim();
  const url     = document.getElementById('urlInput').value.trim();
  const content = document.getElementById('contentInput').value.trim();

  if (!apiKey)         { showError('errorMsg', 'Please enter your Gemini API key.'); return; }
  if (!content)        { showError('errorMsg', 'Please paste your portfolio HTML or describe your site.'); return; }
  if (content.length < 30) { showError('errorMsg', 'Your description is too short. Please add more detail.'); return; }

  state.apiKey    = apiKey;
  state.v1Content = content;
  state.v1Url     = url;

  setLoading('analyseBtn','btnLoader','btnText', true);

  try {
    const raw  = await callGemini(apiKey, buildAnalysisPrompt(url, content));
    const data = parseJSON(raw);
    displayResults(data);
  } catch(e) {
    showError('errorMsg', `Error: ${e.message}`);
  } finally {
    setLoading('analyseBtn','btnLoader','btnText', false);
  }
});


/* -----------------------------------------------
   STEP 3 — RE-ANALYSE & COMPARE
----------------------------------------------- */
document.getElementById('reanalyseBtn').addEventListener('click', () => {
  document.getElementById('compareResults').style.display = 'none';
  document.getElementById('contentV2').value = '';
  setStep(3);
  document.getElementById('analyser').scrollIntoView({ behavior:'smooth' });
});

document.getElementById('backToResultsBtn').addEventListener('click', () => setStep(2));

document.getElementById('reanalyseSubmitBtn').addEventListener('click', async () => {
  hideError('errorMsg2');
  const content2 = document.getElementById('contentV2').value.trim();
  if (!content2) { showError('errorMsg2','Please paste your updated portfolio HTML or description.'); return; }

  setLoading('reanalyseSubmitBtn','reBtnLoader','reBtnText', true);

  try {
    const raw  = await callGemini(state.apiKey, buildAnalysisPrompt(state.v1Url, content2));
    const data = parseJSON(raw);
    state.v2Results = data;
    displayComparison(state.v1Results, data);
  } catch(e) {
    showError('errorMsg2', `Error: ${e.message}`);
  } finally {
    setLoading('reanalyseSubmitBtn','reBtnLoader','reBtnText', false);
  }
});


/* -----------------------------------------------
   DISPLAY COMPARISON
----------------------------------------------- */
function displayComparison(v1, v2) {
  const s1 = Number(v1.score) || 0;
  const s2 = Number(v2.score) || 0;
  const delta = s2 - s1;

  document.getElementById('scoreBefore').textContent = s1;
  document.getElementById('scoreAfter').textContent  = s2;

  const deltaEl = document.getElementById('compareDelta');
  deltaEl.textContent = (delta > 0 ? '+' : '') + delta.toFixed(1);
  deltaEl.className = 'compare-delta ' + (delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral');

  // Category comparison bars
  const barsEl = document.getElementById('compareBars');
  barsEl.innerHTML = '<div style="font-family:var(--mono);font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent2);margin-bottom:1rem;">Category Score Comparison</div>';

  CATEGORIES.forEach(cat => {
    const before = (v1.categoryScores?.[cat] || 5);
    const after  = (v2.categoryScores?.[cat] || 5);
    const d = after - before;
    const deltaStr = (d > 0 ? '+' : '') + d;
    const deltaColor = d > 0 ? 'var(--accent2)' : d < 0 ? 'var(--danger)' : 'var(--text2)';

    const row = document.createElement('div');
    row.className = 'compare-bar-row';
    row.innerHTML = `
      <div class="compare-bar-label">
        <span>${cat}</span>
        <span style="color:${deltaColor};font-weight:700;">${deltaStr} &nbsp;(${before}→${after})</span>
      </div>
      <div class="compare-bar-track">
        <div class="compare-bar-before" style="width:0%" data-target="${before*10}"></div>
      </div>
      <div class="compare-bar-track" style="margin-top:3px;">
        <div class="compare-bar-after" style="width:0%" data-target="${after*10}"></div>
      </div>
    `;
    barsEl.appendChild(row);
  });

  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll('.compare-bar-before, .compare-bar-after').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 150);

  // v2 summary
  document.getElementById('summaryV2').textContent = v2.summary || '';

  // v2 suggestions
  const grid2 = document.getElementById('suggestionsGridV2');
  grid2.innerHTML = '<div style="font-family:var(--mono);font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent2);margin-bottom:0.75rem;">New Suggestions</div>';
  const suggestions2 = Array.isArray(v2.suggestions) ? v2.suggestions : [];
  const order = { high:0, medium:1, low:2 };
  suggestions2.sort((a,b)=>(order[a.priority]??1)-(order[b.priority]??1));
  suggestions2.forEach((s,i) => grid2.appendChild(buildSuggestionCard(s,i,false)));

  document.getElementById('compareResults').style.display = 'block';
  document.getElementById('compareResults').scrollIntoView({ behavior:'smooth', block:'start' });
}


/* -----------------------------------------------
   RESET BUTTONS
----------------------------------------------- */
function resetAll() {
  state.apiKey = '';
  state.v1Content = '';
  state.v1Results = null;
  state.v2Results = null;
  document.getElementById('contentInput').value = '';
  document.getElementById('urlInput').value = '';
  document.getElementById('contentV2').value = '';
  document.getElementById('scoreNumber').textContent = '0';
  document.getElementById('scoreFill').style.width = '0%';
  document.getElementById('summaryCard').textContent = '';
  document.getElementById('suggestionsGrid').innerHTML = '';
  document.getElementById('compareResults').style.display = 'none';
  // Reset filter tabs
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.filter-tab[data-cat="All"]').classList.add('active');
  setStep(1);
  document.getElementById('analyser').scrollIntoView({ behavior:'smooth' });
}

document.getElementById('resetBtn').addEventListener('click', resetAll);
document.getElementById('resetBtn2').addEventListener('click', resetAll);
