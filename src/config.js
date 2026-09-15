import 'dotenv/config';

export const ENV = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  characterForumId: process.env.CHARACTER_FORUM_ID || '1548547939108921395',
  reviewChannelId: process.env.CHARACTER_REVIEW_CHANNEL_ID || '1549109626446938292',
  reviewerRoleId: process.env.CHARACTER_REVIEWER_ROLE_ID || null,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Users never set these per sheet. You configure them once here.
// Each icon can use either an external image URL via `icon`, or a Discord custom emoji via `emojiId`.
export const THEMES = {
  default: {
    accent: 0x3c5f8a,
    icon: null,
  },
  mantles: {
    superman: { accent: 0xdc2626, emojiId: '' },
    'wonder woman': { accent: 0xeab308, emojiId: '' },
    batman: { accent: 0xfacc15, emojiId: '' },
    robin: { accent: 0xf59e0b, emojiId: '' },
    aquaman: { accent: 0x0284c7, emojiId: '' },
  },
  affiliations: {
    'green lantern corps': { accent: 0x16a34a, emojiId: '' },
    'blue lantern corps': { accent: 0x2563eb, emojiId: '' },
    'yellow lantern corps': { accent: 0xeab308, emojiId: '' },
    'red lantern corps': { accent: 0xdc2626, emojiId: '' },
    'orange lantern corps': { accent: 0xea580c, emojiId: '' },
    'indigo tribe': { accent: 0x7c3aed, emojiId: '' },
    'star sapphires': { accent: 0xdb2777, emojiId: '' },
    'black lantern corps': { accent: 0x111827, emojiId: '' },
    'white lantern corps': { accent: 0x9ca3af, emojiId: '' },
    'justice league': { accent: 0x2563eb, emojiId: '' },
    'a.r.g.u.s.': { accent: 0x334155, emojiId: '' },
    plumbers: { accent: 0x1f2937, emojiId: '' },
    's.t.a.r. laboratories': { accent: 0x0f766e, emojiId: '' },
    'league of assassins': { accent: 0x3f3f46, emojiId: '' },
    'order of st. dumas': { accent: 0x78350f, emojiId: '' },
    'challengers of the unknown': { accent: 0x7c3aed, emojiId: '' },
  },
  species: {
    kryptonian: { accent: 0x2563eb, emojiId: '' },
    atlantean: { accent: 0x0284c7, emojiId: '' },
    amazonian: { accent: 0xeab308, emojiId: '' },
    metahuman: { accent: 0x9333ea, emojiId: '' },
    human: { accent: 0x475569, emojiId: '' },
    alien: { accent: 0x84cc16, emojiId: '' },
  },
};

export const STAFF_ASSIGNED_MANTLES = ['batman', 'robin'];

export const TABS = [
  { key: 'basic', label: 'Basic Info', emoji: '🪪' },
  { key: 'appearance', label: 'Appearance', emoji: '👤' },
  { key: 'personality', label: 'Personality', emoji: '🧠' },
  { key: 'abilities', label: 'Abilities', emoji: '⚡' },
  { key: 'history', label: 'History', emoji: '📖' },
  { key: 'rp', label: 'RP Info', emoji: '🎭' },
];
