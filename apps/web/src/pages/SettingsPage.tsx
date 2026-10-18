import React, { useState } from 'react';
import { Settings, User, Lock, Download, Trash2, Shield, Check, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, updateUser, logout } = useAuth();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [penName, setPenName] = useState(user?.full_name || '');
  const [website, setWebsite] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Export & Deletion
  const [exporting, setExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        bio: bio.trim(),
        pen_name: penName.trim(),
        website: website.trim() || undefined,
      });
      updateUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verseora-archive-${user?.username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeleting(true);
    try {
      await api.deleteAccount({ current_password: deletePassword, new_password: '' });
      await logout();
      onNavigate('landing');
    } catch (err: any) {
      setDeleteError(err.message || 'Password verification failed. Could not delete account.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 pb-4 border-b border-charcoal-800">
        <h1 className="font-serif text-3xl font-bold text-ivory-50">Settings & Privacy</h1>
        <p className="text-xs text-ivory-400 mt-1">Manage your identity, security credentials, and data rights.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-4 h-4 text-verse-violet" />
            <h3 className="font-serif text-lg font-bold text-ivory-50">Public Profile & Pen Name</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none focus:ring-1 focus:ring-verse-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Pen Name (Poet Alias)</label>
                <input
                  type="text"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none focus:ring-1 focus:ring-verse-violet"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1">Bio / Poetic Statement</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A couplet or line introducing your poetic spirit..."
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-ivory-100 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSaved ? (
                <span className="text-xs text-verse-teal flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Profile updated</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-verse-violet text-ivory-50 text-xs font-medium hover:bg-verse-violet/90 transition shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Password & Security */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-4 h-4 text-verse-rose" />
            <h3 className="font-serif text-lg font-bold text-ivory-50">Password & Security</h3>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-verse-rose/10 border border-verse-rose/20 text-xs text-verse-rose flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {passwordSaved ? (
                <span className="text-xs text-verse-teal flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Password changed</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 text-xs font-medium border border-charcoal-700 transition"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Data Portability & GDPR Export */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-charcoal-800">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="w-4 h-4 text-verse-teal" />
            <h3 className="font-serif text-lg font-bold text-ivory-50">Data Portability (GDPR Export)</h3>
          </div>
          <p className="text-xs text-ivory-400 mb-4 max-w-xl">
            You own everything you write on Verseora. Download a complete JSON archive containing all your private drafts, published works, collections, and profile data anytime.
          </p>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-100 text-xs font-medium border border-charcoal-700 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-verse-teal" />
            <span>{exporting ? 'Generating Archive...' : 'Download Complete Archive (JSON)'}</span>
          </button>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-verse-rose/30 bg-verse-rose/5">
          <div className="flex items-center space-x-2 mb-2">
            <Trash2 className="w-4 h-4 text-verse-rose" />
            <h3 className="font-serif text-lg font-bold text-verse-rose">Delete Account</h3>
          </div>
          <p className="text-xs text-ivory-400 mb-4 max-w-xl">
            Permanently remove your profile, private drafts, published works, comments, and personal collections. This action cannot be reversed.
          </p>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-verse-rose/10 hover:bg-verse-rose/20 text-verse-rose border border-verse-rose/30 text-xs font-medium transition"
          >
            Permanently Delete My Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-verse-rose/40 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-verse-rose mb-2">Confirm Account Deletion</h3>
            <p className="text-xs text-ivory-300 mb-6 leading-relaxed">
              To prevent accidental deletion, please verify your current account password. All your writings and drafts will be permanently deleted.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-verse-rose/15 border border-verse-rose/30 text-xs text-verse-rose flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ivory-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-ivory-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }}
                  className="px-4 py-2 text-xs text-ivory-400 hover:text-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-5 py-2.5 bg-verse-rose text-ivory-50 text-xs rounded-xl font-medium hover:bg-verse-rose/90 transition shadow-lg"
                >
                  {deleting ? 'Deleting...' : 'Delete Everything Forever'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

