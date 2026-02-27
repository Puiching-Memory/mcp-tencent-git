# 开发者文档 (Developer Guide)

本文档面向希望参与开发、扩展或自行构建 `mcp-tencent-git` 的开发者。

## 源码结构

源码目录已重构为分层结构，便于后续扩展：

```text
src/
  api-client.ts      # 腾讯工蜂 API 客户端封装
  index.ts           # MCP 服务器入口
  tools/             # 工具实现目录
    core/            # 核心工具（如 manage_projects, manage_branches 等）
      index.ts
    extensions/      # 扩展工具（如 commit, code-review 等）
      commit.ts
      code-review.ts
      mr-review.ts
      comment.ts
      index.ts
    shared/          # 共享工具函数
      response.ts
```

## 工具路由设计

本项目默认启用 **紧凑核心工具模式（Compact Core Tools）**，将高频核心域合并为更少的工具，降低模型选错工具和上下文开销。每个聚合工具内部通过 `action` 字段进行路由：

## 功能特性 (接口列表)

- `manage_projects` - 项目管理聚合（`search` / `get`）
- `manage_branches` - 分支管理聚合（`list` / `get` / `create` / `delete` / `protect` / `unprotect` / `get_protect` / `lifecycle` / `list_protected_members` / `add_protected_member` / `update_protected_member` / `remove_protected_member`）
- `manage_repository` - 仓库管理聚合（`list_tree` / `get_file` / `create_file` / `update_file` / `delete_file` / `compare` / `archive` / `get_blob_raw` / `compare_changed_files`）
- `manage_merge_requests` - MR 管理聚合（`list` / `get` / `summary` / `file_diff` / `create` / `update` / `merge` / `changes` / `commits` / `changed_files` / `subscribe_status` / `subscribe` / `unsubscribe` / `list_comments` / `create_comment`）
- `manage_commits` - 提交管理聚合（`list` / `get` / `diff` / `list_comments` / `create_comment` / `refs`）
- `manage_code_reviews` - 代码评审聚合（`create` / `list` / `get` / `update` / `invite_reviewer` / `remove_reviewer` / `submit` / `reopen` / `changed_files`）
- `manage_mr_reviews` - MR 评审聚合（`get`=摘要 / `get_detail`=明细 / `invite_reviewer` / `remove_reviewer` / `cancel` / `submit` / `reopen`）
- `manage_comments` - 评论聚合（`target_type=merge_request/review/issue` + `action=list/get/create/update`）

## 路由详情描述

- `manage_branches` - 分支聚合工具（通过 `action` 路由）
- `manage_commits` - 提交聚合工具（通过 `action` 路由）
- `manage_repository` - 仓库聚合工具（通过 `action` 路由）
- `manage_merge_requests` - MR 聚合工具（通过 `action` 路由）
- `manage_projects` - 项目聚合工具（`search` / `get`）
- `manage_code_reviews` - 代码评审聚合工具（通过 `action` 路由）
- `manage_mr_reviews` - MR 评审聚合工具（通过 `action` 路由）
- `manage_comments` - 评论聚合工具（通过 `target_type` + `action` 路由）

## 本地开发与构建

1. 安装依赖：
```bash
npm install
```

2. 编译构建：
```bash
npm run build
```
构建后 `dist/index.js` 是一个包含所有依赖的单文件，部署时只需复制该文件，无需 `node_modules`。

## API 文档参考

开发时如需查阅腾讯工蜂 API，请参考以下链接：
- [使用前必读](https://code.tencent.com/help/api/prepare)
- [提交相关](https://code.tencent.com/help/api/commit)
- [代码评审](https://code.tencent.com/help/api/code_review)
- [版本库](https://code.tencent.com/help/api/repository)
- [分支管理](https://code.tencent.com/help/api/branch)
- [合并请求](https://code.tencent.com/help/api/mergeRequest)
- [评论](https://code.tencent.com/help/api/comment)
- [MR评审](https://code.tencent.com/help/api/mr_review)
