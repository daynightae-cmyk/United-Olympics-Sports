# public/media/sports-3d — licensed 3D sport assets (pending)

No licensed raster 3D assets are bundled yet. The Figma reference pack
("Sports 3D Icon Pack — Community") carries `licenseStatus: review-required`,
so production must not hotlink temporary Figma URLs.

Drop exact licensed files here (e.g. `football.webp`) and point the matching
entry in `src/design/sports3d/sports3d.registry.ts` at its local path. Until
then `resolveSport3D()` returns `null` and all surfaces render the coded
vector identity visual — never a neighbouring sport's imagery.
