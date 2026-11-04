const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const excludedDirectories = new Set([
  '.git',
  '.github',
  '.wrangler',
  'node_modules',
  'dist',
]);
const maxAssetSize = 25 * 1024 * 1024;
const excludedAssets = [];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      const size = entry.size || fs.statSync(sourcePath).size;
      if (size > maxAssetSize) {
        excludedAssets.push(path.relative(root, sourcePath));
        continue;
      }
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

copyDirectory(root, output);
console.log(`Built Cloudflare Pages output in ${path.relative(root, output)}`);
if (excludedAssets.length) {
  console.log(`Excluded ${excludedAssets.length} assets over Cloudflare's 25 MiB limit:`);
  excludedAssets.forEach((file) => console.log(`- ${file}`));
}
