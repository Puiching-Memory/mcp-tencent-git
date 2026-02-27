/**
 * Comment management tool for Tencent Git (aggregated)
 * Includes: MR notes, Review notes, Issue notes
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../../api-client.js";
import { asText, withPagination } from "../shared/response.js";

function requireFields(action: string, payload: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length > 0) {
    throw new Error(`action=${action} 缺少必填参数: ${missing.join(", ")}`);
  }
}

export function registerCommentTools(server: McpServer) {
  server.registerTool(
    "manage_comments",
    {
      title: "评论管理（聚合）",
      description: "统一管理 MR/评审/Issue 评论。target_type: merge_request/review/issue; action: list/get/create/update",
      inputSchema: {
        target_type: z.enum(["merge_request", "review", "issue"]).describe("评论所属对象类型"),
        action: z.enum(["list", "get", "create", "update"]).describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 manage_projects(action=search) 搜索。"),
        target_id: z.number().describe("对象ID：MR ID / Review ID / Issue ID"),
        note_id: z.number().optional().describe("评论ID（get/update）"),
        body: z.string().optional().describe("评论内容（create/update）"),
        path: z.string().optional().describe("文件路径（行级评论时需要）"),
        line: z.string().optional().describe("行号（行级评论时需要）"),
        line_type: z.enum(["old", "new"]).optional().describe("变更类型（行级评论）"),
        reviewer_state: z.enum(["approved", "change_required", "change_denied"]).optional().describe("单文件评审状态（MR/review）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ target_type, action, project_id, target_id, note_id, body, path, line, line_type, reviewer_state, page, per_page }) => {
      const id = encodeProjectId(project_id);

      const basePath =
        target_type === "merge_request"
          ? `/projects/${id}/merge_requests/${target_id}/notes`
          : target_type === "review"
            ? `/projects/${id}/reviews/${target_id}/notes`
            : `/projects/${id}/issues/${target_id}/notes`;

      switch (action) {
        case "list": {
          const data = await apiRequest({
            path: basePath,
            params: withPagination({}, page, per_page),
          });
          return asText(data);
        }
        case "get": {
          requireFields(action, { note_id }, ["note_id"]);
          const data = await apiRequest({
            path: `${basePath}/${note_id}`,
          });
          return asText(data);
        }
        case "create": {
          requireFields(action, { body }, ["body"]);
          const payload: Record<string, unknown> = { body };
          if (target_type !== "issue") {
            payload.path = path;
            payload.line = line;
            payload.line_type = line_type;
            payload.reviewer_state = reviewer_state;
          }
          const data = await apiRequest({
            method: "POST",
            path: basePath,
            body: payload,
          });
          return asText(data);
        }
        case "update": {
          requireFields(action, { note_id, body }, ["note_id", "body"]);
          const payload: Record<string, unknown> = { body };
          if (target_type !== "issue") {
            payload.reviewer_state = reviewer_state;
          }
          const data = await apiRequest({
            method: "PUT",
            path: `${basePath}/${note_id}`,
            body: payload,
          });
          return asText(data);
        }
      }
    }
  );
}
