"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKeyPair = generateKeyPair;
exports.pemToBase64 = pemToBase64;
exports.base64ToPem = base64ToPem;
exports.currentMachineId = currentMachineId;
exports.signLicense = signLicense;
exports.verifyLicense = verifyLicense;
const crypto = __importStar(require("crypto"));
const node_machine_id_1 = require("node-machine-id");
function generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
    return {
        privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
        publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    };
}
function pemToBase64(pem) {
    return Buffer.from(pem, 'utf8').toString('base64');
}
function base64ToPem(b64) {
    return Buffer.from(b64, 'base64').toString('utf8');
}
function currentMachineId() {
    try {
        return (0, node_machine_id_1.machineIdSync)();
    }
    catch {
        return 'UNKNOWN_MACHINE_ID';
    }
}
function signLicense(data, privateKeyPem) {
    const canonical = JSON.stringify(data);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    const signature = crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey);
    const envelope = {
        alg: 'Ed25519',
        data,
        signature: signature.toString('base64'),
    };
    return Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64');
}
function verifyLicense(licenseString, publicKeyPem) {
    let envelope;
    try {
        const trimmed = (licenseString || '').trim();
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
        envelope = JSON.parse(decoded);
    }
    catch {
        return { valid: false, reason: 'malformed' };
    }
    if (!envelope || envelope.alg !== 'Ed25519' || !envelope.data || !envelope.signature) {
        return { valid: false, reason: 'legacy-or-forged' };
    }
    let signatureOk = false;
    try {
        const canonical = JSON.stringify(envelope.data);
        const publicKey = crypto.createPublicKey(publicKeyPem);
        const sig = Buffer.from(envelope.signature, 'base64');
        signatureOk = crypto.verify(null, Buffer.from(canonical, 'utf8'), publicKey, sig);
    }
    catch {
        signatureOk = false;
    }
    if (!signatureOk) {
        return { valid: false, reason: 'bad-signature' };
    }
    const data = envelope.data;
    if (data.expiryDate !== null && data.expiryDate !== undefined) {
        const expiry = new Date(data.expiryDate);
        if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
            return { valid: false, reason: 'expired', data };
        }
    }
    if (data.machineId !== null && data.machineId !== undefined && data.machineId !== '') {
        if (data.machineId !== currentMachineId()) {
            return { valid: false, reason: 'machine-mismatch', data };
        }
    }
    return { valid: true, data };
}
//# sourceMappingURL=license-crypto.js.map