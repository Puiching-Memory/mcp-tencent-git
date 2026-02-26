/**
 * Code Review (Commit Review) management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerCodeReviewTools(server: McpServer) {
  // Create commit review
  server.registerTool(
    "create_code_review",
    {
      title: "创建代码评审",
      description: "在项目中新建一个Commit评审",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        title: z.string().describe("评审标题"),
        source_branch: z.string().optional().describe("源分支名"),
        target_branch: z.string().optional().describe("目标分支名"),
        source_commit: z.string().optional().describe("源提交点"),
        target_commit: z.string().optional().describe("目标提交点"),
        description: z.string().optional().describe("描述"),
        reviewer_ids: z.string().optional().describe("评审人ID（多个用逗号分隔）"),
        necessary_reviewer_ids: z.string().optional().describe("必要评审人ID（多个用逗号分隔）"),
        approver_rule: z.number().optional().describe("评审人规则（-1:所有通过, 1:单人通过, 2+:多人通过）"),
        necessary_approver_rule: z.number().optional().describe("必要评审人规则"),
      },
    },
    async ({ project_id, title, source_branch, target_branch, source_commit, target_commit, description, reviewer_ids, necessary_reviewer_ids, approver_rule, necessary_approver_rule }) => {
      const id = encodeProjectId(project_id);
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
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // List code reviews
  server.registerTool(
    "list_code_reviews",
    {
      title: "列出代码评审",
      description: "获取项目中所有的Commit评审",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        state: z.string().optional().describe("评审状态：approving, change_required, closed"),
        author_id: z.number().optional().describe("作者ID"),
        order_by: z.enum(["created_at", "updated_at"]).optional().describe("排序字段"),
        sort: z.enum(["asc", "desc"]).optional().describe("排序方式"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, state, author_id, order_by, sort, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/reviews`,
        params: { state, author_id, order_by, sort, page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a code review
  server.registerTool(
    "get_code_review",
    {
      title: "获取代码评审",
      description: "获取项目中某个具体的Commit评审详情",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
      },
    },
    async ({ project_id, review_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/review/${review_id}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Update code review
  server.registerTool(
    "update_code_review",
    {
      title: "更新代码评审",
      description: "更新项目中某个Commit评审的标题和描述",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        title: z.string().describe("评审标题"),
        description: z.string().optional().describe("评审描述"),
      },
    },
    async ({ project_id, review_id, title, description }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/review/${review_id}`,
        body: { title, description },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Invite reviewer to code review
  server.registerTool(
    "invite_code_reviewer",
    {
      title: "邀请评审人",
      description: "给Commit评审添加评审人（reviewer_id和necessary_reviewer_id至少填一个）",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        reviewer_id: z.string().optional().describe("评审人ID（多个用逗号分隔）"),
        necessary_reviewer_id: z.string().optional().describe("必要评审人ID（多个用逗号分隔）"),
      },
    },
    async ({ project_id, review_id, reviewer_id, necessary_reviewer_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/review/${review_id}/invite`,
        body: { reviewer_id, necessary_reviewer_id },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Remove reviewer from code review
  server.registerTool(
    "remove_code_reviewer",
    {
      title: "移除评审人",
      description: "从Commit评审中移除某位评审人",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        reviewer_id: z.number().describe("评审人ID"),
      },
    },
    async ({ project_id, review_id, reviewer_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "DELETE",
        path: `/projects/${id}/review/${review_id}/dismissals`,
        params: { reviewer_id },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Submit review opinion
  server.registerTool(
    "submit_code_review",
    {
      title: "发表评审意见",
      description: "在Commit评审中发表评审意见",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        reviewer_event: z.enum(["comment", "approve", "require_change", "deny"]).describe("评审事件"),
        summary: z.string().describe("评审信息摘要"),
      },
    },
    async ({ project_id, review_id, reviewer_event, summary }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/review/${review_id}/reviewer/summary`,
        body: { reviewer_event, summary },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Reopen code review
  server.registerTool(
    "reopen_code_review",
    {
      title: "重置评审状态",
      description: "重置Commit评审的状态",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
      },
    },
    async ({ project_id, review_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/review/${review_id}/reopen`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
