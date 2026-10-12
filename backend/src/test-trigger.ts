import db from "./db/database";

const log = db.prepare(`
  SELECT id FROM audit_logs LIMIT 1
`).get() as { id: string } | undefined;

if (!log) {
  console.log("No audit logs found");
  process.exit(0);
}

console.log("Testing audit log:", log.id);

// Test UPDATE
try {
  db.prepare(`
    UPDATE audit_logs
    SET actor = ?
    WHERE id = ?
  `).run("hacker", log.id);

  console.log("UPDATE unexpectedly succeeded");
} catch (error) {
  console.log("UPDATE blocked successfully");
}

// Test DELETE
try {
  db.prepare(`
    DELETE FROM audit_logs
    WHERE id = ?
  `).run(log.id);

  console.log("DELETE unexpectedly succeeded");
} catch (error) {
  console.log("DELETE blocked successfully");
}