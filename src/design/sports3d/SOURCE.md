# UOS Sports 3D — Source & Licensing

- **Reference source:** Sports 3D Icon Pack — Community (Figma)
- **URL:** https://www.figma.com/design/CyQcMFSehwzldAwhzPT8dZ/Sports-3D-Icon-Pack--Community-?node-id=114-120
- **Known visual categories:** Football, Basketball, Swimming, Tennis, Trophy,
  Stopwatch, Whistle, Gym, Boxing, Sports Bottle, Table Tennis, Badminton,
  Hockey, Rugby, Chess, Cricket, Baseball, Esports, Sportsperson.
- **licenseStatus:** `review-required` — commercial terms cannot be verified in
  this environment. No commercial clearance is claimed.
- **Bundled local assets (`public/media/sports-3d/`):** none yet. Until a
  licensed asset is bundled, `resolveSport3D()` returns `null` and all callers
  render the coded/vector identity visual. Production never depends on
  temporary Figma URLs.
- **No false mapping:** `gymnastics` is never rendered as `gym`;
  `martial-arts` is never rendered as `boxing`. Unmatched disciplines render
  no 3D asset.
- **Usage policy:** identity surfaces only (sport cards, sport detail heroes,
  Admin Sports, Player athlete identity secondary layer, one restrained
  Coach/Parent treatment, selected achievement/empty-state contexts). Never in
  sidebars, nav items, buttons, filters, table controls, or settings actions.
