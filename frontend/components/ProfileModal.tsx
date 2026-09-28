import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfileView, UserProfileData } from './UserProfileView';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();

  const profileData: UserProfileData = {
    id: user?.id || 1,
    name: user?.name || 'Zsasza McCleverty',
    email: user?.email || 'zmcclevertye@soundcloud.com',
    role: user?.role === 'admin' ? 'Maintainer' : 'Subscriber',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    username: user?.name?.toLowerCase().replace(/\s+/g, '') || 'zsaszamccleverty',
    company: 'Skinder PVT LTD',
    taxId: 'Tax-8800',
    country: 'United States',
  };

  return (
    <UserProfileView
      visible={visible}
      user={profileData}
      onClose={onClose}
    />
  );
};
