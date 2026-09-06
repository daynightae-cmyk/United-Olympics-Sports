import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AdminDataGateway } from './AdminDataGateway';
import { previewAdminGateway, resetPreviewData } from './previewAdminGateway';
import { unavailableAdminGateway } from './unavailableAdminGateway';
import type { AdminDataMode } from './queryTypes';

interface AdminDataContextValue {
  gateway: AdminDataGateway;
  mode: AdminDataMode;
  resetPreview: () => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

function defaultAdminMode(): AdminDataMode {
  return import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true' ? 'preview' : 'live';
}

export function AdminDataProvider({ children, initialMode }: { children: ReactNode; initialMode?: AdminDataMode }) {
  const [mode] = useState<AdminDataMode>(() => initialMode ?? defaultAdminMode());
  const gateway = mode === 'preview' ? previewAdminGateway : unavailableAdminGateway;

  const value = useMemo(() => ({
    gateway,
    mode,
    resetPreview: mode === 'preview' ? resetPreviewData : () => undefined,
  }), [gateway, mode]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}