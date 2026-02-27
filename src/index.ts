/**
 * MCP Server for Tencent Git (腾讯工蜂) REST API
 *
 * Provides tools for:
 * - Branch management (create, delete, list, protect)
 * - Commit operations (aggregated)
 * - Repository operations (tree, files CRUD, compare)
 * - Merge requests (create, update, merge, review)
 * - Code reviews (Commit Review, aggregated)
 * - MR reviews (aggregated)
 * - Comments (aggregated)
 *
 * Environment variables:
 * - TENCENT_GIT_TOKEN: Private token for authentication (required)
 * - TENCENT_GIT_BASE_URL: Base URL (default: https://git.code.tencent.com)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCoreTools } from "./tools/core/index.js";
import { registerExtensionTools } from "./tools/extensions/index.js";

// Create server instance
const server = new McpServer({
  name: "mcp-tencent-git",
  version: "1.0.0",
  description: "MCP Server for Tencent Git (腾讯工蜂) REST API",
});

// Register all tool groups
registerCoreTools(server);
registerExtensionTools(server);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tencent Git MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
