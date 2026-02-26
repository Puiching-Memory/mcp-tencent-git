/**
 * Commit management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerCommitTools(server: McpServer) {
  // List commits
  server.registerTool(
    "list_commits",
    {
      title: "列出提交",
      description: "获取项目版本库的提交列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        ref_name: z.string().optional().describe("分支名或tag（默认：默认分支）"),
        path: z.string().optional().describe("文件路径"),
        since: z.string().optional().describe("此日期及之后的提交（格式: yyyy-MM-ddTHH:mm:ssZ）"),
        until: z.string().optional().describe("此日期及之前的提交（格式: yyyy-MM-ddTHH:mm:ssZ）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, ref_name, path, since, until, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/commits`,
        params: { ref_name, path, since, until, page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get a single commit
  server.registerTool(
    "get_commit",
    {
      title: "获取提交",
      description: "获取项目某个提交的详细信息",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        sha: z.string().describe("commit hash、分支名或tag"),
      },
    },
    async ({ project_id, sha }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/commits/${encodeURIComponent(sha)}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get commit diff
  server.registerTool(
    "get_commit_diff",
    {
      title: "获取提交差异",
      description: "获取项目某个提交的差异内容",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        sha: z.string().describe("commit hash、分支名或tag"),
        path: z.string().optional().describe("文件路径"),
        ignore_white_space: z.boolean().optional().describe("是否忽略空白符差异"),
      },
    },
    async ({ project_id, sha, path, ignore_white_space }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/commits/${encodeURIComponent(sha)}/diff`,
        params: { path, ignore_white_space },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get commit comments
  server.registerTool(
    "get_commit_comments",
    {
      title: "获取提交评论",
      description: "获取项目某个提交的所有评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        sha: z.string().describe("commit hash、分支名或tag"),
      },
    },
    async ({ project_id, sha }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/commits/${encodeURIComponent(sha)}/comments`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create commit comment
  server.registerTool(
    "create_commit_comment",
    {
      title: "提交评论",
      description: "对某个提交发表评论",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        sha: z.string().describe("commit hash、分支名或tag"),
        note: z.string().describe("评论内容"),
        path: z.string().optional().describe("文件路径（在特定行上评论时必需）"),
        line: z.number().optional().describe("行号（在特定行上评论时必需）"),
        line_type: z.enum(["old", "new"]).optional().describe("变更类型：old 或 new"),
      },
    },
    async ({ project_id, sha, note, path, line, line_type }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/repository/commits/${encodeURIComponent(sha)}/comments`,
        body: { note, path, line, line_type },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get commit refs
  server.registerTool(
    "get_commit_refs",
    {
      title: "获取提交引用",
      description: "获取某个提交对应的分支和tag",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        sha: z.string().describe("commit hash、分支名或tag"),
        type: z.enum(["branch", "tag", "all"]).optional().describe("类型筛选（默认all）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, sha, type, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/commits/${encodeURIComponent(sha)}/refs`,
        params: { type, page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
