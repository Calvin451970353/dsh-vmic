# dsh-vmic — 语音输入插件（Voice Input for DeepSeek Harness）

DeepSeek Harness（DSH）的语音输入插件：在聊天输入框旁新增一个 🎙️ 麦克风按钮（带实时频谱动画），录制 16kHz WAV 语音并转写成文字，填入输入草稿供你审阅——**真正执行请求的仍是 DSH 中当前选中的模型**，语音识别只承担"听写"层，与主模型完全解耦。

## 特性

- 🎙️ 输入框工具栏的麦克风按钮（发送按钮左侧）：点击开始录音，再次点击停止并转写。
- 📊 录制时实时频谱动画（Canvas 绘制，主题跟随 harness CSS 变量）。
- ⚡ 两种内置转写供应商，右键按钮打开配置面板即可切换：
  - **小米 MiMo**（`openai-compatible`，`input_audio` 方式，模型 `mimo-v2.5-asr`）
  - **火山豆包**（SAUC bigmodel WebSocket 二进制帧协议，模型 `bigmodel`，资源 `volc.bigasr.sauc.duration`，支持**流式**转写）
- ✨ 可选 LLM 润色（默认复用 DSH credentials 中的 `DEEPSEEK_API_KEY`，`deepseek-chat`）：去除口语化、修正错别字与标点；也可在面板中配置自定义润色 Key。
- 🔒 API Key 只存在于 DSH 服务端（credentials 密封，命名 `VMIC_<ID>_API_KEY`），浏览器只能看到"已配置/未配置"状态，拿不到明文。
- 🧪 内置供应商连通性测试：发送 0.5s 测试音，返回延迟与识别文本，快速定位网络/鉴权问题。
- 🌐 中文 / 英文 UI 字符串。

## 安装

本地开发（link 依赖，代码改动即时生效）：

```bash
cd ~/.dsh/profiles/web
pnpm add link:E:/path/to/dsh-vmic
```

发布版（以 GitHub 仓库为例）：

```bash
cd ~/.dsh/profiles/web
pnpm add github:Calvin451970353/dsh-vmic
```

然后在 `cordis.patch.yml` 追加（保留你已有的 insert 列表）：

```yaml
- insert:
    - id: vmic
      name: 'dsh-vmic'
      config:
        selectedProvider: xiaomi-mimo
        providers:
          - id: xiaomi-mimo
            type: openai-compatible
            name: 小米 MiMo
            preset: true
            enabled: true
            live: false
          - id: volcengine-doubao
            type: volcengine-doubao
            name: 火山豆包
            preset: true
            enabled: true
            live: true
        language: auto
        timeoutMs: 30000
```

重启 `dsh web` 服务并刷新页面。

> 供应商预设的端点/模型已内置，用户只需填入 API Key；`providers` 也可留空，插件会用同样的内置预设。

## 配置

右键麦克风按钮打开配置面板：

- **供应商**：选择当前使用的供应商（`selectedProvider`）、开关与自定义 `openai-compatible` 供应商（填 `baseUrl` / `model` / Key）。
- **语言**：`language: auto` 或指定（如 `zh`）。
- **润色**：`polish.enabled`、是否复用 `DEEPSEEK_API_KEY`、模型与超时。

### API Key

Key 存在 DSH 的 credentials 密封中（`~/.dsh/.credentials.yaml`），引用名（不带 `VMIC_` 前缀的也兼容）：

| 用途 | 引用名 |
| --- | --- |
| 小米 MiMo | `VMIC_XIAOMI_MIMO_API_KEY` |
| 火山豆包 | `VMIC_VOLCENGINE_DOUBAO_API_KEY` |
| 自定义润色 | `VMIC_POLISH_API_KEY`（或复用 `DEEPSEEK_API_KEY`） |

火山豆包密钥两种格式均支持：`appkey:accesskey`（自动走 `X-Api-App-Key` / `X-Api-Access-Key`）或单 Key（走 `X-Api-Key`）。

## 使用

1. 点击 🎙️ 开始录音（允许浏览器麦克风权限）。
2. 再次点击（或红色方块）停止：完整音频转写一次。
3. （可选）开启润色后自动调用 LLM 整理。
4. 文字进入输入草稿（保留你已有的草稿），检查后回车发送——由当前选中的模型执行。

## 宿主路由（host half）

| 路由 | 说明 |
| --- | --- |
| `GET/POST /vmic-config` | 读取 / 保存供应商与润色配置（Key 仅存 credentials） |
| `GET /vmic-key?id=` | 回显某个 Key（面板"眼睛"图标用，仅本机回环） |
| `POST /vmic-test` | 用 0.5s 测试音探测某个供应商 |
| `POST /vmic-asr` | 用**当前选中**的供应商转写一次（base64 data URL） |
| `POST /vmic-polish` / `POST /vmic-polish-test` | 润色接口与自检 |
| `POST /vmic-asr-live/start \| /chunk \| /stop` | 火山豆包流式转写（仅 `volcengine-doubao` 供应商） |

## 已知限制

- 浏览器录制编码为 16kHz 单声道 WAV；小米 MiMo 对 base64 输入有 10MB 上限（约 5 分钟，远超语音输入场景）。
- 修改 `cordis.patch.yml` 或插件配置后需要**重启 `dsh web`** 服务。
- 客户端 bundle 改动仅在 `pnpm run dev:web` 监听运行时热更新；否则需重启服务并刷新页面。

## License

MIT
