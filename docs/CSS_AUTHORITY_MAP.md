# United Olympics Sports — CSS Authority Map

This file documents the intended visual ownership boundaries. New visual work
should extend the owning layer instead of adding another generic "final" sheet.

## Global application order

`src/main.tsx` is the global import authority. The final structural import is
`portal-shell-structure-final.css`; older portal layers must not override its
shell geometry.

## Ownership

| Surface | Owning authority | Notes |
| --- | --- | --- |
| Portal shell geometry | `portal-shell-structure-final.css` | Sidebar/workspace columns, sticky desktop shell, mobile off-canvas, RTL geometry. Structural rules win over older visual portal layers. |
| Shared portal typography/cards/fields | `portal-athletic-cards-final.css`, `portal-interior-delivery-final.css` | Shared sports-product surfaces only. Must not redefine shell geometry. |
| Player interior | `player-portal-final.css` | Player hero, athlete metrics, cards and player-specific responsive rules. |
| Parent interior | `parent-portal-final.css` | Family hero, child athlete cards, parent fields/tables/forms. |
| Coach interior | `coach-portal-final.css` | Training Command, roster, schedule, coach tables/filters. |
| Admin interior | `admin-athletic-final.css` | Operations Command, directories, forms, tables, benchmark-management surfaces. |
| Store app | `store-reference-authority.css` loaded last inside `StoreApp.tsx` | Premium black/ivory/gold retail authority. Earlier store commerce/theme/rhythm sheets provide base tokens/components. |
| Store login | `store-login-reference.css` | Scoped to `.portal-auth[data-portal='store']`; must not alter Parent/Coach/Admin shells. |
| Public site | `public-theme-unification.css`, `public-rhythm-unification.css`, `public-coaching-pathways.css` after `public-relaunch.css` | Public-only palette/rhythm/content authority. |
| General auth | `portal-auth.css`, `auth-closure.css`, `passkey-auth.css` | Login/provider surfaces. Store login receives its isolated override above. |
| Global field primitives | `uos-fields.css` | Reusable field primitives; portal/store-specific owners may refine within their own scope. |

## Non-negotiable rules

- Do not add a new generic closure stylesheet when an owner above already exists.
- Shell geometry belongs only to the shell authority; interior sheets may style
  content but must not reposition the workspace/sidebar contract.
- Store rules remain scoped under `.store-shell` or the dedicated Store login
  selector.
- Portal-specific rules remain scoped by the portal shell class/data attribute.
- One canonical brand image per header/sidebar slot. Composite source artwork
  may be cropped only inside explicitly compact emblem slots.
- Arabic typography/RTL alignment may change layout direction, but must not
  mirror brand artwork or semantic icons.
- Any removal/consolidation of older CSS requires browser regression proof over
  the supported viewport/locale/theme matrix.
