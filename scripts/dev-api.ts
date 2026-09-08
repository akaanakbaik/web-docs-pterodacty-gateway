import app from "../api/ai.js";
app.listen(3001, "127.0.0.1", () => process.stdout.write("Local API: http://127.0.0.1:3001\n"));
