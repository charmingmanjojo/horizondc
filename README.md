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


## v3.3 — Clean sheet layout

- Page navigation buttons now use neutral Discord gray instead of bright blurple.
- The active page remains disabled/darker.
- Species and Affiliation dropdowns only appear on Basic Info.
- Other pages now look much closer to a clean read-only profile card.
- Removed the extra `DETECTIVE COMICS: HORIZON` heading from the top of every embed.
- Horizon branding moved into the footer so the character remains the visual focus.
- Existing DC colors and icon logic remain unchanged.


## v3.4 — Streamlined editor

This build follows the cleaner editing flow shown in the supplied GrandxBeyond / When Dragons War references.

- Removed the six-button page navigation row.
- One section dropdown controls the current page.
- One simple `Edit` button edits the current section.
- `Submit` and `Cancel` sit together as final actions.
- Species and Affiliation selectors appear only on Basic Info.
- `/view` uses the same single section selector without editor controls.
- Character embed title is now `Character Record`.
- Basic Info uses a compact `PUBLIC × RECORD` presentation.
- Existing DC colors, icons, staff-only mantles, Supabase, and review flow are preserved.


## v3.5 — GOT-style presentation

- Removed `PUBLIC × RECORD`.
- Removed all Hunter x Hunter-style `×` wording.
- Removed the generic `Character Record` title.
- The character name is now the main embed title, like the When Dragons War reference.
- Each page uses a simple section heading.
- The streamlined section dropdown + Edit + Submit / Cancel flow remains.
- DC colors, icons, staff-only mantles, Supabase, and review flow remain unchanged.


## v3.6 — Full submission review

Character submissions now post the full application into the review channel.

Review packet:
- Basic Info + Approve / Request Changes / Deny
- Appearance
- Personality
- Abilities / Skills + Limits / Weaknesses + Equipment
- Full Backstory / History
- Optional RP Info

Submission requirements are stricter so a user cannot unlock Submit with one-line filler:
- Origin required
- Appearance: 100+ characters
- Height and Build required
- Personality: 200+ characters
- Temperament, Strengths, Flaws, Fears: 40+ characters each
- Abilities / Skills: 120+ characters
- Limits / Weaknesses: 60+ characters
- Backstory / History: 500+ characters

Species and affiliation no longer auto-fill the abilities section. Baseline species powers can still be used as guidance, but the applicant must write their actual spec.
