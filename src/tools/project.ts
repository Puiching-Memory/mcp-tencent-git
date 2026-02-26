/**
 * Project management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerProjectTools(server: McpServer) {
  // Search projects
  server.registerTool(
    "search_projects",
    {
      title: "搜索项目",
      description:
        "按名称搜索项目。当只知道项目名称但不知道完整路径（命名空间/项目名）时，可以先用此工具搜索获取项目的完整路径或ID，再用于其他操作。",
      inputSchema: {
        search: z.string().describe("搜索关键词（项目名称）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ search, page, per_page }) => {
      const data = await apiRequest<Array<Record<string, unknown>>>({
        path: `/projects`,
        params: { search, page, per_page },
      });
      // Return a simplified list with essential info
      const simplified = data.map((p) => ({
        id: p.id,
        name: p.name,
        path_with_namespace: p.path_with_namespace,
        description: p.description,
        default_branch: p.default_branch,
        web_url: p.web_url,
        http_url_to_repo: p.http_url_to_repo,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(simplified, null, 2) }],
      };
    }
  );

  // Get project detail
  server.registerTool(
    "get_project",
    {
      title: "获取项目详情",
      description: "获取项目的详细信息",
      inputSchema: {
        project_id: z
          .string()
          .describe(
            "项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定时请先用 search_projects 搜索。"
          ),
      },
    },
    async ({ project_id }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}`,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );
}
