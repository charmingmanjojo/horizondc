# Detective Comics: Horizon — Character Bot

Discord character sheet workflow for Horizon.

## What this build does
- `/create` only works inside the configured Character Creation forum.
- One active character per Discord user. Draft, pending, changes-requested, and approved characters all block duplicate creation.
- Approved characters must be deleted by an administrator before that user can create a new one.
- `/sheet` reopens the owner's editor.
- Dropdowns for species, affiliation, and major selectable mantles.
- Batman and Robin are staff-only, single-slot mantles assigned with `/mantle`.
- Conditional detail forms appear for aliens, Kryptonians, Atlanteans, Amazonians, and Lanterns.
- Species / Lantern selections generate suggested baseline abilities.
- Baselines can be kept, edited, or removed.
- Completion percentage and completed-tab marks.
- Submit stays disabled until required sections are complete.
- Preview button shows the public-facing sheet before submission.
- Drafts persist in Supabase.
- Submissions go to `1549109626446938292` by default.
- Staff review controls: Approve, Request Changes, Deny.
- `/delete-character` is administrator-only and frees that user's character slot.

## Theme priority
1. Lantern Corps
2. Major mantle
3. Other affiliation
4. Species
5. Default Horizon theme

This means an alien Green Lantern uses the Lantern ring/theme instead of the Omnitrix alien theme.

## Included icon assets
The `/assets` folder contains split images for:
- Green / Blue / Yellow / Red / Orange / Indigo / Black / White Lanterns
- Star Sapphire
- Superman
- Wonder Woman
- Batman
- Robin
- Aquaman
- Omnitrix

Upload these as custom Discord emojis or host them as image files, then add the emoji IDs / URLs in `src/config.js`.

## Setup
1. Install Node.js 18+.
2. Run `supabase/schema.sql` in your Supabase project.
3. Create `.env` with the required values.
4. Add theme icon IDs or URLs in `src/config.js`.
5. Run `npm install`.
6. Run `npm run register` once after command changes.
7. Run `npm start`.

## Current Horizon channel defaults
- Character forum: `1548547939108921395`
- Staff review channel: `1549109626446938292`

## Required environment variables
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `CHARACTER_FORUM_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Optional environment variables
- `CHARACTER_REVIEW_CHANNEL_ID` — defaults to `1549109626446938292`
- `CHARACTER_REVIEWER_ROLE_ID`

## Staff commands
- `/mantle mantle:Batman|Robin|Clear Mantle` — use inside the character's forum post.
- `/delete-character user:@member` — administrator-only. Deletes the active character record and archives/locks its forum post so the user can make a replacement.
