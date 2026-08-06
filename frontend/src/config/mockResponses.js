// config/mockResponses.js
// Keyword-based canned responses for free-text input.
// Real LLM integration replaces this later — just swap the resolver function.

const RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'hii', 'sup', 'greetings'],
    response: `Hello there! 👋  I'm Arpita's portfolio terminal.

Try typing a question about me, or use a slash command:
/about · /projects · /skills · /resume · /contact · /help`,
  },
  {
    keywords: ['name', 'who', 'arpita', 'introduce', 'yourself'],
    response: `I'm Arpita Verma — a developer who loves AI, games, and open source. Type /about for the full story.`,
  },
  {
    keywords: ['project', 'built', 'made', 'portfolio', 'work', 'show'],
    response: `I've built AI/ML systems, indie games, and contributed to open source. Type /projects to see them all.`,
  },
  {
    keywords: ['skill', 'language', 'tech', 'stack', 'know', 'use', 'tools'],
    response: `Python, C/C++, PyTorch, TensorFlow, Godot, Flask, and more. Type /skills for the full breakdown.`,
  },
  {
    keywords: ['hire', 'job', 'opportunity', 'work together', 'recruit', 'internship', 'available'],
    response: `Always interested in good opportunities! Try /sudo hire-me for the official vetting process, or /contact to reach me directly.`,
  },
  {
    keywords: ['contact', 'email', 'reach', 'linkedin', 'github', 'dm'],
    response: `Type /contact for all my links — email, GitHub, and LinkedIn.`,
  },
  {
    keywords: ['resume', 'cv', 'experience'],
    response: `Type /resume to download my résumé as a PDF.`,
  },
  {
    keywords: ['game', 'gaming', 'godot', 'unity', 'pygame', 'indie'],
    response: `Game dev is one of my favourite creative outlets! I work with Godot 4, Unity, and Pygame. Check /projects for NeuroPlay and Pixel Dungeon.`,
  },
  {
    keywords: ['ai', 'ml', 'machine learning', 'neural', 'model', 'pytorch', 'tensorflow'],
    response: `AI/ML is close to my heart. I've trained RL agents, built classifiers, and tinkered with generative models. See /projects and /skills for specifics.`,
  },
  {
    keywords: ['open source', 'oss', 'contribute', 'pr', 'pull request'],
    response: `I love contributing to open source! I've shipped PRs to projects I care about — see /projects for OpenSketch and more.`,
  },
  {
    keywords: ['coffee', 'tea', 'drink'],
    response: `Dark roast, always. Type /coffee for a demonstration ☕`,
  },
  {
    keywords: ['thank', 'thanks', 'awesome', 'cool', 'nice', 'great', 'love'],
    response: `Thanks! 🌸 Means a lot. Anything else you'd like to know? Try /help for all commands.`,
  },
];

/**
 * getResponse(input: string): string
 * Simple keyword matcher — replace with LLM call later.
 */
export function getResponse(input) {
  const lower = input.toLowerCase().trim();

  for (const { keywords, response } of RESPONSES) {
    if (keywords.some(kw => lower.includes(kw))) {
      return response;
    }
  }

  return `Hmm, I'm not sure how to answer that yet.

Try: /about · /projects · /skills · /contact · /help
Or ask something like "what have you built?" or "tell me about yourself."`;
}
