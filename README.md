# Horizon Character Bot — Cloudflare Worker

This version is built for Cloudflare Workers (HTTP interactions), not a long-running discord.js gateway process.

## Required Cloudflare variables / secrets

Add these in Worker > Settings > Variables and Secrets:

- DISCORD_TOKEN (Secret)
- DISCORD_CLIENT_ID
- DISCORD_GUILD_ID
- DISCORD_PUBLIC_KEY
- CHARACTER_FORUM_ID = 1548547939108921395
- CHARACTER_REVIEW_CHANNEL_ID = 1549109626446938292
- CHARACTER_REVIEWER_ROLE_ID
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (Secret)
- SETUP_KEY (Secret; any random private phrase used once to register commands)

## Deploy

Cloudflare should run:

npx wrangler deploy

The repo includes `wrangler.jsonc` with the Worker entry point.

## After deployment

If Cloudflare gives you:
https://horizon-character-bot.YOURSUBDOMAIN.workers.dev

Set Discord Developer Portal > General Information > Interactions Endpoint URL to:
https://horizon-character-bot.YOURSUBDOMAIN.workers.dev/interactions

Then register the slash commands once by visiting:
https://horizon-character-bot.YOURSUBDOMAIN.workers.dev/register?key=YOUR_SETUP_KEY

After it succeeds, you may remove or rotate SETUP_KEY.

## Supabase

Run `supabase/schema.sql` in Supabase SQL Editor.
