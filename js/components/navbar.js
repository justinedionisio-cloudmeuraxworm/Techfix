/* =========================================================
   TechFix — navbar.js
   Fills in the top bar's profile chip (avatar initial, name,
   level badge) from the stored player. Expects the page's
   HTML to already contain a topbar with elements carrying
   the data-tf-* hooks below.
   ========================================================= */

const Navbar = {
  render(player) {
    const avatarEl = document.querySelector('[data-tf-navbar-avatar]');
    const nameEl = document.querySelector('[data-tf-navbar-name]');
    const levelEl = document.querySelector('[data-tf-navbar-level]');

    if (avatarEl) avatarEl.textContent = Player.getInitial(player);
    if (nameEl) nameEl.textContent = player.name;
    if (levelEl) levelEl.textContent = `Level ${player.level}`;
  },
};
