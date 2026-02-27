/**
 * Code Review (Commit Review) management tool for Tencent Git (aggregated)
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

export function registerCodeReviewTools(server: McpServer) {
  server.registerTool(
    "manage_code_reviews",
    {
      title: "代码评审管理（聚合）",
      description: "Commit Review 聚合工具。action: create/list/get/update/invite_reviewer/remove_reviewer/submit/reopen/changed_files",
      inputSchema: {
        action: z
          .enum(["create", "list", "get", "update", "invite_reviewer", "remove_reviewer", "submit", "reopen", "changed_files"])
          .describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 manage_projects(action=search) 搜索。"),
        review_id: z.number().optional().describe("代码评审ID（create/list 外大多数操作必填）"),
        title: z.string().optional().describe("评审标题（create/update）"),
        source_branch: z.string().optional().describe("源分支名"),
        target_branch: z.string().optional().describe("目标分支名"),
        source_commit: z.string().optional().describe("源提交点"),
        target_commit: z.string().optional().describe("目标提交点"),
        description: z.string().optional().describe("描述"),
        reviewer_ids: z.string().optional().describe("评审人ID（多个用逗号分隔）"),
        necessary_reviewer_ids: z.string().optional().describe("必要评审人ID（多个用逗号分隔）"),
        approver_rule: z.number().optional().describe("评审人规则（-1:所有通过, 1:单人通过, 2+:多人通过）"),
        necessary_approver_rule: z.number().optional().describe("必要评审人规则"),
        state: z.string().optional().describe("评审状态：approving, change_required, closed"),
        author_id: z.number().optional().describe("作者ID"),
        order_by: z.enum(["created_at", "updated_at"]).optional().describe("排序字段"),
        sort: z.enum(["asc", "desc"]).optional().describe("排序方式"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
        reviewer_id: z.string().optional().describe("评审人ID（多个用逗号分隔）"),
        necessary_reviewer_id: z.string().optional().describe("必要评审人ID（多个用逗号分隔）"),
        reviewer_event: z.enum(["comment", "approve", "require_change", "deny"]).optional().describe("评审事件（submit）"),
        summary: z.string().optional().describe("评审信息摘要（submit）"),
      },
    },
    async ({ action, project_id, review_id, title, source_branch, target_branch, source_commit, target_commit, description, reviewer_ids, necessary_reviewer_ids, approver_rule, necessary_approver_rule, state, author_id, order_by, sort, page, per_page, reviewer_id, necessary_reviewer_id, reviewer_event, summary }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "create": {
          requireFields(action, { title }, ["title"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/review`,
            body: {
              title,
              source_branch,
              target_branch,
              source_commit,
              target_commit,
              description,
              reviewer_ids,
              necessary_reviewer_ids,
              approver_rule,
              necessary_approver_rule,
            },
          });
          return asText(data);
        }
        case "list": {
          const data = await apiRequest({
            path: `/projects/${id}/reviews`,
            params: withPagination({ state, author_id, order_by, sort }, page, per_page),
          });
          return asText(data);
        }
        case "get": {
          requireFields(action, { review_id }, ["review_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/review/${review_id}`,
          });
          return asText(data);
        }
        case "update": {
          requireFields(action, { review_id, title }, ["review_id", "title"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/review/${review_id}`,
            body: { title, description },
          });
          return asText(data);
        }
        case "invite_reviewer": {
          requireFields(action, { review_id }, ["review_id"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/review/${review_id}/invite`,
            body: { reviewer_id, necessary_reviewer_id },
          });
          return asText(data);
        }
        case "remove_reviewer": {
          requireFields(action, { review_id, reviewer_id }, ["review_id", "reviewer_id"]);
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/review/${review_id}/dismissals`,
            params: { reviewer_id },
          });
          return asText(data);
        }
        case "submit": {
          requireFields(action, { review_id, reviewer_event, summary }, ["review_id", "reviewer_event", "summary"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/review/${review_id}/reviewer/summary`,
            body: { reviewer_event, summary },
          });
          return asText(data);
        }
        case "reopen": {
          requireFields(action, { review_id }, ["review_id"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/review/${review_id}/reopen`,
          });
          return asText(data);
        }
        case "changed_files": {
          requireFields(action, { review_id }, ["review_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/review/${review_id}/changed_files`,
          });
          return asText(data);
        }
      }
    }
  );
}

