/**
 * MR Review management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerMrReviewTools(server: McpServer) {
  // Get MR review info
  server.registerTool(
    "get_mr_review",
    {
      title: "获取MR评审信息",
      description: "查询合并请求的评审信息",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_request/${merge_request_id}/review`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Invite MR reviewer
  server.registerTool(
    "invite_mr_reviewer",
    {
      title: "邀请MR评审人",
      description: "邀请用户评审合并请求（reviewer_id和necessary_reviewer_id至少填一个）",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        reviewer_id: z.number().optional().describe("评审人ID"),
        necessary_reviewer_id: z.number().optional().describe("必要评审人ID"),
      },
    },
    async ({ project_id, merge_request_id, reviewer_id, necessary_reviewer_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/merge_request/${merge_request_id}/review/invite`,
        body: { reviewer_id, necessary_reviewer_id },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Remove MR reviewer
  server.registerTool(
    "remove_mr_reviewer",
    {
      title: "移除MR评审人",
      description: "从合并请求评审中移除某位评审人",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        reviewer_id: z.number().describe("评审人ID"),
      },
    },
    async ({ project_id, merge_request_id, reviewer_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "DELETE",
        path: `/projects/${id}/merge_request/${merge_request_id}/review/dismissals`,
        params: { reviewer_id },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Cancel MR review
  server.registerTool(
    "cancel_mr_review",
    {
      title: "取消MR评审",
      description: "取消合并请求的评审",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "DELETE",
        path: `/projects/${id}/merge_request/${merge_request_id}/review/cancel`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Submit MR review opinion
  server.registerTool(
    "submit_mr_review",
    {
      title: "发表MR评审意见",
      description: "对合并请求发表评审意见",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        reviewer_event: z.enum(["comment", "approve", "require_change", "deny"]).describe("评审事件"),
        summary: z.string().describe("评审信息摘要"),
      },
    },
    async ({ project_id, merge_request_id, reviewer_event, summary }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/merge_request/${merge_request_id}/reviewer/summary`,
        body: { reviewer_event, summary },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Reopen MR review
  server.registerTool(
    "reopen_mr_review",
    {
      title: "重置MR评审状态",
      description: "重置合并请求评审的状态（合并请求必须处于拒绝或要求修改状态）",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/merge_request/${merge_request_id}/review/reopen`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
