// ══════════════════════════════════════════
//  SYNAPSE V2 — Complete Application
//  Auth + Tree + Lessons + AI + Memory
// ══════════════════════════════════════════

// ── Config ──
var SUPABASE_URL = 'https://gfbfifoxiebwonuasnwy.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmZpZm94aWVid29udWFzbnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTc5NDEsImV4cCI6MjA5MzY3Mzk0MX0.XV2t660ttDPFW8UjnVULmPEjbm5FXt-nAagCtNsHJgk';
var GROQ_KEY     = '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';
var GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
var MODEL        = 'llama-3.3-70b-versatile';

// ── Supabase ──
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── State ──
var currentUser     = null;
var currentProfile  = null;
var currentMemory   = null;
var progress        = {};   // { lessonId: 'completed' | 'started' }
var currentLesson   = null;
var currentBranch   = null;
var currentChapter  = null;
var lessonSteps     = [];
var currentStep     = 0;
var isNarrating     = false;
var chatOpen        = false;
var chatHistory     = [];
var isWaiting       = false;

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════

function showTab(tab) {
  var isSignup = tab === 'signup';
  document.getElementById('loginPanel').style.display  = isSignup ? 'none' : 'block';
  document.getElementById('signupPanel').style.display = isSignup ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', !isSignup);
  document.getElementById('tabSignup').classList.toggle('active', isSignup);
  var ind = document.getElementById('tabIndicator');
  if (isSignup) ind.classList.add('right'); else ind.classList.remove('right');
}

async function signup() {
  var name  = document.getElementById('signupName').value.trim();
  var cls   = document.getElementById('signupClass').value;
  var email = document.getElementById('signupEmail').value.trim();
  var pass  = document.getElementById('signupPassword').value;
  var err   = document.getElementById('signupError');
  var btn   = document.getElementById('signupBtn');

  err.textContent = '';
  if (!name || !cls || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }

  btn.textContent = 'Creating your journey...';
  btn.disabled = true;

  try {
    var res = await sb.auth.signUp({ email: email, password: pass });
    if (res.error) throw res.error;

    var uid = res.data.user.id;
    var levelMap = { 6:'Level 1', 7:'Level 1', 8:'Level 2', 9:'Level 2', 10:'Level 3', 11:'Level 4', 12:'Level 4' };

    await sb.from('profiles').insert({
      id: uid, name: name,
      class: parseInt(cls),
      level: levelMap[parseInt(cls)] || 'Level 2',
      topics: []
    });

    await sb.from('student_memory').insert({
      user_id: uid, summary: '',
      open_threads: [], struggles: []
    });

    await sb.auth.signInWithPassword({ email: email, password: pass });

  } catch(e) {
    err.textContent = e.message || 'Something went wrong.';
    btn.textContent = 'Begin Your Journey';
    btn.disabled = false;
  }
}

async function login() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass  = document.getElementById('loginPassword').value;
  var err   = document.getElementById('loginError');
  var btn   = document.getElementById('loginBtn');

  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Please enter your email and password.'; return; }

  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error) throw res.error;
  } catch(e) {
    err.textContent = e.message || 'Invalid email or password.';
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

async function signOut() {
  await sb.auth.signOut();
  showScreen('authScreen');
  document.getElementById('loginBtn').textContent = 'Sign In';
  document.getElementById('loginBtn').disabled = false;
}

// ══════════════════════════════════════════
//  SCREEN MANAGEMENT
// ══════════════════════════════════════════

function showScreen(id) {
  var screens = ['authScreen', 'mapScreen', 'lessonScreen'];
  screens.forEach(function(s) {
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}

// ══════════════════════════════════════════
//  PROFILE & PROGRESS
// ══════════════════════════════════════════

async function loadProfile(uid) {
  var r = await sb.from('profiles').select('*').eq('id', uid).single();
  return r.error ? null : r.data;
}

async function loadMemory(uid) {
  var r = await sb.from('student_memory').select('*').eq('user_id', uid).single();
  return r.error ? { summary:'', open_threads:[], struggles:[] } : r.data;
}

async function loadProgress(uid) {
  // Store progress as topics array in profile for simplicity
  // Each completed lesson ID stored in profile.topics
  var r = await sb.from('profiles').select('topics').eq('id', uid).single();
  if (r.error) return {};
  var completed = r.data.topics || [];
  var prog = {};
  completed.forEach(function(id) { prog[id] = 'completed'; });
  return prog;
}

async function markLessonComplete(lessonId) {
  if (!currentUser || progress[lessonId] === 'completed') return;
  progress[lessonId] = 'completed';
  var completed = Object.keys(progress).filter(function(k) { return progress[k] === 'completed'; });
  await sb.from('profiles').update({ topics: completed }).eq('id', currentUser.id);
}

// ══════════════════════════════════════════
//  CURRICULUM MAP
// ══════════════════════════════════════════

function showMap() {
  showScreen('mapScreen');
  chatHistory = [];
  currentLesson = null;
  renderMap();
}

function renderMap() {
  if (!CURRICULUM || CURRICULUM.length === 0) return;
  var chapter = CURRICULUM[0]; // Start with first chapter
  currentChapter = chapter;

  document.getElementById('mapTitle').textContent    = chapter.title;
  document.getElementById('mapSubtitle').textContent = chapter.subtitle;
  document.getElementById('mapAvi').textContent      = currentProfile ? currentProfile.name.charAt(0).toUpperCase() : '?';
  document.getElementById('mapStudentName').textContent  = currentProfile ? currentProfile.name : '';
  document.getElementById('mapStudentLevel').textContent = currentProfile ? currentProfile.level : '';

  drawTree(chapter);
  updateProgress(chapter);
  spawnParticles('mapParticles', 40);
}

function updateProgress(chapter) {
  var total = 0;
  var done  = 0;
  chapter.branches.forEach(function(b) {
    b.lessons.forEach(function(l) {
      total++;
      if (progress[l.id] === 'completed') done++;
    });
  });

  var pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('mapProgressFill').style.width = pct + '%';
  document.getElementById('mapProgressLabel').textContent = done + ' of ' + total + ' lessons complete';
}

// ── Tree Drawing ──
function drawTree(chapter) {
  var canvas  = document.getElementById('treeDrawing');
  var nodesEl = document.getElementById('treeNodes');
  var rect    = document.getElementById('treeCanvas').getBoundingClientRect();

  canvas.width  = rect.width;
  canvas.height = rect.height;

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var cx  = canvas.width / 2;
  var cy  = canvas.height;
  var nodePositions = {};

  // Define branch positions manually for organic feel
  var branchLayouts = [
    { cx: cx,          cy: cy * 0.75, angle: 90  },   // center — what is a cell
    { cx: cx * 0.38,   cy: cy * 0.42, angle: 130 },   // left   — cell structure
    { cx: cx * 1.62,   cy: cy * 0.42, angle: 50  },   // right  — cell processes
  ];

  // Draw trunk
  drawBranch(ctx, cx, cy, cx, cy * 0.8, 6, 0.3);

  chapter.branches.forEach(function(branch, bi) {
    var layout = branchLayouts[bi] || branchLayouts[0];
    var prereqDone = isBranchUnlocked(branch, chapter);

    // Draw branch line from trunk
    var startX = cx;
    var startY = cy * (0.8 - bi * 0.05);
    drawBranch(ctx, startX, startY, layout.cx, layout.cy, 3 - bi * 0.5, prereqDone ? 1 : 0.2);

    // Draw sub-branches for lessons
    branch.lessons.forEach(function(lesson, li) {
      var angle   = layout.angle + (li === 0 ? -20 : 20);
      var rad     = (angle * Math.PI) / 180;
      var dist    = 80 + li * 20;
      var lx      = layout.cx + Math.cos(rad) * dist;
      var ly      = layout.cy - Math.sin(rad) * dist;
      var lessonUnlocked = isLessonUnlocked(lesson, branch, chapter);

      drawBranch(ctx, layout.cx, layout.cy, lx, ly, 1.5, lessonUnlocked ? 0.8 : 0.15);
      nodePositions[lesson.id] = { x: lx, y: ly };
    });

    // Branch node (label only, no clickable node)
    nodePositions['branch_' + branch.id] = { x: layout.cx, y: layout.cy };
    drawBranchLabel(nodesEl, layout.cx, layout.cy, branch.title, canvas.width, canvas.height, prereqDone);
  });

  // Draw lesson nodes
  nodesEl.innerHTML = '';
  chapter.branches.forEach(function(branch, bi) {
    var prereqDone = isBranchUnlocked(branch, chapter);
    var layout = branchLayouts[bi] || branchLayouts[0];

    // Re-draw branch label
    drawBranchLabel(nodesEl, layout.cx, layout.cy, branch.title, canvas.width, canvas.height, prereqDone);

    branch.lessons.forEach(function(lesson) {
      var pos = nodePositions[lesson.id];
      if (!pos) return;
      var state = getLessonState(lesson, branch, chapter);
      drawLessonNode(nodesEl, pos.x, pos.y, lesson, state, canvas.width, canvas.height);
    });
  });
}

function drawBranch(ctx, x1, y1, x2, y2, width, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#5deb8a';
  ctx.lineWidth   = width;
  ctx.lineCap     = 'round';

  // Organic curve
  var cpx = (x1 + x2) / 2 + (Math.random() - 0.5) * 20;
  var cpy = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;

  ctx.shadowColor = 'rgba(93,235,138,0.4)';
  ctx.shadowBlur  = width * 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawBranchLabel(container, x, y, title, cw, ch, unlocked) {
  var el = document.createElement('div');
  el.className = 'branch-label';
  el.style.left = (x / cw * 100) + '%';
  el.style.top  = ((y / ch * 100) - 8) + '%';
  el.innerHTML  = '<div class="branch-label-text" style="opacity:' + (unlocked ? 0.7 : 0.3) + '">' + title + '</div>';
  container.appendChild(el);
}

function drawLessonNode(container, x, y, lesson, state, cw, ch) {
  var el = document.createElement('div');
  el.className = 'tree-node ' + state;
  el.style.left = (x / cw * 100) + '%';
  el.style.top  = (y / ch * 100) + '%';

  var icon = state === 'completed' ? '✓' : state === 'locked' ? '🔒' : '→';

  el.innerHTML =
    '<div class="node-ring">' +
      '<div class="node-ring-inner">' + icon + '</div>' +
    '</div>' +
    '<div class="node-label">' +
      '<span class="node-label-title">' + lesson.title + '</span>' +
      '<span class="node-label-duration">' + lesson.duration + '</span>' +
    '</div>';

  if (state !== 'locked') {
    el.onclick = (function(l) {
      return function() { startLesson(l); };
    })(lesson);
  }

  container.appendChild(el);
}

function isBranchUnlocked(branch, chapter) {
  if (!branch.prerequisite) return true;
  var prereqBranch = chapter.branches.find(function(b) { return b.id === branch.prerequisite; });
  if (!prereqBranch) return true;
  return prereqBranch.lessons.every(function(l) { return progress[l.id] === 'completed'; });
}

function isLessonUnlocked(lesson, branch, chapter) {
  if (!isBranchUnlocked(branch, chapter)) return false;
  var idx = branch.lessons.indexOf(lesson);
  if (idx === 0) return true;
  return progress[branch.lessons[idx - 1].id] === 'completed';
}

function getLessonState(lesson, branch, chapter) {
  if (progress[lesson.id] === 'completed') return 'completed';
  if (!isLessonUnlocked(lesson, branch, chapter)) return 'locked';
  var idx = branch.lessons.indexOf(lesson);
  var isFirst = true;
  chapter.branches.forEach(function(b) {
    b.lessons.forEach(function(l, i) {
      if (l.id === lesson.id && (i > 0 || !isBranchUnlocked(b, chapter))) isFirst = false;
    });
  });
  return 'available';
}

// ══════════════════════════════════════════
//  LESSON ENGINE
// ══════════════════════════════════════════

function startLesson(lesson) {
  currentLesson = lesson;
  chatHistory   = [];
  chatOpen      = false;

  // Find branch
  currentChapter.branches.forEach(function(b) {
    b.lessons.forEach(function(l) {
      if (l.id === lesson.id) currentBranch = b;
    });
  });

  // Set up header
  document.getElementById('lessonHeaderTitle').textContent = lesson.title;
  document.getElementById('lessonBranchTag').textContent   = currentChapter.title;
  document.getElementById('lessonTitle').textContent       = lesson.title;
  document.getElementById('lessonSubtitle').textContent    = lesson.subtitle;

  // Reset chat
  document.getElementById('chatArea').style.display   = 'none';
  document.getElementById('chatMessages').innerHTML   = '';
  document.getElementById('chatToggleText').textContent = 'Ask Synapse a question ↓';

  // Build lesson steps
  lessonSteps   = buildLessonSteps(lesson);
  currentStep   = 0;

  // Set up progress dots
  buildProgressDots();

  // Load visual
  loadVisual(lesson.visual);

  // Show lesson screen
  showScreen('lessonScreen');

  // Start first step
  runStep();
}

function buildLessonSteps(lesson) {
  // Each lesson has a set of steps: narrate → interact → result → narrate → ...
  // These are pre-authored per lesson ID, AI fills in the narration
  var steps = LESSON_STEPS[lesson.id] || LESSON_STEPS['default'];
  return steps;
}

function buildProgressDots() {
  var container = document.getElementById('lessonDots');
  container.innerHTML = '';
  var interactionCount = lessonSteps.filter(function(s) { return s.type === 'interaction'; }).length;
  var total = interactionCount + 1;
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot_' + i;
    container.appendChild(dot);
  }
}

function updateProgressDots(stepIndex) {
  var dots = document.querySelectorAll('.progress-dot');
  dots.forEach(function(d, i) {
    d.className = 'progress-dot' + (i < stepIndex ? ' done' : i === stepIndex ? ' active' : '');
  });
}

async function runStep() {
  if (currentStep >= lessonSteps.length) {
    lessonComplete();
    return;
  }

  var step = lessonSteps[currentStep];

  if (step.type === 'narrate') {
    document.getElementById('interactionBlock').style.display = 'none';
    document.getElementById('resultBlock').style.display      = 'none';
    document.getElementById('narrationBlock').style.display   = 'block';

    // Update visual highlight
    if (step.highlight) highlightVisualPart(step.highlight);
    if (step.caption)   document.getElementById('visualCaption').textContent = step.caption;

    await narrateAI(step.prompt, step.context);

  } else if (step.type === 'interaction') {
    document.getElementById('resultBlock').style.display = 'none';
    showInteraction(step);

  } else if (step.type === 'complete') {
    lessonComplete();
  }
}

async function narrateAI(prompt, context) {
  isNarrating = true;
  var el      = document.getElementById('narrationText');
  var cursor  = document.querySelector('.narration-cursor');
  el.innerHTML = '';
  cursor.classList.remove('hidden');

  var systemPrompt = buildLessonSystemPrompt();
  var messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: prompt + (context ? '\n\nContext: ' + context : '') }
  ];

  var fullText = '';

  try {
    var res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: MODEL, max_tokens: 200, stream: true, messages: messages
      })
    });

    var reader  = res.body.getReader();
    var decoder = new TextDecoder();

    while (true) {
      var result = await reader.read();
      if (result.done) break;
      var lines = decoder.decode(result.value, { stream: true }).split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.startsWith('data: ')) continue;
        var data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          var parsed = JSON.parse(data);
          var token  = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
          if (token) {
            fullText += token;
            el.innerHTML = renderInlineMarkdown(fullText);
            await new Promise(function(r) { setTimeout(r, 12); });
          }
        } catch(e) {}
      }
    }

  } catch(err) {
    el.textContent = 'Something went wrong loading this section. Please try again.';
    console.error(err);
  }

  cursor.classList.add('hidden');
  isNarrating = false;

  // Auto-advance to next step after narration if next is also narration
  currentStep++;
  var nextStep = lessonSteps[currentStep];
  if (nextStep && nextStep.type === 'narrate') {
    setTimeout(runStep, 800);
  } else if (nextStep && nextStep.type === 'interaction') {
    setTimeout(runStep, 600);
  } else if (nextStep && nextStep.type === 'complete') {
    setTimeout(lessonComplete, 1000);
  }
}

function showInteraction(step) {
  document.getElementById('narrationBlock').style.display   = 'block';
  document.getElementById('interactionBlock').style.display = 'block';
  document.getElementById('interactionPrompt').textContent  = step.prompt;
  document.getElementById('interactionSubmit').disabled     = false;

  var content = document.getElementById('interactionContent');
  content.innerHTML = '';

  if (step.interactionType === 'mcq') {
    buildMCQ(step, content);
  } else if (step.interactionType === 'label') {
    buildLabeling(step, content);
  }

  // Update dot
  var dotIndex = lessonSteps.slice(0, currentStep + 1).filter(function(s) { return s.type === 'interaction'; }).length;
  updateProgressDots(dotIndex);

  if (step.highlight) highlightVisualPart(step.highlight);
  if (step.caption)   document.getElementById('visualCaption').textContent = step.caption;
}

// ── MCQ ──
var selectedMCQ = null;

function buildMCQ(step, container) {
  selectedMCQ = null;
  var div = document.createElement('div');
  div.className = 'mcq-options';

  step.options.forEach(function(opt, i) {
    var btn = document.createElement('div');
    btn.className = 'mcq-option';
    btn.textContent = opt.text;
    btn.onclick = function() {
      document.querySelectorAll('.mcq-option').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedMCQ = i;
    };
    div.appendChild(btn);
  });

  container.appendChild(div);
}

// ── Labeling ──
var labelAnswers = {};
var selectedLabel = null;

function buildLabeling(step, container) {
  labelAnswers  = {};
  selectedLabel = null;

  var targetsDiv = document.createElement('div');
  targetsDiv.className = 'label-targets';

  step.targets.forEach(function(target) {
    labelAnswers[target.id] = null;
    var t = document.createElement('div');
    t.className   = 'label-target';
    t.id          = 'target_' + target.id;
    t.textContent = target.label || '___';
    t.setAttribute('data-id', target.id);
    t.onclick     = function() {
      if (selectedLabel !== null) {
        t.textContent = selectedLabel;
        t.classList.add('filled');
        labelAnswers[target.id] = selectedLabel;
        selectedLabel = null;
        document.querySelectorAll('.label-option').forEach(function(o) {
          if (o.textContent === t.textContent) o.classList.add('used');
        });
      }
    };
    targetsDiv.appendChild(t);
  });

  var optionsDiv = document.createElement('div');
  optionsDiv.className = 'label-options';

  step.options.forEach(function(opt) {
    var o = document.createElement('div');
    o.className   = 'label-option';
    o.textContent = opt;
    o.onclick     = function() {
      document.querySelectorAll('.label-option').forEach(function(x) { x.style.background = ''; x.style.borderColor = ''; });
      selectedLabel   = opt;
      o.style.background   = 'var(--accent-dim)';
      o.style.borderColor  = 'var(--accent3)';
    };
    optionsDiv.appendChild(o);
  });

  container.appendChild(targetsDiv);
  container.appendChild(optionsDiv);
}

// ── Submit Interaction ──
function submitInteraction() {
  var step = lessonSteps[currentStep];
  var correct = false;
  var feedback = '';

  if (step.interactionType === 'mcq') {
    if (selectedMCQ === null) return;
    var opt = step.options[selectedMCQ];
    correct  = opt.correct === true;
    feedback = opt.feedback || (correct ? step.correctFeedback : step.wrongFeedback);
    document.querySelectorAll('.mcq-option').forEach(function(b, i) {
      if (step.options[i] && step.options[i].correct) b.classList.add('correct');
      else if (i === selectedMCQ && !correct) b.classList.add('wrong');
    });

  } else if (step.interactionType === 'label') {
    var allCorrect = true;
    step.targets.forEach(function(target) {
      var ans     = labelAnswers[target.id];
      var el      = document.getElementById('target_' + target.id);
      if (ans === target.answer) {
        if (el) el.classList.add('correct');
      } else {
        allCorrect = false;
        if (el) { el.classList.add('wrong'); el.textContent = target.answer; }
      }
    });
    correct  = allCorrect;
    feedback = correct ? step.correctFeedback : step.wrongFeedback;
  }

  document.getElementById('interactionSubmit').disabled = true;

  var resultBlock = document.getElementById('resultBlock');
  var resultText  = document.getElementById('resultText');
  resultText.innerHTML   = renderInlineMarkdown(feedback);
  resultBlock.style.display = 'block';
  resultBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (correct) {
    highlightVisualPart(step.highlightOnCorrect || step.highlight);
  }

  currentStep++;
}

function nextStep() {
  document.getElementById('resultBlock').style.display      = 'none';
  document.getElementById('interactionBlock').style.display = 'none';
  runStep();
}

// ── Lesson Complete ──
async function lessonComplete() {
  document.getElementById('interactionBlock').style.display = 'none';
  document.getElementById('resultBlock').style.display      = 'none';

  var el     = document.getElementById('narrationText');
  var cursor = document.querySelector('.narration-cursor');
  cursor.classList.remove('hidden');

  await narrateText(
    'You\'ve completed <strong>' + currentLesson.title + '</strong>. ' +
    'That wasn\'t just information — you built a real understanding of something happening inside your body right now. ' +
    'Your map has grown. What\'s waiting next is even more interesting.',
    el
  );

  cursor.classList.add('hidden');
  await markLessonComplete(currentLesson.id);

  var nextBtn = document.createElement('button');
  nextBtn.className   = 'next-btn';
  nextBtn.style.marginTop = '16px';
  nextBtn.textContent = 'Back to Map →';
  nextBtn.onclick     = function() { showMap(); };
  document.getElementById('lessonBody').appendChild(nextBtn);

  // All dots done
  document.querySelectorAll('.progress-dot').forEach(function(d) { d.className = 'progress-dot done'; });
}

// ══════════════════════════════════════════
//  VISUAL ENGINE
// ══════════════════════════════════════════

function loadVisual(visualId) {
  var container = document.getElementById('visualContainer');
  container.innerHTML = '';

  var visuals = {
    'cell-overview':      renderCellOverview,
    'cell-types':         renderCellTypes,
    'cell-interactive':   renderCellInteractive,
    'membrane-animation': renderMembraneAnimation,
    'mitosis-animation':  renderMitosisAnimation,
    'chloroplast-animation': renderChloroplastAnimation
  };

  var fn = visuals[visualId];
  if (fn) fn(container);
  else container.innerHTML = '<div style="color:var(--text3);font-style:italic;text-align:center;">Visual loading...</div>';
}

function highlightVisualPart(partId) {
  // Remove existing highlights
  document.querySelectorAll('.highlighted').forEach(function(el) {
    el.classList.remove('highlighted');
    el.style.filter = '';
  });

  if (!partId) return;

  var el = document.getElementById('vis_' + partId);
  if (el) {
    el.classList.add('highlighted');
    el.style.filter = 'drop-shadow(0 0 16px rgba(93,235,138,0.8))';
    el.style.transition = 'filter 0.4s';
  }
}

// ── Cell Overview SVG ──
function renderCellOverview(container) {
  container.innerHTML = `
    <svg class="cell-svg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cellGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(93,235,138,0.06)"/>
          <stop offset="100%" stop-color="rgba(93,235,138,0.02)"/>
        </radialGradient>
        <radialGradient id="nucleusGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(93,235,138,0.15)"/>
          <stop offset="100%" stop-color="rgba(93,235,138,0.05)"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Cell membrane -->
      <ellipse id="vis_membrane" cx="200" cy="200" rx="170" ry="155"
        fill="url(#cellGrad)"
        stroke="rgba(93,235,138,0.5)" stroke-width="2.5"
        style="animation: cellBreath 4s ease-in-out infinite"/>

      <!-- Cytoplasm dots -->
      <circle cx="130" cy="150" r="3" fill="rgba(93,235,138,0.2)"/>
      <circle cx="280" cy="170" r="2" fill="rgba(93,235,138,0.15)"/>
      <circle cx="160" cy="260" r="2.5" fill="rgba(93,235,138,0.18)"/>
      <circle cx="240" cy="130" r="2" fill="rgba(93,235,138,0.12)"/>
      <circle cx="300" cy="250" r="3" fill="rgba(93,235,138,0.15)"/>
      <circle cx="110" cy="230" r="2" fill="rgba(93,235,138,0.1)"/>

      <!-- Nucleus -->
      <ellipse id="vis_nucleus" cx="200" cy="195" rx="52" ry="46"
        fill="url(#nucleusGrad)"
        stroke="rgba(93,235,138,0.7)" stroke-width="2"
        filter="url(#glow)"/>
      <!-- Nucleolus -->
      <ellipse cx="200" cy="192" rx="18" ry="16"
        fill="rgba(93,235,138,0.2)"
        stroke="rgba(93,235,138,0.5)" stroke-width="1.5"/>

      <!-- Mitochondria -->
      <g id="vis_mitochondria">
        <ellipse cx="300" cy="175" rx="28" ry="16" fill="rgba(93,235,138,0.08)"
          stroke="rgba(93,235,138,0.4)" stroke-width="1.5" transform="rotate(-20,300,175)"/>
        <path d="M278 172 Q290 162 302 172 Q290 182 278 172" stroke="rgba(93,235,138,0.3)" stroke-width="1" fill="none"/>
        <ellipse cx="260" cy="255" rx="24" ry="14" fill="rgba(93,235,138,0.08)"
          stroke="rgba(93,235,138,0.4)" stroke-width="1.5" transform="rotate(15,260,255)"/>
      </g>

      <!-- ER -->
      <g id="vis_er">
        <path d="M150 150 Q135 165 145 180 Q155 195 140 210" stroke="rgba(93,235,138,0.35)" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M158 148 Q143 163 153 178 Q163 193 148 208" stroke="rgba(93,235,138,0.25)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Ribosomes -->
      <g id="vis_ribosome">
        <circle cx="148" cy="162" r="4" fill="rgba(93,235,138,0.4)"/>
        <circle cx="162" cy="174" r="3.5" fill="rgba(93,235,138,0.35)"/>
        <circle cx="145" cy="192" r="4" fill="rgba(93,235,138,0.4)"/>
        <circle cx="320" cy="200" r="3.5" fill="rgba(93,235,138,0.35)"/>
        <circle cx="310" cy="215" r="4" fill="rgba(93,235,138,0.4)"/>
      </g>

      <!-- Vacuole -->
      <ellipse id="vis_vacuole" cx="215" cy="278" rx="30" ry="24"
        fill="rgba(93,235,138,0.05)"
        stroke="rgba(93,235,138,0.3)" stroke-width="1.5"/>

      <!-- Labels -->
      <text x="200" y="193" text-anchor="middle" fill="rgba(93,235,138,0.9)" font-size="9" font-family="Outfit">Nucleus</text>
      <text x="310" y="172" text-anchor="middle" fill="rgba(93,235,138,0.7)" font-size="8" font-family="Outfit">Mitochondria</text>
      <text x="125" y="175" text-anchor="end" fill="rgba(93,235,138,0.7)" font-size="8" font-family="Outfit">ER</text>
      <text x="215" y="282" text-anchor="middle" fill="rgba(93,235,138,0.7)" font-size="8" font-family="Outfit">Vacuole</text>
      <text x="200" y="370" text-anchor="middle" fill="rgba(93,235,138,0.5)" font-size="8.5" font-family="Outfit">Cell Membrane</text>

      <style>
        @keyframes cellBreath {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.015); transform-origin: center; }
        }
      </style>
    </svg>`;
}

// ── Cell Types SVG ──
function renderCellTypes(container) {
  container.innerHTML = `
    <svg class="cell-svg" viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Prokaryotic -->
      <text x="95" y="28" text-anchor="middle" fill="rgba(93,235,138,0.8)" font-size="11" font-family="Playfair Display" font-style="italic">Prokaryotic</text>
      <ellipse id="vis_prokaryote" cx="95" cy="130" rx="75" ry="50"
        fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.5)" stroke-width="2"/>
      <!-- Nucleoid region -->
      <path d="M75 120 Q95 108 115 120 Q95 132 75 120" fill="rgba(93,235,138,0.2)" stroke="rgba(93,235,138,0.5)" stroke-width="1"/>
      <text x="95" y="124" text-anchor="middle" fill="rgba(93,235,138,0.7)" font-size="7" font-family="Outfit">DNA (no membrane)</text>
      <!-- Flagella -->
      <path d="M170 130 Q195 115 185 100 Q175 85 200 75" stroke="rgba(93,235,138,0.4)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="95" y="195" text-anchor="middle" fill="rgba(93,235,138,0.5)" font-size="9" font-family="Outfit">No nucleus · Simple · Ancient</text>

      <!-- Eukaryotic -->
      <text x="300" y="28" text-anchor="middle" fill="rgba(93,235,138,0.8)" font-size="11" font-family="Playfair Display" font-style="italic">Eukaryotic</text>
      <ellipse id="vis_eukaryote" cx="300" cy="130" rx="85" ry="70"
        fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.5)" stroke-width="2"/>
      <!-- Nucleus with membrane -->
      <ellipse cx="300" cy="120" rx="32" ry="28" fill="rgba(93,235,138,0.1)" stroke="rgba(93,235,138,0.6)" stroke-width="1.5"/>
      <ellipse cx="300" cy="118" rx="12" ry="10" fill="rgba(93,235,138,0.2)"/>
      <text x="300" y="123" text-anchor="middle" fill="rgba(93,235,138,0.8)" font-size="7" font-family="Outfit">Nucleus</text>
      <!-- Mitochondria -->
      <ellipse cx="345" cy="150" rx="18" ry="10" fill="rgba(93,235,138,0.08)" stroke="rgba(93,235,138,0.35)" stroke-width="1" transform="rotate(-15,345,150)"/>
      <text x="300" y="215" text-anchor="middle" fill="rgba(93,235,138,0.5)" font-size="9" font-family="Outfit">Has nucleus · Complex · Evolved</text>

      <!-- Arrow divider -->
      <line x1="200" y1="60" x2="200" y2="190" stroke="rgba(93,235,138,0.15)" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- Evolution arrow -->
      <path d="M150 280 Q200 260 250 280" stroke="rgba(93,235,138,0.4)" stroke-width="1.5" fill="none" marker-end="url(#arr)"/>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(93,235,138,0.6)"/>
        </marker>
      </defs>
      <text x="200" y="310" text-anchor="middle" fill="rgba(93,235,138,0.5)" font-size="9" font-family="Outfit" font-style="italic">~2 billion years of evolution</text>
    </svg>`;
}

// ── Cell Interactive SVG ──
function renderCellInteractive(container) {
  renderCellOverview(container);
  // Same as overview but the labeling interaction will highlight parts
}

// ── Membrane Animation ──
function renderMembraneAnimation(container) {
  container.innerHTML = `
    <svg class="cell-svg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="24" text-anchor="middle" fill="rgba(93,235,138,0.7)" font-size="11" font-family="Playfair Display" font-style="italic">Phospholipid Bilayer</text>

      <!-- Outer leaflet -->
      <g id="vis_outer_leaflet">
        ${generatePhospholipids(60, 80, 14, false)}
      </g>
      <!-- Inner leaflet -->
      <g id="vis_inner_leaflet">
        ${generatePhospholipids(60, 160, 14, true)}
      </g>

      <!-- Water molecules outside -->
      <text x="200" y="72" text-anchor="middle" fill="rgba(93,235,138,0.3)" font-size="8" font-family="Outfit">Outside cell (water)</text>
      <!-- Water molecules inside -->
      <text x="200" y="220" text-anchor="middle" fill="rgba(93,235,138,0.3)" font-size="8" font-family="Outfit">Inside cell (water)</text>

      <!-- Hydrophobic core label -->
      <text x="200" y="128" text-anchor="middle" fill="rgba(93,235,138,0.5)" font-size="8.5" font-family="Outfit">Hydrophobic core (repels water)</text>

      <!-- Protein channel -->
      <g id="vis_protein_channel">
        <rect x="180" y="82" width="40" height="76" rx="6"
          fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.5)" stroke-width="1.5"/>
        <text x="200" y="125" text-anchor="middle" fill="rgba(251,191,36,0.8)" font-size="7.5" font-family="Outfit">Protein</text>
        <text x="200" y="136" text-anchor="middle" fill="rgba(251,191,36,0.8)" font-size="7.5" font-family="Outfit">Channel</text>
      </g>

      <!-- Molecule passing through -->
      <circle id="vis_molecule" cx="200" cy="68" r="6"
        fill="rgba(93,235,138,0.6)" stroke="rgba(93,235,138,0.9)" stroke-width="1"
        style="animation: passThrough 4s ease-in-out infinite"/>
      <text x="214" y="72" fill="rgba(93,235,138,0.7)" font-size="7" font-family="Outfit">molecule</text>

      <style>
        @keyframes passThrough {
          0%   { transform: translateY(0); opacity: 1; }
          40%  { transform: translateY(90px); opacity: 1; }
          50%  { transform: translateY(90px); opacity: 0; }
          51%  { transform: translateY(0); opacity: 0; }
          60%  { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
      </style>
    </svg>`;
}

function generatePhospholipids(startX, y, count, flipped) {
  var svg = '';
  var spacing = 22;
  for (var i = 0; i < count; i++) {
    var x = startX + i * spacing;
    var headY  = flipped ? y + 20 : y;
    var tail1Y = flipped ? y : y + 20;
    svg += '<circle cx="' + x + '" cy="' + headY + '" r="7" fill="rgba(93,235,138,0.25)" stroke="rgba(93,235,138,0.4)" stroke-width="1"/>';
    svg += '<line x1="' + (x-3) + '" y1="' + headY + '" x2="' + (x-3) + '" y2="' + tail1Y + '" stroke="rgba(93,235,138,0.3)" stroke-width="1.5"/>';
    svg += '<line x1="' + (x+3) + '" y1="' + headY + '" x2="' + (x+3) + '" y2="' + tail1Y + '" stroke="rgba(93,235,138,0.3)" stroke-width="1.5"/>';
  }
  return svg;
}

// ── Mitosis Animation ──
function renderMitosisAnimation(container) {
  container.innerHTML = `
    <svg class="cell-svg" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="20" text-anchor="middle" fill="rgba(93,235,138,0.7)" font-size="11" font-family="Playfair Display" font-style="italic">Mitosis — One Cell Becomes Two</text>

      <!-- Phase labels -->
      <g id="vis_prophase">
        <text x="55" y="55" text-anchor="middle" fill="rgba(93,235,138,0.6)" font-size="8.5" font-family="Outfit">Prophase</text>
        <ellipse cx="55" cy="105" rx="40" ry="35" fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.4)" stroke-width="1.5"/>
        <path d="M40 95 Q55 80 70 95 Q55 110 40 95" fill="rgba(93,235,138,0.3)" stroke="rgba(93,235,138,0.6)" stroke-width="1"/>
        <path d="M42 105 Q55 90 68 105 Q55 120 42 105" fill="rgba(93,235,138,0.25)" stroke="rgba(93,235,138,0.5)" stroke-width="1"/>
      </g>

      <g id="vis_metaphase">
        <text x="148" y="55" text-anchor="middle" fill="rgba(93,235,138,0.6)" font-size="8.5" font-family="Outfit">Metaphase</text>
        <ellipse cx="148" cy="105" rx="40" ry="35" fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.4)" stroke-width="1.5"/>
        <line x1="148" y1="72" x2="148" y2="138" stroke="rgba(93,235,138,0.2)" stroke-width="1" stroke-dasharray="3,2"/>
        <rect x="138" y="97" width="20" height="8" rx="2" fill="rgba(93,235,138,0.3)" stroke="rgba(93,235,138,0.6)" stroke-width="1"/>
        <rect x="138" y="107" width="20" height="8" rx="2" fill="rgba(93,235,138,0.25)" stroke="rgba(93,235,138,0.5)" stroke-width="1"/>
      </g>

      <g id="vis_anaphase">
        <text x="248" y="55" text-anchor="middle" fill="rgba(93,235,138,0.6)" font-size="8.5" font-family="Outfit">Anaphase</text>
        <ellipse cx="248" cy="105" rx="40" ry="35" fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.4)" stroke-width="1.5"/>
        <rect x="238" y="78" width="18" height="7" rx="2" fill="rgba(93,235,138,0.3)" stroke="rgba(93,235,138,0.5)" stroke-width="1"/>
        <rect x="238" y="122" width="18" height="7" rx="2" fill="rgba(93,235,138,0.3)" stroke="rgba(93,235,138,0.5)" stroke-width="1"/>
        <line x1="247" y1="86" x2="247" y2="122" stroke="rgba(93,235,138,0.2)" stroke-width="1"/>
      </g>

      <g id="vis_telophase">
        <text x="348" y="55" text-anchor="middle" fill="rgba(93,235,138,0.6)" font-size="8.5" font-family="Outfit">Telophase</text>
        <ellipse cx="330" cy="105" rx="28" ry="28" fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.4)" stroke-width="1.5"/>
        <ellipse cx="366" cy="105" rx="28" ry="28" fill="rgba(93,235,138,0.04)" stroke="rgba(93,235,138,0.4)" stroke-width="1.5"/>
        <ellipse cx="330" cy="105" rx="12" ry="10" fill="rgba(93,235,138,0.12)" stroke="rgba(93,235,138,0.4)" stroke-width="1"/>
        <ellipse cx="366" cy="105" rx="12" ry="10" fill="rgba(93,235,138,0.12)" stroke="rgba(93,235,138,0.4)" stroke-width="1"/>
      </g>

      <!-- Arrows between phases -->
      <path d="M98 105 L105 105" stroke="rgba(93,235,138,0.4)" stroke-width="1.5" marker-end="url(#a2)"/>
      <path d="M192 105 L199 105" stroke="rgba(93,235,138,0.4)" stroke-width="1.5" marker-end="url(#a2)"/>
      <path d="M292 105 L299 105" stroke="rgba(93,235,138,0.4)" stroke-width="1.5" marker-end="url(#a2)"/>
      <defs>
        <marker id="a2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(93,235,138,0.6)"/>
        </marker>
      </defs>

      <text x="200" y="280" text-anchor="middle" fill="rgba(93,235,138,0.4)" font-size="9" font-family="Outfit" font-style="italic">Result: 2 identical daughter cells</text>
    </svg>`;
}

// ── Chloroplast ──
function renderChloroplastAnimation(container) {
  container.innerHTML = `
    <svg class="cell-svg" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(251,191,36,0.8)"/>
          <stop offset="100%" stop-color="rgba(251,191,36,0.1)"/>
        </radialGradient>
      </defs>

      <!-- Sun -->
      <circle id="vis_sunlight" cx="60" cy="60" r="28" fill="url(#sunGrad)" style="animation: sunPulse 3s ease-in-out infinite"/>
      <text x="60" y="100" text-anchor="middle" fill="rgba(251,191,36,0.8)" font-size="8" font-family="Outfit">Sunlight</text>

      <!-- Light rays -->
      <line x1="88" y1="60" x2="130" y2="100" stroke="rgba(251,191,36,0.4)" stroke-width="1.5" stroke-dasharray="4,3"/>
      <line x1="80" y1="82" x2="130" y2="115" stroke="rgba(251,191,36,0.3)" stroke-width="1" stroke-dasharray="4,3"/>

      <!-- Chloroplast -->
      <ellipse id="vis_chloroplast" cx="220" cy="160" rx="100" ry="65"
        fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.5)" stroke-width="2"/>
      <ellipse cx="220" cy="160" rx="88" ry="55" fill="none" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>

      <!-- Thylakoids -->
      <g id="vis_thylakoid">
        <ellipse cx="200" cy="148" rx="35" ry="10" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" stroke-width="1.2"/>
        <ellipse cx="220" cy="162" rx="35" ry="10" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" stroke-width="1.2"/>
        <ellipse cx="205" cy="176" rx="35" ry="10" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" stroke-width="1.2"/>
        <text x="220" y="165" text-anchor="middle" fill="rgba(34,197,94,0.8)" font-size="7" font-family="Outfit">Thylakoids</text>
      </g>

      <!-- Equation -->
      <text x="200" y="265" text-anchor="middle" fill="rgba(93,235,138,0.6)" font-size="10" font-family="Outfit">6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</text>
      <text x="200" y="285" text-anchor="middle" fill="rgba(93,235,138,0.4)" font-size="8.5" font-family="Outfit" font-style="italic">Carbon dioxide + Water + Light → Glucose + Oxygen</text>

      <!-- CO2 input -->
      <text x="340" y="130" fill="rgba(93,235,138,0.5)" font-size="9" font-family="Outfit">CO₂ in</text>
      <path d="M338 135 L300 150" stroke="rgba(93,235,138,0.3)" stroke-width="1" marker-end="url(#a3)"/>

      <!-- O2 output -->
      <text x="340" y="195" fill="rgba(93,235,138,0.5)" font-size="9" font-family="Outfit">O₂ out</text>
      <path d="M300 175 L335 185" stroke="rgba(93,235,138,0.3)" stroke-width="1" marker-end="url(#a3)"/>

      <defs>
        <marker id="a3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(93,235,138,0.5)"/>
        </marker>
      </defs>

      <style>
        @keyframes sunPulse {
          0%,100% { opacity: 1; r: 28; }
          50% { opacity: 0.7; r: 32; }
        }
      </style>
    </svg>`;
}

// ══════════════════════════════════════════
//  LESSON STEPS DATA
// ══════════════════════════════════════════

var LESSON_STEPS = {

  'cell-theory': [
    {
      type: 'narrate',
      prompt: 'Start the lesson on Cell Theory. Hook the student with a question about what they are made of. Then introduce the Cell Theory in your own spoken style — 3 key ideas. Keep it under 80 words. Use **bold** for key terms.',
      context: 'Cell Theory: 1) All living things are made of cells, 2) The cell is the basic unit of life, 3) All cells come from pre-existing cells.',
      highlight: 'membrane',
      caption: 'The cell — the smallest unit of life'
    },
    {
      type: 'interaction',
      interactionType: 'mcq',
      prompt: 'Which of these is NOT part of Cell Theory?',
      highlight: 'nucleus',
      caption: 'Think about what Cell Theory actually states',
      options: [
        { text: 'All living things are made of cells', correct: false, feedback: 'This IS part of Cell Theory — it was one of the first observations Schwann and Schleiden made.' },
        { text: 'Cells can be created from non-living matter', correct: true, feedback: 'Exactly right. **Cells only come from pre-existing cells** — this was Virchow\'s crucial addition to the theory. Spontaneous generation of cells does not happen.' },
        { text: 'The cell is the basic unit of life', correct: false, feedback: 'This IS part of Cell Theory — everything a living organism does happens at the cellular level.' },
        { text: 'All cells come from pre-existing cells', correct: false, feedback: 'This IS part of Cell Theory — Rudolf Virchow established this in 1855.' }
      ],
      correctFeedback: 'Right. **Spontaneous generation** — the idea that life appears from nothing — was disproven. Every cell that exists today traces an unbroken line back to the very first cells on Earth, about 3.5 billion years ago.',
      wrongFeedback: 'Not quite. Read each option carefully against what Cell Theory actually states. One of these is something Cell Theory *disproves*.'
    },
    {
      type: 'narrate',
      prompt: 'Now connect Cell Theory to the student personally — their own body, right now. End with one open thread about the origin of the first cell. Under 60 words.',
      context: 'The student just learned Cell Theory and answered a question correctly.',
      highlight: null,
      caption: 'Every cell in your body has a history going back 3.5 billion years'
    },
    { type: 'complete' }
  ],

  'types-of-cells': [
    {
      type: 'narrate',
      prompt: 'Introduce the two worlds of cells — prokaryotic and eukaryotic. Hook with the idea that bacteria and the cells in the student\'s body are both cells but almost nothing alike. Under 80 words.',
      context: 'Prokaryotes: no nucleus, no membrane-bound organelles, ancient, bacteria. Eukaryotes: true nucleus, membrane-bound organelles, complex.',
      highlight: 'prokaryote',
      caption: 'Prokaryotes — the original cells, 3.5 billion years old'
    },
    {
      type: 'interaction',
      interactionType: 'label',
      prompt: 'Label these cell features correctly:',
      highlight: 'eukaryote',
      caption: 'Drag each label to the right feature',
      targets: [
        { id: 'feat1', label: 'Has a nucleus?',        answer: 'Eukaryote only' },
        { id: 'feat2', label: 'Found in bacteria?',    answer: 'Prokaryote only' },
        { id: 'feat3', label: 'Has mitochondria?',     answer: 'Eukaryote only' },
        { id: 'feat4', label: 'Simpler structure?',    answer: 'Prokaryote only' }
      ],
      options: ['Eukaryote only', 'Prokaryote only', 'Both', 'Neither'],
      correctFeedback: 'Perfect. The **nucleus** is the defining difference — eukaryotes have their DNA enclosed in a membrane, prokaryotes don\'t. This one difference leads to everything else.',
      wrongFeedback: 'Almost. The key is the **nucleus** — only eukaryotes have one. Everything else follows from that.'
    },
    {
      type: 'narrate',
      prompt: 'Close with the evolutionary connection — eukaryotes likely evolved from prokaryotes through endosymbiosis. Make it feel profound without overwhelming. Under 60 words.',
      context: 'Student just completed labeling prokaryote vs eukaryote features.',
      highlight: null,
      caption: 'The mitochondria in your cells were once free-living bacteria'
    },
    { type: 'complete' }
  ],

  'organelles': [
    {
      type: 'narrate',
      prompt: 'Introduce organelles with a vivid hook — the cell as a city analogy, but immediately name where the analogy breaks down. Then briefly introduce the nucleus as the control center. Under 80 words.',
      context: 'Organelles: nucleus (DNA, control), mitochondria (energy/ATP), ribosome (protein synthesis), ER (transport), Golgi (packaging), vacuole (storage).',
      highlight: 'nucleus',
      caption: 'The nucleus — containing all the instructions for the entire cell'
    },
    {
      type: 'interaction',
      interactionType: 'label',
      prompt: 'Match each organelle to its function:',
      highlight: 'mitochondria',
      caption: 'Each organelle has one primary job',
      targets: [
        { id: 'org1', label: 'Makes energy (ATP)',       answer: 'Mitochondria' },
        { id: 'org2', label: 'Makes proteins',           answer: 'Ribosome' },
        { id: 'org3', label: 'Contains DNA',             answer: 'Nucleus' },
        { id: 'org4', label: 'Stores water & nutrients', answer: 'Vacuole' }
      ],
      options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Vacuole', 'Golgi body', 'ER'],
      correctFeedback: '**Mitochondria** → energy. **Ribosome** → proteins. **Nucleus** → DNA. **Vacuole** → storage. Each organelle evolved for one specific job — and the cell cannot survive without any of them.',
      wrongFeedback: 'Think about what each organelle\'s name suggests. Mitochondria are the "powerhouse" — they generate ATP. The nucleus holds the DNA blueprint.'
    },
    {
      type: 'narrate',
      prompt: 'Connect organelles to something real — explain how right now, the student\'s mitochondria are converting their last meal into ATP. End with an open thread about what happens when organelles malfunction. Under 60 words.',
      context: 'Student learned nucleus, mitochondria, ribosome, ER, Golgi, vacuole.',
      highlight: 'mitochondria',
      caption: 'Right now — millions of ATP molecules being made in your cells'
    },
    { type: 'complete' }
  ],

  'default': [
    {
      type: 'narrate',
      prompt: 'Introduce this biology topic with curiosity and energy. Start with a hook — something the student has experienced. Under 80 words.',
      context: '',
      highlight: null,
      caption: ''
    },
    { type: 'complete' }
  ]
};

// ══════════════════════════════════════════
//  IN-LESSON CHAT
// ══════════════════════════════════════════

function toggleChat() {
  chatOpen = !chatOpen;
  var area = document.getElementById('chatArea');
  var txt  = document.getElementById('chatToggleText');
  area.style.display = chatOpen ? 'flex' : 'none';
  txt.textContent    = chatOpen ? 'Close ↑' : 'Ask Synapse a question ↓';
  if (chatOpen) document.getElementById('chatInput').focus();
}

async function sendChat() {
  var input = document.getElementById('chatInput');
  var text  = input.value.trim();
  if (!text || isWaiting) return;

  input.value = '';

  appendChatMsg('user', text);
  chatHistory.push({ role: 'user', content: text });

  isWaiting = true;
  var aiMsg = appendChatMsg('ai', '...');

  try {
    var systemPrompt = buildLessonSystemPrompt() +
      '\n\nThe student is currently in the lesson: ' + (currentLesson ? currentLesson.title : 'unknown') +
      '. Answer their question about this topic specifically. Be concise — under 100 words.';

    var res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({
        model: MODEL, max_tokens: 200, stream: false,
        messages: [{ role: 'system', content: systemPrompt }].concat(chatHistory)
      })
    });

    var data  = await res.json();
    var reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || 'Sorry, something went wrong.';

    aiMsg.innerHTML = renderInlineMarkdown(reply);
    chatHistory.push({ role: 'assistant', content: reply });

  } catch(e) {
    aiMsg.textContent = 'Something went wrong. Try again.';
  }

  isWaiting = false;
}

function appendChatMsg(role, text) {
  var container = document.getElementById('chatMessages');
  var el = document.createElement('div');
  el.className = 'chat-msg ' + role;
  el.innerHTML = role === 'ai' ? renderInlineMarkdown(text) : text;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

// ══════════════════════════════════════════
//  SYSTEM PROMPT
// ══════════════════════════════════════════

function buildLessonSystemPrompt() {
  var p = currentProfile || {};
  var m = currentMemory  || {};
  var ctx = 'Student: ' + (p.name || 'unknown') + ', Class ' + (p.class || 'unknown') + ', ' + (p.level || 'Level 2') + '.';
  if (m.summary) ctx += ' Past learning: ' + m.summary.slice(0, 300);
  if (m.struggles && m.struggles.length) ctx += ' Struggled with: ' + m.struggles.slice(0,3).join(', ');

  return 'You are Synapse — a biology tutor narrating a visual lesson. ' + ctx +
    ' Speak directly to the student. Short, precise, spoken — never like a textbook. ' +
    'Use **bold** for scientific terms. Maximum 80 words per narration. ' +
    'Make biology feel real and happening in their body right now. ' +
    'Never say "Great question!" Show genuine intellectual engagement. ' +
    'Always end with something that makes the student want to know more.';
}

// ══════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════

function renderInlineMarkdown(text) {
  if (!text) return '';
  var t = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/\n\n/g, '<br><br>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

async function narrateText(text, el) {
  el.innerHTML = '';
  var words = text.split(' ');
  for (var i = 0; i < words.length; i++) {
    await new Promise(function(r) { setTimeout(r, 40); });
    el.innerHTML = renderInlineMarkdown(words.slice(0, i + 1).join(' '));
  }
}

function spawnParticles(containerId, count) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  for (var i = 0; i < count; i++) {
    var p = document.createElement('div');
    p.style.cssText =
      'position:absolute;' +
      'width:' + (Math.random() * 3 + 1) + 'px;' +
      'height:' + (Math.random() * 3 + 1) + 'px;' +
      'border-radius:50%;' +
      'background:rgba(93,235,138,' + (Math.random() * 0.4 + 0.1) + ');' +
      'left:' + Math.random() * 100 + '%;' +
      'top:' + Math.random() * 100 + '%;' +
      'animation:particleFloat ' + (Math.random() * 8 + 6) + 's ease-in-out infinite ' + (Math.random() * 5) + 's;' +
      'pointer-events:none;';
    container.appendChild(p);
  }

  if (!document.getElementById('particleStyle')) {
    var style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent =
      '@keyframes particleFloat {' +
      '0%,100%{transform:translate(0,0);opacity:0.3}' +
      '25%{transform:translate(' + (Math.random()*20-10) + 'px,-' + (Math.random()*30+10) + 'px);opacity:0.8}' +
      '75%{transform:translate(' + (Math.random()*20-10) + 'px,' + (Math.random()*20) + 'px);opacity:0.2}' +
      '}';
    document.head.appendChild(style);
  }
}

// ══════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════

window.addEventListener('load', function() {
  spawnParticles('authParticles', 30);

  sb.auth.onAuthStateChange(async function(event, session) {
    if (session && session.user) {
      currentUser    = session.user;
      currentProfile = await loadProfile(currentUser.id);
      currentMemory  = await loadMemory(currentUser.id);
      progress       = await loadProgress(currentUser.id);

      if (!currentProfile) {
        await signOut();
        return;
      }

      showMap();

    } else {
      showScreen('authScreen');
      document.getElementById('loginBtn').textContent = 'Sign In';
      document.getElementById('loginBtn').disabled    = false;
    }
  });
});
