/**
 * MR Review management tool for Tencent Git (aggregated)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../../api-client.js";
import { asText } from "../shared/response.js";

function requireFields(action: string, payload: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
  if (missing.length > 0) {
    throw new Error(`action=${action} 缺少必填参数: ${missing.join(", ")}`);
  }
}

export function registerMrReviewTools(server: McpServer) {
  server.registerTool(
    "manage_mr_reviews",
    {
      title: "MR评审管理（聚合）",
      description: "MR Review 聚合工具。action: get(摘要)/get_detail(明细)/invite_reviewer/remove_reviewer/cancel/submit/reopen",
      inputSchema: {
        action: z.enum(["get", "get_detail", "invite_reviewer", "remove_reviewer", "cancel", "submit", "reopen"]).describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 manage_projects(action=search) 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        reviewer_id: z.number().optional().describe("评审人ID"),
        necessary_reviewer_id: z.number().optional().describe("必要评审人ID"),
        reviewer_event: z.enum(["comment", "approve", "require_change", "deny"]).optional().describe("评审事件（submit）"),
        summary: z.string().optional().describe("评审信息摘要（submit）"),
      },
    },
    async ({ action, project_id, merge_request_id, reviewer_id, necessary_reviewer_id, reviewer_event, summary }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "get": {
          const review = await apiRequest<Record<string, unknown>>({
            path: `/projects/${id}/merge_request/${merge_request_id}/review`,
          });
          const changedFilesResponse = await apiRequest<unknown>({
            path: `/projects/${id}/merge_requests/${merge_request_id}/changed_files`,
          }).catch(() => []);

          const changedFiles = Array.isArray(changedFilesResponse) ? changedFilesResponse : [];
          const changedFileSummaries = changedFiles
            .map((item) => {
              if (!item || typeof item !== "object") {
                return null;
              }

              const file = item as Record<string, unknown>;
              return {
                old_path: file.old_path,
                new_path: file.new_path,
                renamed_file: file.renamed_file,
                new_file: file.new_file,
                deleted_file: file.deleted_file,
              };
            })
            .filter(Boolean);

          const reviewSummaryKeys = ["id", "iid", "project_id", "state", "title", "description", "author", "source_branch", "target_branch", "created_at", "updated_at", "web_url"];
          const reviewSummary = reviewSummaryKeys.reduce<Record<string, unknown>>((acc, key) => {
            if (review[key] !== undefined) {
              acc[key] = review[key];
            }
            return acc;
          }, {});

          return asText({
            review: reviewSummary,
            changed_files_count: changedFileSummaries.length,
            changed_files: changedFileSummaries,
            note: "默认返回摘要。如需完整评审详情，请使用 action=get_detail。",
          });
        }
        case "get_detail": {
          const data = await apiRequest({
            path: `/projects/${id}/merge_request/${merge_request_id}/review`,
          });
          return asText(data);
        }
        case "invite_reviewer": {
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/merge_request/${merge_request_id}/review/invite`,
            body: { reviewer_id, necessary_reviewer_id },
          });
          return asText(data);
        }
        case "remove_reviewer": {
          requireFields(action, { reviewer_id }, ["reviewer_id"]);
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/merge_request/${merge_request_id}/review/dismissals`,
            params: { reviewer_id },
          });
          return asText(data);
        }
        case "cancel": {
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/merge_request/${merge_request_id}/review/cancel`,
          });
          return asText(data);
        }
        case "submit": {
          requireFields(action, { reviewer_event, summary }, ["reviewer_event", "summary"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}/reviewer/summary`,
            body: { reviewer_event, summary },
          });
          return asText(data);
        }
        case "reopen": {
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}/review/reopen`,
          });
          return asText(data);
        }
      }
    }
  );
}

