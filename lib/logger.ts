import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "logs", "app.log");

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

export function log(message: string, level: "INFO" | "WARN" | "ERROR" = "INFO", context?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${context ? ` | Context: ${JSON.stringify(context)}` : ""}\n`;

  // Write to console
  if (level === "ERROR") {
    console.error(logEntry);
  } else {
    console.log(logEntry);
  }

  // Append to log file
  fs.appendFileSync(LOG_FILE, logEntry);
}

export function readLogs() {
  if (!fs.existsSync(LOG_FILE)) return "No logs available.";
  // Return last 1000 lines or 5MB of logs
  const content = fs.readFileSync(LOG_FILE, "utf-8");
  return content;
}

export function clearLogs() {
  fs.writeFileSync(LOG_FILE, "");
}
