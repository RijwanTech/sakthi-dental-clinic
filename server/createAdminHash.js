
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";

const terminal = createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  const password = await terminal.question(
    "Enter a strong admin password: "
  );

  if (password.length < 12) {
    throw new Error("Use a password with at least 12 characters.");
  }

  const hash = await bcrypt.hash(password, 12);
  console.log("\nCopy this hash into ADMIN_PASSWORD_HASH:\n");
  console.log(hash);
} catch (error) {
  console.error(error.message);
} finally {
  terminal.close();
}
