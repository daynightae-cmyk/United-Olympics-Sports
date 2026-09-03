import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AdminDataGateway } from './AdminDataGateway';
import { previewAdminGateway, resetPreviewData } from './previewAdminGateway';
import type { AdminDataMode } from './queryTypes';

interface AdminDataContextValue {
  gateway: AdminDataGateway;
  mode: AdminDataMode;
  setMode: (mode: AdminDataMode) => void;
  resetPreview: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children, initialMode = 'preview' }: { children: ReactNode; initialMode?: AdminDataMode }) {
  const [mode] = useState<AdminDataMode>(initialMode);
  const [gateway] = useState<AdminDataGateway>(previewAdminGateway);

  const value = useMemo(() => ({
    gateway,
    mode,
    setMode: () => {},
    resetPreview: resetPreviewData,
  }), [gateway, mode]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}