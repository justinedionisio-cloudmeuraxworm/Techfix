/* =========================================================
   TechFix — mission-briefing.js (page script)
   Reads the mission id set by Home/How-to-Play and renders
   its data. No data is hardcoded here — everything comes
   from js/data/missions.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return;

  Navbar.render(player);
  DashboardSidebar.render(player);

  const missionId = Storage.getSelectedMissionId() || MISSIONS[0].id;
  const mission = getMissionById(missionId);

  renderMission(mission);
  wireButtons(mission);
});

function renderMission(mission) {
  document.getElementById('missionHeaderTitle').textContent = `Mission 1: ${mission.title}`;
  document.getElementById('briefDifficulty').textContent = mission.difficulty;
  document.getElementById('briefTime').textContent = `⏱ ${mission.estimatedMinutes} Minutes`;
  document.getElementById('briefXp').textContent = `+${mission.rewardXp}`;
  document.getElementById('briefCoins').textContent = `+${mission.rewardCoins}`;
  document.getElementById('briefScenario').textContent = mission.scenario;

  const learningList = document.getElementById('briefLearningObjectives');
  learningList.innerHTML = mission.learningObjectives
    .map((item) => `<li class="checklist-item"><span class="checklist-item__check">•</span>${item}</li>`)
    .join('');

  const equipmentGrid = document.getElementById('briefEquipment');
  equipmentGrid.innerHTML = mission.equipment
    .map(
      (tool) => `
      <div class="equipment-item">
        <div class="equipment-item__icon">${tool.icon}</div>
        <span class="equipment-item__label">${tool.name}</span>
      </div>`
    )
    .join('');

  const objectivesList = document.getElementById('briefMissionObjectives');
  objectivesList.innerHTML = mission.objectives
    .map((item) => `<li class="checklist-item"><span class="checklist-item__check">✔</span>${item}</li>`)
    .join('');
}

function wireButtons(mission) {
  document.getElementById('backBtn').addEventListener('click', () => {
    Navigation.goTo('home.html');
  });

  document.getElementById('beginTroubleshootingBtn').addEventListener('click', () => {
    Storage.setSelectedMissionId(mission.id);
    Navigation.goTo('troubleshooting.html');
  });
}
