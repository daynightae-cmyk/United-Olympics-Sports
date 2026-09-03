import { AppRouter } from "./app/AppRouter";
import { AdminDataProvider } from './admin/data/AdminDataProvider';
import { UiSettingsProvider } from './ui/theme/UiSettingsProvider';

export function App() {
  return (
    <UiSettingsProvider>
      <AdminDataProvider>
        <AppRouter />
      </AdminDataProvider>
    </UiSettingsProvider>
  );
}

export default App;
