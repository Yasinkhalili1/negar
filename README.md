# نگار (Negar) — پلتفرم وبلاگ فارسی

> A lightweight Persian blogging platform that runs entirely in the browser.

پلتفرم وبلاگ‌نویسی فارسی، سبک و سریع، که **بدون سرور** در مرورگر اجرا می‌شود.
مقالات، کاربران و نظرات همگی در `localStorage` ذخیره می‌شوند — نیازی به دیتابیس نیست.

---

## ✨ امکانات / Features

### فارسی
- **راست‌چین و فارسی‌محور** — چیدمان کامل RTL با اعداد فارسی
- **ویرایشگر مارک‌داون** — پیش‌نمایش زنده، تولبار و شورت‌کات صفحه‌کلید (Ctrl+B / Ctrl+I / Ctrl+K)
- **حالت تاریک** — تم نئونی و مدرن، با یک کلیک قابل تغییر
- **حساب کاربری** — ثبت‌نام، ورود و صفحه پروفایل با عکس آواتار
- **داشبورد نویسنده** — نمودار بازدید/لایک و آمار کامل مقالات
- **ذخیره و لایک** — بوکمارک مقاله‌های موردعلاقه، مختص هر کاربر
- **کامنت و پاسخ** — گفتگو با سایر خوانندگان
- **اعلان‌ها** — اطلاع از اتفاقات جدید
- **کاملاً واکنش‌گرا** — موبایل، تبلت و دسکتاپ

### English
- **RTL & Persian-first** — full right-to-left layout with Persian digits
- **Markdown editor** — live preview, toolbar, keyboard shortcuts (Ctrl+B / Ctrl+I / Ctrl+K)
- **Dark mode** — sleek neon theme, toggle anytime
- **User accounts** — register, login, profile page with avatar
- **Dashboard** — article stats with a views/likes chart
- **Save & Like** — bookmark articles, per-user storage
- **Comments & replies** — engage with other readers
- **Notifications** — see what's new at a glance
- **Fully responsive** — mobile, tablet, and desktop

---

## 🚀 راه‌اندازی / Getting Started

### فارسی
```bash
# ۱. کامپایل CSS (بعد از هر تغییر در SCSS)
npm run build:css

# ۲. اجرای سرور محلی
python -m http.server 9000
# یا در ویندوز: دابل‌کلیک روی start-negar.bat

# ۳. باز کردن در مرورگر
http://localhost:9000
```

### ⭐ اجرا از گیت‌هاب (برای استاد)
```bash
# ۱. کلون کردن پروژه
git clone https://github.com/Yasinkhalili1/negar.git
cd negar

# ۲. نصب وابستگی‌ها (یک بار)
npm install

# ۳. اجرا
python -m http.server 9000
# یا با PHP:  npm start

# ۴. باز کردن
http://localhost:9000
```

### English
```bash
# 1. Build the CSS (once, after changing SCSS files)
npm run build:css

# 2. Run a local server
python -m http.server 9000
# or double-click start-negar.bat (Windows)

# 3. Open in your browser
http://localhost:9000
```

---

## 🗂 ساختار پروژه / Project Structure

```
negar/
├── index.html              # صفحه اصلی SPA
├── start-negar.bat         # راه‌انداز ویندوز
├── package.json            # اسکریپت‌های npm
├── assets/
│   ├── css/main.css        # خروجی کامپایل‌شده Sass
│   └── js/app.js           # تمام منطق برنامه (کلاس‌های OOP)
├── scss/
│   ├── base/               # متغیرها و توکن‌های تم
│   ├── components/         # نوبار، کارت‌ها، ادیتور...
│   ├── layouts/            # فوتر، گرید
│   └── utilities/          # میکسین‌های واکنش‌گرا
└── public/
    ├── image/              # لوگو
    └── svg/                # آیکون‌ها
```

---

## 🧠 معماری / Architecture

### فارسی
- **معماری شیءگرا** — ۱۰ کلاس کوچک (`Article`, `AuthManager`, `FeedRenderer`, `EditorManager`, `CommentStore` و...) هرکدام با یک مسئولیت مشخص
- **localStorage** — مقالات، کاربران، لایک‌ها، ذخیره‌ها، نظرات و تم همگی در مرورگر ذخیره می‌شوند
- **Sass → CSS** — استایل‌ها به‌صورت ماژولار در SCSS نوشته شده و با `npm run build:css` کامپایل می‌شوند

### English
- **OOP architecture** — 10 small classes (Article, AuthManager, FeedRenderer, EditorManager, CommentStore...) each with one clear job
- **localStorage** — articles, users, likes, saves, comments, and theme all persist in the browser
- **Sass → CSS** — modular SCSS compiled with `npm run build:css`

---

## 🛠 تکنولوژی‌ها / Tech Stack

- Vanilla JavaScript (ES6+) — بدون فریمورک
- Sass / SCSS
- Font Awesome icons
- Vazirmatn Persian font