import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteLoadingExperience, type UosLoadingPortal } from '../src/components/loading/UosLoadingSystem';
import { UiSettingsContext, type UiSettingsContextValue } from '../src/ui/theme/UiSettingsProvider';

const outputDir = process.env.UOS_LOADING_SSR_PROOF ?? path.resolve('test-results/premium-loading-ssr');
const scenarios: Array<{
  name: string;
  portal: UosLoadingPortal;
  width: number;
  height: number;
  theme: 'light' | 'dark';
  order: 'en-first' | 'ar-first';
}> = [
  { name: 'coach-1440-dark-ltr', portal: 'coach', width: 1440, height: 1000, theme: 'dark', order: 'en-first' },
  { name: 'player-1440-light-rtl', portal: 'player', width: 1440, height: 1000, theme: 'light', order: 'ar-first' },
  { name: 'parent-768-dark-rtl', portal: 'parent', width: 768, height: 1024, theme: 'dark', order: 'ar-first' },
  { name: 'admin-768-light-ltr', portal: 'admin', width: 768, height: 1024, theme: 'light', order: 'en-first' },
  { name: 'portal-390-dark-rtl', portal: 'generic', width: 390, height: 844, theme: 'dark', order: 'ar-first' },
];

const cssFiles = [
  'src/index.css',
  'src/styles/visual-system.css',
  'src/styles/theme-closure.css',
  'src/styles/uos-design-system.css',
  'src/styles/uos-loading-system.css',
];

const css = (await Promise.all(cssFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const noop = () => undefined;

await mkdir(outputDir, { recursive: true });

for (const scenario of scenarios) {
  const value: UiSettingsContextValue = {
    appearance: scenario.theme,
    bilingualOrder: scenario.order,
    density: 'comfortable',
    motion: 'system',
    fontScale: 'default',
    sidebarDefault: 'expanded',
    resolvedTheme: scenario.theme,
    setAppearance: noop,
    setSetting: noop,
    resetSettings: noop,
  };
  const markup = renderToStaticMarkup(
    createElement(
      UiSettingsContext.Provider,
      { value },
      createElement(RouteLoadingExperience, { portal: scenario.portal }),
    ),
  );
  const dir = scenario.order === 'ar-first' ? 'rtl' : 'ltr';
  const document = `<!doctype html><html class="${scenario.theme === 'dark' ? 'dark' : ''}" data-theme="${scenario.theme}" data-bilingual-order="${scenario.order}" dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{margin:0;min-height:100%;width:100%;overflow:hidden}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}${css}</style></head><body><div id="root">${markup}</div></body></html>`;
  await writeFile(path.join(outputDir, `${scenario.name}.html`), document, 'utf8');
}

console.log(`Premium loading SSR proof fixtures written to ${outputDir}`);
