import Prism from './prismGlobal.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-rust.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-json.js';

const ALIAS = {
  py: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', zsh: 'bash',
  'c++': 'cpp', 'c#': 'csharp', cs: 'csharp', rs: 'rust', golang: 'go', powershell: 'bash', cmd: 'bash',
};

export const normalizeLang = (lang = '') => {
  const key = String(lang).toLowerCase();
  return ALIAS[key] || key;
};

export const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlight(code = '', lang) {
  const name = normalizeLang(lang);
  const grammar = Prism.languages[name];
  return grammar ? Prism.highlight(code, grammar, name) : escapeHtml(code);
}

export { Prism };
