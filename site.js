(function () {
  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Copy buttons: data-copy holds the text, or data-copy-from points at an element
  function copyText(text, btn) {
    var done = function () {
      var label = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = label; }, 1600);
    };
    var fallback = function () {
      var target = btn.dataset.copyFrom ? document.querySelector(btn.dataset.copyFrom) : null;
      if (target) {
        var range = document.createRange();
        range.selectNodeContents(target);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      btn.textContent = "Press ⌘/Ctrl + C";
    };
    try {
      navigator.clipboard.writeText(text).then(done, fallback);
    } catch (e) { fallback(); }
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy], [data-copy-from]");
    if (!btn) return;
    var text = btn.dataset.copy;
    if (!text && btn.dataset.copyFrom) {
      var el = document.querySelector(btn.dataset.copyFrom);
      text = el ? el.textContent : "";
    }
    copyText(text, btn);
  });

  // Home: voice-to-ticket demo
  var demo = document.getElementById("demo");
  if (demo) {
    var examples = [
      {
        lang: "Español", code: "es", dir: "ltr",
        said: "Hay un bache enorme en la esquina de Main y la Tercera. Casi me caigo con la bicicleta.",
        id: "SC-24-08713", cat: "PTH · Pothole", sev: ["high", "High · cyclist hazard"],
        en: "Large pothole at Main St & 3rd Ave. Cyclist nearly fell.",
        loc: "Main St & 3rd Ave · 42.3601° N, 71.0589° W",
        route: "Public Works · Street Maintenance", dupes: "2 nearby reports merged"
      },
      {
        lang: "English", code: "en", dir: "ltr",
        said: "The streetlight outside 214 Elm has been out for a week and the crosswalk is pitch black at night.",
        id: "SC-24-08714", cat: "LGT · Streetlight out", sev: ["crit", "Critical · dark crosswalk"],
        en: "Streetlight out for ~7 days at a marked crosswalk.",
        loc: "214 Elm St · 42.3588° N, 71.0612° W",
        route: "Street Lighting Division", dupes: "5 nearby reports merged"
      },
      {
        lang: "Português", code: "pt", dir: "ltr",
        said: "A calçada da Rua Central está quebrada e uma senhora com andador não consegue passar.",
        id: "SC-24-08715", cat: "SWK · Sidewalk / curb ramp", sev: ["high", "High · accessibility"],
        en: "Broken sidewalk on Central St blocks a pedestrian using a walker.",
        loc: "Central St, mid-block · 42.3622° N, 71.0570° W",
        route: "Sidewalks & ADA Compliance", dupes: "No duplicates"
      },
      {
        lang: "中文", code: "zh", dir: "ltr",
        said: "公交站旁边的排水沟堵了，下雨后整个路口都是水。",
        id: "SC-24-08716", cat: "DRN · Storm drain", sev: ["high", "High · flooding at bus stop"],
        en: "Storm drain by the bus stop is clogged; the intersection floods after rain.",
        loc: "Harbor Ave bus stop · 42.3575° N, 71.0551° W",
        route: "Water & Sewer · Storm Drains", dupes: "1 nearby report merged"
      },
      {
        lang: "العربية", code: "ar", dir: "rtl",
        said: "إشارة المرور عند المدرسة لا تعمل منذ الصباح.",
        id: "SC-24-08717", cat: "SIG · Traffic signal", sev: ["crit", "Critical · school zone"],
        en: "Traffic signal at the school has been out since this morning.",
        loc: "Lincoln Elementary, Oak St · 42.3640° N, 71.0598° W",
        route: "Traffic Signals · Emergency Crew", dupes: "8 nearby reports merged"
      }
    ];
    var chips = demo.querySelectorAll(".chip-btn");
    var swaps = demo.querySelectorAll(".fade-swap");
    var f = function (name) { return demo.querySelector('[data-f="' + name + '"]'); };
    var current = 0, timer = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function render(i) {
      var x = examples[i];
      var q = f("said");
      q.textContent = "“" + x.said + "”";
      q.setAttribute("dir", x.dir);
      q.setAttribute("lang", x.code);
      f("lang").textContent = "Detected: " + x.lang;
      f("id").textContent = x.id;
      f("cat").textContent = x.cat;
      f("en").textContent = x.en;
      f("loc").textContent = x.loc;
      f("route").textContent = x.route;
      f("dupes").textContent = x.dupes;
      var sev = f("sev");
      sev.className = "pill " + x.sev[0];
      sev.textContent = x.sev[1];
      chips.forEach(function (c, ci) { c.setAttribute("aria-selected", ci === i ? "true" : "false"); });
    }
    function show(i) {
      current = i;
      if (reduce) { render(i); return; }
      swaps.forEach(function (s) { s.classList.add("is-out"); });
      setTimeout(function () {
        render(i);
        swaps.forEach(function (s) { s.classList.remove("is-out"); });
      }, 300);
    }
    chips.forEach(function (c, ci) {
      c.addEventListener("click", function () {
        if (timer) { clearInterval(timer); timer = null; }
        show(ci);
      });
    });
    render(0);
    if (!reduce) {
      timer = setInterval(function () { show((current + 1) % examples.length); }, 6500);
    }
  }

  // Contact form: compose a message the visitor can copy or open in their mail app
  var form = document.getElementById("contact-form");
  if (form) {
    var out = document.getElementById("ready");
    var pre = document.getElementById("ready-text");
    var mail = document.getElementById("ready-mail");
    var err = document.getElementById("form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["c-name"].value.trim();
      var org = form.elements["c-org"].value.trim();
      var role = (form.querySelector('input[name="c-role"]:checked') || {}).value || "Other";
      var msg = form.elements["c-msg"].value.trim();
      if (!name || !msg) {
        err.hidden = false;
        err.textContent = !name ? "Add your name so we know who to reply to." : "Add a short message about what you need.";
        (!name ? form.elements["c-name"] : form.elements["c-msg"]).focus();
        return;
      }
      err.hidden = true;
      var subject = "SayCity: " + role + " inquiry from " + name;
      var body = "Name: " + name + "\n" + (org ? "Organization: " + org + "\n" : "") + "I am: " + role + "\n\n" + msg;
      pre.textContent = "Subject: " + subject + "\n\n" + body;
      mail.href = "mailto:amohaghegh1@babson.edu?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      out.hidden = false;
      out.scrollIntoView({ behavior: reduce2() ? "auto" : "smooth", block: "nearest" });
    });
    function reduce2() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  }
})();
