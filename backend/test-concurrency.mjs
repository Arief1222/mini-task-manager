const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const body = await response.json();

  return {
    status: response.status,
    body,
  };
}

async function main() {
  // 1. Create a fresh task
  const created = await request("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `Concurrency Test ${Date.now()}`,
    }),
  });

  if (created.status !== 201) {
    throw new Error("Failed to create test task");
  }

  const taskId = created.body.id;

  console.log("Task created:", taskId);

  // 2. Prepare two identical status updates
  const updateRequest = () =>
    request(`/tasks/${taskId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "pending",
        actor: "admin",
      }),
    });

  // 3. Send both requests concurrently
  const [resultA, resultB] = await Promise.all([
    updateRequest(),
    updateRequest(),
  ]);

  console.log("Request A:", resultA);
  console.log("Request B:", resultB);

  // 4. Fetch audit logs
  const history = await request(
    `/tasks/${taskId}/audit-logs`
  );

  console.log("Audit logs:", history.body);

  // 5. Verify exactly one audit entry
  if (
    !Array.isArray(history.body) ||
    history.body.length !== 1
  ) {
    throw new Error(
      `Expected 1 audit log, got ${
        Array.isArray(history.body)
          ? history.body.length
          : "invalid response"
      }`
    );
  }

  const log = history.body[0];

  if (
    log.from_status !== "to_do" ||
    log.to_status !== "pending"
  ) {
    throw new Error("Unexpected audit log transition");
  }

  console.log("PASS: No duplicate audit logs");

  // 6. Clean up the test task
  await request(`/tasks/${taskId}`, {
    method: "DELETE",
  });

  console.log("Test task deleted");
}

main().catch((error) => {
  console.error("TEST FAILED:", error);
  process.exitCode = 1;
});