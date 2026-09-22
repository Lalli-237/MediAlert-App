import React, { useState } from 'react';
import { Pill, Plus, Clock, Edit, Trash2, Camera, AlertCircle, Volume2, CheckCircle2, X, Calendar as CalendarIcon, MapPin, Building2, ShoppingBag } from 'lucide-react';
import { Medication, LanguageCode, AppSettings } from '../types';
import { translations, getLocalizedEditPrescription, getLocalizedTabletPictureLabel } from '../utils/translations';
import { speakMedicationAlert } from '../utils/speech';
import { NearbyPharmacySection } from './NearbyPharmacySection';
import { PWAInstallButton } from './PWAInstallButton';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  medications: Medication[];
  language: LanguageCode;
  patientName: string;
  familyVoice?: AppSettings['familyVoice'];
  onOpenAddModal: () => void;
  onEditMedication: (med: Medication) => void;
  onDeleteMedication: (medId: string) => void;
  onTriggerAlarmTest: () => void;
  onOpenFamilyVoice?: () => void;
  onConnectToCalendar?: () => void;
}

export const ManageView: React.FC<Props> = ({
  medications,
  language,
  patientName,
  familyVoice,
  onOpenAddModal,
  onEditMedication,
  onDeleteMedication,
  onTriggerAlarmTest,
  onOpenFamilyVoice,
  onConnectToCalendar
}) => {
  const t = translations[language] || translations.en;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState<boolean>(true);

  // Check low-stock items
  const lowStockCount = medications.filter(
    m => m.isActive && (m.inventoryCount !== undefined ? m.inventoryCount <= 5 : false)
  ).length;

  const scrollToPharmacySection = () => {
    setIsPharmacyOpen(true);
    const el = document.getElementById('section-nearby-pharmacy-refill');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner with Action Buttons */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.myMedications}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Simplified prescription list with easy nearby pharmacy refilling
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Find Nearby Pharmacy Quick Button */}
          <button
            id="btn-manage-find-pharmacy"
            type="button"
            onClick={scrollToPharmacySection}
            className="w-full sm:w-auto min-h-[50px] py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Find Nearby Pharmacy</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            id="btn-manage-add-medicine"
            onClick={onOpenAddModal}
            className="w-full sm:w-auto min-h-[50px] py-3 px-5 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{t.addMedication}</span>
          </button>
        </div>
      </div>

      {/* Find Nearby Pharmacy Feature Section */}
      <NearbyPharmacySection
        medications={medications}
        patientName={patientName}
        defaultOpen={true}
      />

      {/* Medication Cards List */}
      {medications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#161726] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F6F6FE] dark:bg-[#202237] text-[#5B2FD6] dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
            <MedicineShapeIcon type="tablet" className="w-8 h-8 text-[#5B2FD6] dark:text-purple-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No medicines added yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-5">
            Keep track of pills, syrups, and vitamins with picture verification and alarms.
          </p>
          <button
            onClick={onOpenAddModal}
            className="min-h-[50px] py-3 px-7 rounded-2xl bg-[#5B2FD6] text-white font-extrabold text-base shadow-md hover:bg-[#4d24be] transition-all"
          >
            + Add First Medicine
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((med) => {
            const food = t.foodConditions[med.foodCondition] || t.foodConditions.after_food;
            const isConfirmingDelete = confirmDeleteId === med.id;

            return (
              <div
                key={med.id}
                id={`manage-med-card-${med.id}`}
                className="bg-white dark:bg-[#161726] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-600 transition-all space-y-4"
              >
                {/* Top Section: Tablet Image & Medicine Details */}
                <div className="flex items-start gap-4">
                  {/* Big Tablet Image with Camera/Photo tag or Form Shape */}
                  <div className="shrink-0 relative">
                    {med.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={med.imageUrl}
                          alt={med.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 shadow-xs"
                        />
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#5B2FD6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                          <Camera className="w-2.5 h-2.5" />
                          Photo
                        </span>
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F6F6FE] dark:bg-[#202237] text-[#5B2FD6] dark:text-purple-300 flex flex-col items-center justify-center border-2 border-purple-200/80 dark:border-purple-800 shadow-xs p-2">
                        <MedicineShapeIcon type={med.type} name={med.name} className="w-8 h-8 sm:w-10 sm:h-10 text-[#5B2FD6] dark:text-purple-300" />
                        <span className="text-[10px] font-bold text-[#5B2FD6] dark:text-purple-300 uppercase mt-1">
                          {med.type}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Medicine Name & Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {med.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800">
                        {med.dosage}
                      </span>
                    </div>

                    {/* Schedule times */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-[#5e35b1]" />
                        <span>{med.scheduledTimes.join(' • ')}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                        <span>{food.title}</span>
                      </span>
                    </div>

                    {/* Instructions */}
                    {med.instructions && (
                      <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                        &ldquo;{med.instructions}&rdquo;
                      </p>
                    )}

                    {/* Family Voice Reminder Association Status */}
                    {(() => {
                      const hasVoice = Boolean(
                        familyVoice?.enabled &&
                        (
                          familyVoice.targetScope === 'all' ||
                          med.hasFamilyVoice ||
                          (familyVoice.selectedMedicationIds && familyVoice.selectedMedicationIds.includes(med.id))
                        )
                      );

                      if (hasVoice) {
                        return (
                          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/90 flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-rose-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              ❤️ Voice Alert: {familyVoice?.familyMemberName || 'Family'} ({familyVoice?.maxDurationSeconds || 15}s)
                            </span>
                            <button
                              type="button"
                              onClick={onOpenFamilyVoice}
                              className="text-[11px] font-extrabold text-rose-700 hover:text-rose-900 underline"
                            >
                              Manage Voice
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={onOpenFamilyVoice}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#5e35b1] transition-colors"
                          >
                            <span>❤️ Add Family Member Voice Reminder</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Stock & Refill indicator */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {med.inventoryCount !== undefined ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          med.inventoryCount <= 5 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Pill className="w-3 h-3" />
                          <span>Stock: {med.inventoryCount} left {med.inventoryCount <= 5 ? '(Low Stock)' : ''}</span>
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={scrollToPharmacySection}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Find Pharmacy Refill</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Senior-Friendly Large Button Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {/* Primary Large Button: Edit Prescription */}
                  <button
                    id={`btn-edit-prescription-${med.id}`}
                    onClick={() => onEditMedication(med)}
                    className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all focus:outline-none focus:ring-4 focus:ring-purple-200"
                  >
                    <Edit className="w-5 h-5 stroke-[2.2]" />
                    <span>{getLocalizedEditPrescription(language)}</span>
                  </button>

                  {/* Secondary Actions: Listen Voice & Safe Delete */}
                  {isConfirmingDelete ? (
                    <div className="bg-rose-50 border-2 border-rose-200 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-rose-800 text-xs sm:text-sm font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Remove this prescription?</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            onDeleteMedication(med.id);
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                        >
                          Yes, Remove
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Read Aloud Button */}
                      <button
                        id={`btn-voice-preview-${med.id}`}
                        onClick={() => speakMedicationAlert(med, med.scheduledTimes[0] || '08:00', language, patientName)}
                        title="Listen to medicine instructions"
                        className="min-h-[46px] py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 text-[#5e35b1] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-purple-200 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{language === 'hi' ? 'बोलकर सुनें 🔊' : language === 'ta' ? 'கேட்கவும் 🔊' : 'Read Aloud 🔊'}</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        id={`btn-delete-med-${med.id}`}
                        onClick={() => setConfirmDeleteId(med.id)}
                        title="Delete Prescription"
                        className="min-h-[46px] py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{language === 'hi' ? 'हटाएं' : language === 'ta' ? 'நீக்கு' : 'Remove'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
