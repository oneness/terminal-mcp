import { MCPServer } from "./server"
import { MCPClient } from "./client"
import { ChatCLI } from "./chat"

// For running as separate server process:
if (require.main === module) {
  if (process.argv[2] === "server") {
    const server = new MCPServer();
    server.start().catch(console.error);
  } else if (process.argv[2] === "chat") {
    const chatCLI = new ChatCLI();
    chatCLI.start().catch(console.error);
  } else {
    console.log("Usage:");
    console.log("  npm run chat # Run interactive chat in your teminal");
  }
}

