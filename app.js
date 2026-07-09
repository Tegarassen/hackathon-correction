const app = document.querySelector("#app");
const cfg = window.SPOON_CONFIG || { demoMode: true };
const supabaseClient = !cfg.demoMode && cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const mentors = ["Chevish", "Mehreen", "Pratish", "Vinasha", "Diraj", "Ayush", "Ijaaz", "Kevan", "Keshav", "Tega", "Ashutosh", "Semarchy"];
const seed = {
  groups: [
    { id: 1, name: "Group 1", participants: ["Sollinselvan Curpen", "Luvraj Kaundun", "Uzaïrah Bibi Mohung", "Jeevesh Kaleeah", "Lailie Tia Chakowa"] },
    { id: 2, name: "Group 2", participants: ["Vishanraj Daby", "Vamkesh Jeerasoo", "Keashvi Nerisha Bhikoo", "Nahida Rojoa", "Ihsaan Ramjanee"] },
    { id: 3, name: "Group 3", participants: ["Ghanishth Parsad Sewtohul", "Hiresha Rakissoon", "Sivakumara Chengubraydoo", "Smriti Gavina Beharee", "Jerissen Narainen"] },
    { id: 4, name: "Group 4", participants: ["Tejasweenee Doya", "Krishi Narrayen", "Adarsh Nareshsing Bahadoor", "Nilesh Kumar Sahadew", "Vashistha Ittoo", "Medhini Darshee Foolell"] },
    { id: 5, name: "Group 5", participants: ["Ojaswita Nund", "Akash Boodram", "Dushantsingh Ramdass", "Khooshboo Ramdewar", "Muhammad Umair Parthasee", "Vedrajsing Jankee"] }
  ],
  reviewers: mentors,
  questions: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, title: `Question ${i + 1}`, prompt: "Question text can be configured by the administrator." }))
};

let state = JSON.parse(localStorage.getItem("spoon-state-v2") || "null") || {};
state = {
  session: state.session || null,
  activeMentor: state.activeMentor || "Chevish",
  groupCorrections: state.groupCorrections || {},
  individualRemarks: state.individualRemarks || {},
  reports: state.reports || {},
  changeHistory: state.changeHistory || [],
  syncStatus: "loading",
  data: seed
};

let lastAdminMentor = "all";
let refreshTimer = null;

const saveLocal = () => localStorage.setItem("spoon-state-v2", JSON.stringify(state));
const save = saveLocal;
const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const groupById = id => state.data.groups.find(group => group.id === Number(id));
const remoteEnabled = () => Boolean(supabaseClient);

function correctionKey(mentor, groupId, qid) {
  return `${mentor}|${groupId}|${qid}`;
}

function remarkKey(mentor, person, qid) {
  return `${mentor}|${person}|${qid}`;
}

function syncLabel() {
  if (!remoteEnabled()) return cfg.demoMode ? "Preview mode" : "Offline mode";
  if (state.syncStatus === "online") return "Live Supabase";
  if (state.syncStatus === "saving") return "Saving…";
  if (state.syncStatus === "error") return "Sync issue";
  return "Connecting…";
}

function applyGroupCorrectionRow(row) {
  if (!row) return;
  state.groupCorrections[correctionKey(row.mentor_name, row.group_id, row.question_position)] = {
    status: row.status,
    correction: row.correction || "",
    groupRemark: row.group_remark || "",
    updatedAt: row.updated_at,
    remoteId: row.id
  };
}

function removeGroupCorrectionRow(row) {
  if (!row) return;
  delete state.groupCorrections[correctionKey(row.mentor_name, row.group_id, row.question_position)];
}

function applyIndividualRemarkRow(row) {
  if (!row) return;
  const key = remarkKey(row.mentor_name, row.participant_name, row.question_position);
  if (row.remark?.trim()) state.individualRemarks[key] = row.remark;
  else delete state.individualRemarks[key];
}

function removeIndividualRemarkRow(row) {
  if (!row) return;
  delete state.individualRemarks[remarkKey(row.mentor_name, row.participant_name, row.question_position)];
}

function applyReportRow(row) {
  if (!row) return;
  state.reports[row.report_key] = row.content || "";
}

function removeReportRow(row) {
  if (!row) return;
  delete state.reports[row.report_key];
}

async function loadSharedData() {
  if (!remoteEnabled()) {
    state.syncStatus = cfg.demoMode ? "demo" : "offline";
    saveLocal();
    return;
  }

  state.syncStatus = "loading";
  saveLocal();

  try {
    const [corrections, remarks, reports, history] = await Promise.all([
      supabaseClient.from("group_corrections").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("individual_remarks").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("ai_reports").select("*").order("generated_at", { ascending: false }),
      supabaseClient.from("change_history").select("*").order("changed_at", { ascending: false }).limit(50)
    ]);

    for (const result of [corrections, remarks, reports, history]) {
      if (result.error) throw result.error;
    }

    state.groupCorrections = {};
    state.individualRemarks = {};
    state.reports = {};

    corrections.data.forEach(applyGroupCorrectionRow);
    remarks.data.forEach(applyIndividualRemarkRow);
    reports.data.forEach(applyReportRow);
    state.changeHistory = history.data || [];
    state.syncStatus = "online";
    saveLocal();
  } catch (error) {
    console.error("Supabase load failed", error);
    state.syncStatus = "error";
    saveLocal();
    showToast("Could not load Supabase data. Using local copy.");
  }
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    saveLocal();
    const formOpen = Boolean(document.querySelector("#group-review-form"));
    if (location.hash === "#admin" && state.session?.role === "admin") {
      adminDashboard(lastAdminMentor);
      return;
    }
    if (!formOpen) mentorDashboard();
  }, 350);
}

function subscribeSharedData() {
  if (!remoteEnabled()) return;

  supabaseClient
    .channel("spoon-review-hub")
    .on("postgres_changes", { event: "*", schema: "public", table: "group_corrections" }, payload => {
      if (payload.eventType === "DELETE") removeGroupCorrectionRow(payload.old);
      else applyGroupCorrectionRow(payload.new);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "individual_remarks" }, payload => {
      if (payload.eventType === "DELETE") removeIndividualRemarkRow(payload.old);
      else applyIndividualRemarkRow(payload.new);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "ai_reports" }, payload => {
      if (payload.eventType === "DELETE") removeReportRow(payload.old);
      else applyReportRow(payload.new);
      scheduleRefresh();
    })
    .subscribe(status => {
      if (status === "SUBSCRIBED") {
        state.syncStatus = "online";
        saveLocal();
      }
    });
}

async function persistReview(group, qid, formData) {
  if (!remoteEnabled()) return;

  state.syncStatus = "saving";
  scheduleRefresh();

  const correctionPayload = {
    group_id: group.id,
    group_name: group.name,
    question_position: qid,
    mentor_name: state.activeMentor,
    status: formData.status,
    correction: formData.correction || "",
    group_remark: formData.groupRemark || ""
  };

  const { error: correctionError } = await supabaseClient
    .from("group_corrections")
    .upsert(correctionPayload, { onConflict: "group_id,question_position,mentor_name" });

  if (correctionError) throw correctionError;

  const remarkJobs = group.participants.map(person => {
    const value = formData[`remark::${person}`]?.trim() || "";
    const base = {
      group_id: group.id,
      group_name: group.name,
      participant_name: person,
      question_position: qid,
      mentor_name: state.activeMentor
    };

    if (!value) {
      return supabaseClient
        .from("individual_remarks")
        .delete()
        .eq("group_id", group.id)
        .eq("participant_name", person)
        .eq("question_position", qid)
        .eq("mentor_name", state.activeMentor);
    }

    return supabaseClient
      .from("individual_remarks")
      .upsert({ ...base, remark: value }, { onConflict: "group_id,participant_name,question_position,mentor_name" });
  });

  const remarkResults = await Promise.all(remarkJobs);
  const remarkError = remarkResults.find(result => result.error)?.error;
  if (remarkError) throw remarkError;

  state.syncStatus = "online";
  saveLocal();
}

async function persistReports() {
  if (!remoteEnabled()) return;

  const rows = [];
  state.data.groups.forEach(group => {
    rows.push({
      report_key: `group|${group.id}`,
      report_type: "group",
      group_id: group.id,
      group_name: group.name,
      participant_name: null,
      content: state.reports[`group|${group.id}`] || buildGroupSummary(group)
    });
    group.participants.forEach(person => {
      rows.push({
        report_key: `person|${person}`,
        report_type: "person",
        group_id: group.id,
        group_name: group.name,
        participant_name: person,
        content: state.reports[`person|${person}`] || buildPersonFeedback(person)
      });
    });
  });

  const { error } = await supabaseClient.from("ai_reports").upsert(rows, { onConflict: "report_key" });
  if (error) throw error;
}

function shell(content) {
  const { name, role } = state.session;
  const accountControls = role === "admin"
    ? `<span>${esc(name)}</span><span class="role">Admin</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="logout">Log out</button>`
    : `<span class="role">Public mentor form</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="admin-login">Admin</button>`;
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><img class="spoon-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"><span class="product-name">Hackathon Review Hub</span></div><div class="userbox">${accountControls}</div></header>${content}</div>`;
}

function loginView(message = "") {
  app.innerHTML = `<main class="login"><section class="login-art"><div class="brand"><img class="spoon-logo login-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"></div><div><p class="eyebrow">Protected area</p><h1>Admin.<br><span style="color:#12aaa3">Reports.</span><br><span class="orange-text">Insights.</span></h1><p class="subtle login-copy">Mentor forms are public. Consolidated feedback and participant reports remain in the protected administrator area.</p></div><button class="secondary public-return" data-action="public-form">← Return to public mentor form</button></section><section class="login-panel"><form class="login-card" id="login-form"><p class="eyebrow">Administrator access</p><h2>Admin sign in</h2><p class="subtle">Sign in to view assembled feedback and AI reports.</p>${message ? `<div class="notice">${esc(message)}</div>` : ""}<label>Email<input name="email" type="email" placeholder="admin@spoonconsulting.com" required></label><label>Password<input name="password" type="password" placeholder="••••••••" required></label><button class="primary" type="submit">Sign in</button>${cfg.demoMode ? `<div class="demo-note"><strong>Preview mode</strong><br>Use any email with password <code>admin</code>.</div>` : `<div class="demo-note"><strong>Temporary admin</strong><br>Use password <code>admin</code> until Supabase Auth is enabled.</div>`}</form></section></main>`;
}

function mentorTabs() {
  return `<div class="mentor-tabs" aria-label="Mentor workspaces">${mentors.map(name => `<button class="mentor-tab ${state.activeMentor === name ? "active" : ""}" data-mentor="${name}"><span>${name.slice(0, 1)}</span>${name}</button>`).join("")}</div>`;
}

function groupState(group) {
  const completed = state.data.questions.filter(q => state.groupCorrections[correctionKey(state.activeMentor, group.id, q.id)]?.status).length;
  const firstMissing = state.data.questions.find(q => !state.groupCorrections[correctionKey(state.activeMentor, group.id, q.id)]?.status)?.id || 1;
  if (completed === 0) return { label: "Not started", tone: "new", detail: "Start", completed, resume: 1 };
  if (completed === state.data.questions.length) return { label: "Completed", tone: "complete", detail: "Review", completed, resume: 1 };
  return { label: "In progress", tone: "started", detail: `Resume Q${firstMissing}`, completed, resume: firstMissing };
}

function mentorDashboard() {
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Review steps"><span class="active">1 <b>Mentor</b></span><i></i><span>2 <b>Choose group</b></span><i></i><span>3 <b>Give feedback</b></span></nav><section class="mentor-choice"><p class="eyebrow orange-eyebrow">Start here</p><h1>Choose your mentor name</h1><p>Tap your name below. We’ll remember it on this device.</p>${mentorTabs()}</section><section class="group-heading"><div><span class="selected-mentor"><i>${state.activeMentor[0]}</i> Reviewing as <strong>${esc(state.activeMentor)}</strong></span><h2>Choose a group</h2></div><div class="status-key"><span><i class="new"></i>Not started</span><span><i class="started"></i>In progress</span><span><i class="complete"></i>Completed</span></div></section><section class="group-list">${state.data.groups.map(group => { const gs = groupState(group); return `<button class="group-row" data-group-review="${group.id}" data-resume-q="${gs.resume}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small>${group.participants.length} participants · ${gs.completed}/20 questions</small></span><span class="group-status ${gs.tone}"><i></i>${gs.label}<small>${gs.detail}</small></span><span class="row-arrow">→</span></button>`; }).join("")}</section><p class="help-line">In progress groups automatically resume at the first unanswered question. Shared Supabase data updates when mentors save.</p></main>`);
}

function correctionView(groupId, qid = 1) {
  const group = groupById(groupId);
  const q = state.data.questions.find(item => item.id === Number(qid));
  const correction = state.groupCorrections[correctionKey(state.activeMentor, group.id, q.id)] || {};
  shell(`<main class="page guided-review"><nav class="journey" aria-label="Review steps"><span class="done">✓ <b>Mentor</b></span><i></i><span class="done">✓ <b>${esc(group.name)}</b></span><i></i><span class="active">3 <b>Question ${q.id}</b></span></nav><div class="review-toolbar"><button class="back-link" data-action="dashboard">← Change group</button><div class="question-progress"><span>Question ${q.id} of ${state.data.questions.length}</span><div><i style="width:${q.id / state.data.questions.length * 100}%"></i></div></div><span class="autosave-note">✓ Saves to Supabase when you continue</span></div><details class="question-jump"><summary>Jump to another question</summary><div class="question-nav">${state.data.questions.map(item => `<button class="qdot ${state.groupCorrections[correctionKey(state.activeMentor, group.id, item.id)]?.status ? "done" : ""} ${item.id === q.id ? "active" : ""}" data-group-q="${group.id}" data-q="${item.id}">${item.id}</button>`).join("")}</div></details><section class="workflow"><form id="group-review-form" data-group="${group.id}" data-q="${q.id}"><article class="card question-card"><p class="eyebrow">${esc(group.name)}</p><h1>${esc(q.title)}</h1><p class="subtle">${esc(q.prompt)}</p><div class="section-label"><span>1</span><div><strong>How did the group do?</strong><small>Choose one answer</small></div></div><div class="status-row">${["correct", "partial", "incorrect"].map(status => `<button type="button" class="status ${correction.status === status ? "selected" : ""}" data-status="${status}">${status === "partial" ? "Partly correct" : status[0].toUpperCase() + status.slice(1)}</button>`).join("")}</div><input type="hidden" name="status" value="${correction.status || ""}"><label>Correction or model answer <small class="optional">Optional</small><textarea name="correction" placeholder="What is the correct answer or approach?">${esc(correction.correction)}</textarea></label><label>Group observation <small class="optional">Optional</small><textarea name="groupRemark" placeholder="What did the group do well, or what should they improve?">${esc(correction.groupRemark)}</textarea></label></article><article class="card individual-card"><div class="section-label"><span>2</span><div><strong>Any personal remarks?</strong><small>Optional — leave blank if none</small></div></div><div class="remark-list">${group.participants.map(person => { const remark = state.individualRemarks[remarkKey(state.activeMentor, person, q.id)] || ""; return `<label>${esc(person)}<textarea class="compact" name="remark::${esc(person)}" placeholder="Short, constructive feedback…">${esc(remark)}</textarea></label>`; }).join("")}</div></article><div class="sticky-actions"><button class="secondary" type="submit" name="destination" value="dashboard">Save & leave</button><button class="primary" type="submit" name="destination" value="next">${q.id === state.data.questions.length ? "Finish group ✓" : "Save & continue →"}</button></div></form></section></main>`);
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function buildGroupSummary(group) {
  const entries = Object.entries(state.groupCorrections).filter(([key]) => key.split("|")[1] === String(group.id)).map(([, value]) => value);
  if (!entries.length) return "No mentor corrections have been submitted yet.";
  const counts = entries.reduce((acc, item) => ((acc[item.status] = (acc[item.status] || 0) + 1), acc), {});
  const observations = entries.map(item => item.groupRemark).filter(Boolean);
  return `${entries.length} mentor-question assessments assembled: ${counts.correct || 0} correct, ${counts.partial || 0} partial and ${counts.incorrect || 0} incorrect. ${observations.length ? `Recurring observations include: ${observations.slice(0, 3).join(" · ")}` : "Add group observations to enrich the AI summary."}`;
}

function buildPersonFeedback(person) {
  const remarks = Object.entries(state.individualRemarks).filter(([key, value]) => key.split("|")[1] === person && value.trim()).map(([key, value]) => ({ mentor: key.split("|")[0], text: value }));
  if (!remarks.length) return "No individual feedback has been submitted yet.";
  return `${remarks.length} remarks assembled from ${new Set(remarks.map(x => x.mentor)).size} mentor(s). ${remarks.slice(0, 4).map(x => `${x.mentor}: ${x.text}`).join(" · ")}`;
}

function historyList() {
  if (!state.changeHistory.length) return `<p class="subtle">No Supabase history yet. Changes will appear here after mentors save.</p>`;
  return `<div class="mentor-inputs history-list">${state.changeHistory.slice(0, 12).map(item => `<div><span class="avatar">${esc((item.mentor_name || "?").slice(0, 1))}</span><strong>${esc(item.mentor_name || "System")}</strong><small>${esc(item.action)} ${esc(item.table_name)} · ${esc(item.group_name || "")}${item.question_position ? ` · Q${item.question_position}` : ""}<br>${new Date(item.changed_at).toLocaleString()}</small></div>`).join("")}</div>`;
}

function adminDashboard(selectedMentor = "all") {
  lastAdminMentor = selectedMentor;
  const totalCorrections = Object.keys(state.groupCorrections).length;
  const totalRemarks = Object.values(state.individualRemarks).filter(Boolean).length;
  shell(`<main class="page admin-page"><section class="hero"><div><p class="eyebrow">Admin command centre</p><h1>Assembled feedback</h1></div><button class="primary" data-action="generate-reports">✦ Generate AI summaries</button></section><section class="stats"><div class="stat"><strong>${mentors.length}</strong><span>Mentor workspaces</span></div><div class="stat"><strong>${totalCorrections}</strong><span>Group corrections</span></div><div class="stat"><strong>${totalRemarks}</strong><span>Individual remarks</span></div><div class="stat"><strong>${Object.keys(state.reports).length}</strong><span>Generated summaries</span></div></section><div class="report-tabs"><button class="report-tab ${selectedMentor === "all" ? "active" : ""}" data-admin-mentor="all">All mentors</button>${mentors.map(name => `<button class="report-tab ${selectedMentor === name ? "active" : ""}" data-admin-mentor="${name}">${name}</button>`).join("")}</div><section class="report-stack"><article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Audit trail</p><h2>Recent mentor changes</h2></div><span class="ai-badge">${esc(syncLabel())}</span></div>${historyList()}</article>${state.data.groups.map(group => `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)}</p><h2>Group summary</h2></div><span class="ai-badge">✦ AI assembled</span></div><p class="summary-text">${esc(state.reports[`group|${group.id}`] || buildGroupSummary(group))}</p><h3>Individual feedback</h3><div class="individual-grid">${group.participants.map(person => `<div class="feedback-tile"><strong>${esc(person)}</strong><p>${esc(state.reports[`person|${person}`] || buildPersonFeedback(person))}</p></div>`).join("")}</div><details><summary>View mentor-by-mentor input</summary><div class="mentor-inputs">${mentors.filter(name => selectedMentor === "all" || name === selectedMentor).map(name => { const count = Object.keys(state.groupCorrections).filter(k => k.startsWith(`${name}|${group.id}|`)).length; return `<div><span class="avatar">${name[0]}</span><strong>${name}</strong><small>${count}/20 group corrections</small></div>`; }).join("")}</div></details></article>`).join("")}</section></main>`);
}

function openPublicForm() {
  history.replaceState(null, "", location.pathname);
  state.session = { name: state.activeMentor, role: "mentor" };
  save();
  mentorDashboard();
}

function dashboard() {
  if (location.hash === "#admin") return state.session?.role === "admin" ? adminDashboard(lastAdminMentor) : loginView();
  openPublicForm();
}

document.addEventListener("submit", async event => {
  event.preventDefault();

  if (event.target.id === "login-form") {
    const data = Object.fromEntries(new FormData(event.target));
    if (data.password !== "admin") return loginView("For now, use the password “admin”.");
    const rawName = data.email.split("@")[0];
    state.session = { name: rawName, email: data.email, role: "admin" };
    save();
    return dashboard();
  }

  if (event.target.id === "group-review-form") {
    const submitter = event.submitter;
    const data = Object.fromEntries(new FormData(event.target));
    data.destination = submitter?.value || data.destination || "next";
    if (!data.status) return alert("Choose the group assessment first.");

    const group = groupById(event.target.dataset.group);
    const qid = Number(event.target.dataset.q);
    state.groupCorrections[correctionKey(state.activeMentor, group.id, qid)] = {
      status: data.status,
      correction: data.correction,
      groupRemark: data.groupRemark,
      updatedAt: new Date().toISOString()
    };
    group.participants.forEach(person => {
      const value = data[`remark::${person}`]?.trim();
      const key = remarkKey(state.activeMentor, person, qid);
      if (value) state.individualRemarks[key] = value;
      else delete state.individualRemarks[key];
    });
    save();

    try {
      await persistReview(group, qid, data);
      showToast(remoteEnabled() ? "✓ Feedback saved to Supabase" : "✓ Feedback saved locally");
    } catch (error) {
      console.error("Save failed", error);
      state.syncStatus = "error";
      save();
      showToast("Saved locally, but Supabase sync failed.");
    }

    if (data.destination === "dashboard" || qid === state.data.questions.length) mentorDashboard();
    else correctionView(group.id, qid + 1);
  }
});

document.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "logout") openPublicForm();
  if (button.dataset.action === "admin-login") {
    location.hash = "admin";
    state.session = { name: "", role: "mentor" };
    save();
    loginView();
  }
  if (button.dataset.action === "public-form") openPublicForm();
  if (button.dataset.action === "dashboard") dashboard();
  if (button.dataset.mentor) {
    state.activeMentor = button.dataset.mentor;
    state.session.name = state.activeMentor;
    save();
    mentorDashboard();
  }
  if (button.dataset.groupReview) correctionView(button.dataset.groupReview, Number(button.dataset.resumeQ || 1));
  if (button.dataset.groupQ) correctionView(button.dataset.groupQ, Number(button.dataset.q));
  if (button.dataset.status) {
    document.querySelectorAll(".status").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    document.querySelector('input[name="status"]').value = button.dataset.status;
  }
  if (button.dataset.adminMentor) adminDashboard(button.dataset.adminMentor);
  if (button.dataset.action === "generate-reports") {
    state.data.groups.forEach(group => {
      state.reports[`group|${group.id}`] = buildGroupSummary(group);
      group.participants.forEach(person => state.reports[`person|${person}`] = buildPersonFeedback(person));
    });
    save();

    try {
      await persistReports();
      showToast(remoteEnabled() ? "✓ Reports saved to Supabase" : "✓ Reports generated locally");
    } catch (error) {
      console.error("Report save failed", error);
      showToast("Reports generated locally, but Supabase sync failed.");
    }

    adminDashboard(lastAdminMentor);
  }
});

document.addEventListener("change", event => {
  if (event.target.id !== "mentor-select") return;
  state.activeMentor = event.target.value;
  state.session = { name: state.activeMentor, role: "mentor" };
  save();
  mentorDashboard();
  showToast(`Now reviewing as ${state.activeMentor}`);
});

async function boot() {
  if (!state.session) state.session = { name: state.activeMentor, role: "mentor" };
  dashboard();
  await loadSharedData();
  subscribeSharedData();
  dashboard();
}

boot();
