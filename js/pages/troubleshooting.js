/* =========================================================
   TechFix — troubleshooting.js (page script)
   Real Phase 3 gameplay: component inspection, tool
   selection, evidence gathering, checklist/objectives/
   progress updates, a non-punishing countdown timer, and the
   "Continue to Diagnosis" gate. Uses the existing storage.js
   / player.js / navigation.js — no second storage system, no
   backend, no database.
   ========================================================= */

// ---- In-memory game state for this page load ----
const TS = {
  mission: null,
  selectedComponentId: null,
  selectedToolId: null,
  inspected: {},        // componentId -> { status, toolUsed, action }
  timerRemaining: 0,     // seconds
  timerInterval: null,
  timerElapsedNotified: false,
};

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return;

  Navbar.render(player);
  DashboardSidebar.render(player);

  const missionId = Storage.getSelectedMissionId() || MISSIONS[0].id;
  TS.mission = getMissionById(missionId);

  restoreInspectionState();
  renderTaskCard();
  renderDiagram();
  renderToolbox();
  renderComponentDetails();
  renderChecklist();
  renderObjectives();
  updateContinueButton();
  startTimer();
  wireButtons();
});

/* ---------------------------------------------------------
   Restore progress (if the student reloaded or came back)
   --------------------------------------------------------- */
function restoreInspectionState() {
  const saved = Storage.getInspectionState(TS.mission.id);
  if (saved && saved.inspectedComponents) {
    TS.inspected = saved.inspectedComponents;
  }
}

/* ---------------------------------------------------------
   Current Task card
   --------------------------------------------------------- */
function renderTaskCard() {
  document.getElementById('taskTitle').textContent = `Diagnosing: ${TS.mission.title}`;
  updateTaskInstruction();
}

function updateTaskInstruction() {
  const el = document.getElementById('taskInstruction');
  const total = TS.mission.components.length;
  const done = Object.keys(TS.inspected).length;

  if (done === 0) {
    el.textContent = 'Select a highlighted component to begin inspecting.';
  } else if (done < total) {
    el.textContent = `Keep going — ${total - done} component(s) still need inspecting.`;
  } else {
    el.textContent = 'All components inspected. Review your findings, then continue to diagnosis.';
  }
}

/* ---------------------------------------------------------
   Computer diagram / hotspots
   --------------------------------------------------------- */
function renderDiagram() {
  TS.mission.components.forEach((component) => {
    const hotspot = document.getElementById(`hotspot-${component.id}`);
    if (!hotspot) return;

    hotspot.classList.remove('hotspot--selected', 'hotspot--normal', 'hotspot--problem');

    const result = TS.inspected[component.id];
    if (result) {
      hotspot.classList.add(result.status === 'problem' ? 'hotspot--problem' : 'hotspot--normal');
    }
    if (TS.selectedComponentId === component.id) {
      hotspot.classList.add('hotspot--selected');
    }

    hotspot.onclick = () => selectComponent(component.id);
  });
}

function selectComponent(componentId) {
  TS.selectedComponentId = componentId;
  renderDiagram();
  renderComponentDetails();
}

/* ---------------------------------------------------------
   Component Details panel
   --------------------------------------------------------- */
function renderComponentDetails() {
  const emptyState = document.getElementById('detailsEmptyState');
  const content = document.getElementById('detailsContent');

  if (!TS.selectedComponentId) {
    emptyState.style.display = 'flex';
    content.style.display = 'none';
    return;
  }

  const component = getComponent(TS.selectedComponentId);
  const result = TS.inspected[component.id];

  emptyState.style.display = 'none';
  content.style.display = 'block';

  document.getElementById('detailsIcon').textContent = component.icon;
  document.getElementById('detailsName').textContent = component.name;
  document.getElementById('detailsDesc').textContent = component.description;

  const pill = document.getElementById('detailsStatusPill');
  const findingBox = document.getElementById('findingBox');
  const findingText = document.getElementById('findingText');

  if (!result) {
    pill.textContent = 'Not Inspected';
    pill.className = 'status-pill status-pill--uninspected';
    findingBox.classList.remove('finding-box--visible', 'finding-box--problem');
  } else {
    const isProblem = result.status === 'problem';
    pill.textContent = isProblem ? 'Problem Detected' : 'Normal';
    pill.className = `status-pill ${isProblem ? 'status-pill--problem' : 'status-pill--normal'}`;
    findingText.textContent = component.findingText;
    findingBox.classList.add('finding-box--visible');
    findingBox.classList.toggle('finding-box--problem', isProblem);
  }
}

function getComponent(componentId) {
  return TS.mission.components.find((c) => c.id === componentId) || null;
}

/* ---------------------------------------------------------
   Toolbox
   --------------------------------------------------------- */
function renderToolbox() {
  const row = document.getElementById('toolboxRow');
  row.innerHTML = TOOLS.map(
    (tool) => `
    <button type="button" class="tool-btn ${TS.selectedToolId === tool.id ? 'tool-btn--selected' : ''}" data-tool-id="${tool.id}">
      <span class="tool-btn__icon">${tool.icon}</span>
      <span class="tool-btn__name">${tool.name}</span>
    </button>`
  ).join('');

  row.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => selectTool(btn.dataset.toolId));
  });

  updateToolDesc();
}

function selectTool(toolId) {
  TS.selectedToolId = toolId;
  renderToolbox();
}

function updateToolDesc() {
  const el = document.getElementById('toolDesc');
  if (!TS.selectedToolId) {
    el.textContent = 'Select a tool to see what it\'s used for.';
    return;
  }
  const tool = getToolById(TS.selectedToolId);
  el.textContent = `${tool.name}: ${tool.description}`;
}

/* ---------------------------------------------------------
   Inspect / Test / Reset actions
   --------------------------------------------------------- */
function wireButtons() {
  document.getElementById('inspectBtn').addEventListener('click', () => attemptAction('inspect'));
  document.getElementById('testBtn').addEventListener('click', () => attemptAction('test'));
  document.getElementById('resetBtn').addEventListener('click', resetSelectedComponent);

  document.getElementById('previousStepBtn').addEventListener('click', () => {
    Navigation.goTo('mission-briefing.html');
  });

  document.getElementById('hintBtn').addEventListener('click', showHint);

  document.getElementById('continueDiagnosisBtn').addEventListener('click', () => {
    if (!allComponentsInspected()) return;
    persistInspectionState();
    Navigation.goTo('diagnosis.html');
  });
}

function attemptAction(actionType) {
  if (!TS.selectedComponentId) {
    Navigation.showToast('Select a component first.');
    return;
  }
  if (!TS.selectedToolId) {
    Navigation.showToast('Select a tool first.');
    return;
  }

  const component = getComponent(TS.selectedComponentId);
  const tool = getToolById(TS.selectedToolId);

  if (!component.compatibleTools.includes(tool.id)) {
    Navigation.showToast('This tool is not appropriate for inspecting this component.');
    return;
  }

  if (tool.action !== actionType) {
    const suggestedLabel = tool.action === 'inspect' ? 'Inspect' : 'Test';
    Navigation.showToast(`Try "${suggestedLabel}" with this tool instead.`);
    return;
  }

  // Valid tool + valid action for this component — record the finding.
  TS.inspected[component.id] = {
    status: component.status,
    toolUsed: tool.id,
    action: actionType,
  };

  persistInspectionState();
  Navigation.showToast(component.findingText);

  renderDiagram();
  renderComponentDetails();
  renderChecklist();
  renderObjectives();
  updateContinueButton();
  updateTaskInstruction();
}

function resetSelectedComponent() {
  if (!TS.selectedComponentId) {
    Navigation.showToast('Select a component first.');
    return;
  }
  if (!TS.inspected[TS.selectedComponentId]) {
    Navigation.showToast('This component has not been inspected yet.');
    return;
  }

  delete TS.inspected[TS.selectedComponentId];
  persistInspectionState();

  renderDiagram();
  renderComponentDetails();
  renderChecklist();
  renderObjectives();
  updateContinueButton();
  updateTaskInstruction();
}

/* ---------------------------------------------------------
   Inspection checklist + progress
   --------------------------------------------------------- */
function renderChecklist() {
  const container = document.getElementById('inspectChecklist');

  container.innerHTML = TS.mission.components.map((component) => {
    const result = TS.inspected[component.id];
    let markClass = 'inspect-checklist-item__mark--pending';
    let mark = '○';
    let statusClass = 'inspect-checklist-item__status--pending';
    let statusText = 'Not Inspected';

    if (result) {
      const isProblem = result.status === 'problem';
      markClass = isProblem ? 'inspect-checklist-item__mark--problem' : 'inspect-checklist-item__mark--normal';
      mark = '✓';
      statusClass = isProblem ? 'inspect-checklist-item__status--problem' : 'inspect-checklist-item__status--normal';
      statusText = isProblem ? 'Problem Detected' : 'Normal';
    }

    return `
      <div class="inspect-checklist-item">
        <span class="inspect-checklist-item__label">
          <span class="inspect-checklist-item__mark ${markClass}">${mark}</span>
          ${component.icon} ${component.name}
        </span>
        <span class="inspect-checklist-item__status ${statusClass}">${statusText}</span>
      </div>`;
  }).join('');

  const total = TS.mission.components.length;
  const done = Object.keys(TS.inspected).length;
  const pct = Math.round((done / total) * 100);

  document.getElementById('progressLabel').textContent = `${done} / ${total} Components Inspected`;
  document.getElementById('progressFill').style.width = `${pct}%`;
}

/* ---------------------------------------------------------
   Mission objectives (neutral wording — no answer reveal)
   --------------------------------------------------------- */
function renderObjectives() {
  const list = document.getElementById('troubleshootingObjectives');
  const inspectedIds = Object.keys(TS.inspected);

  list.innerHTML = TS.mission.troubleshootingObjectives.map((objective) => {
    const done = objective.requires.every((id) => inspectedIds.includes(id));
    return `
      <li class="checklist-item ${done ? 'checklist-item--done' : 'checklist-item--pending'}">
        <span class="checklist-item__check">${done ? '✔' : '○'}</span>
        ${objective.label}
      </li>`;
  }).join('');
}

/* ---------------------------------------------------------
   Continue to Diagnosis gate
   --------------------------------------------------------- */
function allComponentsInspected() {
  return Object.keys(TS.inspected).length === TS.mission.components.length;
}

function updateContinueButton() {
  const btn = document.getElementById('continueDiagnosisBtn');
  btn.disabled = !allComponentsInspected();
}

/* ---------------------------------------------------------
   Persist inspection state for the future Diagnosis screen
   --------------------------------------------------------- */
function persistInspectionState() {
  const toolsUsed = [...new Set(Object.values(TS.inspected).map((r) => r.toolUsed))];
  const completedObjectives = TS.mission.troubleshootingObjectives
    .filter((o) => o.requires.every((id) => TS.inspected[id]))
    .map((o) => o.id);

  Storage.saveInspectionState({
    missionId: TS.mission.id,
    inspectedComponents: TS.inspected,
    toolsUsed,
    completedObjectives,
    timerRemainingSeconds: TS.timerRemaining,
    timerElapsed: TS.timerElapsedNotified,
    savedAt: new Date().toISOString(),
  });
}

/* ---------------------------------------------------------
   Hint (does not reveal the diagnosis)
   --------------------------------------------------------- */
function showHint() {
  const remaining = TS.mission.components.filter((c) => !TS.inspected[c.id]);
  if (remaining.length === 0) {
    Navigation.showToast('You\'ve gathered all the evidence — review it, then continue to diagnosis.');
    return;
  }
  const next = remaining[0];
  const toolHint = getToolById(next.compatibleTools[0]);
  Navigation.showToast(`Try inspecting the ${next.name} — a ${toolHint.name.toLowerCase()} might help.`);
}

/* ---------------------------------------------------------
   Countdown timer — informational only, never punishing
   --------------------------------------------------------- */
function startTimer() {
  const saved = Storage.getInspectionState(TS.mission.id);
  TS.timerRemaining = (saved && typeof saved.timerRemainingSeconds === 'number')
    ? saved.timerRemainingSeconds
    : TS.mission.estimatedMinutes * 60;
  TS.timerElapsedNotified = !!(saved && saved.timerElapsed);

  renderTimer();

  TS.timerInterval = setInterval(() => {
    if (TS.timerRemaining > 0) {
      TS.timerRemaining -= 1;
    }
    renderTimer();

    if (TS.timerRemaining === 0 && !TS.timerElapsedNotified) {
      TS.timerElapsedNotified = true;
      Navigation.showToast('Recommended time has elapsed — take your time, your progress is safe.');
    }
  }, 1000);
}

function renderTimer() {
  const minutes = Math.floor(TS.timerRemaining / 60).toString().padStart(2, '0');
  const seconds = (TS.timerRemaining % 60).toString().padStart(2, '0');
  document.getElementById('timerValue').textContent = `${minutes}:${seconds}`;

  const timerBox = document.getElementById('taskTimer');
  timerBox.classList.toggle('task-timer--elapsed', TS.timerRemaining === 0);
}
