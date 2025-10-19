import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Spinner from '../components/ui/Spinner';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // For security, Firebase requires re-authentication before changing a password.
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // If re-authentication is successful, update the password.
      await updatePassword(currentUser, newPassword);
      
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error(err);
      setError("Failed to update password. Check your current password is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Profile Information Card */}
            <div className="p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <input type="text" readOnly value={currentUser?.displayName || 'N/A'} className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg cursor-not-allowed"/>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email Address</label>
                  <input type="email" readOnly value={currentUser?.email || ''} className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg cursor-not-allowed"/>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
                </div>
                 <div>
                  <label className="text-sm text-gray-400">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
                </div>
                
                {error && <p className="text-sm text-red-400">{error}</p>}
                {message && <p className="text-sm text-green-400">{message}</p>}

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="px-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-800 flex items-center">
                    {loading ? <Spinner /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;