import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  X, 
  ShieldAlert, 
  Heart, 
  AlertCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { EmergencyContact, Medication, UserSession } from '../types';
import { 
  launchDirectPhoneCall, 
  launchDirectSms, 
  launchDirectWhatsApp,
  buildMissedDoseAlert
} from '../utils/notificationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  emergencyContact: EmergencyContact;
  onUpdateEmergencyContact: (contact: EmergencyContact) => void;
  userSession?: UserSession | null;
  userName?: string;
  medication?: Medication | null;
  scheduledTime?: string;
}

export const FamilyAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  emergencyContact,
  onUpdateEmergencyContact,
  userSession,
  userName = '',
  medication,
  scheduledTime = '08:00'
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isEditingContact, setIsEditingContact] = useState<boolean>(!emergencyContact.name?.trim() || !emergencyContact.phone);

  // Quick edit inputs
  const [editName, setEditName] = useState<string>(emergencyContact.name || '');
  const [editPhone, setEditPhone] = useState<string>(emergencyContact.phone || '');
  const [editRelationship, setEditRelationship] = useState<string>(emergencyContact.relationship || '');

  if (!isOpen) return null;

  // Fallback sample medication if none passed
  const activeMed: Medication = medication || {
    id: 'active-med',
    name: 'Scheduled Medication',
    dosage: 'Prescribed Dose',
    type: 'tablet',
    foodCondition: 'after_food',
    scheduledTimes: [scheduledTime],
    color: '#5e35b1',
    instructions: 'Take as directed',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const alertDetails = buildMissedDoseAlert(
    activeMed,
    scheduledTime,
    userSession || null,
    emergencyContact,
    userName
  );

  const cleanPhone = emergencyContact.phone?.replace(/[^0-9+]/g, '') || '';
  const hasValidPhone = cleanPhone.length >= 6;

  const handleCall = () => {
    if (!hasValidPhone) {
      setIsEditingContact(true);
      return;
    }
    setActionFeedback('Calling family member...');
    launchDirectPhoneCall(emergencyContact.phone);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSms = () => {
    if (!hasValidPhone) {
      setIsEditingContact(true);
      return;
    }
    setActionFeedback('Opening messaging app with pre-filled alert...');
    launchDirectSms(emergencyContact.phone, alertDetails.bodyText);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleWhatsApp = () => {
    if (!hasValidPhone) {
      setIsEditingContact(true);
      return;
    }
    setActionFeedback('Opening WhatsApp with care alert...');
    launchDirectWhatsApp(emergencyContact.phone, alertDetails.bodyText);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(alertDetails.bodyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Please enter a caregiver / family member name.');
      return;
    }
    if (!editPhone.trim()) return;
    onUpdateEmergencyContact({
      ...emergencyContact,
      name: editName.trim(),
      phone: editPhone.trim(),
      relationship: editRelationship.trim() || ''
    });
    setIsEditingContact(false);
    setActionFeedback('Family member saved and configured!');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div 
      id="modal-family-alert-dispatcher"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-labelledby="family-alert-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white p-5 relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Heart className="w-7 h-7 text-white fill-white/30" />
            </div>
            <div>
              <h2 id="family-alert-title" className="text-xl font-black tracking-tight">
                Alert Family Member
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Immediate Direct Call & SMS to your trusted caregiver
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Action Feedback Banner */}
          {actionFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Contact Details Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Target Family Contact
              </span>
              <button
                type="button"
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="text-xs font-bold text-[#5e35b1] hover:text-[#512da8] flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingContact ? 'Cancel' : 'Change Phone'}</span>
              </button>
            </div>

            {isEditingContact ? (
              <form onSubmit={handleSaveContact} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caregiver / Family Member Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trusted Family / Caregiver (e.g. Son, Daughter, or else)
                  </label>
                  <input
                    type="text"
                    value={editRelationship}
                    onChange={(e) => setEditRelationship(e.target.value)}
                    placeholder="e.g. Son, Daughter, or else"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Son', 'Daughter', 'Spouse', 'Caregiver', 'Other'].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setEditRelationship(rel)}
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-bold transition-all cursor-pointer ${
                          editRelationship.toLowerCase() === rel.toLowerCase()
                            ? 'bg-[#5e35b1] text-white border-[#5e35b1]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (for Direct Call &amp; SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Save Family Member &amp; Relationship
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-base text-slate-900">
                    {emergencyContact.name || 'No Caregiver Configured'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {emergencyContact.relationship || 'Trusted Family / Caregiver'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-purple-900">
                    {emergencyContact.phone || 'No phone set'}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${hasValidPhone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {hasValidPhone ? 'Ready to Call & SMS' : 'Needs Phone Number'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Primary Big Action Buttons */}
          <div className="space-y-2.5">
            {/* Direct Call Button */}
            <button
              id="btn-family-alert-call-now"
              type="button"
              onClick={handleCall}
              className="w-full min-h-[52px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <Phone className="w-5 h-5 fill-white" />
              <span>Call Family Member Now</span>
            </button>

            {/* Direct SMS Button */}
            <button
              id="btn-family-alert-sms-now"
              type="button"
              onClick={handleSms}
              className="w-full min-h-[52px] py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Send SMS Alert to Family Member</span>
            </button>

            {/* WhatsApp Direct Chat */}
            <button
              id="btn-family-alert-whatsapp"
              type="button"
              onClick={handleWhatsApp}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Send via WhatsApp Chat</span>
            </button>
          </div>

          {/* Message Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Care Message Preview
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
              {alertDetails.bodyText}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            id="btn-family-alert-done"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
