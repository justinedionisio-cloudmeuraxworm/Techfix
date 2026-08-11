/* =========================================================
   TechFix — home.js (page script)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return; // redirecting to login

  Navbar.render(player);
  DashboardSidebar.render(player);
  renderMissionCard();
  renderMissionProgress(player);
  wireButtons();
});

function renderMissionCard() {
  const mission = MISSIONS[0];
  if (!mission) return;

  document.getElementById('missionTitle').textContent = mission.title;
  document.getElementById('missionDifficulty').textContent = mission.difficulty;
  document.getElementById('missionTime').textContent = `⏱ ${mission.estimatedMinutes} Minutes`;
  document.getElementById('missionXp').textContent = `+${mission.rewardXp}`;
  document.getElementById('missionCoins').textContent = `+${mission.rewardCoins}`;
}

function renderMissionProgress(player) {
  const label = document.getElementById('missionProgressLabel');
  const fill = document.getElementById('missionProgressFill');
  const pct = Math.round((player.missionsCompleted / player.totalMissions) * 100);

  label.textContent = `${player.missionsCompleted} / ${player.totalMissions} Missions Completed`;
  fill.style.width = `${pct}%`;
}

function wireButtons() {
  document.getElementById('startMissionBtn').addEventListener('click', () => {
    Storage.setSelectedMissionId(MISSIONS[0].id);
    Navigation.goTo('mission-briefing.html');
  });

  document.getElementById('achievementsTile').addEventListener('click', () => {
    Navigation.notReady('Achievements');
  });

  document.getElementById('profileTile').addEventListener('click', () => {
    Navigation.notReady('Profile');
  });

  document.getElementById('settingsTile').addEventListener('click', () => {
    Navigation.notReady('Settings');
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    Navigation.notReady('Settings');
  });

  // "How to Play" now has a real page — let the <a href> navigate normally.
}
