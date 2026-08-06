// config/commands.js
// Single source of truth for all slash commands.
// Used by: /help output, autocomplete dropdown, command router.

export const COMMANDS = [
  {
    command: '/about',
    description: 'Who is Arpita?',
    response: `Hi! I'm Arpita Verma — a software developer with a passion for AI/ML, game development, and open source.

I build things at the intersection of smart systems and creative code: from training neural nets to shipping indie games to contributing to OSS projects I love.

Currently: exploring generative models, building game prototypes, and writing too many Python scripts.

Based in India. Always open to interesting problems. 🌸`,
  },
  {
    command: '/projects',
    description: 'See my work',
    response: `Here are some things I've built:

[01] NeuroPlay Engine
     ▸ A reinforcement-learning agent that learns to play 2D games
     ▸ Python · PyTorch · Pygame
     ▸ github.com/arpitaverma/neuroplay  (placeholder)

[02] Pixel Dungeon Roguelike
     ▸ Procedurally generated dungeon crawler — 30+ biomes, hand-crafted combat
     ▸ Godot 4 · GDScript
     ▸ github.com/arpitaverma/pixel-dungeon  (placeholder)

[03] OpenSketch — OSS Contribution
     ▸ Added GPU-accelerated brush rendering to a popular drawing library
     ▸ C++ · OpenGL · PRs merged upstream
     ▸ github.com/opensketchio/opensketch  (placeholder)

[04] MoodLens
     ▸ Real-time facial emotion classifier using a lightweight MobileNet variant
     ▸ Python · TensorFlow · Flask · WebRTC
     ▸ github.com/arpitaverma/moodlens  (placeholder)

→ More on GitHub. These links are placeholders — update in config/commands.js`,
  },
  {
    command: '/skills',
    description: 'My tech stack',
    response: `LANGUAGES    ▸ Python · C · C++ · GDScript · JavaScript
ML / AI      ▸ PyTorch · TensorFlow · scikit-learn · OpenCV · HuggingFace
GAME DEV     ▸ Godot 4 · Unity · Pygame · Procedural gen · Physics sim
BACKEND      ▸ Flask · FastAPI · Django · REST APIs · SQLite / PostgreSQL
OPEN SOURCE  ▸ Git · GitHub · Code review · Docs · CI/CD workflows
TOOLS        ▸ Linux · Docker · Jupyter · VS Code · Neovim`,
  },
  {
    command: '/resume',
    description: 'Download my résumé',
    response: `Fetching résumé...

→ Opening: /resume/arpita-verma-resume.pdf  (placeholder — drop your PDF in /public/resume/)

Type /contact to reach me directly.`,
    action: 'resume', // special flag to trigger PDF open
  },
  {
    command: '/contact',
    description: 'Get in touch',
    response: `Let's talk! 🌸

📧  EMAIL    hello@arpitaverma.dev  (placeholder)
🐙  GITHUB   github.com/arpitaverma  (placeholder)
💼  LINKEDIN linkedin.com/in/arpitaverma  (placeholder)

I'm open to: internships · collaborations · OSS · interesting problems.
Response time: usually < 24h.`,
  },
  {
    command: '/help',
    description: 'Show all commands',
    response: null, // generated dynamically from this list
  },
  // ── Easter eggs ──────────────────────────────────────────
  {
    command: '/whoami',
    description: null, // hidden from /help
    response: `> whoami

uid=1337(arpita) gid=42(builders) groups=42(builders),1(ai-enjoyers),7(gamedevs),99(opensourcers)

✦ Currently running on: caffeine + curiosity
✦ Last login: 3am from "definitely-just-one-more-commit" session
✦ Shell: /bin/python (obviously)`,
  },
  {
    command: '/coffee',
    description: null,
    response: `Brewing...

  ( (
   ) )
 ........
 |      |]
 \\      /
  '----'

☕  Dark roast, no sugar. Served hot.
(This is the real fuel behind every project above.)`,
  },
  {
    command: '/theme',
    description: null,
    action: 'toggle-theme',
    response: `Toggling theme... ✨`,
  },
  {
    command: '/sudo hire-me',
    description: null,
    response: `[sudo] password for recruiter: ••••••••••

Verifying credentials...
✓ Passion for craft          [OK]
✓ Fast learner               [OK]
✓ Ships things               [OK]
✓ Communicates well          [OK]
✓ Actually writes tests       [OK]

ACCESS GRANTED. 🎉

Seriously though — drop me a line:
/contact`,
  },
];

// Visible commands (shown in /help and autocomplete)
export const PUBLIC_COMMANDS = COMMANDS.filter(c => c.description !== null);

// All command strings (for exact matching)
export const COMMAND_STRINGS = COMMANDS.map(c => c.command);
