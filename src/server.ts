import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ListToolsResult,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// =============================================================================
// MCP SERVER IMPLEMENTATION
// =============================================================================


class MCPServer {
  private server: Server;
  private verboseLogging: boolean = false;

  constructor() {
    this.server = new Server(
      {
        name: "terminal-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Handle list_tools requests
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      return {
        tools: [
          {
            name: "say_hello",
            description: "Says hello to a person",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the person to greet",
                },
              },
              required: ["name"],
            },
          } as Tool,
          {
            name: "get_time",
            description: "Gets the current time",
            inputSchema: {
              type: "object",
              properties: {},
            },
          } as Tool,
          {
            name: "execute_bash",
            description: "Executes a bash command and returns the output",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "The bash command to execute",
                },
              },
              required: ["command"],
            },
          } as Tool,
          {
            name: "set_logging_mode",
            description: "Control the verbosity of responses - choose between verbose logging or concise answers",
            inputSchema: {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: ["verbose", "quiet"],
                  description: "Logging mode: 'verbose' shows detailed process steps, 'quiet' returns only final answers",
                },
              },
              required: ["mode"],
            },
          } as Tool,
          {
            name: "get_logging_mode",
            description: "Get the current logging mode setting",
            inputSchema: {
              type: "object",
              properties: {},
            },
          } as Tool,
        ],
      };
    });

    // Handle call_tool requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "say_hello":
          const personName = args?.name || "World";
          return {
            content: [
              {
                type: "text",
                text: `Hello, ${personName}! This is a greeting from the MCP server.`,
              },
            ],
          };

        case "get_time":
          return {
            content: [
              {
                type: "text",
                text: `Current time: ${new Date().toISOString()}`,
              },
            ],
          };

        case "execute_bash":
          const command = args?.command as string;
          if (!command) {
            throw new Error("Command is required");
          }
          
          try {
            const { stdout, stderr } = await execAsync(command);
            return {
              content: [
                {
                  type: "text",
                  text: `Command: ${command}\nOutput:\n${stdout}${stderr ? `\nError:\n${stderr}` : ''}`,
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Command: ${command}\nError: ${error.message}`,
                },
              ],
            };
          }
        case "set_logging_mode":
          const mode = args?.mode as string;
          if (!mode || !["verbose", "quiet"].includes(mode)) {
            return {
              content: [
                {
                  type: "text",
                  text: "Error: Mode must be either 'verbose' or 'quiet'",
                },
              ],
            };
          }

          this.verboseLogging = mode === "verbose";
          return {
            content: [
              {
                type: "text",
                text: `Logging mode set to: ${mode}. ${mode === "verbose" ? "Will show detailed process steps." : "Will return only final answers."}`,
              },
            ],
          };

        case "get_logging_mode":
          return {
            content: [
              {
                type: "text",
                text: `Current logging mode: ${this.verboseLogging ? "verbose" : "quiet"}. ${this.verboseLogging ? "Showing detailed process steps." : "Returning only final answers."}`,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  // Method to get logging state for external access
  getVerboseLogging(): boolean {
    return this.verboseLogging;
  }

  // Conditional logging method
  private log(...args: any[]) {
    if (this.verboseLogging) {
      console.log(...args);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Terminal MCP Server running on stdio");
  }
}

export { MCPServer };
