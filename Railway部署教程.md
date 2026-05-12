# 🚀 ChatGPT 项目部署与配置全攻略

本教程涵盖了从后端存储准备到代码优化、环境配置及数据库维护的全流程。

---

## 一、 准备数据存储地址

在部署之前，请确保已注册并配置以下两个核心服务：

1. **数据库存储 (Neon):** [https://console.neon.tech/](https://console.neon.tech/)
   - 用于注册数据库账号池，存储用户信息及对话记录。
2. **对象存储 (Backblaze):** [https://secure.backblaze.com/](https://secure.backblaze.com/)
   - 用于注册存储桶（Bucket），存储项目运行中生成的照片或文件。

---

## 二、 修改项目文件（支持长 Token）

为了支持企业账号较长的 Token，需要修改数据库模型定义，将长度限制改为无上限。

**修改文件：** `/services/storage/database_storage.py`

- **找到原代码：**
  ```python
  access_token = Column(String(2048), unique=True, nullable=False, index=True)

## 三、在Railway上添加变量

如果你最终决定使用 **Neon (数据库)** + **Backblaze (存图)** 的组合，你的环境变量配置文件大概如下所示：

```markdown
# 环境变量配置 (Neon + Backblaze B2)

| 变量名 | 对应值 |
| :--- | :--- |
| **STORAGE_BACKEND** | `postgres` |
| **DATABASE_URL** | `postgres://... (来自 Neon)` |
| **CF_R2_BUCKET** | `my-gpt-data-2026-xyz` |
| **CF_R2_ENDPOINT** | `https://s3.us-east-005.backblazeb2.com` |
| **CF_R2_ACCESS_KEY** | `你刚才生成的 keyID` |
| **CF_R2_SECRET_KEY** | `你刚才生成的 applicationKey` |
| **CHATGPT2API_AUTH_KEY** | `设置登录页面密码` |
如果在render.com平台部署需要添加一个端口变量
| **PORT** | `例如：80` |

## 🛠️ 手动加大字段长度（Neon 教程）
1.打开 Neon 控制面板：进入你的项目。

2.点击 SQL Editor：在左侧菜单栏找到并点击。

3.输入并运行以下指令：
粘贴下面的 SQL 代码，把 accounts 表中的 access_token 字段从 2048 直接改成 无上限的 TEXT 类型（或者改成更大的数字）：

-- 将 access_token 改为 TEXT 类型（不再受长度限制）
ALTER TABLE accounts ALTER COLUMN access_token TYPE TEXT;

-- 为了保险，顺便把存储原始数据的 data 字段也加宽
ALTER TABLE accounts ALTER COLUMN data TYPE TEXT;

4.点击 "Run"：运行成功后，Neon 会显示 ALTER TABLE。



## 🛠️ 如果你没有插件，手动寻找法Access Token：
1.打开 chatgpt.com 并登录。

2.按下键盘上的 F12（或者右键 -> 检查）。

3.点击上方菜单栏的 Application（应用）选项卡。

4.在左侧找到 Cookies，点击展开，选中 https://chatgpt.com。

5.在右侧列表中找一个名为 __Secure-next-auth.session-token 的项。

6.双击它对应的值，全部复制。这就是你的“通行证”！
