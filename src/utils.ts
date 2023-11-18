const clear = require("clear") as typeof import("clear");

function clearAndRenderBanner(): void {
  clear();
}

function logInCyan(msg: string): void {
  console.log(`\x1b[36m${msg}\x1b[0m`);
}

function logInYellow(msg: string): void {
  console.log(`\x1b[33m${msg}\x1b[0m`);
}

export {};
exports.clearAndRenderBanner = clearAndRenderBanner;
exports.logInCyan = logInCyan;
exports.logInYellow = logInYellow;
