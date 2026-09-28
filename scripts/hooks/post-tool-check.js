/**
 * ELISEE SCOUT — Claude Code PostToolUse Hook (post-tool-check.js)
 * Script Node.js nativo Windows per rilevare violazioni di stile e design:
 * - Nuovi `!important` nei file CSS
 * - Nuovi stili inline `style="..."` nell'HTML
 * - Chiavi di autenticazione o token inseriti inavvertitamente
 */

const fs = require('fs');
const path = require('path');

let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!inputData.trim()) {
      process.exit(0);
    }

    const event = JSON.parse(inputData);
    const toolInput = event.tool_input || event.input || {};
    const targetFile = toolInput.file_path || toolInput.path || toolInput.TargetFile || '';

    if (!targetFile || !fs.existsSync(targetFile)) {
      process.exit(0);
    }

    const ext = path.extname(targetFile).toLowerCase();
    const content = fs.readFileSync(targetFile, 'utf8');

    // 1. Controllo !important nei file CSS modificati
    if (ext === '.css') {
      const lines = content.split('\n');
      const violations = [];
      lines.forEach((line, idx) => {
        // Ignora eventuali commenti
        if (line.includes('!important') && !line.trim().startsWith('/*') && !line.trim().startsWith('*')) {
          violations.push(`Riga ${idx + 1}: ${line.trim()}`);
        }
      });

      if (violations.length > 0) {
        console.warn(`\n[AVVISO DESIGN SYSTEM] Rilevato '!important' in ${path.basename(targetFile)}:`);
        violations.slice(0, 3).forEach(v => console.warn(`  - ${v}`));
        console.warn(`  Ricorda: la regola d'oro di Elisee Scout vieta l'uso di '!important'. Usa specificita' di classe.\n`);
      }
    }

    // 2. Controllo stili inline nei file HTML modificati
    if (ext === '.html') {
      const inlineStyleMatch = content.match(/style\s*=\s*["'][^"']+["']/gi);
      if (inlineStyleMatch && inlineStyleMatch.length > 0) {
        console.warn(`\n[AVVISO DESIGN SYSTEM] Rilevati stili inline in ${path.basename(targetFile)}.`);
        console.warn(`  Ricorda: la regola d'oro di Elisee Scout vieta gli stili inline. Sposta le regole nei file CSS del componente.\n`);
      }
    }

    // 3. Controllo token e credenziali
    const secretPatterns = [
      /re_[a-zA-Z0-9_]{20,}/g, // Resend API keys
      /sk_live_[a-zA-Z0-9]{20,}/g,
      /ghp_[a-zA-Z0-9]{20,}/g
    ];

    let hasSecretViolation = false;
    for (const pat of secretPatterns) {
      if (pat.test(content)) {
        hasSecretViolation = true;
        console.error(`\n[ALLERTA CRITICA SICUREZZA] Possibile token/chiave API hardcoded rilevata in ${path.basename(targetFile)}!`);
        console.error(`  Rimuovere immediatamente e utilizzare variabili d'ambiente protette.\n`);
      }
    }

    if (hasSecretViolation) {
      process.exit(2); // Blocca e segnala errore a Claude Code per auto-remediation
    }

    process.exit(0);
  } catch (err) {
    process.exit(0);
  }
});
