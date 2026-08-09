// config/commands.js
// Commands are split into two layers:
//   1. buildCommands(profile) — dynamic commands built from /profile API data
//   2. STATIC_COMMANDS        — easter eggs & system commands (hardcoded, never change)
//
// Terminal.jsx fetches /profile on mount and calls buildCommands() to get the live list.
// On error (backend offline) it falls back to STATIC_COMMANDS only.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Fetch profile from backend ─────────────────────────────────────────────────
export async function fetchProfile() {
  const res = await fetch(`${API_URL}/profile`);
  if (!res.ok) throw new Error(`/profile returned ${res.status}`);
  return res.json();
}

// ── Build dynamic commands from profile data ───────────────────────────────────
export function buildCommands(profile) {
  const github  = profile.social_links?.find(s => s.platform === 'GitHub')?.url  || '';
  const linkedin = profile.social_links?.find(s => s.platform === 'LinkedIn')?.url || '';
  const itchio  = profile.social_links?.find(s => s.platform === 'itch.io')?.url  || '';

  const skillNames = profile.skills?.map(s => s.name).join(' · ') || '';

  const projectsText = profile.projects
    ?.map((p, i) => {
      const idx = String(i + 1).padStart(2, '0');
      const stack = p.tech_stack?.join(' · ') || '';
      const url = p.repo_url || p.url || '';
      return `[${idx}] ${p.name}\n     ▸ ${p.description}\n     ▸ ${stack}${url ? `\n     ▸ ${url}` : ''}`;
    })
    .join('\n\n') || 'No projects found.';

  const exp = profile.experience?.[0];
  const expLine = exp
    ? `\nCurrently: ${exp.title} @ ${exp.company} (${exp.is_current ? 'ongoing' : exp.end_date})`
    : '';

  const edu = profile.education?.[0];
  const eduLine = edu
    ? `\nStudying: ${edu.degree} in ${edu.field_of_study} @ ${edu.institution}`
    : '';

  return [
    {
      command: '/about',
      description: 'Who is Arpita?',
      response:
        `Hi! I'm ${profile.full_name} — ${profile.headline}\n\n` +
        `${profile.summary}` +
        expLine +
        eduLine +
        `\n\nBased in ${profile.contact?.location || 'India'}. Always open to interesting problems. 🌸`,
    },
    {
      command: '/projects',
      description: 'See my work',
      response: `Here are some things I've built:\n\n${projectsText}\n\n→ More on GitHub: ${github}`,
    },
    {
      command: '/skills',
      description: 'My tech stack',
      response: `SKILLS  ▸ ${skillNames}\n\nLanguages spoken: ${profile.languages_spoken?.join(', ') || ''}`,
    },
    {
      command: '/resume',
      description: 'Download my résumé',
      response: `Fetching résumé...\n\n→ Opening PDF...\n\nType /contact to reach me directly.`,
      action: 'resume',
    },
    {
      command: '/contact',
      description: 'Get in touch',
      response:
        `Let's talk! 🌸\n\n` +
        `📧  EMAIL    ${profile.contact?.email || 'N/A'}\n` +
        `🐙  GITHUB   ${github}\n` +
        `💼  LINKEDIN ${linkedin}\n` +
        `🎮  ITCH.IO  ${itchio}\n\n` +
        `I'm open to: internships · collaborations · OSS · interesting problems.\n` +
        `Response time: usually < 24h.`,
    },
    // system commands
    {
      command: '/clear',
      description: 'Clear terminal screen',
      response: null,
    },
    {
      command: '/help',
      description: 'Show all commands',
      response: null,
    },
    // ── Easter eggs (hardcoded — they're jokes, not profile data) ─────────────
    {
      command: '/hire-me',
      description: null,
      response:
        `╔══════════════════════════════╗\n` +
        `║       HIRING BOSS FIGHT       ║\n` +
        `╚══════════════════════════════╝\n\n` +
        `Recruiter HP: ██████████ 100%\n\n` +
        `Choose your attack:\n\n` +
        `[1] Show Projects\n` +
        `[2] Show Skills\n` +
        `[3] Show Resume\n` +
        `[4] ????`,
      action: 'boss-fight', // Terminal.jsx enters "awaiting choice" mode after this
    },
    {
      command: '/exit',
      description: null,
      response: null, // handled dynamically via EXIT_SEQUENCE in Terminal.jsx
      action: 'exit-attempt',
    },
    {
      command: '/theme',
      description: null,
      action: 'toggle-theme',
      response: `Toggling theme... ✨`,
    },
    {
    command: '/stalk',
    description: null,
    response:
      `Oh? Looking for something?\n\n` +
      `That's cute.\n\n` +
      `Try /projects instead.\n` +
      `They're prettier.`,
    },
  ];
}

// ── Boss fight moves (used by Terminal.jsx while awaiting a /hire-me choice) ──
export const BOSS_FIGHT_MOVES = {
  '1': {
    text:
      `You show your PROJECTS.\n\n` +
      `Recruiter HP: ███████░░░ 70%\n` +
      `"...okay that's actually impressive."`,
    followUp: 'projects',
  },
  '2': {
    text:
      `You show your SKILLS.\n\n` +
      `Recruiter HP: █████░░░░░ 50%\n` +
      `"Wait, you know all of that?"`,
    followUp: 'skills',
  },
  '3': {
    text:
      `You show your RESUME.\n\n` +
      `Recruiter HP: ███░░░░░░░ 30%\n` +
      `"This is... actually really clean."`,
    followUp: 'resume',
  },
  '4': {
    text:
      `Secret attack unlocked.\n\n` +
      `Confidence.\n\n` +
      `"Just hire me."\n\n` +
      `Critical hit. 💥\n\n` +
      `Recruiter HP: ░░░░░░░░░░ 0%\n\n` +
      `YOU WIN. 🏆`,
    followUp: 'contact',
  },
};

// ── Exit sequence (used by Terminal.jsx, keyed by attempt count) ──────────────
export const EXIT_SEQUENCE = [
  `Leaving already?\n\n...\n\nFine.\n\nBut you haven't seen /projects.`,
  `You're persistent.\n\nRespect.`,
  `Okay okay, I get it.\n\n...still not leaving though. This is a website, not an app. 😄\n\nTry /contact if you actually want to reach me.`,
];

// ── Fallback static commands (used when backend is offline) ───────────────────
// Just the system/easter-egg commands — no profile data needed.
export const STATIC_COMMANDS = buildCommands({
  full_name: 'Arpita Verma',
  headline: 'AI/ML Engineer | Open Source Contributor | Software Engineer',
  summary: 'Computer Science undergraduate specializing in machine learning, computer vision, and Linux-based network systems.',
  contact: { email: 'arpitaverma005@gmail.com', location: 'Patiala, IN' },
  social_links: [
    { platform: 'GitHub', url: 'https://github.com/sleepyme06' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/arpita-verma-2574a5371/' },
    { platform: 'itch.io', url: 'https://itch.io/profile/sleepyme06' },
  ],
  skills: [
    { name: 'Python' }, { name: 'C++' }, { name: 'C' }, { name: 'PyTorch' },
    { name: 'OpenCV' }, { name: 'Scikit-learn' }, { name: 'Linux' }, { name: 'GODOT' },
  ],
  projects: [],
  experience: [{ title: 'LFX Mentee', company: 'Magma Core (Linux Foundation)', is_current: true }],
  education: [{ degree: 'B.E', field_of_study: 'Computer Science', institution: 'Thapar Institute of Engineering & Technology' }],
  languages_spoken: ['English', 'Hindi', 'Punjabi'],
});