import express from "express";
import jwt from "jsonwebtoken";
import { generateKeyPairSync } from "crypto";

const PORT = 8080;
const ISSUER = `http://fake-oidc:${PORT}`;
const CLIENT_ID = "frontend";
const REDIRECT_URI_OVERRIDE = ""; // If set, replaces the base URL (protocol+host+port) in redirect_uri
const TOKEN_EXPIRATION = "1h"; // Token expiration (e.g. "1h", "30m", "7d")



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
};

// Log all incoming requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors.green}${req.method}${colors.reset} ${colors.cyan}${req.originalUrl}${colors.reset}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`  ${colors.yellow}Query params:${colors.reset} ${JSON.stringify(req.query)}`);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`  ${colors.magenta}Body:${colors.reset} ${JSON.stringify(req.body)}`);
  }
  console.log(`  ${colors.blue}Headers:${colors.reset} ${colors.dim}${JSON.stringify(req.headers)}${colors.reset}`);
  next();
});

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwk = {
  kty: "RSA",
  use: "sig",
  kid: "fake-key",
  alg: "RS256",
  n: publicKey.export({ format: "jwk" }).n,
  e: publicKey.export({ format: "jwk" }).e,
};


function parseExpirationToSeconds(exp) {
  const match = exp.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 3600;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 3600;
    case "d": return value * 86400;
  }
}

// Store nonce per authorization code
const codeStore = new Map();

function buildIdToken(nonce) {
  const claims = {
    sub: "5b873c42-cd4b-40a4-8201-b2f3c3a1901f",
    name: "Prenom1 Nom1",
    preferred_username: "uid001",
    given_name: "Prenom1",
    family_name: "Nom1",
    email: "prenom1.nom1@entreprise.com",
    token: "fake-id-token",
    iss: ISSUER,
    aud: CLIENT_ID,
    azp: CLIENT_ID,
    scope: "openid profile email",
  };
  if (nonce) {
    claims.nonce = nonce;
  }
  return jwt.sign(claims, privateKey, {
    algorithm: "RS256",
    expiresIn: TOKEN_EXPIRATION,
    keyid: "fake-key",
  });
}

app.get("/.well-known/openid-configuration", (req, res) => {
  res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/authorize`,
    token_endpoint: `${ISSUER}/token`,
    userinfo_endpoint: `${ISSUER}/userinfo`,
    jwks_uri: `${ISSUER}/jwks`,
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    response_types_supported: ["code"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
  });
});

app.get("/authorize", (req, res) => {
  const { redirect_uri, state, nonce } = req.query;
  let effectiveRedirectUri = redirect_uri;
  if (REDIRECT_URI_OVERRIDE) {
    const url = new URL(redirect_uri);
    effectiveRedirectUri = `${REDIRECT_URI_OVERRIDE}${url.pathname}`;
  }
  const code = "fake-code-" + Date.now();
  codeStore.set(code, { nonce });
  const redirectLocation = `${effectiveRedirectUri}?code=${code}&state=${state}`;
  if (REDIRECT_URI_OVERRIDE) {
    console.log(`  ${colors.yellow}Redirect override:${colors.reset} ${colors.dim}${redirect_uri}${colors.reset} ${colors.yellow}->${colors.reset} ${colors.cyan}${effectiveRedirectUri}${colors.reset}`);
  }
  console.log(`  ${colors.magenta}Redirecting to:${colors.reset} ${redirectLocation}`);
  res.redirect(redirectLocation);
});

app.post("/token", (req, res) => {
  const code = req.body.code;
  const stored = codeStore.get(code) || {};
  codeStore.delete(code);
  const idToken = buildIdToken(stored.nonce);
  res.json({
    access_token: "fake-access-token",
    id_token: idToken,
    token_type: "Bearer",
    expires_in: parseExpirationToSeconds(TOKEN_EXPIRATION),
  });
});

app.get("/userinfo", (req, res) => {
  res.json({
    sub: "5b873c42-cd4b-40a4-8201-b2f3c3a1901f",
    email: "prenom1.nom1@entreprise.com",
  });
});

app.get("/jwks", (req, res) => {
  res.json({ keys: [jwk] });
});

app.listen(PORT, () => {
  console.log(`\n${colors.green}========================================${colors.reset}`);
  console.log(`${colors.green}  Fake OIDC Server started${colors.reset}`);
  console.log(`${colors.green}========================================${colors.reset}`);
  console.log(`  ${colors.cyan}Port:${colors.reset}                ${PORT}`);
  console.log(`  ${colors.cyan}Issuer:${colors.reset}              ${ISSUER}`);
  console.log(`  ${colors.cyan}Client ID:${colors.reset}           ${CLIENT_ID}`);
  console.log(`  ${colors.cyan}Token expiration:${colors.reset}    ${TOKEN_EXPIRATION}`);
  console.log(`  ${colors.cyan}Redirect override:${colors.reset}   ${REDIRECT_URI_OVERRIDE || "(none)"}`);
  console.log(`${colors.green}========================================${colors.reset}\n`);
});
