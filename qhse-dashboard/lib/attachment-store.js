export const ATTACHMENT_STORAGE_KEY = "qhse_shared_attachments";
const ATTACHMENT_STORE_EVENT = "qhse-attachments-updated";

let lastSeedKey = null;
let lastRawValue = null;
let lastSnapshot = null;

export function mergeAttachments(seedItems = [], storedItems = []) {
  const map = new Map();

  [...seedItems, ...storedItems].forEach((item) => {
    if (item?.id) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values()).sort(
    (left, right) => new Date(right.uploadedAt || 0).getTime() - new Date(left.uploadedAt || 0).getTime(),
  );
}

export function readAttachmentStore(seedItems = []) {
  if (typeof window === "undefined") return seedItems;

  try {
    const raw = window.localStorage.getItem(ATTACHMENT_STORAGE_KEY);
    const storedItems = raw ? JSON.parse(raw) : [];
    return mergeAttachments(seedItems, storedItems);
  } catch {
    return seedItems;
  }
}

export function getAttachmentSnapshot(seedItems = []) {
  if (typeof window === "undefined") return seedItems;

  const seedKey = JSON.stringify(seedItems || []);
  const raw = window.localStorage.getItem(ATTACHMENT_STORAGE_KEY) || "[]";

  if (lastSnapshot && lastSeedKey === seedKey && lastRawValue === raw) {
    return lastSnapshot;
  }

  try {
    const storedItems = JSON.parse(raw);
    lastSnapshot = mergeAttachments(seedItems, storedItems);
  } catch {
    lastSnapshot = seedItems;
  }

  lastSeedKey = seedKey;
  lastRawValue = raw;

  return lastSnapshot;
}

export function subscribeAttachmentStore(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener("storage", handler);
  window.addEventListener(ATTACHMENT_STORE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(ATTACHMENT_STORE_EVENT, handler);
  };
}

export function writeAttachmentStore(items = []) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTACHMENT_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(ATTACHMENT_STORE_EVENT));
}

export function isImageAttachment(item) {
  return Boolean(item?.mimeType?.startsWith("image/") && item?.previewUrl);
}
