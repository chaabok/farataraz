#!/usr/bin/env node
/**
 * Parsa ERP license generator (Task 5-b, Phase 2).
 *
 * Plain CommonJS — no TS toolchain required. Runs from anywhere, but is
 * designed to be invoked from the `backend/` directory:
 *
 *   # one-time keypair creation (writes keys/license_private_key.pem [600] +
 *   # keys/license_public_key.pem only if absent)
 *   node scripts/generate-license.cjs --keygen
 *
 *   # issue a site license (machineId = null -> valid on any machine)
 *   node scripts/generate-license.cjs --licensee "Acme" --expiry 2035-12-31 \
 *        --features all --machine-id "" --out ../license.key
 *
 * Private key resolution order:
 *   1. LICENSE_PRIVATE_KEY env var (base64 PEM, or raw PEM)
 *   2. backend/keys/license_private_key.pem
 *
 * Output: the license string (base64 of JSON { alg:'Ed25519', data, signature })
 * is written to --out (if given) and printed to stdout together with the
 * matching PUBLIC key (so the operator can pin it via LICENSE_PUBLIC_KEY).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'license_private_key.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'license_public_key.pem');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function generateKeyPairPem() {
  const { generateKeyPairSync } = require('crypto');
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

function resolvePrivateKeyPem() {
  const envKey = process.env.LICENSE_PRIVATE_KEY;
  if (envKey && envKey.trim()) {
    const raw = envKey.trim();
    return raw.includes('PRIVATE KEY') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  }
  if (fs.existsSync(PRIVATE_KEY_PATH)) {
    return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  }
  console.error(
    'ERROR: no private key found.\n' +
      'Set LICENSE_PRIVATE_KEY (base64 or raw PEM) or create one with:\n' +
      '  node scripts/generate-license.cjs --keygen'
  );
  process.exit(1);
}

function loadPublicKeyPem() {
  if (fs.existsSync(PUBLIC_KEY_PATH)) return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
  // Derive the public half from the loaded private key when the file is absent.
  const pub = crypto.createPublicKey(resolvePrivateKeyPem());
  return pub.export({ type: 'spki', format: 'pem' }).toString();
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

function main() {
  const args = parseArgs(process.argv);

  // ---- keygen mode -----------------------------------------------------------
  if (args.keygen) {
    if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR, { recursive: true });
    if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
      console.log('Keypair already exists at backend/keys/ — nothing to do.');
    } else {
      const { privateKeyPem, publicKeyPem } = generateKeyPairPem();
      if (!fs.existsSync(PRIVATE_KEY_PATH)) {
        fs.writeFileSync(PRIVATE_KEY_PATH, privateKeyPem, { mode: 0o600 });
      }
      if (!fs.existsSync(PUBLIC_KEY_PATH)) {
        fs.writeFileSync(PUBLIC_KEY_PATH, publicKeyPem, { mode: 0o644 });
      }
      console.log('Ed25519 license keypair created:');
      console.log('  ' + PRIVATE_KEY_PATH + '  (chmod 600 — keep OFF the deployment box)');
      console.log('  ' + PUBLIC_KEY_PATH);
    }
    const pub = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8').trim();
    console.log('\nPublic key (PEM):\n' + pub);
    console.log('\nPublic key (base64, for LICENSE_PUBLIC_KEY env):');
    console.log(Buffer.from(pub, 'utf8').toString('base64'));
    return;
  }

  // ---- license generation ----------------------------------------------------
  const licensee = args.licensee || 'Unnamed Licensee';
  const product = args.product || 'Parsa ERP';
  const version = args.version || undefined;
  const licenseType = args['license-type'] || 'FULL';

  let expiryDate = null;
  if (args.expiry && String(args.expiry).trim() && String(args.expiry) !== 'never') {
    const d = new Date(String(args.expiry).trim() + 'T23:59:59Z');
    if (isNaN(d.getTime())) {
      console.error('ERROR: --expiry must be YYYY-MM-DD (or omit for perpetual).');
      process.exit(1);
    }
    expiryDate = d.toISOString();
  }

  const featuresArg = args.features !== undefined ? String(args.features).trim() : 'all';
  const features = featuresArg
    ? featuresArg.split(',').map((f) => f.trim()).filter(Boolean)
    : ['all'];

  // Empty / omitted --machine-id  ->  null  ->  SITE LICENSE (any machine).
  const machineIdRaw = args['machine-id'];
  const machineId =
    machineIdRaw === undefined || machineIdRaw === null || String(machineIdRaw).trim() === ''
      ? null
      : String(machineIdRaw).trim();

  const data = {
    licensee,
    product,
    ...(version ? { version } : {}),
    issuedAt: new Date().toISOString(),
    expiryDate,
    features,
    machineId,
    licenseType,
  };

  const privateKeyPem = resolvePrivateKeyPem();
  const licenseString = signLicense(data, privateKeyPem);
  const publicKeyPem = loadPublicKeyPem().trim();

  if (args.out) {
    const outPath = path.resolve(process.cwd(), String(args.out));
    fs.writeFileSync(outPath, licenseString, 'utf8');
    console.log('License written to: ' + outPath);
  }

  console.log('\n--- LICENSE STRING (paste into the activation window) ---');
  console.log(licenseString);
  console.log('\n--- LICENSE DATA ---');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n--- PUBLIC KEY (PEM) ---');
  console.log(publicKeyPem);
  console.log('\n--- PUBLIC KEY (base64 for LICENSE_PUBLIC_KEY env) ---');
  console.log(Buffer.from(publicKeyPem, 'utf8').toString('base64'));
}

main();
