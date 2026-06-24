# 如何搭建 Claude Code 自定义 Subagent（子代理）

Subagent 是 Claude Code 中的专用 AI 助手，在独立的上下文中运行，有自定义的系统提示、限定的工具和独立的权限。父会话（你）委派任务，子代理自主运行，只返回摘要——保持主上下文干净。

---

## 文件存放位置

Subagent 是按作用域存放的 **Markdown 文件（带 YAML frontmatter）**：

| 位置 | 作用域 | 优先级 |
|---|---|---|
| 托管设置（组织） | 整个组织 | 1（最高） |
| `--agents` CLI 参数（JSON） | 仅当前会话 | 2 |
| `.claude/agents/` | 当前项目 | 3 |
| `~/.claude/agents/` | 所有项目（用户级） | 4 |
| 插件的 `agents/` 目录 | 插件启用的地方 | 5（最低） |

> `.claude/agents/` 和 `~/.claude/agents/` 会**递归扫描**——可以按子文件夹组织，如 `agents/review/`、`agents/research/`。文件名不重要，身份由 frontmatter 中的 `name` 字段决定。

---

## 方法一：交互式创建（推荐）

在 Claude Code 中运行：

```
/agents
```

操作流程：
1. 进入 **Library** 标签 → **Create new agent**
2. 选择 **Personal**（用户级）或 **Project**（项目级）
3. **用自然语言描述**你想要的能力，Claude 会自动生成
4. 选择可用工具、模型、颜色
5. 配置内存（跨会话记忆）
6. 保存

通过 `/agents` 创建的子代理**立即生效**，无需重启。

---

## 方法二：手动创建文件

### 创建目录和文件

```powershell
# 项目级（可以提交到版本控制）
New-Item -ItemType Directory -Force .claude/agents
New-Item -ItemType File .claude/agents/my-agent.md

# 用户级（在所有项目中可用）
New-Item -ItemType Directory -Force ~/.claude/agents
New-Item -ItemType File ~/.claude/agents/my-agent.md
```

> 手动创建的文件需要**重启会话**（或使用 `/agents` 重新加载）才能生效。

### 文件格式示例

一个最基本的 subagent 文件（如 `.claude/agents/code-reviewer.md`）：

```markdown
---
name: code-reviewer
description: 审查代码质量和最佳实践。代码变更后主动使用。
tools: Read, Glob, Grep
model: sonnet
---

你是一位高级代码审查员。被调用时，按以下顺序操作：

1. 识别当前分支上变更的文件
2. 阅读每个变更文件及其测试
3. 按文件和行号标记具体问题：正确性、安全性、性能、可读性
4. 提出具体的修复建议，不要给模糊的建议

输出格式：按文件分组的 Markdown 报告，标记严重级别（BLOCKER、MAJOR、NIT）。
不要修改文件；你默认是只读的。
```

---

## 所有 Frontmatter 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | **是** | 唯一标识符（小写字母 + 连字符） |
| `description` | **是** | 何时委托给此子代理（路由信号），建议以"当...时使用此代理"开头 |
| `tools` | 否 | 工具允许清单（省略则继承全部），多个工具用 `,` 分隔 |
| `disallowedTools` | 否 | 工具禁用清单（先于 allowlist 应用） |
| `model` | 否 | `sonnet`、`opus`、`haiku`、完整模型 ID 或 `inherit`（默认继承父会话） |
| `permissionMode` | 否 | `default`、`acceptEdits`、`auto`、`dontAsk`、`bypassPermissions`、`plan` |
| `maxTurns` | 否 | 代理轮次硬上限 |
| `skills` | 否 | 启动时预加载到上下文的技能 |
| `mcpServers` | 否 | 仅限此子代理的 MCP 服务器 |
| `hooks` | 否 | 仅限此子代理的生命周期钩子 |
| `memory` | 否 | `user`、`project` 或 `local` —— 持久化跨会话学习 |
| `background` | 否 | `true` 表示始终作为后台任务运行 |
| `effort` | 否 | `low`、`medium`、`high`、`xhigh`、`max`（推理力度） |
| `isolation` | 否 | `worktree` 给子代理一个隔离的 git worktree 副本 |
| `color` | 否 | `red`、`blue`、`green`、`yellow`、`purple`、`orange`、`pink`、`cyan` |
| `initialPrompt` | 否 | 当此代理作为主会话运行时，自动提交的首条消息 |

---

## 模型选择

| 模型 | 最适合 | 权衡 |
|---|---|---|
| **Haiku** | 快速探索、文档生成、搜索总结 | 多步推理较弱 |
| **Sonnet** | 通用主力：代码审查、重构、调试、写测试 | 长时间多文件编辑成本较高 |
| **Opus** | 安全审计、架构评审、疑难调试 | 延迟和成本较高；日常任务用是浪费 |
| `inherit`（默认） | 匹配父会话的模型 | — |

---

## 工具访问模式示例

```yaml
# 只读审计员
tools: Read, Grep, Glob

# Bug 修复子代理（可运行测试、应用补丁）
tools: Read, Edit, Bash, Grep, Glob

# 继承所有工具，但禁止文件写入
disallowedTools: Write, Edit

# 只能生成特定类型子代理的协调器
tools: Agent(worker, researcher), Read, Bash

# 允许生成任何子代理
tools: Agent, Read, Bash
```

---

## 会话级 Subagent（--agents CLI 参数）

可以在命令行用 JSON 直接定义，仅对当前会话有效：

```powershell
claude --agents '{
  "code-reviewer": {
    "description": "审查代码质量和最佳实践。代码变更后主动使用。",
    "prompt": "你是一位高级代码审查员。关注代码质量、安全性和最佳实践。",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "错误和测试失败的调试专家。",
    "prompt": "你是一位专家级调试员。分析错误、确定根本原因并提供修复方案。"
  }
}'
```

---

## 最佳实践

1. **description 写法**：以"当...时使用此代理"开头或包含"主动使用"——这是父会话用来自动委派的路由信号
2. **明确输出格式**——父会话只看到子代理的结果，结构化输出很重要
3. **系统提示保持简洁**——子代理最好只做一件事，有清晰的定义
4. **将项目级子代理提交到版本控制**——`.claude/agents/` 文件应提交，团队共享
5. **当子代理需要隔离的仓库副本时**使用 `isolation: worktree`（无变更时自动清理）

---

## 实验性功能：Agent Teams（2026年2月）

在 `~/.claude/settings.json` 中启用多代理并行执行：

```json
{
  "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
  "max_agents": 5,
  "execution_mode": "parallel",
  "agent_coordination": {
    "shared_context": true,
    "task_distribution": "automatic"
  }
}
```

这会生成多个 Claude 实例，通过共享任务列表进行通信，由主代理协调。

---

## 官方文档

> **https://code.claude.com/docs/en/sub-agents**

---

## 快速上手模板

复制以下模板到 `.claude/agents/` 下，修改即可：

```markdown
---
name: my-first-agent
description: [一句话描述：这个代理擅长什么，什么时候用它]
tools: Read, Glob, Grep, Bash
model: inherit
---

# 你的角色

[用 2-3 句话定义你是谁，你擅长什么]

# 工作流程

1. [第一步做什么]
2. [第二步做什么]
3. [输出什么]

# 输出格式

[明确指定输出格式，如：Markdown 报告 / JSON / 纯文本列表]

# 约束

- [不能做什么]
- [要遵守什么规则]
```
