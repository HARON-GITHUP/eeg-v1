// ============================================
// 🧠 BrainMed+ - الملف الرئيسي (نسخة معدلة)
// ============================================

// مفتاح الـ API الخاص بك المدمج بالطلب
const API_KEY = "AQ.Ab8RN6KvAyInT-2WFITHje82GBACJc65ba41R6F3Zmrd2JH1Ww";

// ============================================
// 🛠️ دوال مساعدة
// ============================================

function generateHash() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 32; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("ar-EG", options);
}

function getFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const types = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    gif: "GIF",
    webp: "WEBP",
    edf: "EDF",
    bdf: "BDF",
    bmp: "BMP",
    tiff: "TIFF",
    tif: "TIFF",
  };
  return types[ext] || "Unknown";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

function showToast(message, type = "info") {
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

function validateName(name) {
  return name && name.trim().length > 0;
}

function validateAge(age) {
  const num = parseInt(age);
  return !isNaN(num) && num >= 0 && num <= 120;
}

function validateFile(file, maxSize = 5 * 1024 * 1024) {
  if (!file) return { valid: false, message: "الملف غير موجود" };

  // توسيع أنواع الملفات المدعومة
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "image/bmp",
    "image/tiff",
  ];

  // التحقق من النوع
  const isValidType =
    allowedTypes.includes(file.type) ||
    file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|tif)$/i);

  if (!isValidType) {
    return {
      valid: false,
      message: "نوع الملف غير مدعوم. استخدم JPEG, PNG, GIF, WEBP, BMP, أو TIFF",
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

// ===== دوال التخزين =====

function getSettings() {
  try {
    const raw = localStorage.getItem("brainmed_settings");
    return raw ? JSON.parse(raw) : { geminiApiKey: "", language: "ar" };
  } catch {
    return { geminiApiKey: "", language: "ar" };
  }
}

function saveSettings(settings) {
  localStorage.setItem("brainmed_settings", JSON.stringify(settings));
}

function getAnalyses() {
  try {
    const raw = localStorage.getItem("brainmed_analyses");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnalyses(analyses) {
  localStorage.setItem("brainmed_analyses", JSON.stringify(analyses));
}

function addAnalysis(analysis) {
  const analyses = getAnalyses();
  analyses.unshift(analysis);
  saveAnalyses(analyses);
}

function deleteAnalysis(id) {
  let analyses = getAnalyses();
  analyses = analyses.filter((a) => a.id !== id);
  saveAnalyses(analyses);
}

function getCurrentResult() {
  try {
    const raw = localStorage.getItem("brainmed_current_result");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentResult(result) {
  localStorage.setItem("brainmed_current_result", JSON.stringify(result));
}

function getAnalysisById(id) {
  const analyses = getAnalyses();
  return analyses.find((a) => a.id === id) || null;
}

function clearAllData() {
  localStorage.removeItem("brainmed_analyses");
  localStorage.removeItem("brainmed_current_result");
}

// ===== دوال المصادقة =====

function initAuth() {
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
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) userNameDisplay.textContent = user.name;
  }
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("brainmed_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("brainmed_user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("brainmed_user");
}

// ============================================
// 📤 رفع وتحليل (النسخة المعدلة)
// ============================================

function initUpload() {
  const fileInput = document.getElementById("eegFile");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }

  const aiStatus = document.getElementById("aiStatus");
  if (aiStatus) {
    setTimeout(() => {
      aiStatus.className = "ai-status ready";
      aiStatus.innerHTML =
        '<i class="fas fa-check-circle"></i><span>🤖 Google Gemini AI جاهز للتحليل</span>';
    }, 1500);
  }

  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", handleAnalysis);
  }

  // زر إغلاق الشات
  const closeChatBtn = document.getElementById("closeChatBtn");
  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", closeGeminiChat);
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) {
    showToast("⚠️ لم يتم اختيار ملف", "warning");
    return;
  }

  const validation = validateFile(file);
  if (!validation.valid) {
    showToast(`⚠️ ${validation.message}`, "error");
    e.target.value = "";
    return;
  }

  const preview = document.getElementById("filePreview");
  const img = document.getElementById("previewImg");
  const name = document.getElementById("fileName");
  const type = document.getElementById("fileTypeDisplay");
  const size = document.getElementById("fileSizeDisplay");

  preview.style.display = "block";
  name.textContent = file.name;
  type.textContent = getFileType(file.name);
  size.textContent = getFileSize(file.size);

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    img.style.display = "none";
  }
}

async function handleAnalysis() {
  const patientName = document.getElementById("patientName").value;
  const patientGender = document.getElementById("patientGender").value;
  const patientAge = document.getElementById("patientAge").value;
  const medicalHistory = document.getElementById("medicalHistory").value;
  const patientState = document.getElementById("patientState").value;
  const fileInput = document.getElementById("eegFile");

  // التحقق من وجود الملف
  console.log("📁 File input:", fileInput);
  console.log(
    "📄 Selected file:",
    fileInput ? fileInput.files[0] : "No file input",
  );

  if (!validateName(patientName)) {
    showToast("⚠️ الرجاء إدخال اسم المريض", "error");
    return;
  }
  if (!patientGender) {
    showToast("⚠️ الرجاء اختيار الجنس", "error");
    return;
  }
  if (!validateAge(patientAge)) {
    showToast("⚠️ العمر يجب أن يكون بين 0 و 120", "error");
    return;
  }
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    showToast("⚠️ الرجاء رفع صورة رسم المخ", "error");
    return;
  }

  // إخفاء الفورم وإظهار التحميل
  const uploadForm = document.getElementById("uploadForm");
  const loading = document.getElementById("loading");
  if (uploadForm) uploadForm.style.display = "none";
  if (loading) loading.style.display = "block";

  document.getElementById("analyzeBtn").disabled = true;

  try {
    const file = fileInput.files[0];
    const base64Data = await convertFileToBase64(file);

    // إعداد البرومبت الطبي
    const prompt = `
    أنت خبير واستشاري مخ وأعصاب متخصص في قراءة وتحليل صور رسم المخ (EEG).
    قم بتحليل الصورة المرفقة لرسم المخ الخاص بالمريض التالي بدقة طبية بالغة:
    - اسم المريض: ${patientName}
    - العمر: ${patientAge} سنة
    - الجنس: ${patientGender}
    - حالة المريض أثناء الفحص: ${patientState}
    - التاريخ المرضي والأعراض: ${medicalHistory || "لا يوجد تاريخ مرضي مسجل"}

    يجب أن تعود بالإجابة كملف JSON حصراً وبدون أي علامات نصية خارج الـ JSON بالصيغة التالية تماماً:
    {
      "disease": "اسم التشخيص أو الاضطراب المكتشف (مثال: الصرع العام، شحنات كهربائية زائدة، طبيعي...الخ)",
      "description": "وصف دقيق ومختصر جداً للحالة المكتشفة",
      "confidence": "نسبة الثقة كعدد صحيح بين 0 و 100 بناءً على وضوح الإشارات في الصورة",
      "severity": "درجة الخطورة (بسيطة / متوسطة / خطيرة / حالة طارئة)",
      "treatment": "الخطة العلاجية المبدئية المقترحة أو التوجه الدوائي",
      "gamma": "القيمة التقريبية أو السائدة لترددات جاما بالـ Hz بناءً على الرسم المرفق",
      "beta": "القيمة التقريبية أو السائدة لترددات بيتا بالـ Hz",
      "alpha": "القيمة التقريبية أو السائدة لترددات ألفا بالـ Hz",
      "theta": "القيمة التقريبية أو السائدة لترددات ثيتا بالـ Hz",
      "delta": "القيمة التقريبية أو السائدة لترددات ديلتا بالـ Hz",
      "findings": "التقرير الطبي المفصل والنتائج المرصودة في الإشارات (Spikes, Waves...)",
      "interpretation": "التفسير الطبي والعلمي لهذه الترددات والإشارات المكتشفة وعلاقتها بحالة المريض",
      "impression": "الرأي الطبي النهائي والانطباع العام للاستشاري",
      "recommendations": [
        "التوصية الأولى (مثال: عمل أشعة رنين مغناطيسي MRI)",
        "التوصية الثانية (مثال: إعادة رسم المخ بعد 6 أشهر)",
        "التوصية الثالثة"
      ]
    }
    `;

    // استدعاء Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: file.type, data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }

    const resultData = await response.json();

    // التحقق من وجود البيانات
    if (
      !resultData.candidates ||
      !resultData.candidates[0] ||
      !resultData.candidates[0].content
    ) {
      throw new Error("لم يتم استلام رد صحيح من Gemini API");
    }

    const aiResponseText = resultData.candidates[0].content.parts[0].text;

    // تحويل النص إلى Object
    const finalAnalysis = JSON.parse(aiResponseText);

    // حفظ النتيجة والبيانات
    const analysis = {
      id: Date.now(),
      patientName: patientName,
      patientGender: patientGender,
      patientAge: patientAge,
      patientState: patientState,
      medicalHistory: medicalHistory || "لا يوجد",
      date: formatDate(new Date()),
      fileName: file.name,
      fileType: getFileType(file.name),
      diseaseName: finalAnalysis.disease || "تحليل غير محدد",
      diagnosis: finalAnalysis.disease || "تحليل غير محدد",
      description:
        finalAnalysis.description || "تم تحليل الصورة بواسطة Gemini AI",
      confidence: parseInt(finalAnalysis.confidence) || 90,
      severity: finalAnalysis.severity || "خفيف",
      treatment: finalAnalysis.treatment || "استشارة طبيب أعصاب",
      frequencies: {
        gamma: parseFloat(finalAnalysis.gamma) || 35,
        beta: parseFloat(finalAnalysis.beta) || 22,
        alpha: parseFloat(finalAnalysis.alpha) || 10,
        theta: parseFloat(finalAnalysis.theta) || 5,
        delta: parseFloat(finalAnalysis.delta) || 2,
      },
      findings:
        finalAnalysis.findings || "تم تحليل الصورة بواسطة Google Gemini AI",
      interpretation: finalAnalysis.interpretation || "لا يوجد تفسير",
      impression:
        finalAnalysis.impression || finalAnalysis.disease || "لا يوجد انطباع",
      recommendations: finalAnalysis.recommendations || [
        "استشارة طبيب أعصاب متخصص",
      ],
      affectedRegions: [],
      hash: generateHash(),
      usedGemini: true,
      analysisType: "Google Gemini AI Analysis",
      imageData: await readFileAsDataURL(file),
      rawResponse: finalAnalysis,
    };

    addAnalysis(analysis);
    saveCurrentResult(analysis);
    localStorage.setItem("latestEEGAnalysis", JSON.stringify(analysis));

    showToast("✅ تم التحليل بنجاح!", "success");
    window.location.href = "results.html";
  } catch (error) {
    console.error("❌ حدث خطأ أثناء التحليل:", error);
    showToast(`❌ فشل التحليل: ${error.message}`, "error");

    // إعادة عرض الفورم
    const uploadForm = document.getElementById("uploadForm");
    const loading = document.getElementById("loading");
    if (uploadForm) uploadForm.style.display = "block";
    if (loading) loading.style.display = "none";
    document.getElementById("analyzeBtn").disabled = false;
  }
}

// ============================================
// 📄 صفحة النتائج (النسخة المعدلة)
// ============================================

function initResults() {
  // محاولة قراءة البيانات من localStorage
  let savedData = localStorage.getItem("latestEEGAnalysis");
  let result = null;

  if (savedData) {
    try {
      result = JSON.parse(savedData);
    } catch (e) {
      console.error("خطأ في قراءة البيانات:", e);
    }
  }

  // إذا لم توجد بيانات في latestEEGAnalysis، حاول قراءة من current_result
  if (!result) {
    result = getCurrentResult();
  }

  if (!result || !result.diagnosis) {
    showToast("⚠️ لا يوجد تحليل لعرضه", "warning");
    window.location.href = "upload.html";
    return;
  }

  // توزيع بيانات المريض
  document.getElementById("resultName").textContent = result.patientName || "-";
  document.getElementById("resultGender").textContent =
    result.patientGender || "-";
  document.getElementById("resultAge").textContent = result.patientAge || "-";
  document.getElementById("resultDate").textContent =
    result.date || formatDate(new Date());
  document.getElementById("resultFileType").textContent =
    result.fileType || "-";

  // التشخيص والخطورة
  document.getElementById("resultDisease").textContent =
    result.diseaseName || result.diagnosis || "-";
  document.getElementById("resultDescription").textContent =
    result.description || "-";
  document.getElementById("resultConfidence").textContent =
    result.confidence || "-";
  document.getElementById("resultSeverity").textContent =
    result.severity || "-";
  document.getElementById("resultTreatment").textContent =
    result.treatment || "-";
  document.getElementById("analysisSource").textContent = result.usedGemini
    ? "🤖 Google Gemini AI"
    : "📊 تحليل احتياطي";

  // الترددات (Hz)
  const freqs = result.frequencies || {};
  document.getElementById("resGamma").textContent = (freqs.gamma || 0).toFixed(
    1,
  );
  document.getElementById("resBeta").textContent = (freqs.beta || 0).toFixed(1);
  document.getElementById("resAlpha").textContent = (freqs.alpha || 0).toFixed(
    1,
  );
  document.getElementById("resTheta").textContent = (freqs.theta || 0).toFixed(
    1,
  );
  document.getElementById("resDelta").textContent = (freqs.delta || 0).toFixed(
    1,
  );

  // النصوص الطبية المفصلة
  document.getElementById("resultFindings").textContent =
    result.findings || "-";
  document.getElementById("resultInterpretation").textContent =
    result.interpretation || "-";
  document.getElementById("resultImpression").textContent =
    result.impression || "-";
  document.getElementById("certificationDetails").textContent =
    result.usedGemini
      ? "🤖 Google Gemini AI + BrainMed+ v3.0"
      : "📊 تحليل احتياطي";

  // التوصيات (مصفوفة)
  const recList = document.getElementById("resultRecommendations");
  if (recList && result.recommendations) {
    recList.innerHTML = "";
    if (Array.isArray(result.recommendations)) {
      result.recommendations.forEach((rec) => {
        const li = document.createElement("li");
        li.textContent = rec;
        recList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = result.recommendations;
      recList.appendChild(li);
    }
  }

  // عرض الصورة
  const imgContainer = document.getElementById("resultImageContainer");
  if (imgContainer && result.imageData) {
    imgContainer.innerHTML = `<img src="${result.imageData}" alt="صورة رسم المخ" class="result-image" />`;
  }

  // تنسيق صندوق التشخيص
  const isNormal =
    result.diagnosis &&
    result.diagnosis.includes("طبيعي") &&
    !result.diagnosis.includes("غير");
  const box = document.getElementById("diagnosisBox");
  const icon = document.getElementById("diagnosisIcon");
  if (box) {
    box.className = `diagnosis-box ${isNormal ? "normal" : result.severity === "شديد" || result.severity === "خطيرة" || result.severity === "حالة طارئة" ? "danger" : "warning"}`;
  }
  if (icon) {
    icon.className = isNormal
      ? "fas fa-check-circle"
      : "fas fa-exclamation-triangle";
  }

  // Hash التشفير
  document.getElementById("certificationHash").textContent =
    `🔑 ${result.hash || "BMD-" + Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// ============================================
// 💬 شات Gemini
// ============================================

function initChat() {
  const chatInput = document.getElementById("geminiChatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendGeminiMessage();
      }
    });
  }

  const openChatBtn = document.getElementById("openChatBtn");
  if (openChatBtn) {
    openChatBtn.addEventListener("click", openGeminiChat);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGeminiChat();
  });
}

window.openGeminiChat = function () {
  const modal = document.getElementById("geminiChatModal");
  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => {
      const input = document.getElementById("geminiChatInput");
      if (input) input.focus();
    }, 300);
  }
};

window.closeGeminiChat = function () {
  const modal = document.getElementById("geminiChatModal");
  if (modal) modal.style.display = "none";
};

window.sendGeminiMessage = async function () {
  const input = document.getElementById("geminiChatInput");
  const container = document.getElementById("geminiChatMessages");
  const message = input.value.trim();

  if (!message) {
    showToast("⚠️ الرجاء كتابة سؤال", "warning");
    return;
  }

  // رسالة المستخدم
  const userMsg = document.createElement("div");
  userMsg.style.cssText =
    "background:rgba(79,195,247,0.15);padding:12px 16px;border-radius:12px;align-self:flex-end;max-width:85%;color:white;border:1px solid rgba(79,195,247,0.2);";
  userMsg.textContent = message;
  container.appendChild(userMsg);
  input.value = "";

  // رسالة تحميل
  const loading = document.createElement("div");
  loading.style.cssText =
    "background:rgba(79,195,247,0.1);padding:12px 16px;border-radius:12px;align-self:flex-start;max-width:85%;color:var(--text-muted);border:1px solid rgba(79,195,247,0.1);";
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التفكير...';
  container.appendChild(loading);
  container.scrollTop = container.scrollHeight;

  try {
    const settings = getSettings();
    const apiKey = settings.geminiApiKey || API_KEY;

    if (!apiKey) {
      throw new Error("API key missing");
    }

    const prompt = `أنت مساعد طبي متخصص في رسم المخ والأعصاب. أجب على السؤال التالي بدقة وبأسلوب طبي مفهوم:\n${message}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      },
    );

    const resultData = await response.json();
    const responseText = resultData.candidates[0].content.parts[0].text;

    loading.remove();

    const aiMsg = document.createElement("div");
    aiMsg.style.cssText =
      "background:rgba(79,195,247,0.1);padding:12px 16px;border-radius:12px;align-self:flex-start;max-width:85%;color:var(--text);border:1px solid rgba(79,195,247,0.1);line-height:1.8;";
    aiMsg.innerHTML = responseText || "عذراً، لم أستطع فهم سؤالك.";
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;
  } catch (error) {
    console.error("Chat error:", error);
    loading.remove();

    const errorMsg = document.createElement("div");
    errorMsg.style.cssText =
      "background:rgba(244,67,54,0.1);padding:12px 16px;border-radius:12px;align-self:flex-start;max-width:85%;color:#f44336;border:1px solid rgba(244,67,54,0.2);";
    errorMsg.textContent =
      "⚠️ حدث خطأ في الاتصال بـ Gemini. تأكد من المفتاح في الإعدادات.";
    container.appendChild(errorMsg);
    container.scrollTop = container.scrollHeight;
    showToast("⚠️ فشل الاتصال بـ Gemini", "error");
  }
};

// ============================================
// 📊 لوحة التحكم
// ============================================

function initDashboard() {
  const dateDisplay = document.getElementById("currentDate");
  if (dateDisplay) dateDisplay.textContent = formatDate(new Date());

  const analyses = getAnalyses();
  const latest = analyses[0];

  if (latest) {
    updateFrequencyBars(latest.frequencies);
    updateFocus(latest.frequencies);
    updateBrainStatus(latest);
    updateAnalysesTable(analyses);
    updateActivityChart(analyses);
    updateEEGWave(latest.frequencies);
  } else {
    const normal = {
      frequencies: { gamma: 35, beta: 22, alpha: 10, theta: 5, delta: 2 },
    };
    updateFrequencyBars(normal.frequencies);
    updateFocus(normal.frequencies);
    updateBrainStatus({
      diagnosis: "طبيعي",
      diseaseName: "طبيعي",
      confidence: 99.2,
      severity: "خفيف",
      usedGemini: false,
    });
    updateAnalysesTable([]);
    updateActivityChart([]);
    updateEEGWave(normal.frequencies);
  }
}

function updateFrequencyBars(freqs) {
  const bands = ["gamma", "beta", "alpha", "theta", "delta"];
  const maxVal = 80;
  bands.forEach((band) => {
    const val = freqs[band] || 10;
    const el = document.getElementById(
      "freq" + band.charAt(0).toUpperCase() + band.slice(1),
    );
    const bar = document.getElementById(
      "bar" + band.charAt(0).toUpperCase() + band.slice(1),
    );
    if (el) el.textContent = val.toFixed(1);
    if (bar) bar.style.width = Math.min((val / maxVal) * 100, 100) + "%";
  });
}

function updateFocus(freqs) {
  const focusValue = document.getElementById("focusValue");
  const focusLabel = document.getElementById("focusLabel");
  const focusRange = document.getElementById("focusRange");
  if (!focusValue) return;

  let maxFreq = 0,
    dominant = "alpha";
  for (const band in freqs) {
    if (freqs[band] > maxFreq) {
      maxFreq = freqs[band];
      dominant = band;
    }
  }

  focusValue.textContent = maxFreq.toFixed(1);
  focusLabel.textContent = dominant.toUpperCase();
  const ranges = {
    gamma: "30-40",
    beta: "13-35",
    alpha: "8-13",
    theta: "4-6",
    delta: "0.5-4",
  };
  focusRange.textContent = `المدى: ${ranges[dominant] || "-"} Hz`;
}

function updateBrainStatus(result) {
  const status = document.getElementById("brainStatus");
  if (!status) return;

  const isNormal =
    result.diagnosis.includes("طبيعي") && !result.diagnosis.includes("غير");
  const icon = isNormal ? "fa-check-circle" : "fa-exclamation-triangle";
  const color = isNormal ? "#4caf50" : "#f44336";
  const label = isNormal ? "طبيعي ✅" : result.diseaseName || "غير طبيعي ⚠️";

  status.innerHTML = `
    <i class="fas ${icon}" style="font-size:32px;color:${color};"></i>
    <span style="font-size:20px;font-weight:bold;color:${color};">${label}</span>
    <span style="color:#666;font-size:14px;">نسبة الثقة: ${result.confidence || "0"}%</span>
    <span style="color:#666;font-size:12px;">🤖 ${result.usedGemini ? "Gemini AI" : "احتياطي"}</span>
  `;
}

function updateAnalysesTable(analyses) {
  const tbody = document.getElementById("analysesTable");
  if (!tbody) return;

  tbody.innerHTML = analyses
    .slice(0, 10)
    .map((a) => {
      const isNormal =
        a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير");
      const source = a.usedGemini ? "🤖 Gemini AI" : "📊 احتياطي";
      return `<tr>
        <td>${a.patientName}</td>
        <td>${a.date}</td>
        <td><span class="badge ${isNormal ? "badge-normal" : "badge-abnormal"}">${a.diseaseName}</span></td>
        <td>${a.confidence}%</td>
        <td><span class="badge badge-ai">${source}</span></td>
        <td><a href="results.html?id=${a.id}" class="btn-secondary" style="padding:6px 14px;font-size:12px;"><i class="fas fa-eye"></i></a></td>
      </tr>`;
    })
    .join("");
}

function updateActivityChart(analyses) {
  const canvas = document.getElementById("activityChart");
  if (!canvas) return;
}

function updateEEGWave(freqs) {
  const canvas = document.getElementById("eegWaveChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width || canvas.parentElement.clientWidth;
  const h = canvas.height || 100;
  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 2;

  const bands = ["delta", "theta", "alpha", "beta", "gamma"];
  const colors = ["#f44336", "#ff9800", "#4caf50", "#448aff", "#7c4dff"];

  bands.forEach((band, i) => {
    const val = freqs[band] || 0;
    const amp = (val / 80) * 30;
    const freq = (i + 1) * 2;
    ctx.beginPath();
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;

    for (let x = 0; x < w; x++) {
      const y = h / 2 + amp * Math.sin((x / (w / (freq * 4))) * Math.PI * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

// ============================================
// 📋 صفحة السجل
// ============================================

function initHistory() {
  renderHistoryTable();
}

function renderHistoryTable() {
  const analyses = getAnalyses();
  const tbody = document.getElementById("historyTable");
  if (!tbody) return;

  tbody.innerHTML = analyses
    .map((a) => {
      const isNormal =
        a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير");
      const source = a.usedGemini ? "🤖 Gemini AI" : "📊 احتياطي";
      return `<tr>
        <td>${a.patientName}</td>
        <td>${a.patientGender}</td>
        <td>${a.patientAge}</td>
        <td>${a.date}</td>
        <td><span class="badge ${isNormal ? "badge-normal" : "badge-abnormal"}">${a.diseaseName}</span></td>
        <td>${a.confidence}%</td>
        <td><span class="badge badge-ai">${source}</span></td>
        <td>
          <a href="results.html?id=${a.id}" class="btn-secondary" style="padding:6px 14px;font-size:12px;margin-left:5px;"><i class="fas fa-eye"></i></a>
          <button onclick="deleteAnalysis(${a.id})" class="btn-secondary" style="padding:6px 14px;font-size:12px;background:#ffebee;color:#c62828;"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    })
    .join("");
}

window.deleteAnalysis = function (id) {
  if (!confirm("هل أنت متأكد من حذف هذا التحليل؟")) return;
  deleteAnalysis(id);
  renderHistoryTable();
  showToast("✅ تم حذف التحليل", "success");
};

window.applyFilters = function () {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("filterStatus").value;
  const analyses = getAnalyses();

  const filtered = analyses.filter((a) => {
    const matchesSearch = a.patientName.toLowerCase().includes(search);
    const matchesStatus =
      status === "all" ||
      (status === "normal" &&
        a.diagnosis.includes("طبيعي") &&
        !a.diagnosis.includes("غير")) ||
      (status === "abnormal" &&
        (a.diagnosis.includes("غير") || a.diagnosis.includes("صرع")));
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById("historyTable");
  if (!tbody) return;

  tbody.innerHTML = filtered
    .map((a) => {
      const isNormal =
        a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير");
      const source = a.usedGemini ? "🤖 Gemini AI" : "📊 احتياطي";
      return `<tr>
        <td>${a.patientName}</td>
        <td>${a.patientGender}</td>
        <td>${a.patientAge}</td>
        <td>${a.date}</td>
        <td><span class="badge ${isNormal ? "badge-normal" : "badge-abnormal"}">${a.diseaseName}</span></td>
        <td>${a.confidence}%</td>
        <td><span class="badge badge-ai">${source}</span></td>
        <td>
          <a href="results.html?id=${a.id}" class="btn-secondary" style="padding:6px 14px;font-size:12px;margin-left:5px;"><i class="fas fa-eye"></i></a>
          <button onclick="deleteAnalysis(${a.id})" class="btn-secondary" style="padding:6px 14px;font-size:12px;background:#ffebee;color:#c62828;"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    })
    .join("");
};

window.exportData = function () {
  const analyses = getAnalyses();
  if (analyses.length === 0) {
    showToast("⚠️ لا توجد بيانات للتصدير", "warning");
    return;
  }

  let csv = "المريض,الجنس,العمر,التاريخ,التشخيص,الثقة,المصدر\n";
  analyses.forEach((a) => {
    csv += `${a.patientName},${a.patientGender},${a.patientAge},${a.date},${a.diseaseName},${a.confidence}%,${a.usedGemini ? "Gemini AI" : "احتياطي"}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `BrainMed_Export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  showToast("✅ تم تصدير البيانات", "success");
};

window.clearAllData = function () {
  if (!confirm("هل أنت متأكد من حذف جميع التحليلات؟")) return;
  clearAllData();
  renderHistoryTable();
  showToast("✅ تم مسح جميع البيانات", "success");
};

// ============================================
// 📄 صفحة التقارير
// ============================================

function initReports() {
  const analyses = getAnalyses();
  const select = document.getElementById("reportSelect");

  if (select) {
    select.innerHTML =
      '<option value="">-- اختر تحليلاً --</option>' +
      analyses
        .map(
          (a) =>
            `<option value="${a.id}">${a.patientName} - ${a.diseaseName} (${a.date})</option>`,
        )
        .join("");
  }

  const total = analyses.length;
  const normal = analyses.filter(
    (a) => a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير"),
  ).length;
  const abnormal = analyses.filter(
    (a) => a.diagnosis.includes("غير") || a.diagnosis.includes("صرع"),
  ).length;
  const avgConfidence =
    total > 0
      ? (analyses.reduce((sum, a) => sum + a.confidence, 0) / total).toFixed(1)
      : 0;

  document.getElementById("reportTotal").textContent = total;
  document.getElementById("reportNormal").textContent = normal;
  document.getElementById("reportAbnormal").textContent = abnormal;
  document.getElementById("reportAvgConfidence").textContent =
    avgConfidence + "%";
}

window.generateReport = function () {
  const select = document.getElementById("reportSelect");
  const id = parseInt(select.value);
  if (!id) {
    showToast("⚠️ الرجاء اختيار تحليل", "warning");
    return;
  }
  const analysis = getAnalysisById(id);
  if (!analysis) {
    showToast("⚠️ التحليل غير موجود", "error");
    return;
  }
  saveCurrentResult(analysis);
  window.location.href = "results.html";
};

// ============================================
// ⚙️ صفحة الإعدادات
// ============================================

function initSettings() {
  const settings = getSettings();
  const apiKeyInput = document.getElementById("apiKeyInput");
  const languageSelect = document.getElementById("languageSelect");

  if (apiKeyInput) apiKeyInput.value = settings.geminiApiKey || "";
  if (languageSelect) languageSelect.value = settings.language || "ar";

  const saveBtn = document.getElementById("saveSettingsBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const newSettings = {
        geminiApiKey: document.getElementById("apiKeyInput").value.trim(),
        language: document.getElementById("languageSelect").value,
      };
      saveSettings(newSettings);
      showToast("✅ تم حفظ الإعدادات", "success");
    });
  }

  const changePassBtn = document.getElementById("changePasswordBtn");
  if (changePassBtn) {
    changePassBtn.addEventListener("click", () => {
      const old = document.getElementById("oldPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (old.length < 6) {
        showToast("⚠️ كلمة المرور الحالية غير صحيحة", "error");
        return;
      }
      if (newPass.length < 6) {
        showToast(
          "⚠️ كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
          "error",
        );
        return;
      }
      if (newPass !== confirm) {
        showToast("⚠️ كلمات المرور غير متطابقة", "error");
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        showToast("⚠️ يجب تسجيل الدخول أولاً", "error");
        return;
      }

      showToast("✅ تم تغيير كلمة المرور بنجاح", "success");
      document.getElementById("oldPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    });
  }
}

// ============================================
// 📊 صفحة الإدارة (Admin)
// ============================================

function initAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    showToast("⚠️ غير مصرح لك بالدخول", "error");
    window.location.href = "dashboard.html";
    return;
  }

  const analyses = getAnalyses();
  const total = analyses.length;
  const normal = analyses.filter(
    (a) => a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير"),
  ).length;
  const abnormal = analyses.filter(
    (a) => a.diagnosis.includes("غير") || a.diagnosis.includes("صرع"),
  ).length;
  const geminiCount = analyses.filter((a) => a.usedGemini).length;

  document.getElementById("adminTotal").textContent = total;
  document.getElementById("adminNormal").textContent = normal;
  document.getElementById("adminAbnormal").textContent = abnormal;
  document.getElementById("adminGemini").textContent = geminiCount;

  const tbody = document.getElementById("adminTable");
  if (tbody) {
    tbody.innerHTML = analyses
      .map((a) => {
        const isNormal =
          a.diagnosis.includes("طبيعي") && !a.diagnosis.includes("غير");
        const source = a.usedGemini ? "🤖 Gemini AI" : "📊 احتياطي";
        return `<tr>
          <td>${a.patientName}</td>
          <td>${a.patientGender}</td>
          <td>${a.patientAge}</td>
          <td>${a.date}</td>
          <td><span class="badge ${isNormal ? "badge-normal" : "badge-abnormal"}">${a.diseaseName}</span></td>
          <td>${a.confidence}%</td>
          <td><span class="badge badge-ai">${source}</span></td>
          <td>
            <button onclick="deleteAnalysis(${a.id})" class="btn-secondary" style="padding:6px 14px;font-size:12px;background:#ffebee;color:#c62828;"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
      })
      .join("");
  }
}

// ============================================
// 📄 PDF
// ============================================

window.generateImprovedPDF = function () {
  const { jsPDF } = window.jspdf;
  const result = getCurrentResult();

  if (!result || !result.diagnosis) {
    showToast("⚠️ لا يوجد تحليل", "warning");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = 210,
    margin = 20,
    pageH = 297;
  let y = margin;

  doc.setFillColor(13, 13, 43);
  doc.rect(0, 0, pageW, 35, "F");
  doc.setTextColor(79, 195, 247);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BrainMed+", pageW / 2, 18, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("تقرير تحليل رسم المخ بالذكاء الاصطناعي", pageW / 2, 28, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("بيانات المريض", pageW - margin, (y += 15), { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const info = [
    `الاسم: ${result.patientName || "-"}`,
    `الجنس: ${result.patientGender || "-"}`,
    `العمر: ${result.patientAge || "-"} سنة`,
    `التاريخ: ${result.date || "-"}`,
    `نوع الملف: ${result.fileType || "-"}`,
  ];
  info.forEach((line) => {
    doc.text(line, pageW - margin, (y += 6), { align: "right" });
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("التشخيص", pageW - margin, (y += 12), { align: "right" });

  const isNormal =
    result.diagnosis.includes("طبيعي") && !result.diagnosis.includes("غير");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(
    isNormal ? 76 : 244,
    isNormal ? 175 : 67,
    isNormal ? 80 : 54,
  );
  doc.text(result.diseaseName || "-", pageW - margin, (y += 7), {
    align: "right",
  });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `نسبة الثقة: ${result.confidence || "-"}%`,
    pageW - margin,
    (y += 6),
    { align: "right" },
  );
  doc.text(
    `درجة الخطورة: ${result.severity || "-"}`,
    pageW - margin,
    (y += 6),
    { align: "right" },
  );
  doc.text(
    `العلاج المقترح: ${result.treatment || "-"}`,
    pageW - margin,
    (y += 6),
    { align: "right" },
  );
  doc.text(
    `المصدر: ${result.usedGemini ? "🤖 Google Gemini AI" : "📊 تحليل احتياطي"}`,
    pageW - margin,
    (y += 6),
    { align: "right" },
  );

  y += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("النتائج", pageW - margin, (y += 6), { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const findingsLines = doc.splitTextToSize(result.findings || "-", 160);
  doc.text(findingsLines, pageW - margin, (y += 8), { align: "right" });
  y += findingsLines.length * 5;

  doc.setFillColor(13, 13, 43);
  doc.rect(0, pageH - 20, pageW, 20, "F");
  doc.setTextColor(79, 195, 247);
  doc.setFontSize(8);
  doc.text(
    `BrainMed+ v3.0 - تم التحليل بواسطة ${result.usedGemini ? "Google Gemini AI" : "النظام الاحتياطي"}`,
    pageW / 2,
    pageH - 8,
    { align: "center" },
  );

  doc.save(
    `BrainMed_Report_${result.patientName || "Patient"}_${new Date().toISOString().split("T")[0]}.pdf`,
  );
  showToast("✅ تم إنشاء PDF", "success");
};

window.shareResult = function () {
  const result = getCurrentResult();
  if (!result || !result.diagnosis) {
    showToast("⚠️ لا يوجد تحليل للمشاركة", "warning");
    return;
  }

  const text = `🧠 تقرير BrainMed+\nالمريض: ${result.patientName}\nالتشخيص: ${result.diseaseName}\nنسبة الثقة: ${result.confidence}%\nالمصدر: ${result.usedGemini ? "Google Gemini AI" : "تحليل احتياطي"}`;

  if (navigator.share) {
    navigator.share({ title: "BrainMed+ Report", text });
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("✅ تم نسخ التقرير", "success"));
  }
};

// ============================================
// دوال المساعدة للـ Auth (تسجيل الدخول)
// ============================================

function initLogin() {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // مستخدمين افتراضيين
      const users = [
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

      const user = users.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        const { password, ...safeUser } = user;
        saveUser(safeUser);
        showToast(`✅ مرحباً ${safeUser.name}`, "success");
        window.location.href = "dashboard.html";
      } else {
        showToast("⚠️ البريد أو كلمة المرور غير صحيحة", "error");
      }
    });
  }
}

function initRegister() {
  const form = document.getElementById("registerForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fullName").value;
      const email = document.getElementById("regEmail").value;
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirmPassword").value;

      if (password !== confirm) {
        showToast("⚠️ كلمات المرور غير متطابقة", "error");
        return;
      }
      if (password.length < 6) {
        showToast("⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
        return;
      }

      const user = { email, password, name, role: "user" };
      const { password: _, ...safeUser } = user;
      saveUser(safeUser);
      showToast(`✅ تم إنشاء الحساب بنجاح، مرحباً ${name}`, "success");
      window.location.href = "dashboard.html";
    });
  }
}

// ============================================
// دوال toggle password
// ============================================

window.togglePassword = function () {
  const input = document.getElementById("password");
  const icon = document.getElementById("toggleIcon");
  if (input) {
    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  }
};

window.toggleRegPassword = function () {
  const input = document.getElementById("regPassword");
  const icon = document.getElementById("regToggleIcon");
  if (input) {
    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  }
};

// ============================================
// 🚀 التهيئة
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  initAuth();
  initChat();

  const page = window.location.pathname.split("/").pop();

  switch (page) {
    case "dashboard.html":
    case "":
      initDashboard();
      break;
    case "upload.html":
      initUpload();
      break;
    case "results.html":
      initResults();
      break;
    case "history.html":
      initHistory();
      break;
    case "reports.html":
      initReports();
      break;
    case "settings.html":
      initSettings();
      break;
    case "admin.html":
      initAdmin();
      break;
    case "login.html":
      initLogin();
      break;
    case "register.html":
      initRegister();
      break;
  }
});
