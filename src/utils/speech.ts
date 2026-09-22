import { Medication, LanguageCode } from '../types';
import { translations } from './translations';

const LANG_VOICE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP'
};

export function speakMedicationAlert(
  med: Medication, 
  scheduledTimeStr: string, 
  lang: LanguageCode = 'en',
  patientName: string = 'Lakshmi'
) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  // Cancel any prior speech
  window.speechSynthesis.cancel();

  const t = translations[lang] || translations.en;
  const foodHint = t.foodConditions[med.foodCondition]?.title || '';

  let message = '';
  switch (lang) {
    case 'hi':
      message = `नमस्ते ${patientName} जी। आपकी अगली दवा ${med.name} है, मात्रा ${med.dosage}। समय ${scheduledTimeStr}। भोजन निर्देश: ${foodHint}। कृपया समय पर दवा लें।`;
      break;
    case 'ta':
      message = `வணக்கம் ${patientName}. உங்கள் அடுத்த மருந்து ${med.name}, அளவு ${med.dosage}. நேரம் ${scheduledTimeStr}. உணவு முறை: ${foodHint}. தயவுசெய்து சரியான நேரத்தில் எடுத்துக்கொள்ளுங்கள்.`;
      break;
    case 'te':
      message = `నమస్కారం ${patientName} గారు. మీ తదుపరి మందు ${med.name}, మోతాదు ${med.dosage}. సమయం ${scheduledTimeStr}. ఆహార నియమం: ${foodHint}. దయచేసి సమయానికి వేసుకోండి.`;
      break;
    case 'kn':
      message = `ನಮಸ್ಕಾರ ${patientName} ಅವರೇ. ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿ ${med.name}, ಪ್ರಮಾಣ ${med.dosage}. ಸಮಯ ${scheduledTimeStr}. ಆಹಾರ ನಿಯಮ: ${foodHint}. ದಯವಿಟ್ಟು ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ.`;
      break;
    case 'bn':
      message = `নমস্কার ${patientName}। আপনার পরবর্তী ওষুধ ${med.name}, মাত্রা ${med.dosage}। সময় ${scheduledTimeStr}। খাওয়ার নির্দেশ: ${foodHint}। দয়া করে সময়মতো খান।`;
      break;
    case 'mr':
      message = `नमस्कार ${patientName}. तुमची पुढची औषधी ${med.name}, प्रमाण ${med.dosage}. वेळ ${scheduledTimeStr}. जेवणाचा नियम: ${foodHint}. कृपया वेळेवर औषध घ्या.`;
      break;
    case 'ml':
      message = `നമസ്കാരം ${patientName}. നിങ്ങളുടെ അടുത്ത മരുന്ന് ${med.name}, അളവ് ${med.dosage}. സമയം ${scheduledTimeStr}. ഭക്ഷണ നിർദ്ദേശം: ${foodHint}. ദയവായി സമയത്ത് മരുന്ന് കഴിക്കുക.`;
      break;
    case 'gu':
      message = `નમસ્તે ${patientName}. તમારી આગલી દવા ${med.name}, માત્રા ${med.dosage}. સમય ${scheduledTimeStr}. ખોરાક સૂચના: ${foodHint}. કૃપા કરીને સમયસર લો.`;
      break;
    case 'es':
      message = `Hola ${patientName}. Su próximo medicamento es ${med.name}, dosis ${med.dosage}. Tomar a las ${scheduledTimeStr}. Condición: ${foodHint}. ${med.instructions || ''}`;
      break;
    case 'fr':
      message = `Bonjour ${patientName}. Votre prochain médicament est ${med.name}, dose ${med.dosage}. À prendre à ${scheduledTimeStr}. Condition: ${foodHint}. ${med.instructions || ''}`;
      break;
    case 'de':
      message = `Hallo ${patientName}. Ihr nächstes Medikament ist ${med.name}, Dosis ${med.dosage}. Geplant um ${scheduledTimeStr}. Hinweis: ${foodHint}.`;
      break;
    case 'ja':
      message = `こんにちは、${patientName}さん。お薬の時間です。次は${med.name}、${med.dosage}です。予定時刻は${scheduledTimeStr}です。${foodHint}。`;
      break;
    default:
      message = `Hello ${patientName}. Time for your medicine: ${med.name}, dose ${med.dosage}, scheduled for ${scheduledTimeStr}. ${foodHint}. Please take it on time.`;
      break;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  const targetLang = LANG_VOICE_MAP[lang] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = 0.88; // Gentle, clear slower pace for seniors
  utterance.pitch = 1.0;

  // Attempt to select native matching voice if loaded
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak full details of any medication in the specified language.
 * Perfect for seniors using voice commands or requesting auditory readouts.
 */
export function speakMedicationDetails(
  med: Medication,
  lang: LanguageCode = 'en'
) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const t = translations[lang] || translations.en;
  const foodHint = t.foodConditions[med.foodCondition]?.title || 'Anytime';
  const times = (med.scheduledTimes || []).join(', ');

  let message = '';
  switch (lang) {
    case 'hi':
      message = `दवा का विवरण: ${med.name}। मात्रा: ${med.dosage}। प्रकार: ${med.type}। समय: ${times}। भोजन निर्देश: ${foodHint}। ${med.instructions ? 'विशेष निर्देश: ' + med.instructions : ''}`;
      break;
    case 'ta':
      message = `மருந்து விவரங்கள்: ${med.name}. அளவு: ${med.dosage}. வகை: ${med.type}. நேரம்: ${times}. உணவு முறை: ${foodHint}. ${med.instructions ? 'வழிமுறைகள்: ' + med.instructions : ''}`;
      break;
    case 'te':
      message = `మందు వివరాలు: ${med.name}. మోతాదు: ${med.dosage}. రకం: ${med.type}. సమయాలు: ${times}. ఆహార నియమం: ${foodHint}. ${med.instructions ? 'సూచనలు: ' + med.instructions : ''}`;
      break;
    case 'kn':
      message = `ಔಷಧಿ ವಿವರಗಳು: ${med.name}. ಪ್ರಮಾಣ: ${med.dosage}. ವಿಧ: ${med.type}. ಸಮಯ: ${times}. ಆಹಾರ ನಿಯಮ: ${foodHint}.`;
      break;
    case 'bn':
      message = `ওষুধের বিবরণ: ${med.name}। মাত্রা: ${med.dosage}। প্রকার: ${med.type}। সময়: ${times}। খাওয়ার নিয়ম: ${foodHint}।`;
      break;
    case 'mr':
      message = `औषध तपशील: ${med.name}. मात्रा: ${med.dosage}. प्रकार: ${med.type}. वेळ: ${times}. जेवणाचा नियम: ${foodHint}.`;
      break;
    case 'ml':
      message = `മരുന്ന് വിവരങ്ങൾ: ${med.name}. അളവ്: ${med.dosage}. തരം: ${med.type}. സമയം: ${times}. ഭക്ഷണ നിർദ്ദേശം: ${foodHint}.`;
      break;
    case 'gu':
      message = `દવા વિગત: ${med.name}. માત્રા: ${med.dosage}. પ્રકાર: ${med.type}. સમય: ${times}. ખોરાક સૂચના: ${foodHint}.`;
      break;
    case 'es':
      message = `Detalles del medicamento: ${med.name}. Dosis: ${med.dosage}. Tipo: ${med.type}. Horarios: ${times}. Condición: ${foodHint}.`;
      break;
    case 'fr':
      message = `Détails du médicament: ${med.name}. Dose: ${med.dosage}. Type: ${med.type}. Heures: ${times}. Condition: ${foodHint}.`;
      break;
    case 'de':
      message = `Medikamentendetails: ${med.name}. Dosis: ${med.dosage}. Art: ${med.type}. Uhrzeiten: ${times}. Hinweis: ${foodHint}.`;
      break;
    case 'ja':
      message = `お薬の詳細です: ${med.name}、用量 ${med.dosage}、剤形 ${med.type}、服用時間 ${times}、食事の条件 ${foodHint}。`;
      break;
    default:
      message = `Medicine details: ${med.name}. Dosage: ${med.dosage}. Form: ${med.type}. Scheduled times: ${times}. Food instruction: ${foodHint}. ${med.instructions ? 'Instructions: ' + med.instructions : ''}`;
      break;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  const targetLang = LANG_VOICE_MAP[lang] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = 0.85; // Calibrated comfortable rate for seniors
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak any voice confirmation or speech response in the selected language.
 */
export function speakFeedback(text: string, lang: LanguageCode = 'en') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_VOICE_MAP[lang] || 'en-IN';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (currentFamilyAudio) {
    try {
      currentFamilyAudio.pause();
      currentFamilyAudio.currentTime = 0;
    } catch {}
    currentFamilyAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

let currentFamilyAudio: HTMLAudioElement | null = null;

/**
 * Play a family member's recorded voice note for medication reminder
 */
export function playFamilyVoice(audioDataUrl: string, onEnded?: () => void): HTMLAudioElement | null {
  try {
    stopSpeaking();
    const audio = new Audio(audioDataUrl);
    currentFamilyAudio = audio;
    audio.onended = () => {
      currentFamilyAudio = null;
      if (onEnded) onEnded();
    };
    audio.onerror = (e) => {
      console.warn('Family voice playback error:', e);
      currentFamilyAudio = null;
    };
    audio.play().catch(err => {
      console.warn('Playback prevented by browser autoplay policy:', err);
    });
    return audio;
  } catch (err) {
    console.error('Failed to play family voice:', err);
    return null;
  }
}

