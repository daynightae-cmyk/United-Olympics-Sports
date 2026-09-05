from pathlib import Path


def write(path: str, content: str) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def replace(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text(encoding="utf-8")
    if old not in text:
        raise RuntimeError(f"Expected integration pattern not found in {path}: {old[:120]!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


write(
    "src/brand/portalEmblems.ts",
    """export type PortalKind = 'player' | 'parent' | 'coach' | 'admin' | 'store';

export type PortalEmblemDefinition = {
  light: string;
  dark: string;
  altEn: string;
  altAr: string;
};

export const portalEmblems: Record<PortalKind, PortalEmblemDefinition> = {
  player: {
    light: '/brand/portals/player/player-portal-light.png',
    dark: '/brand/portals/player/player-portal-dark.png',
    altEn: 'United Olympics Sports Player Portal',
    altAr: 'شعار بوابة اللاعب — يونايتد أوليمبيكس سبورت',
  },
  parent: {
    light: '/brand/portals/parent/parent-portal-light.png',
    dark: '/brand/portals/parent/parent-portal-dark.png',
    altEn: 'United Olympics Sports Parent Portal',
    altAr: 'شعار بوابة ولي الأمر — يونايتد أوليمبيكس سبورت',
  },
  coach: {
    light: '/brand/portals/coach/coach-portal-light.png',
    dark: '/brand/portals/coach/coach-portal-dark.png',
    altEn: 'United Olympics Sports Coach Portal',
    altAr: 'شعار بوابة المدرب — يونايتد أوليمبيكس سبورت',
  },
  admin: {
    light: '/brand/portals/admin/admin-portal-light.png',
    dark: '/brand/portals/admin/admin-portal-dark.png',
    altEn: 'United Olympics Sports Admin Portal',
    altAr: 'شعار بوابة الإدارة — يونايتد أوليمبيكس سبورت',
  },
  store: {
    light: '/brand/portals/store/store-light.png',
    dark: '/brand/portals/store/store-dark.png',
    altEn: 'United Olympics Sports Store',
    altAr: 'شعار المتجر — يونايتد أوليمبيكس سبورت',
  },
};
""",
)

write(
    "src/components/brand/PortalEmblem.tsx",
    """import { useEffect } from 'react';
import { portalEmblems, type PortalKind } from '../../brand/portalEmblems';
import { useUiSettings } from '../../ui/theme/useUiSettings';
import '../../styles/portal-emblems.css';

export type PortalEmblemSize = 'compact' | 'header' | 'auth' | 'hero';
export type PortalEmblemRole = 'primary' | 'selector' | 'decorative';

type PortalEmblemProps = {
  portal: PortalKind;
  size?: PortalEmblemSize;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  preloadAlternate?: boolean;
  role?: PortalEmblemRole;
};

export function PortalEmblem({
  portal,
  size = 'header',
  className = '',
  decorative = false,
  priority = false,
  preloadAlternate = true,
  role,
}: PortalEmblemProps) {
  const { resolvedTheme } = useUiSettings();
  const definition = portalEmblems[portal];
  const src = definition[resolvedTheme];
  const alternate = definition[resolvedTheme === 'dark' ? 'light' : 'dark'];
  const resolvedRole: PortalEmblemRole = role ?? (decorative ? 'decorative' : 'primary');

  useEffect(() => {
    if (!preloadAlternate || typeof window === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.src = alternate;
  }, [alternate, preloadAlternate]);

  const alt = decorative ? '' : `${definition.altEn} emblem | ${definition.altAr}`;

  return (
    <span
      className={`portal-emblem portal-emblem-${size} ${className}`.trim()}
      data-portal-emblem={portal}
      data-portal-theme={resolvedTheme}
      data-portal-emblem-role={resolvedRole}
    >
      <img
        src={src}
        alt={alt}
        aria-hidden={decorative ? true : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        width={512}
        height={512}
      />
    </span>
  );
}
""",
)

write(
    "src/styles/portal-emblems.css",
    """.portal-emblem {
  --portal-emblem-size: 3.5rem;
  display: inline-grid;
  place-items: center;
  inline-size: var(--portal-emblem-size);
  block-size: var(--portal-emblem-size);
  flex: 0 0 var(--portal-emblem-size);
  aspect-ratio: 1;
  border-radius: 50%;
  isolation: isolate;
  position: relative;
}

.portal-emblem::before {
  content: '';
  position: absolute;
  inset: 5%;
  border-radius: inherit;
  background: radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--gold, #c8a95b) 12%, transparent), transparent 66%);
  filter: blur(10px);
  opacity: .45;
  z-index: -1;
}

.portal-emblem img {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 50%;
  filter: drop-shadow(0 10px 20px rgb(24 18 5 / .13));
}

[data-theme='dark'] .portal-emblem img {
  filter: drop-shadow(0 12px 28px rgb(0 0 0 / .34));
}

.portal-emblem-compact { --portal-emblem-size: clamp(2.5rem, 4vw, 3rem); }
.portal-emblem-header { --portal-emblem-size: clamp(3.25rem, 5vw, 4.5rem); }
.portal-emblem-auth { --portal-emblem-size: clamp(7.5rem, 14vw, 11.25rem); }
.portal-emblem-hero { --portal-emblem-size: clamp(10rem, 18vw, 15rem); }
.portal-auth-visual .portal-emblem-hero { margin-block-end: clamp(1rem, 2vw, 1.75rem); }
.portal-auth-switcher .portal-emblem { --portal-emblem-size: 2rem; }
.portal-role .portal-shell-emblem { margin-block-end: .65rem; }
.admin-brand .admin-portal-emblem { --portal-emblem-size: 2.75rem; }
.store-main-header > .store-portal-emblem { --portal-emblem-size: clamp(2.5rem, 4vw, 3.25rem); }

@media (max-width: 430px) {
  .portal-emblem-auth { --portal-emblem-size: clamp(7.5rem, 34vw, 9.375rem); }
  .portal-emblem-hero { --portal-emblem-size: clamp(7.5rem, 36vw, 9.375rem); }
  .portal-auth-visual .portal-emblem-hero { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .portal-emblem,
  .portal-emblem img { transition: none !important; animation: none !important; }
}
""",
)

# Shared auth: retain canonical corporate mark in the toolbar; portal emblem owns portal identity.
replace(
    "src/components/auth/PortalAuthPage.tsx",
    "import { ThemeToggle } from '../ui/ThemeToggle';",
    "import { ThemeToggle } from '../ui/ThemeToggle';\nimport { PortalEmblem } from '../brand/PortalEmblem';",
)
replace(
    "src/components/auth/PortalAuthPage.tsx",
    '        <section className="portal-auth-visual" aria-labelledby={`portal-${portal}-visual-title`}>\n          <div className="portal-auth-visual-copy">',
    '        <section className="portal-auth-visual" aria-labelledby={`portal-${portal}-visual-title`}>\n          <PortalEmblem portal={portal} size="hero" decorative priority />\n          <div className="portal-auth-visual-copy">',
)
replace(
    "src/components/auth/PortalAuthPage.tsx",
    '            <div className="portal-auth-identity">\n              <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />',
    '            <div className="portal-auth-identity">\n              <PortalEmblem portal={portal} size="auth" priority />',
)
replace(
    "src/components/auth/PortalAuthPage.tsx",
    "          <Link key={item.kind} className={item.kind === portal ? 'is-active' : ''} aria-current={item.kind === portal ? 'page' : undefined} to={item.to}>\n            <BilingualText value={item.label} />",
    "          <Link key={item.kind} className={item.kind === portal ? 'is-active' : ''} aria-current={item.kind === portal ? 'page' : undefined} to={item.to}>\n            <PortalEmblem portal={item.kind} size=\"compact\" decorative preloadAlternate={false} role=\"selector\" />\n            <BilingualText value={item.label} />",
)

# Parent and Coach use the shared PortalLayout shell; preserve the official organization mark and add portal identity.
replace(
    "src/layouts/PortalLayout.tsx",
    "import { LanguageOrderToggle } from '../components/ui/LanguageOrderToggle';",
    "import { LanguageOrderToggle } from '../components/ui/LanguageOrderToggle';\nimport { PortalEmblem } from '../components/brand/PortalEmblem';",
)
replace(
    "src/layouts/PortalLayout.tsx",
    "      <div className=\"portal-role\"><small><BilingualText value={bi('Preview Product', 'منتج تجريبي')} /></small><BilingualText value={meta.title} /><span><BilingualText value={meta.role} /></span></div>",
    "      <div className=\"portal-role\"><PortalEmblem portal={portal} size=\"header\" className=\"portal-shell-emblem\" /><small><BilingualText value={bi('Preview Product', 'منتج تجريبي')} /></small><BilingualText value={meta.title} /><span><BilingualText value={meta.role} /></span></div>",
)

# Admin keeps master logo and gains a dedicated sub-brand emblem.
replace(
    "src/components/admin/AdminSidebar.tsx",
    "import { BilingualText, bi } from '../bilingual/BilingualText';",
    "import { BilingualText, bi } from '../bilingual/BilingualText';\nimport { PortalEmblem } from '../brand/PortalEmblem';",
)
replace(
    "src/components/admin/AdminSidebar.tsx",
    '      <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />\n      <div className="admin-brand-copy">',
    '      <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />\n      <PortalEmblem portal="admin" size="compact" className="admin-portal-emblem" />\n      <div className="admin-brand-copy">',
)

# Player keeps its master brand logo and adds a compact player portal identity in the shell header.
replace(
    "src/portals/player/PlayerPortalShell.tsx",
    'import SafeBrandLogo from "../../components/ui/SafeBrandLogo";',
    'import SafeBrandLogo from "../../components/ui/SafeBrandLogo";\nimport { PortalEmblem } from "../../components/brand/PortalEmblem";',
)
replace(
    "src/portals/player/PlayerPortalShell.tsx",
    '          <SafeBrandLogo className="athlete-sidebar-logo" />\n          <div className="min-w-0">',
    '          <SafeBrandLogo className="athlete-sidebar-logo" />\n          <PortalEmblem portal="player" size="compact" decorative className="athlete-sidebar-portal-emblem" />\n          <div className="min-w-0">',
)

# Store keeps the organization logo and adds a compact store sub-brand badge; products remain visually dominant.
replace(
    "src/store/StoreComponents.tsx",
    "import { ThemeToggle } from '../components/ui/ThemeToggle';",
    "import { ThemeToggle } from '../components/ui/ThemeToggle';\nimport { PortalEmblem } from '../components/brand/PortalEmblem';",
)
replace(
    "src/store/StoreComponents.tsx",
    '      <Link to="/store" className="store-brand"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><span><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small></span></Link>\n      <div className="store-search-wrap"',
    '      <Link to="/store" className="store-brand"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><span><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small></span></Link>\n      <PortalEmblem portal="store" size="compact" className="store-portal-emblem" />\n      <div className="store-search-wrap"',
)

write(
    "qa/portal-emblems.mjs",
    """import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.UOS_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDir = process.env.UOS_PORTAL_SCREENSHOTS ?? 'test-results/portal-emblems';
const expectedPath = {
  player: { light: '/brand/portals/player/player-portal-light.png', dark: '/brand/portals/player/player-portal-dark.png' },
  parent: { light: '/brand/portals/parent/parent-portal-light.png', dark: '/brand/portals/parent/parent-portal-dark.png' },
  coach: { light: '/brand/portals/coach/coach-portal-light.png', dark: '/brand/portals/coach/coach-portal-dark.png' },
  admin: { light: '/brand/portals/admin/admin-portal-light.png', dark: '/brand/portals/admin/admin-portal-dark.png' },
  store: { light: '/brand/portals/store/store-light.png', dark: '/brand/portals/store/store-dark.png' },
};
const cases = [
  { portal: 'player', route: '/player/login' },
  { portal: 'parent', route: '/parent/login' },
  { portal: 'coach', route: '/coach/login' },
  { portal: 'admin', route: '/admin/login' },
  { portal: 'store', route: '/store/login' },
  { portal: 'parent', route: '/parent' },
  { portal: 'coach', route: '/coach' },
  { portal: 'admin', route: '/admin' },
  { portal: 'store', route: '/store' },
];
const screenshotCases = cases.slice(0, 5);
const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 1000 },
];
const settings = (appearance, bilingualOrder) => ({ appearance, bilingualOrder, density: 'comfortable', motion: 'system', fontScale: 'default', sidebarDefault: 'expanded' });

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const entry of cases) {
    for (const appearance of ['light', 'dark']) {
      for (const bilingualOrder of ['en-first', 'ar-first']) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: appearance });
        await context.addInitScript(({ payload }) => localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload)), { payload: settings(appearance, bilingualOrder) });
        const page = await context.newPage();
        const consoleErrors = [];
        page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'networkidle' });
        const primary = page.locator('[data-portal-emblem-role="primary"]');
        if (await primary.count() < 1) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: missing primary emblem`);
        const primaryPortals = await primary.evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('data-portal-emblem')))]);
        if (primaryPortals.some((portal) => portal !== entry.portal)) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: wrong primary emblem(s) ${primaryPortals.join(',')}`);
        const expected = expectedPath[entry.portal][appearance];
        const sources = await primary.locator('img').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src')));
        if (!sources.some((src) => src?.endsWith(expected))) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: expected ${expected}, got ${sources.join(',')}`);
        const dir = await page.locator('html').getAttribute('dir');
        const expectedDir = bilingualOrder === 'ar-first' ? 'rtl' : 'ltr';
        if (dir !== expectedDir) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: dir=${dir}, expected ${expectedDir}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        if (overflow) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: horizontal overflow at 390px`);
        if (consoleErrors.length) errors.push(`${entry.route} ${appearance} ${bilingualOrder}: console errors: ${consoleErrors.join(' | ')}`);
        await context.close();
      }
    }
  }

  for (const entry of screenshotCases) {
    for (const appearance of ['light', 'dark']) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport, colorScheme: appearance });
        await context.addInitScript(({ payload }) => localStorage.setItem('uos:ui-settings:v1', JSON.stringify(payload)), { payload: settings(appearance, 'en-first') });
        const page = await context.newPage();
        await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(outputDir, `${entry.portal}-${viewport.name}-${appearance}.png`), fullPage: true });
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Portal emblem QA PASS; screenshots: ${outputDir}`);
""",
)

verify = Path(".github/workflows/verify.yml")
verify_text = verify.read_text(encoding="utf-8")
needle = """      - name: Store Golden Master QA (production)\n        env:\n          UOS_BASE_URL: http://127.0.0.1:4173\n        run: node qa/store-golden-master.mjs\n"""
addition = """      - name: Portal emblem route, theme, RTL and screenshot QA\n        env:\n          UOS_BASE_URL: http://127.0.0.1:4173\n        run: node qa/portal-emblems.mjs\n\n      - name: Upload portal emblem screenshots\n        if: always()\n        uses: actions/upload-artifact@v6\n        with:\n          name: portal-emblem-screenshots\n          path: test-results/portal-emblems\n          if-no-files-found: ignore\n\n"""
if addition not in verify_text:
    if needle not in verify_text:
        raise RuntimeError("Verify workflow insertion point not found")
    verify.write_text(verify_text.replace(needle, needle + "\n" + addition, 1), encoding="utf-8")
