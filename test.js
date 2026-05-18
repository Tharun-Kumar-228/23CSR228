const { Log } = require("./services/logger");

(async () => {
  const ok = await Log("backend", "info", "middleware", "logger test");
  console.log("Log sent:", ok);
})();