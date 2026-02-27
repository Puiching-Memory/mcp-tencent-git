# mcp-tencent-git

[腾讯工蜂 (Tencent Git)](https://code.tencent.com/) REST API 的 MCP (Model Context Protocol) 服务器。

提供对腾讯工蜂 Git 平台的全面操作能力，包括分支管理、提交操作、版本库文件管理、合并请求、代码评审等功能。

## 功能特性

默认启用 **紧凑核心工具模式（Compact Core Tools）**，将高频核心域合并为更少的工具，降低模型选错工具和上下文开销：

- `manage_projects` - 项目管理聚合（`search` / `get`）
- `manage_branches` - 分支管理聚合（`list` / `get` / `create` / `delete` / `protect` / `unprotect` / `get_protect` / `lifecycle` / `list_protected_members` / `add_protected_member` / `update_protected_member` / `remove_protected_member`）
- `manage_repository` - 仓库管理聚合（`list_tree` / `get_file` / `create_file` / `update_file` / `delete_file` / `compare` / `archive` / `get_blob_raw` / `compare_changed_files`）
- `manage_merge_requests` - MR 管理聚合（`list` / `get` / `summary` / `file_diff` / `create` / `update` / `merge` / `changes` / `commits` / `changed_files` / `subscribe_status` / `subscribe` / `unsubscribe` / `list_comments` / `create_comment`）
- `manage_commits` - 提交管理聚合（`list` / `get` / `diff` / `list_comments` / `create_comment` / `refs`）
- `manage_code_reviews` - 代码评审聚合（`create` / `list` / `get` / `update` / `invite_reviewer` / `remove_reviewer` / `submit` / `reopen` / `changed_files`）
- `manage_mr_reviews` - MR 评审聚合（`get`=摘要 / `get_detail`=明细 / `invite_reviewer` / `remove_reviewer` / `cancel` / `submit` / `reopen`）
- `manage_comments` - 评论聚合（`target_type=merge_request/review/issue` + `action=list/get/create/update`）

源码目录已重构为分层结构，便于后续扩展：

```text
src/
  api-client.ts
  index.ts
  tools/
    core/
      index.ts
    extensions/
      commit.ts
      code-review.ts
      mr-review.ts
      comment.ts
      index.ts
```

### 🔀 分支管理
- `manage_branches` - 分支聚合工具（通过 `action` 路由）

### 📝 提交操作
- `manage_commits` - 提交聚合工具（通过 `action` 路由）

### 📁 版本库管理
- `manage_repository` - 仓库聚合工具（通过 `action` 路由）

### 🔄 合并请求 (MR)
- `manage_merge_requests` - MR 聚合工具（通过 `action` 路由）

### 🧭 项目管理
- `manage_projects` - 项目聚合工具（`search` / `get`）

### 🔍 代码评审 (Commit Review)
- `manage_code_reviews` - 代码评审聚合工具（通过 `action` 路由）

### 📋 MR 评审
- `manage_mr_reviews` - MR 评审聚合工具（通过 `action` 路由）

### 💬 评论管理
- `manage_comments` - 评论聚合工具（通过 `target_type` + `action` 路由）

## 安装

```bash
npm install
npm run build
```

构建后 `dist/index.js` 是一个包含所有依赖的单文件，部署时只需复制该文件，无需 `node_modules`。

## 配置

## 上下文防爆策略（默认启用）

- 所有工具响应会自动进行长度截断，避免单次返回过长文本导致上下文溢出。
- 列表类接口默认使用分页参数：`page=1`、`per_page=20`，并限制 `per_page<=100`。
- MR 场景支持摘要优先：
  - `manage_merge_requests(action=summary)` 返回 MR 基础信息 + changed files 摘要。
  - `manage_merge_requests(action=file_diff, file_path=...)` 只拉取单文件 diff。
  - `manage_mr_reviews(action=get)` 默认返回摘要；需要完整信息时使用 `action=get_detail`。
- 上述策略可通过环境变量调整（见下方“环境变量”表）。

### 环境变量

| 变量名                                   | 必填 | 说明                                                                                     |
| ---------------------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| `TENCENT_GIT_TOKEN`                      | ✅    | 工蜂的 Private Token，在 https://git.code.tencent.com/profile/account 获取               |
| `TENCENT_GIT_BASE_URL`                   | ❌    | API 基础 URL，默认 `https://git.code.tencent.com`                                        |
| `TENCENT_GIT_MAX_RESPONSE_CHARS`         | ❌    | 单次响应最大字符数，默认 `15000`。超过后会截断并附带提示。                               |
| `TENCENT_GIT_ENABLE_RESPONSE_TRUNCATION` | ❌    | 是否启用响应截断，默认 `true`。可设为 `false` 关闭。                                     |
| `TENCENT_GIT_DEFAULT_PAGE`               | ❌    | 默认分页页码，默认 `1`。                                                                  |
| `TENCENT_GIT_DEFAULT_PER_PAGE`           | ❌    | 默认每页数量，默认 `20`。                                                                 |
| `TENCENT_GIT_MAX_PER_PAGE`               | ❌    | 每页数量上限，默认 `100`。`DEFAULT_PER_PAGE` 会自动被限制在该上限内。                    |

### 在 VS Code 中使用 (Claude / GitHub Copilot)

在 `.vscode/mcp.json` 中添加：

```json
{
  "servers": {
    "tencent-git": {
      "command": "node",
      "args": ["/path/to/mcp-tencent-git/dist/index.js"],
      "env": {
        "TENCENT_GIT_TOKEN": "your-private-token",
        "TENCENT_GIT_BASE_URL": "https://git.code.tencent.com",
        "TENCENT_GIT_MAX_RESPONSE_CHARS": "12000",
        "TENCENT_GIT_ENABLE_RESPONSE_TRUNCATION": "true",
        "TENCENT_GIT_DEFAULT_PAGE": "1",
        "TENCENT_GIT_DEFAULT_PER_PAGE": "20",
        "TENCENT_GIT_MAX_PER_PAGE": "100"
      }
    }
  }
}
```

### 在 Claude Desktop 中使用

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "tencent-git": {
      "command": "node",
      "args": ["/path/to/mcp-tencent-git/dist/index.js"],
      "env": {
        "TENCENT_GIT_TOKEN": "your-private-token",
        "TENCENT_GIT_BASE_URL": "https://git.code.tencent.com",
        "TENCENT_GIT_MAX_RESPONSE_CHARS": "12000",
        "TENCENT_GIT_ENABLE_RESPONSE_TRUNCATION": "true",
        "TENCENT_GIT_DEFAULT_PAGE": "1",
        "TENCENT_GIT_DEFAULT_PER_PAGE": "20",
        "TENCENT_GIT_MAX_PER_PAGE": "100"
      }
    }
  }
}
```

## 认证方式

使用 Private Token 认证。在每个 API 请求的 HTTP Header 中添加 `PRIVATE-TOKEN`：

```
PRIVATE-TOKEN: your-private-token
```

Private Token 可以在工蜂个人设置中获取：`https://git.code.tencent.com/profile/account`

## 项目标识

API 中的 `project_id` 参数支持两种格式：
- **数字 ID**：如 `12345`
- **命名空间路径**：如 `namespace/project`（会自动进行 URL 编码）

## API 文档参考

- [使用前必读](https://code.tencent.com/help/api/prepare)
- [提交相关](https://code.tencent.com/help/api/commit)
- [代码评审](https://code.tencent.com/help/api/code_review)
- [版本库](https://code.tencent.com/help/api/repository)
- [分支管理](https://code.tencent.com/help/api/branch)
- [合并请求](https://code.tencent.com/help/api/mergeRequest)
- [评论](https://code.tencent.com/help/api/comment)
- [MR评审](https://code.tencent.com/help/api/mr_review)

## License

GPL-3.0 License