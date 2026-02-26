/**
 * Merge Request management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerMergeRequestTools(server: McpServer) {
  // List merge requests
  server.registerTool(
    "list_merge_requests",
    {
      title: "列出合并请求",
      description: "获取项目的合并请求列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        state: z.enum(["merged", "opened", "closed", "all"]).optional().describe("合并请求状态筛选"),
        order_by: z.enum(["created_at", "updated_at"]).optional().describe("排序字段"),
        sort: z.enum(["asc", "desc"]).optional().describe("排序方式"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, state, order_by, sort, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_requests`,
        params: { state, order_by, sort, page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a merge request
  server.registerTool(
    "get_merge_request",
    {
      title: "获取合并请求",
      description: "获取项目某个合并请求的详细信息",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_request/${merge_request_id}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create merge request
  server.registerTool(
    "create_merge_request",
    {
      title: "创建合并请求",
      description: "在项目中创建新的合并请求",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        source_branch: z.string().describe("源分支"),
        target_branch: z.string().describe("目标分支"),
        title: z.string().describe("合并请求标题"),
        description: z.string().optional().describe("合并请求描述"),
        assignee_id: z.number().optional().describe("分配人ID"),
        reviewer_ids: z.string().optional().describe("评审人ID（多个用逗号分隔）"),
        necessary_reviewer_ids: z.string().optional().describe("必要评审人ID（多个用逗号分隔）"),
        labels: z.string().optional().describe("标签（多个用逗号分隔）"),
        target_project_id: z.number().optional().describe("目标项目ID"),
        approver_rule: z.number().optional().describe("评审人规则（-1:所有通过, 1:单人通过, 2+:多人通过）"),
        necessary_approver_rule: z.number().optional().describe("必要评审人规则"),
      },
    },
    async ({ project_id, source_branch, target_branch, title, description, assignee_id, reviewer_ids, necessary_reviewer_ids, labels, target_project_id, approver_rule, necessary_approver_rule }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/merge_requests`,
        body: {
          source_branch,
          target_branch,
          title,
          description,
          assignee_id,
          reviewers: reviewer_ids,
          necessary_reviewers: necessary_reviewer_ids,
          labels,
          target_project_id,
          approver_rule,
          necessary_approver_rule,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Update merge request
  server.registerTool(
    "update_merge_request",
    {
      title: "更新合并请求",
      description: "更新项目中的合并请求",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        title: z.string().optional().describe("标题"),
        description: z.string().optional().describe("描述"),
        target_branch: z.string().optional().describe("目标分支"),
        assignee_id: z.number().optional().describe("分配人ID"),
        state_event: z.enum(["close", "reopen"]).optional().describe("状态操作"),
        labels: z.string().optional().describe("标签（多个用逗号分隔）"),
      },
    },
    async ({ project_id, merge_request_id, title, description, target_branch, assignee_id, state_event, labels }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/merge_request/${merge_request_id}`,
        body: { title, description, target_branch, assignee_id, state_event, labels },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Merge a merge request
  server.registerTool(
    "merge_merge_request",
    {
      title: "合并MR",
      description: "执行合并操作",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        merge_commit_message: z.string().optional().describe("合并提交消息"),
      },
    },
    async ({ project_id, merge_request_id, merge_commit_message }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/merge_request/${merge_request_id}/merge`,
        body: { merge_commit_message },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get merge request changes
  server.registerTool(
    "get_merge_request_changes",
    {
      title: "获取MR变更",
      description: "获取合并请求包含的文件变更详情",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_request/${merge_request_id}/changes`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get merge request commits
  server.registerTool(
    "get_merge_request_commits",
    {
      title: "获取MR提交",
      description: "获取合并请求包含的提交列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
      },
    },
    async ({ project_id, merge_request_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_requests/${merge_request_id}/commits`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
