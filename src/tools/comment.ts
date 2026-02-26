/**
 * Comment management tools for Tencent Git
 * Includes: MR notes, Review notes, Issue notes
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerCommentTools(server: McpServer) {
  // ==================== Merge Request Notes ====================

  // List MR notes
  server.registerTool(
    "list_mr_notes",
    {
      title: "列出MR评论",
      description: "获取合并请求的评论列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, merge_request_id, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_requests/${merge_request_id}/notes`,
        params: { page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a single MR note
  server.registerTool(
    "get_mr_note",
    {
      title: "获取MR评论",
      description: "获取合并请求的某个评论详情",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        note_id: z.number().describe("评论ID"),
      },
    },
    async ({ project_id, merge_request_id, note_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/merge_requests/${merge_request_id}/notes/${note_id}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create MR note
  server.registerTool(
    "create_mr_note",
    {
      title: "创建MR评论",
      description: "在合并请求中添加评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        body: z.string().describe("评论内容"),
        path: z.string().optional().describe("文件路径（行级评论时需要）"),
        line: z.string().optional().describe("行号（行级评论时需要）"),
        line_type: z.enum(["old", "new"]).optional().describe("变更类型"),
        reviewer_state: z.enum(["approved", "change_required", "change_denied"]).optional().describe("单文件评审状态"),
      },
    },
    async ({ project_id, merge_request_id, body, path, line, line_type, reviewer_state }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/merge_requests/${merge_request_id}/notes`,
        body: { body, path, line, line_type, reviewer_state },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Edit MR note
  server.registerTool(
    "edit_mr_note",
    {
      title: "编辑MR评论",
      description: "编辑合并请求中的评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        merge_request_id: z.number().describe("合并请求ID"),
        note_id: z.number().describe("评论ID"),
        body: z.string().describe("评论内容"),
        reviewer_state: z.enum(["approved", "change_required", "change_denied"]).optional().describe("单文件评审状态"),
      },
    },
    async ({ project_id, merge_request_id, note_id, body, reviewer_state }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/merge_requests/${merge_request_id}/notes/${note_id}`,
        body: { body, reviewer_state },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ==================== Code Review Notes ====================

  // List review notes
  server.registerTool(
    "list_review_notes",
    {
      title: "列出评审评论",
      description: "获取代码评审的评论列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, review_id, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/reviews/${review_id}/notes`,
        params: { page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a single review note
  server.registerTool(
    "get_review_note",
    {
      title: "获取评审评论",
      description: "获取代码评审的某个评论详情",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        note_id: z.number().describe("评论ID"),
      },
    },
    async ({ project_id, review_id, note_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/reviews/${review_id}/notes/${note_id}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create review note
  server.registerTool(
    "create_review_note",
    {
      title: "创建评审评论",
      description: "在代码评审中添加评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        body: z.string().describe("评论内容"),
        path: z.string().optional().describe("文件路径（行级评论时需要）"),
        line: z.string().optional().describe("行号（行级评论时需要）"),
        line_type: z.enum(["old", "new"]).optional().describe("变更类型"),
        reviewer_state: z.enum(["approved", "change_required", "change_denied"]).optional().describe("单文件评审状态"),
      },
    },
    async ({ project_id, review_id, body, path, line, line_type, reviewer_state }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/reviews/${review_id}/notes`,
        body: { body, path, line, line_type, reviewer_state },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Edit review note
  server.registerTool(
    "edit_review_note",
    {
      title: "编辑评审评论",
      description: "编辑代码评审中的评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        review_id: z.number().describe("代码评审ID"),
        note_id: z.number().describe("评论ID"),
        body: z.string().describe("评论内容"),
        reviewer_state: z.enum(["approved", "change_required", "change_denied"]).optional().describe("单文件评审状态"),
      },
    },
    async ({ project_id, review_id, note_id, body, reviewer_state }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/reviews/${review_id}/notes/${note_id}`,
        body: { body, reviewer_state },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ==================== Issue Notes ====================

  // List issue notes
  server.registerTool(
    "list_issue_notes",
    {
      title: "列出缺陷评论",
      description: "获取缺陷（Issue）的评论列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        issue_id: z.number().describe("缺陷ID"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, issue_id, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/issues/${issue_id}/notes`,
        params: { page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a single issue note
  server.registerTool(
    "get_issue_note",
    {
      title: "获取缺陷评论",
      description: "获取缺陷的某个评论详情",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        issue_id: z.number().describe("缺陷ID"),
        note_id: z.number().describe("评论ID"),
      },
    },
    async ({ project_id, issue_id, note_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/issues/${issue_id}/notes/${note_id}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create issue note
  server.registerTool(
    "create_issue_note",
    {
      title: "创建缺陷评论",
      description: "在缺陷（Issue）中添加评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        issue_id: z.number().describe("缺陷ID"),
        body: z.string().describe("评论内容"),
      },
    },
    async ({ project_id, issue_id, body }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/issues/${issue_id}/notes`,
        body: { body },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Edit issue note
  server.registerTool(
    "edit_issue_note",
    {
      title: "编辑缺陷评论",
      description: "编辑缺陷（Issue）的评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        issue_id: z.number().describe("缺陷ID"),
        note_id: z.number().describe("评论ID"),
        body: z.string().describe("评论内容"),
      },
    },
    async ({ project_id, issue_id, note_id, body }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/issues/${issue_id}/notes/${note_id}`,
        body: { body },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
