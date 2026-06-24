import fs from 'fs';
import path from 'path';

const dir = 'd:/jeevalink/src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  { regex: /bg-\[#141929\]/g, replacement: 'bg-white' },
  { regex: /bg-\[#0F1629\]/g, replacement: 'bg-white' },
  { regex: /bg-\[#0B0F1A\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[#1a2035\]/g, replacement: 'bg-white' },
  { regex: /border-white\/\[0\.06\]/g, replacement: 'border-slate-100' },
  { regex: /border-white\/10/g, replacement: 'border-slate-100' },
  { regex: /border-white\/\[0\.04\]/g, replacement: 'border-slate-100' },
  { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-white\/\[0\.04\]/g, replacement: 'bg-slate-100' },
  { regex: /hover:bg-white\/\[0\.04\]/g, replacement: 'hover:bg-slate-100' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-slate-50' },
  { regex: /bg-white\/5/g, replacement: 'bg-slate-50' },
  { regex: /text-white text-xl/g, replacement: 'text-slate-900 text-xl' },
  { regex: /text-white font-bold/g, replacement: 'text-slate-900 font-bold' },
  { regex: /text-white text-sm/g, replacement: 'text-slate-900 text-sm' },
  { regex: /text-white text-xs/g, replacement: 'text-slate-900 text-xs' },
  { regex: /text-slate-400/g, replacement: 'text-slate-500' },
  { regex: /text-slate-300/g, replacement: 'text-slate-900' },
  { regex: /text-slate-200/g, replacement: 'text-slate-900' },
  { regex: /shadow-2xl/g, replacement: 'shadow-md' },
  { regex: /bg-slate-500\/10/g, replacement: 'bg-slate-100' },
  { regex: /bg-slate-800/g, replacement: 'bg-slate-100' },
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
}
