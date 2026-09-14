/**
 * ═══════════════════════════════════════════════════
 *  نگار — اپلیکیشن اصلی وبلاگ فارسی
 *  version: 2.0
 *  dependencies: Font Awesome, Vazirmatn font
 *  storage: localStorage برای ذخیره داده‌ها
 * ═══════════════════════════════════════════════════
 */

"use strict";

// ─────────────────────────────────────────────────
//  ثابت‌ها (Constants) — مقدارهایی که در جاهای مختلف استفاده میشن
// ─────────────────────────────────────────────────

/** کلیدهای ذخیره‌سازی در localStorage */
const STORAGE = {
  USER: "negar_user",
  ARTICLES: "negar_articles_v1",
  SAVED: "negar_saved",
  LIKED: "negar_liked",
  COMMENTS: "negar_comments_v1",
  NOTIFS: "negar_notifications",
  THEME: "negarTheme",
};

/** هر چند کلمه یک دقیقه مطالعه حساب میشه */
const WORDS_PER_MINUTE = 200;

/** مدت نمایش toast (میلی‌ثانیه) */
const TOAST_DURATION = 2600;

/** آستانه نشان‌های نویسنده بر اساس تعداد بازدید */
const BADGE = { GOLD: 5000, SILVER: 2500 };

/** نقشه رنگ تگ‌ها */
const TAG_COLORS = {
  تکنولوژی: "t-tech",
  ادبیات: "t-lit",
  "سبک زندگی": "t-life",
  کسب‌وکار: "t-biz",
  سلامت: "t-health",
  هنر: "t-art",
};

/** برگرداندن آیکون FA برای یک دسته (پیش‌فرض: feather) */

// ═══════════════════════════════════════════════════
//  ۱) Toast — سیستم اعلان کوتاه‌مدت
// ═══════════════════════════════════════════════════

/** کلاس Toast — نمایش پیام کوتاه به کاربر */
class Toast {
  /**
   * @param {string} selector — CSS سلکتور المان toast
   */
  constructor(selector) {
    this.el = document.querySelector(selector);
  }
  /**
   * نمایش پیام به مدت TOAST_DURATION میلی‌ثانیه
   * @param {string} msg — متن پیام
   */
  show(msg) {
    this.el.textContent = msg;
    this.el.classList.add("show");
    clearTimeout(this._timer);
    this._timer = setTimeout(
      () => this.el.classList.remove("show"),
      TOAST_DURATION,
    );
  }
}

// ═══════════════════════════════════════════════════
//  ۲) Article — مدل داده مقاله
// ═══════════════════════════════════════════════════

/** کلاس Article — نمایش یک مقاله با تمام ویژگی‌ها */
class Article {
  /**
   * @param {Object} data - اطلاعات مقاله
   * @param {number} data.id - شناسه یکتا
   * @param {string} data.tag - دسته‌بندی مقاله
   * @param {string} data.title - عنوان مقاله
   * @param {string} data.body - متن مقاله (Markdown)
   * @param {string} data.author - نام نویسنده
   * @param {number} [data.reads=0] - تعداد بازدید
   * @param {number} [data.likes=0] - تعداد لایک
   * @param {string} [data.emoji=''] - ایموجی مقاله (خالی)
   * @param {string} [data.date=null] - تاریخ ایجاد
   * @param {string} [data.cover=null] - آدرس تصویر کاور
   */
  constructor({
    id,
    tag,
    title,
    body,
    author,
    reads = 0,
    likes = 0,
    emoji = "",
    date = null,
    cover = null,
  }) {
    Object.assign(this, {
      id,
      tag,
      title,
      body,
      author,
      reads,
      likes,
      emoji,
      date: date || new Date().toISOString(),
      cover,
    });
  }
  /** تبدیل تاریخ میلادی به شمسی فارسی */
  getDateLabel() {
    try {
      const d = new Date(this.date);
      return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  }
  /** محاسبه زمان مطالعه بر اساس تعداد کلمات */
  readingTime() {
    const words = this.body.replace(/[#>*\-]/g, "").split(/\s+/).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  }
  /** تولید خلاصه مقاله حداکثر len کاراکتر */
  excerpt(len = 120) {
    return (
      this.body
        .replace(/[#>*\-]/g, "")
        .trim()
        .slice(0, len) + "…"
    );
  }
  /** اضافه شدن یک لایک به مقاله */
  like() {
    this.likes++;
  }
  /** بررسی اینکه آیا کاربر جاری مقاله رو لایک کرده یا نه */
  isLikedByMe() {
    try {
      // مستقیم از localStorage می‌خونیم — بدون وابستگی به window.app
      let key = "negar_liked_guest";
      const raw = localStorage.getItem(STORAGE.USER);
      if (raw) {
        const u = JSON.parse(raw);
        key = "negar_liked_" + (u.username || u.display_name || "guest");
      }
      const liked = JSON.parse(localStorage.getItem(key)) || [];
      return liked.includes(this.id);
    } catch (e) {
      return false;
    }
  }
  isSavedByMe() {
    try {
      let key = "negar_saved_guest";
      const raw = localStorage.getItem(STORAGE.USER);
      if (raw) {
        const u = JSON.parse(raw);
        key = "negar_saved_" + (u.username || u.display_name || "guest");
      }
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      return saved.includes(this.id);
    } catch (e) {
      return false;
    }
  }
  /** بازدید یک مقاله — شمارنده یکی زیاد میشه */
  view() {
    this.reads++;
  }
  /** برگرداندن کلاس CSS متناسب با دسته‌بندی مقاله */
  tagColor() {
    return TAG_COLORS[this.tag] || "";
  }
  /** برگرداندن نشان (مدال) بر اساس تعداد بازدید */
  badge() {
    if (this.reads >= BADGE.GOLD)
      return { icon: "fa-medal", color: "gold", label: "طلایی" };
    if (this.reads >= BADGE.SILVER)
      return { icon: "fa-medal", color: "silver", label: "نقره‌ای" };
    return { icon: "fa-medal", color: "bronze", label: "برنزی" };
  }
  /** تولید HTML کارت مقاله برای نمایش در لیست */
  toCard() {
    const tagClass = this.tagColor();
    const coverHtml = this.cover
      ? `<div class="cover"><img src="${this.cover}" alt="${esc(this.title)}" /></div>`
      : `<div class="cover"><span class="cover-tag">${esc(this.tag)}</span></div>`;
    return `<article class="card-negar" data-action="open-article" data-id="${this.id}">
      ${coverHtml}
      <div class="body">
        <span class="tag ${tagClass}">${esc(this.tag)}</span>
        <h3>${esc(this.title)}</h3>
        <p class="excerpt">${esc(this.excerpt())}</p>
        <div class="meta">
          <span class="author" data-action="open-author"><span class="a-ava">${esc(this.author[0])}</span>${esc(this.author)}</span>
          <span class="sep"></span><span><i class="fa-regular fa-eye"></i> ${this.reads.toLocaleString("fa-IR")}</span>
          <span class="sep"></span><span>${this.isLikedByMe() ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'} ${this.likes}</span>
          <span class="sep"></span><span><i class="fa-regular fa-clock"></i> ${this.readingTime()} دقیقه</span>
          ${this.date ? `<span class="sep"></span><span><i class="fa-regular fa-calendar"></i> ${this.getDateLabel()}</span>` : ""}
        </div>
      </div></article>`;
  }
  /**
   * بررسی دسترسی ویرایش/حذف — فقط نویسنده مقاله یا ادمین می‌تونه
   * @returns {boolean}
   */
  canManage() {
    const app = window.app;
    if (!app || !app.auth || !app.auth.isLoggedIn()) return false;
    const u = app.auth.user;
    // ادمین یا نویسنده
    return u.username === "admin" || u.display_name === this.author;
  }

  /** تولید HTML کامل مقاله برای صفحه خواندن */
  toFull() {
    const manage = this.canManage()
      ? `<button class="btn-negar btn-ghost-negar" data-action="edit" data-id="${this.id}"> <i class="fa-solid fa-pen-to-square"></i> ویرایش</button>
         <button class="btn-negar btn-danger-negar" data-action="delete" data-id="${this.id}"> <i class="fa-solid fa-trash"></i> حذف</button>`
      : "";
    return `<span class="a-tag">${esc(this.tag)}</span>
      <h1>${esc(this.title)}</h1>
      <div class="a-meta">
        <span class="a-ava">${esc(this.author[0])}</span>
        <div>
          <div class="who">${esc(this.author)}</div>
          <div> ${this.reads.toLocaleString("fa-IR")} · <i class="fa-solid fa-heart"></i> ${this.likes} · <i class="fa-solid fa-hourglass-start"></i> ${this.readingTime()} دقیقه${this.date ? ` · <i class="fa-regular fa-calendar-days"></i> ${this.getDateLabel()}` : ""}</div>
        </div>
      </div>
      <div class="a-cover">${this.cover ? `<img src="${this.cover}" alt="${esc(this.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />` : `<span class="cover-tag">${esc(this.tag)}</span>`}</div>
      ${mdToHtml(this.body)}
      <div class="a-actions">
        <button class="btn-negar btn-gold-negar" data-action="like" data-id="${this.id}">${this.isLikedByMe() ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'} ${this.likes}</button>
        <button class="btn-negar btn-ghost-negar" data-action="save" data-id="${this.id}">${this.isSavedByMe() ? '<i class="fa-solid fa-bookmark"></i> ذخیره شده' : '<i class="fa-regular fa-bookmark"></i> ذخیره'}</button>
        <button class="btn-negar btn-ghost-negar" data-action="share"><i class="fa-solid fa-share-nodes"></i> اشتراک</button>
        ${manage}
      </div>
      <div class="comments-section">
        <h2 class="comments-title"> نظرات (<span id="commentCount">0</span>)</h2>
        <div id="commentList"></div>
        <div class="comment-form">
          <textarea id="commentInput" placeholder="نظرت رو بنویس..." rows="3"></textarea>
          <button class="btn-negar btn-primary-negar" data-action="post-comment">ارسال</button>
        </div>
      </div>`;
  }
}

// ═══════════════════════════════════════════════════
//  ۳) AuthManager — مدیریت احراز هویت کاربر
// ═══════════════════════════════════════════════════

/** کلاس AuthManager — ورود، ثبت‌نام، خروج و نمایش آواتار کاربر */
class AuthManager {
  /**
   * @param {Toast} toast — نمونه Toast برای نمایش پیام
   */
  constructor(toast) {
    this.toast = toast;
    this.user = this._load();
    this.mode = "login"; // حالت فعلی مودال: login یا register
    this.modal = document.getElementById("authModal");
    this.area = document.getElementById("authArea");
    this._bindEvents();
    this.renderArea();
  }
  /** خواندن اطلاعات کاربر از localStorage */
  _load() {
    try {
      // ── پاکسازی یک‌بار مصرف کاربران قبلی (دستور کاربر) ──
      // فقط این یک بار اجرا میشه؛ بعدش فلگ گذاشته میشه که دیگه پاک نکنه
      try {
        if (!localStorage.getItem("negar_ver")) {
          localStorage.removeItem("negar_users");
          localStorage.removeItem(STORAGE.USER);
          localStorage.setItem("negar_ver", "2");
          return null;
        }
      } catch (e) {
        /* ignore */
      }
      const saved = JSON.parse(localStorage.getItem(STORAGE.USER));
      return saved || null;
    } catch (e) {
      return null;
    }
  }
  /** ذخیره اطلاعات کاربر در localStorage */
  _save() {
    try {
      localStorage.setItem(STORAGE.USER, JSON.stringify(this.user));
    } catch (e) {}
  }
  /** ثبت event listenerها برای بستن مودال */
  _bindEvents() {
    this.modal.addEventListener("click", (e) => {
      if (e.target.id === "authModal") this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
    // نمایش/مخفی کردن رمز عبور
    const toggle = document.getElementById("passToggle");
    const passInput = document.getElementById("inpPass");
    if (toggle && passInput) {
      toggle.addEventListener("click", () => {
        const show = passInput.type === "password";
        passInput.type = show ? "text" : "password";
        toggle.innerHTML = show
          ? '<i class="fa-solid fa-eye-slash"></i>'
          : '<i class="fa-solid fa-eye"></i>';
      });
    }
  }
  /** باز کردن مودال ورود/ثبت‌نام */
  open(mode = "login") {
    this._switchTab(mode);
    // خالی کردن فیلدها — جلوی autofill یا اسم قبلی رو می‌گیره
    ["inpUser", "inpPass", "inpName"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    this.modal.classList.add("open");
  }
  /** بستن مودال احراز هویت */
  close() {
    this.modal.classList.remove("open");
    document.getElementById("authError").textContent = "";
  }
  /** ارسال فرم ورود/ثبت‌نام */
  submit() {
    const user = document.getElementById("inpUser").value.trim();
    const pass = document.getElementById("inpPass").value;
    const name = document.getElementById("inpName").value.trim() || user;
    if (!user || !pass) {
      document.getElementById("authError").textContent = "فیلدها رو پر کن";
      return;
    }
    // ── قوانین نام کاربری: حروف انگلیسی + عدد (ولی حداقل یک حرف، فقط عدد نباشه) ──
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(user) || !/[a-zA-Z]/.test(user)) {
      document.getElementById("authError").textContent =
        "نام کاربری باید حداقل یک حرف انگلیسی داشته باشه (۳ تا ۲۰ کاراکتر)";
      return;
    }
    // ── قوانین پسورد: حداقل ۸ کاراکتر + حرف کوچک + حرف بزرگ + عدد ──
    const passOk =
      /[a-z]/.test(pass) &&
      /[A-Z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      pass.length >= 8;
    if (!passOk) {
      document.getElementById("authError").textContent =
        "پسورد باید حداقل ۸ کاراکتر با حرف کوچک، حرف بزرگ و عدد باشه";
      return;
    }
    // ── خواندن لیست کاربران ثبت‌شده ──
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem("negar_users")) || [];
    } catch (e) {
      /* ignore */
    }

    if (this.mode === "register") {
      // ── ثبت‌نام جدید ──
      if (users.find((u) => u.username === user)) {
        document.getElementById("authError").textContent =
          "این نام کاربری قبلاً ثبت شده";
        return;
      }
      this.user = {
        id: Date.now(),
        username: user,
        display_name: name,
        bio: "",
        joined: new Date().toISOString(),
        pass: pass,
      };
      users.push(this.user);
      localStorage.setItem("negar_users", JSON.stringify(users));
      this._save();
      this.toast.show("ثبت‌نام انجام شد، خوش آمدی " + name + "!");
    } else {
      // ── ورود: فقط کاربران ثبت‌نام‌شده ──
      const existing = users.find((u) => u.username === user);
      if (!existing) {
        document.getElementById("authError").textContent =
          "این نام کاربری ثبت نشده. اول ثبت‌نام کن";
        return;
      }
      if (existing.pass !== pass) {
        document.getElementById("authError").textContent = "پسورد اشتباهه";
        return;
      }
      this.user = {
        id: existing.id,
        username: existing.username,
        display_name: existing.display_name,
        bio: existing.bio || "",
        joined: existing.joined,
        avatar: existing.avatar || "",
        pass: existing.pass,
      };
      this._save();
      this.toast.show("خوش آمدی " + existing.display_name + "!");
    }
    this.close();
    // رفرش ذخیره‌ها و لایک‌های کاربر جدید
    if (window.app && window.app.saves) {
      window.app.saves.reload();
      window.app.likes.reload();
      window.app._render();
    }
    this.renderArea();
  }
  /** خروج کاربر از حساب */
  logout() {
    this.user = null;
    try {
      localStorage.removeItem(STORAGE.USER);
    } catch (e) {}
    // رفرش ذخیره‌ها و لایک‌ها به حالت مهمان
    if (window.app && window.app.saves) {
      window.app.saves.reload();
      window.app.likes.reload();
      window.app._render();
    }
    this.renderArea();
    this.toast.show("خارج شدی");
  }
  isLoggedIn() {
    return !!this.user;
  }
  renderArea() {
    // desktop auth area
    if (this.user) {
      const avatarHtml = this.user.avatar
        ? `<img src="${this.user.avatar}" alt="" class="nav-avatar-img" />`
        : `${esc(this.user.display_name.charAt(0))}`;
      this.area.innerHTML = `
                  <span class="user-chip">
                    <span class="avatar">${avatarHtml}</span>${esc(this.user.display_name)}
                    <span class="account-menu-wrap">
                      <button class="icon-btn" style="width:28px;height:28px;border:none;flex-shrink:0" data-action="toggle-account-menu" title="حساب کاربری"><i class="fa-solid fa-gear"></i></button>
                      <div class="account-menu" id="accountMenu">
                        <button class="account-item" data-action="go-dashboard"><i class="fa-solid fa-sliders"></i> داشبورد</button>
                        <button class="account-item" data-action="open-profile"><i class="fa-solid fa-user-pen"></i> ویرایش پروفایل</button>
                        <button class="account-item danger" data-action="logout"><i class="fa-solid fa-right-from-bracket"></i> خروج</button>
                      </div>
                    </span>
                  </span>`;
    } else {
      this.area.innerHTML = `<button class="btn-negar btn-ghost-negar" data-action="open-login">ورود</button>`;
    }
    // mobile auth area
    const marea = document.getElementById("mobileAuthArea");
    if (marea) {
      if (this.user) {
        marea.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--paper-2);border-radius:12px">
          <span class="avatar">${esc(this.user.display_name.charAt(0))}</span>
          <b>${esc(this.user.display_name)}</b>
          <button class="btn-negar btn-danger-negar" style="margin-right:auto" data-action="logout">خروج</button></div>`;
      } else {
        marea.innerHTML = `<button class="btn-negar btn-ghost-negar" data-action="open-login" style="width:100%;justify-content:center">ورود</button>`;
      }
    }
  }
  _switchTab(mode) {
    this.mode = mode;
    document
      .getElementById("tabLogin")
      .classList.toggle("on", mode === "login");
    document
      .getElementById("tabRegister")
      .classList.toggle("on", mode === "register");
    document.getElementById("fieldName").style.display =
      mode === "register" ? "block" : "none";
    document.getElementById("authSubmit").textContent =
      mode === "login" ? "ورود" : "ساخت حساب";
    document.getElementById("authError").textContent = "";
  }
}

// ===== Feed Renderer =====
class FeedRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  render(articles, hasMore = false) {
    let html = articles.map((a) => a.toCard()).join("");
    if (hasMore)
      html += '<div class="spinner-wrap"><div class="spinner"></div></div>';
    this.container.innerHTML = html;
  }
  renderTrending(articles, selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const top5 = [...articles].sort((a, b) => b.reads - a.reads).slice(0, 5);
    el.innerHTML = top5
      .map(
        (a, i) =>
          `<div class="trend" data-id="${a.id}"><span class="num">${i + 1}</span><div><div class="t-title">${esc(a.title)}</div><div class="t-meta">${esc(a.author)} · <i class="fa-regular fa-eye"></i> ${a.reads.toLocaleString("fa-IR")}</div></div></div>`,
      )
      .join("");
  }
}

// ===== Editor Manager =====
class EditorManager {
  constructor(toast) {
    this.toast = toast;
  }
  open() {
    document.getElementById("artTitle").value = "";
    document.getElementById("artBody").value = "";
  }
  load(article) {
    document.getElementById("artTitle").value = article.title;
    document.getElementById("artBody").value = article.body;
    document.getElementById("artTag").value = article.tag;
  }
  getData() {
    return {
      title: document.getElementById("artTitle").value.trim(),
      body: document.getElementById("artBody").value.trim(),
      tag: document.getElementById("artTag").value,
    };
  }
  insertAround(pre, post) {
    const ta = document.getElementById("artBody");
    const s = ta.selectionStart,
      e = ta.selectionEnd;
    ta.value =
      ta.value.slice(0, s) +
      pre +
      ta.value.slice(s, e) +
      post +
      ta.value.slice(e);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = e + pre.length + post.length;
    ta.dispatchEvent(new Event("input"));
  }
  insertAtCursor(txt) {
    const ta = document.getElementById("artBody");
    const s = ta.selectionStart;
    ta.value = ta.value.slice(0, s) + txt + ta.value.slice(ta.selectionEnd);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = s + txt.length;
    ta.dispatchEvent(new Event("input"));
  }
}

// ===== Markdown Parser =====
function mdToHtml(src) {
  const lines = esc(src).split(/\r?\n/);
  let html = "",
    para = [];
  const flush = () => {
    if (para.length) {
      html += "<p>" + para.join("<br>") + "</p>";
      para = [];
    }
  };
  for (const ln of lines) {
    if (/^##\s/.test(ln)) {
      flush();
      html += "<h2>" + ln.slice(3) + "</h2>";
    } else if (/^>\s?/.test(ln)) {
      flush();
      html += "<blockquote>" + ln.replace(/^>\s?/, "") + "</blockquote>";
    } else if (/^\s*---\s*$/.test(ln)) flush();
    else if (ln.trim() === "") flush();
    else
      para.push(
        ln
          .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
          .replace(/\*(.+?)\*/g, "<i>$1</i>"),
      );
  }
  flush();
  return html || "<p>—</p>";
}

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// ===== Main App =====
class SaveManager {
  constructor() {
    this.key = "negar_saved";
    this.saved = this._load();
  }
  // کلید بر اساس کاربر — مستقیم از localStorage می‌خونه
  _userKey() {
    try {
      const raw = localStorage.getItem(STORAGE.USER);
      if (raw) {
        const u = JSON.parse(raw);
        return "negar_saved_" + (u.username || u.display_name || "guest");
      }
    } catch (e) {}
    return "negar_saved_guest";
  }
  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._userKey())) || [];
    } catch (e) {
      return [];
    }
  }
  _save() {
    try {
      localStorage.setItem(this._userKey(), JSON.stringify(this.saved));
    } catch (e) {}
  }
  // بعد از لاگین/خروج، لیست رو رفرش کن
  reload() {
    this.saved = this._load();
  }
  toggle(id) {
    const idx = this.saved.indexOf(id);
    if (idx >= 0) {
      this.saved.splice(idx, 1);
      this._save();
      return false;
    }
    this.saved.push(id);
    this._save();
    return true;
  }
  isSaved(id) {
    return this.saved.includes(id);
  }
  getAll() {
    return this.saved;
  }
}

// ===== Like Manager (per-user) =====
class LikeManager {
  constructor() {
    this.saved = this._load();
  }
  _userKey() {
    try {
      const raw = localStorage.getItem(STORAGE.USER);
      if (raw) {
        const u = JSON.parse(raw);
        return "negar_liked_" + (u.username || u.display_name || "guest");
      }
    } catch (e) {}
    return "negar_liked_guest";
  }
  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._userKey())) || [];
    } catch (e) {
      return [];
    }
  }
  _save() {
    try {
      localStorage.setItem(this._userKey(), JSON.stringify(this.saved));
    } catch (e) {}
  }
  reload() {
    this.saved = this._load();
  }
  toggle(id) {
    const idx = this.saved.indexOf(id);
    if (idx >= 0) {
      this.saved.splice(idx, 1);
      this._save();
      return false;
    }
    this.saved.push(id);
    this._save();
    return true;
  }
  has(id) {
    return this.saved.includes(id);
  }
}

class CommentStore {
  constructor() {
    this.key = "negar_comments_v1";
    this.data = this._load();
  }
  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || {};
    } catch (e) {
      return {};
    }
  }
  _save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {
      /* ignore */
    }
  }
  get(articleId) {
    return this.data[articleId] || [];
  }
  add(articleId, author, body, replyTo = null) {
    if (!this.data[articleId]) this.data[articleId] = [];
    this.data[articleId].unshift({
      id: Date.now(),
      author,
      body,
      replyTo,
      time: new Date().toLocaleDateString("fa-IR", {
        month: "long",
        day: "numeric",
      }),
    });
    this._save();
  }
  count(articleId) {
    return (this.data[articleId] || []).length;
  }
  render(articleId, containerId) {
    const list = this.get(articleId);
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = list.length
      ? list
          .map(
            (c) =>
              '<div class="comment-item">' +
              '<div class="comment-avatar-wrap"><span class="avatar" style="width:32px;height:32px;font-size:.8rem">' +
              esc(c.author[0]) +
              "</span></div>" +
              '<div class="comment-main">' +
              '<div class="comment-head"><b>' +
              esc(c.author) +
              '</b><span class="comment-time">' +
              esc(c.time) +
              "</span></div>" +
              (c.replyTo
                ? '<div class="comment-replyto">در پاسخ به ' +
                  esc(c.replyTo) +
                  "</div>"
                : "") +
              '<p class="comment-body">' +
              esc(c.body) +
              "</p>" +
              '<button class="comment-reply-btn" data-reply-to="' +
              esc(c.author) +
              '" data-comment-id="' +
              c.id +
              '">پاسخ</button>' +
              "</div></div>",
          )
          .join("")
      : '<p style="text-align:center;color:var(--muted);padding:20px 0">هنوز نظری نیست. اولین نفر باش!</p>';
  }
}

// ===== Notification Manager =====
class NotificationManager {
  constructor() {
    this.key = "negar_notifications";
    this.panel = document.getElementById("notifPanel");
    this.list = document.getElementById("notifList");
    this.badge = document.getElementById("notifBadge");
    this.items = this._load();
    this._render();
  }
  _load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (e) {
      return [];
    }
  }
  _save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.items));
    } catch (e) {}
  }
  add(icon, html) {
    this.items.unshift({
      icon,
      html,
      time: new Date().toLocaleString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    });
    if (this.items.length > 40) this.items.pop();
    this._save();
    this._render();
    this._updateBadge();
  }
  _updateBadge() {
    const unread = this.items.filter((n) => !n.read).length;
    if (this.badge) {
      this.badge.hidden = unread === 0;
      this.badge.textContent = unread > 9 ? "9+" : unread;
    }
  }
  _render() {
    if (!this.list) return;
    if (!this.items.length) {
      this.list.innerHTML = '<div class="notif-empty">هنوز اعلانی نیست</div>';
    } else {
      this.list.innerHTML = this.items
        .map(
          (n, i) =>
            `<div class="notif-item${n.read ? "" : " unread"}" data-idx="${i}">${n.icon} ${n.html}<span class="notif-time">${n.time}</span></div>`,
        )
        .join("");
    }
    this._updateBadge();
  }
  markAllRead() {
    this.items.forEach((n) => (n.read = true));
    this._save();
    this._render();
  }
  toggle() {
    if (!this.panel) return;
    const isOpen = this.panel.classList.toggle("open");
    if (isOpen) {
      this.markAllRead();
      // موقعیت پنل: دقیقاً زیر دکمه اعلان، با محدودیت به لبه‌های صفحه
      const btn = document.querySelector('[data-action="open-notifications"]');
      if (btn) {
        const b = btn.getBoundingClientRect();
        const pw = this.panel.offsetWidth;
        const vw = window.innerWidth;
        // RTL: دکمه سمت چپ صفحه‌ست — پنل رو از راست دکمه تراز کن، ولی از لبه چپ/راست بیرون نزنه
        let left = b.right - pw; // راست دکمه
        left = Math.max(8, Math.min(left, vw - pw - 8));
        this.panel.style.left = left + "px";
        this.panel.style.top = b.bottom + 10 + "px";
        // فلش بالای پنل زیر دکمه
        const arrow = this.panel.querySelector("::before") || this.panel;
        this.panel.style.setProperty(
          "--arrow-x",
          Math.min(pw - 16, Math.max(16, b.left - left + b.width / 2)) + "px",
        );
      }
    }
  }
  clear() {
    this.items = [];
    this._save();
    this._render();
  }
}

class NegarApp {
  constructor() {
    this.toast = new Toast("#toast");
    this.auth = new AuthManager(this.toast);
    this.saves = new SaveManager();
    this.likes = new LikeManager();
    this.comments = new CommentStore();
    this.editor = new EditorManager(this.toast);
    this.notif = new NotificationManager();
    this.feeds = {
      home: new FeedRenderer("homeFeed"),
      explore: new FeedRenderer("exploreFeed"),
      lib: new FeedRenderer("libFeed"),
    };
    this.STORAGE_KEY = "negar_articles_v1";
    this.articles = this._loadArticles();
    if (this.articles.length === 0) {
      this.articles = this._seedArticles();
      this._persistArticles();
    }
    this.nextId = Math.max(0, ...this.articles.map((a) => a.id)) + 1;
    this.PAGE_SIZE = 6;
    this.displayedCount = this.PAGE_SIZE;
    this.currentArticle = null;
    this._bindEvents();
    this._setupInfiniteScroll();
    this._setupBackToTop();
    this._setupReadingProgress();
    this._render();
  }

  _loadArticles() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return arr.map((a) => new Article(a));
    } catch (e) {
      console.warn("خطا در بارگذاری مقالات", e);
      return [];
    }
  }

  _persistArticles() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.articles));
    } catch (e) {
      this.toast.show("ذخیره‌سازی ممکن نشد");
    }
  }

  _seedArticles() {
    return [
      new Article({
        id: 7,
        tag: "تکنولوژی",
        title: "بلاکچین چیست؟",
        body: "فناوری دفتر کل توزیع شده.",
        author: "محمد",
        reads: 3100,
        likes: 41,
      }),
      new Article({
        id: 8,
        tag: "ادبیات",
        title: "شعر معاصر ایران",
        body: "از نیما تا فروغ.",
        author: "لیلا",
        reads: 4500,
        likes: 56,
      }),
      new Article({
        id: 9,
        tag: "سبک زندگی",
        title: "مدیتیشن برای مبتدیان",
        body: "تمرکز روی تنفس.",
        author: "نیما",
        reads: 7200,
        likes: 89,
      }),
      new Article({
        id: 10,
        tag: "کسب‌وکار",
        title: "بازاریابی محتوا",
        body: "محتوای خوب مشتری جذب می‌کند.",
        author: "رضا",
        reads: 2900,
        likes: 33,
      }),
      new Article({
        id: 11,
        tag: "سلامت",
        title: "ورزش صبحگاهی",
        body: "۱۰ حرکت ساده.",
        author: "مریم",
        reads: 5400,
        likes: 62,
      }),
      new Article({
        id: 12,
        tag: "هنر",
        title: "عکاسی با موبایل",
        body: "قانون یک‌سوم.",
        author: "امیر",
        reads: 3800,
        likes: 47,
      }),
      new Article({
        id: 13,
        tag: "تکنولوژی",
        title: "AI در پزشکی",
        body: "تشخیص بیماری با هوش مصنوعی.",
        author: "دکتر راد",
        reads: 6300,
        likes: 74,
      }),
      new Article({
        id: 14,
        tag: "ادبیات",
        title: "داستان‌نویسی خلاق",
        body: "هر داستان با شخصیت شروع می‌شود.",
        author: "زهرا",
        reads: 2100,
        likes: 28,
      }),
      new Article({
        id: 15,
        tag: "سبک زندگی",
        title: "ساده زیستن",
        body: "مالکیت کمتر، آزادی بیشتر.",
        author: "سارا",
        reads: 4800,
        likes: 58,
      }),
      new Article({
        id: 16,
        tag: "کسب‌وکار",
        title: "کارآفرینی از صفر",
        body: "نیاز به جسارت.",
        author: "علی",
        reads: 3600,
        likes: 44,
      }),
      new Article({
        id: 17,
        tag: "سلامت",
        title: "تغذیه سالم",
        body: "سبزیجات، پروتئین، آب.",
        author: "دکتر ناز",
        reads: 5100,
        likes: 67,
      }),
      new Article({
        id: 18,
        tag: "هنر",
        title: "اصول رنگ‌بندی",
        body: "رنگ‌های مکمل و مشابه.",
        author: "نگار",
        reads: 2700,
        likes: 35,
      }),
      new Article({
        id: 19,
        tag: "تکنولوژی",
        title: "خانه‌های هوشمند",
        body: "اینترنت اشیا آینده را می‌سازد.",
        author: "حسین",
        reads: 2400,
        likes: 30,
      }),
      new Article({
        id: 20,
        tag: "ادبیات",
        title: "کتاب‌خوانی عادت کنید",
        body: "هر روز ۲۰ صفحه بخوانید.",
        author: "فاطمه",
        reads: 5600,
        likes: 71,
      }),
      new Article({
        id: 21,
        tag: "سبک زندگی",
        title: "سفر ارزان",
        body: "اسکان رایگان، غذای محلی.",
        author: "کامران",
        reads: 4200,
        likes: 53,
      }),
      new Article({
        id: 22,
        tag: "کسب‌وکار",
        title: "فریلنسری",
        body: "رئیس خودت باش.",
        author: "پریسا",
        reads: 3300,
        likes: 40,
      }),
      new Article({
        id: 23,
        tag: "سلامت",
        title: "خواب سالم",
        body: "۸ ساعت، اتاق تاریک.",
        author: "دکتر شایان",
        reads: 6100,
        likes: 76,
      }),
      new Article({
        id: 24,
        tag: "هنر",
        title: "موسیقی و سلامت روان",
        body: "کاهش استرس با موسیقی.",
        author: "آرمین",
        reads: 3900,
        likes: 48,
      }),
      new Article({
        id: 1,
        tag: "تکنولوژی",
        title: "هوش مصنوعی و آینده‌ی نوشتن",
        body: "در یک دهه‌ی گذشته، هوش مصنوعی از یک رؤیای آزمایشگاهی به همراهی روزمره تبدیل شده است.\n\n## قلمِ انسان\n\nنوشتن تنها انتقال اطلاعات نیست.\n\n> «قلمی که از دل تجربه برآید، هرگز با الگوریتم ساخته نمی‌شود.»",
        author: "یاسین",
        reads: 4200,
        likes: 45,
      }),
      new Article({
        id: 2,
        tag: "ادبیات",
        title: "چرا داستان‌های کوتاه بیشتر خوانده می‌شوند",
        body: "عصر حواس‌پرتی، دشمن رمان‌های هزارصفحه‌ای است.\n\n## هنرِ فشردگی\n\nهر کلمه وزنی دارد.",
        author: "سارا",
        reads: 2800,
        likes: 32,
      }),
      new Article({
        id: 3,
        tag: "سبک زندگی",
        title: "صبح آرام: ۵ عادت برای شروع روز",
        body: "بیشتر ما روز را با هجوم نوتیفیکیشن شروع می‌کنیم.\n\n## قدم اول\n\nیک لیوان آب و دو دقیقه سکوت.",
        author: "مینا",
        reads: 6100,
        likes: 78,
      }),
      new Article({
        id: 4,
        tag: "کسب‌وکار",
        title: "از ایده تا درآمد: ۳ اشتباه استارتاپ‌ها",
        body: "بیشتر استارتاپ‌ها به خاطر فرضیات غلط می‌میرند.\n\n> «مشتریِ فرضی، کیف پولِ واقعی ندارد.»",
        author: "آریا",
        reads: 3500,
        likes: 28,
      }),
      new Article({
        id: 5,
        tag: "سلامت",
        title: "خوابِ عمیق: چرا مغزت تمیزکاری می‌کند",
        body: "سیستم گلیمفاتیک مغز، شب‌ها فعال می‌شود.\n\n## چطور خواب عمیق‌تری داشته باشیم؟\n\nاتاق خنک، نور کم.",
        author: "دکتر کیان",
        reads: 5900,
        likes: 65,
      }),
      new Article({
        id: 6,
        tag: "هنر",
        title: "نگارگری ایرانی: وقتی نقاشی حکمِ شعر دارد",
        body: "در نگارگریِ ایرانی، فضا رؤیایی‌ست.\n\n## هنرِ بی‌منظره\n\nنگارگر فضای سومی می‌سازد.",
        author: "الناز",
        reads: 2200,
        likes: 19,
      }),
    ];
  }

  _setupInfiniteScroll() {
    const sentinel = document.createElement("div");
    sentinel.id = "scrollSentinel";
    sentinel.style.height = "1px";
    document.querySelector("#homeFeed").parentNode.appendChild(sentinel);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) this._loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
  }

  _setupBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    });
  }

  _setupReadingProgress() {
    const bar = document.getElementById("readingBar");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      if (!document.getElementById("article").classList.contains("active")) {
        bar.style.width = "0%";
        return;
      }
      const scrollH =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollH > 0 ? (window.scrollY / scrollH) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + "%";
    });
  }

  _loadMore() {
    const filtered = this._getFiltered();
    if (this.displayedCount >= filtered.length) return;
    this.displayedCount += this.PAGE_SIZE;
    setTimeout(() => this._render(), 1000);
  }

  /** اتصال همه رویدادها (ورود، ناوبری، کارت‌ها، ادیتور، تم) */
  _bindEvents() {
    this._bindGlobalClicks();
    this._bindFilters();
    this._bindSearchSort();
    this._bindPreview();
    this._bindCoverUpload();
  }

  /** کلیک‌های سراسری (delegation روی body) + ناوبری + اکشن‌ها */
  _bindGlobalClicks() {
    document.body.addEventListener("click", (e) => {
      if (this._handleTrendClick(e)) return;
      if (this._handleReplyClick(e)) return;
      if (this._handleAuthorClick(e)) return;
      this._handleActionClick(e);
    });
  }

  /** کلیک روی آیتم‌های پرخواننده‌ترین */
  _handleTrendClick(e) {
    const trend = e.target.closest(".trend");
    if (!trend) return false;
    const tid = parseInt(trend.dataset.id);
    if (tid) this._openArticle(tid);
    return true;
  }

  /** کلیک روی دکمه پاسخ به کامنت */
  _handleReplyClick(e) {
    const replyBtn = e.target.closest(".comment-reply-btn");
    if (!replyBtn) return false;
    this._pendingReply = replyBtn.dataset.replyTo || null;
    const ta = document.getElementById("commentInput");
    if (ta) {
      ta.focus();
      ta.placeholder = "پاسخ به " + (replyBtn.dataset.replyTo || "...") + "...";
    }
    this.toast.show("در حال پاسخ به " + (replyBtn.dataset.replyTo || "") + "");
    return true;
  }

  /** کلیک روی نام نویسنده → صفحه نویسنده */
  _handleAuthorClick(e) {
    const authorEl = e.target.closest('[data-action="open-author"]');
    if (!authorEl) return false;
    const name = authorEl.textContent.trim();
    if (name) this._openAuthor(name);
    return true;
  }

  /** اجرای اکشن‌های data-action (ناوبری، انتشار، لایک و...) */
  _handleActionClick(e) {
    const btn = e.target.closest("[data-action]");
    if (btn && btn.tagName === "A") e.preventDefault();
    const menu = document.getElementById("accountMenu");
    if (btn && btn.dataset.action === "toggle-account-menu") {
      menu && menu.classList.toggle("open");
    } else if (menu) {
      menu.classList.remove("open");
    }
    if (!btn) return;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id);

    switch (action) {
      case "go-home":
        this._go("home");
        break;
      case "go-explore":
        this._go("explore");
        break;
      case "go-editor":
        this._go("editor");
        break;
      case "go-lib":
        this._go("lib");
        this._renderLib();
        break;
      case "go-dashboard":
        this._openDashboard();
        break;
      case "open-profile":
        this._openProfile();
        break;
      case "save-profile":
        this._saveProfile();
        break;
      case "toggle-edit-profile":
        this._toggleEditProfile();
        break;
      case "open-login":
        this.auth.open("login");
        break;
      case "close-auth":
        this.auth.close();
        break;
      case "submit-auth":
        this.auth.submit();
        break;
      case "switch-login":
        this.auth._switchTab("login");
        break;
      case "switch-register":
        this.auth._switchTab("register");
        break;
      case "logout":
        this.auth.logout();
        break;
      case "publish":
        this._publish();
        break;
      case "like":
        this._like(id);
        break;
      case "save":
        this._toggleSave(id);
        break;
      case "share":
        this._shareArticle();
        break;
      case "copy-link":
        this._copyLink();
        break;
      case "edit":
        this._edit(id);
        break;
      case "delete":
        this._delete(id);
        break;
      case "open-article":
        this._openArticle(id);
        break;
      case "go-top":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "toggle-theme":
        this._toggleTheme();
        break;
      case "open-notifications":
        this._openNotifPanel(e);
        break;
      case "clear-notifications":
        this.notif.clear();
        this.toast.show("اعلان‌ها پاک شد");
        break;
      case "post-comment":
        this._postComment();
        break;
      case "insert-h":
        this.editor.insertAround("\n## ", "");
        break;
      case "insert-quote":
        this.editor.insertAround("\n> ", "");
        break;
      case "insert-bold":
        this.editor.insertAround("**", "**");
        break;
      case "insert-italic":
        this.editor.insertAround("*", "*");
        break;
      case "insert-hr":
        this.editor.insertAtCursor("\n\n---\n\n");
        break;
    }
  }

  /** باز کردن پنل اعلان در موقعیت دکمه */
  _openNotifPanel(e) {
    const btn = e.target.closest('[data-action="open-notifications"]');
    const panel = document.getElementById("notifPanel");
    if (btn && panel) {
      const r = btn.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      let left = r.left + r.width / 2 - p.width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - p.width - 8));
      panel.style.left = left + "px";
      panel.style.top = r.bottom + 8 + "px";
    }
    this.notif.toggle();
  }

  /** فیلترهای دسته‌بندی چیپ + سایدبار */
  _bindFilters() {
    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      group.addEventListener("click", (e) => {
        if (!e.target.classList.contains("chip")) return;
        group
          .querySelectorAll(".chip")
          .forEach((c) => c.classList.remove("active"));
        e.target.classList.add("active");
        this._render();
      });
    });
    document.querySelectorAll(".cat-list").forEach((group) => {
      group.addEventListener("click", (e) => {
        const cat = e.target.closest(".cat");
        if (!cat) return;
        const tag = cat.dataset.tag;
        document.querySelectorAll("[data-filter-group]").forEach((g) => {
          g.querySelectorAll(".chip").forEach((c) => {
            c.classList.toggle("active", c.dataset.tag === tag);
          });
        });
        this._render();
      });
    });
  }

  /** جستجو + مرتب‌سازی */
  _bindSearchSort() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput)
      searchInput.addEventListener("input", () => this._render());
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.addEventListener("change", () => this._render());
  }

  /** پیش‌نمایش زنده مارک‌داون */
  _bindPreview() {
    const previewToggle = document.getElementById("previewToggle");
    const editorPreview = document.getElementById("editorPreview");
    const artBody = document.getElementById("artBody");
    if (!previewToggle || !editorPreview || !artBody) return;
    artBody.addEventListener("input", () => {
      if (previewToggle.checked)
        editorPreview.innerHTML = mdToHtml(artBody.value);
    });
    previewToggle.addEventListener("change", () => {
      editorPreview.classList.toggle("open", previewToggle.checked);
      if (previewToggle.checked)
        editorPreview.innerHTML = mdToHtml(artBody.value);
    });
  }

  /** آپلود کاور مقاله */
  _bindCoverUpload() {
    const coverInput = document.getElementById("coverInput");
    const coverPreview = document.getElementById("coverPreview");
    this._coverData = null;
    if (!coverInput || !coverPreview) return;
    coverInput.addEventListener("change", () => {
      const file = coverInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this._coverData = e.target.result;
        coverPreview.innerHTML =
          '<img src="' + e.target.result + '" alt="cover" />';
        coverPreview.classList.add("show");
      };
      reader.readAsDataURL(file);
    });
  }

  _go(view, silent) {
    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.remove("active"));
    const el = document.getElementById(view);
    if (el) el.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // ثبت در تاریخچه مرورگر (برای دکمه‌های عقب/جلو)
    if (!silent && window.location.hash !== "#/" + view) {
      history.pushState({ view }, "", "#/" + view);
    }
  }

  _getFiltered() {
    const q = (document.getElementById("searchInput") || {}).value || "";
    let list = this.articles;
    if (q.trim())
      list = list.filter((a) =>
        (a.title + a.tag + a.author).includes(q.trim()),
      );
    // فقط چیپ active توی گروهی که صفحه‌ش فعاله رو بخون
    const activeView = document.querySelector(".view.active");
    const activeGroup = activeView
      ? activeView.querySelector("[data-filter-group]")
      : null;
    const activeChip = activeGroup
      ? activeGroup.querySelector(".chip.active")
      : null;
    const tag = activeChip ? activeChip.dataset.tag : "";
    if (tag) list = list.filter((a) => a.tag === tag);
    // مرتب‌سازی
    const sort =
      (document.getElementById("sortSelect") || {}).value || "newest";
    if (sort === "reads") list = [...list].sort((a, b) => b.reads - a.reads);
    else if (sort === "likes")
      list = [...list].sort((a, b) => b.likes - a.likes);
    else list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }

  _render() {
    const filtered = this._getFiltered();
    const visible = filtered.slice(0, this.displayedCount);
    const hasMore = filtered.length > this.displayedCount;
    this.feeds.home.render(visible, hasMore);
    this.feeds.explore.render(visible); // filtered.slice applied
    // کتابخانه — مقالات ذخیره‌شده (فقط برای کاربر لاگین‌شده)
    if (this.feeds.lib && this.feeds.lib.container) {
      if (!this.auth.isLoggedIn()) {
        this.feeds.lib.container.innerHTML =
          '<p style="text-align:center;color:var(--muted);padding:40px 0">برای دیدن کتابخانه‌ات وارد شو  <br><br><button class="btn-negar btn-primary-negar" data-action="open-login">ورود</button></p>';
      } else {
        const savedList = this.articles.filter((a) => this.saves.isSaved(a.id));
        if (savedList.length) {
          this.feeds.lib.render(savedList);
        } else {
          this.feeds.lib.container.innerHTML =
            '<p style="text-align:center;color:var(--muted);padding:40px 0">هنوز مقاله‌ای ذخیره نکردی</p>';
        }
      }
    }
    this.feeds.home.renderTrending(this.articles, "#trending");
    this.feeds.explore.renderTrending(this.articles, "#trending2");
  }

  _openArticle(id) {
    const a = this.articles.find((x) => x.id === id);
    if (!a) return;
    a.view();
    this.currentArticle = a;
    this._persistArticles();
    this._render();
    const related = this._getRelated(a);
    const relatedHtml = related.length
      ? `
      <div class="related-section">
        <h3 class="related-title">مطالب مرتبط</h3>
        <div class="related-grid">
          ${related
            .map(
              (r) => `
            <div class="related-card" data-action="open-article" data-id="${r.id}">
              <div class="related-cover">${r.cover ? `<img src="${r.cover}" alt="${esc(r.title)}" />` : `<span class="cover-tag">${esc(r.tag)}</span>`}</div>
              <div class="related-body">
                <span class="related-tag">${esc(r.tag)}</span>
                <div class="related-head">${esc(r.title)}</div>
                <div class="related-meta"><i class="fa-regular fa-eye"></i> ${r.reads.toLocaleString("fa-IR")} · <i class="fa-solid fa-hourglass-start"></i> ${r.readingTime()} دقیقه</div>
              </div>
            </div>`,
            )
            .join("")}
        </div>
      </div>`
      : "";
    document.getElementById("articlePage").innerHTML = a.toFull() + relatedHtml;
    this.comments.render(a.id, "commentList");
    const cc = document.getElementById("commentCount");
    if (cc) cc.textContent = this.comments.count(a.id);
    this._go("article");
    // ثبت مقاله در تاریخچه مرورگر (برای دکمه‌های عقب/جلو)
    if (window.location.hash !== "#/article/" + id) {
      history.pushState({ view: "article", id }, "", "#/article/" + id);
    }
  }

  _like(id) {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const a = this.articles.find((x) => x.id === id);
    if (!a) return;
    // toggle لایک
    const liked = this.likes.toggle(id);
    if (liked) {
      a.likes++;
      this.toast.show("پسندیدی");
      this.notif.add("heart", `«${esc(a.title)}» را پسندیدی`);
    } else {
      a.likes = Math.max(0, a.likes - 1);
      this.toast.show("لایک پس گرفته شد");
    }
    this._persistArticles();
    // به‌روزرسانی دکمه لایک در صفحه مقاله
    const likeBtn = document.querySelector(
      '[data-action="like"][data-id="' + id + '"]',
    );
    if (likeBtn) {
      likeBtn.innerHTML = liked
        ? '<i class="fa-solid fa-heart"></i> ' + a.likes
        : '<i class="fa-regular fa-heart"></i> ' + a.likes;
    }
    this._render();
  }

  _edit(id) {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const a = this.articles.find((x) => x.id === id);
    if (!a) return;
    // فقط نویسنده مقاله می‌تونه ویرایش کنه
    if (a.author !== this.auth.user.display_name) {
      this.toast.show("فقط نویسنده می‌تونه مقاله رو ویرایش کنه");
      return;
    }
    this.editor.load(a);
    this._editingId = a.id;
    this._go("editor");
  }

  _toggleSave(id) {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const on = this.saves.toggle(id);
    this.toast.show(on ? "ذخیره شد" : "از ذخیره حذف شد");
    // به‌روزرسانی دکمه ذخیره در صفحه مقاله
    const saveBtn = document.querySelector(
      '[data-action="save"][data-id="' + id + '"]',
    );
    if (saveBtn) {
      saveBtn.innerHTML = on
        ? '<i class="fa-solid fa-bookmark"></i> ذخیره شده'
        : '<i class="fa-regular fa-bookmark"></i> ذخیره';
    }
    this._render(); // رفرش کتابخانه
  }

  _shareArticle() {
    if (!this.currentArticle) return;
    const a = this.currentArticle;
    const url = encodeURIComponent(window.location.href.split("#")[0]);
    const text = encodeURIComponent(a.title + " — نگار");
    const tg = `https://t.me/share/url?url=${url}&text=${text}`;
    const wa = `https://wa.me/?text=${text}%20${url}`;
    const panel = document.getElementById("sharePanel");
    if (panel) {
      panel.innerHTML = `
        <a class="share-opt" href="${tg}" target="_blank" rel="noopener"><i class="fa-brands fa-telegram"></i> تلگرام</a>
        <a class="share-opt" href="${wa}" target="_blank" rel="noopener"> <i class="fa-brands fa-whatsapp"></i> واتساپ</a>
        <button class="share-opt" data-action="copy-link"><i class="fa-solid fa-link"></i> کپی لینک</button>`;
      panel.classList.add("open");
    }
  }

  _copyLink() {
    if (!this.currentArticle) return;
    const url =
      window.location.href.split("#")[0] + "#article-" + this.currentArticle.id;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.toast.show("لینک کپی شد");
          const panel = document.getElementById("sharePanel");
          if (panel) panel.classList.remove("open");
        })
        .catch(() => this.toast.show(url));
    } else {
      this.toast.show(url);
    }
  }

  _toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", isDark ? "light" : "dark");
    try {
      localStorage.setItem(STORAGE.THEME, isDark ? "light" : "dark");
    } catch (e) {
      /* ignore */
    }
    const btn = document.querySelector('[data-action="toggle-theme"]');
    if (btn)
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-regular fa-moon"></i>';
    this.toast.show(isDark ? "حالت روشن" : "حالت تاریک");
  }

  _getRelated(article, n = 3) {
    return this.articles
      .filter(
        (a) =>
          a.id !== article.id &&
          (a.tag === article.tag || a.author === article.author),
      )
      .sort((a, b) => b.reads - a.reads)
      .slice(0, n);
  }

  _postComment() {
    const input = document.getElementById("commentInput");
    const body = input.value.trim();
    if (!body) {
      this.toast.show("نظر خالیه");
      return;
    }
    const author = this.auth.isLoggedIn()
      ? this.auth.user.display_name
      : "مهمان";
    const replyTo = this._pendingReply || null;
    this.comments.add(this.currentArticle.id, author, body, replyTo);
    this.comments.render(this.currentArticle.id, "commentList");
    document.getElementById("commentCount").textContent = this.comments.count(
      this.currentArticle.id,
    );
    input.value = "";
    input.placeholder = "نظرت رو بنویس...";
    this._pendingReply = null;
    this.toast.show(replyTo ? "پاسخ ثبت شد " : "نظر ثبت شد");
    this.notif.add(
      "",
      `<b>${esc(author)}</b> روی «${esc(this.currentArticle.title)}» نظر داد`,
    );
  }

  _delete(id) {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const a = this.articles.find((x) => x.id === id);
    if (a && a.author !== this.auth.user.display_name) {
      this.toast.show("فقط نویسنده می‌تونه حذف کنه ");
      return;
    }
    const modal = document.getElementById("confirmModal");
    if (modal) {
      modal.classList.add("open");
      modal.dataset.deleteId = id;
    } else {
      if (!confirm("حذف بشه؟")) return;
      this._doDelete(id);
    }
  }

  _doDelete(id) {
    this.articles = this.articles.filter((x) => x.id !== id);
    this._persistArticles();
    this.toast.show("حذف شد");
    this._render();
    this._go("home");
  }

  // ── صفحه نویسنده ──
  _openAuthor(authorName) {
    const authorArticles = this.articles.filter((a) => a.author === authorName);
    const hasCover = authorArticles[0] ? authorArticles[0].cover : null;
    const totalReads = authorArticles.reduce((s, a) => s + a.reads, 0);
    const totalLikes = authorArticles.reduce((s, a) => s + a.likes, 0);
    const el = document.getElementById("authorPage");
    el.innerHTML = `
      <div class="author-head">
        <span class="author-avatar">${esc((authorName || "?").charAt(0))}</span>
        <div>
          <h1>${esc(authorName)}</h1>
          <div class="author-stats">
            <span> ${authorArticles.length} مقاله</span>
            <span><i class="fa-regular fa-eye"></i> ${totalReads.toLocaleString("fa-IR")} بازدید</span>
            <span><i class="fa-solid fa-heart"></i> ${totalLikes} لایک</span>
          </div>
        </div>
      </div>
      <div class="section-head"><h2>مقالات ${esc(authorName)}</h2></div>
      <div class="feed">${authorArticles.map((a) => a.toCard()).join("") || '<p style="text-align:center;color:var(--muted);padding:40px 0">مقاله‌ای یافت نشد</p>'}</div>`;
    this._go("author");
  }

  _openDashboard() {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const user = this.auth.user;
    // فقط مقالاتی که خود کاربر نوشته
    const myArticles = this.articles.filter(
      (a) => a.author === user.display_name,
    );
    const totalReads = myArticles.reduce((s, a) => s + a.reads, 0);
    const totalLikes = myArticles.reduce((s, a) => s + a.likes, 0);
    const myComments = Object.values(this.comments.data)
      .flat()
      .filter((c) => c.author === user.display_name).length;
    // کامنت‌های روی مقالات خودم
    const commentsOnMine = myArticles.reduce(
      (s, a) => s + this.comments.count(a.id),
      0,
    );
    const el = document.getElementById("dashPage");
    const avatarHtml = user.avatar
      ? `<img src="${user.avatar}" alt="آواتار" class="dash-avatar-img" />`
      : `${esc(user.display_name.charAt(0))}`;
    el.innerHTML = `
          <div class="dash-head">
            <span class="author-avatar dash-avatar">${avatarHtml}</span>
            <div>
              <h1>داشبورد ${esc(user.display_name)}</h1>
              ${user.bio ? `<p class="dash-bio">${esc(user.bio)}</p>` : ""}
              <div class="author-stats"><span><i class="fa-regular fa-calendar"></i> عضو از ${esc(user.joined ? new Date(user.joined).toLocaleDateString("fa-IR") : "نامشخص")}</span></div>
            </div>
            <button class="btn-negar btn-ghost-negar" data-action="open-profile"><i class="fa-solid fa-pen"></i> ویرایش پروفایل</button>
          </div>
      <div class="dash-cards">
        <div class="dash-card"><span class="dash-num">${myArticles.length.toLocaleString("fa-IR")}</span><span class="dash-label">مقاله من</span></div>
        <div class="dash-card"><span class="dash-num">${totalReads.toLocaleString("fa-IR")}</span><span class="dash-label"> کل بازدید</span></div>
        <div class="dash-card"><span class="dash-num">${totalLikes.toLocaleString("fa-IR")}</span><span class="dash-label"> کل لایک</span></div>
        <div class="dash-card"><span class="dash-num">${commentsOnMine.toLocaleString("fa-IR")}</span><span class="dash-label">نظر روی مقالاتم</span></div>
        <div class="dash-card"><span class="dash-num">${myComments.toLocaleString("fa-IR")}</span><span class="dash-label">نظرات من</span></div>
      </div>
      ${myArticles.length ? this._chartHtml(myArticles) : ""}
      ${
        myArticles.length
          ? `
        <div class="section-head"><h2> آمار مقالات من</h2></div>
        <div class="dash-table-wrap">
          <table class="dash-table">
            <thead><tr><th>مقاله</th><th><i class="fa-regular fa-eye"></i> بازدید</th><th><i class="fa-solid fa-heart"></i> لایک</th><th><i class="fa-solid fa-message"></i> نظر</th><th><i class="fa-regular fa-calendar-days"></i> تاریخ</th></tr></thead>
            <tbody>
              ${myArticles
                .map(
                  (a) => `<tr>
                <td><span class="dash-title">${esc(a.title)}</span></td>
                <td>${a.reads.toLocaleString("fa-IR")}</td>
                <td>${a.likes.toLocaleString("fa-IR")}</td>
                <td>${this.comments.count(a.id)}</td>
                <td>${esc(a.getDateLabel())}</td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : '<p style="text-align:center;color:var(--muted);padding:40px 0">هنوز مقاله‌ای ننوشتی</p>'
      }
      <div class="section-head" style="margin-top:30px"><h2>مقالات من</h2></div>
      <div class="feed">${myArticles.length ? myArticles.map((a) => a.toCard()).join("") : ""}</div>`;
    this._go("dashboard");
  }

  /** تولید HTML نمودار ستونی بازدید و لایک مقالات */
  _chartHtml(myArticles) {
    const list = myArticles.slice(0, 8);
    // مقیاس: اگر همه مقادیر برابر بودن، ستون‌ها ۷۰٪ ارتفاع بگیرن تا شکل قشنگ‌تری داشته باشن
    const maxReads = Math.max(...list.map((a) => a.reads), 0);
    const maxLikes = Math.max(...list.map((a) => a.likes), 0);
    const allSameR =
      maxReads > 0 && list.every((a) => a.reads === list[0].reads);
    const allSameL =
      maxLikes > 0 && list.every((a) => a.likes === list[0].likes);
    const rScale = allSameR ? maxReads * 1.4 : maxReads;
    const lScale = allSameL ? maxLikes * 1.4 : maxLikes;

    const h = (val, scale) =>
      scale > 0 ? Math.round((val / scale) * 112) + 4 : 4;

    const bars = list
      .map((a) => {
        const rh = h(a.reads, rScale);
        const lh = h(a.likes, lScale);
        return `
        <div class="chart-bar-wrap" title="${esc(a.title)}">
          <div class="chart-bar-row">
            <div class="chart-col">
              <div class="chart-bar reads" style="height:${rh}px"><span class="chart-value">${a.reads.toLocaleString("fa-IR")}</span></div>
            </div>
            <div class="chart-col">
              <div class="chart-bar likes" style="height:${lh}px"><span class="chart-value">${a.likes.toLocaleString("fa-IR")}</span></div>
            </div>
          </div>
          <span class="chart-label">${esc(a.title.slice(0, 10))}${a.title.length > 10 ? "…" : ""}</span>
        </div>`;
      })
      .join("");
    const avgReads = list.length
      ? Math.round(list.reduce((s, a) => s + a.reads, 0) / list.length)
      : 0;
    return `
      <div class="dash-chart">
        <h3><i class="fa-solid fa-chart-column"></i> نمودار بازدید و لایک (۸ مقاله اخیر)</h3>
        <div class="chart-bars">${bars}</div>
        <div class="chart-legend">
          <span><span class="dot r"></span> بازدید</span>
          <span><span class="dot l"></span> لایک</span>
        </div>
        <div class="chart-stats">
          <span><i class="fa-regular fa-eye"></i> میانگین بازدید: ${avgReads.toLocaleString("fa-IR")}</span>
          <span><i class="fa-solid fa-fire"></i> پربازدیدترین: ${list[0] ? list.reduce((m, a) => (a.reads > m.reads ? a : m), list[0]).title.slice(0, 15) : "—"}</span>
        </div>
      </div>`;
  }

  /** نمایش مقالات ذخیره‌شده در صفحه کتابخانه */
  _renderLib() {
    const savedIds = this.saves.getAll();
    const savedArticles = this.articles.filter((a) => savedIds.includes(a.id));
    const el = document.getElementById("libFeed");
    if (!el) return;
    if (!savedArticles.length) {
      el.innerHTML =
        '<p style="text-align:center;color:var(--muted);padding:40px 0">هنوز مقاله‌ای ذخیره نکردی</p>';
      return;
    }
    el.innerHTML = savedArticles.map((a) => a.toCard()).join("");
  }

  /** ذخیره اطلاعات پروفایل */
    _saveProfile() {
      if (!this.auth.isLoggedIn()) return;
      const name = document.getElementById("profName").value.trim();
      const bio = document.getElementById("profBio").value.trim();
      if (!name) {
        this.toast.show("اسم نمی‌تونه خالی باشه");
        return;
      }
      const oldName = this.auth.user.display_name;
      this.auth.user.display_name = name;
      this.auth.user.bio = bio;
      // ذخیره آواتار جدید اگه انتخاب شده
      if (this._newAvatar) {
        this.auth.user.avatar = this._newAvatar;
        this._newAvatar = null;
      }
      this.auth._save();
      // ⬇️ آپدیت لیست کاربران (negar_users) — تا بعد از خروج و ورود دوباره،
      // اسم، بایو و آواتار جدید حفظ بشن ⬇️
      try {
        const users = JSON.parse(localStorage.getItem("negar_users")) || [];
        const idx = users.findIndex(
          (u) => u.username === this.auth.user.username,
        );
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...this.auth.user };
          localStorage.setItem("negar_users", JSON.stringify(users));
        }
      } catch (e) {
        /* ignore */
      }
      if (oldName !== name) {
        this.articles.forEach((a) => {
          if (a.author === oldName) a.author = name;
        });
        this._persistArticles();
      }
      this.auth.renderArea();
      this.toast.show("پروفایل ذخیره شد");
      this._openDashboard();
    }

  /** باز و بسته کردن منوی حساب کاربری — وقتی بیرون کلیک بشه بسته می‌شه */
  _toggleAccountMenu(e) {
    const menu = document.getElementById("accountMenu");
    if (!menu) return;
    const wrap = menu.closest(".account-menu-wrap");
    // اگه کلیک روی دکمه gear یا داخل منو بود → toggle
    if (e && wrap === e.target.closest(".account-menu-wrap")) {
      menu.classList.toggle("open");
      return;
    }
    // اگه کلیک بیرون بود → ببند
    menu.classList.remove("open");
  }

  /** نمایش صفحه پروفایل */
  _openProfile() {
    if (!this.auth.isLoggedIn()) {
      this.auth.open("login");
      return;
    }
    const u = this.auth.user;
    const el = document.getElementById("profilePage");
    const avatarHtml = u.avatar
      ? `<img src="${u.avatar}" alt="آواتار" class="profile-avatar-img" />`
      : `${esc((u.display_name || "?")[0])}`;
    el.innerHTML = `
        <div class="profile-head">
          <label class="profile-avatar profile-avatar-upload" title="تغییر عکس پروفایل">
            ${avatarHtml}
            <input type="file" id="avatarInput" accept="image/*" hidden />
            <span class="avatar-overlay"><i class="fa-solid fa-camera"></i></span>
          </label>
          <div><h1>${esc(u.display_name)}</h1><div class="profile-joined"> عضویت از ${esc(u.joined ? new Date(u.joined).toLocaleDateString("fa-IR") : "نامشخص")}</div></div>
        </div>
        <div class="profile-form">
          <div class="profile-field"><label>اسم نمایشی</label><input id="profName" value="${esc(u.display_name)}" /></div>
          <div class="profile-field"><label>نام کاربری</label><input id="profUsername" value="${esc(u.username)}" disabled style="opacity:.6" /></div>
          <div class="profile-field"><label>بایو</label><textarea id="profBio" class="profile-textarea" placeholder="درباره خودت بنویس...">${esc(u.bio || "")}</textarea></div>
          <div class="profile-actions">
            <button class="btn-negar btn-ghost-negar" data-action="go-dashboard">بازگشت</button>
            <button class="btn-negar btn-primary-negar" data-action="save-profile"> ذخیره</button>
          </div>
        </div>`;
    // هندلر تغییر عکس پروفایل
    const avInput = document.getElementById("avatarInput");
    if (avInput) {
      avInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this._newAvatar = ev.target.result;
          const img = el.querySelector(".profile-avatar-img");
          if (img) img.src = this._newAvatar;
          else {
            const holder = el.querySelector(".profile-avatar");
            if (holder)
              holder.innerHTML = `<img src="${this._newAvatar}" alt="آواتار" class="profile-avatar-img" />`;
          }
          this.toast.show("عکس انتخاب شد — ذخیره کن تا اعمال بشه");
        };
        reader.readAsDataURL(file);
      };
    }
    this._go("profile");
  }

  /** Toggle نمایش/مخفی‌شدن فرم ویرایش پروفایل */
  _toggleEditProfile() {
    const form = document.getElementById("editProfileForm");
    if (form)
      form.style.display = form.style.display === "none" ? "block" : "none";
  }

  /** انتشار مقاله — اعتبارسنجی، ذخیره، پاک‌سازی فرم */
  _publish() {
    if (!this.auth.isLoggedIn()) {
      this.toast.show("برای انتشار وارد شوید");
      return;
    }
    const data = this.editor.getData();
    if (!this._validate(data)) return;
    const cover = this._coverData || null;

    this._editingId
      ? this._updateArticle(data, cover)
      : this._createArticle(data, cover);

    this._persistArticles();
    this._resetEditor();
    this._render();
    this._go("home");
  }

  /** اعتبارسنجی عنوان و متن مقاله */
  _validate(data) {
    if (!data.title) {
      this.toast.show("عنوان بنویس ");
      return false;
    }
    if (data.body.length < 10) {
      this.toast.show("متن کوتاهه");
      return false;
    }
    return true;
  }

  /** به‌روزرسانی مقاله موجود (حالت ویرایش) */
  _updateArticle(data, cover) {
    const existing = this.articles.find((x) => x.id === this._editingId);
    if (existing) {
      existing.title = data.title;
      existing.body = data.body;
      existing.tag = data.tag;
      if (cover) existing.cover = cover;
      this.toast.show("ویرایش ذخیره شد");
    }
    this._editingId = null;
  }

  /** ایجاد مقاله جدید */
  _createArticle(data, cover) {
    this.articles.unshift(
      new Article({
        id: this.nextId++,
        ...data,
        author: this.auth.user.display_name,
        reads: 0,
        likes: 0,
        cover,
      }),
    );
    this.toast.show("منتشر شد!");
  }

  /** پاک‌سازی فرم ادیتور و کاور بعد از انتشار */
  _resetEditor() {
    this._coverData = null;
    const cv = document.getElementById("coverPreview");
    if (cv) {
      cv.classList.remove("show");
      cv.innerHTML = "";
    }
    this.editor.open();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  window.app = new NegarApp();

  // ── بازگرداندن صفحه از روی hash (برای رفرش در مقاله/داشبورد و...) ──
  const initHash = window.location.hash;
  if (initHash) {
    const m = initHash.match(/^#\/article\/(\d+)$/);
    if (m) {
      window.app._openArticle(parseInt(m[1]));
    } else {
      const view = initHash.replace("#/", "") || "home";
      if (document.getElementById(view)) window.app._go(view, true);
    }
  }

  // ── بستن پنل اعلان با کلیک خارج ──
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("notifPanel");
    if (
      panel &&
      panel.classList.contains("open") &&
      !e.target.closest('[data-action="open-notifications"]') &&
      !e.target.closest(".notif-panel")
    ) {
      panel.classList.remove("open");
    }
    // بستن پنل اشتراک
    const sharePanel = document.getElementById("sharePanel");
    if (
      sharePanel &&
      sharePanel.classList.contains("open") &&
      !e.target.closest('[data-action="share"]') &&
      !e.target.closest(".share-panel")
    ) {
      sharePanel.classList.remove("open");
    }
  });

  // ── شورت‌کات صفحه‌کلید ──
  document.addEventListener("keydown", (e) => {
    const artBody = document.getElementById("artBody");
    const inEditor =
      document.activeElement === artBody ||
      (document.activeElement &&
        document.activeElement.id &&
        document.activeElement.id.startsWith("art"));
    const editorView = document.getElementById("editor");
    if (!editorView || !editorView.classList.contains("active")) return;
    const ed = window.app.editor;
    if (e.ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      ed.insertAround("**", "**");
    } else if (e.ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      ed.insertAround("*", "*");
    } else if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      ed.insertAtCursor("\n\n---\n\n");
    } else if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      // در این نسخه پیش‌نویس خودکار حذف شده؛ Ctrl+S فقط از ذخیره پیش‌فرض مرورگر جلوگیری می‌کنه
    }
  });

  // ── نوار پیشرفت مطالعه ──
  const progressBar = document.getElementById("progressBar");
  function updateProgress() {
    if (!progressBar) return;
    const article = document.getElementById("article");
    const isArticle =
      article &&
      article.classList.contains("active") &&
      document.getElementById("articlePage");
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (isArticle && docHeight > 0) {
      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      progressBar.style.width = pct + "%";
      progressBar.style.opacity = pct > 2 && pct < 100 ? "1" : "0.6";
    } else {
      progressBar.style.width = "0%";
    }
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ── تغییر تم (اعمال تم ذخیره‌شده) — کلیک از طریق _bindEvents هندل می‌شه ──
  const savedTheme = localStorage.getItem(STORAGE.THEME) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const themeBtn = document.querySelector('[data-action="toggle-theme"]');
  if (themeBtn) {
    const themeIcon = themeBtn.querySelector("i");
    if (themeIcon) {
      themeIcon.className =
        savedTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  // ── منوی همبرگر ──
  const hamburger = document.getElementById("hamburgerBtn");
  const overlay = document.getElementById("mobileOverlay");
  const drawer = document.getElementById("mobileDrawer");
  const closeBtn = document.getElementById("drawerClose");

  function openDrawer() {
    hamburger && hamburger.classList.add("open");
    overlay && overlay.classList.add("open");
    drawer && drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    hamburger && hamburger.classList.remove("open");
    overlay && overlay.classList.remove("open");
    drawer && drawer.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (hamburger)
    hamburger.addEventListener("click", () => {
      drawer && drawer.classList.contains("open")
        ? closeDrawer()
        : openDrawer();
    });
  if (overlay) overlay.addEventListener("click", closeDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

  // بستن منو با کلیک روی لینک‌ها
  if (drawer) {
      drawer
        .querySelectorAll('a[data-action], button[data-action="open-login"]')
        .forEach((a) => {
          a.addEventListener("click", closeDrawer);
        });
    }

    // بستن منو وقتی صفحه به دسکتاپ بزرگ می‌شه
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 992) closeDrawer();
    });

  // سرچ موبایل ↔ سرچ اصلی
  const mobileSearch = document.getElementById("mobileSearchInput");
  const mainSearch = document.getElementById("searchInput");
  if (mobileSearch && mainSearch) {
    mobileSearch.addEventListener("input", () => {
      mainSearch.value = mobileSearch.value;
    });
    mainSearch.addEventListener("input", () => {
      mobileSearch.value = mainSearch.value;
    });
  }
});

// ── دکمه‌های عقب/جلو مرورگر ──
window.addEventListener("popstate", () => {
  const hash = window.location.hash;
  const app = window.app;
  if (!app) return;
  const m = hash.match(/^#\/article\/(\d+)$/);
  if (m) {
    app._openArticle(parseInt(m[1]));
  } else {
    const view = hash.replace("#/", "") || "home";
    if (document.getElementById(view)) app._go(view, true);
    else app._go("home", true);
  }
});
