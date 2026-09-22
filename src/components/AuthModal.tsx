import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, X, CheckCircle2, User, ArrowRight, Sparkles } from 'lucide-react';
import { UserSession } from '../types';

interface Props {
  isOpen: boolean;
  currentSession: UserSession | null;
  onLogin: (session: UserSession) => void;
  onClose?: () => void;
  isRequired?: boolean;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  currentSession,
  onLogin,
  onClose,
  isRequired = false
}) => {
  const [authMethod, setAuthMethod] = useState<'gmail' | 'phone'>('gmail');
  const [emailInput, setEmailInput] = useState<string>(currentSession?.email || '');
  const [phoneInput, setPhoneInput] = useState<string>(currentSession?.phone || '');
  const [nameInput, setNameInput] = useState<string>(currentSession?.displayName || '');
  const [notifyOnMissed, setNotifyOnMissed] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEmailInput(currentSession?.email || '');
      setPhoneInput(currentSession?.phone || '');
      setNameInput(currentSession?.displayName || '');
      setErrorMessage(null);
    }
  }, [isOpen, currentSession]);

  if (!isOpen) return null;

  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your name to save details.');
      return;
    }

    const trimmedEmail = emailInput.trim();
    const trimmedPhone = phoneInput.trim();

    if (authMethod === 'gmail' && !trimmedEmail) {
      setErrorMessage('Please enter your Gmail / Email address.');
      return;
    }

    if (authMethod === 'phone' && !trimmedPhone) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    if (!trimmedEmail && !trimmedPhone) {
      setErrorMessage('Please enter an email address or mobile phone number.');
      return;
    }

    const session: UserSession = {
      isLoggedIn: true,
      loginMethod: authMethod === 'gmail' ? 'gmail' : 'phone',
      email: trimmedEmail,
      phone: trimmedPhone,
      displayName: trimmedName,
      notifyOnMissed,
      lastLoginAt: new Date().toISOString()
    };

    onLogin(session);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => {
        if (!isRequired && onClose) onClose();
      }}
    >
      <div 
        id="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with App Logo & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5e35b1] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-purple-600/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {currentSession?.isLoggedIn ? 'Account Profile' : 'Welcome to MediAlert'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentSession?.isLoggedIn 
                  ? 'Manage your notification details'
                  : 'Enter your name and contact details to get started'}
              </p>
            </div>
          </div>

          {!isRequired && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Member Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Your Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-login-name"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Lakshmi Devi"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Auth Method Tabs: Gmail vs Phone Number */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            id="tab-auth-gmail"
            type="button"
            onClick={() => {
              setAuthMethod('gmail');
              if (errorMessage) setErrorMessage(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              authMethod === 'gmail'
                ? 'bg-white text-[#5e35b1] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail / Email</span>
          </button>

          <button
            id="tab-auth-phone"
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              if (errorMessage) setErrorMessage(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              authMethod === 'phone'
                ? 'bg-white text-[#5e35b1] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Phone Number</span>
          </button>
        </div>

        {/* Tab 1: Gmail / Google Login */}
        {authMethod === 'gmail' && (
          <form onSubmit={handleSaveDetails} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Gmail / Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your Gmail address"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mobile Phone Number (Optional for SMS alerts)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email-phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="btn-save-details-gmail"
                type="submit"
                className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                <span>Save Details</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Mobile Phone Login */}
        {authMethod === 'phone' && (
          <form onSubmit={handleSaveDetails} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mobile Number (with Country Code) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-phone"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. +91 9876543210 or +1 5550199"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Email Address (Optional for Email alerts)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-phone-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. user@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="btn-save-details-phone"
                type="submit"
                className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                <span>Save Details</span>
              </button>
            </div>
          </form>
        )}

        {/* Notification Guarantee Checkbox */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="checkbox-notify-missed"
              type="checkbox"
              checked={notifyOnMissed}
              onChange={(e) => setNotifyOnMissed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-[#5e35b1] focus:ring-purple-400 accent-[#5e35b1]"
            />
            <span className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-800">Missed Medicine Alert System:</strong> Automatically send urgent email &amp; SMS message to this account if a scheduled dose is missed.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
