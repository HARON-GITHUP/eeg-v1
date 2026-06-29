// js/modules/auth.js
import {
  saveSession,
  getSession,
  clearSession,
  getData,
  saveData,
} from "./storage.js";
import { showToast } from "./ui.js";
import { validateEmail, validatePassword } from "./validation.js";

// مستخدمين افتراضيين (للمشرف)
const DEFAULT_USERS = [
  {
    email: "admin@brainmed.com",
    password: "admin123",
    name: "المشرف",
    role: "admin",
  },
  {
    email: "doctor@hospital.com",
    password: "doctor123",
    name: "د. أحمد",
    role: "user",
  },
];

export function initAuth() {
  // إنشاء المستخدمين الافتراضيين إذا لم يوجد
  if (!getData("users")) {
    saveData("users", DEFAULT_USERS);
  }

  // حماية الصفحات
  const protectedPages = [
    "dashboard.html",
    "upload.html",
    "history.html",
    "reports.html",
    "results.html",
    "settings.html",
    "admin.html",
  ];
  const currentPage = window.location.pathname.split("/").pop();
  if (protectedPages.includes(currentPage)) {
    const user = getSession();
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    // التحقق من صلاحية المشرف لصفحة admin
    if (currentPage === "admin.html" && user.role !== "admin") {
      showToast("⚠️ غير مصرح لك بالدخول إلى لوحة الإدارة", "error");
      window.location.href = "dashboard.html";
      return;
    }
    // عرض اسم المستخدم
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) userNameDisplay.textContent = user.name;
  }
}

export function login(email, password) {
  if (!validateEmail(email)) {
    showToast("⚠️ البريد الإلكتروني غير صحيح", "error");
    return false;
  }
  if (!validatePassword(password)) {
    showToast("⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
    return false;
  }
  const users = getData("users") || [];
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    const { password, ...safeUser } = user; // إزالة كلمة المرور من الجلسة
    saveSession(safeUser);
    showToast(`✅ مرحباً ${safeUser.name}`, "success");
    window.location.href = "dashboard.html";
    return true;
  } else {
    showToast("⚠️ البريد أو كلمة المرور غير صحيحة", "error");
    return false;
  }
}

export function register(name, email, password, confirm) {
  if (!name.trim()) {
    showToast("⚠️ الرجاء إدخال الاسم", "error");
    return false;
  }
  if (!validateEmail(email)) {
    showToast("⚠️ البريد الإلكتروني غير صحيح", "error");
    return false;
  }
  if (!validatePassword(password)) {
    showToast("⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
    return false;
  }
  if (password !== confirm) {
    showToast("⚠️ كلمات المرور غير متطابقة", "error");
    return false;
  }
  const users = getData("users") || [];
  if (users.find((u) => u.email === email)) {
    showToast("⚠️ هذا البريد مستخدم بالفعل", "error");
    return false;
  }
  const newUser = { email, password, name, role: "user" };
  users.push(newUser);
  saveData("users", users);
  const { password: _, ...safeUser } = newUser;
  saveSession(safeUser);
  showToast(`✅ تم إنشاء الحساب بنجاح، مرحباً ${name}`, "success");
  window.location.href = "dashboard.html";
  return true;
}

export function logout() {
  clearSession();
  showToast("تم تسجيل الخروج", "info");
  window.location.href = "login.html";
}

export function getCurrentUser() {
  return getSession();
}

export function isAdmin() {
  const user = getSession();
  return user && user.role === "admin";
}

// تغيير كلمة المرور (للمستخدم)
export function changePassword(oldPassword, newPassword, confirm) {
  const user = getSession();
  if (!user) {
    showToast("⚠️ يجب تسجيل الدخول أولاً", "error");
    return false;
  }
  const users = getData("users") || [];
  const found = users.find((u) => u.email === user.email);
  if (!found || found.password !== oldPassword) {
    showToast("⚠️ كلمة المرور الحالية غير صحيحة", "error");
    return false;
  }
  if (newPassword.length < 6) {
    showToast("⚠️ كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل", "error");
    return false;
  }
  if (newPassword !== confirm) {
    showToast("⚠️ كلمات المرور غير متطابقة", "error");
    return false;
  }
  found.password = newPassword;
  saveData("users", users);
  showToast("✅ تم تغيير كلمة المرور بنجاح", "success");
  return true;
}
