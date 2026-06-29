// js/modules/ui.js

export function showToast(message, type = "info") {
  const container =
    document.getElementById("toastContainer") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const iconMap = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };
  toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s";
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

export function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("ar-EG", options);
}

export function getFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getFileType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const types = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    gif: "GIF",
    webp: "WEBP",
    edf: "EDF",
    bdf: "BDF",
  };
  return types[ext] || "Unknown";
}

export function generateHash() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 32; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export function generateHotspotsFromRegions(
  regions,
  imgWidth = 500,
  imgHeight = 500,
) {
  // ديناميكية بناءً على حجم الصورة
  const positions = {
    frontal: { x: 0.35, y: 0.25 },
    temporal: { x: 0.2, y: 0.5 },
    parietal: { x: 0.65, y: 0.4 },
    occipital: { x: 0.5, y: 0.7 },
    generalized: { x: 0.5, y: 0.5 },
    all: { x: 0.5, y: 0.5 },
  };
  if (regions.length === 0) return [];
  return regions.map((region, index) => {
    const lower = region.toLowerCase();
    let pos = positions.all;
    if (lower.includes("frontal")) pos = positions.frontal;
    else if (lower.includes("temporal")) pos = positions.temporal;
    else if (lower.includes("parietal")) pos = positions.parietal;
    else if (lower.includes("occipital")) pos = positions.occipital;
    else if (lower.includes("generalized")) pos = positions.generalized;
    return {
      id: index,
      x: pos.x * imgWidth + (Math.random() - 0.5) * 20,
      y: pos.y * imgHeight + (Math.random() - 0.5) * 20,
      color: ["#f44336", "#ff9800", "#9c27b0", "#2196f3", "#4caf50"][index % 5],
      label: region,
      name: region,
      severity: "متوسطة",
      cause: "نشاط غير طبيعي في المنطقة " + region,
      treatment: "استشارة طبيب أعصاب متخصص",
      description: "نشاط غير طبيعي في المنطقة " + region,
    };
  });
}
