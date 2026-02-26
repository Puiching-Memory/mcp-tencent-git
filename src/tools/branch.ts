/**
 * Branch management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerBranchTools(server: McpServer) {
  // List branches
  server.registerTool(
    "list_branches",
    {
      title: "列出分支",
      description: "获取项目的分支列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ project_id, page, per_page }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/branches`,
        params: { page, per_page },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get branch detail
  server.registerTool(
    "get_branch",
    {
      title: "获取分支详情",
      description: "获取项目某个分支的详细信息",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        branch: z.string().describe("分支名"),
      },
    },
    async ({ project_id, branch }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/branches/${encodeURIComponent(branch)}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create branch
  server.registerTool(
    "create_branch",
    {
      title: "创建分支",
      description: "在项目中创建新分支",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        branch_name: z.string().describe("新分支名"),
        ref: z.string().describe("从哪个 commit SHA 或已有分支创建"),
      },
    },
    async ({ project_id, branch_name, ref }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/repository/branches`,
        body: { branch_name, ref },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Delete branch
  server.registerTool(
    "delete_branch",
    {
      title: "删除分支",
      description: "删除项目中的分支",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        branch: z.string().describe("分支名"),
      },
    },
    async ({ project_id, branch }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "DELETE",
        path: `/projects/${id}/repository/branches/${encodeURIComponent(branch)}`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Protect branch
  server.registerTool(
    "protect_branch",
    {
      title: "保护分支",
      description: "将分支设置为保护分支",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        branch: z.string().describe("分支名"),
        developers_can_push: z.boolean().optional().describe("Developer是否能推送"),
        developers_can_merge: z.boolean().optional().describe("Developer是否能合并"),
        push_access_level: z.number().optional().describe("推送权限级别（0/30/40）"),
        merge_access_level: z.number().optional().describe("合并权限级别（0/30/40）"),
      },
    },
    async ({ project_id, branch, developers_can_push, developers_can_merge, push_access_level, merge_access_level }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/repository/branches/${encodeURIComponent(branch)}/protect`,
        body: {
          developers_can_push,
          developers_can_merge,
          push_access_level,
          merge_access_level,
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Unprotect branch
  server.registerTool(
    "unprotect_branch",
    {
      title: "取消保护分支",
      description: "取消分支的保护状态",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        branch: z.string().describe("分支名"),
      },
    },
    async ({ project_id, branch }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/repository/branches/${encodeURIComponent(branch)}/unprotect`,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
