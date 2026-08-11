/* =========================================================
   TechFix — player.js
   Defines the player's default state and small read-only
   helpers. XP-award / level-up / badge-unlock logic will be
   built out in the Diagnosis & Results phase — for now this
   only creates and reads the profile used by Home/Login.
   ========================================================= */

const Player = {
  /** Default profile created right after mock Google sign-in. */
  createDefaultProfile() {
    return {
      name: 'Student',
      level: 1,
      rank: 'Beginner',
      xp: 0,
      xpToNextLevel: 1000,
      techCoins: 0,
      troubleshootingAccuracy: 0,
      missionsCompleted: 0,
      totalMissions: 10,
      badges: [],
      signedInAt: new Date().toISOString(),
    };
  },

  /** Get the current player, creating one if this is a first visit. */
  getOrCreate() {
    let player = Storage.getPlayer();
    if (!player) {
      player = Player.createDefaultProfile();
      Storage.savePlayer(player);
    }
    return player;
  },

  getInitial(player) {
    return (player?.name || 'S').charAt(0).toUpperCase();
  },

  /**
   * Add XP to the player, rolling over into level-ups as needed.
   * Mutates the given player object and returns whether a level-up
   * occurred (and the before/after levels) so the caller can show a
   * Level Up message. Does not save — call Storage.savePlayer(player)
   * once all reward fields for the result have been applied.
   */
  addXp(player, amount) {
    const previousLevel = player.level;
    player.xp += amount;
    while (player.xp >= player.xpToNextLevel) {
      player.xp -= player.xpToNextLevel;
      player.level += 1;
    }
    return { leveledUp: player.level > previousLevel, previousLevel, newLevel: player.level };
  },

  /** Add Tech Coins to the player. */
  addTechCoins(player, amount) {
    player.techCoins += amount;
  },

  /** Award a named badge if the player doesn't already have it. Returns whether it was newly added. */
  awardBadge(player, badgeName) {
    if (!player.badges.includes(badgeName)) {
      player.badges.push(badgeName);
      return true;
    }
    return false;
  },

  /** Mark one mission completed, capped at totalMissions. */
  completeMission(player) {
    player.missionsCompleted = Math.min(player.missionsCompleted + 1, player.totalMissions);
  },
};
