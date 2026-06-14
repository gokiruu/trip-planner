import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { S3Photo } from './S3Photo';
import { uploadFile } from '../utils/storage';

const client = generateClient<Schema>();

interface ProfileProps {
  currentUserId: string;
}

export const Profile: React.FC<ProfileProps> = ({ currentUserId }) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarKey, setAvatarKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.models.UserProfile.list()
      .then(({ data }) => {
        if (data[0]) {
          setProfileId(data[0].id);
          setNickname(data[0].nickname ?? '');
          setBio(data[0].bio ?? '');
          setAvatarKey(data[0].avatarKey ?? '');
        }
      })
      .catch(console.error);
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const key = await uploadFile(file, 'avatars');
      setAvatarKey(key);
    } catch {
      alert('Photo upload failed. Make sure storage is deployed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        nickname: nickname.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarKey: avatarKey || undefined,
      };
      if (profileId) {
        await client.models.UserProfile.update({ id: profileId, ...payload });
      } else {
        const { data: created } = await client.models.UserProfile.create(payload);
        if (created) setProfileId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="profile-avatar-lg">
            {avatarKey ? (
              <S3Photo
                path={avatarKey}
                alt="Profile photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span className="profile-avatar-initial">
                {nickname ? nickname[0].toUpperCase() : '?'}
              </span>
            )}
          </div>
          <div>
            <label className="upload-label">
              {uploading ? 'Uploading...' : avatarKey ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Your user ID (share this to be added to trips):
            </p>
            <code className="user-id-display">{currentUserId}</code>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="What should your friends call you?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A little about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && (
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
