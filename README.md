# Horizon Character Bot — Cloudflare Worker

This project is Cloudflare-only.

## What goes where

- GitHub: code
- Cloudflare Worker: runtime + variables/secrets
- Supabase: database
- Discord: sends interactions to the Worker

No `.env` file is required for deployment.

## Required Cloudflare variables

Add these under:

Workers & Pages → `horizondc` → Settings → Variables and Secrets

Plain variables:
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `DISCORD_PUBLIC_KEY`
- `CHARACTER_FORUM_ID`
- `CHARACTER_REVIEW_CHANNEL_ID`
- `CHARACTER_REVIEWER_ROLE_ID`
- `SUPABASE_URL`
- `SETUP_KEY`

Secrets:
- `DISCORD_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_URL` must be the base URL only:

`https://YOUR-PROJECT.supabase.co`

Do not append `/rest/v1/`.

## Supabase

Open Supabase SQL Editor and run `supabase.sql` once.

## Discord interaction endpoint

Set:

`https://horizondc.crownfallrpg.workers.dev/interactions`

## Health check

Open:

`https://horizondc.crownfallrpg.workers.dev/health`

Every required check should be `true`.

## Register commands

Open:

`https://horizondc.crownfallrpg.workers.dev/register?key=YOUR_SETUP_KEY`

After registration, the guild should have:
- `/create`
- `/sheet`
- `/view`
- `/delete-character`
- `/mantle`


## v3.1 changes

- Public `/view` now uses a six-page button layout similar to the supplied reference.
- Basic Info, Appearance, Personality, Abilities, Backstory / History, and RP Info are separate pages.
- Selecting `None / Independent` now stays selected instead of visually resetting.
- Superman, Wonder Woman, Aquaman, Batman, and Robin are hidden from normal character creation.
- All five major mantles are assigned only by staff through `/mantle`.
- The included SQL enforces one active holder for each of those five major mantles.


## v3.2 — DC theme pass

No generated banners.

Uses the icon assets already created for Horizon and dynamic Discord embed colors.

Visual priority:
1. Lantern Corps
2. Staff-assigned mantle
3. Species
4. Default Horizon

Icons:
- Superman
- Wonder Woman
- Batman
- Robin
- Aquaman
- Omnitrix
- all nine Lantern Corps variants

Species fallbacks:
- Kryptonian → Superman symbol
- Atlantean → Aquaman symbol
- Amazonian → Wonder Woman symbol
- Alien / Other → Omnitrix
- Human / Metahuman → color only

Superman, Wonder Woman, Aquaman, Batman, and Robin remain staff-only through `/mantle`.
