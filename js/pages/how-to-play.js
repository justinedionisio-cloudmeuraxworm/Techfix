/* =========================================================
   TechFix — how-to-play.js (page script)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const player = Navigation.requireAuth();
  if (!player) return;

  Navbar.render(player);

  document.getElementById('backHomeBtn').addEventListener('click', () => {
    Navigation.goTo('home.html');
  });

  document.getElementById('startFirstMissionBtn').addEventListener('click', () => {
    Storage.setSelectedMissionId(MISSIONS[0].id);
    Navigation.goTo('mission-briefing.html');
  });
});
