/* =========================================================
   TechFix — tools.js
   Static tool definitions used by the Troubleshooting screen.
   Kept separate from missions.js because tools are reusable
   across every mission, while `compatibleTools` on each
   mission component decides which tools make sense where.

   `action` marks what a tool is generally used for:
   - 'inspect' → visual / mechanical check
   - 'test'    → electrical / functional test
   This lets the Troubleshooting screen decide whether the
   student's selected tool matches the "Inspect" or "Test"
   button they clicked.
   ========================================================= */

const TOOLS = [
  {
    id: 'screwdriver',
    name: 'Screwdriver',
    icon: '🪛',
    action: 'inspect',
    description: 'Used for accessing or securing hardware components.',
  },
  {
    id: 'flashlight',
    name: 'Flashlight',
    icon: '🔦',
    action: 'inspect',
    description: 'Used to visually inspect internal components and connections.',
  },
  {
    id: 'multimeter',
    name: 'Multimeter',
    icon: '📟',
    action: 'test',
    description: 'Used for basic electrical testing.',
  },
  {
    id: 'psu-tester',
    name: 'PSU Tester',
    icon: '🔌',
    action: 'test',
    description: 'Used to test whether the power supply is functioning properly.',
  },
  {
    id: 'ram-module',
    name: 'RAM Module',
    icon: '💾',
    action: 'test',
    description: 'Used as a spare, known-good module for RAM-related testing.',
  },
];

/** Look up a tool definition by id. */
function getToolById(toolId) {
  return TOOLS.find((t) => t.id === toolId) || null;
}
