/**
 * ELISEE SCOUT — Claude Code PreToolUse Hook (pre-tool-check.js)
 * Script Node.js nativo Windows per bloccare accessi e modifiche a file riservati.
 * Regola Claude Code: Exit code 2 per bloccare (deny), Exit code 0 per consentire.
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
    const toolName = event.tool_name || event.tool || '';
    const toolInput = event.tool_input || event.input || {};

    // 1. Blacklist pattern di percorsi sensibili
    // Cattura inizio stringa, spazi, virgolette, slash e backslash
    const deniedPatterns = [
      /(^|[\s\\\/\"'\`])\.env(\..+)?($|[\s\\\/\"'\`])/i,
      /(^|[\s\\\/\"'\`])\.env/i,
      /(^|[\s\\\/\"'\`])data[\\\/]auth([\\\/].*|$)/i,
      /(^|[\s\\\/\"'\`])ssl[\\\/].*/i,
      /(^|[\s\\\/\"'\`])\.ssh([\\\/].*|$)/i,
      /id_rsa/i,
      /key\.pem/i,
      /\.pfx$/i,
      /\.p12$/i,
      /(^|[\s\\\/\"'\`])eliseo2704[\\\/]\.claude[\\\/]settings\.json/i
    ];

    // Estrai qualsiasi parametro che possa rappresentare un file o percorso
    const targetFile = toolInput.file_path || 
                       toolInput.path || 
                       toolInput.TargetFile || 
                       toolInput.AbsolutePath || 
                       toolInput.file || 
                       toolInput.filename || 
                       toolInput.target || 
                       '';

    const command = toolInput.command || toolInput.CommandLine || '';

    // Verifica percorsi target per Read, Write, Edit, Delete
    if (targetFile) {
      const normalizedPath = path.normalize(targetFile);
      for (const pattern of deniedPatterns) {
        if (pattern.test(normalizedPath) || pattern.test(targetFile)) {
          console.error(`\n[BLOCCO SICUREZZA DETERMINISTICO] Accesso negato al percorso riservato: ${targetFile}`);
          process.exit(2); // Exit code 2 = Deny / Block per Claude Code
        }
      }

      // Blocco percorsi esterni al workspace con controllo rigoroso anti-traversal
      const cwd = process.cwd();
      const resolved = path.resolve(cwd, normalizedPath);
      const cwdNorm = cwd.toLowerCase();
      const resolvedNorm = resolved.toLowerCase();
      const isInside = resolvedNorm === cwdNorm || resolvedNorm.startsWith(cwdNorm + path.sep);
      if (!isInside) {
        console.error(`\n[BLOCCO SICUREZZA DETERMINISTICO] Vietato accedere a percorsi esterni alla cartella del progetto: ${resolved}`);
        process.exit(2);
      }
    }

    // Verifica comandi Bash/Shell (intercetta tentativi di lettura/scrittura via shell)
    if (command) {
      for (const pattern of deniedPatterns) {
        if (pattern.test(command)) {
          console.error(`\n[BLOCCO SICUREZZA DETERMINISTICO] Il comando contiene riferimenti a file/cartelle riservate: ${command}`);
          process.exit(2);
        }
      }
    }

    // Azione consentita
    process.exit(0);
  } catch (err) {
    // In caso di errore nel parsing dell'evento, fail-closed su parole chiave sensibili
    const sensitiveHint = /\.env|data[\\\/]auth|ssl[\\\/]|\.ssh|id_rsa|key\.pem/i;
    if (inputData && sensitiveHint.test(inputData)) {
      process.exit(2);
    }
    process.exit(0);
  }
});
