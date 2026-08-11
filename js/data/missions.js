/* =========================================================
   TechFix — missions.js
   Static mission definitions. In Phase 1 only the summary
   fields are used, to render the "Today's Mission" card on
   Home. Scenario/objectives/choices/feedback fields are
   already modeled here so Mission Briefing, Troubleshooting,
   Diagnosis, and Results can be built on top of this same
   file in later phases without changing its shape.
   ========================================================= */

const MISSIONS = [
  {
    id: 'mission-01',
    title: "Computer Won't Turn On",
    difficulty: 'Easy',
    estimatedMinutes: 10,
    rewardXp: 100,
    rewardCoins: 50,
    scenario:
      'A customer brings in a desktop computer that does not power on when the power button is pressed. Inspect the system, identify the possible cause, and apply the correct troubleshooting steps.',
    learningObjectives: [
      'Identify possible causes of power failure',
      'Perform basic hardware inspection',
      'Apply the correct troubleshooting process',
      'Select the appropriate solution',
    ],
    equipment: [
      { name: 'Screwdriver', icon: '🪛' },
      { name: 'Flashlight', icon: '🔦' },
      { name: 'Multimeter', icon: '📟' },
      { name: 'PSU Tester', icon: '🔌' },
      { name: 'RAM Module', icon: '💾' },
    ],
    objectives: [
      'Check the power cable',
      'Inspect the power supply (PSU)',
      'Check RAM installation',
      'Inspect motherboard connections',
      'Test the system',
    ],
    // ---- Troubleshooting screen data (Phase 3) ----
    // Six inspectable components. `status` + `findingText` are the
    // evidence revealed once the component is successfully inspected —
    // never a labeled "correct answer". `compatibleTools` lists which
    // tool ids make sense for that component (see js/data/tools.js).
    components: [
      {
        id: 'power-cable',
        name: 'Power Cable',
        icon: '🔌',
        description: 'The cable connecting the power supply to the wall outlet.',
        compatibleTools: ['flashlight'],
        status: 'normal',
        findingText: 'The power cable is securely connected to both the outlet and the power supply unit.',
      },
      {
        id: 'psu',
        name: 'Power Supply (PSU)',
        icon: '🔋',
        description: 'Converts power from the outlet into power the internal components can use.',
        compatibleTools: ['multimeter', 'psu-tester'],
        status: 'problem',
        findingText: 'PSU test failed. The power supply is not delivering power to the motherboard.',
      },
      {
        id: 'ram',
        name: 'RAM',
        icon: '💾',
        description: 'Temporary memory the computer uses while it is running.',
        compatibleTools: ['flashlight', 'ram-module'],
        status: 'normal',
        findingText: 'RAM modules are properly seated in their slots.',
      },
      {
        id: 'motherboard',
        name: 'Motherboard',
        icon: '🖥️',
        description: 'The main circuit board that connects all other components together.',
        compatibleTools: ['flashlight', 'screwdriver'],
        status: 'normal',
        findingText: 'No visible damage or loose connections were found on the motherboard.',
      },
      {
        id: 'cpu',
        name: 'CPU',
        icon: '⚙️',
        description: "The processor that carries out the computer's instructions.",
        compatibleTools: ['flashlight', 'screwdriver'],
        status: 'normal',
        findingText: 'No visible issues detected with the CPU or its socket.',
      },
      {
        id: 'storage',
        name: 'Storage Drive',
        icon: '💽',
        description: 'Stores the operating system, programs, and files.',
        compatibleTools: ['flashlight', 'screwdriver'],
        status: 'normal',
        findingText: 'The storage drive is properly connected with no visible issues.',
      },
    ],
    // Neutral-worded objectives shown on the Troubleshooting screen only.
    // Distinct from `objectives` above (used by Mission Briefing) so that
    // screen keeps its own simpler checklist wording untouched.
    troubleshootingObjectives: [
      { id: 'obj-power', label: 'Inspect the power connection', requires: ['power-cable'] },
      { id: 'obj-internal', label: 'Inspect internal components', requires: ['ram', 'motherboard', 'cpu', 'storage'] },
      { id: 'obj-psu', label: 'Test the power supply', requires: ['psu'] },
      { id: 'obj-evidence', label: 'Gather enough evidence', requires: ['power-cable', 'psu', 'ram', 'motherboard', 'cpu', 'storage'] },
      { id: 'obj-cause', label: 'Identify the most likely cause', requires: ['power-cable', 'psu', 'ram', 'motherboard', 'cpu', 'storage'] },
    ],
    // Diagnosis choices — multiple-choice only, no written response.
    choices: [
      { id: 'psu', label: 'Faulty Power Supply (PSU)', correct: true },
      { id: 'ram', label: 'Loose RAM Module', correct: false },
      { id: 'motherboard', label: 'Damaged Motherboard', correct: false },
      { id: 'cable', label: 'Defective Power Cable', correct: false },
    ],
    // Shown automatically on the Results screen — the student never writes this.
    feedback: {
      whyCorrect:
        'The power cable was securely connected and the RAM was properly installed. During testing, the Power Supply Unit failed to deliver power to the motherboard, preventing the computer from turning on.',
      tips: [
        'Always inspect the power source before replacing components.',
        'Verify cable connections before diagnosing hardware failure.',
        'Follow a step-by-step troubleshooting process.',
        'Test components before concluding they are defective.',
      ],
    },
  },
];

/** Look up a mission by id, falling back to the first mission if not found. */
function getMissionById(missionId) {
  return MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
}
