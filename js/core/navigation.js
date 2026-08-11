/* =========================================================
   TechFix — navigation.js
   TechFix is a plain multi-page site (no SPA router). These
   helpers keep page-to-page redirects and the "is someone
   signed in?" check in one place instead of repeated per page.
   ========================================================= */

const Navigation = {
  /** Send the visitor back to login if no player profile exists yet. */
  requireAuth() {
    const player = Storage.getPlayer();
    if (!player) {
      window.location.href = 'index.html';
      return null;
    }
    return player;
  },

  goTo(page) {
    window.location.href = page;
  },

  /** Placeholder for screens not built yet in this phase. */
  notReady(featureName) {
    Navigation.showToast(`${featureName} is coming in the next build phase.`);
  },

  /** Small transient message, used instead of a blocking alert(). */
  showToast(message) {
    let toast = document.querySelector('.tf-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'tf-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('tf-toast--visible');
    clearTimeout(Navigation._toastTimer);
    Navigation._toastTimer = setTimeout(() => {
      toast.classList.remove('tf-toast--visible');
    }, 2200);
  },
};
