/* =========================================================
   TechFix — storage.js
   Thin wrapper around localStorage so no other file talks
   to localStorage directly. Everything is namespaced under
   "techfix:" to avoid clashing with anything else on the
   same origin.
   ========================================================= */

const STORAGE_KEYS = {
  PLAYER: 'techfix:player',
  SELECTED_MISSION: 'techfix:selectedMissionId',
  INSPECTION_STATE: 'techfix:inspectionState',
  DIAGNOSIS: 'techfix:diagnosis',
};

const Storage = {
  /** Read and JSON-parse a key. Returns null if missing or invalid. */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error(`TechFix storage: failed to read "${key}"`, err);
      return null;
    }
  },

  /** JSON-stringify and save a value under a key. */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`TechFix storage: failed to save "${key}"`, err);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  getPlayer() {
    return Storage.get(STORAGE_KEYS.PLAYER);
  },

  savePlayer(player) {
    return Storage.set(STORAGE_KEYS.PLAYER, player);
  },

  clearPlayer() {
    Storage.remove(STORAGE_KEYS.PLAYER);
  },

  getSelectedMissionId() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MISSION);
  },

  setSelectedMissionId(missionId) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MISSION, missionId);
  },

  /**
   * Mission inspection state, written by the Troubleshooting screen and
   * read by the future Diagnosis screen. Scoped by missionId so state
   * from a different mission is never mistakenly reused.
   */
  getInspectionState(missionId) {
    const state = Storage.get(STORAGE_KEYS.INSPECTION_STATE);
    if (!state || state.missionId !== missionId) return null;
    return state;
  },

  saveInspectionState(state) {
    return Storage.set(STORAGE_KEYS.INSPECTION_STATE, state);
  },

  clearInspectionState() {
    Storage.remove(STORAGE_KEYS.INSPECTION_STATE);
  },

  /**
   * Selected diagnosis, written by the Diagnosis screen (Phase 4) and
   * read by the future Results screen. Scoped by missionId, same
   * pattern as getInspectionState/saveInspectionState above. This does
   * not touch or overwrite techfix:inspectionState — diagnosis data is
   * stored under its own key.
   */
  getDiagnosis(missionId) {
    const diagnosis = Storage.get(STORAGE_KEYS.DIAGNOSIS);
    if (!diagnosis || diagnosis.missionId !== missionId) return null;
    return diagnosis;
  },

  saveDiagnosis(diagnosis) {
    return Storage.set(STORAGE_KEYS.DIAGNOSIS, diagnosis);
  },

  /** Used by Results (Phase 5) "Retry Mission" to clear a stale diagnosis
   *  before the student re-attempts Troubleshooting. Mirrors clearInspectionState(). */
  clearDiagnosis() {
    Storage.remove(STORAGE_KEYS.DIAGNOSIS);
  },
};
