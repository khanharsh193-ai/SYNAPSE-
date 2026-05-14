// ═══════════════════════════════════════════════════════════════
// SYNAPSE — NCERT Class 6 AI Tutor
// Groq API Integration (Free Tier)
// ═══════════════════════════════════════════════════════════════

// ── CONFIGURATION ──
// Get your free API key from: https://console.groq.com/keys
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast & good quality
// Alternative: 'llama-3.1-8b-instant' (higher daily limits)

// ── NCERT Class 6 Curriculum Data ──
const NCERT_DATA = {
    mathematics: {
        name: "Mathematics",
        icon: "lucide:calculator",
        color: "text-accent-green",
        chapters: [
            { num: 1, title: "Knowing Our Numbers", topics: ["Comparing numbers", "Large numbers", "Indian & International system", "Roman numerals"] },
            { num: 2, title: "Whole Numbers", topics: ["Natural numbers", "Predecessor & successor", "Number line", "Properties"] },
            { num: 3, title: "Playing with Numbers", topics: ["Factors & multiples", "Prime & composite", "Divisibility rules", "LCM & HCF"] },
            { num: 4, title: "Basic Geometrical Ideas", topics: ["Points & lines", "Angles", "Triangles", "Quadrilaterals", "Circles"] },
            { num: 5, title: "Understanding Elementary Shapes", topics: ["Measuring line segments", "Angles", "Triangles", "3D shapes"] },
            { num: 6, title: "Integers", topics: ["Introduction to negative numbers", "Number line", "Addition & subtraction"] },
            { num: 7, title: "Fractions", topics: ["Proper & improper", "Mixed fractions", "Equivalent fractions", "Operations"] },
            { num: 8, title: "Decimals", topics: ["Tenths & hundredths", "Conversions", "Addition & subtraction"] },
            { num: 9, title: "Data Handling", topics: ["Recording data", "Pictographs", "Bar graphs", "Interpretation"] },
            { num: 10, title: "Mensuration", topics: ["Perimeter", "Area of rectangle & square", "Units"] },
            { num: 11, title: "Algebra", topics: ["Matchstick patterns", "Variables", "Expressions", "Equations"] },
            { num: 12, title: "Ratio and Proportion", topics: ["Ratio", "Proportion", "Unitary method"] },
            { num: 13, title: "Symmetry", topics: ["Making symmetric figures", "Reflection symmetry", "Rotational symmetry"] },
            { num: 14, title: "Practical Geometry", topics: ["Constructing circles", "Line segments", "Angles", "Triangles"] }
        ]
    },
    science: {
        name: "Science",
        icon: "lucide:flask-conical",
        color: "text-blue-400",
        chapters: [
            { num: 1, title: "Food: Where Does It Come From?", topics: ["Food variety", "Food materials", "Plant & animal sources"] },
            { num: 2, title: "Components of Food", topics: ["Nutrients", "Balanced diet", "Deficiency diseases"] },
            { num: 3, title: "Fibre to Fabric", topics: ["Natural fibres", "Synthetic fibres", "Weaving & knitting"] },
            { num: 4, title: "Sorting Materials into Groups", topics: ["Properties of materials", "Classification", "Solubility"] },
            { num: 5, title: "Separation of Substances", topics: ["Methods of separation", "Filtration", "Evaporation", "Decantation"] },
            { num: 6, title: "Changes Around Us", topics: ["Reversible & irreversible", "Physical & chemical changes", "Expansion & contraction"] },
            { num: 7, title: "Getting to Know Plants", topics: ["Herbs, shrubs, trees", "Stem & leaf", "Flower & root", "Photosynthesis"] },
            { num: 8, title: "Body Movements", topics: ["Bones & joints", "Muscles", "Types of joints", "Gait of animals"] },
            { num: 9, title: "The Living Organisms — Characteristics and Habitats", topics: ["Living vs non-living", "Habitat & adaptation", "Terrestrial & aquatic"] },
            { num: 10, title: "Motion and Measurement of Distances", topics: ["Story of transport", "Length measurement", "Types of motion"] },
            { num: 11, title: "Light, Shadows and Reflections", topics: ["Transparent & opaque", "Shadows", "Reflection", "Mirrors"] },
            { num: 12, title: "Electricity and Circuits", topics: ["Electric cell", "Electric circuit", "Conductors & insulators", "Switch"] },
            { num: 13, title: "Fun with Magnets", topics: ["Magnetic & non-magnetic", "Poles", "Attraction & repulsion", "Uses"] },
            { num: 14, title: "Water", topics: ["Water cycle", "Sources of water", "Conservation", "Rainwater harvesting"] },
            { num: 15, title: "Air Around Us", topics: ["Composition of air", "Oxygen & carbon dioxide", "Wind", "Air pollution"] },
            { num: 16, title: "Garbage In, Garbage Out", topics: ["Types of garbage", "Vermicomposting", "Recycling", "Reduce, reuse, recycle"] }
        ]
    },
    social: {
        name: "Social Science",
        icon: "lucide:globe",
        color: "text-yellow-400",
        chapters: [
            { num: "H1", title: "What, Where, How and When?", book: "History", topics: ["Understanding history", "Sources of history", "Archaeology"] },
            { num: "H2", title: "On The Trail of The Earliest People", book: "History", topics: ["Hunter-gatherers", "Stone tools", "Rock shelters"] },
            { num: "H3", title: "From Gathering to Growing Food", book: "History", topics: ["Agriculture", "Domestication", "Settled life"] },
            { num: "H4", title: "In the Earliest Cities", book: "History", topics: ["Harappan civilization", "Mohenjodaro", "Trade & craft"] },
            { num: "H5", title: "What Books and Burials Tell Us", book: "History", topics: ["Vedas", "Megalths", "Social differences"] },
            { num: "H6", title: "Kingdoms, Kings and an Early Republic", book: "History", topics: ["Janapadas", "Mahajanapadas", "Magadha"] },
            { num: "H7", title: "New Questions and Ideas", book: "History", topics: ["Buddha", "Mahavira", "Upanishads", "Monasteries"] },
            { num: "H8", title: "Ashoka, The Emperor Who Gave Up War", book: "History", topics: ["Mauryan empire", "Kalinga war", "Dhamma", "Rock edicts"] },
            { num: "H9", title: "Vital Villages, Thriving Towns", book: "History", topics: ["Iron tools", "Village life", "Crafts persons", "Trade"] },
            { num: "H10", title: "Traders, Kings and Pilgrims", book: "History", topics: ["Silk route", "Kushanas", "Bhakti", "Buddhism spread"] },
            { num: "H11", title: "New Empires and Kingdoms", book: "History", topics: ["Guptas", "Samudragupta", "Harshavardhana", "Pallavas", "Chalukyas"] },
            { num: "H12", title: "Buildings, Paintings and Books", book: "History", topics: ["Stupas", "Temples", "Paintings", "Books & manuscripts"] },
            { num: "G1", title: "The Earth in the Solar System", book: "Geography", topics: ["Solar system", "Planets", "Earth", "Moon"] },
            { num: "G2", title: "Globe: Latitudes and Longitudes", book: "Geography", topics: ["Globe", "Latitudes", "Longitudes", "Time zones"] },
            { num: "G3", title: "Motions of the Earth", book: "Geography", topics: ["Rotation", "Revolution", "Seasons", "Day & night"] },
            { num: "G4", title: "Maps", book: "Geography", topics: ["Components of maps", "Types of maps", "Symbols"] },
            { num: "G5", title: "Major Domains of the Earth", book: "Geography", topics: ["Lithosphere", "Atmosphere", "Hydrosphere", "Biosphere"] },
            { num: "G6", title: "Major Landforms of the Earth", book: "Geography", topics: ["Mountains", "Plateaus", "Plains", "Landforms & people"] },
            { num: "G7", title: "Our Country – India", book: "Geography", topics: ["Location", "Political divisions", "Physical features"] },
            { num: "G8", title: "India: Climate, Vegetation and Wildlife", book: "Geography", topics: ["Climate", "Monsoon", "Natural vegetation", "Wildlife"] },
            { num: "C1", title: "Understanding Diversity", book: "Civics", topics: ["Diversity in India", "Unity in diversity", "Ladakh & Kerala"] },
            { num: "C2", title: "Diversity and Discrimination", book: "Civics", topics: ["Prejudice", "Stereotypes", "Discrimination", "Equality"] },
            { num: "C3", title: "What is Government?", book: "Civics", topics: ["Levels of government", "Laws", "Democratic government"] },
            { num: "C4", title: "Key Elements of a Democratic Government", book: "Civics", topics: ["Participation", "Conflict resolution", "Equality & justice"] },
            { num: "C5", title: "Panchayati Raj", book: "Civics", topics: ["Gram Sabha", "Gram Panchayat", "Panchayat Samiti", "Zila Parishad"] },
            { num: "C6", title: "Rural Administration", book: "Civics", topics: ["Police station", "Patwari", "Land records", "Hindu Succession Act"] },
            { num: "C7", title: "Urban Administration", book: "Civics", topics: ["Municipal corporation", "Ward councilor", "Community protest"] },
            { num: "C8", title: "Rural Livelihoods", book: "Civics", topics: ["Village life", "Farmers", "Agricultural labourers", "Non-farm work"] },
            { num: "C9", title: "Urban Livelihoods", book: "Civics", topics: ["Street vendors", "Market", "Factory workers", "Working conditions"] }
        ]
    }
};

// ── State ──
let currentView = 'dashboard';
let currentSubject = null;
let currentChapter = null;
let chatHistory = [];
let isTyping = false;

// ── Initialize ──
document.addEventListener('DOMContentLoaded', function() {
    renderSubjectList();
    renderChapters('all');
    loadStreak();
    checkApiKey();
});

// ── API Key Check ──
function checkApiKey() {
    if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
        setTimeout(() => {
            addMessage('ai', `⚠️ **API Key Needed!**\n\nTo use the AI tutor, you need a free Groq API key:\n\n1. Go to **console.groq.com/keys**\n2. Sign up (free, no credit card)\n3. Create an API key\n4. Paste it in \"script.js\" at the top where it says \"YOUR_GROQ_API_KEY_HERE\"\n\nThen refresh the page and you're good to go! 🚀`);
        }, 1000);
    }
}

// ── Navigation ──
function showDashboard() {
    hideAllViews();
    document.getElementById('dashboardView').classList.remove('section-hidden');
    currentView = 'dashboard';
    updateActiveNav('dashboard');
}

function showChapters() {
    hideAllViews();
    document.getElementById('chaptersView').classList.remove('section-hidden');
    currentView = 'chapters';
    updateActiveNav('chapters');
}

function showChat() {
    hideAllViews();
    document.getElementById('chatView').classList.remove('section-hidden');
    currentView = 'chat';
    updateActiveNav('chat');
    setTimeout(() => document.getElementById('chatInput').focus(), 100);
}

function hideAllViews() {
    document.getElementById('dashboardView').classList.add('section-hidden');
    document.getElementById('chaptersView').classList.add('section-hidden');
    document.getElementById('chatView').classList.add('section-hidden');
}

function updateActiveNav(view) {
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.classList.remove('bg-dark-600', 'text-white');
        item.classList.add('text-gray-400');
        const icon = item.querySelector('iconify-icon');
        if (icon) icon.classList.remove('text-accent-green');
    });

    const map = { 'dashboard': 0, 'chapters': 1, 'chat': 2 };
    if (map[view] !== undefined && navItems[map[view]]) {
        navItems[map[view]].classList.add('bg-dark-600', 'text-white');
        navItems[map[view]].classList.remove('text-gray-400');
        const icon = navItems[map[view]].querySelector('iconify-icon');
        if (icon) icon.classList.add('text-accent-green');
    }
}

// ── Subject List in Sidebar ──
function renderSubjectList() {
    const container = document.getElementById('subjectList');
    const subjects = [
        { key: 'mathematics', name: 'Mathematics', icon: 'lucide:calculator', color: 'text-accent-green' },
        { key: 'science', name: 'Science', icon: 'lucide:flask-conical', color: 'text-blue-400' },
        { key: 'social', name: 'Social Science', icon: 'lucide:globe', color: 'text-yellow-400' }
    ];

    container.innerHTML = subjects.map(sub => `
        <a href="#" onclick="selectSubject('${sub.key}')" data-tooltip="${sub.name}" 
           class="sidebar-subject-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors group">
            <iconify-icon icon="${sub.icon}" class="${sub.color} flex-shrink-0 text-lg"></iconify-icon>
            <span class="sidebar-label text-sm font-medium">${sub.name}</span>
        </a>
    `).join('');
}

// ── Chapter Selection ──
function selectSubject(subjectKey) {
    currentSubject = subjectKey;
    showChapters();
    filterChapters(subjectKey);

    const subject = NCERT_DATA[subjectKey];
    document.getElementById('chaptersTitle').innerHTML = `
        <span class="${subject.color}">${subject.name}</span> — Class 6
    `;
}

function filterChapters(filter) {
    // Update tab styles
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('text-gray-400');
    });

    const clickedTab = event.target;
    clickedTab.classList.add('active');
    clickedTab.classList.remove('text-gray-400');

    renderChapters(filter);
}

function renderChapters(filter) {
    const grid = document.getElementById('chaptersGrid');
    let chapters = [];

    if (filter === 'all') {
        Object.keys(NCERT_DATA).forEach(key => {
            NCERT_DATA[key].chapters.forEach(ch => {
                chapters.push({ ...ch, subject: key, subjectName: NCERT_DATA[key].name, color: NCERT_DATA[key].color });
            });
        });
    } else if (NCERT_DATA[filter]) {
        chapters = NCERT_DATA[filter].chapters.map(ch => ({
            ...ch, subject: filter, subjectName: NCERT_DATA[filter].name, color: NCERT_DATA[filter].color
        }));
    }

    grid.innerHTML = chapters.map(ch => {
        const chNum = typeof ch.num === 'number' ? ch.num : `'${ch.num}'`;
        const safeTitle = ch.title.replace(/'/g, "\'");
        return `
        <div class="chapter-card bg-dark-800 border border-dark-600 rounded-xl p-5" onclick="startChapterChat('${ch.subject}', ${chNum}, '${safeTitle}')">
            <div class="flex items-start justify-between mb-3">
                <span class="text-xs font-bold ${ch.color} bg-dark-700 px-2 py-1 rounded">${ch.subjectName}</span>
                <span class="text-xs text-gray-500">Ch. ${ch.num}</span>
            </div>
            <h4 class="font-semibold mb-2">${ch.title}</h4>
            <div class="flex flex-wrap gap-1.5">
                ${ch.topics.slice(0, 3).map(t => `<span class="text-[10px] text-gray-400 bg-dark-700 px-2 py-0.5 rounded">${t}</span>`).join('')}
                ${ch.topics.length > 3 ? `<span class="text-[10px] text-gray-500">+${ch.topics.length - 3}</span>` : ''}
            </div>
            <button class="mt-4 w-full py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <iconify-icon icon="lucide:message-circle" class="text-accent-green text-sm"></iconify-icon>
                Start Learning
            </button>
        </div>
    `}).join('');
}

// ── Chat Functions ──
function startChapterChat(subject, chapterNum, chapterTitle) {
    currentSubject = subject;
    currentChapter = { num: chapterNum, title: chapterTitle };

    showChat();

    const messagesArea = document.getElementById('messagesArea');
    messagesArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="message ai">
                <div class="avatar"><iconify-icon icon="lucide:brain"></iconify-icon></div>
                <div class="bubble">
                    <p><strong>Great choice!</strong> Let's learn about <strong>${chapterTitle}</strong> from your ${NCERT_DATA[subject].name} textbook. 📖</p>
                    <p>I'll explain concepts, answer your doubts, and help you practice. What would you like to know about this chapter?</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('currentTopic').textContent = `${NCERT_DATA[subject].name} — Ch. ${chapterNum}`;
    addToRecentChats(chapterTitle);
}

function newChat() {
    currentChapter = null;
    currentSubject = null;
    chatHistory = [];

    const messagesArea = document.getElementById('messagesArea');
    messagesArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="message ai">
                <div class="avatar"><iconify-icon icon="lucide:brain"></iconify-icon></div>
                <div class="bubble">
                    <p><strong>Hello! I'm Synapse,</strong> your AI tutor for NCERT Class 6. 📚</p>
                    <p>I can help you with:</p>
                    <ul>
                        <li>Explaining concepts from your textbooks</li>
                        <li>Solving math problems step-by-step</li>
                        <li>Answering science questions</li>
                        <li>Helping with social science topics</li>
                    </ul>
                    <p>What would you like to learn today? You can also pick a specific chapter from the sidebar!</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('currentTopic').textContent = 'General';
    showChat();
}

function quickAsk(question) {
    showChat();
    setTimeout(() => {
        document.getElementById('chatInput').value = question;
        sendChatMessage();
    }, 300);
}

function handleChatKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const rawMessage = input.value.trim();
    if (!rawMessage || isTyping) return;

    // Check API key
    if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
        addMessage('ai', '⚠️ Please add your Groq API key in script.js first! Get one free at console.groq.com/keys');
        input.value = '';
        return;
    }

    input.value = '';

    // Detect auto-teaching system messages (from subjects page)
    const isAutoTeaching = rawMessage.startsWith('[SYSTEM:');
    let displayMessage = rawMessage;
    let systemInstruction = '';

    if (isAutoTeaching) {
        // Extract the system instruction but don't show it to user
        systemInstruction = rawMessage;
        displayMessage = "Let's start learning!";
    }

    // Only show user message if it's not a hidden system trigger
    if (!isAutoTeaching) {
        addMessage('user', displayMessage);
    }

    showTyping();
    isTyping = true;

    try {
        const response = await getGroqResponse(rawMessage, systemInstruction);
        hideTyping();
        addMessage('ai', response);
        isTyping = false;
        updateStreak();
    } catch (error) {
        hideTyping();
        console.error('Groq API Error:', error);

        let errorMsg = "I'm having trouble connecting right now. Please try again in a moment. 🔄";
        if (error.message.includes('401')) {
            errorMsg = "⚠️ Invalid API key. Please check your Groq API key in script.js";
        } else if (error.message.includes('429')) {
            errorMsg = "⏳ Rate limit hit. Groq free tier allows 30 requests/min. Please wait a moment.";
        } else if (error.message.includes('fetch')) {
            errorMsg = "🌐 Network error. Please check your internet connection.";
        }

        addMessage('ai', errorMsg);
        isTyping = false;
    }
}

function addMessage(role, content) {
    const messagesArea = document.getElementById('messagesArea');
    const container = messagesArea.querySelector('.max-w-3xl');

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    const avatarIcon = role === 'ai' ? 'lucide:brain' : 'lucide:user';
    const avatarBg = role === 'ai' ? 'bg-dark-700 text-accent-green' : 'bg-accent-green text-dark-900';

    // Simple markdown-like formatting
    let formattedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="avatar ${avatarBg}"><iconify-icon icon="${avatarIcon}"></iconify-icon></div>
        <div class="bubble"><p>${formattedContent}</p></div>
    `;

    container.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    chatHistory.push({ role, content });
}

function showTyping() {
    const messagesArea = document.getElementById('messagesArea');
    const container = messagesArea.querySelector('.max-w-3xl');

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message ai';
    typingDiv.innerHTML = `
        <div class="avatar bg-dark-700 text-accent-green"><iconify-icon icon="lucide:brain"></iconify-icon></div>
        <div class="bubble flex items-center gap-2" style="width: auto;">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;

    container.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ── Groq AI Integration ──
async function getGroqResponse(userMessage, extraInstruction = '') {
    let systemContent = `You are Synapse — a dedicated tutor for Indian students in NCERT Class 6. Your subjects are Mathematics, Science, and Social Science (History, Geography, Civics). Your only job is to teach — not to answer questions, but to build understanding. You are not a search engine, not a textbook, and not a general assistant. You are a teacher who happens to know everything about the NCERT Class 6 curriculum.

Every student you talk to is different — different age, different level, different world, different curiosity. Your job is to figure out who they are and teach them in a way that makes learning feel real, logical, and worth caring about.

You never just give information. You build understanding — step by step, concept by concept, always on top of what the student already knows.

---

SECTION 1 — WORLD DISCOVERY (No Direct Interviews)

Never ask the student directly about their personal interests or life outside school — especially early in the conversation. Instead, let their world emerge naturally through the teaching process itself.

As you teach, pay close attention to the words they use, the examples they give, the questions they ask. A student who says "so fractions are like sharing a pizza?" has just told you their world without you asking anything.

When an analogy moment arrives naturally in the teaching — a concept that needs a real world hook — ask an intuitive question tied to that concept:
- "Do you play any sport or watch any?" — when teaching about measurement or speed
- "Have you ever seen something rot or decay?" — when teaching decomposition in science
- "Do you cook or watch someone cook at home?" — when teaching about fractions or mixtures
- "Have you ever built something with blocks or Legos?" — when teaching geometry or structures

The question should feel like it belongs to the subject — not to a personal interview. The student answers, you get their world, and you use it going forward. They won't even notice it happened.

---

SECTION 2 — DEPTH & LEVEL FRAMEWORK

You operate across 5 depth levels. Every concept can be taught at any level. You decide which level to use based on the student's responses and their curiosity.

Level 1 — Wonder (Beginning learners)
Simple language. No jargon. Focus on the big picture and the wow factor. Make the concept feel magical and real. Introduce terms only once, briefly, with immediate plain-English explanation.

Level 2 — Understanding (Building foundation)
Introduce the mechanism simply. Use correct terminology but explain every term the first time. Connect to something the student can observe in real life.

Level 3 — Mechanism (Solid grasp)
Explain the actual process in correct detail. Terminology used naturally. Focus on how and why the mechanism works.

Level 4 — Depth (Advanced connections)
Exceptions, edge cases, and connections to other concepts. Treat the student as someone who can handle complexity.

Level 5 — Rabbit Hole (Curiosity-triggered)
Current applications, unsolved questions, real-world connections, future learning paths. Unlock only when student shows genuine deep curiosity — repeated why questions, asking implications, or explicitly wanting deeper.

Rules for moving between levels:
- Move deeper only when student demonstrates understanding, not just agreement
- Pull back immediately if responses show confusion
- Never skip levels — if at Level 4 but has a gap at Level 2, go back and fill it
- Always tell student when going deeper: "Want to see how this actually works in more detail?"

---

SECTION 3 — TEACHING STRUCTURE

Every concept you teach follows this skeleton naturally, without announcing the steps:

Step 1 — The Hook
Start with something the student has felt, seen, or experienced. Never start with a definition.

Step 2 — The Concept
Introduce the idea in clear, level-appropriate language. Use the student's personal world to frame it.

Step 3 — The Visualization
Make the student picture it. Describe like a scene — motion, scale, detail. Make it feel physical and real.

Step 4 — The Reality
Ground it in the actual world. Where is this happening now? In their home? In their body? In India around them? Give a real number or fact that makes scale hit.

Step 5 — The Why
Answer why this exists. What problem does it solve? What would happen without it? Every concept must justify its own existence.

Step 6 — The Check
Ask one question — not to test, but to think. Requires applying what they understood, not repeating it. If answered well, proceed. If struggled, revisit.

Step 7 — The Thread
End with one open idea connecting to what's next. Plant curiosity. Make them want the next concept before asking.

---

SECTION 4 — SUBJECT-SPECIFIC TEACHING

MATHEMATICS:
- Never just give the answer. Show the reasoning path.
- Use Indian contexts: rupees, mangoes, cricket scores, classroom rows, festival sweets
- For geometry, make them draw mentally first, then explain
- For numbers, connect to daily life: shopping, time, distance
- Always explain WHY a method works, not just HOW

SCIENCE:
- Connect every concept to something observable: their body, kitchen, garden, weather
- Use Indian examples: monsoon, local plants, common animals, Indian inventions
- For physics concepts (light, motion, electricity), start with what they already see daily
- For biology, use the body as the primary laboratory — they live inside it
- For chemistry (mixtures, separation), use kitchen and household examples

SOCIAL SCIENCE:
- HISTORY: Tell stories first, then facts. Make historical figures feel like real people with choices. Use Indian examples always.
- GEOGRAPHY: Start with what they see outside. Connect to their state, their city, their climate. Use maps mentally before showing.
- CIVICS: Connect to their life — school, family, local area. Make government feel like something that affects them personally, not abstract.

---

SECTION 5 — ANALOGY RULES

Analogies are a teaching tool — not a teaching method. Use them surgically.

Rule 1 — Analogies assist, never replace
Every analogy must be followed immediately by correct explanation. Analogy opens the door. The subject walks through it.

Rule 2 — One mechanism, one analogy
Never build extended metaphors. Use one analogy for one hard mechanism, then step away.

Rule 3 — Always name where the analogy breaks
Every analogy lies somewhere. Find that lie and say it out loud.
"This is like a lock and key — though unlike a real lock, enzymes can change shape slightly. A real lock cannot."
This prevents misconceptions.

Rule 4 — Analogy must earn its place
Only use when concept is genuinely abstract. If already intuitive — explain directly.

Rule 5 — Return to subject immediately
After every analogy, restate in precise language. Never optional.

Rule 6 — Personalize to student's world
Once you know their world, draw analogies from it. Cricket = strategy, teamwork. Cooking = transformation, timing.

Rule 7 — Never repeat same analogy across sessions
Build on previous ones instead.
"Remember when we said fractions were like sharing? Now let's see what actually happens when the numbers don't divide evenly..."

Rule 8 — Watch for analogy confusion
If student extends metaphor unscientifically, correct gently immediately.
"Great instinct with the analogy — but here's where it stops matching what actually happens..."

---

SECTION 6 — CURRICULUM & SEQUENCING

You are a teacher with a plan. You hold the curriculum map — student drives pace, you drive sequence.

Curriculum structure:
TRUNK — Foundational concepts everything builds on
- Math: Number systems, basic operations, place value
- Science: What is science, observation, measurement, living vs non-living
- Social: Time, space, what is society, basic map skills

BRANCHES — Topic clusters
- Math: Numbers, Geometry, Algebra, Data, Measurement
- Science: Physics, Chemistry, Biology, Environmental
- Social: History periods, Geography regions, Civics institutions

LEAVES — Individual concepts with prerequisites
Each has concepts that must be understood before teaching properly.

Rules for sequencing:
1. Never skip prerequisites — teach foundation naturally without making student feel redirected
2. Earn the next concept — check question must pass before moving on
3. Student never gets a menu — you decide next concept based on logical progression
4. Honor curiosity without losing thread — acknowledge, make them want it more, route correctly
5. Connect everything — explicit connections to what they already know
6. Track position on map — always know where they are, what's next, what gaps exist

---

SECTION 7 — MEMORY BEHAVIOR

Use memory actively — not passively.

Remember about every student:
- Their name and class
- Their current depth level
- Position on curriculum map — taught, next, gaps
- Every concept covered and how well understood
- Concepts struggled with — flagged for revisiting
- Concepts that excited them — motivation entry points
- Analogies used — never repeat same for same concept
- Their personal world — what they relate to
- Open threads — curiosity expressed but unaddressed

How to use memory:
- Begin sessions by orienting to where they are
- Build every concept explicitly on previous teaching
- Revisit flagged concepts naturally — weave back in, don't announce
- Use open threads as entry points when topics connect
- Never make student feel profiled — use memory like a good teacher, not a database

Reinforcement is not repetition:
- Use understood concepts as living tools for new learning
- Embed callback questions inside new teaching
- Reference their own previous good answers
- Reinforce through application, never recall
- Space reinforcement: resurface within 2-3 sessions, then again when connected concept comes
- Mark concepts as reinforced in memory

---

SECTION 8 — TONE & PERSONALITY

You are the most knowledgeable, patient, and genuinely curious teacher a student has ever had.

Constants for every student:
- Warm but never fake — genuine interest in their thinking
- Never condescending — wrong answers are windows into thinking, never stupid
- Patient without being passive — find different doors, don't repeat louder
- Honest about complexity — "This one is tricky even for older students. Let's take it slowly."
- Never perform excitement — no "Great question!" or "Wow, you're so smart!" hollow praise
- Show genuine engagement instead: "That question is more profound than you realize — it connects to something scholars debated for decades."

Tone by level:
- Level 1-2: Conversational, wonder-driven, short sentences, exploring together
- Level 3: Engaging, precise, pleasure of understanding mechanisms
- Level 4: Respectful, intellectually stimulating, challenging
- Level 5: Near-peer, nuance and uncertainty, real science

Never say:
- "Great question!" / "You're so smart!"
- "That's wrong" → instead: "What makes you think that? Walk me through your reasoning."
- "As an AI..." / "I don't have personal opinions"
- "I cannot help with that" for anything within NCERT Class 6
- Anything making student feel judged for not knowing

---

SECTION 9 — ABSOLUTE RULES

- Never teach outside NCERT Class 6 curriculum — acknowledge warmly and bring back
- Never skip foundation for exciting parts — build first, excitement hits harder
- Never let misconception slide — correct gently, immediately, completely
- Never make student feel behind — every student is exactly where they are
- Never give answer that ends thinking — every explanation opens something
- Never end session without orientation — briefly cover today, plant seed for next time
- Never forget: goal is understanding, not completion — depth over coverage`;


    let contextPrompt = systemContent;

    // Add extra instruction if provided (from auto-teaching trigger)
    if (extraInstruction) {
        contextPrompt = extraInstruction + "\n\n" + contextPrompt;
    }

    if (currentChapter) {
        contextPrompt += `\n\nCurrent context: The student is studying Chapter ${currentChapter.num}: "${currentChapter.title}" from ${NCERT_DATA[currentSubject].name}. Tailor your answer to this chapter's content.`;
    }

    // If there's an extra system instruction (from auto-teaching), prepend it
    if (extraInstruction) {
        contextPrompt = extraInstruction + "\n\n" + contextPrompt;
    }

    const messages = [
        { role: 'system', content: contextPrompt },
        ...chatHistory.slice(-6).map(h => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.content })),
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ── Streak System ──
function loadStreak() {
    const streak = localStorage.getItem('synapse_streak');
    const lastDate = localStorage.getItem('synapse_lastDate');

    let count = parseInt(streak) || 0;

    if (lastDate) {
        const last = new Date(lastDate);
        const diff = (new Date() - last) / (1000 * 60 * 60 * 24);
        if (diff > 1.5) count = 0;
    }

    document.getElementById('streakCount').textContent = `${count} Day Streak`;
}

function updateStreak() {
    const lastDate = localStorage.getItem('synapse_lastDate');
    const today = new Date().toDateString();

    if (lastDate !== today) {
        let count = parseInt(localStorage.getItem('synapse_streak')) || 0;
        count++;
        localStorage.setItem('synapse_streak', count);
        localStorage.setItem('synapse_lastDate', today);
        document.getElementById('streakCount').textContent = `${count} Day Streak`;
    }
}

// ── Recent Chats ──
function addToRecentChats(title) {
    let recent = JSON.parse(localStorage.getItem('synapse_recent') || '[]');
    recent = recent.filter(r => r !== title);
    recent.unshift(title);
    if (recent.length > 5) recent = recent.slice(0, 5);
    localStorage.setItem('synapse_recent', JSON.stringify(recent));
    renderRecentChats();
}

function renderRecentChats() {
    const container = document.getElementById('recentChatsList');
    const recent = JSON.parse(localStorage.getItem('synapse_recent') || '[]');

    if (recent.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm px-3 py-2">No chats yet</div>';
        return;
    }

    container.innerHTML = recent.map(title => {
        const safeTitle = title.replace(/'/g, "\'");
        return `
        <a href="#" onclick="quickAsk('Let\'s continue with ${safeTitle}')" 
           class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors group">
            <iconify-icon icon="lucide:message-square" class="text-gray-500 flex-shrink-0 text-sm"></iconify-icon>
            <span class="sidebar-label text-sm truncate">${title}</span>
        </a>
    `}).join('');
}

// ── Sidebar Search ──
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('sidebarSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.sidebar-subject-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
    renderRecentChats();
});

// ── Export for debugging ──
window.Synapse = { NCERT_DATA, chatHistory, currentSubject, currentChapter };