// Prints the environment variables for admin login.
//
// Usage (from the server folder):
//   node scripts/hash-admin-password.js
// You will be asked for the new admin password; it is not echoed or saved anywhere.
// Copy the printed lines into the server's .env file.

import bcrypt from "bcryptjs";
import crypto from "crypto";
import readline from "readline";

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await askHidden("New admin password: ");
if (!password || password.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}
const confirm = await askHidden("Repeat password: ");
if (confirm !== password) {
  console.error("Passwords do not match.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const secret = crypto.randomBytes(48).toString("hex");

console.log("\nAdd these lines to the server .env file:\n");
console.log("ADMIN_USERNAME=admin");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_JWT_SECRET=${secret}`);
console.log("\nChanging ADMIN_JWT_SECRET later logs out every admin.");
