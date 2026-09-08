# Media provenance and approval gate

United Olympics Sports treats media provenance as a production boundary.

## What the baseline means

`media-provenance.json` records immutable Git tree SHAs for the media and brand directories that existed when this control was introduced. A file is grandfathered only while its Git blob SHA is unchanged from that baseline.

Grandfathering is technical continuity only. It does **not** assert copyright ownership, licensing, model or property releases, trademark permission, or any other legal clearance.

## What happens when media changes

Any new protected asset, or any existing protected asset whose bytes change, fails `npm run qa:media-provenance` unless `media-provenance.json` contains an explicit `approved` record for that exact path.

The record must document:

- `rightsBasis`: one of `owner-supplied`, `commissioned`, `licensed`, `public-domain`, `generated`, or `other-documented`;
- `source`: where the asset came from;
- `approvedBy`: the person or authority that approved its production use;
- `approvedAt`: approval date in `YYYY-MM-DD` format;
- `evidence`: a durable reference to the supporting approval, contract, license, generation record, source file, ticket, or other evidence.

Placeholder values such as `unknown`, `pending`, `TODO`, `TBD`, `N/A`, or `none` are rejected.

## Protected roots

The initial protected roots are:

- `public/media`
- `public/brand`

The gate covers common image, video, audio, and font asset extensions inside those roots.

## CI behavior

Production Readiness runs the provenance gate for changes involving protected media, the provenance manifest/schema, the gate itself, or related production files. New or byte-modified media without an approved record blocks production readiness.

This control is deliberately fail-closed for future media changes while avoiding unsupported legal claims about historical assets.
