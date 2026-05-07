// ══════════════════════════════════════════
//  SYNAPSE — Complete Application
//  Supabase Auth + Memory + Groq AI
// ══════════════════════════════════════════

// ── Config — REPLACE THESE ──
var SUPABASE_URL  = 'https://gfbfifoxiebwonuasnwy.supabase.co';        // e.g. https://xxx.supabase.co
var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmZpZm94aWVid29udWFzbnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTc5NDEsImV4cCI6MjA5MzY3Mzk0MX0.XV2t660ttDPFW8UjnVULmPEjbm5FXt-nAagCtNsHJgk';   // eyJhbG...
var GROQ_API_KEY  = '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';            // gsk_...
var GROQ_URL      = 'https://api.groq.com/openai/v1/chat/completions';
var MODEL         = 'llama-3.3-70b-versatile';

// ── Supabase client ──
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Runtime state ──
var currentUser      = null;
var currentProfile   = null;
var currentMemory    = null;
var currentSessionId = null;
var conversationHistory = [];
var isWaiting        = false;

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════

function switchTab(tab) {
  var tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  event.target.classList.add('active');
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

async function signup() {
  var name     = document.getElementById('signupName').value.trim();
  var cls      = document.getElementById('signupClass').value;
  var email    = document.getElementById('signupEmail').value.trim();
  var password = document.getElementById('signupPassword').value;
  var errEl    = document.getElementById('signupError');
  var btn      = document.getElementById('signupBtnText');

  errEl.textContent = '';
  if (!name || !cls || !email || !password) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  btn.textContent = 'Creating account...';
  document.querySelector('#signupForm .auth-btn').disabled = true;

  try {
    var res = await sb.auth.signUp({ email: email, password: password });
    if (res.error) throw res.error;

    var userId = res.data.user.id;
    var levelMap = {6:'Level 1',7:'Level 1',8:'Level 2',9:'Level 2',10:'Level 3',11:'Level 4',12:'Level 4'};

    // Create profile
    await sb.from('profiles').insert({
      id:    userId,
      name:  name,
      class: parseInt(cls),
      level: levelMap[parseInt(cls)] || 'Level 2',
      topics: []
    });

    // Create memory
    await sb.from('student_memory').insert({
      user_id:     userId,
      summary:     '',
      open_threads: [],
      struggles:   []
    });

    // Auto sign in
    await sb.auth.signInWithPassword({ email: email, password: password });

  } catch(e) {
    errEl.textContent = e.message || 'Something went wrong. Please try again.';
    btn.textContent = 'Create Account →';
    document.querySelector('#signupForm .auth-btn').disabled = false;
  }
}

async function login() {
  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  var errEl    = document.getElementById('loginError');
  var btn      = document.getElementById('loginBtnText');

  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Please enter your email and password.'; return; }

  btn.textContent = 'Signing in...';
  document.querySelector('#loginForm .auth-btn').disabled = true;

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;
  } catch(e) {
    errEl.textContent = e.message || 'Invalid email or password.';
    btn.textContent = 'Sign In →';
    document.querySelector('#loginForm .auth-btn').disabled = false;
  }
}

async function signOut() {
  await sb.auth.signOut();
  currentUser = null;
  currentProfile = null;
  currentMemory = null;
  currentSessionId = null;
  conversationHistory = [];
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('loginBtnText').textContent = 'Sign In →';
  document.querySelector('#loginForm .auth-btn').disabled = false;
}

// ══════════════════════════════════════════
//  PROFILE & MEMORY
// ══════════════════════════════════════════

async function loadProfile(userId) {
  var res = await sb.from('profiles').select('*').eq('id', userId).single();
  if (res.error) return null;
  return res.data;
}

async function loadMemory(userId) {
  var res = await sb.from('student_memory').select('*').eq('user_id', userId).single();
  if (res.error) return { summary:'', open_threads:[], struggles:[] };
  return res.data;
}

async function saveProfile(updates) {
  if (!currentUser) return;
  await sb.from('profiles').update(updates).eq('id', currentUser.id);
  Object.assign(currentProfile, updates);
}

async function saveMemory(updates) {
  if (!currentUser) return;
  updates.last_updated = new Date().toISOString();
  await sb.from('student_memory').update(updates).eq('user_id', currentUser.id);
  Object.assign(currentMemory, updates);
}

async function updateMemoryAfterSession(fullConversation) {
  if (!currentUser || fullConversation.length < 4) return;

  // Ask AI to summarize what was learned
  try {
    var summaryRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are a memory system for a biology tutor. Given a conversation, extract: 1) A 2-3 sentence summary of what was learned. 2) Any open curiosity threads (things the student was curious about but not yet explored). 3) Any concepts the student struggled with. Respond in JSON only: {"summary":"...","open_threads":["..."],"struggles":["..."]}'
          },
          {
            role: 'user',
            content: 'Conversation:\n' + fullConversation.slice(-10).map(function(m) { return m.role + ': ' + m.content; }).join('\n')
          }
        ]
      })
    });

    var data = await summaryRes.json();
    var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) return;

    var clean = text.replace(/```json|```/g, '').trim();
    var parsed = JSON.parse(clean);

    var newSummary = (currentMemory.summary ? currentMemory.summary + ' ' : '') + (parsed.summary || '');
    var newThreads = (currentMemory.open_threads || []).concat(parsed.open_threads || []).slice(-10);
    var newStruggles = (currentMemory.struggles || []).concat(parsed.struggles || []).slice(-10);

    await saveMemory({
      summary: newSummary.slice(0, 2000),
      open_threads: newThreads,
      struggles: newStruggles
    });

    // Update topics in profile
    var bioTopics = ['cell','mitosis','photosynthesis','respiration','genetics','DNA','enzyme','osmosis','evolution','ecosystem','organ','tissue','bacteria','virus','nutrition'];
    var newTopics = (currentProfile.topics || []).slice();
    fullConversation.forEach(function(m) {
      bioTopics.forEach(function(t) {
        if (m.content.toLowerCase().indexOf(t) !== -1 && newTopics.indexOf(t) === -1) {
          newTopics.push(t);
        }
      });
    });
    if (newTopics.length !== (currentProfile.topics || []).length) {
      await saveProfile({ topics: newTopics });
    }

  } catch(e) {
    console.warn('Memory update failed:', e);
  }
}

// ══════════════════════════════════════════
//  SESSIONS
// ══════════════════════════════════════════

async function loadSessions() {
  if (!currentUser) return [];
  var res = await sb.from('sessions')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return res.data || [];
}

async function createSession() {
  if (!currentUser) return null;
  var res = await sb.from('sessions').insert({
    user_id: currentUser.id,
    title: 'New Session'
  }).select().single();
  if (res.error) return null;
  return res.data;
}

async function updateSessionTitle(sessionId, title) {
  await sb.from('sessions').update({ title: title.slice(0, 50) }).eq('id', sessionId);
}

async function deleteSessionById(sessionId) {
  await sb.from('messages').delete().eq('session_id', sessionId);
  await sb.from('sessions').delete().eq('id', sessionId);
}

async function loadMessages(sessionId) {
  var res = await sb.from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  return res.data || [];
}

async function saveMessage(sessionId, role, content) {
  if (!currentUser) return;
  await sb.from('messages').insert({
    session_id: sessionId,
    user_id: currentUser.id,
    role: role,
    content: content
  });
}

// ══════════════════════════════════════════
//  SYSTEM PROMPT
// ══════════════════════════════════════════

function buildSystemPrompt() {
  var p = currentProfile || {};
  var m = currentMemory  || {};

  var ctx = 'STUDENT PROFILE:\n';
  ctx += 'Name: ' + (p.name || 'unknown') + '\n';
  ctx += 'Class: ' + (p.class || 'unknown') + '\n';
  ctx += 'Level: ' + (p.level || 'unknown') + '\n';
  ctx += 'Topics covered: ' + ((p.topics && p.topics.length > 0) ? p.topics.join(', ') : 'none yet') + '\n';

  if (m.summary) ctx += '\nPAST LEARNING SUMMARY:\n' + m.summary + '\n';
  if (m.open_threads && m.open_threads.length > 0) ctx += '\nOPEN CURIOSITY THREADS (bring these back naturally):\n' + m.open_threads.join(', ') + '\n';
  if (m.struggles && m.struggles.length > 0) ctx += '\nCONCEPTS TO REINFORCE (student struggled with these):\n' + m.struggles.join(', ') + '\n';

  return 'You are Synapse — a dedicated biology tutor for Indian students from Class 6 to Class 12. Your only job is to teach biology — not to answer questions, but to build understanding.\n\n' + ctx + '\nIMPORTANT: You already know this student. Never ask for their name or class again. Build every response on what they already know. Reference their past learning naturally when relevant.\n\nRESPONSE FORMAT:\n- Maximum 120 words per response.\n- Short paragraphs — 2 to 3 sentences each.\n- Use **bold** for scientific terms on first use.\n- End every response with exactly one question that makes the student think.\n- For visuals: write [IMAGE: query] on its own line. Max one per response. Only for structures/processes.\n- Write like you are talking directly to the student. Use "you" and "your body". Never like a textbook.\n\nDEPTH LEVELS:\nLevel 1 (Class 6-7): Simple language, no jargon, wow factor.\nLevel 2 (Class 7-8): Introduce mechanism simply, terminology explained.\nLevel 3 (Class 9-10): Correct scientific detail, focus on how and why.\nLevel 4 (Class 11-12): Molecular detail, exceptions, connections.\nLevel 5 (curiosity-triggered): Current research, unsolved questions.\n\nTEACHING STRUCTURE (internal — never announce):\n1. Hook with something felt/seen/experienced — never start with a definition\n2. Introduce concept at right level\n3. Make them visualize it like a scene\n4. Ground in real world right now\n5. Answer why this mechanism exists\n6. One question requiring application\n7. Plant one open thread for next time\n\nANALOGY RULES:\n- Analogies assist, never replace. Always follow with correct science.\n- One mechanism, one analogy. Name where it breaks down immediately.\n- Only use when concept is genuinely abstract.\n- Personalize to student\'s world once known.\n\nCURRICULUM: You hold the map. Student drives pace. You drive sequence. Never skip prerequisites. Never ask what to learn next — decide yourself.\n\nINTUITION: Lead with the problem, not the concept. Make the student feel they predicted the science. Never let them feel they know everything — always reveal one open frontier.\n\nTONE: Warm, never fake. Never condescending. Never say "Great question!" Show genuine engagement. Never say "That\'s wrong" — ask "What makes you think that?"\n\nABSOLUTE: Never teach outside biology. Never skip foundations. Never let misconceptions slide. Goal is understanding, not completion.';
}

// ══════════════════════════════════════════
//  GREETINGS
// ══════════════════════════════════════════

var GREETINGS = [
  function(n) { return n + '! You\'re back. The cells missed you.'; },
  function(n) { return 'Welcome back, ' + n + '. Ready to go deeper?'; },
  function(n) { return 'Hey ' + n + ' — pick up where you left off?'; },
  function(n) { return n + '! Good to see you. Let\'s get into it.'; },
  function(n) { return 'Back again, ' + n + '? Let\'s make this session count.'; },
  function(n) { return n + ', welcome back. Biology got more interesting while you were gone.'; },
  function(n) { return 'Oh — ' + n + '\'s here. Let\'s go.'; }
];

function getGreeting(name) {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)](name);
}

// ══════════════════════════════════════════
//  UI
// ══════════════════════════════════════════

function updateStudentUI() {
  if (!currentProfile) return;
  document.getElementById('studentNm').textContent  = currentProfile.name || 'Student';
  document.getElementById('studentLv').textContent  = currentProfile.level || '—';
  document.getElementById('studentAvi').textContent = currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : '?';
}

function renderMarkdown(text) {
  var t = text.replace(/\[IMAGE:[^\]]+\]/g, '').trim();
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/(?:^|\n)\d+\.\s(.+)/g, '<li>$1</li>');
  t = t.replace(/(<li>[\s\S]+?<\/li>)/g, '<ol>$1</ol>');
  t = t.replace(/\n\n+/g, '</p><p>');
  t = t.replace(/\n/g, '<br>');
  return '<p>' + t + '</p>';
}

function injectImages(bubble, fullText) {
  var regex = /\[IMAGE:\s*(.+?)\]/g;
  var match;
  var promises = [];
  while ((match = regex.exec(fullText)) !== null) {
    (function(query) {
      var p = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.thumbnail && data.thumbnail.source) {
            var wrap = document.createElement('div');
            wrap.className = 'img-wrap';
            wrap.innerHTML = '<img src="' + data.thumbnail.source + '" class="bio-img" onerror="this.parentElement.style.display=\'none\'"/><div class="img-cap">' + data.title + '</div>';
            bubble.appendChild(wrap);
          }
        }).catch(function() {});
      promises.push(p);
    })(match[1].trim());
  }
  return Promise.all(promises);
}

function appendMessage(role, text, animate) {
  if (animate === undefined) animate = true;
  var container = document.getElementById('messages');

  var msg = document.createElement('div');
  msg.className = 'message ' + role;
  if (!animate) msg.style.animation = 'none';

  var avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'ai' ? '⬡' : (currentProfile && currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : 'S');

  var bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = role === 'ai' ? renderMarkdown(text) : '';
  if (role === 'user') bubble.textContent = text;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function showWelcome(isReturning) {
  var container = document.getElementById('messages');
  container.innerHTML = '';

  var el = document.createElement('div');
  el.className = 'welcome';

  if (isReturning && currentProfile) {
    var lastActive = currentProfile.topics && currentProfile.topics.length > 0
      ? 'Last studied: ' + currentProfile.topics[currentProfile.topics.length - 1]
      : '';
    el.innerHTML =
      '<div class="welcome-glyph">⬡</div>' +
      '<h1 class="welcome-title"><em>' + getGreeting(currentProfile.name) + '</em></h1>' +
      '<p class="welcome-sub">Your progress is saved across all devices. Keep going.</p>' +
      (lastActive ? '<p class="welcome-time">' + lastActive + '</p>' : '');
  } else {
    el.innerHTML =
      '<div class="welcome-glyph">⬡</div>' +
      '<h1 class="welcome-title">Welcome to <em>Synapse</em></h1>' +
      '<p class="welcome-sub">Biology that actually makes sense. Just start typing.</p>';
  }

  container.appendChild(el);
}

async function renderSessions() {
  var list = document.getElementById('sessionsList');
  list.innerHTML = '';
  var sessions = await loadSessions();

  if (sessions.length === 0) {
    list.innerHTML = '<div class="no-sessions">No sessions yet</div>';
    return;
  }

  sessions.forEach(function(s) {
    var el = document.createElement('div');
    el.className = 'session-item' + (s.id === currentSessionId ? ' active' : '');
    el.innerHTML =
      '<div class="session-item-title">' + (s.title || 'New Session') + '</div>' +
      '<div class="session-item-row">' +
        '<div class="session-item-date">' + new Date(s.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short'}) + '</div>' +
        '<div class="session-del" onclick="delSession(event,' + s.id + ')">✕</div>' +
      '</div>';
    el.onclick = function() { openSession(s.id); };
    list.appendChild(el);
  });
}

// ══════════════════════════════════════════
//  SESSION MANAGEMENT
// ══════════════════════════════════════════

async function newSession() {
  var session = await createSession();
  if (!session) return;

  currentSessionId = session.id;
  conversationHistory = [];

  var container = document.getElementById('messages');
  container.innerHTML = '';

  document.getElementById('sessionName').textContent = 'New Session';

  if (currentProfile) {
    var greeting = getGreeting(currentProfile.name);
    appendMessage('ai', greeting);
    conversationHistory.push({ role: 'assistant', content: greeting });
    await saveMessage(currentSessionId, 'assistant', greeting);
  } else {
    showWelcome(false);
  }

  await renderSessions();
  document.getElementById('userInput').focus();
}

async function openSession(sessionId) {
  currentSessionId = sessionId;
  conversationHistory = [];

  var msgs = await loadMessages(sessionId);
  var container = document.getElementById('messages');
  container.innerHTML = '';

  if (msgs.length === 0) {
    showWelcome(true);
  } else {
    msgs.forEach(function(m) {
      appendMessage(m.role === 'assistant' ? 'ai' : 'user', m.content, false);
      conversationHistory.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
    });
  }

  // Update session name in topbar
  var sessions = await loadSessions();
  var s = sessions.find(function(x) { return x.id === sessionId; });
  if (s) document.getElementById('sessionName').textContent = s.title || 'Session';

  await renderSessions();
  container.scrollTop = container.scrollHeight;
  document.getElementById('userInput').focus();
}

async function delSession(e, id) {
  e.stopPropagation();
  await deleteSessionById(id);
  if (currentSessionId === id) {
    await newSession();
  } else {
    await renderSessions();
  }
}

// ══════════════════════════════════════════
//  SEND MESSAGE
// ══════════════════════════════════════════

function sendMessage() {
  var input = document.getElementById('userInput');
  var text  = input.value.trim();
  if (!text || isWaiting) return;

  // Clear welcome if showing
  var welcome = document.querySelector('.welcome');
  if (welcome) welcome.remove();

  input.value = '';
  autoResize(input);

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Save user message
  if (currentSessionId) {
    saveMessage(currentSessionId, 'user', text);
    // Update session title from first user message
    if (conversationHistory.filter(function(m) { return m.role === 'user'; }).length === 1) {
      updateSessionTitle(currentSessionId, text);
      document.getElementById('sessionName').textContent = text.slice(0, 40);
      renderSessions();
    }
  }

  isWaiting = true;
  document.getElementById('sendBtn').disabled = true;

  var container = document.getElementById('messages');
  var msg = document.createElement('div');
  msg.className = 'message ai';

  var avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '⬡';

  var bubble = document.createElement('div');
  bubble.className = 'bubble streaming';

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  var fullText = '';
  var messages = [{ role: 'system', content: buildSystemPrompt() }].concat(conversationHistory);

  fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GROQ_API_KEY
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      messages: messages
    })
  })
  .then(function(res) {
    if (!res.ok) {
      return res.json().then(function(err) {
        throw new Error((err.error ? err.error.message : res.statusText));
      });
    }

    var reader  = res.body.getReader();
    var decoder = new TextDecoder();

    function read() {
      return reader.read().then(function(result) {
        if (result.done) return;
        var lines = decoder.decode(result.value, { stream: true }).split('\n');
        lines.forEach(function(line) {
          if (!line.startsWith('data: ')) return;
          var data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            var parsed = JSON.parse(data);
            var token  = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
            if (token) {
              fullText += token;
              bubble.innerHTML = renderMarkdown(fullText);
              bubble.classList.add('streaming');
              container.scrollTop = container.scrollHeight;
            }
          } catch(e) {}
        });
        return new Promise(function(resolve) { setTimeout(function() { resolve(read()); }, 8); });
      });
    }

    return read();
  })
  .then(function() {
    bubble.classList.remove('streaming');
    bubble.innerHTML = renderMarkdown(fullText);
    return injectImages(bubble, fullText);
  })
  .then(function() {
    container.scrollTop = container.scrollHeight;
    conversationHistory.push({ role: 'assistant', content: fullText });

    // Save to Supabase
    if (currentSessionId) {
      saveMessage(currentSessionId, 'assistant', fullText);
    }

    // Update memory after every 6 messages
    if (conversationHistory.length % 6 === 0) {
      updateMemoryAfterSession(conversationHistory);
    }

    isWaiting = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('userInput').focus();
  })
  .catch(function(err) {
    bubble.classList.remove('streaming');
    bubble.innerHTML = '<p>Something went wrong: ' + err.message + '. Please try again.</p>';
    console.error('Synapse error:', err);
    isWaiting = false;
    document.getElementById('sendBtn').disabled = false;
  });
}

// ══════════════════════════════════════════
//  KEYBOARD & RESIZE
// ══════════════════════════════════════════

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ══════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════

window.addEventListener('load', function() {

  // Listen for auth state changes
  sb.auth.onAuthStateChange(async function(event, session) {
    if (session && session.user) {
      currentUser = session.user;

      // Load profile and memory
      currentProfile = await loadProfile(currentUser.id);
      currentMemory  = await loadMemory(currentUser.id);

      // Show app
      document.getElementById('authScreen').style.display = 'none';
      document.getElementById('mainApp').style.display    = 'flex';

      updateStudentUI();

      // Load most recent session or create new one
      var sessions = await loadSessions();

      if (sessions.length > 0) {
        // Returning user — open most recent session
        currentSessionId = sessions[0].id;
        var msgs = await loadMessages(currentSessionId);

        if (msgs.length > 0) {
          var container = document.getElementById('messages');
          container.innerHTML = '';
          msgs.forEach(function(m) {
            appendMessage(m.role === 'assistant' ? 'ai' : 'user', m.content, false);
            conversationHistory.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
          });

          // Welcome back greeting
          var greeting = getGreeting(currentProfile.name);
          appendMessage('ai', greeting);
          conversationHistory.push({ role: 'assistant', content: greeting });
          saveMessage(currentSessionId, 'assistant', greeting);
          container.scrollTop = container.scrollHeight;
        } else {
          showWelcome(true);
        }

        document.getElementById('sessionName').textContent = sessions[0].title || 'Session';
      } else {
        // New user — create first session
        var session = await createSession();
        if (session) {
          currentSessionId = session.id;
          showWelcome(false);
        }
      }

      await renderSessions();
      document.getElementById('userInput').focus();

    } else {
      // Not logged in — show auth
      document.getElementById('mainApp').style.display    = 'none';
      document.getElementById('authScreen').style.display = 'flex';
    }
  });

});
