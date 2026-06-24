# 出游提醒内容升级 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升级家庭出游提醒推送，使每条推荐包含天气适配、适幼度、行程（含当地美食）、出行清单、周边配套

**Architecture:** 扩展 `data/next_trip.json` 数据结构 → 重写 `scf/trip_reminder.py` 渲染逻辑 → 填入7月示例推荐

**Tech Stack:** Python 3, 企微 Webhook

**关键文件:**
- `科捷/data/next_trip.json` — 出游推荐数据
- `科捷/scf/trip_reminder.py` — 推送脚本

---

### Task 1: 更新 next_trip.json 数据结构 + 填入7月示例

**Files:**
- Modify: `科捷/data/next_trip.json`

**Interfaces:**
- Consumes: 设计文档中定义的新 JSON schema
- Produces: `recommendations` 数组（包含 `main` 和 `backup` 两条推荐），供 Task 2 读取

- [ ] **Step 1: 写入新结构 + 7月数据**

写入 `科捷/data/next_trip.json`:

```json
{
  "year_month": "2026-07",
  "pushed": false,
  "recommendations": [
    {
      "type": "main",
      "title": "🎋 从化溪头村·溯溪避暑一日游",
      "destination": "广州从化·溪头村",
      "date_hint": "7月4日（周六）",
      "reason": "溪头村是广州周边有名的避暑古村落，村旁浅溪清澈见底、树荫茂密，夏季水温清凉，非常适合带钰宁踩水消暑。",
      "commute": {
        "from": "增城",
        "drive_time": "约 50 分钟",
        "tips": "走大广高速，溪头村出口下"
      },
      "weather": {
        "forecast": "预计 25-32°C，午后局部阵雨",
        "rating": "⭐⭐⭐☆",
        "advice": "建议上午9点前出发，带上雨具；午后阵雨时段可躲农家乐"
      },
      "baby_friendly": {
        "rating": "⭐⭐⭐⭐",
        "notes": [
          "✅ 浅滩水深10-20cm，适合宝宝踩水",
          "✅ 树荫多，不暴晒",
          "⚠️ 村内石板路需抱着或使用腰凳"
        ]
      },
      "schedule": [
        {"time": "09:00", "activity": "增城出发"},
        {"time": "09:50", "activity": "抵达溪头村"},
        {"time": "10:00-11:30", "activity": "🏖️ 溪边玩水、捡石头"},
        {"time": "11:30-13:00", "activity": "🍗 农家乐午餐", "food": "泥焗鸡、山水豆腐、竹筒饭"},
        {"time": "13:00-15:00", "activity": "😴 午休/树荫下乘凉"},
        {"time": "15:00-16:30", "activity": "🚶 古村落散步"},
        {"time": "16:30-17:30", "activity": "🛍️ 周边逛逛、买点特产"},
        {"time": "17:30-18:30", "activity": "🥟 附近农庄晚餐", "food": "从化五道菜（桂峰酿豆腐、香叶乌鬃鹅等）"},
        {"time": "18:30-19:30", "activity": "🚗 返程回增城"}
      ],
      "packing_list": [
        "🩳 换洗衣物2套",
        "🧴 宝宝防晒霜",
        "🎩 遮阳帽",
        "🦟 驱蚊液",
        "💧 饮用水",
        "🩱 防水纸尿裤",
        "🍼 辅食便当",
        "🏖️ 玩水玩具"
      ],
      "nearby": [
        "🍚 农家乐有宝宝椅、儿童餐",
        "🅿️ 村口免费停车",
        "🚻 有公厕，建议自带湿巾",
        "🏪 村内有小卖部可补给"
      ]
    },
    {
      "type": "backup",
      "title": "🏞️ 增城白水寨·亲水栈道一日游",
      "destination": "广州增城·白水寨",
      "date_hint": "7月4日（周六）或7月5日（周日）",
      "reason": "白水寨距离近、开车半小时即到，景区内有平缓的亲水栈道，适合推婴儿车散步，瀑布区水雾清凉消暑。",
      "commute": {
        "from": "增城",
        "drive_time": "约 30 分钟",
        "tips": "从荔城出发走增派大道，直达白水寨景区"
      },
      "weather": {
        "forecast": "预计 26-33°C，山区略低2-3°C",
        "rating": "⭐⭐⭐⭐",
        "advice": "山区天气多变，建议带薄外套和雨具；瀑布区水雾大，注意手机防水"
      },
      "baby_friendly": {
        "rating": "⭐⭐⭐☆",
        "notes": [
          "✅ 亲水栈道平缓，可推婴儿车",
          "✅ 海拔低、路程短，适合带娃",
          "⚠️ 瀑布区水雾大，地面湿滑需留意",
          "⚠️ 需购门票（约60元/人）"
        ]
      },
      "schedule": [
        {"time": "09:30", "activity": "增城出发"},
        {"time": "10:00", "activity": "抵达白水寨"},
        {"time": "10:00-11:30", "activity": "🌿 亲水栈道散步、看瀑布"},
        {"time": "11:30-13:00", "activity": "🍗 景区农庄午餐", "food": "增城荔枝烧鹅、山坑螺、山水腐竹"},
        {"time": "13:00-14:30", "activity": "😴 车内/树荫下午休"},
        {"time": "14:30-16:00", "activity": "🏖️ 山脚浅水区踩水"},
        {"time": "16:00-17:00", "activity": "🛍️ 景区门口特产街逛逛"},
        {"time": "17:00-18:00", "activity": "🥟 派潭镇吃晚饭", "food": "派潭烧鸡、客家酿豆腐"},
        {"time": "18:00-18:30", "activity": "🚗 返程回增城"}
      ],
      "packing_list": [
        "🩳 换洗衣物2套",
        "🧴 宝宝防晒霜",
        "🎩 遮阳帽",
        "🦟 驱蚊液",
        "💧 饮用水",
        "🧥 薄外套（山区备用）",
        "🩱 防水纸尿裤",
        "🍼 辅食便当",
        "📱 手机防水袋"
      ],
      "nearby": [
        "🍚 景区门口有多家农家乐",
        "🅿️ 景区停车场（收费约20元/天）",
        "🚻 景区内有公厕，较干净",
        "🏪 特产街可买增城荔枝、菜心等"
      ]
    }
  ]
}
```

---

### Task 2: 重写 trip_reminder.py 渲染逻辑

**Files:**
- Modify: `科捷/scf/trip_reminder.py`

**Interfaces:**
- Consumes: Task 1 产出的 `next_trip.json`（含 `recommendations` 数组）
- Produces: 通过企微 Webhook 推送富文本消息

- [ ] **Step 1: 整体替换脚本内容**

重写 `科捷/scf/trip_reminder.py`：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每月首个周五 → 推送家庭出游推荐
数据由 Claude 在确认后更新至 data/next_trip.json
支持：天气适配、适幼度、行程（含美食）、出行清单、周边配套
"""

import json
import os
import sys
import urllib.request
from datetime import date, datetime, timezone, timedelta

# ─── 配置 ─────────────────────────────────────
WEBHOOK_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0e0f59cb-0991-4898-b60e-6e99eb365d96"
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "next_trip.json")


def today_beijing() -> date:
    utc_now = datetime.now(timezone.utc)
    beijing = utc_now + timedelta(hours=8)
    return beijing.date()


def send_wechat(content: str) -> bool:
    payload = {"msgtype": "text", "text": {"content": content}}
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("errcode") == 0
    except Exception as e:
        print(f"[ERROR] 推送失败: {e}")
        return False


def safe_print(text: str):
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode(sys.stdout.encoding, errors="replace").decode(sys.stdout.encoding))


def render_recommendation(rec: dict, year_month: str) -> str:
    """将一条推荐渲染为富文本消息"""
    label = "主推荐" if rec["type"] == "main" else "备选"
    lines = [f"🚗 {year_month}出游推荐 · {label}"]
    lines.append("━" * 30)
    lines.append("")

    # 标题 + 地点 + 距离
    lines.append(rec["title"])
    loc = rec["destination"]
    commute = rec["commute"]
    lines.append(f"📍 {loc} | 🚗 {commute['from']}出发约{commute['drive_time']}")
    lines.append(f"📅 推荐：{rec['date_hint']}")
    lines.append("")

    # 推荐理由
    lines.append("🌟 推荐理由")
    lines.append(rec["reason"])
    lines.append("")

    # 天气适配
    w = rec["weather"]
    lines.append("🌤️ 天气适配")
    lines.append(w["forecast"])
    for a in w["advice"].split("；"):
        lines.append(f"→ {a.strip()}")
    lines.append("")

    # 适幼度
    bf = rec["baby_friendly"]
    lines.append(f"👶 适幼度：{bf['rating']}")
    for note in bf["notes"]:
        lines.append(note)
    lines.append("")

    # 行程安排
    lines.append("📋 行程安排")
    for s in rec["schedule"]:
        act = s["activity"]
        food = s.get("food", "")
        if food:
            lines.append(f"{s['time']}  {act}")
            lines.append(f"        推荐：{food}")
        else:
            lines.append(f"{s['time']}  {act}")
    lines.append("")

    # 出行清单
    lines.append("🎒 出行清单")
    items = rec["packing_list"]
    # 每行2个，用 | 分隔
    for i in range(0, len(items), 2):
        pair = items[i:i+2]
        lines.append(" | ".join(pair))
    lines.append("")

    # 周边配套
    lines.append("🍜 周边配套")
    for n in rec["nearby"]:
        lines.append(f"• {n}")

    lines.append("━" * 30)
    return "\n".join(lines)


def main():
    today = today_beijing()

    # ── 仅在周五执行 ──
    if today.weekday() != 4:
        safe_print(f"[SKIP] 今天不是周五 (weekday={today.weekday()})")
        return

    # ── 读取数据 ──
    if not os.path.exists(DATA_FILE):
        safe_print("[WARN] 数据文件不存在")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ── 月份校验 ──
    expected = f"{today.year}-{today.month:02d}"
    if data.get("year_month", "") != expected:
        safe_print(f"[SKIP] 月份不匹配: 期望={expected}, 实际={data.get('year_month')}")
        return

    # ── 已推送过则跳过 ──
    if data.get("pushed", False):
        safe_print("[SKIP] 本月已推送")
        return

    recommendations = data.get("recommendations", [])
    if not recommendations:
        safe_print("[SKIP] 推荐列表为空")
        return

    # ── 逐条推送 ──
    all_ok = True
    for i, rec in enumerate(recommendations):
        msg = render_recommendation(rec, expected)
        safe_print(f"\n--- 推送第{i+1}/{len(recommendations)}条 ---")
        safe_print(msg)
        ok = send_wechat(msg)
        safe_print(f"[{'OK' if ok else 'FAIL'}] 第{i+1}条")
        if not ok:
            all_ok = False

    # ── 全部成功则标记已推送 ──
    if all_ok:
        data["pushed"] = True
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        safe_print("[DONE] 全部推送成功，已标记已推送")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 测试运行**

```bash
cd "E:\Claude Code(cursor)"
python 科捷/scf/trip_reminder.py
```

预期输出：
- 今天不是周五 → `[SKIP] 今天不是周五`
- 可以临时注释掉周五检查行 `if today.weekday() != 4:` 来测试完整推送流程
- 推送后 `next_trip.json` 的 `pushed` 变为 `true`

---

## 自检

1. **Spec 覆盖** ✅ — 天气适配 ✓ 适幼度 ✓ 行程含美食 ✓ 出行清单 ✓ 周边配套 ✓ 合并单条 ✓ 主推+备选 ✓
2. **无占位符** ✅ — 所有代码完整，无 TODO/TBD
3. **类型一致** ✅ — JSON 字段名与脚本引用一致
