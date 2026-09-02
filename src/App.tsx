import { AppRouter } from "./app/AppRouter";
import { UiSettingsProvider } from "./ui/theme/UiSettingsProvider";

export function App() {
  return (
    <UiSettingsProvider>
      <AppRouter />
    </UiSettingsProvider>
  );
}

export default App;
