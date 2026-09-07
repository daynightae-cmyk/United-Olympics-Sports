from pathlib import Path

workspaces = Path('src/pages/admin/AdminDirectoryWorkspaces.tsx')
text = workspaces.read_text(encoding='utf-8')
count = text.count("tone={sport.status === 'active' ? 'active' : 'muted'}") + text.count("tone={program.status === 'active' ? 'active' : 'muted'}")
text = text.replace("tone={sport.status === 'active' ? 'active' : 'muted'}", "tone={sport.status === 'active' ? 'active' : 'neutral'}")
text = text.replace("tone={program.status === 'active' ? 'active' : 'muted'}", "tone={program.status === 'active' ? 'active' : 'neutral'}")
if count != 2:
    raise SystemExit(f'expected 2 unsupported muted tones, found {count}')
workspaces.write_text(text, encoding='utf-8')

player = Path('src/pages/admin/AdminPlayerDetailPage.tsx')
text = player.read_text(encoding='utf-8')
old = "import { BarChart3, CalendarCheck, FileText, Medal, ShieldCheck, Trash2, Trophy, UsersRound } from 'lucide-react';"
new = "import { ArrowRight, BarChart3, CalendarCheck, FileText, Medal, ShieldCheck, Trash2, Trophy, UsersRound } from 'lucide-react';"
if old not in text:
    raise SystemExit('player detail lucide import did not match expected current source')
player.write_text(text.replace(old, new, 1), encoding='utf-8')
