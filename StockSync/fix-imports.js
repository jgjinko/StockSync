import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = path.join(__dirname, 'src');

function getRelativePath(fromFile, aliasPath) {
  const aliasTarget = aliasPath.replace('@/', '');
  const srcPath = path.join(srcDir, aliasTarget);
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, srcPath);
  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/from ["'](@\/[^"']+)["']/g, (_match, aliasPath) => {
    return `from "${getRelativePath(filePath, aliasPath)}"`;
  });

  content = content.replace(/^import ["'](@\/[^"']+)["'];?$/gm, (_match, aliasPath) => {
    return `import "${getRelativePath(filePath, aliasPath)}";`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', path.relative(srcDir, filePath));
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Done!');
