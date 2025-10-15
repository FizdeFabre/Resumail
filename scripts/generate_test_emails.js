// scripts/generate_test_emails.js
import fs from "fs/promises";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const senders = [
  "alice@example.com",
  "bob@acme.co",
  "caroline@startup.io",
  "support@vendor.net",
  "luc@élan.fr",
  "用户@公司.cn",
];

const positives = [
  "Super produit, merci !",
  "Très satisfait de votre service.",
  "Livraison rapide, bravo.",
];
const negatives = [
  "Produit cassé à l'arrivée.",
  "Service client injoignable.",
  "Mauvaise expérience, déçu.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEmail(i) {
  const kind = Math.random();
  let body = "";
  if (kind < 0.2) body = pick(positives);
  else if (kind < 0.4) body = pick(negatives);
  else if (kind < 0.6) body = "Bonjour, voici un retour neutre sur votre produit.";
  else if (kind < 0.8) body = "<html><p>Mail en HTML <strong>avec bug</strong></p></html>";
  else body = Array.from({ length: 50 }, () => "texte long").join(" ");

  return {
    id: uuid(),
    from: pick(senders),
    subject: ["Problème livraison", "Merci", "Réclamation", "Question", ""][Math.floor(Math.random() * 5)],
    body,
    snippet: body.slice(0, 120),
  };
}

async function main() {
  const N = 120; // nb d’emails de test
  const emails = Array.from({ length: N }, (_, i) => makeEmail(i));
  const payload = { messages: emails };

  await fs.mkdir("./tmp", { recursive: true });
  await fs.writeFile("./tmp/test_emails.json", JSON.stringify(payload, null, 2), "utf8");
  console.log(`✅ ${N} emails générés -> ./tmp/test_emails.json`);
}

main();