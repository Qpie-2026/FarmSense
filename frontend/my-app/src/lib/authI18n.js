import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "farmsense-auth-language";

export const AUTH_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

export const CROP_OPTIONS = [
  { value: "Wheat", labels: { en: "Wheat", hi: "गेहूं", mr: "गहू" } },
  { value: "Rice", labels: { en: "Rice", hi: "धान", mr: "तांदूळ" } },
  { value: "Maize", labels: { en: "Maize", hi: "मक्का", mr: "मका" } },
  { value: "Cotton", labels: { en: "Cotton", hi: "कपास", mr: "कापूस" } },
  { value: "Sugarcane", labels: { en: "Sugarcane", hi: "गन्ना", mr: "ऊस" } },
  { value: "Soybean", labels: { en: "Soybean", hi: "सोयाबीन", mr: "सोयाबीन" } },
  { value: "Groundnut", labels: { en: "Groundnut", hi: "मूंगफली", mr: "भुईमूग" } },
  { value: "Onion", labels: { en: "Onion", hi: "प्याज", mr: "कांदा" } },
  { value: "Potato", labels: { en: "Potato", hi: "आलू", mr: "बटाटा" } },
  { value: "Tomato", labels: { en: "Tomato", hi: "टमाटर", mr: "टोमॅटो" } },
  { value: "Chilli", labels: { en: "Chilli", hi: "मिर्च", mr: "मिरची" } },
  { value: "Turmeric", labels: { en: "Turmeric", hi: "हल्दी", mr: "हळद" } },
  { value: "Jowar", labels: { en: "Jowar", hi: "ज्वार", mr: "ज्वारी" } },
  { value: "Bajra", labels: { en: "Bajra", hi: "बाजरा", mr: "बाजरी" } },
  { value: "Tur Dal", labels: { en: "Tur Dal", hi: "अरहर दाल", mr: "तूर डाळ" } },
];

const COPY = {
  en: {
    common: {
      brand: "MandAI",
      brandTagline: "Agri Price Intelligence",
      languageLabel: "Language",
      security: "Secure and encrypted access for farmer data",
    },
    login: {
      heroEyebrow: "Farmer-First Access",
      heroTitle: "Check mandi trends, sell timing, and forecast signals in one place.",
      heroBody:
        "Switch the form instantly between English, Hindi, and Marathi without losing your progress.",
      heroPoints: [
        "Short-term commodity outlooks in one dashboard",
        "Simple sign-in flow for farmers and field teams",
        "Clean interface for fast access during market hours",
      ],
      title: "Welcome back",
      subtitle: "Sign in to view today's price outlook and commodity forecast.",
      mobileLabel: "Mobile Number",
      mobilePlaceholder: "Enter your 10-digit mobile number",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot password?",
      submit: "Sign In to Dashboard",
      helper: "Use the same number linked to your farmer account.",
      switchPrompt: "Don't have an account?",
      switchLink: "Register as Farmer",
      missingFields: "Enter both mobile number and password.",
    },
    register: {
      heroEyebrow: "Quick Farmer Onboarding",
      heroTitle: "Create a profile that keeps your crop, mandi, and forecast preferences together.",
      heroBody:
        "The registration flow is designed to stay readable in English, Hindi, and Marathi.",
      heroPoints: [
        "Save your preferred crop and mandi context",
        "Use a clean form with easy-to-scan field groups",
        "Move from registration to dashboard in one flow",
      ],
      title: "Join MandAI",
      subtitle: "Create your farmer account and start tracking price opportunities.",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      mobileLabel: "Mobile Number",
      mobilePlaceholder: "Enter your 10-digit mobile number",
      cropLabel: "Primary Crop",
      cropPlaceholder: "Select crop",
      locationLabel: "District or Mandi Location",
      locationPlaceholder: "Enter your nearest mandi or district",
      passwordLabel: "Password",
      passwordPlaceholder: "Create a password",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "Re-enter your password",
      submit: "Create Farmer Account",
      switchPrompt: "Already have an account?",
      switchLink: "Sign In",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      support: "Support Center",
      success: "Account created successfully.",
      validation: {
        fullName: "Full name is required.",
        mobile: "Enter a valid 10-digit mobile number.",
        crop: "Select your primary crop.",
        location: "Enter your district or mandi location.",
        password: "Password must be at least 6 characters.",
        confirmPassword: "Passwords do not match.",
      },
    },
  },
  hi: {
    common: {
      brand: "MandAI",
      brandTagline: "कृषि मूल्य बुद्धिमत्ता",
      languageLabel: "भाषा",
      security: "किसान डेटा के लिए सुरक्षित और एन्क्रिप्टेड पहुंच",
    },
    login: {
      heroEyebrow: "किसान-केंद्रित प्रवेश",
      heroTitle: "मंडी ट्रेंड, बिक्री का सही समय और भाव पूर्वानुमान एक ही जगह देखें।",
      heroBody:
        "अपनी भरी हुई जानकारी खोए बिना फॉर्म को तुरंत अंग्रेज़ी, हिंदी और मराठी में बदलें।",
      heroPoints: [
        "एक डैशबोर्ड में अल्पकालिक कमोडिटी संकेत",
        "किसानों और फील्ड टीमों के लिए आसान साइन-इन",
        "बाज़ार के समय तेज़ उपयोग के लिए साफ़ इंटरफेस",
      ],
      title: "फिर से स्वागत है",
      subtitle: "आज की मूल्य स्थिति और कमोडिटी पूर्वानुमान देखने के लिए साइन इन करें।",
      mobileLabel: "मोबाइल नंबर",
      mobilePlaceholder: "अपना 10 अंकों का मोबाइल नंबर दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      forgotPassword: "पासवर्ड भूल गए?",
      submit: "डैशबोर्ड में साइन इन करें",
      helper: "उसी नंबर का उपयोग करें जो आपके किसान खाते से जुड़ा है।",
      switchPrompt: "क्या आपका खाता नहीं है?",
      switchLink: "किसान के रूप में पंजीकरण करें",
      missingFields: "मोबाइल नंबर और पासवर्ड दोनों दर्ज करें।",
    },
    register: {
      heroEyebrow: "तेज़ किसान पंजीकरण",
      heroTitle: "ऐसी प्रोफ़ाइल बनाएं जिसमें आपकी फसल, मंडी और पूर्वानुमान पसंद एक साथ रहें।",
      heroBody:
        "यह पंजीकरण फॉर्म अंग्रेज़ी, हिंदी और मराठी में साफ़ और आसानी से पढ़ने योग्य है।",
      heroPoints: [
        "अपनी पसंदीदा फसल और मंडी संदर्भ सहेजें",
        "साफ़ और व्यवस्थित फील्ड समूहों वाला फॉर्म",
        "पंजीकरण के बाद सीधे डैशबोर्ड तक पहुंच",
      ],
      title: "MandAI से जुड़ें",
      subtitle: "किसान खाता बनाएं और मूल्य अवसरों को ट्रैक करना शुरू करें।",
      fullNameLabel: "पूरा नाम",
      fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
      mobileLabel: "मोबाइल नंबर",
      mobilePlaceholder: "अपना 10 अंकों का मोबाइल नंबर दर्ज करें",
      cropLabel: "मुख्य फसल",
      cropPlaceholder: "फसल चुनें",
      locationLabel: "जिला या मंडी स्थान",
      locationPlaceholder: "अपनी नज़दीकी मंडी या जिला दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड बनाएं",
      confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
      confirmPasswordPlaceholder: "पासवर्ड फिर से दर्ज करें",
      submit: "किसान खाता बनाएं",
      switchPrompt: "क्या आपका पहले से खाता है?",
      switchLink: "साइन इन करें",
      privacy: "गोपनीयता नीति",
      terms: "सेवा की शर्तें",
      support: "सहायता केंद्र",
      success: "खाता सफलतापूर्वक बन गया।",
      validation: {
        fullName: "पूरा नाम आवश्यक है।",
        mobile: "सही 10 अंकों का मोबाइल नंबर दर्ज करें।",
        crop: "अपनी मुख्य फसल चुनें।",
        location: "अपना जिला या मंडी स्थान दर्ज करें।",
        password: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
        confirmPassword: "दोनों पासवर्ड मेल नहीं खाते।",
      },
    },
  },
  mr: {
    common: {
      brand: "MandAI",
      brandTagline: "कृषी भाव विश्लेषण",
      languageLabel: "भाषा",
      security: "शेतकरी डेटासाठी सुरक्षित आणि एनक्रिप्टेड प्रवेश",
    },
    login: {
      heroEyebrow: "शेतकरी-केंद्रित प्रवेश",
      heroTitle: "मंडई ट्रेंड, विक्रीची योग्य वेळ आणि भावाचा अंदाज एकाच ठिकाणी पहा.",
      heroBody:
        "भरलेली माहिती न गमावता फॉर्म इंग्रजी, हिंदी आणि मराठीत लगेच बदला.",
      heroPoints: [
        "एकाच डॅशबोर्डमध्ये अल्पकालीन कमोडिटी संकेत",
        "शेतकरी आणि फील्ड टीमसाठी सोपा साइन-इन प्रवाह",
        "बाजाराच्या वेळी जलद वापरासाठी स्वच्छ इंटरफेस",
      ],
      title: "पुन्हा स्वागत आहे",
      subtitle: "आजची भावस्थिती आणि कमोडिटी अंदाज पाहण्यासाठी साइन इन करा.",
      mobileLabel: "मोबाइल क्रमांक",
      mobilePlaceholder: "तुमचा 10 अंकी मोबाइल क्रमांक टाका",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "तुमचा पासवर्ड टाका",
      forgotPassword: "पासवर्ड विसरलात?",
      submit: "डॅशबोर्डमध्ये साइन इन करा",
      helper: "तुमच्या शेतकरी खात्याशी जोडलेला तोच क्रमांक वापरा.",
      switchPrompt: "तुमचे खाते नाही का?",
      switchLink: "शेतकरी म्हणून नोंदणी करा",
      missingFields: "मोबाइल क्रमांक आणि पासवर्ड दोन्ही भरा.",
    },
    register: {
      heroEyebrow: "जलद शेतकरी नोंदणी",
      heroTitle: "तुमची पीक, मंडई आणि अंदाज पसंती एकत्र ठेवणारी प्रोफाइल तयार करा.",
      heroBody:
        "हा नोंदणी फॉर्म इंग्रजी, हिंदी आणि मराठीत स्वच्छ आणि सहज वाचता येईल असा तयार केला आहे.",
      heroPoints: [
        "तुमचे आवडते पीक आणि मंडई संदर्भ जतन करा",
        "सोपे आणि स्वच्छ फील्ड गट असलेला फॉर्म",
        "नोंदणीनंतर थेट डॅशबोर्डमध्ये जा",
      ],
      title: "MandAI मध्ये सामील व्हा",
      subtitle: "शेतकरी खाते तयार करा आणि भावाच्या संधी ट्रॅक करायला सुरुवात करा.",
      fullNameLabel: "पूर्ण नाव",
      fullNamePlaceholder: "तुमचे पूर्ण नाव टाका",
      mobileLabel: "मोबाइल क्रमांक",
      mobilePlaceholder: "तुमचा 10 अंकी मोबाइल क्रमांक टाका",
      cropLabel: "मुख्य पीक",
      cropPlaceholder: "पीक निवडा",
      locationLabel: "जिल्हा किंवा मंडई स्थान",
      locationPlaceholder: "तुमची जवळची मंडई किंवा जिल्हा टाका",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड तयार करा",
      confirmPasswordLabel: "पासवर्डची पुष्टी करा",
      confirmPasswordPlaceholder: "पासवर्ड पुन्हा टाका",
      submit: "शेतकरी खाते तयार करा",
      switchPrompt: "आधीच खाते आहे का?",
      switchLink: "साइन इन करा",
      privacy: "गोपनीयता धोरण",
      terms: "सेवा अटी",
      support: "साहाय्य केंद्र",
      success: "खाते यशस्वीरित्या तयार झाले.",
      validation: {
        fullName: "पूर्ण नाव आवश्यक आहे.",
        mobile: "योग्य 10 अंकी मोबाइल क्रमांक टाका.",
        crop: "तुमचे मुख्य पीक निवडा.",
        location: "तुमचा जिल्हा किंवा मंडई स्थान टाका.",
        password: "पासवर्ड किमान 6 अक्षरांचा असावा.",
        confirmPassword: "दोन्ही पासवर्ड जुळत नाहीत.",
      },
    },
  },
};

export function useAuthLanguage() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    return window.localStorage.getItem(STORAGE_KEY) || "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const copy = useMemo(() => COPY[language] ?? COPY.en, [language]);
  return {
    language,
    setLanguage,
    languages: AUTH_LANGUAGES,
    copy,
  };
}

export function getCropLabel(value, language) {
  const crop = CROP_OPTIONS.find((item) => item.value === value);
  return crop?.labels?.[language] || value;
}
