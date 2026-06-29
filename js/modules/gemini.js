// js/modules/gemini.js
import { getSettings } from "./storage.js";
import { showToast } from "./ui.js";

export async function analyzeWithGemini(imageData, patientData) {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey || "";

  if (!apiKey) {
    showToast(
      "⚠️ لم يتم تعيين مفتاح Gemini API. الرجاء إدخاله في الإعدادات.",
      "error",
    );
    throw new Error("API key missing");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.1, topP: 0.9 },
    });

    const imageBase64 = imageData.split(",")[1];
    const prompt = `
أنت طبيب أعصاب متخصص في تحليل رسم المخ (EEG). الصورة المرفقة هي رسم مخ حقيقي.

**حلل الصورة بعناية وقدم تشخيصاً دقيقاً:**

1. اقرأ الصورة وحدد النمط الكهربائي
2. التشخيص (طبيعي / صرع / ورم / سكتة / ألزهايمر / اضطراب نوم / تشويش)
3. الترددات التقريبية (Gamma, Beta, Alpha, Theta, Delta)
4. نسبة الثقة (0-100%)
5. درجة الخطورة (خفيف / متوسط / شديد)
6. العلاج المقترح
7. الملاحظات التفصيلية
8. التوصيات

**بيانات المريض للمساعدة:**
- العمر: ${patientData.age || "غير معروف"} سنة
- التاريخ المرضي: ${patientData.history || "لا يوجد"}

**الرد فقط بصيغة JSON:**
{
    "diagnosis": "التشخيص بالعربي",
    "diseaseName": "الاسم الطبي بالعربي",
    "description": "وصف مختصر للحالة",
    "frequencies": {"gamma": 0, "beta": 0, "alpha": 0, "theta": 0, "delta": 0},
    "confidence": 0,
    "severity": "خفيف/متوسط/شديد",
    "treatment": "العلاج المقترح",
    "findings": "الملاحظات التفصيلية",
    "interpretation": "التفسير الطبي",
    "impression": "الانطباع النهائي",
    "recommendations": ["توصية 1", "توصية 2"],
    "affectedRegions": ["Frontal", "Temporal"]
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return parseTextResponse(responseText);
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return {
      diagnosis: analysis.diagnosis || "تحليل غير محدد",
      diseaseName:
        analysis.diseaseName || analysis.diagnosis || "تحليل غير محدد",
      description: analysis.description || "تم تحليل الصورة بواسطة Gemini AI",
      frequencies: analysis.frequencies || {
        gamma: 35,
        beta: 22,
        alpha: 10,
        theta: 5,
        delta: 2,
      },
      confidence: analysis.confidence || 85,
      severity: analysis.severity || "خفيف",
      treatment: analysis.treatment || "استشارة طبيب أعصاب",
      findings: analysis.findings || "تم تحليل الصورة بواسطة Google Gemini AI",
      interpretation: analysis.interpretation || "لا يوجد تفسير",
      impression: analysis.impression || analysis.diagnosis || "لا يوجد انطباع",
      recommendations: analysis.recommendations || ["استشارة طبيب أعصاب متخصص"],
      affectedRegions: analysis.affectedRegions || [],
      usedGemini: true,
    };
  } catch (error) {
    console.error("❌ Gemini Error:", error);
    showToast(
      "⚠️ فشل الاتصال بـ Gemini. جاري استخدام التحليل الاحتياطي.",
      "warning",
    );
    return getFallbackAnalysis(patientData);
  }
}

// دوال مساعدة للتحليل الاحتياطي والنص
function parseTextResponse(text) {
  // نفس الكود السابق مع تحسين طفيف
  const lower = text.toLowerCase();
  let diagnosis = "تحليل غير محدد";
  let confidence = 85;
  let severity = "خفيف";
  let treatment = "استشارة طبيب أعصاب";
  let findings = text.substring(0, 300) || "تم تحليل الصورة بواسطة Gemini AI";
  let interpretation = "تم التحليل بواسطة Google Gemini AI";
  let impression = diagnosis;
  let recommendations = ["استشارة طبيب أعصاب متخصص", "إجراء فحوصات إضافية"];
  let affectedRegions = [];

  if (lower.includes("طبيعي") || lower.includes("normal")) {
    diagnosis = "طبيعي";
    confidence = 92;
    severity = "خفيف";
    treatment = "لا يحتاج علاج";
    impression = "✅ رسم مخ طبيعي";
    recommendations = ["متابعة روتينية", "الحفاظ على نمط حياة صحي"];
  } else if (lower.includes("صرع") || lower.includes("epilepsy")) {
    diagnosis = "صرع (Epilepsy)";
    confidence = 90;
    severity = "متوسط";
    treatment = "استشارة طبيب أعصاب فورية. بدء العلاج المضاد للصرع";
    impression = "🚨 نمط صرعي - يستدعي تدخل طبي";
    recommendations = [
      "استشارة طبيب أعصاب متخصص",
      "بدء العلاج المضاد للصرع",
      "متابعة EEG دورية",
    ];
    affectedRegions = ["Generalized"];
  } else if (lower.includes("ورم") || lower.includes("tumor")) {
    diagnosis = "ورم دماغي (Brain Tumor)";
    confidence = 88;
    severity = "شديد";
    treatment = "استشارة جراحة أعصاب فورية";
    impression = "🚨 ورم دماغي محتمل - يستدعي تدخل عاجل";
    recommendations = [
      "استشارة جراحة أعصاب",
      "تصوير بالرنين المغناطيسي (MRI)",
      "استئصال جراحي حسب التوجيه الطبي",
    ];
    affectedRegions = ["Frontal", "Temporal"];
  } else if (lower.includes("سكتة") || lower.includes("stroke")) {
    diagnosis = "سكتة دماغية (Stroke)";
    confidence = 86;
    severity = "شديد";
    treatment = "تدخل طبي فوري - tPA إن كان في النافذة الزمنية";
    impression = "🚨 سكتة دماغية محتملة - يستدعي تدخل عاجل";
    recommendations = ["نقل إلى قسم الطوارئ فوراً", "CT دماغي", "تقييم tPA"];
    affectedRegions = ["Parietal", "Temporal"];
  } else if (lower.includes("ألزهايمر") || lower.includes("alzheimer")) {
    diagnosis = "ألزهايمر (Alzheimer's)";
    confidence = 84;
    severity = "متوسط";
    treatment = "Donepezil + Memantine + تقييم إدراكي";
    impression = "🧠 ألزهايمر محتمل - يوصى بمتابعة";
    recommendations = [
      "تقييم إدراكي شامل",
      "MRI دماغي",
      "بدء Donepezil حسب التوجيه الطبي",
    ];
    affectedRegions = ["Temporal", "Parietal"];
  } else if (lower.includes("النوم") || lower.includes("sleep")) {
    diagnosis = "اضطراب النوم (Sleep Disorder)";
    confidence = 82;
    severity = "خفيف";
    treatment = "تحسين نظافة النوم + CPAP إن لزم";
    impression = "😴 اضطراب النوم - يوصى بتحسين نظافة النوم";
    recommendations = [
      "دراسة نوم متعددة المعايير",
      "تحسين نظافة النوم",
      "CPAP إن كان AHI >15",
    ];
    affectedRegions = ["Frontal"];
  }

  return {
    diagnosis,
    diseaseName: diagnosis,
    description: text.substring(0, 200) || "تم تحليل الصورة بواسطة Gemini AI",
    frequencies: { gamma: 35, beta: 22, alpha: 10, theta: 5, delta: 2 },
    confidence,
    severity,
    treatment,
    findings,
    interpretation,
    impression,
    recommendations,
    affectedRegions,
    usedGemini: true,
  };
}

function getFallbackAnalysis(patientData) {
  // تحليل احتياطي محسن يعتمد على التاريخ والعمر مع تحذير
  const age = parseInt(patientData.age) || 30;
  const history = (patientData.history || "").toLowerCase();

  let diagnosis = "طبيعي (تقديري)";
  let confidence = 70;
  let severity = "خفيف";
  let treatment = "استشارة طبيب أعصاب";
  let findings = "تم التحليل بواسطة النظام الاحتياطي (غير دقيق)";
  let interpretation = "تعذر الاتصال بـ Gemini. هذا تحليل تقديري.";
  let impression = "⚠️ تحليل احتياطي - يوصى بإعادة المحاولة أو استشارة طبيب";
  let recommendations = ["إعادة التحليل باستخدام Gemini", "استشارة طبيب أعصاب"];
  let affectedRegions = [];

  if (history.includes("صرع") || history.includes("epilepsy")) {
    diagnosis = "صرع (تقديري)";
    confidence = 65;
    severity = "متوسط";
    treatment = "استشارة طبيب أعصاب";
    impression = "⚠️ صرع محتمل (تحليل احتياطي)";
    recommendations = ["استشارة طبيب أعصاب متخصص", "بدء العلاج المضاد للصرع"];
    affectedRegions = ["Temporal"];
  } else if (history.includes("ورم") || history.includes("tumor")) {
    diagnosis = "ورم دماغي (تقديري)";
    confidence = 60;
    severity = "شديد";
    treatment = "استشارة جراحة أعصاب";
    impression = "⚠️ ورم دماغي محتمل (تحليل احتياطي)";
    recommendations = ["استشارة جراحة أعصاب", "MRI دماغي"];
    affectedRegions = ["Frontal"];
  } else if (history.includes("سكتة") || history.includes("stroke")) {
    diagnosis = "سكتة دماغية (تقديري)";
    confidence = 62;
    severity = "شديد";
    treatment = "تدخل طبي فوري";
    impression = "⚠️ سكتة دماغية محتملة (تحليل احتياطي)";
    recommendations = ["نقل إلى قسم الطوارئ", "CT دماغي"];
    affectedRegions = ["Parietal"];
  } else if (age > 60) {
    diagnosis = "ألزهايمر (تقديري)";
    confidence = 58;
    severity = "متوسط";
    treatment = "تقييم إدراكي";
    impression = "⚠️ ألزهايمر محتمل (تحليل احتياطي)";
    recommendations = ["تقييم إدراكي شامل", "MRI دماغي"];
    affectedRegions = ["Temporal", "Parietal"];
  }

  return {
    diagnosis,
    diseaseName: diagnosis,
    description: "تحليل احتياطي (Gemini غير متاح)",
    frequencies: { gamma: 35, beta: 22, alpha: 10, theta: 5, delta: 2 },
    confidence,
    severity,
    treatment,
    findings,
    interpretation,
    impression,
    recommendations,
    affectedRegions,
    usedGemini: false,
  };
}
