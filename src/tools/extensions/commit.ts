/**
 * Commit management tool for Tencent Git (aggregated)
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

export function registerCommitTools(server: McpServer) {
  server.registerTool(
    "manage_commits",
    {
      title: "提交管理（聚合）",
      description: "提交相关聚合工具。action: list/get/diff/list_comments/create_comment/refs",
      inputSchema: {
        action: z.enum(["list", "get", "diff", "list_comments", "create_comment", "refs"]).describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 manage_projects(action=search) 搜索。"),
        sha: z.string().optional().describe("commit hash、分支名或tag"),
        ref_name: z.string().optional().describe("分支名或tag（默认：默认分支）"),
        path: z.string().optional().describe("文件路径"),
        since: z.string().optional().describe("此日期及之后的提交（格式: yyyy-MM-ddTHH:mm:ssZ）"),
        until: z.string().optional().describe("此日期及之前的提交（格式: yyyy-MM-ddTHH:mm:ssZ）"),
        note: z.string().optional().describe("评论内容（create_comment）"),
        line: z.number().optional().describe("行号（create_comment）"),
        line_type: z.enum(["old", "new"]).optional().describe("变更类型（create_comment）"),
        type: z.enum(["branch", "tag", "all"]).optional().describe("引用类型筛选（refs，默认all）"),
        ignore_white_space: z.boolean().optional().describe("是否忽略空白符差异（diff）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ action, project_id, sha, ref_name, path, since, until, note, line, line_type, type, ignore_white_space, page, per_page }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "list": {
          const data = await apiRequest({
            path: `/projects/${id}/repository/commits`,
            params: withPagination({ ref_name, path, since, until }, page, per_page),
          });
          return asText(data);
        }
        case "get": {
          requireFields(action, { sha }, ["sha"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/commits/${encodeURIComponent(sha!)}`,
          });
          return asText(data);
        }
        case "diff": {
          requireFields(action, { sha }, ["sha"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/commits/${encodeURIComponent(sha!)}/diff`,
            params: { path, ignore_white_space },
          });
          return asText(data);
        }
        case "list_comments": {
          requireFields(action, { sha }, ["sha"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/commits/${encodeURIComponent(sha!)}/comments`,
            params: withPagination({}, page, per_page),
          });
          return asText(data);
        }
        case "create_comment": {
          requireFields(action, { sha, note }, ["sha", "note"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/repository/commits/${encodeURIComponent(sha!)}/comments`,
            body: { note, path, line, line_type },
          });
          return asText(data);
        }
        case "refs": {
          requireFields(action, { sha }, ["sha"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/commits/${encodeURIComponent(sha!)}/refs`,
            params: withPagination({ type }, page, per_page),
          });
          return asText(data);
        }
      }
    }
  );
}

