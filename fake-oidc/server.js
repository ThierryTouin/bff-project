import express from "express";
import jwt from "jsonwebtoken";
import { generateKeyPairSync } from "crypto";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const ISSUER = "http://fake-oidc:8080";
const CLIENT_ID = "frontend";

function buildIdToken() {
  return jwt.sign(
    {
      sub: "5b873c42-cd4b-40a4-8201-b2f3c3a1901f",
      preferred_username: "uid001",
      given_name: "Prenom1",
      family_name: "Nom1",
      email: "prenom1.nom1@entreprise.com",
      iss: ISSUER,
      aud: CLIENT_ID,
      azp: CLIENT_ID,
      scope: "openid profile email",
    },
    privateKey,
    {
      algorithm: "RS256",
      expiresIn: "1h",
      keyid: "fake-key",
    }
  );
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
  const { redirect_uri, state } = req.query;
  res.redirect(`${redirect_uri}?code=fake-code&state=${state}`);
});

app.post("/token", (req, res) => {
  const idToken = buildIdToken();
  res.json({
    access_token: "fake-access-token",
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
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

app.listen(8080, () => {
  console.log("Fake OIDC running on 8080");
});
