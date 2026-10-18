export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Fallbacks used until GET /meta responds (or if it fails).
export const DEFAULT_META = {
  skillLevels: ['beginner', 'intermediate', 'expert'],
  languages: ['python', 'c', 'cpp', 'rust', 'go', 'javascript', 'typescript', 'java', 'csharp', 'sql', 'bash'],
  docstringStyles: ['google', 'numpy', 'sphinx'],
  testFrameworks: ['pytest', 'unittest', 'jest'],
};

export const MODES = [
  { id: 'chat', icon: '💬', label: 'Chat Buddy', endpoint: 'POST /api/v1/chat',
    placeholder: 'Ask a question. Code in the editor is sent as context.',
    hint: 'Ask anything about your code. Whatever is in the editor goes along as context.' },
  { id: 'bugfix', icon: '🐞', label: 'Bug Fixer', endpoint: 'POST /api/v1/bugfix',
    placeholder: 'Describe what you expected to happen (optional)',
    hint: 'Put the buggy code in the editor, add the error message below, then send.' },
  { id: 'docstrings', icon: '📝', label: 'Docstrings', endpoint: 'POST /api/v1/generate/docstrings',
    placeholder: 'Press Send to document the code in the editor',
    hint: 'Put your code in the editor, pick a docstring style, then send.' },
  { id: 'tests', icon: '🧪', label: 'Test Generator', endpoint: 'POST /api/v1/generate/tests',
    placeholder: 'Press Send to generate tests for the code in the editor',
    hint: 'Put your code in the editor, pick a framework, then send.' },
];

export const OS_SHELLS = {
  linux: ['bash', 'zsh'],
  macos: ['zsh', 'bash'],
  windows: ['powershell', 'cmd'],
};

const LABELS = { cpp: 'C++', csharp: 'C#', javascript: 'JavaScript', typescript: 'TypeScript', sql: 'SQL', powershell: 'PowerShell', macos: 'macOS' };
export const labelFor = (v) => LABELS[v] || (v ? v.charAt(0).toUpperCase() + v.slice(1) : '');
