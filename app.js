(() => {
  const LAST_DRINK_KEY = "itfw_last_drink_ts";
  const VISIT_COUNT_KEY = "itfw_visit_count";

  // Configuration: keep it "gentle"
  const THRESHOLDS_MIN = {
    yes: 90,       // >= 90 min since last drink => "Yes"
    probably: 45   // 45-89 min => "Probably"
  };

  const now = () => Date.now();

  const answerEl = document.getElementById("answer");
  const reasonEl = document.getElementById("reason");
  const lastLabelEl = document.getElementById("lastLabel");
  const drankBtn = document.getElementById("drankBtn");

  const helperEl = document.getElementById("helper");
  const affiliateLink = document.getElementById("affiliateLink");

  // TODO: Replace this with your affiliate URL later (direct brand preferred).
  // For now, use a neutral placeholder search to avoid dead links.
  const AFFILIATE_URL =
    "https://www.amazon.com/s?k=smart+water+bottle+reminder";

  affiliateLink.href = AFFILIATE_URL;

  function incVisitCount() {
    const v = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
    const next = Number.isFinite(v) ? v + 1 : 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(next));
    return next;
  }

  function getLastDrinkTs() {
    const v = parseInt(localStorage.getItem(LAST_DRINK_KEY) || "0", 10);
    return Number.isFinite(v) ? v : 0;
  }

  function setLastDrinkTs(ts) {
    localStorage.setItem(LAST_DRINK_KEY, String(ts));
  }

  function minsSince(ts) {
    if (!ts) return null;
    return Math.floor((now() - ts) / 60000);
  }

  function fmtLast(mins) {
    if (mins === null) return "Last: —";
    if (mins < 1) return "Last: just now";
    if (mins === 1) return "Last: 1 minute ago";
    if (mins < 60) return `Last: ${mins} minutes ago`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `Last: ${h} hour${h === 1 ? "" : "s"} ago`;
    return `Last: ${h}h ${m}m ago`;
  }

  function computeAnswer(mins) {
    // No data yet: be inviting but not pushy
    if (mins === null) {
      return {
        answer: "Probably.",
        reason: "A gentle reminder—tap “I drank water” after you drink."
      };
    }

    if (mins >= THRESHOLDS_MIN.yes) {
      return {
        answer: "Yes.",
        reason: "It has been a while. A sip of water sounds good."
      };
    }

    if (mins >= THRESHOLDS_MIN.probably) {
      return {
        answer: "Probably.",
        reason: "If you feel even slightly thirsty, go for it."
      };
    }

    return {
      answer: "Not yet.",
      reason: "You’re probably fine for now. Check again later."
    };
  }

  function shouldShowHelper(visitCount, userInteracted) {
    // Monetize only on higher intent:
    // - returning visitor, or
    // - they interacted ("I drank water")
    return userInteracted || visitCount >= 2;
  }

  function render(userInteracted = false) {
    const visitCount = incVisitCount();
    const last = getLastDrinkTs();
    const mins = minsSince(last);

    const { answer, reason } = computeAnswer(mins);
    answerEl.textContent = answer;
    reasonEl.textContent = reason;
    lastLabelEl.textContent = fmtLast(mins);

    if (shouldShowHelper(visitCount, userInteracted)) {
      helperEl.style.display = "block";
    }
  }

  drankBtn.addEventListener("click", () => {
    setLastDrinkTs(now());
    // Re-render immediately and reveal helper (high intent moment)
    const mins = 0;
    answerEl.textContent = "Nice.";
    reasonEl.textContent = "Hydration logged. See you later.";
    lastLabelEl.textContent = fmtLast(mins);
    helperEl.style.display = "block";
  });

  // Initial render
  render(false);
})();
