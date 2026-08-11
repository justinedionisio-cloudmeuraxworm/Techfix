/* =========================================================
   TechFix — login.js (page script)
   Mock "Continue with Google" flow. No real OAuth yet — this
   just creates (or reuses) a local player profile and sends
   the student to Home. The single line marked below is the
   only place a real Google Sign-In call would plug in later.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // If a profile already exists, skip straight to Home.
  if (Storage.getPlayer()) {
    Navigation.goTo('home.html');
    return;
  }

  const btn = document.getElementById('googleSignInBtn');
  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    // --- Mock sign-in step (replace with real Google auth later) ---
    Player.getOrCreate();
    // -----------------------------------------------------------------

    setTimeout(() => {
      Navigation.goTo('home.html');
    }, 500);
  });
});
