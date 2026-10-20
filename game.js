(() => {
  const $ = (id) => document.getElementById(id);
  const scoreEl = $("score");
  const streakEl = $("streak");
  const roundEl = $("round");
  const phaseEl = $("phase");
  const titleEl = $("stage-title");
  const textEl = $("stage-text");
  const actionsEl = $("stage-actions");
  const artEl = $("stage-art");
  const hintEl = $("hint");

  const TOTAL_ROUNDS = 3;
  let score = 0;
  let streak = 0;
  let round = 0;
  let best = Number(localStorage.getItem("prs_best") || 0);

  // Original stub scenarios — not copied from Finckh / Dinghy Lab / Dave Perry quizzes.
  const SCENARIOS = [
    {
      id: "port-cross",
      title: "Flash card: crowded start",
      blurb: "Two keelboats (~8 m) cross near the committee boat. You are on starboard; the other boat is on port and ducks late. Mild contact of rails, no injury.",
      hullOver6: true,
      needHail: true,
      needFlag: true,
      fileWindowSec: 12,
      defensePrompt: "Place the model boats. Pick your one-line story for the jury.",
      defenses: [
        { label: "I hailed Protest immediately and flew the red flag.", ok: true, points: 40 },
        { label: "I waited until the dock to tell the race office.", ok: false, points: 0 },
        { label: "I only waved — everyone saw it, so hail was optional.", ok: false, points: 5 },
      ],
      goodVerdict: "Valid protest · other boat DSQ (stub)",
      badVerdict: "Invalid — procedure failed before the rules debate",
      art: "cross",
    },
    {
      id: "mark-room",
      title: "Flash card: windward mark scrum",
      blurb: "Dinghy fleet (~4.5 m). Inside boat claims mark-room; outside boat claims they were clear ahead. No contact, but voices rise. SIs: hail only, no flag required.",
      hullOver6: false,
      needHail: true,
      needFlag: false,
      fileWindowSec: 10,
      defensePrompt: "Jury wants a clean picture. What do you lead with?",
      defenses: [
        { label: "I hailed Protest at the mark and filed within the time limit.", ok: true, points: 40 },
        { label: "No hail — I filmed it for the hearing later.", ok: false, points: 0 },
        { label: "I flew a red flag on a 4.5 m dinghy for style points.", ok: false, points: 10 },
      ],
      goodVerdict: "Hearing proceeds · facts still disputed (stub)",
      badVerdict: "Dismissed — no timely hail",
      art: "mark",
    },
    {
      id: "two-turns",
      title: "Flash card: spin already done?",
      blurb: "After a port/starboard brush, the other boat promptly takes Two-Turns and sails on. You still want blood in the protest room.",
      hullOver6: true,
      needHail: true,
      needFlag: true,
      fileWindowSec: 11,
      defensePrompt: "Model boats are set. Your closing line?",
      defenses: [
        { label: "They took Two-Turns; I still filed, but expect ‘penalty already taken’.", ok: true, points: 45 },
        { label: "Ignore the spins — demand DSQ anyway with no hail.", ok: false, points: 0 },
        { label: "File nothing; yell on social media instead.", ok: false, points: 0 },
      ],
      goodVerdict: "Penalty already taken · no further penalty (stub)",
      badVerdict: "Invalid Wall — you skipped the basics",
      art: "spin",
    },
  ];

  function setHud() {
    scoreEl.textContent = String(score);
    streakEl.textContent = String(streak);
    roundEl.textContent = `${Math.min(round, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`;
  }

  function clearActions() {
    actionsEl.innerHTML = "";
  }

  function addButton(label, onClick, className = "btn choice") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    actionsEl.appendChild(btn);
    return btn;
  }

  function drawArt(kind, showFlag) {
    artEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "boats";
    if (kind === "mark") {
      wrap.innerHTML = `
        <div class="boat you"><div class="mast"></div><div class="sail"></div><div class="hull"></div></div>
        <div class="boat mark" title="Mark"></div>
        <div class="boat them"><div class="mast"></div><div class="sail"></div><div class="hull"></div></div>`;
    } else {
      wrap.innerHTML = `
        <div class="boat you"><div class="mast"></div><div class="sail"></div><div class="hull"></div></div>
        <div class="boat them"><div class="mast"></div><div class="sail"></div><div class="hull"></div></div>`;
    }
    artEl.appendChild(wrap);
    if (showFlag) {
      const f = document.createElement("div");
      f.className = "flag-fly";
      f.textContent = "🚩";
      artEl.appendChild(f);
    }
  }

  function showVerdict(kind, text) {
    const v = document.createElement("div");
    v.className = `verdict ${kind}`;
    v.textContent = text;
    actionsEl.appendChild(v);
  }

  function startGame() {
    score = 0;
    streak = 0;
    round = 0;
    setHud();
    nextRound();
  }

  function nextRound() {
    if (round >= TOTAL_ROUNDS) return endGame();
    const scenario = SCENARIOS[round];
    round += 1;
    setHud();
    phaseEl.textContent = "Hail";
    titleEl.textContent = scenario.title;
    textEl.textContent = scenario.blurb;
    hintEl.textContent = "Phase 1/4 — Hail “Protest” while boats are still close.";
    drawArt(scenario.art, false);
    clearActions();

    let hailed = false;
    addButton("Hail “Protest!” now", () => {
      hailed = true;
      goFlag(scenario, hailed);
    });
    addButton("Stay quiet — sort it at the bar", () => {
      hailed = false;
      goFlag(scenario, hailed);
    });
  }

  function goFlag(scenario, hailed) {
    phaseEl.textContent = "Flag";
    titleEl.textContent = "Red flag?";
    textEl.textContent = scenario.hullOver6
      ? "Your hull is over 6 m. Do you display a red protest flag at the first reasonable opportunity?"
      : "Dinghy under 6 m. Event SIs: hail only. Do you still dig for a red flag?";
    hintEl.textContent = "Phase 2/4 — Flag rules depend on hull length and SIs.";
    drawArt(scenario.art, false);
    clearActions();

    addButton(scenario.hullOver6 ? "Fly the red flag" : "Skip flag — hail is enough", () => {
      const flagged = scenario.hullOver6;
      if (flagged) drawArt(scenario.art, true);
      goFile(scenario, hailed, flagged);
    });
    addButton(scenario.hullOver6 ? "Skip the flag — too busy trimming" : "Fly a red flag anyway", () => {
      const flagged = !scenario.hullOver6;
      if (flagged) drawArt(scenario.art, true);
      goFile(scenario, hailed, flagged);
    });
  }

  function goFile(scenario, hailed, flagged) {
    phaseEl.textContent = "File";
    titleEl.textContent = "Protest desk is open";
    textEl.textContent = `You have ~${scenario.fileWindowSec}s (stub timer) to lodge the written protest.`;
    hintEl.textContent = "Phase 3/4 — Late paperwork = Invalid Wall.";
    clearActions();

    const bar = document.createElement("div");
    bar.style.cssText = "height:8px;background:#243b55;border-radius:999px;overflow:hidden;margin:4px 0 8px;";
    const fill = document.createElement("div");
    fill.style.cssText = "height:100%;width:100%;background:linear-gradient(90deg,#38bdf8,#e11d48);transition:width 0.1s linear;";
    bar.appendChild(fill);
    actionsEl.appendChild(bar);

    let left = scenario.fileWindowSec;
    let filed = false;
    let timer = null;

    const tick = () => {
      left -= 0.1;
      fill.style.width = `${Math.max(0, (left / scenario.fileWindowSec) * 100)}%`;
      if (left <= 0) {
        clearInterval(timer);
        if (!filed) goJury(scenario, hailed, flagged, false);
      }
    };
    timer = setInterval(tick, 100);

    addButton("File written protest now", () => {
      if (filed) return;
      filed = true;
      clearInterval(timer);
      goJury(scenario, hailed, flagged, true);
    }, "btn primary");

    addButton("Finish packing sails first…", () => {
      if (filed) return;
      filed = true;
      clearInterval(timer);
      goJury(scenario, hailed, flagged, false);
    });
  }

  function procedureOk(scenario, hailed, flagged, filed) {
    const hailOk = !scenario.needHail || hailed;
    const flagOk = !scenario.needFlag || flagged;
    return hailOk && flagOk && filed;
  }

  function goJury(scenario, hailed, flagged, filed) {
    phaseEl.textContent = "Jury";
    titleEl.textContent = "Inside the protest room";
    textEl.textContent = scenario.defensePrompt;
    hintEl.textContent = "Phase 4/4 — Model boats + one clean sentence.";
    drawArt(scenario.art, flagged);
    clearActions();

    const proc = procedureOk(scenario, hailed, flagged, filed);
    scenario.defenses.forEach((d) => {
      addButton(d.label, () => {
        clearActions();
        const win = proc && d.ok;
        let gained = 0;
        if (win) {
          gained = d.points + streak * 5;
          score += gained;
          streak += 1;
          showVerdict("good", `${scenario.goodVerdict} · +${gained}`);
        } else if (!proc) {
          streak = 0;
          showVerdict("bad", scenario.badVerdict);
          const shame = document.createElement("p");
          shame.style.cssText = "color:#8aa0b8;font-size:0.88rem;text-align:center;margin-top:6px;";
          shame.textContent = invalidWallLine(hailed, flagged, filed, scenario);
          actionsEl.appendChild(shame);
        } else {
          streak = 0;
          score += d.points;
          showVerdict("mid", `Weak story · ${scenario.badVerdict.replace("Invalid Wall — ", "")} · +${d.points}`);
        }
        setHud();
        addButton(round >= TOTAL_ROUNDS ? "See results" : "Next incident", () => {
          if (round >= TOTAL_ROUNDS) endGame();
          else nextRound();
        }, "btn primary");
      });
    });
  }

  function invalidWallLine(hailed, flagged, filed, scenario) {
    const fails = [];
    if (scenario.needHail && !hailed) fails.push("no hail");
    if (scenario.needFlag && !flagged) fails.push("no red flag");
    if (!filed) fails.push("late / no filing");
    return `Invalid Wall: ${fails.join(" · ") || "procedure chaos"}. Share your shame with the fleet.`;
  }

  function endGame() {
    phaseEl.textContent = "Done";
    if (score > best) {
      best = score;
      localStorage.setItem("prs_best", String(best));
    }
    titleEl.textContent = "Hearing adjourned";
    textEl.textContent = `Final score ${score}. Best on this device: ${best}. Streak peak lived in the room — replay to climb the Invalid Wall less often.`;
    hintEl.textContent = "FAQ below covers hail, flag, filing, and Two-Turns in plain English.";
    drawArt("cross", true);
    clearActions();
    showVerdict(score >= 90 ? "good" : score >= 40 ? "mid" : "bad", score >= 90 ? "Jury respects your paperwork" : score >= 40 ? "Mixed night in the room" : "Procedure practice recommended");
    addButton("Play again", startGame, "btn primary");
    const faq = document.createElement("a");
    faq.href = "#faq";
    faq.className = "btn ghost";
    faq.textContent = "Read protest procedure FAQ";
    actionsEl.appendChild(faq);
  }

  // Boot
  drawArt("cross", false);
  $("btn-start").addEventListener("click", startGame);
  setHud();
})();
