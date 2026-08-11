/* =========================================================
   TechFix — results.js (page script)
   Phase 5 gameplay: compares the diagnosis saved by Phase 4
   against the correct choice in missions.js, shows an
   evidence recap built from the Phase 3 inspection state, and
   (for a correct diagnosis) awards XP / Tech Coins / a badge /
   mission completion through the existing player.js system —
   exactly once per submission, even across page refreshes.
   No second XP/level/mission-progress system is created here.
   ========================================================= */

const RS = {
  mission: null,
  inspectionState: null,
  diagnosis: null,
  isCorrect: false,
};

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return;

  const missionId = Storage.getSelectedMissionId() || MISSIONS[0].id;
  RS.mission = getMissionById(missionId);
  RS.inspectionState = Storage.getInspectionState(RS.mission.id);
  RS.diagnosis = Storage.getDiagnosis(RS.mission.id);

  document.getElementById('missionHeaderTitle').textContent = `Mission 1: ${RS.mission.title}`;

  // ---- Access control: no submitted diagnosis for this mission ----
  // The student must not see a "result" for a mission they never
  // finished diagnosing (e.g. opening results.html directly).
  if (!RS.diagnosis) {
    renderBlockedState();
    Navbar.render(player);
    DashboardSidebar.render(player);
    return;
  }

  const correctChoice = RS.mission.choices.find((c) => c.correct);
  const selectedChoice = RS.mission.choices.find((c) => c.id === RS.diagnosis.selectedDiagnosis);
  RS.isCorrect = !!(selectedChoice && selectedChoice.correct === true);

  // Process rewards exactly once per submission, then always read the
  // (possibly just-updated) player back from storage so the navbar /
  // dashboard reflect the true current state either way.
  processResultOnce(correctChoice, selectedChoice);
  const currentPlayer = Storage.getPlayer();
  Navbar.render(currentPlayer);
  DashboardSidebar.render(currentPlayer);

  renderResultBanner();
  renderDiagnosisRecap(selectedChoice, correctChoice);
  renderEvidenceRecap();
  renderFeedback();
  renderPerformance();
  renderRewardsRecap();
  renderLevelUp();
  renderActionBar();
});

/* ---------------------------------------------------------
   Blocked state — no diagnosis has been submitted yet
   --------------------------------------------------------- */
function renderBlockedState() {
  document.getElementById('blockedCard').style.display = '';

  // Send the student to wherever they actually left off.
  const total = RS.mission.components.length;
  const done = RS.inspectionState ? Object.keys(RS.inspectionState.inspectedComponents || {}).length : 0;
  const target = done >= total ? 'diagnosis.html' : 'troubleshooting.html';

  document.getElementById('blockedMessage').textContent =
    done >= total
      ? 'Complete your diagnosis before viewing results.'
      : 'Complete the troubleshooting inspection first.';

  document.getElementById('blockedActionBtn').addEventListener('click', () => {
    Navigation.goTo(target);
  });
}

/* ---------------------------------------------------------
   Reward processing — runs the correctness check and, only
   the first time a submission is viewed, applies XP / coins /
   badge / mission-completion through the existing player.js
   helpers. On every later view (e.g. a refresh) it re-reads the
   outcome that was already recorded instead of re-awarding.
   --------------------------------------------------------- */
function processResultOnce(correctChoice, selectedChoice) {
  if (RS.diagnosis.rewardProcessed) return; // already handled — do not re-award

  const outcome = {
    rewardProcessed: true,
    result: RS.isCorrect ? 'correct' : 'incorrect',
    xpAwarded: 0,
    coinsAwarded: 0,
    badgeAwarded: null,
    leveledUp: false,
    previousLevel: null,
    newLevel: null,
  };

  if (RS.isCorrect) {
    const player = Storage.getPlayer();

    const xpResult = Player.addXp(player, RS.mission.rewardXp);
    Player.addTechCoins(player, RS.mission.rewardCoins);
    const badgeWasNew = Player.awardBadge(player, 'Hardware Rookie');
    Player.completeMission(player);
    Storage.savePlayer(player);

    outcome.xpAwarded = RS.mission.rewardXp;
    outcome.coinsAwarded = RS.mission.rewardCoins;
    outcome.badgeAwarded = badgeWasNew ? 'Hardware Rookie' : null;
    outcome.leveledUp = xpResult.leveledUp;
    outcome.previousLevel = xpResult.previousLevel;
    outcome.newLevel = xpResult.newLevel;
  }

  RS.diagnosis = { ...RS.diagnosis, ...outcome };
  Storage.saveDiagnosis(RS.diagnosis);
}

/* ---------------------------------------------------------
   Result banner
   --------------------------------------------------------- */
function renderResultBanner() {
  const banner = document.getElementById('resultBanner');
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultTitle');
  const subtitle = document.getElementById('resultSubtitle');

  banner.style.display = 'flex';
  banner.classList.toggle('result-banner--needs-review', !RS.isCorrect);

  if (RS.isCorrect) {
    icon.textContent = '✅';
    title.textContent = 'Diagnosis Correct!';
    subtitle.textContent = 'Great work tracking down the problem.';
  } else {
    icon.textContent = '🔎';
    title.textContent = 'Diagnosis Needs Review';
    subtitle.textContent = "That's not quite it — review the evidence below and try again.";
  }
}

/* ---------------------------------------------------------
   Diagnosis recap — your answer vs. the correct one, only
   ever revealed here on the Results screen.
   --------------------------------------------------------- */
function renderDiagnosisRecap(selectedChoice, correctChoice) {
  document.getElementById('diagnosisRecapCard').style.display = '';
  document.getElementById('yourDiagnosisText').textContent = selectedChoice ? selectedChoice.label : '—';
  document.getElementById('correctDiagnosisText').textContent = correctChoice ? correctChoice.label : '—';
}

/* ---------------------------------------------------------
   Evidence recap — built entirely from the saved Phase 3
   inspection state, never hardcoded.
   --------------------------------------------------------- */
function renderEvidenceRecap() {
  const card = document.getElementById('evidenceRecapCard');
  const list = document.getElementById('evidenceRecapList');
  const inspected = (RS.inspectionState && RS.inspectionState.inspectedComponents) || {};

  card.style.display = '';

  list.innerHTML = RS.mission.components.map((component) => {
    const result = inspected[component.id];

    let mark = '○';
    let markClass = 'evidence-item__mark--pending';
    let statusClass = 'evidence-item__status--pending';
    let statusText = 'Not Inspected';

    if (result) {
      const isProblem = result.status === 'problem';
      mark = isProblem ? '⚠' : '✓';
      markClass = isProblem ? 'evidence-item__mark--problem' : 'evidence-item__mark--normal';
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
}

/* ---------------------------------------------------------
   Educational feedback — from mission.feedback in missions.js,
   never a separately invented explanation.
   --------------------------------------------------------- */
function renderFeedback() {
  document.getElementById('feedbackCard').style.display = '';
  document.getElementById('feedbackHeader').textContent = RS.isCorrect
    ? '📚 Why This Diagnosis Is Correct'
    : '📚 What The Evidence Actually Shows';
  document.getElementById('feedbackText').textContent = RS.mission.feedback.whyCorrect;

  const tipsList = document.getElementById('feedbackTipsList');
  tipsList.innerHTML = RS.mission.feedback.tips.map(
    (tip) => `<div class="tip-item"><span class="tip-item__icon">💡</span><span>${tip}</span></div>`
  ).join('');
}

/* ---------------------------------------------------------
   Performance — Mission 1 has a single diagnosis decision, so
   accuracy is 100% or 0%, never a misleading fractional score.
   --------------------------------------------------------- */
function renderPerformance() {
  document.getElementById('performanceCard').style.display = '';

  const total = RS.mission.components.length;
  const inspected = (RS.inspectionState && RS.inspectionState.inspectedComponents) || {};
  const done = Object.keys(inspected).length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('perfDiagnosisAccuracy').textContent = RS.isCorrect ? '100%' : '0%';
  document.getElementById('perfTroubleshootingCompletion').textContent = `${completionPct}%`;
}

/* ---------------------------------------------------------
   Rewards recap — values come from the outcome recorded by
   processResultOnce(), which itself pulled them from mission
   data. Nothing here re-derives or re-awards anything.
   --------------------------------------------------------- */
function renderRewardsRecap() {
  const card = document.getElementById('rewardsCard');
  const header = document.getElementById('rewardsHeader');
  const badgeRow = document.getElementById('rewardsBadgeRow');
  const badgeName = document.getElementById('rewardsBadgeName');

  card.style.display = '';
  card.classList.toggle('card--gradient-gold', RS.isCorrect);

  header.textContent = RS.isCorrect ? '🎉 Mission Complete' : '🙂 Keep Practicing';
  document.getElementById('rewardsXp').textContent = `+${RS.diagnosis.xpAwarded || 0}`;
  document.getElementById('rewardsCoins').textContent = `+${RS.diagnosis.coinsAwarded || 0}`;

  if (RS.isCorrect && RS.diagnosis.badgeAwarded) {
    badgeName.textContent = RS.diagnosis.badgeAwarded;
    badgeRow.style.display = 'flex';
  } else {
    badgeRow.style.display = 'none';
  }
}

/* ---------------------------------------------------------
   Level up — only shown if the recorded outcome says so.
   --------------------------------------------------------- */
function renderLevelUp() {
  if (!RS.diagnosis.leveledUp) return;

  document.getElementById('levelUpCard').style.display = '';
  document.getElementById('levelUpFrom').textContent = `Level ${RS.diagnosis.previousLevel}`;
  document.getElementById('levelUpTo').textContent = `Level ${RS.diagnosis.newLevel}`;
}

/* ---------------------------------------------------------
   Next actions
   --------------------------------------------------------- */
function renderActionBar() {
  document.getElementById('resultsActionBar').style.display = 'flex';

  document.getElementById('returnHomeBtn').addEventListener('click', () => {
    Navigation.goTo('home.html');
  });

  const primaryBtn = document.getElementById('primaryActionBtn');

  if (RS.isCorrect) {
    primaryBtn.textContent = '▶ Next Mission';
    primaryBtn.addEventListener('click', () => {
      // No Mission 2 exists yet — do not invent one.
      Navigation.showToast('More missions coming soon!');
      setTimeout(() => Navigation.goTo('home.html'), 1400);
    });
  } else {
    primaryBtn.textContent = '🔁 Retry Mission';
    primaryBtn.addEventListener('click', retryMission);
  }
}

/* ---------------------------------------------------------
   Retry — clears this mission's inspection state and
   diagnosis only, then sends the student back to a fresh
   Troubleshooting attempt. Never touches the player profile,
   XP, coins, badges, or completed-mission count.
   --------------------------------------------------------- */
function retryMission() {
  Storage.clearInspectionState();
  Storage.clearDiagnosis();
  Navigation.goTo('troubleshooting.html');
}
