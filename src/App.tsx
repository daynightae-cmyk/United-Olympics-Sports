import { AppRouter } from "./app/AppRouter";
import { AdminDataProvider } from './admin/data/AdminDataProvider';
import { UiSettingsProvider } from './ui/theme/UiSettingsProvider';
import { ToastProvider } from './components/ui/UiFeedback';

export function App() {
  return (
    <UiSettingsProvider>
      <ToastProvider>
        <AdminDataProvider>
          <AppRouter />
        </AdminDataProvider>
      </ToastProvider>
    </UiSettingsProvider>
  );
}

export default App;
