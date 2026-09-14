# نگار (Negar) — پلتفرم وبلاگ فارسی

سایت مقاله‌نویسی شبیه ویرگول — PHP + SQLite + Bootstrap 5 + Sass.

## راه‌اندازی سریع

```
دابل‌کلیک روی start-negar.bat
→ مرورگر باز می‌شود: http://127.0.0.1:9000
```

یا دستی:
```bash
npm run start        # سرور PHP روی پورت 9000
```

حساب آزمایشی: `yasin` / `admin123`

## ساختار پروژه

| مسیر | توضیح |
|---|---|
| `index.html` | فرانت‌اند (تمام صفحات SPA) |
| `index.php` | بک‌اند API + سرو فایل استاتیک |
| `negar.sqlite` | دیتابیس (خودکار ساخته می‌شود) |
| `scss/_variables.scss` | متغیرها و میکسین‌های تم نگار |
| `scss/main.scss` | استایل اصلی (Bootstrap + تم سفارشی) |
| `assets/css/main.css` | خروجی کامپایل‌شده Sass |
| `sessions/` | فایل‌های نشست PHP |

## کار با Sass

```bash
npm install          # فقط بار اول
npm run build:css    # کامپایل یک‌باره scss → css
npm run watch:css    # حالت نظارت خودکار هنگام طراحی
```

ساختار Sass:
- `_variables.scss` — رنگ برند، میکسین (`@include card-surface`, `gradient-brand`, `respond(md)`)
- Bootstrap به‌صورت انتخابی import شده (فقط type/buttons/forms/grid/utilities)
- تم روشن/تاریک با CSS Variables (`--paper`, `--ink`, ...)

## نکته‌های مهم

- **پورت ۸۰۰۰ ویندوز رزرو شده** — از ۹۰۰۰ استفاده می‌کنیم.
- کلاس‌های اختصاصی پسوند `-negar` دارند تا با Bootstrap تداخل نکنند (`card-negar`, `btn-negar`).
- بعد از تغییر SCSS حتماً `npm run build:css` بزن ( یا watch رو روشن نگه دار).
a