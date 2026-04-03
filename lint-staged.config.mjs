import path from "node:path";

/**
 * lint-staged v15 passes absolute paths to function tasks (see generateTasks:
 * path.resolve(cwd, file)). Normalize to cwd-relative POSIX paths before
 * stripping the package directory prefix.
 *
 * @param {string[]} files
 * @param {string} prefix repo-relative directory prefix (no trailing slash)
 */
function stripPrefix(files, prefix) {
  const p = `${prefix}/`;
  const cwd = process.cwd();
  return files.map((f) => {
    const abs = path.isAbsolute(f) ? f : path.resolve(cwd, f);
    const rel = path.relative(cwd, abs).split(path.sep).join("/");
    return rel.startsWith(p) ? rel.slice(p.length) : rel;
  });
}

/** @param {string} arg */
function shellQuote(arg) {
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

/** @param {string[]} files @param {string} prefix */
function quotedRelativePaths(files, prefix) {
  return stripPrefix(files, prefix).map(shellQuote).join(" ");
}

export default {
  "web/nextjs/**/*.{ts,tsx}": (files) => {
    if (files.length === 0) return [];
    const q = quotedRelativePaths(files, "web/nextjs");
    return [
      `cd web/nextjs && bunx oxfmt --write ${q}`,
      `cd web/nextjs && bunx oxlint ${q}`,
    ];
  },
  "server/nodejs/**/*.ts": (files) => {
    if (files.length === 0) return [];
    const q = quotedRelativePaths(files, "server/nodejs");
    return [
      `cd server/nodejs && bunx oxfmt --write ${q}`,
      `cd server/nodejs && bunx oxlint ${q}`,
    ];
  },
  "automation-testing/**/*.{ts,tsx}": (files) => {
    if (files.length === 0) return [];
    const q = quotedRelativePaths(files, "automation-testing");
    return [
      `cd automation-testing && bunx oxfmt --write ${q}`,
      `cd automation-testing && bunx oxlint ${q}`,
    ];
  },
};
