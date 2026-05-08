// ══════════════════════════════════════════
//  SYNAPSE CURRICULUM
//  Add new chapters by adding to CURRICULUM array
//  Everything else auto-handles
// ══════════════════════════════════════════

var CURRICULUM = [
  {
    id: 'cell-biology',
    title: 'Cell Biology',
    subtitle: 'The foundation of all life',
    class: [6, 7, 8, 9, 10, 11, 12],
    color: '#5deb8a',
    glowColor: 'rgba(93,235,138,0.4)',
    icon: '⬡',
    description: 'Every living thing — from bacteria to blue whales — is made of cells. Understanding the cell is understanding life itself.',

    branches: [
      {
        id: 'what-is-a-cell',
        title: 'What is a Cell?',
        subtitle: 'Where it all begins',
        prerequisite: null,
        position: { x: 0, y: 0 }, // relative to trunk base
        lessons: [
          {
            id: 'cell-theory',
            title: 'Cell Theory',
            subtitle: 'The three laws that changed biology',
            class: [6, 7, 8, 9, 10, 11, 12],
            duration: '8 min',
            visual: 'cell-overview',
            hook: 'Have you ever wondered what the smallest piece of "you" looks like?',
            concepts: ['cell theory', 'living things', 'cell as unit of life']
          },
          {
            id: 'types-of-cells',
            title: 'Two Worlds of Cells',
            subtitle: 'Prokaryotic vs Eukaryotic',
            class: [7, 8, 9, 10, 11, 12],
            duration: '10 min',
            visual: 'cell-types',
            hook: 'Not all cells are equal — some are ancient, some are complex.',
            concepts: ['prokaryotic', 'eukaryotic', 'nucleus', 'bacteria']
          }
        ]
      },

      {
        id: 'cell-structure',
        title: 'Inside the Cell',
        subtitle: 'A world within a world',
        prerequisite: 'what-is-a-cell',
        position: { x: -1, y: 1 },
        lessons: [
          {
            id: 'organelles',
            title: 'The Organelles',
            subtitle: 'Meet the workers inside every cell',
            class: [7, 8, 9, 10, 11, 12],
            duration: '12 min',
            visual: 'cell-interactive',
            hook: 'Your cell has a power plant, a library, a factory, and a security system — all invisible to the naked eye.',
            concepts: ['nucleus', 'mitochondria', 'ribosome', 'ER', 'golgi', 'vacuole']
          },
          {
            id: 'cell-membrane',
            title: 'The Cell Membrane',
            subtitle: 'The gatekeeper of life',
            class: [8, 9, 10, 11, 12],
            duration: '10 min',
            visual: 'membrane-animation',
            hook: 'Every cell has a border — and it decides exactly what gets in and what stays out.',
            concepts: ['phospholipid bilayer', 'osmosis', 'diffusion', 'selective permeability']
          }
        ]
      },

      {
        id: 'cell-processes',
        title: 'Cell in Action',
        subtitle: 'How cells power and replicate life',
        prerequisite: 'cell-structure',
        position: { x: 1, y: 2 },
        lessons: [
          {
            id: 'cell-division',
            title: 'Cell Division',
            subtitle: 'How one becomes two',
            class: [8, 9, 10, 11, 12],
            duration: '15 min',
            visual: 'mitosis-animation',
            hook: 'Right now, millions of your cells are copying themselves perfectly — in less time than it takes to read this.',
            concepts: ['mitosis', 'meiosis', 'chromosomes', 'DNA replication']
          },
          {
            id: 'photosynthesis',
            title: 'Photosynthesis',
            subtitle: 'Turning light into life',
            class: [7, 8, 9, 10, 11, 12],
            duration: '12 min',
            visual: 'chloroplast-animation',
            hook: 'Every meal you have ever eaten started as sunlight hitting a leaf.',
            concepts: ['chloroplast', 'glucose', 'ATP', 'light reaction', 'Calvin cycle']
          }
        ]
      }
    ]
  }

  // ── ADD NEW CHAPTERS BELOW ──
  // Copy the object above and fill in content.
  // The app handles everything else automatically.
  //
  // {
  //   id: 'genetics',
  //   title: 'Genetics',
  //   subtitle: 'The code of life',
  //   class: [9, 10, 11, 12],
  //   color: '#60a5fa',
  //   glowColor: 'rgba(96,165,250,0.4)',
  //   icon: '🧬',
  //   branches: [ ... ]
  // }
];
