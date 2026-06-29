// js/modules/storage.js
// إدارة التخزين مع تشفير بسيط (للتوضيح، استخدم crypto-js في الإنتاج)

const STORAGE_KEY = "brainmed_data";
const SESSION_KEY = "brainmed_session";

// تشفير بسيط (ضعيف، استخدم خوارزمية قوية في الإنتاج)
function encrypt(data) {
  return btoa(JSON.stringify(data));
}

function decrypt(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch (e) {
    return null;
  }
}

export function saveData(key, data) {
  const all = getData();
  all[key] = data;
  localStorage.setItem(STORAGE_KEY, encrypt(all));
}

export function getData(key = null) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all = raw ? decrypt(raw) : {};
  return key ? all[key] : all;
}

export function removeData(key) {
  const all = getData();
  delete all[key];
  localStorage.setItem(STORAGE_KEY, encrypt(all));
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

// جلسة المستخدم
export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, encrypt(user));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? decrypt(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// تحليل واحد
export function saveCurrentResult(result) {
  saveData("current_result", result);
}

export function getCurrentResult() {
  return getData("current_result");
}

// قائمة التحليلات
export function getAnalyses() {
  return getData("analyses") || [];
}

export function saveAnalyses(analyses) {
  saveData("analyses", analyses);
}

export function addAnalysis(analysis) {
  const analyses = getAnalyses();
  analyses.unshift(analysis);
  saveAnalyses(analyses);
}

export function deleteAnalysis(id) {
  let analyses = getAnalyses();
  analyses = analyses.filter((a) => a.id !== id);
  saveAnalyses(analyses);
}

export function getAnalysisById(id) {
  const analyses = getAnalyses();
  return analyses.find((a) => a.id === id) || null;
}

// إعدادات المستخدم
export function getSettings() {
  return getData("settings") || { geminiApiKey: "", language: "ar" };
}

export function saveSettings(settings) {
  saveData("settings", settings);
}
