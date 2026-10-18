/**
 * Roster staff ELISEE SCOUT.
 * Admin Executive: Eliseo. Responsabile Privacy: Manuel Tucci.
 */
(function (root) {
  var ADMIN = [
    'eliseomiraglia2704@gmail.com',
    'areaeliseescout@gmail.com',
    'elisee.scout@platform-calcio.it',
    'alessandromancini469@gmail.com'
  ];
  var PRIVACY = [
    'manueltucci2002@gmail.com'
  ];
  function n(e) { return String(e || '').trim().toLowerCase(); }
  var api = {
    ADMIN_EMAILS: ADMIN,
    PRIVACY_EMAILS: PRIVACY,
    normalize: n,
    isAdminEmail: function (email) {
      var e = n(email);
      if (!e) return false;
      if (ADMIN.indexOf(e) >= 0) return true;
      return e.indexOf('eliseomiraglia2704') >= 0;
    },
    isPrivacyEmail: function (email) {
      return PRIVACY.indexOf(n(email)) >= 0;
    },
    isStaffEmail: function (email) {
      return api.isAdminEmail(email) || api.isPrivacyEmail(email);
    },
    roleForEmail: function (email) {
      if (api.isPrivacyEmail(email)) return 'privacy';
      if (api.isAdminEmail(email)) return 'admin';
      return null;
    },
    displayRole: function (email) {
      var r = api.roleForEmail(email);
      if (r === 'privacy') return 'Responsabile Privacy';
      if (r === 'admin') return 'Admin Executive';
      return '';
    },
    // L'email serve solo per etichette e scorciatoie: i permessi staff
    // arrivano esclusivamente dal token del server (window.EliseeAdmin).
    applyFlagsFromEmail: function (email) {
      return api.roleForEmail(email);
    }
  };
  root.EliseeStaff = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
