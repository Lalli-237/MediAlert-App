import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  MessageSquare, 
  Share2, 
  UserCheck, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle,
  HeartPulse
} from 'lucide-react';
import { EmergencyContact, Medication, DoseLog, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  contact: EmergencyContact;
  medications: Medication[];
  doseLogs: DoseLog[];
  language: LanguageCode;
  onSaveContact: (contact: EmergencyContact) => void;
  onClose: () => void;
}

export const EmergencyContactModal: React.FC<Props> = ({
  isOpen,
  contact,
  medications,
  doseLogs,
  language,
  onSaveContact,
  onClose
}) => {
  const t = translations[language] || translations.en;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [formData, setFormData] = useState<EmergencyContact>(contact);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContact(formData);
    setIsEditing(false);
  };

  // Generate patient medication summary report text
  const generateSOSSummary = () => {
    const activeMeds = medications.filter(m => m.isActive);
    const medList = activeMeds
      .map(m => `• ${m.name} (${m.dosage}) - ${m.foodCondition.replace('_', ' ')} at ${m.scheduledTimes.join(', ')}`)
      .join('\n');

    return `EMERGENCY MEDICATION ALERT:
Patient Status Update:
Active Prescriptions (${activeMeds.length}):
${medList}
Emergency Caregiver: ${contact.name} (${contact.phone})
Generated from Smart Medication Reminder App.`;
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateSOSSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const prefilledSmsBody = encodeURIComponent(
    `Hello ${contact.name}, this is an alert from my Medication Reminder app. I need assistance with my current medication routine. Please call me back.`
  );

  return (
    <div 
      id="modal-emergency-contact"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.emergencyContact}
              </h2>
              <p className="text-xs text-rose-700">
                Rapid caregiver assist & emergency mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-rose-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              {/* Primary Contact Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {contact.name}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      {contact.relationship}
                    </span>
                  </div>
                  <button
                    id="btn-edit-caregiver"
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editContact}</span>
                  </button>
                </div>

                <div className="text-sm font-mono font-bold text-slate-800">
                  {contact.phone}
                </div>

                {contact.notes && (
                  <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                    "{contact.notes}"
                  </p>
                )}
              </div>

              {/* Quick Action Dialers */}
              <div className="grid grid-cols-2 gap-3">
                {/* Direct Phone Call */}
                <a
                  id="link-call-caregiver"
                  href={`tel:${contact.phone}`}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all text-center"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.callCaregiver}</span>
                </a>

                {/* Direct SMS Alert */}
                <a
                  id="link-sms-caregiver"
                  href={`sms:${contact.phone}?body=${prefilledSmsBody}`}
                  className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all text-center"
                >
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span>{t.textCaregiver}</span>
                </a>
              </div>

              {/* SOS Copy Patient Meds Summary */}
              <div className="border-t border-slate-100 pt-4">
                <button
                  id="btn-copy-sos-report"
                  onClick={handleCopySummary}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-500" />
                      <span>Copy Full Prescription SOS Summary for Paramedics</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Editing Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Caregiver / Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relationship / Role
                </label>
                <input
                  type="text"
                  required
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Daughter, Spouse, Doctor, Nurse"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Important Care Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Has spare key, lives nearby"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.saveContact}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
