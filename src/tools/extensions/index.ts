import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCommitTools } from "./commit.js";
import { registerCodeReviewTools } from "./code-review.js";
import { registerMrReviewTools } from "./mr-review.js";
import { registerCommentTools } from "./comment.js";

export function registerExtensionTools(server: McpServer) {
  registerCommitTools(server);
  registerCodeReviewTools(server);
  registerMrReviewTools(server);
  registerCommentTools(server);
}
