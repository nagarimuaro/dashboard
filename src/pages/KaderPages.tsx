import React from 'react';
import KaderManagement from '../components/kader/KaderManagement';
import KelompokKaderManagement from '../components/kader/KelompokKaderManagement';
import KaderKehamilan from '../components/kader/KaderKehamilan';
import KaderImunisasi from '../components/kader/KaderImunisasi';
import KaderPersalinan from '../components/kader/KaderPersalinan';
import KaderTugasManagement from '../components/kader/KaderTugasManagement';
import KaderPerformance from '../components/kader/KaderPerformance';

export const KaderManagementPage: React.FC = () => {
  return <KaderManagement />;
};

export const KelompokKaderManagementPage: React.FC = () => {
  return <KelompokKaderManagement />;
};

export const KaderTugasPage: React.FC = () => {
  return <KaderTugasManagement />;
};

export const KaderPerformancePage: React.FC = () => {
  return <KaderPerformance />;
};

export const KaderKehamilanPage: React.FC = () => {
  return <KaderKehamilan userRole="admin_nagari" />;
};

export const KaderImunisasiPage: React.FC = () => {
  return <KaderImunisasi userRole="admin_nagari" />;
};

export const KaderPersalinanPage: React.FC = () => {
  return <KaderPersalinan userRole="admin_nagari" />;
};
