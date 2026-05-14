export const NOTIFICATION_PREFS_STORAGE_KEY = "qhse_notif_prefs";
export const NOTIFICATION_PREFS_EVENT = "qhse-notification-prefs-changed";

export const DEFAULT_NOTIFICATION_PREFS = {
  equipmentExpiry: true,
  approvalNcr: true,
  securityUpdate: false,
};

export function readNotificationPrefs() {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFS;
  }

  try {
    const savedPrefs = window.localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
    return {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(savedPrefs ? JSON.parse(savedPrefs) : {}),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function writeNotificationPrefs(nextPrefs) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(nextPrefs));
  window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFS_EVENT, { detail: nextPrefs }));
}
