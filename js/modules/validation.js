// js/modules/validation.js

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateAge(age) {
  const num = parseInt(age);
  return !isNaN(num) && num >= 0 && num <= 120;
}

export function validateName(name) {
  return name && name.trim().length > 0;
}

export function validateFile(file, maxSize = 5 * 1024 * 1024) {
  if (!file) return false;
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "نوع الملف غير مدعوم. استخدم JPEG, PNG, GIF, أو WEBP",
    };
  }
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `حجم الملف يتجاوز الحد الأقصى (${maxSize / 1024 / 1024} MB)`,
    };
  }
  return { valid: true };
}
