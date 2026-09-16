/**
 * ═══════════════════════════════════════════════════
 *  نگار — امکانات جامعه نویسندگان و نگار پلاس
 *  version: 1.0
 *  وابسته به: app.js (window.app)
 * ═══════════════════════════════════════════════════
 */
"use strict";

/** کلیدهای ذخیره‌سازی امکانات جامعه */
const C_STORE = {
  STREAK: "negar_streak",
  CHALLENGE: "negar_challenge",
  FOLLOWS: "negar_follows",
  PLUS: "negar_plus",
  READING: "negar_reading_mode",
};

/** چالش‌های هفتگی چرخشی */
const CHALLENGES = [
  { id: 1, title: "یک اتفاق کوچک", prompt: "درباره یه اتفاق کوچیک که زندگیت رو عوض کرد بنویس" },
  { id: 2, title: "نامه به آینده", prompt: "نامه‌ای به خودت توی ۱۰ سال بعد بنویس" },
  { id: 3, title: "جایی که دوست داری", prompt: "مکانی که آرزوی سفر بهش داری رو توصیف کن" },
  { id: 4, title: "یک جمله شروع", prompt: "مقاله‌ات رو با جمله «هیچ‌کس نمی‌دونه...» شروع کن" },
  { id: 5, title: "جادوی روزمره", prompt: "لحظه‌ای ساده که جادویی بود رو بنویس" },
];

/** تعیین چالش هفته فعلی بر اساس شماره هفته سال */
function currentChallenge() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / (7 * 24 * 3600 * 1000));
  return CHALLENGES[week % CHALLENGES.length];
}

/** کلاس CommunityManager — امکانات جامعه نویسندگان + نگار پلاس */
class CommunityManager {
  /**
   * @param {object} app - نمونه اصلی اپلیکیشن (window.app)
   */
  constructor(app) {
    this.app = app;
    this.streak = this._loadStreak();
    this.follows = this._loadFollows();
    this.isPlus = this._loadPlus();
    this.readingMode = false;
  }

  // ── ذخیره‌سازی ──
  _loadStreak() {
    try {
      const data = JSON.parse(localStorage.getItem(C_STORE.STREAK) || "{}");
      // شکل داده رو نرمال کن — اگه count عدد نیست یا last نامعتبره، صفر برگردون
      const count = Number.isFinite(data.count) && data.count > 0 ? data.count : 0;
      const lastStr = typeof data.last === "string" ? data.last : null;
      // اگه تاریخ نامعتبر باشه، رگه رو ریست کن
      if (lastStr) {
        const last = new Date(lastStr);
        if (isNaN(last.getTime())) return { count: 0, last: null };
        // اگه آخرین نوشتن بیشتر از ۱ روز پیش بوده، رگه شکسته
        const today = new Date();
        const diff = Math.floor((today - last) / (24 * 3600 * 1000));
        if (diff > 1) return { count: 0, last: null };
      }
      return { count, last: lastStr };
    } catch { return { count: 0, last: null }; }
  }
  _saveStreak() {
    localStorage.setItem(C_STORE.STREAK, JSON.stringify(this.streak));
  }
  _loadFollows() {
    try { return JSON.parse(localStorage.getItem(C_STORE.FOLLOWS) || "[]"); }
    catch { return []; }
  }
  _saveFollows() {
    localStorage.setItem(C_STORE.FOLLOWS, JSON.stringify(this.follows));
  }
  _loadPlus() {
    return localStorage.getItem(C_STORE.PLUS) === "1";
  }
  _savePlus() {
    localStorage.setItem(C_STORE.PLUS, this.isPlus ? "1" : "0");
  }
  _saveReading() {
    localStorage.setItem(C_STORE.READING, this.readingMode ? "1" : "0");
  }

  // ── ۱) رگه نویسندگی ──
  /** ثبت یک روز نوشتن — بعد از انتشار مقاله صدا زده می‌شه */
  registerWrite() {
    const today = new Date();
    const todayStr = today.toDateString();
    const last = this.streak.last ? new Date(this.streak.last) : null;
    // اگه امروز قبلاً ثبت شده، کاری نکن
    if (this.streak.last === todayStr) return this.streak.count;
    // اگه دیروز نوشته بود، رگه +۱
    if (last) {
      const diff = Math.floor((today - last) / (24 * 3600 * 1000));
      this.streak.count = diff === 1 ? this.streak.count + 1 : 1;
    } else {
      this.streak.count = this.streak.count + 1;
    }
    this.streak.last = todayStr;
    this._saveStreak();
    return this.streak.count;
  }

  /** نمایش رگه توی داشبورد — به عنوان کارت اضافی */
  streakHtml() {
    // مقاوم در برابر داده خراب — همیشه عدد سالم نشون بده
    const c = Number.isFinite(this.streak.count) && this.streak.count > 0 ? this.streak.count : 0;
    const flame = c >= 7 ? "" : c >= 3 ? "" : "";
    return `<div class="dash-card streak-card">
      <span class="dash-num">${flame} ${c}</span>
      <span class="dash-label">${c > 0 ? "روز پیاپی نویسندگی" : "هنوز شروع نکردی"}</span>
    </div>`;
  }

  // ── ۲) چالش هفتگی ──
  /** HTML چالش هفته — توی سایدبار یا صفحه اصلی */
  challengeHtml() {
    const ch = currentChallenge();
    const entered = this.app.articles.some(
      (a) => a.challengeId === ch.id || (a.challengeTitle && a.challengeTitle === ch.title),
    );
    return `<div class="challenge-card">
      <div class="challenge-badge">چالش هفته</div>
      <h4 class="challenge-title">${esc(ch.title)}</h4>
      <p class="challenge-prompt">${esc(ch.prompt)}</p>
      ${entered
        ? `<span class="challenge-done">✓ شرکت کردی</span>`
        : `<button class="btn-negar btn-primary-negar" data-action="join-challenge" style="width:100%">شرکت در چالش</button>`}
    </div>`;
  }

  /** شرکت در چالش — ادیتور رو با تگ چالش باز می‌کنه */
  joinChallenge() {
    const ch = currentChallenge();
    if (!this.app.auth.isLoggedIn()) {
      this.app.auth.open("login");
      return;
    }
    this.app.editor.open();
    // علامت‌گذاری با تگ مخصوص چالش
    document.getElementById("artTag").value = "چالش";
    this.app.toast.show(`چالش هفته: ${ch.title} — بنویس!`);
    this.app._go("editor");
  }

  /** تگ چالش را روی مقاله ثبت می‌کند */
  markChallenge(article) {
    const ch = currentChallenge();
    if (!article.challengeId) article.challengeId = ch.id;
    if (!article.challengeTitle) article.challengeTitle = ch.title;
  }

  // ── ۳) دنبال کردن نویسنده‌ها ──
  isFollowing(author) {
    return this.follows.includes(author);
  }
  toggleFollow(author) {
    const i = this.follows.indexOf(author);
    if (i >= 0) this.follows.splice(i, 1);
    else this.follows.push(author);
    this._saveFollows();
    return this.isFollowing(author);
  }
  /** مقالات نویسنده‌های دنبال‌شده */
  followedArticles() {
    return this.app.articles.filter((a) => this.follows.includes(a.author));
  }

  // ── ۴) نویسنده ماه ──
  /** نویسنده ماه بر اساس بازدید + لایک + تعداد مقالات */
  authorOfMonth() {
    const map = {};
    this.app.articles.forEach((a) => {
      if (!map[a.author]) map[a.author] = { reads: 0, likes: 0, count: 0 };
      map[a.author].reads += a.reads;
      map[a.author].likes += a.likes;
      map[a.author].count++;
    });
    const best = Object.entries(map).sort(
      (x, y) => (y[1].reads + y[1].likes * 2) - (x[1].reads + x[1].likes * 2),
    )[0];
    if (!best) return null;
    return { author: best[0], ...best[1] };
  }

  /** HTML نویسنده ماه — توی سایدبار */
  authorOfMonthHtml() {
    const best = this.authorOfMonth();
    if (!best) return "";
    return `<div class="box">
      <h3><img class="chip-icon" src="public/svg/fire-svgrepo-com.svg" alt="" /> نویسنده ماه</h3>
      <div class="month-author">
        <span class="author-avatar">${esc(best.author.charAt(0))}</span>
        <div>
          <div class="month-author-name">${esc(best.author)}</div>
          <div class="month-author-stats">${best.count} مقاله · ${best.reads.toLocaleString("fa-IR")} بازدید · ${best.likes} لایک</div>
        </div>
        <span class="month-crown"><img class="chip-icon" src="public/svg/cup-svgrepo-com.svg" alt="نویسنده ماه" /></span>
      </div>
    </div>`;
  }

  // ── ۵) نگار پلاس ──
  /** فعال‌سازی دموی پلاس */
  togglePlus() {
    this.isPlus = !this.isPlus;
    this._savePlus();
    this.app.toast.show(
      this.isPlus ? "نگار پلاس فعال شد — همه امکانات بازه! 💎" : "پلاس غیرفعال شد",
    );
    this.app._render();
  }
  /** نمایش بج پلاس کنار اسم */
  plusBadge() {
    return this.isPlus
      ? `<span class="plus-badge" title="نگار پلاس">💎</span>`
      : "";
  }

  // ── ۶) تم پروفایل ──
  /** ذخیره تم انتخابی برای پروفایل کاربر — پلاس */
  saveProfileTheme(theme) {
    if (!this.isPlus) {
      this.app.toast.show("تم پروفایل مخصوص نگار پلاسه");
      return;
    }
    const u = this.app.auth.user;
    if (!u) return;
    u.profileTheme = theme;
    this.app.auth._save();
    // اعمال تم روی پروفایل
    document.documentElement.setAttribute("data-profile-theme", theme);
    this.app.toast.show("تم پروفایل ذخیره شد");
    this.app._openProfile();
  }
  /** اعمال تم ذخیره‌شده هنگام لود */
  initProfileTheme() {
    const u = this.app.auth && this.app.auth.user;
    if (u && u.profileTheme) {
      document.documentElement.setAttribute("data-profile-theme", u.profileTheme);
    }
  }

  // ── ۷) حالت مطالعه شب ──
  toggleReadingMode() {
    this.readingMode = !this.readingMode;
    this._saveReading();
    document.documentElement.classList.toggle("reading-mode", this.readingMode);
    this.app.toast.show(this.readingMode ? "حالت مطالعه شب فعال شد 🌙" : "حالت مطالعه غیرفعال شد");
  }
  initReadingMode() {
    this.readingMode = localStorage.getItem(C_STORE.READING) === "1";
    document.documentElement.classList.toggle("reading-mode", this.readingMode);
  }

  // ── ۸) چک‌لیست نگارشی ──
  /** بررسی متن قبل از انتشار — برمی‌گرداند آرایه‌ای از هشدارها */
  checkWriting(title, body) {
    const tips = [];
    if (title.length < 5) tips.push("عنوان خیلی کوتاهه — حداقل ۵ حرف");
    if (body.length < 100) tips.push("متن کوتاهه — حداقل ۱۰۰ حرف بنویس");
    const sentences = body.split(/[.!؟]\s/).filter((s) => s.length > 0);
    const long = sentences.filter((s) => s.length > 80);
    if (long.length > 0) tips.push(`${long.length} جمله خیلی طولانی داره — بهتره بشکنه`);
    const emojiCount = (body.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
    if (emojiCount > 5) tips.push("ایموجی زیادیه — حداکثر ۵ تا");
    return tips;
  }
}

/** راه‌اندازی امکانات جامعه — بعد از app ساخته می‌شه */
document.addEventListener("DOMContentLoaded", () => {
  const boot = () => {
    if (!window.app) return setTimeout(boot, 100);
    window.app.community = new CommunityManager(window.app);
    window.app.community.initReadingMode();
    window.app.community.initProfileTheme();
  };
  boot();
});