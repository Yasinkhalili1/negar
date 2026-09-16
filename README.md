# نگار (Negar) — پلتفرم وبلاگ فارسی

> **A lightweight Persian blogging platform that runs entirely in the browser.**

[فارسی](#فارسی) · [English](#english)

پلتفرم وبلاگ‌نویسی فارسی، سبک و سریع، که **بدون سرور** در مرورگر اجرا می‌شود.
مقالات، کاربران و نظرات همگی در `localStorage` ذخیره می‌شوند — نیازی به دیتابیس نیست.

A lightweight, fast Persian blogging platform that runs **entirely in the browser**.
Articles, users, and comments are all stored in `localStorage` — no database required.

---

## ✨ امکانات — Features

| فارسی | English |
|---|---|
| **راست‌چین و فارسی‌محور** — چیدمان کامل RTL با اعداد فارسی | **RTL & Persian-first** — full right-to-left layout with Persian digits |
| **ویرایشگر مارک‌داون** — پیش‌نمایش زنده، تولبار و شورت‌کات (Ctrl+B / Ctrl+I / Ctrl+K) | **Markdown editor** — live preview, toolbar, keyboard shortcuts (Ctrl+B / Ctrl+I / Ctrl+K) |
| **حالت تاریک نئونی** — تم مدرن با یک کلیک، حفظ‌شده بعد از رفرش | **Neon dark mode** — sleek modern theme, one-click toggle, persisted |
| **حساب کاربری** — ثبت‌نام، ورود، ویرایش پروفایل با آواتار و بیو | **User accounts** — register, login, edit profile with avatar & bio |
| **داشبورد نویسنده** — نمودار ستونی بازدید/لایک و آمار کامل مقالات | **Author dashboard** — views/likes bar chart and full article stats |
| **کتابخانه شخصی** — ذخیره (بوکمارک) مقاله‌ها، مختص هر کاربر | **Personal library** — bookmark articles, stored per user |
| **کامنت و پاسخ** — گفتگو با سایر خوانندگان | **Comments & replies** — engage with other readers |
| **اعلان‌ها** — اطلاع از اتفاقات جدید | **Notifications** — see what's new at a glance |
| **چالش هفته + نویسنده ماه** — بخش نگار پلاس | **Weekly challenge + Author of the month** — Negar Plus feature |
| **رگه نویسندگی** — شمارش روزهای پیاپی نوشتن | **Writing streak** — track consecutive writing days |
| **دنبال کردن نویسنده‌ها** | **Follow authors** |
| **کنترل دسترسی** — ویرایش/حذف فقط برای نویسنده مقاله | **Access control** — edit/delete only for the article's author |
| **پیش‌نویس خودکار** — بازیابی متن ناتمام بعد از رفرش | **Auto-draft** — restore unfinished text after refresh |
| **کاملاً واکنش‌گرا** — موبایل، تبلت، لپ‌تاپ و مانیتور (۵ بریک‌پوینت) | **Fully responsive** — mobile, tablet, laptop, desktop (5 breakpoints) |

---

## 🚀 راه‌اندازی — Getting Started

```bash
# ۱. کامپایل CSS (بعد از هر تغییر در SCSS)
# 1. Build the CSS (after any SCSS change)
npm run build:css

# ۲. اجرای سرور محلی
# 2. Run a local server
python -m http.server 9000
# یا در ویندوز / or on Windows: دابل‌کلیک روی start-negar.bat

# ۳. باز کردن در مرورگر
# 3. Open in your browser
http://localhost:9000
```

### ⭐ کلون از گیت‌هاب — Clone from GitHub

```bash
# ۱. کلون / 1. Clone
git clone https://github.com/Yasinkhalili1/negar.git
cd negar

# ۲. نصب وابستگی‌ها (یک بار) / 2. Install deps (once)
npm install

# ۳. اجرا / 3. Run
python -m http.server 9000
# یا با PHP / or with PHP:  npm start

# ۴. باز کردن / 4. Open
http://localhost:9000
```

---

## 🗂 ساختار پروژه — Project Structure

```
negar/
├── index.html              # صفحه اصلی SPA — the SPA shell
├── start-negar.bat         # راه‌انداز ویندوز — Windows launcher
├── package.json            # اسکریپت‌های npm — npm scripts
├── assets/
│   ├── css/main.css        # خروجی کامپایل‌شده Sass — compiled Sass output
│   └── js/
│       ├── app.js          # منطق اصلی برنامه (کلاس‌های OOP) — core app logic (OOP classes)
│       └── community.js    # چالش، رگه، دنبال‌کردن، نگار پلاس — challenge, streak, follows, Plus
├── scss/
│   ├── base/               # متغیرها و توکن‌های تم — design tokens & theme variables
│   ├── components/         # نوبار، کارت‌ها، ادیتور... — navbar, cards, editor...
│   ├── layouts/            # فوتر، گرید — footer, grid
│   └── utilities/          # میکسین‌های واکنش‌گرا — responsive mixins
└── public/
    ├── image/              # لوگو — logo
    └── svg/                # آیکون‌ها — icons
```

---

## 🧠 معماری — Architecture

**فارسی**
- **معماری شیءگرا** — کلاس‌های کوچک (`Article`, `AuthManager`, `FeedRenderer`, `EditorManager`, `CommentStore`, `Community` و...) هرکدام با یک مسئولیت مشخص
- **localStorage** — مقالات، کاربران، لایک‌ها، ذخیره‌ها، نظرات و تم همگی در مرورگر ذخیره می‌شوند
- **Sass → CSS** — استایل‌ها به‌صورت ماژولار در SCSS نوشته شده و با `npm run build:css` کامپایل می‌شوند
- **تم‌محور** — رنگ‌ها به‌جای مقادیر ثابت، از توکن‌های تم (`var(--lapis)`, `var(--gold)`) می‌آیند تا حالت روشن و تاریک هر دو درست کار کنند

**English**
- **OOP architecture** — small single-purpose classes (`Article`, `AuthManager`, `FeedRenderer`, `EditorManager`, `CommentStore`, `Community`, ...)
- **localStorage** — articles, users, likes, saves, comments, and theme all persist in the browser
- **Sass → CSS** — modular SCSS compiled with `npm run build:css`
- **Theme-driven colors** — styles use theme tokens (`var(--lapis)`, `var(--gold)`) instead of hardcoded values, so light and dark modes both render correctly

---

## 🛠 تکنولوژی‌ها — Tech Stack

| فارسی | English |
|---|---|
| جاوااسکریپت خالص (ES6+) — بدون فریمورک | Vanilla JavaScript (ES6+) — no framework |
| Sass / SCSS | Sass / SCSS |
| آیکون‌های Font Awesome | Font Awesome icons |
| فونت فارسی وزیرمتن | Vazirmatn Persian font |

---

## 📄 مجوز — License

این پروژه برای استفاده آموزشی ساخته شده است.
This project was built for educational purposes.
