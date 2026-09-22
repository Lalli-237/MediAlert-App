import { LanguageCode, FoodCondition } from '../types';

export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  navHome: string;
  navTracker: string;
  navAdd: string;
  navManage: string;
  navProfile: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  tagline: string;
  addMedicineBtn: string;
  nextMedicine: string;
  nextMedicineDesc: string;
  noUpcomingDoses: string;
  allDoneToday: string;
  allDone: string;
  allTakenSubtitle: string;
  greatJob: string;
  takeDoseNow: string;
  takeNow: string;
  takeDose: string;
  snooze5Min: string;
  snoozedFor5Min: string;
  skipDose: string;
  dueNow: string;
  overdueBy: string;
  dueIn: string;
  listenReminder: string;
  testAlarm: string;
  alarmActive: string;
  wakeAlarmTitle: string;
  wakeAlarmSubtitle: string;
  foodConditions: Record<FoodCondition, { title: string; hint: string }>;
  weeklyProgress: string;
  weeklyAdherence: string;
  streakDays: string;
  complianceRate: string;
  dosesTaken: string;
  emergencyContact: string;
  callCaregiver: string;
  textCaregiver: string;
  sosAlert: string;
  emergencyCaregiver: string;
  editContact: string;
  saveContact: string;
  offlineReady: string;
  online: string;
  offline: string;
  myMedications: string;
  addMedication: string;
  editMedication: string;
  deleteMedication: string;
  medicationName: string;
  dosage: string;
  type: string;
  foodConditionLabel: string;
  scheduleTimes: string;
  instructions: string;
  saveMedication: string;
  cancel: string;
  doseHistory: string;
  textSize: string;
  soundAlerts: string;
  takePic: string;
  uploadPic: string;
  medicinePhoto: string;
  patientDetails: string;
  patientName: string;
  age: string;
  bloodGroup: string;
  doctorName: string;
  doctorPhone: string;
  exportData: string;
  importData: string;
  resetData: string;
  hiGreeting?: string;
  currentTimeLabel?: string;
  editPrescription?: string;
  deletePrescription?: string;
  tabletPicture?: string;
  trackingStartedToday?: string;
  listenAgain?: string;
  logout?: string;
  switchAccount?: string;
}

export function getLocalizedListenAgain(lang: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: "Listen Once More 🔊",
    hi: "फिर से सुनें 🔊",
    ta: "மீண்டும் கேளுங்கள் 🔊",
    te: "మరోసారి వినండి 🔊",
    kn: "ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ 🔊",
    bn: "আবার শুনুন 🔊",
    mr: "पुन्हा ऐका 🔊",
    ml: "വീണ്ടും കേൾക്കുക 🔊",
    gu: "ફરીથી સાંભળો 🔊",
    es: "Escuchar de nuevo 🔊",
    fr: "Écouter à nouveau 🔊",
    de: "Nochmals anhören 🔊",
    ja: "もう一度聞く 🔊"
  };
  return labels[lang] || "Listen Once More 🔊";
}

export function getLocalizedLogout(lang: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: "Log Out",
    hi: "लॉग आउट",
    ta: "வெளியேறு",
    te: "లాగ్ అవుట్",
    kn: "ಲಾಗ್ ಔಟ್",
    bn: "লগ আউট",
    mr: "लॉग आउट",
    ml: "ലോഗ് ഔട്ട്",
    gu: "લૉગ આઉટ",
    es: "Cerrar sesión",
    fr: "Déconnexion",
    de: "Abmelden",
    ja: "ログアウト"
  };
  return labels[lang] || "Log Out";
}

export function getLocalizedHiGreeting(lang: LanguageCode, name?: string): string {
  const cleanName = name?.trim();
  if (!cleanName) {
    const welcomeGreetings: Record<LanguageCode, string> = {
      en: "Welcome!",
      hi: "स्वागत है!",
      ta: "வரவேற்கிறோம்!",
      te: "స్వాగతం!",
      kn: "ಸ್ವಾಗತ!",
      bn: "স্বাগতম!",
      mr: "स्वागत आहे!",
      ml: "സ്വാഗതം!",
      gu: "સ્વાગત છે!",
      es: "¡Bienvenido!",
      fr: "Bienvenue!",
      de: "Willkommen!",
      ja: "ようこそ!"
    };
    return welcomeGreetings[lang] || "Welcome!";
  }
  const greetings: Record<LanguageCode, string> = {
    en: `Hi, ${cleanName}!`,
    hi: `नमस्ते, ${cleanName}!`,
    ta: `வணக்கம், ${cleanName}!`,
    te: `నమస్కారం, ${cleanName}!`,
    kn: `ನಮಸ್ಕಾರ, ${cleanName}!`,
    bn: `নমস্কার, ${cleanName}!`,
    mr: `नमस्कार, ${cleanName}!`,
    ml: `നമസ്കാരം, ${cleanName}!`,
    gu: `નમસ્તે, ${cleanName}!`,
    es: `¡Hola, ${cleanName}!`,
    fr: `Bonjour, ${cleanName}!`,
    de: `Hallo, ${cleanName}!`,
    ja: `こんにちは、${cleanName}さん!`
  };
  return greetings[lang] || `Hi, ${cleanName}!`;
}

export function getLocalizedCurrentTimeLabel(lang: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: "Current Time",
    hi: "वर्तमान समय",
    ta: "தற்போதைய நேரம்",
    te: "ప్రస్తుత సమయం",
    kn: "ಪ್ರಸ್ತುತ ಸಮಯ",
    bn: "বর্তমান সময়",
    mr: "सध्याची वेळ",
    ml: "നിലവിലെ സമയം",
    gu: "વર્તમાન સમય",
    es: "Hora actual",
    fr: "Heure actuelle",
    de: "Aktuelle Uhrzeit",
    ja: "現在の時刻"
  };
  return labels[lang] || "Current Time";
}

export function getLocalizedEditPrescription(lang: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: "Edit Prescription",
    hi: "दवा विवरण बदलें",
    ta: "மருந்து விவரத்தை மாற்று",
    te: "మందు వివరాలు మార్చు",
    kn: "ಔಷಧಿ ವಿವರ ಬದಲಾಯಿಸಿ",
    bn: "ঔষধ পরিবর্তন করুন",
    mr: "औषध तपशील बदला",
    ml: "മരുന്ന് വിവരങ്ങൾ മാറ്റുക",
    gu: "દવા વિગતો બદલો",
    es: "Editar receta",
    fr: "Modifier l'ordonnance",
    de: "Rezept bearbeiten",
    ja: "処方を編集"
  };
  return labels[lang] || "Edit Prescription";
}

export function getLocalizedTabletPictureLabel(lang: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: "Tablet Picture",
    hi: "दवा / गोली का चित्र",
    ta: "மாத்திரை புகைப்படம்",
    te: "టాబ్లెట్ ఫోటో",
    kn: "ಮಾತ್ರೆ ಚಿತ್ರ",
    bn: "ট্যাবলেটের ছবি",
    mr: "गोळीचे छायाचित्र",
    ml: "ഗുളിക ചിത്രം",
    gu: "ટેબ્લેટ ફોટો",
    es: "Foto de la pastilla",
    fr: "Photo du comprimé",
    de: "Tablettenfoto",
    ja: "お薬の写真"
  };
  return labels[lang] || "Tablet Picture";
}

export const translations: Record<LanguageCode, TranslationStrings> = {
  en: {
    appName: "MediAlert",
    appSubtitle: "Smart Medicine Reminder",
    navHome: "Home",
    navTracker: "Tracker",
    navAdd: "Add",
    navManage: "Manage",
    navProfile: "Profile",
    greetingMorning: "Good Morning ☀️",
    greetingAfternoon: "Good Afternoon 🌤️",
    greetingEvening: "Good Evening 👋",
    tagline: "Never miss your medicine. Stay healthy, stay safe.",
    addMedicineBtn: "+ Add Medicine",
    nextMedicine: "Next Medicine",
    nextMedicineDesc: "Your immediate next scheduled dose based on time priority",
    noUpcomingDoses: "No upcoming doses scheduled for today!",
    allDoneToday: "All caught up! Great job maintaining your health schedule.",
    allDone: "Done!",
    allTakenSubtitle: "All medicines taken",
    greatJob: "Great job!",
    takeDoseNow: "Take Now ✓",
    takeNow: "Take Now ✓",
    takeDose: "Take Dose",
    snooze5Min: "Snooze 5 Min",
    snoozedFor5Min: "Snoozed for 5 minutes",
    skipDose: "Skip",
    dueNow: "DUE RIGHT NOW",
    overdueBy: "Overdue by {m} mins",
    dueIn: "Due in {m} mins",
    listenReminder: "Read Aloud 🔊",
    testAlarm: "Test Alarm",
    alarmActive: "MEDICATION ALARM ACTIVE",
    wakeAlarmTitle: "Time for your medicine!",
    wakeAlarmSubtitle: "Please take your scheduled medicine as shown below",
    foodConditions: {
      before_food: {
        title: "Before food",
        hint: "Take on an empty stomach, at least 30 minutes before eating."
      },
      after_food: {
        title: "After food",
        hint: "Take after meals or with food to protect your stomach."
      },
      with_food: {
        title: "With food",
        hint: "Take in the middle of a meal or with a snack."
      },
      anytime: {
        title: "Anytime",
        hint: "Can be taken at any time with or without food."
      }
    },
    weeklyProgress: "Weekly Progress & Compliance",
    weeklyAdherence: "Weekly Adherence",
    streakDays: "{d}-Day Streak",
    complianceRate: "Adherence Rate",
    dosesTaken: "Doses Taken",
    emergencyContact: "Family Caregiver Contact",
    callCaregiver: "Call Family Member",
    textCaregiver: "Send SMS to Family",
    sosAlert: "SOS Medication Alert",
    emergencyCaregiver: "Family Contact",
    editContact: "Configure Contact",
    saveContact: "Save Contact",
    offlineReady: "Offline Ready",
    online: "Online",
    offline: "Offline Mode",
    myMedications: "My Medicines",
    addMedication: "Add Medicine",
    editMedication: "Edit Medicine",
    deleteMedication: "Delete",
    medicationName: "Medicine Name",
    dosage: "Dosage (e.g. 500mg, 1 tablet)",
    type: "Medicine Form",
    foodConditionLabel: "Food Condition",
    scheduleTimes: "Scheduled Times",
    instructions: "Doctor Instructions / Notes",
    saveMedication: "Save Medicine",
    cancel: "Cancel",
    doseHistory: "Recent Dose Activity",
    textSize: "Text Size",
    soundAlerts: "Alarm Sound",
    takePic: "Take Photo with Camera",
    uploadPic: "Upload Picture",
    medicinePhoto: "Medicine Picture",
    patientDetails: "Personal Health Profile",
    patientName: "Your Full Name",
    age: "Age",
    bloodGroup: "Blood Group",
    doctorName: "Doctor / Specialist",
    doctorPhone: "Doctor's Phone Number",
    exportData: "Export Backup",
    importData: "Restore Data",
    resetData: "Load Sample Schedule"
  },

  hi: {
    appName: "MediAlert",
    appSubtitle: "स्मार्ट दवा रिमाइंडर",
    navHome: "होम",
    navTracker: "ट्रैकर",
    navAdd: "दवा जोड़ें",
    navManage: "दवाएं",
    navProfile: "प्रोफ़ाइल",
    greetingMorning: "शुभ प्रभात ☀️",
    greetingAfternoon: "शुभ दोपहर 🌤️",
    greetingEvening: "शुभ संध्या 👋",
    tagline: "अपनी दवा कभी न भूलें। स्वस्थ रहें, सुरक्षित रहें।",
    addMedicineBtn: "+ दवा जोड़ें",
    nextMedicine: "अगली दवा (Next Medicine)",
    nextMedicineDesc: "समय के अनुसार आपकी अगली निर्धारित दवा",
    noUpcomingDoses: "आज के लिए कोई आगामी खुराक बाकी नहीं है!",
    allDoneToday: "आज की सभी दवाएं पूरी हुईं! बहुत बढ़िया अनुशासन।",
    allDone: "शाबाश!",
    allTakenSubtitle: "आज की सभी दवाएं ली गईं",
    greatJob: "बहुत बढ़िया!",
    takeDoseNow: "अभी लें ✓",
    takeNow: "अभी लें ✓",
    takeDose: "दवा लें",
    snooze5Min: "5 मिनट स्नूज़",
    snoozedFor5Min: "5 मिनट के लिए स्थगित",
    skipDose: "छोड़ें",
    dueNow: "अभी लेने का समय",
    overdueBy: "{m} मिनट की देरी",
    dueIn: "{m} मिनट में",
    listenReminder: "सुनें (बोलकर बताएं) 🔊",
    testAlarm: "अलार्म टेस्ट करें",
    alarmActive: "दवा का अलार्म बज रहा है",
    wakeAlarmTitle: "आपकी दवा का समय हो गया है!",
    wakeAlarmSubtitle: "कृपया नीचे दी गई निर्धारित खुराक समय पर लें",
    foodConditions: {
      before_food: {
        title: "भोजन से पहले",
        hint: "खाना खाने से कम से कम 30 मिनट पहले खाली पेट लें।"
      },
      after_food: {
        title: "भोजन के बाद",
        hint: "पेट की सुरक्षा के लिए खाना खाने के बाद लें।"
      },
      with_food: {
        title: "भोजन के साथ",
        hint: "खाना खाते समय या नाश्ते के साथ लें।"
      },
      anytime: {
        title: "कभी भी",
        hint: "भोजन से पहले या बाद में कभी भी लिया जा सकता है।"
      }
    },
    weeklyProgress: "साप्ताहिक प्रगति व अनुशासन",
    weeklyAdherence: "दवा लेने की दर",
    streakDays: "{d} दिन का लगातार क्रम",
    complianceRate: "सफलता दर",
    dosesTaken: "ली गई खुराकें",
    emergencyContact: "परिवार व केयरगिवर संपर्क",
    callCaregiver: "परिवार को कॉल करें",
    textCaregiver: "परिवार को SMS भेजें",
    sosAlert: "SOS आपातकालीन सूचना",
    emergencyCaregiver: "परिवार का संपर्क",
    editContact: "संपर्क बदलें",
    saveContact: "संपर्क सहेजें",
    offlineReady: "ऑफ़लाइन तैयार",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन मोड",
    myMedications: "मेरी दवाइयाँ",
    addMedication: "दवा जोड़ें",
    editMedication: "संशोधित करें",
    deleteMedication: "हटाएं",
    medicationName: "दवा का नाम",
    dosage: "मात्रा (जैसे 500mg, 1 गोली)",
    type: "दवा का प्रकार",
    foodConditionLabel: "भोजन निर्देश",
    scheduleTimes: "दवा का समय",
    instructions: "डॉक्टर के निर्देश",
    saveMedication: "दवा सुरक्षित करें",
    cancel: "रद्द करें",
    doseHistory: "हाल का इतिहास",
    textSize: "अक्षर का आकार",
    soundAlerts: "अलार्म आवाज़",
    takePic: "कैमरे से फोटो लें",
    uploadPic: "फोटो अपलोड करें",
    medicinePhoto: "दवा की तस्वीर",
    patientDetails: "व्यक्तिगत स्वास्थ्य प्रोफ़ाइल",
    patientName: "आपका नाम",
    age: "उम्र",
    bloodGroup: "रक्त समूह",
    doctorName: "डॉक्टर का नाम",
    doctorPhone: "डॉक्टर का फोन",
    exportData: "बैकअप लें",
    importData: "डेटा पुनर्स्थापित करें",
    resetData: "नमूना दवाएं लोड करें"
  },

  ta: {
    appName: "MediAlert",
    appSubtitle: "ஸ்மார்ட் மருந்து நினைவூட்டல்",
    navHome: "முகப்பு",
    navTracker: "டிராக்கர்",
    navAdd: "மருந்து சேர்",
    navManage: "மருந்துகள்",
    navProfile: "சுயவிவரம்",
    greetingMorning: "காலை வணக்கம் ☀️",
    greetingAfternoon: "மதிய வணக்கம் 🌤️",
    greetingEvening: "மாலை வணக்கம் 👋",
    tagline: "மருந்தை மறக்காதீர்கள். ஆரோக்கியமாகவும் பாதுகாப்பாகவும் இருங்கள்.",
    addMedicineBtn: "+ மருந்து சேர்க்க",
    nextMedicine: "அடுத்த மருந்து (Next Medicine)",
    nextMedicineDesc: "நேர அடிப்படையில் நீங்கள் அடுத்ததாக உட்கொள்ள வேண்டிய மருந்து",
    noUpcomingDoses: "இன்றைய மீதமுள்ள மருந்துகள் எதுவும் இல்லை!",
    allDoneToday: "அருமை! இன்றைய மருந்துகள் அனைத்தும் முடிந்தது.",
    allDone: "முடிந்தது!",
    allTakenSubtitle: "அனைத்து மருந்துகளும் எடுக்கப்பட்டது",
    greatJob: "சிறந்த முயற்சி!",
    takeDoseNow: "இப்போது எடு ✓",
    takeNow: "இப்போது எடு ✓",
    takeDose: "மருந்து எடு",
    snooze5Min: "5 நிமிடம் தள்ளிவை",
    snoozedFor5Min: "5 நிமிடங்கள் தள்ளிவைக்கப்பட்டது",
    skipDose: "தவிர்",
    dueNow: "உடனே எடுக்க வேண்டிய நேரம்",
    overdueBy: "{m} நிமிடம் தாமதம்",
    dueIn: "{m} நிமிடத்தில்",
    listenReminder: "குரலில் கேட்க 🔊",
    testAlarm: "அலாரம் சரிபார்க்க",
    alarmActive: "மருந்து அலாரம் ஒலிக்கிறது",
    wakeAlarmTitle: "மருந்து சாப்பிடும் நேரம் வந்துவிட்டது!",
    wakeAlarmSubtitle: "கீழே கொடுக்கப்பட்டுள்ள மருந்தினை சரியான அளவில் உட்கொள்ளவும்",
    foodConditions: {
      before_food: {
        title: "உணவுக்கு முன்",
        hint: "சாப்பிடுவதற்கு 30 நிமிடங்களுக்கு முன் வெறும் வயிற்றில் உட்கொள்ளவும்."
      },
      after_food: {
        title: "உணவுக்குப் பின்",
        hint: "வயிற்று உபாதைகளைத் தவிர்க்க சாப்பிட்ட பின் உட்கொள்ளவும்."
      },
      with_food: {
        title: "உணவுடன்",
        hint: "உணவு உண்ணும் போதே சேர்த்து உட்கொள்ளவும்."
      },
      anytime: {
        title: "எப்போது வேண்டுமானாலும்",
        hint: "உணவுக்கு முன் அல்லது பின் எப்போது வேண்டுமானாலும் உட்கொள்ளலாம்."
      }
    },
    weeklyProgress: "வாராந்திர முன்னேற்றம்",
    weeklyAdherence: "மருந்து உட்கொள்ளும் அளவு",
    streakDays: "{d} நாட்கள் தொடர்ச்சி",
    complianceRate: "துல்லிய விகிதம்",
    dosesTaken: "உட்கொண்ட மருந்துகள்",
    emergencyContact: "குடும்ப உறுப்பினர் / பராமரிப்பாளர் தொடர்பு",
    callCaregiver: "குடும்பத்தினரை அழைக்கவும்",
    textCaregiver: "குடும்பத்தினருக்கு SMS அனுப்பவும்",
    sosAlert: "SOS அவசர உதவி",
    emergencyCaregiver: "குடும்ப தொடர்பு",
    editContact: "தகவலை மாற்று",
    saveContact: "சேமிக்கவும்",
    offlineReady: "ஆஃப்லைன் தயாராக உள்ளது",
    online: "ஆன்லைன்",
    offline: "ஆஃப்லைன் முறை",
    myMedications: "எனது மருந்துகள்",
    addMedication: "மருந்து சேர்",
    editMedication: "திருத்து",
    deleteMedication: "நீக்கு",
    medicationName: "மருந்தின் பெயர்",
    dosage: "அளவு (எ.கா. 500mg, 1 மாத்திரை)",
    type: "மருந்து வகை",
    foodConditionLabel: "உணவு முறை",
    scheduleTimes: "மருந்து உட்கொள்ளும் நேரம்",
    instructions: "மருத்துவரின் அறிவுரை",
    saveMedication: "மருந்தை சேமி",
    cancel: "ரத்து செய்",
    doseHistory: "சமீபத்திய வரலாறு",
    textSize: "எழுத்து அளவு",
    soundAlerts: "அலாரம் ஒலி",
    takePic: "கேமராவில் படம் எடு",
    uploadPic: "படம் பதிவேற்று",
    medicinePhoto: "மருந்து புகைப்படம்",
    patientDetails: "சுயவிவரம் மற்றும் நல்வாழ்வு",
    patientName: "உங்கள் பெயர்",
    age: "வயது",
    bloodGroup: "இரத்த பிரிவு",
    doctorName: "மருத்துவர் பெயர்",
    doctorPhone: "மருத்துவர் தொலைபேசி",
    exportData: "காப்புப்பிரதி எடு",
    importData: "மீட்டமைக்க",
    resetData: "மாதிரி அட்டவணை"
  },

  te: {
    appName: "MediAlert",
    appSubtitle: "స్మార్ట్ మందుల రిమైండర్",
    navHome: "హోమ్",
    navTracker: "ట్రాకర్",
    navAdd: "మందు జోడించు",
    navManage: "మందులు",
    navProfile: "ప్రొఫైల్",
    greetingMorning: "శుభోదయం ☀️",
    greetingAfternoon: "శుభ మధ్యాహ్నం 🌤️",
    greetingEvening: "శుభ సాయంత్రం 👋",
    tagline: "మీ మందులను ఎప్పుడూ మరచిపోవద్దు. ఆరోగ్యంగా, సురక్షితంగా ఉండండి.",
    addMedicineBtn: "+ మందు జోడించండి",
    nextMedicine: "తదుపరి మందు (Next Medicine)",
    nextMedicineDesc: "సమయం ప్రకారం మీరు తదుపరి తీసుకోవలసిన మందు",
    noUpcomingDoses: "ఈ రోజుకి ఇంకేమీ మందులు లేవు!",
    allDoneToday: "అద్భుతం! నేటి మందులన్నీ పూర్తి అయ్యాయి.",
    allDone: "పూర్తయింది!",
    allTakenSubtitle: "అన్ని మందులు వేసుకున్నారు",
    greatJob: "చాలా బాగుంది!",
    takeDoseNow: "ఇప్పుడే వేసుకో ✓",
    takeNow: "ఇప్పుడే వేసుకో ✓",
    takeDose: "మందు వేసుకో",
    snooze5Min: "5 నిమిషాలు స్నూజ్",
    snoozedFor5Min: "5 నిమిషాలు వాయిదా పడింది",
    skipDose: "దాటవేయి",
    dueNow: "ఇప్పుడే తీసుకోవలసిన సమయం",
    overdueBy: "{m} నిమిషాల ఆలస్యం",
    dueIn: "{m} నిమిషాలలో",
    listenReminder: "వాయిస్ వినండి 🔊",
    testAlarm: "అలారం పరీక్షించండి",
    alarmActive: "మందుల అలారం మోగుతోంది",
    wakeAlarmTitle: "మందు వేసుకునే సమయం అయింది!",
    wakeAlarmSubtitle: "దయచేసి క్రింద చూపిన మందును సూచించిన మోతాదులో తీసుకోండి",
    foodConditions: {
      before_food: {
        title: "భోజనానికి ముందు",
        hint: "భోజనానికి కనీసం 30 నిమిషాల ముందు ఖాళీ కడుపుతో తీసుకోండి."
      },
      after_food: {
        title: "భోజనం తర్వాత",
        hint: "కడుపు సమస్యలను నివారించడానికి భోజనం తర్వాత తీసుకోండి."
      },
      with_food: {
        title: "భోజనంతో పాటు",
        hint: "భోజనం చేస్తున్నప్పుడు లేదా అల్పాహారంతో కలిపి తీసుకోండి."
      },
      anytime: {
        title: "ఎప్పుడైనా",
        hint: "భోజనంతో సంబంధం లేకుండా ఎప్పుడైనా తీసుకోవచ్చు."
      }
    },
    weeklyProgress: "వారపు పురోగతి & క్రమశిక్షణ",
    weeklyAdherence: "మందుల క్రమశిక్షణ రేటు",
    streakDays: "{d} రోజుల నిరంతర కొనసాగింపు",
    complianceRate: "విజయవంత రేటు",
    dosesTaken: "తీసుకున్న డోసులు",
    emergencyContact: "కుటుంబ సభ్యుడు & సంరక్షకుల సమాచారం",
    callCaregiver: "కుటుంబ సభ్యునికి కాల్ చేయండి",
    textCaregiver: "కుటుంబ సభ్యునికి SMS పంపండి",
    sosAlert: "SOS అత్యవసర హెచ్చరిక",
    emergencyCaregiver: "కుటుంబ పరిచయం",
    editContact: "సవరించు",
    saveContact: "భద్రపరచు",
    offlineReady: "ఆఫ్‌లైన్ సిద్ధంగా ఉంది",
    online: "ఆన్‌లైన్",
    offline: "ఆఫ్‌లైన్ మోడ్",
    myMedications: "నా మందులు",
    addMedication: "మందు జోడించు",
    editMedication: "సవరించు",
    deleteMedication: "తొలగించు",
    medicationName: "మందు పేరు",
    dosage: "మోతాదు (ఉదా: 500mg, 1 మాత్ర)",
    type: "మందు రకం",
    foodConditionLabel: "ఆహార నియమం",
    scheduleTimes: "తీసుకోవలసిన సమయాలు",
    instructions: "వైద్యుని సూచనలు",
    saveMedication: "మందును భద్రపరచండి",
    cancel: "రద్దు",
    doseHistory: "ఇటీవలి చరిత్ర",
    textSize: "అక్షరాల పరిమాణం",
    soundAlerts: "అలారం శబ్దం",
    takePic: "కెమెరాతో ఫోటో తీయండి",
    uploadPic: "ఫోటో అప్‌లోడ్ చేయండి",
    medicinePhoto: "మందుల ఫోటో",
    patientDetails: "వ్యక్తిగత ఆరోగ్య ప్రొఫైల్",
    patientName: "మీ పేరు",
    age: "వయస్సు",
    bloodGroup: "రక్త వర్గం",
    doctorName: "వైద్యుని పేరు",
    doctorPhone: "వైద్యుని ఫోన్ నంబర్",
    exportData: "బ్యాకప్ ఎగుమతి",
    importData: "డేటా పునరుద్ధరణ",
    resetData: "నమూనా మందులను లోడ్ చేయండి"
  },

  kn: {
    appName: "MediAlert",
    appSubtitle: "ಸ್ಮಾರ್ಟ್ ಔಷಧಿ ಜ್ಞಾಪಕ ಪತ್ರ",
    navHome: "ಮುಖಪುಟ",
    navTracker: "ಟ್ರ್ಯಾಕರ್",
    navAdd: "ಔಷಧಿ ಸೇರಿಸಿ",
    navManage: "ಔಷಧಿಗಳು",
    navProfile: "ಪ್ರೊಫೈಲ್",
    greetingMorning: "ಶುಭೋದಯ ☀️",
    greetingAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ 🌤️",
    greetingEvening: "ಶುಭ ಸಂಜೆ 👋",
    tagline: "ಔಷಧಿಯನ್ನು ಎಂದಿಗೂ ಮರೆಯಬೇಡಿ. ಆರೋಗ್ಯವಾಗಿ, ಸುರಕ್ಷಿತವಾಗಿರಿ.",
    addMedicineBtn: "+ ಔಷಧಿ ಸೇರಿಸಿ",
    nextMedicine: "ಮುಂದಿನ ಔಷಧಿ (Next Medicine)",
    nextMedicineDesc: "ಸಮಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀವು ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಮುಂದಿನ ಔಷಧಿ",
    noUpcomingDoses: "ಇಂದು ಇನ್ನು ಯಾವುದೇ ಔಷಧಿಯ ಬಾಕಿ ಇಲ್ಲ!",
    allDoneToday: "ಅದ್ಭುತ! ಇಂದಿನ ಎಲ್ಲಾ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ.",
    allDone: "ಮುಗಿದಿದೆ!",
    allTakenSubtitle: "ಎಲ್ಲಾ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ",
    greatJob: "ಉತ್ತಮ ಕೆಲಸ!",
    takeDoseNow: "ಈಗಲೇ ತೆಗೆದುಕೊಳ್ಳಿ ✓",
    takeNow: "ಈಗಲೇ ತೆಗೆದುಕೊಳ್ಳಿ ✓",
    takeDose: "ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ",
    snooze5Min: "5 ನಿಮಿಷ ಮುಂದೂಡಿ",
    snoozedFor5Min: "5 ನಿಮಿಷಗಳಿಗೆ ಮುಂದೂಡಲಾಗಿದೆ",
    skipDose: "ಬಿಟ್ಟುಬಿಡಿ",
    dueNow: "ಈಗಲೇ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ",
    overdueBy: "{m} ನಿಮಿಷ ತಡವಾಗಿದೆ",
    dueIn: "{m} ನಿಮಿಷದಲ್ಲಿ",
    listenReminder: "ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ 🔊",
    testAlarm: "ಅಲಾರಾಂ ಪರೀಕ್ಷಿಸಿ",
    alarmActive: "ಔಷಧಿ ಅಲಾರಾಂ ರಿಂಗಣಿಸುತ್ತಿದೆ",
    wakeAlarmTitle: "ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ!",
    wakeAlarmSubtitle: "ದಯವಿಟ್ಟು ನಿಗದಿತ ಔಷಧಿಯನ್ನು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ",
    foodConditions: {
      before_food: {
        title: "ಊಟಕ್ಕೆ ಮೊದಲು",
        hint: "ಊಟಕ್ಕೆ ಕನಿಷ್ಠ 30 ನಿಮಿಷಗಳ ಮೊದಲು ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಿ."
      },
      after_food: {
        title: "ಊಟದ ನಂತರ",
        hint: "ಹೊಟ್ಟೆಯ ತೊಂದರೆ ತಪ್ಪಿಸಲು ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ."
      },
      with_food: {
        title: "ಊಟದ ಜೊತೆಗೆ",
        hint: "ಊಟ ಮಾಡುತ್ತಿರುವಾಗ ಅಥವಾ ಲಘು ಉಪಹಾರದೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ."
      },
      anytime: {
        title: "ಯಾವಾಗ ಬೇಕಾದರೂ",
        hint: "ಊಟಕ್ಕೆ ಮುಂಚೆ ಅಥವಾ ನಂತರ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಬಹುದು."
      }
    },
    weeklyProgress: "ಸಾಪ್ತಾಹಿಕ ಪ್ರಗತಿ ಮತ್ತು ಶಿಸ್ತು",
    weeklyAdherence: "ಔಷಧಿ ಸೇವನೆಯ ಶೇಕಡಾವಾರು",
    streakDays: "{d} ದಿನಗಳ ನಿರಂತರ ಶ್ರೇಣಿ",
    complianceRate: "ನಿಷ್ಠೆಯ ದರ",
    dosesTaken: "ತೆಗೆದುಕೊಂಡ ಪ್ರಮಾಣಗಳು",
    emergencyContact: "ಕುಟುಂಬ ಮತ್ತು ಆರೈಕೆದಾರರ ಸಂಪರ್ಕ",
    callCaregiver: "ಕುಟುಂಬದವರಿಗೆ ಕರೆ ಮಾಡಿ",
    textCaregiver: "ಕುಟುಂಬದವರಿಗೆ SMS ಕಳುಹಿಸಿ",
    sosAlert: "SOS ತುರ್ತು ಎಚ್ಚರಿಕೆ",
    emergencyCaregiver: "ಕುಟುಂಬದ ಸಂಪರ್ಕ",
    editContact: "ಸಂಪರ್ಕ ಬದಲಾಯಿಸಿ",
    saveContact: "ಉಳಿಸಿ",
    offlineReady: "ಆಫ್‌ಲೈನ್ ಲಭ್ಯವಿದೆ",
    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
    myMedications: "ನನ್ನ ಔಷಧಿಗಳು",
    addMedication: "ಔಷಧಿ ಸೇರಿಸಿ",
    editMedication: "ತಿದ್ದು",
    deleteMedication: "ಅಳಿಸಿ",
    medicationName: "ಔಷಧಿಯ ಹೆಸರು",
    dosage: "ಪ್ರಮಾಣ (ಉದಾ: 500mg, 1 ಮಾತ್ರೆ)",
    type: "ಔಷಧಿಯ ಪ್ರಕಾರ",
    foodConditionLabel: "ಆಹಾರದ ನಿಯಮ",
    scheduleTimes: "ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯಗಳು",
    instructions: "ವೈದ್ಯರ ಸೂಚನೆಗಳು",
    saveMedication: "ಔಷಧಿಯನ್ನು ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    doseHistory: "ಇತ್ತೀಚಿನ ಇತಿಹಾಸ",
    textSize: "ಅಕ್ಷರದ ಗಾತ್ರ",
    soundAlerts: "ಅಲಾರಾಂ ಶಬ್ದ",
    takePic: "ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    uploadPic: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    medicinePhoto: "ಔಷಧಿಯ ಚಿತ್ರ",
    patientDetails: "ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್",
    patientName: "ನಿಮ್ಮ ಹೆಸರು",
    age: "ವಯಸ್ಸು",
    bloodGroup: "ರಕ್ತದ ಗುಂಪು",
    doctorName: "ವೈದ್ಯರ ಹೆಸರು",
    doctorPhone: "ವೈದ್ಯರ ಫೋನ್ ನಂಬರ್",
    exportData: "ಬ್ಯಾಕಪ್ ರಫ್ತು",
    importData: "ಡೇಟಾ ಮರುಸ್ಥಾಪನೆ",
    resetData: "ಮಾದರಿ ವೇಳಾಪಟ್ಟಿ"
  },

  bn: {
    appName: "MediAlert",
    appSubtitle: "স্মার্ট ওষুধের অনুস্মারক",
    navHome: "হোম",
    navTracker: "ট্র্যাকার",
    navAdd: "ওষুধ যোগ করুন",
    navManage: "ওষুধের তালিকা",
    navProfile: "প্রোফাইল",
    greetingMorning: "শুভ সকাল ☀️",
    greetingAfternoon: "শুভ দুপুর 🌤️",
    greetingEvening: "শুভ সন্ধ্যা 👋",
    tagline: "আপনার ওষুধ কখনও ভুলবেন না। সুস্থ থাকুন, সুরক্ষিত থাকুন।",
    addMedicineBtn: "+ ওষুধ যোগ করুন",
    nextMedicine: "পরবর্তী ওষুধ (Next Medicine)",
    nextMedicineDesc: "সময় অনুযায়ী আপনার পরবর্তী নির্ধারিত ওষুধ",
    noUpcomingDoses: "আজকের জন্য আর কোনো ওষুধ বাকি নেই!",
    allDoneToday: "দারুণ! আজকের সব ওষুধ সময়মতো নেওয়া হয়েছে।",
    allDone: "সম্পন্ন!",
    allTakenSubtitle: "সব ওষুধ খাওয়া হয়েছে",
    greatJob: "খুব ভালো!",
    takeDoseNow: "এখনই খান ✓",
    takeNow: "এখনই খান ✓",
    takeDose: "ওষুধ খান",
    snooze5Min: "৫ মিনিট স্নুজ",
    snoozedFor5Min: "৫ মিনিটের জন্য স্থগিত",
    skipDose: "বাদ দিন",
    dueNow: "এখনই খাওয়ার সময়",
    overdueBy: "{m} মিনিট বিলম্বিত",
    dueIn: "{m} মিনিটের মধ্যে",
    listenReminder: "ভয়েস শুনুন 🔊",
    testAlarm: "অ্যালার্ম পরীক্ষা করুন",
    alarmActive: "ওষুধের অ্যালার্ম বাজছে",
    wakeAlarmTitle: "ওষুধ খাওয়ার সময় হয়েছে!",
    wakeAlarmSubtitle: "দয়া করে নীচে উল্লিখিত ওষুধটি সময়মতো সেবন করুন",
    foodConditions: {
      before_food: {
        title: "খাবারের আগে",
        hint: "খাবার খাওয়ার কমপক্ষে ৩০ মিনিট আগে খালি পেটে খান।"
      },
      after_food: {
        title: "খাবারের পরে",
        hint: "পেটের সুরক্ষার জন্য খাবার খাওয়ার পরে খান।"
      },
      with_food: {
        title: "খাবারের সাথে",
        hint: "খাবার খাওয়ার মাঝে বা হালকা নাস্তার সাথে খান।"
      },
      anytime: {
        title: "যেকোনো সময়",
        hint: "খাবারের আগে বা পরে যেকোনো সময় খাওয়া যেতে পারে।"
      }
    },
    weeklyProgress: "সাপ্তাহিক অগ্রগতি",
    weeklyAdherence: "ওষুধ খাওয়ার হার",
    streakDays: "{d} দিনের ধারাবাহিকতা",
    complianceRate: "সফলতার হার",
    dosesTaken: "গৃহীত ওষুধের মাত্রা",
    emergencyContact: "পরিবার ও তত্ত্বাবধায়ক যোগাযোগ",
    callCaregiver: "পরিবারের সদস্যকে কল করুন",
    textCaregiver: "পরিবারকে SMS পাঠান",
    sosAlert: "SOS জরুরি সতর্কতা",
    emergencyCaregiver: "পারিবারিক যোগাযোগ",
    editContact: "যোগাযোগ পরিবর্তন",
    saveContact: "সংরক্ষণ করুন",
    offlineReady: "অফলাইন প্রস্তুত",
    online: "অনলাইন",
    offline: "অফলাইন মোড",
    myMedications: "আমার ওষুধসমূহ",
    addMedication: "ওষুধ যোগ করুন",
    editMedication: "সম্পাদনা",
    deleteMedication: "মুছে ফেলুন",
    medicationName: "ওষুধের নাম",
    dosage: "মাত্রা (যেমন 500mg, ১টি ট্যাবলেট)",
    type: "ওষুধের প্রকার",
    foodConditionLabel: "খাবারের নিয়ম",
    scheduleTimes: "ওষুধের নির্ধারিত সময়",
    instructions: "ডাক্তারের পরামর্শ",
    saveMedication: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    doseHistory: "সাম্প্রতিক ইতিহাস",
    textSize: "অক্ষরের আকার",
    soundAlerts: "অ্যালার্ম শব্দ",
    takePic: "ক্যামেরা দিয়ে ছবি তুলুন",
    uploadPic: "ছবি আপলোড করুন",
    medicinePhoto: "ওষুধের ছবি",
    patientDetails: "ব্যক্তিগত স্বাস্থ্য প্রোফাইল",
    patientName: "আপনার নাম",
    age: "বয়স",
    bloodGroup: "রক্তের গ্রুপ",
    doctorName: "ডাক্তারের নাম",
    doctorPhone: "ডাক্তারের ফোন নম্বর",
    exportData: "ব্যাকআপ এক্সপোর্ট",
    importData: "পুনরুদ্ধার করুন",
    resetData: "নমুনা রুটিন"
  },

  mr: {
    appName: "MediAlert",
    appSubtitle: "स्मार्ट औषध स्मरणपत्र",
    navHome: "मुख्यपृष्ठ",
    navTracker: "ट्रॅकर",
    navAdd: "औषध जोडा",
    navManage: "माझी औषधे",
    navProfile: "प्रोफाइल",
    greetingMorning: "शुभ सकाळ ☀️",
    greetingAfternoon: "शुभ दुपार 🌤️",
    greetingEvening: "शुभ संध्याकाळ 👋",
    tagline: "आपले औषध कधीही विसरू नका. निरोगी राहा, सुरक्षित राहा.",
    addMedicineBtn: "+ औषध जोडा",
    nextMedicine: "पुढील औषध (Next Medicine)",
    nextMedicineDesc: "वेळेनुसार आपले पुढील नियोजित औषध",
    noUpcomingDoses: "आजसाठी आणखी औषध शिल्लक नाही!",
    allDoneToday: "छान! आजची सर्व औषधे वेळेवर घेतली गेली आहेत.",
    allDone: "पूर्ण झाले!",
    allTakenSubtitle: "सर्व औषधे घेतली आहेत",
    greatJob: "खूप छान!",
    takeDoseNow: "आता घ्या ✓",
    takeNow: "आता घ्या ✓",
    takeDose: "औषध घ्या",
    snooze5Min: "५ मिनिटे स्नूझ",
    snoozedFor5Min: "५ मिनिटांसाठी पुढे ढकलले",
    skipDose: "वगळा",
    dueNow: "औषध घेण्याची वेळ झाली",
    overdueBy: "{m} मिनिटे उशीर",
    dueIn: "{m} मिनिटांत",
    listenReminder: "आवाज ऐका 🔊",
    testAlarm: "अलार्म तपासा",
    alarmActive: "औषधाचा अलार्म वाजत आहे",
    wakeAlarmTitle: "औषध घेण्याची वेळ झाली आहे!",
    wakeAlarmSubtitle: "कृपया खाली दर्शविलेले औषध वेळेवर घ्या",
    foodConditions: {
      before_food: {
        title: "जेवणापूर्वी",
        hint: "जेवणाच्या किमान ३० मिनिटे आधी रिकाम्या पोटी घ्या."
      },
      after_food: {
        title: "जेवणानंतर",
        hint: "पोटाच्या सुरक्षेसाठी जेवणानंतर घ्या."
      },
      with_food: {
        title: "जेवणासोबत",
        hint: "जेवताना किंवा नाश्त्यासोबत घ्या."
      },
      anytime: {
        title: "कधीही",
        hint: "जेवणापूर्वी किंवा नंतर कधीही घेऊ शकता."
      }
    },
    weeklyProgress: "साप्ताहिक प्रगती",
    weeklyAdherence: "औषध घेण्याचे प्रमाण",
    streakDays: "{d} दिवसांचे सातत्य",
    complianceRate: "अनुपालन दर",
    dosesTaken: "घेतलेली औषधे",
    emergencyContact: "कुटुंब व काळजीवाहक संपर्क",
    callCaregiver: "कुटुंबाला कॉल करा",
    textCaregiver: "कुटुंबाला SMS पाठवा",
    sosAlert: "SOS आपत्कालीन सूचना",
    emergencyCaregiver: "कौटुंबिक संपर्क",
    editContact: "बदला",
    saveContact: "जतन करा",
    offlineReady: "ऑफलाइन उपलब्ध",
    online: "ऑनलाइन",
    offline: "ऑफलाइन मोड",
    myMedications: "माझी औषधे",
    addMedication: "औषध जोडा",
    editMedication: "संपादन",
    deleteMedication: "हटवा",
    medicationName: "औषधाचे नाव",
    dosage: "डोस (उदा. 500mg, १ गोळी)",
    type: "औषधाचा प्रकार",
    foodConditionLabel: "जेवणाचा नियम",
    scheduleTimes: "औषधाच्या वेळा",
    instructions: "डॉक्टरांचा सल्ला",
    saveMedication: "जतन करा",
    cancel: "रद्द करा",
    doseHistory: "इतिहास",
    textSize: "फॉन्ट आकार",
    soundAlerts: "अलार्म आवाज",
    takePic: "कॅमेऱ्याने फोटो काढा",
    uploadPic: "फोटो अपलोड करा",
    medicinePhoto: "औषधाचा फोटो",
    patientDetails: "वैयक्तिक आरोग्य प्रोफाइल",
    patientName: "तुमचे नाव",
    age: "वय",
    bloodGroup: "रक्तगट",
    doctorName: "डॉक्टरांचे नाव",
    doctorPhone: "डॉक्टरांचा फोन",
    exportData: "बॅकअप घ्या",
    importData: "पुनर्संचयित करा",
    resetData: "नमुना वेळापत्रक"
  },

  ml: {
    appName: "MediAlert",
    appSubtitle: "സ്മാർട്ട് മരുന്ന് റിമൈൻഡർ",
    navHome: "ഹോം",
    navTracker: "ട്രാക്കർ",
    navAdd: "മരുന്ന് ചേർക്കുക",
    navManage: "മരുന്നുകൾ",
    navProfile: "പ്രൊഫൈൽ",
    greetingMorning: "സുപ്രഭാതം ☀️",
    greetingAfternoon: "ശുഭ ഉച്ചതിരിഞ്ഞ് 🌤️",
    greetingEvening: "ശുഭ സായാഹ്നം 👋",
    tagline: "മരുന്ന് കഴിക്കാൻ മറക്കരുത്. ആരോഗ്യത്തോടെയും സുരക്ഷിതമായും ഇരിക്കുക.",
    addMedicineBtn: "+ മരുന്ന് ചേർക്കുക",
    nextMedicine: "അടുത്ത മരുന്ന് (Next Medicine)",
    nextMedicineDesc: "സമയമനുസരിച്ച് കഴിക്കേണ്ട അടുത്ത മരുന്ന്",
    noUpcomingDoses: "ഇന്നത്തേക്ക് ഇനി മരുന്നുകൾ ഒന്നുമില്ല!",
    allDoneToday: "നന്നായി! ഇന്നത്തെ എല്ലാ മരുന്നുകളും കഴിച്ചു.",
    allDone: "പൂർത്തിയായി!",
    allTakenSubtitle: "എല്ലാ മരുന്നുകളും കഴിച്ചു",
    greatJob: "വളരെ നല്ലത്!",
    takeDoseNow: "ഇപ്പോൾ കഴിക്കുക ✓",
    takeNow: "ഇപ്പോൾ കഴിക്കുക ✓",
    takeDose: "മരുന്ന് കഴിക്കുക",
    snooze5Min: "5 മിനിറ്റ് മാറ്റിവെക്കുക",
    snoozedFor5Min: "5 മിനിറ്റിലേക്ക് മാറ്റി",
    skipDose: "ഒഴിവാക്കുക",
    dueNow: "ഇപ്പോൾ കഴിക്കേണ്ട സമയം",
    overdueBy: "{m} മിനിറ്റ് വൈകി",
    dueIn: "{m} മിനിറ്റിനുള്ളിൽ",
    listenReminder: "ശബ്ദം കേൾക്കുക 🔊",
    testAlarm: "അലാറം പരിശോധിക്കുക",
    alarmActive: "മരുന്ന് അലാറം മുഴങ്ങുന്നു",
    wakeAlarmTitle: "മരുന്ന് കഴിക്കാനുള്ള സമയമായി!",
    wakeAlarmSubtitle: "ദയവായി കൃത്യസമയത്ത് മരുന്ന് കഴിക്കുക",
    foodConditions: {
      before_food: {
        title: "ഭക്ഷണത്തിന് മുൻപ്",
        hint: "ഭക്ഷണത്തിന് 30 മിനിറ്റ് മുൻപ് വെറുംവയറ്റിൽ കഴിക്കുക."
      },
      after_food: {
        title: "ഭക്ഷണത്തിന് ശേഷം",
        hint: "ഭക്ഷണത്തിന് ശേഷം കഴിക്കുക."
      },
      with_food: {
        title: "ഭക്ഷണത്തോടൊപ്പം",
        hint: "ഭക്ഷണം കഴിക്കുന്നതിനൊപ്പം കഴിക്കുക."
      },
      anytime: {
        title: "എപ്പോൾ വേണമെങ്കിലും",
        hint: "ഭക്ഷണത്തിന് മുൻപോ ശേഷമോ എപ്പോൾ വേണമെങ്കിലും കഴിക്കാം."
      }
    },
    weeklyProgress: "പ്രതിവാര പുരോഗതി",
    weeklyAdherence: "മരുന്ന് നിരക്ക്",
    streakDays: "{d} ദിവസത്തെ തുടർച്ച",
    complianceRate: "കൃത്യത",
    dosesTaken: "കഴിച്ച മരുന്നുകൾ",
    emergencyContact: "കുടുംബാംഗം & പരിചാരക സമ്പർക്കം",
    callCaregiver: "കുടുംബാംഗത്തെ വിളിക്കുക",
    textCaregiver: "കുടുംബാംഗത്തിന് SMS അയക്കുക",
    sosAlert: "SOS മുന്നറിയിപ്പ്",
    emergencyCaregiver: "കുടുംബ സമ്പർക്കം",
    editContact: "മാറ്റുക",
    saveContact: "സൂക്ഷിക്കുക",
    offlineReady: "ഓഫ്‌ലൈൻ തയ്യാറാണ്",
    online: "ഓൺലൈൻ",
    offline: "ഓഫ്‌ലൈൻ മോഡ്",
    myMedications: "എന്റെ മരുന്നുകൾ",
    addMedication: "മരുന്ന് ചേർക്കുക",
    editMedication: "തിരുത്തുക",
    deleteMedication: "മായ്ക്കുക",
    medicationName: "മരുന്നിന്റെ പേര്",
    dosage: "അളവ് (ഉദാ: 500mg)",
    type: "മരുന്നിന്റെ തരം",
    foodConditionLabel: "ഭക്ഷണ നിർദ്ദേശം",
    scheduleTimes: "കഴിക്കേണ്ട സമയം",
    instructions: "ഡോക്ടറുടെ നിർദ്ദേശങ്ങൾ",
    saveMedication: "സൂക്ഷിക്കുക",
    cancel: "റദ്ദാക്കുക",
    doseHistory: "ചരിത്രം",
    textSize: "അക്ഷര വലിപ്പം",
    soundAlerts: "അലാറം ശബ്ദം",
    takePic: "ക്യാമറയിൽ ഫോട്ടോ എടുക്കുക",
    uploadPic: "ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    medicinePhoto: "മരുന്നിന്റെ ചിത്രം",
    patientDetails: "വ്യക്തിഗത ആരോഗ്യ പ്രൊഫൈൽ",
    patientName: "നിങ്ങളുടെ പേര്",
    age: "പ്രായം",
    bloodGroup: "രക്തഗ്രൂപ്പ്",
    doctorName: "ഡോക്ടറുടെ പേര്",
    doctorPhone: "ഡോക്ടറുടെ നമ്പർ",
    exportData: "ബാക്കപ്പ് എടുക്കുക",
    importData: "വീണ്ടെടുക്കുക",
    resetData: "മാതൃകാ ഷെഡ്യൂൾ"
  },

  gu: {
    appName: "MediAlert",
    appSubtitle: "સ્માર્ટ દવા રિમાઇન્ડર",
    navHome: "હોમ",
    navTracker: "ટ્રેકર",
    navAdd: "દવા ઉમેરો",
    navManage: "દવાઓ",
    navProfile: "પ્રોફાઇલ",
    greetingMorning: "શુભ સવાર ☀️",
    greetingAfternoon: "શુભ બપોર 🌤️",
    greetingEvening: "શુભ સાંજ 👋",
    tagline: "તમારી દવા ક્યારેય ભૂલશો નહીં. સ્વસ્થ રહો, સુરક્ષિત રહો.",
    addMedicineBtn: "+ દવા ઉમેરો",
    nextMedicine: "આગલી દવા (Next Medicine)",
    nextMedicineDesc: "સમય પ્રમાણે તમારી આગલી દવા",
    noUpcomingDoses: "આજના માટે હવે કોઈ દવા બાકી નથી!",
    allDoneToday: "ખૂબ સરસ! આજની બધી દવાઓ પૂર્ણ થઈ ગઈ છે.",
    allDone: "પૂર્ણ થયું!",
    allTakenSubtitle: "બધી દવાઓ લેવાઈ ગઈ છે",
    greatJob: "ખૂબ સરસ!",
    takeDoseNow: "હમણાં લો ✓",
    takeNow: "હમણાં લો ✓",
    takeDose: "દવા લો",
    snooze5Min: "5 મિનિટ સ્નૂઝ",
    snoozedFor5Min: "5 મિનિટ માટે મુલતવી",
    skipDose: "છોડો",
    dueNow: "હમણાં લેવાનો સમય છે",
    overdueBy: "{m} મિનિટ મોડું",
    dueIn: "{m} મિનિટમાં",
    listenReminder: "અવાજ સાંભળો 🔊",
    testAlarm: "અલાર્મ તપાસો",
    alarmActive: "દવાનો અલાર્મ વાગી રહ્યો છે",
    wakeAlarmTitle: "દવા લેવાનો સમય થઈ ગયો છે!",
    wakeAlarmSubtitle: "કૃપા કરીને નીચે જણાવેલ દવા સમયસર લો",
    foodConditions: {
      before_food: {
        title: "જમ્યા પહેલા",
        hint: "જમવાના 30 મિનિટ પહેલા ભૂખ્યા પેટે લો."
      },
      after_food: {
        title: "જમ્યા પછી",
        hint: "જમ્યા પછી લો."
      },
      with_food: {
        title: "જમવાની સાથે",
        hint: "જમતી વખતે અથવા નાસ્તા સાથે લો."
      },
      anytime: {
        title: "ગમે ત્યારે",
        hint: "જમ્યા પહેલા કે પછી ગમે ત્યારે લઈ શકાય છે."
      }
    },
    weeklyProgress: "સાપ્તાહિક પ્રગતિ",
    weeklyAdherence: "દવા નિયમિતતા",
    streakDays: "{d} દિવસની સાતત્યતા",
    complianceRate: "સફળતા દર",
    dosesTaken: "લીધેલ ડોઝ",
    emergencyContact: "પરિવાર અને કેરગીવર સંપર્ક",
    callCaregiver: "પરિવારને કૉલ કરો",
    textCaregiver: "પરિવારને SMS મોકલો",
    sosAlert: "SOS ચેતવણી",
    emergencyCaregiver: "પરિવારનો સંપર્ક",
    editContact: "બદલો",
    saveContact: "સાચવો",
    offlineReady: "ઑફલાઇન તૈયાર",
    online: "ઑનલાઇન",
    offline: "ઑફલાઇન મોડ",
    myMedications: "મારી દવાઓ",
    addMedication: "દવા ઉમેરો",
    editMedication: "ફેરફાર કરો",
    deleteMedication: "કાઢી નાખો",
    medicationName: "દવાનું નામ",
    dosage: "માત્રા (દા.ત. 500mg, 1 ગોળી)",
    type: "દવાનો પ્રકાર",
    foodConditionLabel: "ખોરાકની સૂચના",
    scheduleTimes: "લેવાના સમય",
    instructions: "ડૉક્ટરની સલાહ",
    saveMedication: "સાચવો",
    cancel: "રદ કરો",
    doseHistory: "ઇતિહાસ",
    textSize: "અક્ષર કદ",
    soundAlerts: "અલાર્મ અવાજ",
    takePic: "કેમેરાથી ફોટો પાડો",
    uploadPic: "ફોટો અપલોડ કરો",
    medicinePhoto: "દવાનો ફોટો",
    patientDetails: "વ્યક્તિગત આરોગ્ય પ્રોફાઇલ",
    patientName: "તમારું નામ",
    age: "ઉંમર",
    bloodGroup: "બ્લડ ગ્રુપ",
    doctorName: "ડૉક્ટરનું નામ",
    doctorPhone: "ડૉક્ટરનો ફોન",
    exportData: "બેકઅપ લો",
    importData: "પુનઃસ્થાપિત કરો",
    resetData: "નમૂના શેડ્યૂલ"
  },

  es: {
    appName: "MediAlert",
    appSubtitle: "Recordatorio Inteligente de Medicamentos",
    navHome: "Inicio",
    navTracker: "Progreso",
    navAdd: "Añadir",
    navManage: "Medicinas",
    navProfile: "Perfil",
    greetingMorning: "Buenos Días ☀️",
    greetingAfternoon: "Buenas Tardes 🌤️",
    greetingEvening: "Buenas Noches 👋",
    tagline: "Nunca olvide sus medicinas. Manténgase sano y seguro.",
    addMedicineBtn: "+ Añadir Medicina",
    nextMedicine: "Próximo Medicamento (Next Medicine)",
    nextMedicineDesc: "Su próxima dosis programada",
    noUpcomingDoses: "¡No hay dosis pendientes programadas para hoy!",
    allDoneToday: "¡Todo al día! Excelente disciplina con su salud.",
    allDone: "¡Listo!",
    allTakenSubtitle: "Todas las medicinas tomadas",
    greatJob: "¡Excelente trabajo!",
    takeDoseNow: "Tomar Ahora ✓",
    takeNow: "Tomar Ahora ✓",
    takeDose: "Tomar Dosis",
    snooze5Min: "Posponer 5 Min",
    snoozedFor5Min: "Pospuesto por 5 minutos",
    skipDose: "Omitir",
    dueNow: "DILIGENCIA INMEDIATA",
    overdueBy: "Retraso de {m} min",
    dueIn: "En {m} min",
    listenReminder: "Escuchar en Voz Alta 🔊",
    testAlarm: "Probar Alarma",
    alarmActive: "ALARMA DE MEDICAMENTO ACTIVA",
    wakeAlarmTitle: "¡Hora de su medicamento!",
    wakeAlarmSubtitle: "Por favor tome su dosis prescrita",
    foodConditions: {
      before_food: {
        title: "Antes de comer",
        hint: "Tomar en ayunas al menos 30 minutos antes de comer."
      },
      after_food: {
        title: "Después de comer",
        hint: "Tomar después de los alimentos para proteger el estómago."
      },
      with_food: {
        title: "Con alimentos",
        hint: "Tomar durante la comida o con un refrigerio."
      },
      anytime: {
        title: "A cualquier hora",
        hint: "Se puede tomar con o sin alimentos."
      }
    },
    weeklyProgress: "Progreso Semanal",
    weeklyAdherence: "Adherencia Semanal",
    streakDays: "{d} Días Seguidos",
    complianceRate: "Tasa de Adherencia",
    dosesTaken: "Dosis Tomadas",
    emergencyContact: "Contacto de Familiar y Cuidador",
    callCaregiver: "Llamar a Familiar",
    textCaregiver: "Enviar SMS a Familiar",
    sosAlert: "Alerta SOS",
    emergencyCaregiver: "Contacto Familiar",
    editContact: "Configurar",
    saveContact: "Guardar",
    offlineReady: "Listo Offline",
    online: "En Línea",
    offline: "Modo Offline",
    myMedications: "Mis Medicamentos",
    addMedication: "Añadir Medicamento",
    editMedication: "Editar",
    deleteMedication: "Eliminar",
    medicationName: "Nombre del Medicamento",
    dosage: "Dosis (ej. 500mg)",
    type: "Tipo",
    foodConditionLabel: "Condición de Alimentos",
    scheduleTimes: "Horarios Diarios",
    instructions: "Instrucciones Médicas",
    saveMedication: "Guardar",
    cancel: "Cancelar",
    doseHistory: "Historial de Dosis",
    textSize: "Tamaño de Texto",
    soundAlerts: "Sonido de Alarma",
    takePic: "Tomar Foto con Cámara",
    uploadPic: "Subir Foto",
    medicinePhoto: "Foto de la Medicina",
    patientDetails: "Perfil de Salud Personal",
    patientName: "Su Nombre Completo",
    age: "Edad",
    bloodGroup: "Grupo Sanguíneo",
    doctorName: "Médico / Especialista",
    doctorPhone: "Teléfono del Médico",
    exportData: "Exportar Copia",
    importData: "Restaurar",
    resetData: "Cargar Datos de Muestra"
  },

  fr: {
    appName: "MediAlert",
    appSubtitle: "Rappel Intelligent de Médicaments",
    navHome: "Accueil",
    navTracker: "Suivi",
    navAdd: "Ajouter",
    navManage: "Médicaments",
    navProfile: "Profil",
    greetingMorning: "Bonjour ☀️",
    greetingAfternoon: "Bon Après-midi 🌤️",
    greetingEvening: "Bonsoir 👋",
    tagline: "N'oubliez jamais vos médicaments. Restez en bonne santé.",
    addMedicineBtn: "+ Ajouter Médicament",
    nextMedicine: "Prochain Médicament",
    nextMedicineDesc: "Votre prochaine dose prévue",
    noUpcomingDoses: "Aucune dose restante pour aujourd'hui !",
    allDoneToday: "Tout est à jour ! Félicitations.",
    allDone: "Terminé !",
    allTakenSubtitle: "Tous les médicaments pris",
    greatJob: "Bravo !",
    takeDoseNow: "Prendre Maintenant ✓",
    takeNow: "Prendre Maintenant ✓",
    takeDose: "Prendre",
    snooze5Min: "Répéter 5 Min",
    snoozedFor5Min: "Reporté de 5 minutes",
    skipDose: "Passer",
    dueNow: "À PRENDRE MAINTENANT",
    overdueBy: "En retard de {m} min",
    dueIn: "Dans {m} min",
    listenReminder: "Écouter le Rappel 🔊",
    testAlarm: "Tester l'Alarme",
    alarmActive: "ALARME MÉDICALE ACTIVE",
    wakeAlarmTitle: "C'est l'heure de votre médicament !",
    wakeAlarmSubtitle: "Veuillez prendre votre dose prescrite",
    foodConditions: {
      before_food: {
        title: "Avant le repas",
        hint: "Prendre à jeun au moins 30 minutes avant de manger."
      },
      after_food: {
        title: "Après le repas",
        hint: "Prendre après le repas pour protéger l'estomac."
      },
      with_food: {
        title: "Pendant le repas",
        hint: "Prendre au milieu du repas."
      },
      anytime: {
        title: "À tout moment",
        hint: "Peut être pris à tout moment avec ou sans nourriture."
      }
    },
    weeklyProgress: "Progrès Hebdomadaire",
    weeklyAdherence: "Observance Hebdomadaire",
    streakDays: "Série de {d} jours",
    complianceRate: "Taux d'Observance",
    dosesTaken: "Doses Prises",
    emergencyContact: "Contact Familial & Proche",
    callCaregiver: "Appeler Famille",
    textCaregiver: "SMS à la Famille",
    sosAlert: "Alerte SOS",
    emergencyCaregiver: "Contact Famille",
    editContact: "Modifier",
    saveContact: "Enregistrer",
    offlineReady: "Prêt Hors Ligne",
    online: "En Ligne",
    offline: "Mode Hors Ligne",
    myMedications: "Mes Médicaments",
    addMedication: "Ajouter Médicament",
    editMedication: "Modifier",
    deleteMedication: "Supprimer",
    medicationName: "Nom du Médicament",
    dosage: "Posologie (ex. 500mg)",
    type: "Forme",
    foodConditionLabel: "Condition Alimentaire",
    scheduleTimes: "Heures Prévues",
    instructions: "Instructions Médicales",
    saveMedication: "Enregistrer",
    cancel: "Annuler",
    doseHistory: "Historique des Doses",
    textSize: "Taille du Texte",
    soundAlerts: "Son d'Alarme",
    takePic: "Prendre Photo",
    uploadPic: "Téléverser Photo",
    medicinePhoto: "Photo du Médicament",
    patientDetails: "Profil Santé Personnel",
    patientName: "Votre Nom Complet",
    age: "Âge",
    bloodGroup: "Groupe Sanguin",
    doctorName: "Médecin Traitant",
    doctorPhone: "Téléphone Médecin",
    exportData: "Exporter",
    importData: "Restaurer",
    resetData: "Charger Exemple"
  },

  de: {
    appName: "MediAlert",
    appSubtitle: "Smarte Medikamenten-Erinnerung",
    navHome: "Start",
    navTracker: "Tracker",
    navAdd: "Hinzufügen",
    navManage: "Medikamente",
    navProfile: "Profil",
    greetingMorning: "Guten Morgen ☀️",
    greetingAfternoon: "Guten Tag 🌤️",
    greetingEvening: "Guten Abend 👋",
    tagline: "Verpassen Sie nie Ihre Medizin. Bleiben Sie gesund und sicher.",
    addMedicineBtn: "+ Medikament Hinzufügen",
    nextMedicine: "Nächstes Medikament",
    nextMedicineDesc: "Ihre nächste anstehende Dosis",
    noUpcomingDoses: "Keine weiteren Dosen für heute geplant!",
    allDoneToday: "Alles erledigt! Großartige Leistung.",
    allDone: "Erledigt!",
    allTakenSubtitle: "Alle Medikamente eingenommen",
    greatJob: "Sehr gut!",
    takeDoseNow: "Jetzt Einnehmen ✓",
    takeNow: "Jetzt Einnehmen ✓",
    takeDose: "Einnehmen",
    snooze5Min: "5 Min Schlummern",
    snoozedFor5Min: "Um 5 Minuten verschoben",
    skipDose: "Überspringen",
    dueNow: "JETZT FÄLLIG",
    overdueBy: "{m} Min überfällig",
    dueIn: "In {m} Min",
    listenReminder: "Vorlesen 🔊",
    testAlarm: "Alarm Testen",
    alarmActive: "MEDIKAMENTEN-ALARM AKTIV",
    wakeAlarmTitle: "Zeit für Ihr Medikament!",
    wakeAlarmSubtitle: "Bitte nehmen Sie Ihre verschriebene Dosis ein",
    foodConditions: {
      before_food: {
        title: "Vor dem Essen",
        hint: "Mindestens 30 Minuten vor dem Essen nüchtern einnehmen."
      },
      after_food: {
        title: "Nach dem Essen",
        hint: "Nach dem Essen einnehmen, um den Magen zu schonen."
      },
      with_food: {
        title: "Zu den Mahlzeiten",
        hint: "Während des Essens einnehmen."
      },
      anytime: {
        title: "Jederzeit",
        hint: "Kann jederzeit eingenommen werden."
      }
    },
    weeklyProgress: "Wöchentlicher Fortschritt",
    weeklyAdherence: "Einhaltung",
    streakDays: "{d}-Tage-Serie",
    complianceRate: "Erfolgsrate",
    dosesTaken: "Eingenommene Dosen",
    emergencyContact: "Familien- & Notfallkontakt",
    callCaregiver: "Familie Anrufen",
    textCaregiver: "SMS an Familie",
    sosAlert: "SOS Alarm",
    emergencyCaregiver: "Familienkontakt",
    editContact: "Bearbeiten",
    saveContact: "Speichern",
    offlineReady: "Offline Bereit",
    online: "Online",
    offline: "Offline-Modus",
    myMedications: "Meine Medikamente",
    addMedication: "Hinzufügen",
    editMedication: "Bearbeiten",
    deleteMedication: "Löschen",
    medicationName: "Name des Medikaments",
    dosage: "Dosierung (z.B. 500mg)",
    type: "Form",
    foodConditionLabel: "Einnahmehinweis",
    scheduleTimes: "Einnahmezeiten",
    instructions: "Anweisungen",
    saveMedication: "Speichern",
    cancel: "Abbrechen",
    doseHistory: "Verlauf",
    textSize: "Schriftgröße",
    soundAlerts: "Alarmton",
    takePic: "Foto Aufnehmen",
    uploadPic: "Foto Hochladen",
    medicinePhoto: "Foto des Medikaments",
    patientDetails: "Persönliches Gesundheitsprofil",
    patientName: "Ihr Vollständiger Name",
    age: "Alter",
    bloodGroup: "Blutgruppe",
    doctorName: "Arzt / Facharzt",
    doctorPhone: "Telefon des Arztes",
    exportData: "Exportieren",
    importData: "Wiederherstellen",
    resetData: "Beispieldaten"
  },

  ja: {
    appName: "MediAlert",
    appSubtitle: "スマート服薬リマインダー",
    navHome: "ホーム",
    navTracker: "記録",
    navAdd: "お薬追加",
    navManage: "お薬一覧",
    navProfile: "プロファイル",
    greetingMorning: "おはようございます ☀️",
    greetingAfternoon: "こんにちは 🌤️",
    greetingEvening: "こんばんは 👋",
    tagline: "お薬を忘れずに。健康で安心な毎日を。",
    addMedicineBtn: "+ お薬を追加",
    nextMedicine: "次のお薬 (Next Medicine)",
    nextMedicineDesc: "予定時間に基づく次の服用",
    noUpcomingDoses: "本日の予定はすべて完了しました！",
    allDoneToday: "本日の服薬完了！健康管理素晴らしいです。",
    allDone: "完了！",
    allTakenSubtitle: "すべてのお薬を服用しました",
    greatJob: "素晴らしい！",
    takeDoseNow: "今すぐ服用 ✓",
    takeNow: "今すぐ服用 ✓",
    takeDose: "服用する",
    snooze5Min: "5分スヌーズ",
    snoozedFor5Min: "5分間延期しました",
    skipDose: "スキップ",
    dueNow: "今すぐ服用時刻",
    overdueBy: "{m}分遅延中",
    dueIn: "あと{m}分",
    listenReminder: "音声で聞く 🔊",
    testAlarm: "アラームテスト",
    alarmActive: "服薬アラーム作動中",
    wakeAlarmTitle: "お薬を飲む時間です！",
    wakeAlarmSubtitle: "処方に従い正しく服用してください",
    foodConditions: {
      before_food: {
        title: "食前",
        hint: "食事の30分前など、空腹時に服用。"
      },
      after_food: {
        title: "食後",
        hint: "胃を守るため、食後に服用。"
      },
      with_food: {
        title: "食直中",
        hint: "食事中または軽食と一緒にお飲みください。"
      },
      anytime: {
        title: "いつでも",
        hint: "食事に関係なく服用できます。"
      }
    },
    weeklyProgress: "週間進捗",
    weeklyAdherence: "順守状況",
    streakDays: "{d}日連続達成",
    complianceRate: "順守率",
    dosesTaken: "服用完了数",
    emergencyContact: "ご家族・連絡先",
    callCaregiver: "ご家族へ電話",
    textCaregiver: "ご家族へSMS送信",
    sosAlert: "SOS アシスト",
    emergencyCaregiver: "家族連絡先",
    editContact: "設定",
    saveContact: "保存",
    offlineReady: "オフライン対応",
    online: "オンライン",
    offline: "オフライン",
    myMedications: "お薬一覧",
    addMedication: "お薬追加",
    editMedication: "編集",
    deleteMedication: "削除",
    medicationName: "薬品名",
    dosage: "用量（例: 500mg）",
    type: "剤形",
    foodConditionLabel: "食事の条件",
    scheduleTimes: "服用時刻",
    instructions: "指示事項",
    saveMedication: "保存",
    cancel: "キャンセル",
    doseHistory: "履歴",
    textSize: "文字サイズ",
    soundAlerts: "アラーム音",
    takePic: "写真を撮る",
    uploadPic: "画像をアップロード",
    medicinePhoto: "お薬の写真",
    patientDetails: "健康プロフィール",
    patientName: "お名前",
    age: "年齢",
    bloodGroup: "血液型",
    doctorName: "かかりつけ医",
    doctorPhone: "医師の電話番号",
    exportData: "バックアップ",
    importData: "復元",
    resetData: "サンプル読込"
  }
};
