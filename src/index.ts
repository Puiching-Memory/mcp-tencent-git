/**
 * MCP Server for Tencent Git (腾讯工蜂) REST API
 *
 * Provides tools for:
 * - Branch management (create, delete, list, protect)
 * - Commit operations (list, get, diff, comments)
 * - Repository operations (tree, files CRUD, compare)
 * - Merge requests (create, update, merge, review)
 * - Code reviews (Commit Review)
 * - MR reviews
 * - Comments (MR notes, review notes, issue notes)
 *
 * Environment variables:
 * - TENCENT_GIT_TOKEN: Private token for authentication (required)
 * - TENCENT_GIT_BASE_URL: Base URL (default: https://git.code.tencent.com)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerBranchTools } from "./tools/branch.js";
import { registerCommitTools } from "./tools/commit.js";
import { registerRepositoryTools } from "./tools/repository.js";
import { registerMergeRequestTools } from "./tools/merge-request.js";
import { registerCodeReviewTools } from "./tools/code-review.js";
import { registerMrReviewTools } from "./tools/mr-review.js";
import { registerCommentTools } from "./tools/comment.js";
import { registerProjectTools } from "./tools/project.js";

// Create server instance
const server = new McpServer({
  name: "mcp-tencent-git",
  version: "1.0.0",
  description: "MCP Server for Tencent Git (腾讯工蜂) REST API",
});

// Register all tool groups
registerProjectTools(server);
registerBranchTools(server);
registerCommitTools(server);
registerRepositoryTools(server);
registerMergeRequestTools(server);
registerCodeReviewTools(server);
registerMrReviewTools(server);
registerCommentTools(server);

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
