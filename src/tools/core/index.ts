/**
 * Compact core tools for Tencent Git
 *
 * Reduces tool count by aggregating high-frequency domains into action-based tools.
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

export function registerCoreTools(server: McpServer) {
  server.registerTool(
    "manage_projects",
    {
      title: "项目管理（聚合）",
      description: "项目相关聚合工具。action: search/get",
      inputSchema: {
        action: z.enum(["search", "get"]).describe("操作类型"),
        project_id: z.string().optional().describe("项目ID（数字）或完整路径（命名空间/项目名）"),
        search: z.string().optional().describe("搜索关键词（用于 search）"),
        page: z.number().optional().describe("分页页码（默认1）"),
        per_page: z.number().optional().describe("每页数量（默认20，最大100）"),
      },
    },
    async ({ action, project_id, search, page, per_page }) => {
      switch (action) {
        case "search": {
          requireFields(action, { search }, ["search"]);
          const data = await apiRequest<Array<Record<string, unknown>>>({
            path: "/projects",
            params: withPagination({ search }, page, per_page),
          });
          const simplified = data.map((p) => ({
            id: p.id,
            name: p.name,
            path_with_namespace: p.path_with_namespace,
            description: p.description,
            default_branch: p.default_branch,
            web_url: p.web_url,
            http_url_to_repo: p.http_url_to_repo,
          }));
          return asText(simplified);
        }
        case "get": {
          requireFields(action, { project_id }, ["project_id"]);
          const id = encodeProjectId(project_id!);
          const data = await apiRequest({ path: `/projects/${id}` });
          return asText(data);
        }
      }
    }
  );

  server.registerTool(
    "manage_branches",
    {
      title: "分支管理（聚合）",
      description: "分支相关聚合工具。action: list/get/create/delete/protect/unprotect/get_protect/lifecycle/list_protected_members/add_protected_member/update_protected_member/remove_protected_member",
      inputSchema: {
        action: z
          .enum([
            "list",
            "get",
            "create",
            "delete",
            "protect",
            "unprotect",
            "get_protect",
            "lifecycle",
            "list_protected_members",
            "add_protected_member",
            "update_protected_member",
            "remove_protected_member",
          ])
          .describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（命名空间/项目名）"),
        branch: z.string().optional().describe("分支名（get/delete/protect/unprotect/get_protect/lifecycle/*_protected_member）"),
        branch_name: z.string().optional().describe("新分支名（create）"),
        ref: z.string().optional().describe("来源 commit SHA/分支（create）"),
        page: z.number().optional().describe("分页页码（list）"),
        per_page: z.number().optional().describe("每页数量（list）"),
        developers_can_push: z.boolean().optional().describe("Developer是否能推送（protect）"),
        developers_can_merge: z.boolean().optional().describe("Developer是否能合并（protect）"),
        push_access_level: z.number().optional().describe("推送权限级别（protect）"),
        merge_access_level: z.number().optional().describe("合并权限级别（protect）"),
        user_id: z.number().optional().describe("用户ID（*_protected_member）"),
        access_level: z.number().optional().describe("分支成员访问级别（add/update_protected_member）"),
        tag_name: z.string().optional().describe("Tag名（lifecycle，branch为空时生效）"),
      },
    },
    async ({ action, project_id, branch, branch_name, ref, page, per_page, developers_can_push, developers_can_merge, push_access_level, merge_access_level, user_id, access_level, tag_name }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "list": {
          const data = await apiRequest({
            path: `/projects/${id}/repository/branches`,
            params: withPagination({}, page, per_page),
          });
          return asText(data);
        }
        case "get": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/branches/${encodeURIComponent(branch!)}`,
          });
          return asText(data);
        }
        case "create": {
          requireFields(action, { branch_name, ref }, ["branch_name", "ref"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/repository/branches`,
            body: { branch_name, ref },
          });
          return asText(data);
        }
        case "delete": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/repository/branches/${encodeURIComponent(branch!)}`,
          });
          return asText(data);
        }
        case "protect": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/repository/branches/${encodeURIComponent(branch!)}/protect`,
            body: {
              developers_can_push,
              developers_can_merge,
              push_access_level,
              merge_access_level,
            },
          });
          return asText(data);
        }
        case "unprotect": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/repository/branches/${encodeURIComponent(branch!)}/unprotect`,
          });
          return asText(data);
        }
        case "get_protect": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/branches/${encodeURIComponent(branch!)}/protect`,
          });
          return asText(data);
        }
        case "lifecycle": {
          const data = await apiRequest({
            path: `/projects/${id}/tloc/branch/lifecycle`,
            params: { branch_name: branch, tag_name },
          });
          return asText(data);
        }
        case "list_protected_members": {
          requireFields(action, { branch }, ["branch"]);
          const data = await apiRequest({
            path: `/projects/${id}/branches/protected/${encodeURIComponent(branch!)}/members`,
          });
          return asText(data);
        }
        case "add_protected_member": {
          requireFields(action, { branch, user_id, access_level }, ["branch", "user_id", "access_level"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/branches/protected/${encodeURIComponent(branch!)}/members`,
            body: { user_id, access_level },
          });
          return asText(data);
        }
        case "update_protected_member": {
          requireFields(action, { branch, user_id, access_level }, ["branch", "user_id", "access_level"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/branches/protected/${encodeURIComponent(branch!)}/members/${user_id}`,
            body: { access_level },
          });
          return asText(data);
        }
        case "remove_protected_member": {
          requireFields(action, { branch, user_id }, ["branch", "user_id"]);
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/branches/protected/${encodeURIComponent(branch!)}/members/${user_id}`,
          });
          return asText(data);
        }
      }
    }
  );

  server.registerTool(
    "manage_repository",
    {
      title: "仓库管理（聚合）",
      description: "仓库相关聚合工具。action: list_tree/get_file/create_file/update_file/delete_file/compare/archive/get_blob_raw/compare_changed_files",
      inputSchema: {
        action: z
          .enum(["list_tree", "get_file", "create_file", "update_file", "delete_file", "compare", "archive", "get_blob_raw", "compare_changed_files"])
          .describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（命名空间/项目名）"),
        ref_name: z.string().optional().describe("commit hash、分支名或tag（list_tree）"),
        path: z.string().optional().describe("目录路径（list_tree）"),
        file_path: z.string().optional().describe("文件路径（get/create/update/delete）"),
        ref: z.string().optional().describe("分支名或tag（get_file）"),
        sha: z.string().optional().describe("提交 hash/分支/tag（archive/get_blob_raw）"),
        filepath: z.string().optional().describe("文件路径（get_blob_raw）"),
        branch_name: z.string().optional().describe("分支名（create/update/delete）"),
        content: z.string().optional().describe("文件内容（create/update）"),
        commit_message: z.string().optional().describe("提交信息（create/update/delete）"),
        encoding: z.enum(["text", "base64"]).optional().describe("内容编码方式（create/update）"),
        from: z.string().optional().describe("源提交/分支/tag（compare）"),
        to: z.string().optional().describe("目标提交/分支/tag（compare）"),
        straight: z.boolean().optional().describe("是否两点比较（compare_changed_files）"),
      },
    },
    async ({ action, project_id, ref_name, path, file_path, ref, sha, filepath, branch_name, content, commit_message, encoding, from, to, straight }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "list_tree": {
          const data = await apiRequest({
            path: `/projects/${id}/repository/tree`,
            params: { ref_name, path },
          });
          return asText(data);
        }
        case "get_file": {
          requireFields(action, { file_path, ref }, ["file_path", "ref"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/files`,
            params: { file_path, ref },
          });
          return asText(data);
        }
        case "create_file": {
          requireFields(action, { file_path, branch_name, content, commit_message }, ["file_path", "branch_name", "content", "commit_message"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/repository/files`,
            body: { file_path, branch_name, content, commit_message, encoding },
          });
          return asText(data);
        }
        case "update_file": {
          requireFields(action, { file_path, branch_name, content, commit_message }, ["file_path", "branch_name", "content", "commit_message"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/repository/files`,
            body: { file_path, branch_name, content, commit_message, encoding },
          });
          return asText(data);
        }
        case "delete_file": {
          requireFields(action, { file_path, branch_name, commit_message }, ["file_path", "branch_name", "commit_message"]);
          const data = await apiRequest({
            method: "DELETE",
            path: `/projects/${id}/repository/files`,
            params: { file_path, branch_name, commit_message },
          });
          return asText(data);
        }
        case "compare": {
          requireFields(action, { from, to }, ["from", "to"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/compare`,
            params: { from, to },
          });
          return asText(data);
        }
        case "archive": {
          const data = await apiRequest({
            path: `/projects/${id}/repository/archive`,
            params: { sha },
          });
          return asText(data);
        }
        case "get_blob_raw": {
          requireFields(action, { sha }, ["sha"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/blobs/${encodeURIComponent(sha!)}`,
            params: { filepath },
          });
          return asText(data);
        }
        case "compare_changed_files": {
          requireFields(action, { from, to }, ["from", "to"]);
          const data = await apiRequest({
            path: `/projects/${id}/repository/compare/changed_files`,
            params: { from, to, straight },
          });
          return asText(data);
        }
      }
    }
  );

  server.registerTool(
    "manage_merge_requests",
    {
      title: "MR管理（聚合）",
      description: "合并请求聚合工具。action: list/get/summary/file_diff/create/update/merge/changes/commits/changed_files/subscribe_status/subscribe/unsubscribe/list_comments/create_comment",
      inputSchema: {
        action: z
          .enum([
            "list",
            "get",
            "summary",
            "file_diff",
            "create",
            "update",
            "merge",
            "changes",
            "commits",
            "changed_files",
            "subscribe_status",
            "subscribe",
            "unsubscribe",
            "list_comments",
            "create_comment",
          ])
          .describe("操作类型"),
        project_id: z.string().describe("项目ID（数字）或完整路径（命名空间/项目名）"),
        merge_request_id: z.number().optional().describe("合并请求ID（除list/create外大部分操作都需要）"),
        state: z.enum(["merged", "opened", "closed", "all"]).optional().describe("MR状态筛选（list）"),
        order_by: z.enum(["created_at", "updated_at"]).optional().describe("排序字段（list）"),
        sort: z.enum(["asc", "desc"]).optional().describe("排序方式（list）"),
        page: z.number().optional().describe("分页页码（list）"),
        per_page: z.number().optional().describe("每页数量（list）"),
        created_after: z.string().optional().describe("创建时间下限（list_comments）"),
        created_before: z.string().optional().describe("创建时间上限（list_comments）"),
        source_branch: z.string().optional().describe("源分支（create）"),
        target_branch: z.string().optional().describe("目标分支（create/update）"),
        title: z.string().optional().describe("标题（create/update）"),
        description: z.string().optional().describe("描述（create/update）"),
        assignee_id: z.number().optional().describe("分配人ID（create/update）"),
        reviewer_ids: z.string().optional().describe("评审人ID（逗号分隔，create）"),
        necessary_reviewer_ids: z.string().optional().describe("必要评审人ID（逗号分隔，create）"),
        labels: z.string().optional().describe("标签（逗号分隔，create/update）"),
        target_project_id: z.number().optional().describe("目标项目ID（create）"),
        approver_rule: z.number().optional().describe("评审人规则（create）"),
        necessary_approver_rule: z.number().optional().describe("必要评审人规则（create）"),
        state_event: z.enum(["close", "reopen"]).optional().describe("状态操作（update）"),
        merge_commit_message: z.string().optional().describe("合并提交消息（merge）"),
        note: z.string().optional().describe("评论内容（create_comment）"),
        file_path: z.string().optional().describe("目标文件路径（file_diff）"),
      },
    },
    async ({ action, project_id, merge_request_id, state, order_by, sort, page, per_page, created_after, created_before, source_branch, target_branch, title, description, assignee_id, reviewer_ids, necessary_reviewer_ids, labels, target_project_id, approver_rule, necessary_approver_rule, state_event, merge_commit_message, note, file_path }) => {
      const id = encodeProjectId(project_id);
      switch (action) {
        case "list": {
          const data = await apiRequest({
            path: `/projects/${id}/merge_requests`,
            params: withPagination({ state, order_by, sort }, page, per_page),
          });
          return asText(data);
        }
        case "get": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_request/${merge_request_id}`,
          });
          return asText(data);
        }
        case "summary": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const [mrData, changedFilesResponse] = await Promise.all([
            apiRequest<Record<string, unknown>>({
              path: `/projects/${id}/merge_request/${merge_request_id}`,
            }),
            apiRequest<unknown>({
              path: `/projects/${id}/merge_requests/${merge_request_id}/changed_files`,
            }).catch(() => []),
          ]);

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
                new_file: file.new_file,
                deleted_file: file.deleted_file,
                renamed_file: file.renamed_file,
              };
            })
            .filter(Boolean);

          const summaryKeys = ["id", "iid", "project_id", "title", "description", "state", "author", "source_branch", "target_branch", "created_at", "updated_at", "web_url"];
          const mrSummary = summaryKeys.reduce<Record<string, unknown>>((acc, key) => {
            if (mrData[key] !== undefined) {
              acc[key] = mrData[key];
            }
            return acc;
          }, {});

          return asText({
            merge_request: mrSummary,
            changed_files_count: changedFileSummaries.length,
            changed_files: changedFileSummaries,
            note: "这是摘要模式。如需单文件diff请使用 action=file_diff 并提供 file_path。",
          });
        }
        case "file_diff": {
          requireFields(action, { merge_request_id, file_path }, ["merge_request_id", "file_path"]);
          const changesResponse = await apiRequest<unknown>({
            path: `/projects/${id}/merge_request/${merge_request_id}/changes`,
          });

          const changes = Array.isArray(changesResponse)
            ? changesResponse
            : changesResponse && typeof changesResponse === "object" && Array.isArray((changesResponse as Record<string, unknown>).changes)
              ? ((changesResponse as Record<string, unknown>).changes as unknown[])
              : [];

          const targetChange = changes.find((item) => {
            if (!item || typeof item !== "object") {
              return false;
            }
            const change = item as Record<string, unknown>;
            return change.old_path === file_path || change.new_path === file_path;
          });

          if (!targetChange) {
            throw new Error(`action=${action} 未找到目标文件变更: ${file_path}`);
          }

          return asText(targetChange);
        }
        case "create": {
          requireFields(action, { source_branch, target_branch, title }, ["source_branch", "target_branch", "title"]);
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
          return asText(data);
        }
        case "update": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}`,
            body: { title, description, target_branch, assignee_id, state_event, labels },
          });
          return asText(data);
        }
        case "merge": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}/merge`,
            body: { merge_commit_message },
          });
          return asText(data);
        }
        case "changes": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_request/${merge_request_id}/changes`,
          });
          return asText(data);
        }
        case "commits": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_requests/${merge_request_id}/commits`,
          });
          return asText(data);
        }
        case "changed_files": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_requests/${merge_request_id}/changed_files`,
          });
          return asText(data);
        }
        case "subscribe_status": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_request/${merge_request_id}/subscribe`,
          });
          return asText(data);
        }
        case "subscribe": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}/subscribe`,
          });
          return asText(data);
        }
        case "unsubscribe": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            method: "PUT",
            path: `/projects/${id}/merge_request/${merge_request_id}/unsubscribe`,
          });
          return asText(data);
        }
        case "list_comments": {
          requireFields(action, { merge_request_id }, ["merge_request_id"]);
          const data = await apiRequest({
            path: `/projects/${id}/merge_request/${merge_request_id}/comments`,
            params: withPagination({ created_after, created_before }, page, per_page),
          });
          return asText(data);
        }
        case "create_comment": {
          requireFields(action, { merge_request_id, note }, ["merge_request_id", "note"]);
          const data = await apiRequest({
            method: "POST",
            path: `/projects/${id}/merge_request/${merge_request_id}/comments`,
            body: { note },
          });
          return asText(data);
        }
      }
    }
  );
}
