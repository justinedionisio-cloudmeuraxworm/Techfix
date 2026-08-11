/* =========================================================
   TechFix — diagnosis.js (page script)
   Phase 4 gameplay: reads the mission + inspection state saved
   by Troubleshooting (Phase 3), shows an Evidence Summary built
   entirely from that saved state, lets the student pick ONE
   multiple-choice diagnosis, and stores the selection for the
   future Results screen. No written response, no correctness
   reveal, no XP/coin/badge/level changes — those belong to
   later phases. Uses the existing storage.js / player.js /
   navigation.js / missions.js — no second data source.
   ========================================================= */

// ---- In-memory page state ----
const DG = {
  mission: null,
  inspectionState: null,
  selectedChoiceId: null,
};

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return;

  Navbar.render(player);
  DashboardSidebar.render(player);

  const missionId = Storage.getSelectedMissionId() || MISSIONS[0].id;
  DG.mission = getMissionById(missionId);
  DG.inspectionState = Storage.getInspectionState(DG.mission.id);

  renderMissionHeader();
  wireAlwaysOnButtons();

  // ---- Access control: no valid inspection state at all ----
  // The student must not be able to reach a diagnosis by opening
  // this page directly without having gone through Troubleshooting.
  if (!DG.inspectionState) {
    renderBlockedState();
    return;
  }

  const total = DG.mission.components.length;
  const done = Object.keys(DG.inspectionState.inspectedComponents || {}).length;
  const complete = done >= total;

  document.getElementById('evidenceCard').style.display = '';
  document.getElementById('choicesCard').style.display = '';

  renderEvidenceSummary(done, total, complete);
  renderChoices();
  updateSubmitButton(complete);
  wireModal();
});

/* ---------------------------------------------------------
   Mission header
   --------------------------------------------------------- */
function renderMissionHeader() {
  document.getElementById('missionHeaderTitle').textContent = `Mission 1: ${DG.mission.title}`;
}

/* ---------------------------------------------------------
   Blocked state — no troubleshooting has been done yet
   --------------------------------------------------------- */
function renderBlockedState() {
  document.getElementById('blockedCard').style.display = '';
  document.getElementById('blockedMessage').textContent = 'Complete the troubleshooting inspection first.';
  document.getElementById('submitDiagnosisBtn').disabled = true;
}

/* ---------------------------------------------------------
   Evidence Summary — built entirely from the saved
   inspection state, never hardcoded.
   --------------------------------------------------------- */
function renderEvidenceSummary(done, total, complete) {
  const list = document.getElementById('evidenceList');
  const inspected = DG.inspectionState.inspectedComponents || {};

  list.innerHTML = DG.mission.components.map((component) => {
    const result = inspected[component.id];

    let markClass = 'evidence-item__mark--pending';
    let mark = '○';
    let statusClass = 'evidence-item__status--pending';
    let statusText = 'Not Inspected';

    if (result) {
      const isProblem = result.status === 'problem';
      markClass = isProblem ? 'evidence-item__mark--problem' : 'evidence-item__mark--normal';
      mark = isProblem ? '⚠' : '✓';
      statusClass = isProblem ? 'evidence-item__status--problem' : 'evidence-item__status--normal';
      statusText = isProblem ? 'Problem Detected' : 'Normal';
    }

    return `
      <div class="evidence-item">
        <span class="evidence-item__label">
          <span class="evidence-item__mark ${markClass}">${mark}</span>
          ${component.icon} ${component.name}
        </span>
        <span class="evidence-item__status ${statusClass}">${statusText}</span>
      </div>`;
  }).join('');

  const pct = Math.round((done / total) * 100);
  document.getElementById('evidenceProgressLabel').textContent = `${done} / ${total} Components Inspected`;
  document.getElementById('evidenceProgressFill').style.width = `${pct}%`;

  document.getElementById('incompleteNotice').style.display = complete ? 'none' : 'flex';
}

/* ---------------------------------------------------------
   Diagnosis choices — read from missions.js, never duplicated
   --------------------------------------------------------- */
function renderChoices() {
  const grid = document.getElementById('choiceGrid');

  grid.innerHTML = DG.mission.choices.map((choice) => `
    <button type="button" class="choice-card" data-choice-id="${choice.id}">
      <span class="choice-card__mark">✓</span>
      <span class="choice-card__label">${choice.label}</span>
    </button>`
  ).join('');

  grid.querySelectorAll('.choice-card').forEach((btn) => {
    btn.addEventListener('click', () => selectChoice(btn.dataset.choiceId));
  });
}

function selectChoice(choiceId) {
  DG.selectedChoiceId = choiceId;

  document.querySelectorAll('.choice-card').forEach((btn) => {
    btn.classList.toggle('choice-card--selected', btn.dataset.choiceId === choiceId);
  });

  const total = DG.mission.components.length;
  const done = Object.keys(DG.inspectionState.inspectedComponents || {}).length;
  updateSubmitButton(done >= total);
}

/* ---------------------------------------------------------
   Submit Diagnosis gate — requires full inspection AND a
   selected choice. Never reveals correct/incorrect here.
   --------------------------------------------------------- */
function updateSubmitButton(complete) {
  const btn = document.getElementById('submitDiagnosisBtn');
  btn.disabled = !(complete && DG.selectedChoiceId);
}

/* ---------------------------------------------------------
   Confirmation modal
   --------------------------------------------------------- */
function wireModal() {
  const submitBtn = document.getElementById('submitDiagnosisBtn');
  const overlay = document.getElementById('diagnosisModalOverlay');
  const cancelBtn = document.getElementById('modalCancelBtn');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const selectedText = document.getElementById('modalSelectedChoice');

  submitBtn.addEventListener('click', () => {
    if (submitBtn.disabled || !DG.selectedChoiceId) return;
    const choice = DG.mission.choices.find((c) => c.id === DG.selectedChoiceId);
    selectedText.textContent = choice ? choice.label : '—';
    overlay.classList.add('tf-modal-overlay--visible');
  });

  cancelBtn.addEventListener('click', () => {
    overlay.classList.remove('tf-modal-overlay--visible');
    // Selection is preserved — nothing to reset here.
  });

  confirmBtn.addEventListener('click', () => {
    persistDiagnosis();
    overlay.classList.remove('tf-modal-overlay--visible');
    Navigation.goTo('results.html');
  });
}

function persistDiagnosis() {
  Storage.saveDiagnosis({
    missionId: DG.mission.id,
    selectedDiagnosis: DG.selectedChoiceId,
    submittedAt: new Date().toISOString(),
  });
}

/* ---------------------------------------------------------
   Buttons available regardless of access-control state
   --------------------------------------------------------- */
function wireAlwaysOnButtons() {
  const goToTroubleshooting = () => Navigation.goTo('troubleshooting.html');

  const returnBtn = document.getElementById('returnToTroubleshootingBtn');
  if (returnBtn) returnBtn.addEventListener('click', goToTroubleshooting);

  const blockedReturnBtn = document.getElementById('blockedReturnBtn');
  if (blockedReturnBtn) blockedReturnBtn.addEventListener('click', goToTroubleshooting);
}
