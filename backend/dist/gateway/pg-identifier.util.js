"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPgIdentifier = isValidPgIdentifier;
exports.frontendRoot = frontendRoot;
exports.frontendPublicDir = frontendPublicDir;
function isValidPgIdentifier(name) {
    return typeof name === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}
function frontendRoot() {
    return process.env.FRONTEND_ROOT || process.cwd();
}
function frontendPublicDir() {
    return process.env.FRONTEND_PUBLIC_DIR || frontendRoot();
}
//# sourceMappingURL=pg-identifier.util.js.map