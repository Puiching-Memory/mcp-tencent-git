/**
 * Repository management tools for Tencent Git
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, encodeProjectId } from "../api-client.js";

export function registerRepositoryTools(server: McpServer) {
  // List repository tree
  server.registerTool(
    "list_repository_tree",
    {
      title: "列出仓库目录",
      description: "获取项目版本库的文件和目录列表",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        ref_name: z.string().optional().describe("commit hash、分支名或tag（默认：默认分支）"),
        path: z.string().optional().describe("文件路径"),
      },
    },
    async ({ project_id, ref_name, path }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/tree`,
        params: { ref_name, path },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Get file content
  server.registerTool(
    "get_file_content",
    {
      title: "获取文件内容",
      description: "获取项目版本库中某个文件的内容和信息（content为Base64编码）",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        file_path: z.string().describe("文件路径（文件名）"),
        ref: z.string().describe("分支名或tag（默认：默认分支）"),
      },
    },
    async ({ project_id, file_path, ref }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/files`,
        params: { file_path, ref },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Create file
  server.registerTool(
    "create_file",
    {
      title: "新增文件",
      description: "在项目版本库中创建新文件",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        file_path: z.string().describe("文件路径（文件名）"),
        branch_name: z.string().describe("分支名"),
        content: z.string().describe("文件内容"),
        commit_message: z.string().describe("提交描述信息"),
        encoding: z.enum(["text", "base64"]).optional().describe("内容编码方式（默认text）"),
      },
    },
    async ({ project_id, file_path, branch_name, content, commit_message, encoding }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "POST",
        path: `/projects/${id}/repository/files`,
        body: { file_path, branch_name, content, commit_message, encoding },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Update file
  server.registerTool(
    "update_file",
    {
      title: "编辑文件",
      description: "更新项目版本库中的文件内容",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        file_path: z.string().describe("文件路径（文件名）"),
        branch_name: z.string().describe("分支名"),
        content: z.string().describe("文件内容"),
        commit_message: z.string().describe("提交注释"),
        encoding: z.enum(["text", "base64"]).optional().describe("内容编码方式（默认text）"),
      },
    },
    async ({ project_id, file_path, branch_name, content, commit_message, encoding }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "PUT",
        path: `/projects/${id}/repository/files`,
        body: { file_path, branch_name, content, commit_message, encoding },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Delete file
  server.registerTool(
    "delete_file",
    {
      title: "删除文件",
      description: "删除项目版本库中的文件",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        file_path: z.string().describe("文件路径（文件名）"),
        branch_name: z.string().describe("分支名"),
        commit_message: z.string().describe("描述信息"),
      },
    },
    async ({ project_id, file_path, branch_name, commit_message }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        method: "DELETE",
        path: `/projects/${id}/repository/files`,
        params: { file_path, branch_name, commit_message },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  // Compare
  server.registerTool(
    "compare",
    {
      title: "获取差异",
      description: "通过对比分支、提交或tags获取差异内容",
      inputSchema: {
        project_id: z.string().describe("项目ID（数字）或完整路径（格式: 命名空间/项目名，如 mygroup/myproject）。不确定完整路径时请先用 search_projects 搜索。"),
        from: z.string().describe("源：提交hash、分支或tag"),
        to: z.string().describe("目标：提交hash、分支或tag"),
      },
    },
    async ({ project_id, from, to }) => {
      const id = encodeProjectId(project_id);
      const data = await apiRequest({
        path: `/projects/${id}/repository/compare`,
        params: { from, to },
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
