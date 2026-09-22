import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Pill, 
  Clock, 
  Check, 
  AlertCircle,
  Utensils,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Package,
  Bell
} from 'lucide-react';
import { Medication, MedicationType, FoodCondition, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { FoodConditionBadge } from './FoodConditionBadge';

interface Props {
  isOpen: boolean;
  medications: Medication[];
  language: LanguageCode;
  initialAddMode?: boolean;
  initialEditingMedication?: Medication | null;
  onSaveMedication: (med: Medication) => void;
  onDeleteMedication: (medId: string) => void;
  onClose: () => void;
}

export const MedicationManagerModal: React.FC<Props> = ({
  isOpen,
  medications,
  language,
  initialAddMode = false,
  initialEditingMedication = null,
  onSaveMedication,
  onDeleteMedication,
  onClose
}) => {
  const t = translations[language] || translations.en;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(initialAddMode || !!initialEditingMedication);

  // Form state
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [type, setType] = useState<MedicationType>('pill');
  const [foodCondition, setFoodCondition] = useState<FoodCondition>('after_food');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [instructions, setInstructions] = useState<string>('');
  const [prescribedFor, setPrescribedFor] = useState<string>('');
  const [inventoryCount, setInventoryCount] = useState<number>(30);
  const [remindDailyLowStock, setRemindDailyLowStock] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [hasFamilyVoice, setHasFamilyVoice] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialEditingMedication) {
      openEditForm(initialEditingMedication);
    } else if (initialAddMode) {
      openNewForm();
    }
  }, [initialAddMode, initialEditingMedication, isOpen]);

  if (!isOpen) return null;

  const openNewForm = () => {
    setEditingMed(null);
    setName('');
    setDosage('');
    setType('pill');
    setFoodCondition('after_food');
    setTimes(['08:00']);
    setInstructions('');
    setPrescribedFor('');
    setInventoryCount(30);
    setRemindDailyLowStock(true);
    setImageUrl(undefined);
    setHasFamilyVoice(false);
    setIsFormOpen(true);
  };

  const openEditForm = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setType(med.type);
    setFoodCondition(med.foodCondition);
    setTimes(med.scheduledTimes.length > 0 ? [...med.scheduledTimes] : ['08:00']);
    setInstructions(med.instructions || '');
    setPrescribedFor(med.prescribedFor || '');
    setInventoryCount(typeof med.inventoryCount === 'number' ? med.inventoryCount : 30);
    setRemindDailyLowStock(med.remindDailyLowStock ?? true);
    setImageUrl(med.imageUrl);
    setHasFamilyVoice(Boolean(med.hasFamilyVoice));
    setIsFormOpen(true);
  };

  // Process uploaded or photographed image and convert to Data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress slightly if needed
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const updateDoseTime = (index: number, newTime: string) => {
    if (!newTime) return;
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated);
  };

  const addAnotherDose = () => {
    const defaultSuggestions = ['08:00', '14:00', '20:00', '21:30', '12:00', '18:00'];
    const nextTime = defaultSuggestions.find(t => !times.includes(t)) || '20:00';
    setTimes([...times, nextTime]);
  };

  const removeDoseTime = (indexToRemove: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || times.length === 0) return;

    const medToSave: Medication = {
      id: editingMed ? editingMed.id : `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim(),
      type,
      foodCondition,
      scheduledTimes: times,
      color: '#5e35b1',
      instructions: instructions.trim(),
      prescribedFor: prescribedFor.trim() || undefined,
      inventoryCount: typeof inventoryCount === 'number' && !isNaN(inventoryCount) ? Math.max(0, inventoryCount) : 30,
      remindDailyLowStock: remindDailyLowStock ?? true,
      hasFamilyVoice,
      imageUrl: imageUrl || undefined,
      isActive: true,
      createdAt: editingMed ? editingMed.createdAt : new Date().toISOString()
    };

    onSaveMedication(medToSave);
    setIsFormOpen(false);
  };

  return (
    <div 
      id="modal-medications-manager"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5e35b1] flex items-center justify-center font-bold">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">
                {isFormOpen ? (editingMed ? t.editMedication : t.addMedication) : t.myMedications}
              </h2>
              <p className="text-xs text-slate-500">
                {isFormOpen ? 'Add photo and dosing schedule' : `${medications.length} medicines configured`}
              </p>
            </div>
          </div>

          <button
            id="btn-close-med-manager"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isFormOpen ? (
            /* Add / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo of Medicine Feature */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border-2 border-dashed border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5e35b1] uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    {t.medicinePhoto}
                  </span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative flex items-center gap-4 bg-white p-2 rounded-xl border border-purple-200">
                    <img 
                      src={imageUrl} 
                      alt="Medicine Preview" 
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="text-xs text-slate-600">
                      <p className="font-bold text-slate-800">Photo Attached ✓</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        This picture will appear on the Priority Card and during alarms for easy recognition.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Snap a picture of the pill box, strip, or bottle so seniors can instantly recognize it:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Direct Camera Capture (Environment / Rear camera on phones) */}
                      <button
                        type="button"
                        id="btn-trigger-camera"
                        onClick={() => cameraInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>

                      {/* File Upload from Gallery */}
                      <button
                        type="button"
                        id="btn-trigger-upload"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-purple-50 text-[#5e35b1] border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    {/* Hidden Inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.medicationName} *
                </label>
                <input
                  id="input-med-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Metformin, Amlodipine, Paracetamol"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              {/* Dosage & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.dosage} *
                  </label>
                  <input
                    id="input-med-dosage"
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 500mg, 1 tablet"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.type}
                  </label>
                  <select
                    id="select-med-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as MedicationType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  >
                    <option value="pill">Pill / Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid / Syrup</option>
                    <option value="injection">Injection / Insulin</option>
                    <option value="drops">Eye / Ear Drops</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              {/* Food Condition Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.foodConditionLabel} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['after_food', 'before_food', 'with_food', 'anytime'] as FoodCondition[]).map((cond) => {
                    const isSelected = foodCondition === cond;
                    const item = t.foodConditions[cond];
                    return (
                      <button
                        key={cond}
                        type="button"
                        id={`btn-select-food-${cond}`}
                        onClick={() => setFoodCondition(cond)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-[#5e35b1] text-[#5e35b1] font-bold ring-2 ring-purple-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.title}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduled Times: Clock input is finalized directly, with Edit symbol beside it and no "Add Time" button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t.scheduleTimes} *
                  </label>
                  <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Time is finalized once set
                  </span>
                </div>

                <div className="space-y-2 mb-2.5">
                  {times.map((timeStr, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#5e35b1] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <label 
                          htmlFor={`time-input-${idx}`}
                          className="text-xs font-bold text-slate-700"
                        >
                          Dose {idx + 1}:
                        </label>
                        <input
                          id={`time-input-${idx}`}
                          type="time"
                          value={timeStr}
                          onChange={(e) => updateDoseTime(idx, e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-extrabold text-[#5e35b1] focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                        />
                        <label 
                          htmlFor={`time-input-${idx}`}
                          title="Click to edit dose time"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 border border-purple-200 text-[#5e35b1] text-xs font-bold cursor-pointer hover:bg-purple-100 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#5e35b1]" />
                          <span>Edit</span>
                        </label>
                      </div>

                      {times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDoseTime(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                          title="Remove this dose time"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Option to add another dose time for multi-dose daily medications */}
                <button
                  type="button"
                  id="btn-add-another-dose"
                  onClick={addAnotherDose}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-[#5e35b1] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Daily Dose Time (e.g. Afternoon / Night)</span>
                </button>
              </div>

              {/* Medicine Stock / Inventory Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-700" />
                    <label className="text-xs font-bold text-amber-900">
                      Medicine Stock / Available Pills
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    ~{Math.floor(inventoryCount / Math.max(1, times.length))} days supply
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="input-med-inventory"
                    type="number"
                    min="0"
                    max="999"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(parseInt(e.target.value) || 0)}
                    placeholder="30"
                    className="w-24 px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-amber-900">tablets / doses in box</span>

                  {/* Fast presets */}
                  <div className="flex items-center gap-1 ml-auto">
                    {[15, 30, 60, 90].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setInventoryCount(preset)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          inventoryCount === preset
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remember daily once toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={remindDailyLowStock}
                    onChange={(e) => setRemindDailyLowStock(e.target.checked)}
                    className="w-4 h-4 text-[#5e35b1] rounded border-amber-300 focus:ring-purple-400"
                  />
                  <span className="text-xs font-medium text-amber-950">
                    Remember daily once when stock is low (when 5 or fewer left)
                  </span>
                </label>
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.instructions}
                </label>
                <input
                  id="input-med-instructions"
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water, avoid dairy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              {/* Family Voice Reminder Option for this Medicine */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-900 flex items-center gap-1.5">
                    ❤️ Custom Family Voice Reminder
                  </span>
                  <p className="text-[11px] text-rose-700 font-medium">
                    Plays recorded family voice alarm when this medicine is due
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasFamilyVoice}
                    onChange={(e) => setHasFamilyVoice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  id="btn-save-medicine-submit"
                  className="px-6 py-2.5 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
                >
                  {t.saveMedication}
                </button>
              </div>
            </form>
          ) : (
            /* List of existing medications */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Prescriptions ({medications.length})
                </span>
                <button
                  id="btn-open-add-new-med"
                  onClick={openNewForm}
                  className="py-2 px-3.5 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addMedication}</span>
                </button>
              </div>

              {medications.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No medicines added yet</p>
                  <p className="text-xs text-slate-500 mt-1">Tap the button above to add your first medicine</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-3 hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {med.imageUrl ? (
                          <img
                            src={med.imageUrl}
                            alt={med.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5e35b1] flex items-center justify-center shrink-0">
                            <Pill className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                            {med.name}
                          </h3>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {med.dosage} • <span className="capitalize">{med.type}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {med.scheduledTimes.join(', ')}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-purple-50 text-[#5e35b1] rounded-md">
                              {t.foodConditions[med.foodCondition]?.title}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditForm(med)}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#5e35b1] hover:bg-purple-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMedication(med.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
