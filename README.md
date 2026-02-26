# mcp-tencent-git

[腾讯工蜂 (Tencent Git)](https://code.tencent.com/) REST API 的 MCP (Model Context Protocol) 服务器。

提供对腾讯工蜂 Git 平台的全面操作能力，包括分支管理、提交操作、版本库文件管理、合并请求、代码评审等功能。

## 功能特性

### 🔀 分支管理
- `list_branches` - 列出项目分支
- `get_branch` - 获取分支详情
- `create_branch` - 创建新分支
- `delete_branch` - 删除分支
- `protect_branch` - 保护分支
- `unprotect_branch` - 取消保护分支

### 📝 提交操作
- `list_commits` - 列出提交记录
- `get_commit` - 获取提交详情
- `get_commit_diff` - 获取提交差异
- `get_commit_comments` - 获取提交评论
- `create_commit_comment` - 创建提交评论
- `get_commit_refs` - 获取提交对应的分支和tag

### 📁 版本库管理
- `list_repository_tree` - 列出文件和目录
- `get_file_content` - 获取文件内容
- `create_file` - 创建文件
- `update_file` - 更新文件
- `delete_file` - 删除文件
- `compare` - 对比差异

### 🔄 合并请求 (MR)
- `list_merge_requests` - 列出合并请求
- `get_merge_request` - 获取合并请求详情
- `create_merge_request` - 创建合并请求
- `update_merge_request` - 更新合并请求
- `merge_merge_request` - 执行合并
- `get_merge_request_changes` - 获取代码变更
- `get_merge_request_commits` - 获取提交列表

### 🔍 代码评审 (Commit Review)
- `create_code_review` - 创建代码评审
- `list_code_reviews` - 列出代码评审
- `get_code_review` - 获取评审详情
- `update_code_review` - 更新评审
- `invite_code_reviewer` - 邀请评审人
- `remove_code_reviewer` - 移除评审人
- `submit_code_review` - 发表评审意见
- `reopen_code_review` - 重置评审状态

### 📋 MR 评审
- `get_mr_review` - 获取MR评审信息
- `invite_mr_reviewer` - 邀请MR评审人
- `remove_mr_reviewer` - 移除MR评审人
- `cancel_mr_review` - 取消MR评审
- `submit_mr_review` - 发表MR评审意见
- `reopen_mr_review` - 重置MR评审状态

### 💬 评论管理
- MR 评论：`list_mr_notes`, `get_mr_note`, `create_mr_note`, `edit_mr_note`
- 评审评论：`list_review_notes`, `get_review_note`, `create_review_note`, `edit_review_note`
- 缺陷评论：`list_issue_notes`, `get_issue_note`, `create_issue_note`, `edit_issue_note`

## 安装

```bash
npm install
npm run build
```

构建后 `dist/index.js` 是一个包含所有依赖的单文件，部署时只需复制该文件，无需 `node_modules`。

## 配置

### 环境变量

| 变量名                 | 必填 | 说明                                                                       |
| ---------------------- | ---- | -------------------------------------------------------------------------- |
| `TENCENT_GIT_TOKEN`    | ✅    | 工蜂的 Private Token，在 https://git.code.tencent.com/profile/account 获取 |
| `TENCENT_GIT_BASE_URL` | ❌    | API 基础 URL，默认 `https://git.code.tencent.com`                          |

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
        "TENCENT_GIT_BASE_URL": "https://git.code.tencent.com"
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
        "TENCENT_GIT_BASE_URL": "https://git.code.tencent.com"
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