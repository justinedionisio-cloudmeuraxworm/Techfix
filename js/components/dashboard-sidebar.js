/* =========================================================
   TechFix — dashboard-sidebar.js
   Fills in the "Player Dashboard" card (avatar, XP bar, rank,
   Tech Coins, Troubleshooting %) from the stored player.
   ========================================================= */

const DashboardSidebar = {
  render(player) {
    const root = document.querySelector('[data-tf-dashboard]');
    if (!root) return;

    const avatarEl = root.querySelector('[data-tf-dash-avatar]');
    const nameEl = root.querySelector('[data-tf-dash-name]');
    const levelEl = root.querySelector('[data-tf-dash-level]');
    const xpLabelEl = root.querySelector('[data-tf-dash-xp-label]');
    const xpFillEl = root.querySelector('[data-tf-dash-xp-fill]');
    const rankEl = root.querySelector('[data-tf-dash-rank]');
    const coinsEl = root.querySelector('[data-tf-dash-coins]');
    const accuracyEl = root.querySelector('[data-tf-dash-accuracy]');

    if (avatarEl) avatarEl.textContent = Player.getInitial(player);
    if (nameEl) nameEl.textContent = player.name;
    if (levelEl) levelEl.textContent = `Level ${player.level}`;
    if (xpLabelEl) xpLabelEl.textContent = `${player.xp}/${player.xpToNextLevel} XP`;
    if (xpFillEl) {
      const pct = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));
      xpFillEl.style.width = `${pct}%`;
    }
    if (rankEl) rankEl.textContent = player.rank;
    if (coinsEl) coinsEl.textContent = player.techCoins;
    if (accuracyEl) accuracyEl.textContent = `${player.troubleshootingAccuracy}%`;
  },
};
