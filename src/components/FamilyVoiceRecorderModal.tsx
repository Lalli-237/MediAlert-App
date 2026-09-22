import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Check, 
  X, 
  Heart, 
  Volume2, 
  Upload, 
  Sparkles,
  Info,
  Clock,
  Pill,
  CheckSquare,
  Square as EmptySquare
} from 'lucide-react';
import { AppSettings, Medication } from '../types';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  medications?: Medication[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUpdateMedications?: (meds: Medication[]) => void;
  onShowToast: (msg: string) => void;
}

export const FamilyVoiceRecorderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  medications = [],
  onUpdateSettings,
  onUpdateMedications,
  onShowToast
}) => {
  const familyVoice = settings.familyVoice;

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [familyMemberName, setFamilyMemberName] = useState<string>(
    familyVoice?.familyMemberName || 'Daughter Ananya'
  );
  const [relationship, setRelationship] = useState<string>(
    familyVoice?.relationship || 'Daughter'
  );
  const [customNote, setCustomNote] = useState<string>(
    familyVoice?.customNote || 'Grandma, please remember to take your medicine on time. Love you!'
  );
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(
    familyVoice?.audioDataUrl || null
  );

  // User decision: 10 seconds or 15 seconds limit
  const [maxDurationSeconds, setMaxDurationSeconds] = useState<10 | 15>(
    familyVoice?.maxDurationSeconds || 15
  );

  // User decision: All medicines or Selected medicines only
  const [targetScope, setTargetScope] = useState<'all' | 'selected'>(
    familyVoice?.targetScope || 'all'
  );

  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>(
    familyVoice?.selectedMedicationIds && familyVoice.selectedMedicationIds.length > 0
      ? familyVoice.selectedMedicationIds
      : medications.map((m) => m.id)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (familyVoice) {
      if (familyVoice.familyMemberName) setFamilyMemberName(familyVoice.familyMemberName);
      if (familyVoice.relationship) setRelationship(familyVoice.relationship);
      if (familyVoice.customNote) setCustomNote(familyVoice.customNote);
      if (familyVoice.audioDataUrl) setAudioBlobUrl(familyVoice.audioDataUrl);
      if (familyVoice.maxDurationSeconds) setMaxDurationSeconds(familyVoice.maxDurationSeconds);
      if (familyVoice.targetScope) setTargetScope(familyVoice.targetScope);
      if (familyVoice.selectedMedicationIds && familyVoice.selectedMedicationIds.length > 0) {
        setSelectedMedicationIds(familyVoice.selectedMedicationIds);
      } else {
        const medsWithVoice = medications.filter(m => m.hasFamilyVoice).map(m => m.id);
        if (medsWithVoice.length > 0) {
          setSelectedMedicationIds(medsWithVoice);
        } else if (medications.length > 0) {
          setSelectedMedicationIds(medications.map(m => m.id));
        }
      }
    } else {
      setSelectedMedicationIds(medications.map(m => m.id));
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      if (isPlaying && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioBlobUrl(base64Audio);
          onShowToast(`Voice note recorded (${maxDurationSeconds}s limit)!`);
        };

        // Stop media tracks to turn off microphone indicator
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      const targetLimit = maxDurationSeconds;

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= targetLimit) {
            stopRecording();
            return targetLimit;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please enable mic permissions in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handlePlayToggle = () => {
    if (!audioBlobUrl) return;

    if (isPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioBlobUrl);
        audioPlayerRef.current.onended = () => setIsPlaying(false);
        audioPlayerRef.current.onerror = () => setIsPlaying(false);
      } else {
        audioPlayerRef.current.src = audioBlobUrl;
      }
      audioPlayerRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAudioBlobUrl(dataUrl);
      onShowToast(`Uploaded voice message from ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleMedication = (id: string) => {
    setSelectedMedicationIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((medId) => medId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllMedications = () => {
    setSelectedMedicationIds(medications.map((m) => m.id));
  };

  const handleDeselectAllMedications = () => {
    setSelectedMedicationIds([]);
  };

  const handleSave = () => {
    if (!audioBlobUrl) {
      alert('Please record or upload a voice message first.');
      return;
    }

    if (targetScope === 'selected' && selectedMedicationIds.length === 0) {
      alert('Please select at least one medicine to use this voice note, or choose "All Medicines".');
      return;
    }

    const finalSelectedIds = targetScope === 'all'
      ? medications.map(m => m.id)
      : selectedMedicationIds;

    onUpdateSettings({
      familyVoice: {
        enabled: true,
        audioDataUrl: audioBlobUrl,
        recordedAt: new Date().toISOString(),
        familyMemberName: familyMemberName.trim() || 'Family Member',
        relationship: relationship.trim() || 'Family',
        customNote: customNote.trim(),
        maxDurationSeconds,
        targetScope,
        selectedMedicationIds: finalSelectedIds
      }
    });

    // Update each medication's persistent record directly so the medicine literally remembers!
    if (onUpdateMedications && medications.length > 0) {
      const updatedMeds = medications.map(m => ({
        ...m,
        hasFamilyVoice: targetScope === 'all' ? true : finalSelectedIds.includes(m.id)
      }));
      onUpdateMedications(updatedMeds);
    }

    onShowToast(`Family voice saved for ${targetScope === 'all' ? 'all medicines' : `${finalSelectedIds.length} selected medicines`}!`);
    onClose();
  };

  const handleDeleteVoice = () => {
    if (confirm('Are you sure you want to remove the custom family voice note?')) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setAudioBlobUrl(null);
      setIsPlaying(false);
      onUpdateSettings({
        familyVoice: undefined
      });
      if (onUpdateMedications && medications.length > 0) {
        const updatedMeds = medications.map(m => ({
          ...m,
          hasFamilyVoice: false
        }));
        onUpdateMedications(updatedMeds);
      }
      onShowToast('Family voice removed. Standard voice alarms will be used.');
    }
  };

  // Quick preset sample voice generation (synthesized warm caregiver voice)
  const handleGenerateSampleFamilyVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported');
      return;
    }
    const sampleText = `Hello! It's ${familyMemberName || 'your family member'}. Please take your medicine right now with a glass of water. Take care!`;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // warmer tone
    window.speechSynthesis.speak(utterance);
    onShowToast(`Playing sample voice for ${familyMemberName || 'Family'}`);
  };

  return (
    <div 
      id="modal-family-voice-recorder"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#161726] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-[#3B1219] text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Family Member Voice</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                  Seniors' Favorite
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Play a beloved child or grandchild's voice during medication alarms
              </p>
            </div>
          </div>

          <button
            id="btn-close-family-voice-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. DURATION LIMIT SELECTION: 10s or 15s by User Decision */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#1E2138] rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#5e35b1] dark:text-[#FFC400]" />
              <span>Reminder Voice Duration (Your Decision):</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Only 10s to 15s max
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-duration-10s"
              onClick={() => setMaxDurationSeconds(10)}
              className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                maxDurationSeconds === 10
                  ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-xs'
                  : 'bg-white dark:bg-[#161726] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>⏱️ 10 Seconds</span>
              {maxDurationSeconds === 10 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <button
              type="button"
              id="btn-duration-15s"
              onClick={() => setMaxDurationSeconds(15)}
              className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                maxDurationSeconds === 15
                  ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-xs'
                  : 'bg-white dark:bg-[#161726] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>⏱️ 15 Seconds</span>
              {maxDurationSeconds === 15 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Recording will automatically stop at exactly {maxDurationSeconds} seconds.
          </p>
        </div>

        {/* Input Details: Family Member Name & Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Family Member Name
            </label>
            <input
              id="input-family-voice-name"
              type="text"
              value={familyMemberName}
              onChange={(e) => setFamilyMemberName(e.target.value)}
              placeholder="e.g. Daughter Ananya, Son Rahul"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2138] text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#5e35b1] outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Relationship
            </label>
            <select
              id="select-family-voice-relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2138] text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#5e35b1] outline-hidden cursor-pointer"
            >
              <option value="Daughter">Daughter</option>
              <option value="Son">Son</option>
              <option value="Grandchild">Granddaughter / Grandson</option>
              <option value="Spouse">Spouse / Partner</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Caregiver">Caregiver / Nurse</option>
            </select>
          </div>
        </div>

        {/* Message Note Prompt */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Spoken Reminder Text / Note
          </label>
          <input
            id="input-family-voice-note"
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Grandma, please take your morning medicine now. We love you!"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E2138] text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#5e35b1] outline-hidden"
          />
        </div>

        {/* Central Recording Box */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#1E2138] rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute -inset-3 rounded-full bg-rose-500/25 animate-ping" />
                <div className="absolute -inset-2 rounded-full bg-rose-500/35 animate-pulse" />
              </>
            )}

            <button
              id="btn-record-family-voice"
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 ring-4 ring-rose-300 shadow-rose-600/40 animate-pulse'
                  : 'bg-[#5e35b1] hover:bg-[#4d2c94] ring-4 ring-purple-200 dark:ring-purple-900 shadow-purple-600/30'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 fill-white" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div>
            <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {isRecording ? `Recording... (${recordingSeconds}s / ${maxDurationSeconds}s max)` : audioBlobUrl ? 'Voice Note Ready' : 'Tap to Record Voice'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRecording ? `Auto-stops in ${maxDurationSeconds - recordingSeconds}s` : `Record up to ${maxDurationSeconds} seconds`}
            </p>

            {/* Progress bar during recording */}
            {isRecording && (
              <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${(recordingSeconds / maxDurationSeconds) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Action buttons if audio exists */}
          {audioBlobUrl && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                id="btn-play-family-voice-test"
                type="button"
                onClick={handlePlayToggle}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play Recorded Voice'}</span>
              </button>

              <button
                id="btn-delete-family-voice"
                type="button"
                onClick={handleDeleteVoice}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Or upload an audio file from phone / computer */}
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-[#5e35b1] dark:text-[#FFC400] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Voice Audio File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <span className="text-slate-300 dark:text-slate-600">•</span>

            <button
              type="button"
              onClick={handleGenerateSampleFamilyVoice}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sample Voice</span>
            </button>
          </div>
        </div>

        {/* 2. MEDICINE SCOPE SELECTION: Every Medicine vs Selected Medicines */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#1E2138] rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Apply Voice Reminder To:
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Choose whether this voice plays for every medicine or only selected ones.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-scope-all-meds"
              onClick={() => setTargetScope('all')}
              className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetScope === 'all'
                  ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-xs'
                  : 'bg-white dark:bg-[#161726] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Every Medicine (All)</span>
            </button>

            <button
              type="button"
              id="btn-scope-selected-meds"
              onClick={() => setTargetScope('selected')}
              className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetScope === 'selected'
                  ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-xs'
                  : 'bg-white dark:bg-[#161726] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Selected Medicines Only</span>
            </button>
          </div>

          {/* If Selected Medicines Only is active, display the checklist */}
          {targetScope === 'selected' && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Medicines ({selectedMedicationIds.length} of {medications.length} active):
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllMedications}
                    className="text-[#5e35b1] dark:text-[#FFC400] font-bold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllMedications}
                    className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {medications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No medications added yet. Add medicines in Manage tab first.
                  </p>
                ) : (
                  medications.map((med) => {
                    const isSelected = selectedMedicationIds.includes(med.id);
                    return (
                      <div
                        key={med.id}
                        id={`med-select-voice-${med.id}`}
                        onClick={() => handleToggleMedication(med.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-[#201844] border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-[#161726] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#5e35b1] dark:text-[#FFC400]" />
                            ) : (
                              <EmptySquare className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <MedicineShapeIcon type={med.type} name={med.name} className="w-4 h-4 text-[#5e35b1] dark:text-[#FFC400] shrink-0" />
                          <div className="min-w-0 truncate">
                            <span className="text-xs font-bold block truncate">{med.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {med.dosage} • {med.scheduledTimes.join(', ')}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected 
                            ? 'bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {isSelected ? 'Voice Active' : 'Off'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Existing active status pill if enabled */}
        {familyVoice?.enabled && (
          <div className="p-3 bg-emerald-50 dark:bg-[#0E2E25] border border-emerald-200 dark:border-emerald-700 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                Voice Active: {familyVoice.familyMemberName || 'Family Member'} ({familyVoice.maxDurationSeconds || 15}s)
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              {familyVoice.targetScope === 'selected' 
                ? `${familyVoice.selectedMedicationIds?.length || 0} selected medicines` 
                : 'All medicine reminders'}
            </span>
          </div>
        )}

        {/* Bottom Save / Cancel Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-family-voice"
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#5e35b1] hover:bg-[#4d2c94] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save &amp; Use Family Voice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

