export const ATTACHMENT_STORAGE_KEY = "qhse_shared_attachments";

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

export function writeAttachmentStore(items = []) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTACHMENT_STORAGE_KEY, JSON.stringify(items));
}

export function isImageAttachment(item) {
  return Boolean(item?.mimeType?.startsWith("image/") && item?.previewUrl);
}
