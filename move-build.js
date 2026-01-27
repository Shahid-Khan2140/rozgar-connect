const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'client', 'dist');
const dest = path.join(__dirname, 'public');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(src)) {
    console.log(`Cleaning destination: ${dest}`);
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    
    console.log(`Copying build artifacts from ${src} to ${dest}`);
    copyDir(src, dest);
    console.log("Build artifacts moved successfully.");
} else {
    console.error(`Source directory ${src} not found! Build might have failed.`);
    process.exit(1);
}
