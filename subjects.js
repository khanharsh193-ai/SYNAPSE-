// ═══════════════════════════════════════════════════════════════
// SYNAPSE — My Subjects Page Logic
// Progress tracking, chapter selection, navigation
// ═══════════════════════════════════════════════════════════════

// ── NCERT Class 6 Data ──
const SUBJECTS_DATA = {
    mathematics: {
        name: "Mathematics",
        color: "blue",
        colorHex: "#3b82f6",
        icon: "lucide:calculator",
        totalChapters: 14,
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
        color: "emerald",
        colorHex: "#10b981",
        icon: "lucide:flask-conical",
        totalChapters: 16,
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
        color: "orange",
        colorHex: "#f97316",
        icon: "lucide:globe",
        totalChapters: 29,
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

// ── Progress Management ──
const ProgressManager = {
    // Get all progress data
    getData() {
        const data = localStorage.getItem('synapse_progress');
        return data ? JSON.parse(data) : this.getDefaultData();
    },

    getDefaultData() {
        return {
            mathematics: { completed: [], inProgress: null, lastStudied: null },
            science: { completed: [], inProgress: null, lastStudied: null },
            social: { completed: [], inProgress: null, lastStudied: null }
        };
    },

    // Save progress data
    saveData(data) {
        localStorage.setItem('synapse_progress', JSON.stringify(data));
    },

    // Mark chapter as completed
    completeChapter(subject, chapterNum) {
        const data = this.getData();
        if (!data[subject].completed.includes(chapterNum)) {
            data[subject].completed.push(chapterNum);
        }
        data[subject].inProgress = null;
        this.saveData(data);
        this.updateUI();
    },

    // Set chapter as in-progress
    setInProgress(subject, chapterNum, chapterTitle) {
        const data = this.getData();
        data[subject].inProgress = { num: chapterNum, title: chapterTitle };
        data[subject].lastStudied = new Date().toISOString();
        this.saveData(data);
        this.updateUI();
    },

    // Get completion count for a subject
    getCompletedCount(subject) {
        return this.getData()[subject].completed.length;
    },

    // Get progress percentage for a subject
    getProgressPercent(subject) {
        const completed = this.getCompletedCount(subject);
        const total = SUBJECTS_DATA[subject].totalChapters;
        return Math.round((completed / total) * 100);
    },

    // Get last studied chapter across all subjects
    getLastStudied() {
        const data = this.getData();
        let last = null;

        Object.keys(data).forEach(subject => {
            const subjectData = data[subject];
            if (subjectData.lastStudied) {
                const date = new Date(subjectData.lastStudied);
                if (!last || date > new Date(last.lastStudied)) {
                    last = {
                        subject,
                        ...subjectData.inProgress,
                        lastStudied: subjectData.lastStudied,
                        completed: subjectData.completed.length,
                        total: SUBJECTS_DATA[subject].totalChapters
                    };
                }
            }
        });

        return last;
    },

    // Get overall stats
    getOverallStats() {
        const data = this.getData();
        let totalCompleted = 0;
        let totalInProgress = 0;
        let totalChapters = 0;

        Object.keys(SUBJECTS_DATA).forEach(subject => {
            const completed = data[subject].completed.length;
            totalCompleted += completed;
            totalInProgress += data[subject].inProgress ? 1 : 0;
            totalChapters += SUBJECTS_DATA[subject].totalChapters;
        });

        return {
            completed: totalCompleted,
            inProgress: totalInProgress,
            totalChapters,
            overallPercent: Math.round((totalCompleted / totalChapters) * 100)
        };
    },

    // Update all UI elements
    updateUI() {
        const data = this.getData();

        // Update sidebar progress
        Object.keys(SUBJECTS_DATA).forEach(subject => {
            const completed = data[subject].completed.length;
            const total = SUBJECTS_DATA[subject].totalChapters;
            const el = document.getElementById(`${subject}-progress`);
            if (el) el.textContent = `${completed}/${total}`;
        });

        // Update subject card progress
        Object.keys(SUBJECTS_DATA).forEach(subject => {
            const completed = data[subject].completed.length;
            const total = SUBJECTS_DATA[subject].totalChapters;
            const percent = Math.round((completed / total) * 100);

            const progressEl = document.getElementById(`${subject}-card-progress`);
            const barEl = document.getElementById(`${subject}-card-bar`);

            if (progressEl) progressEl.textContent = `${completed}/${total}`;
            if (barEl) barEl.style.width = `${percent}%`;
        });

        // Update stats
        const stats = this.getOverallStats();
        const statsCompleted = document.getElementById('stats-completed');
        const statsInProgress = document.getElementById('stats-in-progress');
        const statsOverall = document.getElementById('stats-overall');

        if (statsCompleted) statsCompleted.textContent = stats.completed;
        if (statsInProgress) statsInProgress.textContent = stats.inProgress;
        if (statsOverall) statsOverall.textContent = `${stats.overallPercent}%`;

        // Update continue learning banner
        this.updateContinueBanner();
    },

    updateContinueBanner() {
        const last = this.getLastStudied();
        const banner = document.getElementById('continueLearningBanner');

        if (!last || !banner) {
            if (banner) banner.classList.add('section-hidden');
            return;
        }

        banner.classList.remove('section-hidden');

        const subjectData = SUBJECTS_DATA[last.subject];
        const percent = this.getProgressPercent(last.subject);
        const lastDate = new Date(last.lastStudied);
        const timeAgo = this.getTimeAgo(lastDate);

        document.getElementById('continueSubject').textContent = subjectData.name;
        document.getElementById('continueSubject').className = `text-xs font-bold px-2 py-1 rounded bg-${subjectData.color}-500/20 text-${subjectData.color}-400 uppercase tracking-wider`;
        document.getElementById('continueChapterNum').textContent = `Chapter ${last.num}`;
        document.getElementById('continueChapterTitle').textContent = last.title;
        document.getElementById('continueLastStudied').textContent = `Last studied: ${timeAgo}`;
        document.getElementById('continueProgress').textContent = `${percent}%`;
        document.getElementById('continueProgressBar').style.width = `${percent}%`;

        // Store for continue button
        banner.dataset.subject = last.subject;
        banner.dataset.chapterNum = last.num;
        banner.dataset.chapterTitle = last.title;
    },

    getTimeAgo(date) {
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    }
};

// ── Streak System ──
const StreakManager = {
    load() {
        const streak = localStorage.getItem('synapse_streak');
        const lastDate = localStorage.getItem('synapse_lastDate');
        let count = parseInt(streak) || 0;

        if (lastDate) {
            const last = new Date(lastDate);
            const diff = (new Date() - last) / (1000 * 60 * 60 * 24);
            if (diff > 1.5) count = 0;
        }

        const el = document.getElementById('streakCount');
        if (el) el.textContent = `${count} Day Streak`;
        return count;
    },

    update() {
        const lastDate = localStorage.getItem('synapse_lastDate');
        const today = new Date().toDateString();

        if (lastDate !== today) {
            let count = parseInt(localStorage.getItem('synapse_streak')) || 0;
            count++;
            localStorage.setItem('synapse_streak', count);
            localStorage.setItem('synapse_lastDate', today);

            const el = document.getElementById('streakCount');
            if (el) el.textContent = `${count} Day Streak`;
        }
    }
};

// ── Recent Chats ──
const ChatHistory = {
    add(title) {
        let recent = JSON.parse(localStorage.getItem('synapse_recent') || '[]');
        recent = recent.filter(r => r !== title);
        recent.unshift(title);
        if (recent.length > 5) recent = recent.slice(0, 5);
        localStorage.setItem('synapse_recent', JSON.stringify(recent));
        this.render();
    },

    render() {
        const container = document.getElementById('recentChatsList');
        if (!container) return;

        const recent = JSON.parse(localStorage.getItem('synapse_recent') || '[]');

        if (recent.length === 0) {
            container.innerHTML = '<div class="text-gray-500 text-sm px-3 py-2">No chats yet</div>';
            return;
        }

        container.innerHTML = recent.map(title => {
            const safeTitle = title.replace(/'/g, "\'");
            return `
            <a href="index.html?chat=${encodeURIComponent(title)}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-dark-700 hover:text-white transition-colors group">
                <iconify-icon icon="lucide:message-square" class="text-gray-500 flex-shrink-0 text-sm"></iconify-icon>
                <span class="sidebar-label text-sm truncate">${title}</span>
            </a>
        `}).join('');
    }
};

// ── View Navigation ──
let currentSubject = null;

function showSubjectsView() {
    document.getElementById('subjectsView').classList.remove('section-hidden');
    document.getElementById('chaptersView').classList.add('section-hidden');
}

function showChaptersView() {
    document.getElementById('subjectsView').classList.add('section-hidden');
    document.getElementById('chaptersView').classList.remove('section-hidden');
}

function showSubjectChapters(subjectKey) {
    currentSubject = subjectKey;
    const subject = SUBJECTS_DATA[subjectKey];
    const data = ProgressManager.getData();

    document.getElementById('chaptersTitle').innerHTML = `
        <span class="text-${subject.color}-400">${subject.name}</span> — Class 6
    `;

    // Update subject progress bar
    const completed = data[subjectKey].completed.length;
    const total = subject.totalChapters;
    const percent = Math.round((completed / total) * 100);

    document.getElementById('subject-progress-text').textContent = `${completed}/${total} chapters`;
    document.getElementById('subject-progress-bar').style.width = `${percent}%`;

    // Render chapters
    const grid = document.getElementById('chaptersGrid');
    grid.innerHTML = subject.chapters.map(ch => {
        const chNum = ch.num;
        const isCompleted = data[subjectKey].completed.includes(chNum);
        const isInProgress = data[subjectKey].inProgress && data[subjectKey].inProgress.num === chNum;
        const statusClass = isCompleted ? 'completed' : isInProgress ? 'in-progress' : '';
        const statusBadge = isCompleted 
            ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-green/20 text-accent-green flex items-center gap-1"><iconify-icon icon="lucide:check" class="text-xs"></iconify-icon>Done</span>'
            : isInProgress
            ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">In Progress</span>'
            : '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-700 text-gray-400">Not Started</span>';

        const safeTitle = ch.title.replace(/'/g, "\'");
        const bookLabel = ch.book ? `<span class="text-[10px] text-gray-500 bg-dark-700 px-2 py-0.5 rounded">${ch.book}</span>` : '';

        return `
        <div class="chapter-card bg-dark-800 border border-dark-600 rounded-xl p-5 ${statusClass}" onclick="startChapter('${subjectKey}', '${chNum}', '${safeTitle}')">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold ${isCompleted ? 'text-accent-green' : isInProgress ? 'text-blue-400' : 'text-gray-500'}">Ch. ${chNum}</span>
                    ${bookLabel}
                </div>
                ${statusBadge}
            </div>
            <h4 class="font-semibold mb-2">${ch.title}</h4>
            <div class="flex flex-wrap gap-1.5 mb-4">
                ${ch.topics.slice(0, 3).map(t => `<span class="text-[10px] text-gray-400 bg-dark-700 px-2 py-0.5 rounded">${t}</span>`).join('')}
                ${ch.topics.length > 3 ? `<span class="text-[10px] text-gray-500">+${ch.topics.length - 3}</span>` : ''}
            </div>
            <button class="w-full py-2 rounded-lg ${isCompleted ? 'bg-dark-700 hover:bg-dark-600 border border-dark-600' : 'bg-accent-green hover:bg-accent-hover text-dark-900 font-bold'} transition-all text-sm flex items-center justify-center gap-2">
                <iconify-icon icon="${isCompleted ? 'lucide:rotate-ccw' : 'lucide:play'}" class="${isCompleted ? 'text-gray-400' : ''} text-sm"></iconify-icon>
                ${isCompleted ? 'Review Chapter' : isInProgress ? 'Continue Learning' : 'Start Learning'}
            </button>
        </div>
        `;
    }).join('');

    showChaptersView();
}

// ── Start Learning ──
function startChapter(subject, chapterNum, chapterTitle) {
    // Mark as in-progress
    ProgressManager.setInProgress(subject, chapterNum, chapterTitle);
    ProgressManager.updateUI();
    StreakManager.update();
    ChatHistory.add(`${SUBJECTS_DATA[subject].name}: ${chapterTitle}`);

    // Navigate to chat with chapter context
    const params = new URLSearchParams({
        subject,
        chapter: chapterNum,
        title: chapterTitle
    });

    window.location.href = `index.html?${params.toString()}`;
}

function continueLearning() {
    const banner = document.getElementById('continueLearningBanner');
    const subject = banner.dataset.subject;
    const chapterNum = banner.dataset.chapterNum;
    const chapterTitle = banner.dataset.chapterTitle;

    if (subject && chapterNum && chapterTitle) {
        startChapter(subject, chapterNum, chapterTitle);
    }
}

function newChat() {
    window.location.href = 'index.html';
}

function showChatFromSidebar() {
    window.location.href = 'index.html';
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', function() {
    ProgressManager.updateUI();
    StreakManager.load();
    ChatHistory.render();

    // Sidebar search
    const searchInput = document.getElementById('sidebarSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.sidebar-subject-item, .sidebar-nav-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }
});

// ── Export ──
window.SynapseSubjects = { SUBJECTS_DATA, ProgressManager, StreakManager, ChatHistory };