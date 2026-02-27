# mcp-tencent-git

[腾讯工蜂 (Tencent Git)](https://code.tencent.com/) REST API 的 MCP (Model Context Protocol) 服务器。

提供对腾讯工蜂 Git 平台的全面操作能力，包括分支管理、提交操作、版本库文件管理、合并请求、代码评审等功能。

> **开发者请注意**：如果您希望参与开发或了解项目架构，请参阅 [开发者文档 (DEVELOPING.md)](DEVELOPING.md)。

## 安装

可以直接通过 npm 安装：

```bash
npm install -g @puiching-memory/mcp-tencent-git
```

或者使用 `npx` 直接运行：

```bash
npx @tencent-git/mcp-tencent-git
```

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

## License

GPL-3.0 License