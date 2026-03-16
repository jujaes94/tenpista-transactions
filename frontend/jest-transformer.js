/**
 * Custom Jest transformer: TypeScript → hoisted jest.mock() → ready-to-run JS
 *
 * Needed because:
 * 1. The SWC native binary for linux/x64 is not available in this environment
 * 2. @babel/types hangs on load, making babel-jest unusable
 *
 * Solution: TypeScript compiles TS/TSX → CommonJS JS, then a simple AST-free
 * pass hoists jest.mock() / jest.unmock() calls to run before require() calls.
 */
'use strict';

const ts = require('typescript');
const crypto = require('crypto');

const tsOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2017,
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  strict: false,
  skipLibCheck: true,
  resolveJsonModule: true,
};

/**
 * Extracts all top-level jest.mock/jest.unmock/etc. calls from compiled JS
 * and moves them to before the first require() call.
 */
function hoistJestCalls(code) {
  // Patterns to hoist
  const HOIST_PATTERN = /^(jest\.(mock|unmock|enableAutomock|disableAutomock|resetModules|isolateModules)\s*\()/;

  const lines = code.split('\n');
  const hoisted = [];
  const rest = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();

    if (HOIST_PATTERN.test(trimmed)) {
      // Collect the complete statement (tracking parenthesis depth)
      let depth = 0;
      let stmt = '';
      let j = i;

      while (j < lines.length) {
        const l = lines[j];
        stmt += (j === i ? '' : '\n') + l;

        for (const ch of l) {
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
        }

        j++;
        if (depth <= 0) break;
      }

      // Add trailing semicolon if missing
      const trimmedStmt = stmt.trimEnd();
      hoisted.push(trimmedStmt.endsWith(';') ? trimmedStmt : trimmedStmt + ';');
      i = j;
    } else {
      rest.push(line);
      i++;
    }
  }

  if (hoisted.length === 0) return code;

  // Find insertion point: after "use strict"; and Object.defineProperty(__esModule)
  // but before any require() calls
  const insertBefore = rest.findIndex(
    l => /^\s*(const|var|let)\s+\w+\s*=\s*.*require\(/.test(l)
  );

  if (insertBefore === -1) {
    // No require calls found, just prepend
    return hoisted.join('\n') + '\n' + rest.join('\n');
  }

  return [
    ...rest.slice(0, insertBefore),
    ...hoisted,
    ...rest.slice(insertBefore),
  ].join('\n');
}

module.exports = {
  process(src, filename) {
    if (/\.(ts|tsx)$/.test(filename)) {
      const compiled = ts.transpileModule(src, {
        compilerOptions: tsOptions,
        fileName: filename,
      });
      return { code: hoistJestCalls(compiled.outputText) };
    }
    // Plain JS: hoist jest calls too (for .js test files, if any)
    return { code: hoistJestCalls(src) };
  },

  getCacheKey(src, filename) {
    return crypto.createHash('md5').update(src + filename).digest('hex');
  },
};
