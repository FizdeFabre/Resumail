// scripts/send_test_emails_node.js
import fs from "fs/promises";
import axios from "axios";

async function main() {
  const raw = await fs.readFile("./tmp/test_emails_60.json", "utf8");
  const payload = JSON.parse(raw);

  console.log(`Envoi ${payload.emails.length} emails pour userId=${payload.userId}...`);
  try {
    const res = await axios.post("http://localhost:3000/analyzev2", payload, { headers: { "Content-Type": "application/json" }, timeout: 5*60*1000 });
    console.log("Réponse status:", res.status);
    console.dir(res.data, { depth: null });
  } catch (err) {
    console.error("Erreur POST:", err.response?.status, err.response?.data || err.message);
  }
}

main();