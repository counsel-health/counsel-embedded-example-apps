"use strict";

/**
 * Flags logger.error(...) / logger.warn(...) calls whose first argument is an object
 * containing a property with key "error" and value that is a variable (Identifier).
 * Error instances serialize as {} when logged under a generic key; use key "err" so Pino serializes them.
 */
const LOG_METHODS = ["error", "warn"];

function isLoggerCallee(callee) {
  if (callee.type !== "MemberExpression") return false;
  const prop = callee.property;
  if (prop.type !== "Identifier") return false;
  if (!LOG_METHODS.includes(prop.name)) return false;
  const obj = callee.object;
  return obj.type === "Identifier";
}

function hasErrorPropertyWithIdentifier(objNode) {
  if (objNode.type !== "ObjectExpression") return false;
  for (const prop of objNode.properties) {
    if (prop.type !== "Property") continue;
    const key = prop.key?.type === "Identifier" ? prop.key.name : null;
    if (key !== "error") continue;
    const value = prop.value;
    if (value.type === "Identifier") return true;
    if (prop.shorthand) return true;
  }
  return false;
}

const rule = {
  meta: {
    name: "logger-err-key",
    docs: {
      description:
        "Use key 'err' when logging Error instances so Pino serializes message and stack; 'error' serializes as {}.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (!isLoggerCallee(callee)) return;
        const firstArg = node.arguments[0];
        if (!firstArg) return;
        if (!hasErrorPropertyWithIdentifier(firstArg)) return;
        context.report({
          node: firstArg,
          message:
            "Use key 'err' for Error instances when logging so Pino serializes them; 'error' serializes as {}.",
        });
      },
    };
  },
};

const plugin = {
  meta: { name: "logger-err" },
  rules: {
    "use-err-for-error-instances": rule,
  },
};

module.exports = plugin;
