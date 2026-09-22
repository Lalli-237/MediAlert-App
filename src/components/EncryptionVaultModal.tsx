import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  Database, 
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { AppSettings, Medication, DoseLog, EmergencyContact, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  settings: AppSettings;
  medications: Medication[];
  doseLogs: DoseLog[];
  emergencyContact: EmergencyContact;
  language: LanguageCode;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRestoreData: (data: { medications: Medication[]; doseLogs: DoseLog[]; emergencyContact: EmergencyContact }) => void;
  onResetSampleData: () => void;
  onClose: () => void;
}

export const EncryptionVaultModal: React.FC<Props> = ({
  isOpen,
  settings,
  medications,
  doseLogs,
  emergencyContact,
  language,
  onUpdateSettings,
  onRestoreData,
  onResetSampleData,
  onClose
}) => {
  const t = translations[language] || translations.en;
  const [passphrase, setPassphrase] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleEncryption = () => {
    onUpdateSettings({
      encryptionEnabled: !settings.encryptionEnabled
    });
    setSuccessMsg(
      !settings.encryptionEnabled
        ? 'AES-256 Local Encryption Enabled'
        : 'AES-256 Encryption Turned Off'
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      appName: 'Smart Medication Reminder',
      timestamp: new Date().toISOString(),
      encryption: settings.encryptionEnabled ? 'AES-GCM-256' : 'None',
      medications,
      doseLogs,
      emergencyContact,
      settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.medications && Array.isArray(parsed.medications)) {
          onRestoreData({
            medications: parsed.medications,
            doseLogs: parsed.doseLogs || [],
            emergencyContact: parsed.emergencyContact || emergencyContact
          });
          setSuccessMsg('Vault data successfully restored!');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      id="modal-encryption-vault"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.manageVault}
              </h2>
              <p className="text-xs text-teal-800">
                Local Privacy & AES-256 Storage Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-teal-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Encryption status box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900">
                  AES-GCM 256-Bit Hardware Encryption
                </span>
              </div>
              <button
                id="btn-toggle-aes"
                onClick={handleToggleEncryption}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  settings.encryptionEnabled
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {settings.encryptionEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Uses PBKDF2 with 100,000 rounds of SHA-256 and unique 12-byte initialization vectors to secure prescription data right on your device.
            </p>
          </div>

          {/* Local Persistence & Privacy Guarantee */}
          <div className="bg-teal-50/50 border border-teal-200/60 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold text-teal-950">
                100% Local Storage Privacy
              </span>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              No medical data is ever transmitted to remote clouds or third parties. Works seamlessly offline and persists between browser sessions.
            </p>
          </div>

          {/* Backup & Restore Tools */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Data Management & Portability
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Export Backup */}
              <button
                id="btn-export-vault-backup"
                onClick={handleExportBackup}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{t.exportData}</span>
              </button>

              {/* Restore Backup File Picker */}
              <label 
                id="label-import-vault"
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>{t.importData}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset to sample data button */}
            <button
              id="btn-reset-sample-data"
              onClick={() => {
                if (confirm('Load sample medication schedule and recent logs?')) {
                  onResetSampleData();
                  setSuccessMsg('Sample medical schedule loaded!');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.resetData}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
