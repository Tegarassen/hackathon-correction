const app = document.querySelector("#app");
const cfg = window.SPOON_CONFIG || { demoMode: true };
const supabaseClient = !cfg.demoMode && cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const defaultMentors = ["Chevish", "Mehreen", "Pratish", "Vinasha", "Diraj", "Ayush", "Ijaaz", "Kevan", "Keshav", "Tega", "Ashutosh", "Semarchy"];
const defaultJuries = ["Varun", "Naushine", "Suraj", "Urvashi", "Farzanah", "Irfaan", "Diraj", "Kevan", "Keshav", "Tega", "Ashutosh", "Semarchy", "Noorvesh"];
const miniProjectTopics = [
  {
    key: "smart_budget_moris",
    title: "Smart Budget Moris",
    subtitle: "Making the National Budget Clear for Every Citizen",
    brief: "Design and implement an app that helps Mauritian citizens understand the National Budget by simplifying public spending, explaining key government measures, and showing how budget decisions affect households, students, workers, businesses, and vulnerable communities in daily life.",
    bonus: "Use AI to explain budget measures in simple language and show how they may affect different citizen profiles such as students, parents, workers, pensioners, and small business owners."
  },
  {
    key: "health_alert_mauritius",
    title: "Health Alert Mauritius",
    subtitle: "Early Awareness for a Safer Nation",
    brief: "Design and implement an app that informs Mauritians about public health risks such as dengue, flu, chikungunya, and other outbreaks, while sharing prevention tips, nearby health resources, symptoms to watch for, and real-time awareness alerts to help citizens stay safe.",
    bonus: "Use AI to guide users based on symptoms, explain possible health risks in simple terms, and recommend safe next steps such as prevention, monitoring, or seeking medical help."
  },
  {
    key: "water_wise_moris",
    title: "Water Wise Moris",
    subtitle: "Helping Citizens Save, Monitor, and Prepare",
    brief: "Design and implement an app that helps citizens in Mauritius monitor water availability, understand reservoir levels, receive water cut alerts, learn water-saving habits, and prepare households during shortages or drought periods.",
    bonus: "Use AI to analyse household water habits and generate personalised water-saving advice during shortages, droughts, or scheduled water cuts."
  }
];
const miniProjectCriteria = [
  { key: "usability_design", legacyKeys: ["usability", "design"], label: "Usability & Design", max: 4, prompt: "Easy to use, visually clear, and comfortable for citizens of different ages.", questions: ["Can a non-technical citizen understand what to do within a few seconds?", "Are navigation, labels, buttons, and next steps obvious?", "Is the interface clean, consistent, and readable on laptop and mobile?", "Does the visual hierarchy guide the user to the most important information?", "Would an elderly person or first-time user feel confident using it without help?"] },
  { key: "content", label: "Content & Citizen Value", max: 3, prompt: "Information is accurate, simplified, relevant, and useful for citizens.", questions: ["Is the information simplified without becoming misleading?", "Does it focus on what citizens actually need to know or decide?", "Is the message clear, useful, and relevant to the chosen theme?", "Can the team explain where the data/content came from?", "Does it avoid jargon, or explain technical terms in plain language?"] },
  { key: "interactivity_performance", legacyKeys: ["interactivity", "performance"], label: "Interactivity & Performance", max: 5, prompt: "The app feels responsive and lets citizens explore, compare, or understand impact.", questions: ["Can users explore, filter, search, compare, or personalize information?", "Does each interaction give clear and immediate feedback?", "Does the app help citizens understand how the topic affects them personally?", "Does it load quickly and remain smooth during the demo?", "Does it work well on both desktop and mobile without broken layouts or freezes?"] },
  { key: "innovation", label: "Innovation", max: 2, prompt: "The idea presents public information in a creative, memorable, or unusually accessible way.", questions: ["Is the concept fresh, memorable, or different from a basic information page?", "Does it make a complex topic easier to understand?", "Is there a creative journey, visualization, metaphor, interaction, or storytelling approach?", "Would citizens remember this experience after the demo?"] },
  { key: "collaboration", label: "Collaboration", max: 2, prompt: "The team worked effectively and combined their work into one coherent product.", questions: ["Can the team clearly explain who contributed what?", "Did they use sensible workflow, planning, versioning, or task-sharing practices?", "Does the final product feel integrated rather than stitched together last minute?", "Did the demo show shared ownership and good communication?"] },
  { key: "backend", label: "BackEnd", max: 2, prompt: "Backend stores, manages, protects, and serves useful app data.", questions: ["Is important data stored outside hard-coded static content?", "Can the app create, read, update, or serve data reliably?", "Is the backend structure understandable and appropriate for the project?", "Could the data be maintained or updated after the hackathon?"] },
  { key: "ai_bonus", label: "Bonus: AI", max: 2, prompt: "AI is used meaningfully to improve the citizen experience.", questions: ["Does AI add real value instead of being decorative?", "Does it help users summarize, ask questions, discover insights, or make better decisions?", "Are AI outputs understandable, useful, and connected to the app goal?", "Is the AI use responsible, with sensible limits or clear expectations?"] }
];
const miniProjectTotal = miniProjectCriteria.reduce((sum, item) => sum + item.max, 0);
const seed = {
  groups: [
    { id: 1, name: "Group 1", participants: ["Sollinselvan Curpen", "Luvraj Kaundun", "Uzaïrah Bibi Mohung", "Jeevesh Kaleeah", "Lailie Tia Chakowa"] },
    { id: 2, name: "Group 2", participants: ["Vishanraj Daby", "Vamkesh Jeerasoo", "Keashvi Nerisha Bhikoo", "Nahida Rojoa", "Ihsaan Ramjanee"] },
    { id: 3, name: "Group 3", participants: ["Ghanishth Parsad Sewtohul", "Hiresha Rakissoon", "Sivakumara Chengubraydoo", "Smriti Gavina Beharee", "Jerissen Narainen"] },
    { id: 4, name: "Group 4", participants: ["Tejasweenee Doya", "Krishi Narrayen", "Adarsh Nareshsing Bahadoor", "Nilesh Kumar Sahadew", "Vashistha Ittoo", "Medhini Darshee Foolell"] },
    { id: 5, name: "Group 5", participants: ["Ojaswita Nund", "Akash Boodram", "Dushantsingh Ramdass", "Khooshboo Ramdewar", "Muhammad Umair Parthasee", "Vedrajsing Jankee"] }
  ],
  reviewers: defaultMentors,
  questions: [
    { id: 1, title: "Question 1 — Sums", prompt: "Sums", maxMarks: 2 },
    { id: 2, title: "Question 2 — GCD", prompt: "GCD", maxMarks: 3 },
    { id: 3, title: "Question 3 — Decryption", prompt: "Decryption", maxMarks: 7 },
    { id: 4, title: "Question 4 — Sophie Germain", prompt: "Sophie Germain", maxMarks: 8 },
    { id: 5, title: "Question 5 — Anonymous", prompt: "Anonymous", maxMarks: 6 },
    { id: 6, title: "Question 6 — Calculatrice", prompt: "Calculatrice", maxMarks: 9 },
    { id: 7, title: "Question 7 — Nouvelle langue", prompt: "Nouvelle langue", maxMarks: 6 },
    { id: 8, title: "Question 8 — JSON", prompt: "JSON", maxMarks: 4 },
    { id: 9, title: "Question 9 — Message", prompt: "Message", maxMarks: 7 },
    { id: 10, title: "Question 10 — SQL Challenge", prompt: "SQL Challenge", maxMarks: 10 },
    { id: 11, title: "Question 11 — Smart Snake Game", prompt: "Smart Snake Game", maxMarks: 10 },
    { id: 12, title: "Question 12 — Book Aggregator", prompt: "Book Aggregator", maxMarks: 8 },
    { id: 13, title: "Question 13 — Leet Speak", prompt: "Leet Speak", maxMarks: 3 }
  ]
};

const madaOffices = ["Diego", "Fina", "Tana"];
const madaGroupsSeed = [
  { id: 1, name: "Diego Group 1", office: "Diego", participants: ["ANDRY Nizwami Ibrahim", "RANAIVOSOA Edwino"] },
  { id: 2, name: "Fina Group 1", office: "Fina", participants: ["ANDRITIANA Saotra Idealilalaina", "RAZAFINATOANDRO Ando Henri", "ANDRIANTSILAVINA Tsiferana Heritsilavo", "AMBOARAMPITIAVANA Nomena Sarobidy"] },
  { id: 3, name: "Fina Group 2", office: "Fina", participants: ["RAKOTONIRINA Andrianina Laïscia", "BEMAZAVA julio", "RALAIVAO Ambinintsoa Francky", "VALISOAFANDRESENA Setraniaina Andriamampiandra"] },
  { id: 4, name: "Tana Group 1", office: "Tana", participants: ["ANDRIANARIVONY Zo Michaël", "RAKOTOARISOA Andy Ny Rindra", "MBOLATSIORY Rihantiana Tiarintsoa", "VOLOLONIRINA Doris Sylvie", "RANDRIANARIVELO Stéphan"] },
  { id: 5, name: "Tana Group 2", office: "Tana", participants: ["MAMPIONONA Njakarimanana Nerson", "RABENARIVO Ryan Lizka", "Rakotonirina Tahina Fanomezantsoa", "RAZAFIMAMY Antonino Iraky Ny Avo", "RATOVONJOELY Ny Ando Irintsoa"] }
];
const madaJuriesSeed = [
  { name: "Jhonny Raherison", office: "Tana" },
  { name: "Tojonirina Rarivoarison (Tojo)", office: "Tana" },
  { name: "Gianna Ramasombazaha", office: "Tana" },
  { name: "Joël Randrianarivelo", office: "Tana" },
  { name: "Kintana Andriambololona", office: "Fina" },
  { name: "Tovonirina Andrianarivelo (Tovo)", office: "Fina" },
  { name: "Ya'sin Figuelia", office: "Diego" },
  { name: "Hermeland Botrahaly", office: "Diego" }
];
const madaTopics = [
  {
    key: "cyclone_ready_mada",
    title: "Cyclone Ready Mada",
    subtitle: "Helping Citizens Prepare, Report, and Recover",
    brief: "Design and implement an app that helps citizens in Madagascar prepare for cyclones, receive safety alerts, find nearby shelters, report damage, and access recovery information after disasters such as Cyclone Gezani and Cyclone Fytia.",
    bonus: "Integrate AI to explain cyclone warnings in simple language and generate personalised safety advice for families, students, elderly people, and people living in high-risk areas."
  },
  {
    key: "food_wise_madagascar",
    title: "Food Wise Madagascar",
    subtitle: "Understanding Food Prices and Hunger Risks",
    brief: "Design and implement an app that helps citizens and authorities understand food prices and hunger risks across Madagascar.",
    bonus: "Use AI to help citizens interpret food price trends and understand hunger-risk warnings in plain language."
  },
  {
    key: "water_power_watch_mada",
    title: "Water & Power Watch Mada",
    subtitle: "Helping Citizens Track Service Cuts",
    brief: "Design and implement an app that helps citizens track water and power service cuts across Madagascar.",
    bonus: "Use AI to help citizens understand outage patterns and get plain-language guidance during water or power cuts."
  }
];
// Spoon Madagascar mini-project scoring intentionally mirrors Mauritius exactly — the
// same 7 criteria object, the same max marks per criterion, and the same combined
// total (the AI criterion counts toward the total, it is not tracked separately),
// so both events are judged on an identical scale.
const madaCriteria = miniProjectCriteria;
const madaProjectTotal = miniProjectTotal;

let state = JSON.parse(localStorage.getItem("spoon-state-v2") || "null") || {};
state = {
  session: state.session || null,
  activeMentor: state.activeMentor || "Chevish",
  mentorAccessUnlocked: state.mentorAccessUnlocked === true,
  mentorAccessCode: state.mentorAccessCode || "",
  mentorAccessMentor: state.mentorAccessMentor || "",
  mentorAccessCodes: state.mentorAccessCodes || {},
  mentorCodeSetupMissing: false,
  activeJury: state.activeJury || "Varun",
  juryAccessUnlocked: state.juryAccessUnlocked === true,
  juryAccessCode: state.juryAccessCode || "",
  juryAccessJury: state.juryAccessJury || "",
  juryAccessCodes: state.juryAccessCodes || {},
  juryAccessPublic: state.juryAccessPublic === true,
  juryCodeSetupMissing: false,
  stakeholderAccessUnlocked: state.stakeholderAccessUnlocked || {},
  stakeholderAccessCode: state.stakeholderAccessCode || {},
  stakeholderAccessCodes: state.stakeholderAccessCodes || {},
  stakeholderCodeSetupMissing: false,
  stakeholderSummaries: state.stakeholderSummaries || {},
  stakeholderPersonSummaries: state.stakeholderPersonSummaries || {},
  stakeholderSummaryStatus: state.stakeholderSummaryStatus || {},
  stakeholderSummaryError: state.stakeholderSummaryError || {},
  mentors: state.mentors || defaultMentors,
  juries: state.juries || defaultJuries,
  groupCorrections: state.groupCorrections || {},
  individualRemarks: state.individualRemarks || {},
  adminIndividualFeedback: state.adminIndividualFeedback || {},
  miniProjectReviews: state.miniProjectReviews || {},
  miniProjectAssignments: state.miniProjectAssignments || {},
  miniProjectView: state.miniProjectView || "landing",
  activeMiniGroup: state.activeMiniGroup || null,
  madaJuries: state.madaJuries || madaJuriesSeed.map(j => j.name),
  madaJuryOffices: state.madaJuryOffices || Object.fromEntries(madaJuriesSeed.map(j => [j.name, j.office])),
  activeMadaJury: state.activeMadaJury || madaJuriesSeed[0]?.name || null,
  madaReviews: state.madaReviews || {},
  madaAssignments: state.madaAssignments || {},
  madaGroups: state.madaGroups || madaGroupsSeed,
  madaJuryView: state.madaJuryView || "landing",
  activeMadaGroup: state.activeMadaGroup || null,
  participantPhotos: state.participantPhotos || {},
  photoUrls: state.photoUrls || {},
  aiUsageEvents: state.aiUsageEvents || [],
  reports: state.reports || {},
  changeHistory: state.changeHistory || [],
  syncStatus: "loading",
  data: { ...seed, groups: state.data?.groups?.length ? state.data.groups : seed.groups }
};

if (!state.mentors?.length) state.mentors = defaultMentors;
if (!state.mentors.includes(state.activeMentor)) state.activeMentor = state.mentors[0] || "Mentor";
if (!state.juries?.length) state.juries = defaultJuries;
if (!state.juries.includes(state.activeJury)) state.activeJury = state.juries[0] || "Jury";
if (!state.madaJuries?.length) state.madaJuries = madaJuriesSeed.map(j => j.name);
if (!state.madaJuries.includes(state.activeMadaJury)) state.activeMadaJury = state.madaJuries[0] || null;
if (!state.madaJuryOffices || !Object.keys(state.madaJuryOffices).length) state.madaJuryOffices = Object.fromEntries(madaJuriesSeed.map(j => [j.name, j.office]));

let lastAdminMentor = "all";
let refreshTimer = null;
let madaRefreshTimer = null;
let miniAutosaveTimer = null;
let miniAutosaveSignature = "";
const stakeholderAIInFlight = {};
const stakeholderAISessionAttempts = {};

const saveLocal = () => localStorage.setItem("spoon-state-v2", JSON.stringify(state));
const save = saveLocal;
const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const randomCodeChunk = () => Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
const generateMentorCode = () => `SP-MENTOR-${randomCodeChunk()}-${randomCodeChunk()}`;
const normalizeAccessCode = value => String(value || "").trim().toUpperCase().replace(/\s+/g, "-");
const siteUrl = () => `${location.origin}${location.pathname}`;
const mentorSlug = name => String(name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mentor";
const mentorAccessUrl = (name, code) => `${siteUrl()}?mentor=${encodeURIComponent(mentorSlug(name))}&access=${encodeURIComponent(normalizeAccessCode(code))}`;
const mentorNameFromSlug = slug => state.mentors.find(name => mentorSlug(name) === String(slug || "").toLowerCase()) || "";
const generateJuryCode = () => `SP-JURY-${randomCodeChunk()}-${randomCodeChunk()}`;
const jurySlug = name => mentorSlug(name);
const juryAccessUrl = (name, code) => `${siteUrl()}?jury=${encodeURIComponent(jurySlug(name))}&juryAccess=${encodeURIComponent(normalizeAccessCode(code))}#mini-project`;
const juryNameFromSlug = slug => state.juries.find(name => jurySlug(name) === String(slug || "").toLowerCase()) || "";
const stakeholderEvents = {
  mauritius: "Spoon Mauritius",
  madagascar: "Spoon Madagascar"
};
const stakeholderEventLabel = eventKey => stakeholderEvents[eventKey] || "Stakeholder";
const generateStakeholderCode = () => `SP-SHARE-${randomCodeChunk()}-${randomCodeChunk()}-${randomCodeChunk()}`;
const stakeholderAccessUrl = (eventKey, code) => `${siteUrl()}?stakeholder=${encodeURIComponent(eventKey)}&stakeholderAccess=${encodeURIComponent(normalizeAccessCode(code))}#stakeholder`;
const mentorAccessDetails = name => {
  const code = state.mentorAccessCodes?.[name]?.code || "";
  const privateUrl = mentorAccessUrl(name, code);
  return {
    code,
    privateUrl,
    shareText: `Spoon Hackathon mentor page for ${name}: ${privateUrl}\nBackup code: ${code}`
  };
};
const juryAccessDetails = name => {
  const code = state.juryAccessCodes?.[name]?.code || "";
  const privateUrl = juryAccessUrl(name, code);
  return {
    code,
    privateUrl,
    shareText: `Spoon Hackathon jury page for ${name}: ${privateUrl}\nBackup code: ${code}`
  };
};
const stakeholderAccessDetails = eventKey => {
  const code = state.stakeholderAccessCodes?.[eventKey]?.code || "";
  const privateUrl = stakeholderAccessUrl(eventKey, code);
  return {
    code,
    privateUrl,
    shareText: `${stakeholderEventLabel(eventKey)} stakeholder dashboard: ${privateUrl}\nBackup code: ${code}`
  };
};
const groupById = id => state.data.groups.find(group => group.id === Number(id));
const topicByKey = key => miniProjectTopics.find(topic => topic.key === key);
const topicFullTitle = topic => topic ? `${topic.title}: ${topic.subtitle}` : "";
const assignmentForGroup = group => state.miniProjectAssignments?.[String(group?.id)] || null;
const topicForGroup = group => topicByKey(assignmentForGroup(group)?.topicKey);
const madaGroups = () => state.madaGroups?.length ? state.madaGroups : madaGroupsSeed;
const madaGroupById = id => madaGroups().find(group => group.id === Number(id));
const madaGroupsForOffice = office => madaGroups().filter(group => group.office === office);
const madaTopicByKey = key => madaTopics.find(topic => topic.key === key);
const madaTopicFullTitle = topic => topic ? `${topic.title}: ${topic.subtitle}` : "";
const madaAssignmentForGroup = group => state.madaAssignments?.[String(group?.id)] || null;
const madaTopicForGroup = group => madaTopicByKey(madaAssignmentForGroup(group)?.topicKey);
const madaJuryOffice = name => state.madaJuryOffices?.[name] || madaJuriesSeed.find(j => j.name === name)?.office || null;
const madaFirstName = name => String(name || "").replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] || String(name || "");
function madaReviewKey(groupId, juryName) {
  return `${groupId}|${juryName}`;
}
function madaIndividualNotesFromForm(group, data = {}) {
  return Object.fromEntries(
    (group?.participants || [])
      .map(person => [person, (data[`madaNote::${person}`] || "").trim()])
      .filter(([, note]) => note)
  );
}
const remoteEnabled = () => Boolean(supabaseClient);
const adminAuthEnabled = () => remoteEnabled() && !cfg.demoMode;
const knownTotalMarks = () => state.data.questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
const normalizeMark = (mark, max) => {
  if (mark === "" || mark === null || mark === undefined) return null;
  const value = Number(mark);
  if (!Number.isFinite(value)) return null;
  const safeValue = Math.max(0, value);
  const total = Number(max);
  if (Number.isFinite(total) && total >= 0) return Math.min(safeValue, total);
  return safeValue;
};
const hasMarkValue = value => value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
const miniCriterionScore = (scores = {}, criterion) => {
  if (hasMarkValue(scores?.[criterion.key])) return normalizeMark(scores[criterion.key], criterion.max);
  if (!criterion.legacyKeys?.length) return null;
  let hasLegacyScore = false;
  const legacyTotal = criterion.legacyKeys.reduce((sum, key) => {
    if (!hasMarkValue(scores?.[key])) return sum;
    hasLegacyScore = true;
    return sum + Number(scores[key]);
  }, 0);
  return hasLegacyScore ? normalizeMark(legacyTotal, criterion.max) : null;
};
const markStatus = (mark, max) => {
  const value = normalizeMark(mark, max);
  const total = Number(max);
  if (value === null) return null;
  if (value <= 0) return "incorrect";
  if (Number.isFinite(total) && total > 0 && value >= total) return "correct";
  return "partial";
};
const groupScore = group => state.data.questions.reduce((sum, question) => {
  const correction = state.groupCorrections[correctionKey(group.id, question.id)];
  return sum + (normalizeMark(correction?.marksAwarded, question.maxMarks) || 0);
}, 0);
const hackathonScoreboard = () => state.data.groups
  .map(group => ({ group, score: groupScore(group), max: knownTotalMarks() }))
  .sort((a, b) => b.score - a.score);
const miniProjectScore = review => miniProjectCriteria.reduce((sum, criterion) => sum + (miniCriterionScore(review?.scores, criterion) || 0), 0);
const miniReviewsForGroup = group => Object.values(state.miniProjectReviews).filter(review => Number(review.groupId) === Number(group.id));
const miniProjectAverage = group => {
  const reviews = miniReviewsForGroup(group);
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((sum, review) => sum + miniProjectScore(review), 0) / reviews.length) * 10) / 10;
};
const combinedScoreboard = () => state.data.groups
  .map(group => ({ group, hackathon: groupScore(group), hackathonMax: knownTotalMarks(), mini: miniProjectAverage(group), miniMax: miniProjectTotal, total: groupScore(group) + miniProjectAverage(group), max: knownTotalMarks() + miniProjectTotal, juryCount: miniReviewsForGroup(group).length }))
  .sort((a, b) => b.total - a.total);
function ensureMentorAccessCodes() {
  state.mentorAccessCodes = state.mentorAccessCodes || {};
  state.mentors.forEach(name => {
    const existing = state.mentorAccessCodes[name];
    if (!existing?.code) {
      state.mentorAccessCodes[name] = {
        code: generateMentorCode(),
        active: true,
        updatedAt: new Date().toISOString()
      };
    }
  });
  Object.keys(state.mentorAccessCodes).forEach(name => {
    if (!state.mentors.includes(name)) delete state.mentorAccessCodes[name];
  });
}
function mentorAccessIsCurrent() {
  const record = state.mentorAccessCodes?.[state.activeMentor];
  if (remoteEnabled() && state.session?.role !== "admin") {
    return state.mentorAccessUnlocked && Boolean(state.mentorAccessCode) && state.mentorAccessMentor === state.activeMentor;
  }
  return state.mentorAccessUnlocked && record?.active !== false && normalizeAccessCode(record?.code) === normalizeAccessCode(state.mentorAccessCode);
}
ensureMentorAccessCodes();
function ensureJuryAccessCodes() {
  state.juryAccessCodes = state.juryAccessCodes || {};
  state.juries.forEach(name => {
    const existing = state.juryAccessCodes[name];
    if (!existing?.code) {
      state.juryAccessCodes[name] = {
        code: generateJuryCode(),
        active: true,
        updatedAt: new Date().toISOString()
      };
    }
  });
  Object.keys(state.juryAccessCodes).forEach(name => {
    if (!state.juries.includes(name)) delete state.juryAccessCodes[name];
  });
}
function juryAccessIsCurrent() {
  if (state.juryAccessPublic) return true;
  const record = state.juryAccessCodes?.[state.activeJury];
  if (remoteEnabled() && state.session?.role !== "admin") {
    return state.juryAccessUnlocked && Boolean(state.juryAccessCode) && state.juryAccessJury === state.activeJury;
  }
  return state.juryAccessUnlocked && record?.active !== false && normalizeAccessCode(record?.code) === normalizeAccessCode(state.juryAccessCode);
}
ensureJuryAccessCodes();
function ensureStakeholderAccessCodes() {
  state.stakeholderAccessCodes = state.stakeholderAccessCodes || {};
  Object.keys(stakeholderEvents).forEach(eventKey => {
    const existing = state.stakeholderAccessCodes[eventKey];
    if (!existing?.code) {
      state.stakeholderAccessCodes[eventKey] = {
        code: generateStakeholderCode(),
        active: true,
        updatedAt: new Date().toISOString()
      };
    }
  });
}
function stakeholderAccessIsCurrent(eventKey) {
  const record = state.stakeholderAccessCodes?.[eventKey];
  if (remoteEnabled() && state.session?.role !== "admin") {
    return state.stakeholderAccessUnlocked?.[eventKey] && Boolean(state.stakeholderAccessCode?.[eventKey]);
  }
  return state.stakeholderAccessUnlocked?.[eventKey] && record?.active !== false && normalizeAccessCode(record?.code) === normalizeAccessCode(state.stakeholderAccessCode?.[eventKey]);
}
ensureStakeholderAccessCodes();
const madaCriterionScore = miniCriterionScore;
const madaReviewsForGroup = group => Object.values(state.madaReviews).filter(review => Number(review.groupId) === Number(group.id));
const madaProjectScore = review => miniProjectScore(review);
const madaGroupAverage = group => {
  const reviews = madaReviewsForGroup(group);
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((sum, review) => sum + madaProjectScore(review), 0) / reviews.length) * 10) / 10;
};
const madaScoreboard = () => madaGroups()
  .map(group => ({ group, average: madaGroupAverage(group), max: madaProjectTotal, juryCount: madaReviewsForGroup(group).length }))
  .sort((a, b) => b.average - a.average);

const answerGuides = {
  1: {
    question: "Find the sum of all natural numbers below 1000 that are multiples of 3 or 5.",
    answer: "233168",
    details: ["Sum all natural numbers below 1000 that are divisible by 3 or 5."],
    tests: ["Below 10 → 23", "Below 1000 → 233168", "Below 1250 → 363543"]
  },
  2: {
    question: "Calculate the greatest common divisor for a list of numbers.",
    answer: "Return the greatest common divisor for the full list, using absolute values.",
    details: ["Handle negative values, empty lists, and a list made only of zeroes."],
    tests: ["8, 40, 100, 120, 150 → 2", "8, 40, -100, -20 → 4", "2, 3, 5, 11 → 1", "[] → error / invalid input", "0, 0, 0 → error / invalid input"]
  },
  3: {
    question: "Decrypt the message found in the bottle: Tyr&eif&*Jgf@fe&20&cr@ F0 9F AB B3.",
    answer: "Chanro spoon 20 la 🫳",
    details: ["Caesar cipher. Key can be read as -17 or +9.", "Encrypted text: Tyr&eif&*Jgf@fe&20&cr@ F0 9F AB B3"],
    tests: ["Mentor should verify the decrypted readable phrase and the hand emoji byte sequence."]
  },
  4: {
    question: "Create a JavaScript function that checks if N is a Sophie Germain prime with the extra twin-prime and prime-quadruplet properties.",
    answer: "11 is the valid exceptional Sophie Germain prime for the provided tests.",
    details: ["N and 2N + 1 must be prime.", "Either N - 2 or N + 2 is prime, but not both.", "N, N + 2, N + 6, and N + 8 must all be prime."],
    tests: ["5 → not a balanced twin prime", "11 → exceptional Sophie Germain prime", "29 → not part of a prime quadruplet", "59 → not a Sophie Germain prime"]
  },
  5: {
    question: "Build a program that takes a photo, video, and live webcam feed, then replaces detected faces with a mask.",
    answer: "Program masks detected faces in image, video, and live webcam input.",
    details: ["Libraries are allowed.", "External APIs are not allowed.", "Mentors should check that every detected face is covered by a chosen mask/image."],
    tests: ["Upload a photo with multiple faces.", "Run a short video and confirm masks track faces across frames.", "Open webcam mode and confirm live face masking."]
  },
  6: {
    question: "Write a calculator that receives a string such as “3 x 4” and returns the calculated result.",
    answer: "A string calculator that parses expressions like “3 x 4” and returns the result.",
    details: ["Supported operations: +, -, x, /.", "Any allowed language is acceptable if parsing and calculation are correct."],
    tests: ["3 x 4 → 12", "10 / 2 → 5", "7 + 8 → 15", "9 - 14 → -5", "Invalid or incomplete expression should be handled cleanly."]
  },
  7: {
    question: "Decode the unknown island language message written in Brainfuck.",
    answer: "Pas blier amene gato pou nou kan hackathon fini.",
    details: ["The provided language is Brainfuck.", "A valid solution may decode manually or use a Brainfuck interpreter."],
    tests: ["Paste the encoded Brainfuck into an interpreter and compare the exact phrase."]
  },
  8: {
    question: "Fetch product/order JSON data, list orders by product, calculate quantities, and filter orders by date range.",
    answer: "Fetch and process the provided product/order JSON files.",
    details: ["Products endpoint: https://keshav-public.s3.us-west-1.amazonaws.com/hackathon-json/product.json", "Orders endpoint: https://keshav-public.s3.us-west-1.amazonaws.com/hackathon-json/order.json", "Part 1: list orders for a product and calculate total quantity.", "Part 2: filter orders by start/end date and display price from the product file."],
    tests: ["Search by product name case-insensitively.", "Use a valid date range and confirm only orders fully inside the range appear.", "Use a date range with no matches and show a clear empty result.", "Handle failed fetch/network errors cleanly."]
  },
  9: {
    question: "Decrypt the second encoded message.",
    answer: "my kraken is hungry",
    details: ["This is the second encrypted message from the answer sheet."],
    tests: ["Decoded message should match the phrase exactly."]
  },
  10: {
    question: "Solve the SQL challenge cases using the employee, department, and project tables.",
    answer: "SQL challenge with 19 practical cases.",
    details: ["Expected skills include SELECT, subqueries, JOIN, GROUP BY, HAVING, ALTER/UPDATE, CASE, WITH/CTE, LEFT JOIN, LIKE, and DELETE.", "Important cases include IT employees, department salary totals, full_name column, same department as Jane Johnson, highest salary, project reports, salary bands, and Finance project deletion."],
    tests: ["Each query should run without syntax errors.", "Aliases should be clear for report-style questions.", "Aggregations should group by department name.", "Deletion query should target only Finance department projects."]
  },
  11: {
    question: "Build a smart Snake game with AI/autonomous movement.",
    answer: "A working Smart Snake game with AI movement.",
    details: ["Mentor should verify gameplay, canvas rendering, snake movement, food generation, collision/game-over behavior, score updates, and AI/autonomous movement."],
    tests: ["Start game and confirm snake moves continuously.", "Food appears and score increases when eaten.", "Snake grows after eating.", "Wall/self collision ends or resets the game.", "AI movement avoids immediate obvious collisions where possible."]
  },
  12: {
    question: "Aggregate book information from books.toscrape.com.",
    answer: "Scrape http://books.toscrape.com/ and aggregate book information.",
    details: ["Extract title, price, availability, and rating for book cards.", "BeautifulSoup/request-style implementation is acceptable."],
    tests: ["First page returns a non-empty list of books.", "Each book object includes title, price, availability, and rating.", "Network/request errors are handled clearly."]
  },
  13: {
    question: "Leet Speak challenge.",
    answer: "Leet Speak guide pending.",
    details: ["Use this helper once the official expected Leet Speak answer/scenarios are added."],
    tests: ["Verify character replacement rules, casing, spaces, and punctuation once the final statement is confirmed."]
  }
};

Object.assign(answerGuides[1], {
  how: "Loop from 0 up to, but not including, the limit. Add the number when it is divisible by 3 or divisible by 5. Be careful not to double-count numbers like 15, because the condition should be OR, not two separate additions.",
  checklist: ["Uses < limit, not <= limit.", "Checks both 3 and 5.", "Does not double count multiples of both 3 and 5.", "Returns a numeric sum, not a printed-only answer."],
  codeSnippets: [{
    title: "JavaScript reference",
    code: [
      "function sumMultiples(limit) {",
      "  let total = 0;",
      "  for (let i = 0; i < limit; i += 1) {",
      "    if (i % 3 === 0 || i % 5 === 0) total += i;",
      "  }",
      "  return total;",
      "}",
      "",
      "sumMultiples(1000); // 233168",
      "sumMultiples(1250); // 363543"
    ].join("\n")
  }]
});

Object.assign(answerGuides[2], {
  how: "Normalize the numbers with absolute values, reject invalid edge cases, then compute the greatest common divisor. A clean solution can use Euclid's algorithm pair by pair, or test divisors downward from the maximum absolute value.",
  checklist: ["Rejects an empty input list.", "Handles negative values using absolute values.", "Handles zero values safely.", "Rejects a list containing only zeroes.", "Returns 1 for co-prime lists."],
  codeSnippets: [{
    title: "JavaScript Euclid reference",
    code: [
      "function gcdTwo(a, b) {",
      "  a = Math.abs(a);",
      "  b = Math.abs(b);",
      "  while (b !== 0) {",
      "    const next = a % b;",
      "    a = b;",
      "    b = next;",
      "  }",
      "  return a;",
      "}",
      "",
      "function gcdList(values) {",
      "  if (!Array.isArray(values) || values.length === 0) throw new Error('Empty list');",
      "  if (values.every(value => value === 0)) throw new Error('Only zeroes');",
      "  return values.map(Math.abs).reduce((acc, value) => gcdTwo(acc, value));",
      "}",
      "",
      "gcdList([8, 40, 100, 120, 150]); // 2",
      "gcdList([8, 40, -100, -20]); // 4"
    ].join("\n")
  }]
});

Object.assign(answerGuides[3], {
  how: "The text is Caesar-shifted. A shift of -17 is equivalent to +9. Decode the readable part, then interpret the hexadecimal byte sequence F0 9F AB B3 as the Unicode hand emoji.",
  checklist: ["Mentions Caesar cipher or equivalent rotation.", "Uses key -17 or +9.", "Keeps the number 20 in the final phrase.", "Converts the hex bytes into the emoji."],
  codeSnippets: [{
    title: "JavaScript Caesar helper",
    code: [
      "function caesar(text, shift) {",
      "  return text.replace(/[a-z]/gi, char => {",
      "    const base = char >= 'a' && char <= 'z' ? 97 : 65;",
      "    const code = char.charCodeAt(0) - base;",
      "    return String.fromCharCode(((code + shift + 26) % 26) + base);",
      "  });",
      "}",
      "",
      "caesar('Tyr&eif&*Jgf@fe&20&cr@', 9);",
      "// Chan&nro&*Spo@on&20&la@",
      "// Clean punctuation/spaces + F0 9F AB B3 => Chanro spoon 20 la 🫳"
    ].join("\n")
  }]
});

Object.assign(answerGuides[4], {
  how: "The function needs three independent checks: Sophie Germain prime, balanced twin prime condition, and prime quadruplet condition. The submitted solution should explain which condition failed when a number is rejected.",
  checklist: ["Has a correct primality test.", "Checks both N and 2N + 1.", "Uses XOR-style logic for N - 2 / N + 2.", "Checks N, N + 2, N + 6, N + 8 for the quadruplet.", "Produces the expected messages for 5, 11, 29, and 59."],
  codeSnippets: [{
    title: "JavaScript reference",
    code: [
      "const isPrime = number => {",
      "  if (number <= 1) return false;",
      "  if (number <= 3) return true;",
      "  if (number % 2 === 0 || number % 3 === 0) return false;",
      "  for (let i = 5; i * i <= number; i += 6) {",
      "    if (number % i === 0 || number % (i + 2) === 0) return false;",
      "  }",
      "  return true;",
      "};",
      "",
      "const isSophieGermain = n => isPrime(n) && isPrime(2 * n + 1);",
      "const isBalancedTwin = n => isPrime(n) && (isPrime(n - 2) !== isPrime(n + 2));",
      "const isQuadruplet = n => isPrime(n) && isPrime(n + 2) && isPrime(n + 6) && isPrime(n + 8);",
      "",
      "function checkExceptional(n) {",
      "  if (!isSophieGermain(n)) return `${n} is not a Sophie Germain prime`;",
      "  if (!isBalancedTwin(n)) return `${n} is not a balanced twin prime`;",
      "  if (!isQuadruplet(n)) return `${n} is not part of a prime quadruplet`;",
      "  return `${n} is an exceptional Sophie Germain prime with the desired properties`;",
      "}"
    ].join("\n")
  }]
});

Object.assign(answerGuides[5], {
  how: "A strong solution loads media, detects faces locally with a browser or computer-vision library, then draws a mask image over every detected face. Award stronger marks when all three modes work: photo, uploaded video, and webcam.",
  checklist: ["No external face-detection API dependency.", "Works for multiple faces.", "Mask placement follows face bounding boxes.", "Video/webcam updates frame by frame.", "Has permission/error handling for camera access."],
  codeSnippets: [{
    title: "Browser approach outline",
    code: [
      "// Typical implementation shape:",
      "// 1. Load local model/library, e.g. face-api.js or OpenCV.js.",
      "// 2. Load image/video/webcam stream.",
      "// 3. Detect face bounding boxes on every frame.",
      "// 4. Draw original frame to canvas.",
      "// 5. Draw the mask image over each face box.",
      "",
      "async function drawMasks(video, canvas, maskImage, detector) {",
      "  const ctx = canvas.getContext('2d');",
      "  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);",
      "  const faces = await detector.detect(video);",
      "  for (const face of faces) {",
      "    ctx.drawImage(maskImage, face.x, face.y, face.width, face.height);",
      "  }",
      "  requestAnimationFrame(() => drawMasks(video, canvas, maskImage, detector));",
      "}"
    ].join("\n")
  }]
});

Object.assign(answerGuides[6], {
  how: "Parse exactly three parts from the input: left number, operator, right number. Convert numbers safely, execute the matching operation, and handle division by zero or malformed strings gracefully.",
  checklist: ["Accepts spaces around the operator.", "Supports +, -, x, and /.", "Converts operands to numbers.", "Handles negative/decimal values if possible.", "Does not use unsafe eval unless strongly justified and restricted."],
  codeSnippets: [{
    title: "JavaScript reference",
    code: [
      "function calculate(expression) {",
      "  const match = expression.trim().match(/^(-?\\d+(?:\\.\\d+)?)\\s*([+\\-x/])\\s*(-?\\d+(?:\\.\\d+)?)$/);",
      "  if (!match) throw new Error('Invalid expression');",
      "",
      "  const left = Number(match[1]);",
      "  const operator = match[2];",
      "  const right = Number(match[3]);",
      "",
      "  if (operator === '+') return left + right;",
      "  if (operator === '-') return left - right;",
      "  if (operator === 'x') return left * right;",
      "  if (operator === '/') {",
      "    if (right === 0) throw new Error('Division by zero');",
      "    return left / right;",
      "  }",
      "}",
      "",
      "calculate('3 x 4'); // 12"
    ].join("\n")
  }]
});

Object.assign(answerGuides[7], {
  how: "The long sequence of symbols is Brainfuck. A correct submission can use an interpreter or implement a small interpreter. The important result is the decoded phrase, with spacing and meaning preserved.",
  checklist: ["Recognizes Brainfuck.", "Can explain or demonstrate decoding.", "Returns the exact phrase.", "Does not confuse this with the second encrypted message."],
  codeSnippets: [{
    title: "Minimal Brainfuck interpreter idea",
    code: [
      "function runBrainfuck(program) {",
      "  const tape = Array(30000).fill(0);",
      "  let pointer = 0;",
      "  let output = '';",
      "  const loopStack = [];",
      "  const loopMap = {};",
      "",
      "  [...program].forEach((char, index) => {",
      "    if (char === '[') loopStack.push(index);",
      "    if (char === ']') {",
      "      const start = loopStack.pop();",
      "      loopMap[start] = index;",
      "      loopMap[index] = start;",
      "    }",
      "  });",
      "",
      "  for (let i = 0; i < program.length; i += 1) {",
      "    const char = program[i];",
      "    if (char === '>') pointer += 1;",
      "    if (char === '<') pointer -= 1;",
      "    if (char === '+') tape[pointer] = (tape[pointer] + 1) % 256;",
      "    if (char === '-') tape[pointer] = (tape[pointer] + 255) % 256;",
      "    if (char === '.') output += String.fromCharCode(tape[pointer]);",
      "    if (char === '[' && tape[pointer] === 0) i = loopMap[i];",
      "    if (char === ']' && tape[pointer] !== 0) i = loopMap[i];",
      "  }",
      "  return output;",
      "}"
    ].join("\n")
  }]
});

Object.assign(answerGuides[8], {
  how: "The solution should fetch two JSON files, combine the order data with product price data, and produce useful filtered output. Part 1 focuses on product quantity. Part 2 focuses on date-range filtering and joining prices.",
  checklist: ["Fetches both endpoints.", "Handles failed HTTP requests.", "Product matching is case-insensitive.", "Date filtering uses YYYY-MM-DD parsing.", "Displays price by joining product data.", "Provides a clear message when no orders match."],
  codeSnippets: [{
    title: "Python reference structure",
    code: [
      "import requests",
      "from datetime import datetime",
      "",
      "PRODUCTS_URL = 'https://keshav-public.s3.us-west-1.amazonaws.com/hackathon-json/product.json'",
      "ORDERS_URL = 'https://keshav-public.s3.us-west-1.amazonaws.com/hackathon-json/order.json'",
      "",
      "def fetch_json(url):",
      "    response = requests.get(url, timeout=10)",
      "    response.raise_for_status()",
      "    return response.json()",
      "",
      "def orders_for_product(orders, product_name):",
      "    matches = [o for o in orders if o['product'].lower() == product_name.lower()]",
      "    total_quantity = sum(int(o['quantity']) for o in matches)",
      "    return matches, total_quantity",
      "",
      "def filter_by_date(orders, start, end):",
      "    start_date = datetime.strptime(start, '%Y-%m-%d')",
      "    end_date = datetime.strptime(end, '%Y-%m-%d')",
      "    return [",
      "        order for order in orders",
      "        if start_date <= datetime.strptime(order['startDate'], '%Y-%m-%d')",
      "        and datetime.strptime(order['endDate'], '%Y-%m-%d') <= end_date",
      "    ]"
    ].join("\n")
  }]
});

Object.assign(answerGuides[9], {
  how: "This is the second encrypted message from the attached answer sheet. Mentors should mark the final decoded message and any explanation of how the candidate decoded it.",
  checklist: ["Final phrase is exact.", "Candidate shows a reproducible decode path or tool.", "No extra words are added to the answer."],
  codeSnippets: [{
    title: "Expected output",
    code: "my kraken is hungry"
  }]
});

Object.assign(answerGuides[10], {
  how: "This question is about writing practical SQL queries across employees, departments, and projects. Mentors can award partial marks per case if the query intent is correct even with minor alias/style differences.",
  checklist: ["Uses correct joins between employees/departments/projects.", "Uses GROUP BY for aggregates.", "Uses HAVING for aggregate filters.", "Uses subqueries where appropriate.", "ALTER/UPDATE full_name case is included.", "DELETE case only removes Finance projects."],
  codeSnippets: [{
    title: "Core SQL answer snippets",
    code: [
      "-- IT employees with salary",
      "SELECT first_name, last_name, salary",
      "FROM employees",
      "WHERE department_id = (",
      "  SELECT department_id FROM departments WHERE department_name = 'IT'",
      ");",
      "",
      "-- Total salary by department",
      "SELECT dep.department_name, SUM(emp.salary) AS total_salary",
      "FROM employees emp",
      "JOIN departments dep ON emp.department_id = dep.department_id",
      "GROUP BY dep.department_name;",
      "",
      "-- Add and populate full_name",
      "ALTER TABLE employees ADD full_name varchar(255);",
      "UPDATE employees SET full_name = first_name || ' ' || last_name;",
      "",
      "-- Highest paid employee with department",
      "SELECT emp.full_name, emp.salary, dep.department_name",
      "FROM employees emp",
      "JOIN departments dep ON emp.department_id = dep.department_id",
      "WHERE emp.salary = (SELECT MAX(salary) FROM employees);",
      "",
      "-- Departments with average salary above 60000",
      "SELECT dep.department_name, AVG(emp.salary) AS average_salary",
      "FROM employees emp",
      "JOIN departments dep ON emp.department_id = dep.department_id",
      "GROUP BY dep.department_name",
      "HAVING AVG(emp.salary) > 60000;",
      "",
      "-- Salary range classification",
      "SELECT full_name, salary,",
      "  CASE",
      "    WHEN salary < 55000 THEN 'Low'",
      "    WHEN salary BETWEEN 55000 AND 60000 THEN 'Medium'",
      "    ELSE 'High'",
      "  END AS salary_range",
      "FROM employees;",
      "",
      "-- Delete Finance projects",
      "DELETE FROM projects",
      "WHERE department_id = (",
      "  SELECT department_id FROM departments WHERE department_name = 'Finance'",
      ");"
    ].join("\n")
  }]
});

Object.assign(answerGuides[11], {
  how: "The expected result is a playable Snake game, ideally with an AI/autonomous movement strategy. Mentors should test it as software, not just inspect code: start it, watch movement, eat food, collide, and confirm score behavior.",
  checklist: ["Canvas or visual grid renders correctly.", "Snake moves at a consistent interval.", "Arrow/manual controls or AI movement work.", "Food appears in valid empty cells.", "Eating food grows the snake and increases score.", "Collision with wall/self is handled.", "AI chooses a reasonable next direction rather than freezing."],
  codeSnippets: [{
    title: "Smart movement idea",
    code: [
      "function chooseDirection(snake, food, gridSize) {",
      "  const head = snake[0];",
      "  const options = [",
      "    { dx: 1, dy: 0 },",
      "    { dx: -1, dy: 0 },",
      "    { dx: 0, dy: 1 },",
      "    { dx: 0, dy: -1 }",
      "  ];",
      "",
      "  const safeMoves = options.filter(move => {",
      "    const next = { x: head.x + move.dx, y: head.y + move.dy };",
      "    const hitsWall = next.x < 0 || next.y < 0 || next.x >= gridSize || next.y >= gridSize;",
      "    const hitsSelf = snake.some(part => part.x === next.x && part.y === next.y);",
      "    return !hitsWall && !hitsSelf;",
      "  });",
      "",
      "  safeMoves.sort((a, b) => {",
      "    const nextA = { x: head.x + a.dx, y: head.y + a.dy };",
      "    const nextB = { x: head.x + b.dx, y: head.y + b.dy };",
      "    const distA = Math.abs(nextA.x - food.x) + Math.abs(nextA.y - food.y);",
      "    const distB = Math.abs(nextB.x - food.x) + Math.abs(nextB.y - food.y);",
      "    return distA - distB;",
      "  });",
      "",
      "  return safeMoves[0] || { dx: 0, dy: 0 };",
      "}"
    ].join("\n")
  }]
});

Object.assign(answerGuides[12], {
  how: "Scrape the book catalogue page and build a list of structured records. The important fields are title, price, availability, and rating. A stronger answer handles request failures and can extend to pagination.",
  checklist: ["Requests the books.toscrape.com page.", "Parses HTML with BeautifulSoup or equivalent.", "Finds article.product_pod cards.", "Extracts title from h3/a title attribute.", "Extracts price, availability, and rating.", "Prints or returns structured data."],
  codeSnippets: [{
    title: "Python BeautifulSoup reference",
    code: [
      "import requests",
      "from bs4 import BeautifulSoup",
      "",
      "url = 'http://books.toscrape.com/'",
      "response = requests.get(url, timeout=10)",
      "response.raise_for_status()",
      "",
      "soup = BeautifulSoup(response.content, 'html.parser')",
      "books = []",
      "",
      "for book in soup.find_all('article', class_='product_pod'):",
      "    title = book.h3.a['title']",
      "    price = book.find('p', class_='price_color').text",
      "    availability = book.find('p', class_='instock availability').text.strip()",
      "    rating = book.p['class'][1]",
      "    books.append({",
      "        'title': title,",
      "        'price': price,",
      "        'availability': availability,",
      "        'rating': rating",
      "    })",
      "",
      "print(books)"
    ].join("\n")
  }]
});

Object.assign(answerGuides[13], {
  how: "Leet Speak usually means replacing letters with visually similar numbers/symbols. Since the final official answer is not in the attached sheet, mentors should use the exact statement/rules given during the hackathon as the source of truth.",
  checklist: ["Applies the expected replacement mapping consistently.", "Preserves spaces and punctuation unless instructed otherwise.", "Handles uppercase/lowercase consistently.", "Can decode back or encode forward based on the question wording."],
  codeSnippets: [{
    title: "Typical Leet Speak encoder pattern",
    code: [
      "const leetMap = {",
      "  a: '4', e: '3', i: '1', o: '0', s: '5', t: '7'",
      "};",
      "",
      "function toLeet(text) {",
      "  return text.replace(/[aeiost]/gi, char => {",
      "    const replacement = leetMap[char.toLowerCase()];",
      "    return replacement || char;",
      "  });",
      "}",
      "",
      "toLeet('Spoon Hackathon'); // 5p00n H4ck47h0n"
    ].join("\n")
  }]
});

function correctionKey(groupId, qid) {
  return `${groupId}|${qid}`;
}

function remarkKey(groupId, person, qid) {
  return `${groupId}|${person}|${qid}`;
}

function adminFeedbackKey(eventKey, person) {
  return `${eventKey}|${person}`;
}

function stakeholderPersonSummaryKey(eventKey, person) {
  return `${eventKey}|${person}`;
}

function miniReviewKey(groupId, juryName) {
  return `${groupId}|${juryName}`;
}

const allParticipants = () => state.data.groups.flatMap(group => group.participants.map(person => ({ group, person })));
const normalizePhotoName = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\.[^.]+$/g, "")
  .replace(/[^a-z0-9]+/gi, "")
  .toLowerCase();
const initials = name => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";
const photoFor = person => state.photoUrls?.[person] || "";

function participantAvatar(person, size = "small", clickable = true) {
  const url = photoFor(person);
  return url
    ? clickable
      ? `<button type="button" class="photo-open" data-photo-url="${esc(url)}" data-photo-name="${esc(person)}" title="Open ${esc(person)} photo"><img class="participant-photo ${size}" src="${esc(url)}" alt="${esc(person)}" draggable="false" oncontextmenu="return false"></button>`
      : `<img class="participant-photo ${size}" src="${esc(url)}" alt="${esc(person)}" draggable="false" oncontextmenu="return false">`
    : `<span class="participant-photo placeholder ${size}">${esc(initials(person))}</span>`;
}

function participantNameBlock(person, size = "small", clickablePhoto = true) {
  return `<span class="participant-name-block">${participantAvatar(person, size, clickablePhoto)}<span>${esc(person)}</span></span>`;
}

function matchParticipantFromFile(file) {
  const fileKey = normalizePhotoName(file.name);
  if (!fileKey) return null;
  return allParticipants().find(({ person }) => {
    const personKey = normalizePhotoName(person);
    return fileKey === personKey || fileKey.includes(personKey) || personKey.includes(fileKey);
  }) || null;
}

function applyPhotoRows(rows = []) {
  state.participantPhotos = {};
  rows.forEach(row => {
    if (row?.participant_name && row?.object_path) {
      state.participantPhotos[row.participant_name] = {
        objectPath: row.object_path,
        groupId: row.group_id,
        updatedAt: row.updated_at || row.created_at
      };
    }
  });
}

function applyPhotoRow(row) {
  if (!row?.participant_name || !row?.object_path) return;
  state.participantPhotos[row.participant_name] = {
    objectPath: row.object_path,
    groupId: row.group_id,
    updatedAt: row.updated_at || row.created_at
  };
}

function removePhotoRow(row) {
  if (!row?.participant_name) return;
  delete state.participantPhotos[row.participant_name];
  delete state.photoUrls[row.participant_name];
}

async function hydratePhotoUrls() {
  state.photoUrls = {};
  if (!remoteEnabled()) return;

  await Promise.all(Object.entries(state.participantPhotos || {}).map(async ([person, record]) => {
    const { data, error } = await supabaseClient
      .storage
      .from("newbie-display")
      .createSignedUrl(record.objectPath, 60 * 60);
    if (!error && data?.signedUrl) state.photoUrls[person] = data.signedUrl;
  }));
}

async function compressPhoto(file) {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = objectUrl;
  });

  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(objectUrl);

  return await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
}

async function uploadParticipantPhoto(file, match) {
  if (state.session?.role !== "admin") throw new Error("Only admin can upload photos.");
  if (!remoteEnabled()) throw new Error("Online photo upload is not available on this device.");
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);

  const blob = await compressPhoto(file);
  if (!blob) throw new Error(`Could not compress ${file.name}.`);

  const objectPath = `group-${match.group.id}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabaseClient
    .storage
    .from("newbie-display")
    .upload(objectPath, blob, { contentType: "image/webp", upsert: false });
  if (uploadError) throw uploadError;

  const { error: recordError } = await supabaseClient
    .from("newbie_photos")
    .upsert({
      participant_name: match.person,
      group_id: match.group.id,
      group_name: match.group.name,
      object_path: objectPath
    }, { onConflict: "participant_name" });
  if (recordError) throw recordError;
}

function syncLabel() {
  if (!remoteEnabled()) return cfg.demoMode ? "Preview mode" : "Offline mode";
  if (state.syncStatus === "online") return "Live online";
  if (state.syncStatus === "saving") return "Saving…";
  if (state.syncStatus === "error") return "Connection issue";
  return "Connecting…";
}

function friendlyError(error, fallback = "Something went wrong. Please try again.") {
  const message = String(error?.message || error || "").trim();
  const lower = message.toLowerCase();
  const safeValidation = [
    "only admin",
    "enter ",
    "choose ",
    "already exists",
    "keep at least one",
    "not an image",
    "could not compress",
    "online photo upload",
    "admin email or password",
    "for preview mode",
    "this account is not approved"
  ];

  if (!message) return fallback;
  if (safeValidation.some(fragment => lower.includes(fragment))) return message;
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) return "Admin email or password is incorrect.";
  if (lower.includes("jwt") || lower.includes("session") || lower.includes("auth")) return "Your admin session expired. Please sign in again.";
  if (lower.includes("permission denied") || lower.includes("row-level security") || lower.includes("rls") || lower.includes("not registered as an admin")) return "You do not have permission to do that. Ask an admin to check your access.";
  if (lower.includes("could not find the table") || lower.includes("schema cache") || lower.includes("does not exist") || lower.includes("relation")) return "This feature is not fully set up yet. Ask an admin to run the latest setup script.";
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) return "This item already exists. Refresh the page and try again.";
  if (lower.includes("bucket") || lower.includes("storage") || lower.includes("newbie-display")) return "Photo upload storage is not ready yet. Ask an admin to check the photo setup.";
  if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("timeout") || lower.includes("fetch")) return "Connection issue. Your changes are kept on this device; try again when the connection is stable.";
  return fallback;
}

const savedOnlineMessage = item => remoteEnabled() ? `✓ ${item} saved online` : `✓ ${item} saved on this device`;
const updatedOnlineMessage = item => remoteEnabled() ? `✓ ${item} updated online` : `✓ ${item} updated on this device`;
const localSyncIssueMessage = action => `Saved on this device, but could not ${action} online. Try again when the connection is stable.`;

function applyGroupCorrectionRow(row) {
  if (!row) return;
  const question = state.data.questions.find(item => item.id === Number(row.question_position));
  if (!question) return;
  const maxMarks = row.max_marks ?? question?.maxMarks ?? null;
  state.groupCorrections[correctionKey(row.group_id, row.question_position)] = {
    status: row.status,
    workState: row.work_state || (row.status ? "completed" : "in_progress"),
    marksAwarded: normalizeMark(row.marks_awarded, maxMarks),
    maxMarks,
    correction: row.correction || "",
    groupRemark: row.group_remark || "",
    mentorName: row.mentor_name || "",
    updatedAt: row.updated_at,
    remoteId: row.id
  };
}

function removeGroupCorrectionRow(row) {
  if (!row) return;
  delete state.groupCorrections[correctionKey(row.group_id, row.question_position)];
}

function applyIndividualRemarkRow(row) {
  if (!row) return;
  if (!state.data.questions.some(item => item.id === Number(row.question_position))) return;
  const key = remarkKey(row.group_id, row.participant_name, row.question_position);
  if (row.remark?.trim()) {
    state.individualRemarks[key] = {
      remark: row.remark,
      mentorName: row.mentor_name || "",
      updatedAt: row.updated_at
    };
  }
  else delete state.individualRemarks[key];
}

function removeIndividualRemarkRow(row) {
  if (!row) return;
  delete state.individualRemarks[remarkKey(row.group_id, row.participant_name, row.question_position)];
}

function applyAdminIndividualFeedbackRow(row) {
  if (!row) return;
  const eventKey = row.event_key || "mauritius";
  const key = adminFeedbackKey(eventKey, row.participant_name);
  if (row.feedback?.trim()) {
    state.adminIndividualFeedback[key] = {
      eventKey,
      groupId: Number(row.group_id),
      groupName: row.group_name || "",
      participantName: row.participant_name,
      feedback: row.feedback,
      adminName: row.admin_name || "Admin",
      updatedAt: row.updated_at
    };
  }
  else delete state.adminIndividualFeedback[key];
}

function removeAdminIndividualFeedbackRow(row) {
  if (!row) return;
  delete state.adminIndividualFeedback[adminFeedbackKey(row.event_key || "mauritius", row.participant_name)];
}

function applyMiniProjectReviewRow(row) {
  if (!row) return;
  state.miniProjectReviews[miniReviewKey(row.group_id, row.jury_name)] = {
    groupId: row.group_id,
    groupName: row.group_name,
    juryName: row.jury_name,
    scores: row.scores || {},
    groupNote: row.group_note || "",
    individualNotes: row.individual_notes || {},
    updatedAt: row.updated_at,
    remoteId: row.id
  };
}

function removeMiniProjectReviewRow(row) {
  if (!row) return;
  delete state.miniProjectReviews[miniReviewKey(row.group_id, row.jury_name)];
}

function applyMiniProjectAssignmentRow(row) {
  if (!row) return;
  const topic = topicByKey(row.topic_key);
  if (!topic) return;
  state.miniProjectAssignments[String(row.group_id)] = {
    groupId: Number(row.group_id),
    groupName: row.group_name || `Group ${row.group_id}`,
    topicKey: row.topic_key,
    updatedAt: row.updated_at
  };
}

function removeMiniProjectAssignmentRow(row) {
  if (!row) return;
  delete state.miniProjectAssignments[String(row.group_id)];
}

function applyMadaReviewRow(row) {
  if (!row) return;
  state.madaReviews[madaReviewKey(row.group_id, row.jury_name)] = {
    groupId: row.group_id,
    groupName: row.group_name,
    juryName: row.jury_name,
    scores: row.scores || {},
    groupNote: row.group_note || "",
    individualNotes: row.individual_notes || {},
    updatedAt: row.updated_at,
    remoteId: row.id
  };
}

function removeMadaReviewRow(row) {
  if (!row) return;
  delete state.madaReviews[madaReviewKey(row.group_id, row.jury_name)];
}

function applyMadaAssignmentRow(row) {
  if (!row) return;
  const topic = madaTopicByKey(row.topic_key);
  if (!topic) return;
  state.madaAssignments[String(row.group_id)] = {
    groupId: Number(row.group_id),
    groupName: row.group_name || `Group ${row.group_id}`,
    topicKey: row.topic_key,
    updatedAt: row.updated_at
  };
}

function removeMadaAssignmentRow(row) {
  if (!row) return;
  delete state.madaAssignments[String(row.group_id)];
}

function applyReportRow(row) {
  if (!row) return;
  state.reports[row.report_key] = row.content || "";
}

function applyAIUsageRows(rows = []) {
  state.aiUsageEvents = rows
    .filter(row => row?.created_at)
    .map(row => ({
      eventKey: row.event_key || "",
      model: row.model || "",
      promptTokens: Number(row.prompt_tokens || 0),
      outputTokens: Number(row.output_tokens || 0),
      totalTokens: Number(row.total_tokens || 0),
      createdAt: row.created_at
    }));
}

function applyAIUsageRow(row) {
  if (!row?.created_at) return;
  state.aiUsageEvents = [
    {
      eventKey: row.event_key || "",
      model: row.model || "",
      promptTokens: Number(row.prompt_tokens || 0),
      outputTokens: Number(row.output_tokens || 0),
      totalTokens: Number(row.total_tokens || 0),
      createdAt: row.created_at
    },
    ...(state.aiUsageEvents || [])
  ].slice(0, 500);
}

function removeReportRow(row) {
  if (!row) return;
  delete state.reports[row.report_key];
}

function applyMentorRows(rows = []) {
  const activeMentors = rows
    .filter(row => row.active !== false)
    .map(row => row.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const currentMentorWasRemoved = state.session?.role === "mentor" && activeMentors.length && !activeMentors.includes(state.activeMentor);
  if (activeMentors.length) state.mentors = activeMentors;
  if (currentMentorWasRemoved) {
    state.mentorAccessUnlocked = false;
    state.mentorAccessCode = "";
    state.mentorAccessMentor = "";
    state.session = null;
  }
  if (!state.mentors.includes(state.activeMentor)) state.activeMentor = state.mentors[0] || "Mentor";
  ensureMentorAccessCodes();
  if (state.session?.role === "mentor") state.session.name = state.activeMentor;
}

function applyMentorAccessCodeRows(rows = []) {
  rows
    .filter(row => row.mentor_name && row.access_code)
    .forEach(row => {
      state.mentorAccessCodes[row.mentor_name] = {
        code: normalizeAccessCode(row.access_code),
        active: row.active !== false,
        updatedAt: row.updated_at || row.created_at || new Date().toISOString()
      };
    });
  ensureMentorAccessCodes();
  if (state.session?.role === "mentor" && !mentorAccessIsCurrent()) {
    state.mentorAccessUnlocked = false;
    state.mentorAccessCode = "";
    state.mentorAccessMentor = "";
    state.session = null;
  }
}

function applyJuryRows(rows = []) {
  const activeJuries = rows
    .filter(row => row.active !== false)
    .map(row => row.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const currentJuryWasRemoved = state.session?.role === "jury" && activeJuries.length && !activeJuries.includes(state.activeJury);
  if (activeJuries.length) state.juries = activeJuries;
  if (currentJuryWasRemoved) {
    state.juryAccessUnlocked = false;
    state.juryAccessCode = "";
    state.juryAccessJury = "";
    state.session = null;
  }
  if (!state.juries.includes(state.activeJury)) state.activeJury = state.juries[0] || "Jury";
  ensureJuryAccessCodes();
  if (state.session?.role === "jury") state.session.name = state.activeJury;
}

function applyJuryAccessCodeRows(rows = []) {
  rows
    .filter(row => row.jury_name && row.access_code)
    .forEach(row => {
      state.juryAccessCodes[row.jury_name] = {
        code: normalizeAccessCode(row.access_code),
        active: row.active !== false,
        updatedAt: row.updated_at || row.created_at || new Date().toISOString()
      };
    });
  ensureJuryAccessCodes();
  if (state.session?.role === "jury" && !juryAccessIsCurrent()) {
    state.juryAccessUnlocked = false;
    state.juryAccessCode = "";
    state.juryAccessJury = "";
    state.session = null;
  }
}

function applyJuryAccessSettingRows(rows = []) {
  const row = rows.find(item => item.id === true || item.id === 1 || item.id === "true") || rows[0];
  if (row) state.juryAccessPublic = row.public_access === true;
}

function applyStakeholderAccessRows(rows = []) {
  rows
    .filter(row => row.event_key && row.access_code)
    .forEach(row => {
      state.stakeholderAccessCodes[row.event_key] = {
        code: normalizeAccessCode(row.access_code),
        active: row.active !== false,
        updatedAt: row.updated_at || row.created_at || new Date().toISOString()
      };
    });
  ensureStakeholderAccessCodes();
}

function applyEventGroupRows(rows = []) {
  const activeRows = rows.filter(row => row.active !== false);
  const buildGroups = eventKey => activeRows
    .filter(row => row.event_key === eventKey)
    .sort((a, b) => Number(a.group_id) - Number(b.group_id))
    .map(row => ({
      id: Number(row.group_id),
      name: row.group_name || `Group ${row.group_id}`,
      office: row.office || undefined,
      participants: Array.isArray(row.participants) ? row.participants.filter(Boolean) : []
    }));

  const mauritiusGroups = buildGroups("mauritius");
  const madagascarGroups = buildGroups("madagascar");
  if (mauritiusGroups.length) state.data.groups = mauritiusGroups;
  if (madagascarGroups.length) state.madaGroups = madagascarGroups;
}

function applyMadaJuryRows(rows = []) {
  const activeMadaJuries = rows
    .filter(row => row.active !== false)
    .map(row => row.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (activeMadaJuries.length) state.madaJuries = activeMadaJuries;
  state.madaJuryOffices = Object.fromEntries(rows.filter(row => row.name && row.office).map(row => [row.name, row.office]));
  if (!state.madaJuries.includes(state.activeMadaJury)) state.activeMadaJury = state.madaJuries[0] || null;
  if (state.session?.role === "jury-mada") state.session.name = state.activeMadaJury;
}

async function addMentorAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can add mentors.");
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) throw new Error("Enter a mentor name.");
  if (state.mentors.some(mentor => mentor.toLowerCase() === cleanName.toLowerCase())) throw new Error("This mentor already exists.");

  state.mentors = [...state.mentors, cleanName].sort((a, b) => a.localeCompare(b));
  ensureMentorAccessCodes();
  saveLocal();

  if (!remoteEnabled()) return cleanName;

  const { error } = await supabaseClient
    .from("mentors")
    .upsert({ name: cleanName, active: true }, { onConflict: "name" });
  if (error) throw error;

  await persistMentorAccessCode(cleanName);
  return cleanName;
}

async function deleteMentorAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete mentors.");
  if (state.mentors.length <= 1) throw new Error("Keep at least one mentor.");

  state.mentors = state.mentors.filter(mentor => mentor !== name);
  if (state.activeMentor === name) {
    state.mentorAccessUnlocked = false;
    state.mentorAccessCode = "";
    state.mentorAccessMentor = "";
    if (state.session?.role === "mentor") state.session = null;
    state.activeMentor = state.mentors[0] || "Mentor";
  }
  delete state.mentorAccessCodes[name];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mentors")
    .delete()
    .eq("name", name);
  if (error) throw error;

  await supabaseClient
    .from("mentor_access_codes")
    .delete()
    .eq("mentor_name", name);
}

async function persistMentorAccessCode(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage mentor codes.");
  const record = state.mentorAccessCodes?.[name];
  if (!record?.code || !remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mentor_access_codes")
    .upsert({
      mentor_name: name,
      access_code: normalizeAccessCode(record.code),
      active: record.active !== false
    }, { onConflict: "mentor_name" });
  if (error) throw error;
}

async function regenerateMentorAccessCode(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage mentor codes.");
  if (!state.mentors.includes(name)) throw new Error("Choose a mentor.");

  state.mentorAccessCodes[name] = {
    code: generateMentorCode(),
    active: true,
    updatedAt: new Date().toISOString()
  };
  if (state.activeMentor === name && state.session?.role === "mentor") {
    state.mentorAccessUnlocked = false;
    state.mentorAccessCode = "";
    state.mentorAccessMentor = "";
  }
  saveLocal();
  await persistMentorAccessCode(name);
}

async function regenerateAllMentorAccessCodes() {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage mentor codes.");
  state.mentors.forEach(name => {
    state.mentorAccessCodes[name] = {
      code: generateMentorCode(),
      active: true,
      updatedAt: new Date().toISOString()
    };
  });
  state.mentorAccessUnlocked = false;
  state.mentorAccessCode = "";
  state.mentorAccessMentor = "";
  saveLocal();

  if (!remoteEnabled()) return;

  const rows = state.mentors.map(name => ({
    mentor_name: name,
    access_code: state.mentorAccessCodes[name].code,
    active: true
  }));
  const { error } = await supabaseClient
    .from("mentor_access_codes")
    .upsert(rows, { onConflict: "mentor_name" });
  if (error) throw error;
}

function mentorForAccessCode(code) {
  const cleanCode = normalizeAccessCode(code);
  return state.mentors.find(name => {
    const record = state.mentorAccessCodes?.[name];
    return record?.active !== false && normalizeAccessCode(record?.code) === cleanCode;
  });
}

async function verifyMentorAccessCode(code) {
  const cleanCode = normalizeAccessCode(code);
  if (!cleanCode) return null;
  if (!remoteEnabled()) return mentorForAccessCode(cleanCode);

  const { data, error } = await supabaseClient.rpc("verify_mentor_access_code", {
    submitted_code: cleanCode
  });
  if (error) throw error;
  return data || null;
}

function juryForAccessCode(code) {
  const cleanCode = normalizeAccessCode(code);
  return state.juries.find(name => {
    const record = state.juryAccessCodes?.[name];
    return record?.active !== false && normalizeAccessCode(record?.code) === cleanCode;
  });
}

async function verifyJuryAccessCode(code) {
  const cleanCode = normalizeAccessCode(code);
  if (!cleanCode) return null;
  if (state.juryAccessPublic) return state.activeJury || state.juries[0] || null;
  if (!remoteEnabled()) return juryForAccessCode(cleanCode);

  const { data, error } = await supabaseClient.rpc("verify_jury_access_code", {
    submitted_code: cleanCode
  });
  if (error) throw error;
  return data || null;
}

async function unlockMentorFromAccessCode(code, expectedMentor = "") {
  const mentorName = await verifyMentorAccessCode(code);
  if (!mentorName) return null;
  if (expectedMentor && mentorNameFromSlug(expectedMentor) && mentorNameFromSlug(expectedMentor) !== mentorName) return null;

  state.activeMentor = mentorName;
  state.mentorAccessUnlocked = true;
  state.mentorAccessCode = normalizeAccessCode(code);
  state.mentorAccessMentor = mentorName;
  state.session = { name: mentorName, role: "mentor" };
  save();
  return mentorName;
}

async function unlockJuryFromAccessCode(code, expectedJury = "") {
  const juryName = await verifyJuryAccessCode(code);
  if (!juryName) return null;
  if (expectedJury && juryNameFromSlug(expectedJury) && juryNameFromSlug(expectedJury) !== juryName) return null;

  state.activeJury = juryName;
  state.juryAccessUnlocked = true;
  state.juryAccessCode = normalizeAccessCode(code);
  state.juryAccessJury = juryName;
  state.session = { name: juryName, role: "jury" };
  save();
  return juryName;
}

function stakeholderForAccessCode(eventKey, code) {
  const cleanCode = normalizeAccessCode(code);
  const record = state.stakeholderAccessCodes?.[eventKey];
  return record?.active !== false && normalizeAccessCode(record?.code) === cleanCode;
}

async function verifyStakeholderAccessCode(eventKey, code) {
  const cleanCode = normalizeAccessCode(code);
  if (!stakeholderEvents[eventKey] || !cleanCode) return false;
  if (!remoteEnabled()) return stakeholderForAccessCode(eventKey, cleanCode);

  const { data, error } = await supabaseClient.rpc("verify_stakeholder_access_code", {
    requested_event_key: eventKey,
    submitted_code: cleanCode
  });
  if (error) throw error;
  return data === true;
}

async function unlockStakeholderFromAccessCode(eventKey, code) {
  const ok = await verifyStakeholderAccessCode(eventKey, code);
  if (!ok) return false;

  state.stakeholderAccessUnlocked = { ...state.stakeholderAccessUnlocked, [eventKey]: true };
  state.stakeholderAccessCode = { ...state.stakeholderAccessCode, [eventKey]: normalizeAccessCode(code) };
  state.session = { name: stakeholderEventLabel(eventKey), role: "stakeholder", eventKey };
  save();
  return true;
}

async function persistStakeholderAccessCode(eventKey) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage stakeholder links.");
  const record = state.stakeholderAccessCodes?.[eventKey];
  if (!record?.code || !remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("stakeholder_access_codes")
    .upsert({
      event_key: eventKey,
      access_code: normalizeAccessCode(record.code),
      active: record.active !== false
    }, { onConflict: "event_key" });
  if (error) throw error;
}

async function regenerateStakeholderAccessCode(eventKey) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage stakeholder links.");
  if (!stakeholderEvents[eventKey]) throw new Error("Choose a stakeholder dashboard.");

  state.stakeholderAccessCodes[eventKey] = {
    code: generateStakeholderCode(),
    active: true,
    updatedAt: new Date().toISOString()
  };
  state.stakeholderAccessUnlocked = { ...state.stakeholderAccessUnlocked, [eventKey]: false };
  state.stakeholderAccessCode = { ...state.stakeholderAccessCode, [eventKey]: "" };
  saveLocal();
  await persistStakeholderAccessCode(eventKey);
}

async function setStakeholderAccessActive(eventKey, active) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage stakeholder links.");
  if (!stakeholderEvents[eventKey]) throw new Error("Choose a stakeholder dashboard.");
  ensureStakeholderAccessCodes();

  state.stakeholderAccessCodes[eventKey] = {
    ...state.stakeholderAccessCodes[eventKey],
    active: Boolean(active),
    updatedAt: new Date().toISOString()
  };
  if (!active) {
    state.stakeholderAccessUnlocked = { ...state.stakeholderAccessUnlocked, [eventKey]: false };
    state.stakeholderAccessCode = { ...state.stakeholderAccessCode, [eventKey]: "" };
  }
  saveLocal();
  await persistStakeholderAccessCode(eventKey);
}

function mentorCodeModal(mentorName, message = "", options = {}) {
  document.querySelector(".mentor-code-modal")?.remove();
  const eyebrow = options.eyebrow || "Mentor access";
  const subtitle = options.subtitle || "Enter your private mentor code to open corrections.";

  return new Promise(resolve => {
    const modal = document.createElement("div");
    modal.className = "mentor-code-modal";
    modal.innerHTML = `<div class="mentor-code-dialog" role="dialog" aria-modal="true" aria-label="${esc(eyebrow)} code"><button class="mentor-code-close" type="button" aria-label="Close">×</button><span class="mentor-code-avatar">${esc(mentorName.slice(0, 1))}</span><p class="eyebrow orange-eyebrow">${esc(eyebrow)}</p><h2>${esc(mentorName)}</h2><p class="subtle">${esc(subtitle)}</p>${message ? `<div class="mentor-code-error">${esc(message)}</div>` : ""}<form><label>Access code<input name="accessCode" type="text" inputmode="text" autocomplete="one-time-code" placeholder="SP-XXXX-XXXX-XXXX" required autofocus></label><div class="mentor-code-buttons"><button class="secondary" type="button" data-cancel>Cancel</button><button class="primary" type="submit">Unlock</button></div></form></div>`;

    const close = value => {
      modal.remove();
      resolve(value);
    };

    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest(".mentor-code-close") || event.target.closest("[data-cancel]")) close("");
    });
    modal.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      close(new FormData(event.target).get("accessCode") || "");
    });

    document.body.appendChild(modal);
    modal.querySelector("input")?.focus();
  });
}

async function promptForMentorCode(mentorName) {
  let errorMessage = "";

  while (true) {
    const submittedCode = await mentorCodeModal(mentorName, errorMessage);
    if (!submittedCode) return;

    try {
      const unlockedMentor = await unlockMentorFromAccessCode(submittedCode, mentorSlug(mentorName));
      if (!unlockedMentor) {
        errorMessage = "Wrong code for this mentor. Check the latest code from admin.";
        continue;
      }
      showToast(`Mentor page unlocked for ${unlockedMentor}`);
      mentorDashboard();
      return;
    } catch (error) {
      errorMessage = friendlyError(error, "Could not verify this code. Try again.");
    }
  }
}

async function promptForJuryCode(juryName) {
  if (state.juryAccessPublic) {
    state.activeJury = juryName;
    state.session = { name: juryName, role: "jury" };
    state.juryAccessUnlocked = true;
    state.juryAccessJury = juryName;
    save();
    miniProjectDashboard();
    return;
  }

  let errorMessage = "";

  while (true) {
    const submittedCode = await mentorCodeModal(juryName, errorMessage, {
      eyebrow: "Jury access",
      subtitle: "Enter your private jury code to open scoring."
    });
    if (!submittedCode) return;

    try {
      const unlockedJury = await unlockJuryFromAccessCode(submittedCode, jurySlug(juryName));
      if (!unlockedJury) {
        errorMessage = "Wrong code for this jury member. Check the latest code from admin.";
        continue;
      }
      showToast(`Jury page unlocked for ${unlockedJury}`);
      miniProjectDashboard();
      return;
    } catch (error) {
      errorMessage = friendlyError(error, "Could not verify this code. Try again.");
    }
  }
}

async function addJuryAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can add jury members.");
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) throw new Error("Enter a jury name.");
  if (state.juries.some(jury => jury.toLowerCase() === cleanName.toLowerCase())) throw new Error("This jury member already exists.");

  state.juries = [...state.juries, cleanName].sort((a, b) => a.localeCompare(b));
  ensureJuryAccessCodes();
  saveLocal();

  if (!remoteEnabled()) return cleanName;

  const { error } = await supabaseClient
    .from("juries")
    .upsert({ name: cleanName, active: true }, { onConflict: "name" });
  if (error) throw error;

  await persistJuryAccessCode(cleanName);
  return cleanName;
}

async function renameJuryAsAdmin(oldName, newName) {
  if (state.session?.role !== "admin") throw new Error("Only admin can rename jury members.");
  const cleanName = newName.trim().replace(/\s+/g, " ");
  if (!oldName || !cleanName) throw new Error("Choose a jury member and enter the new name.");
  if (oldName === cleanName) return;
  if (state.juries.some(jury => jury !== oldName && jury.toLowerCase() === cleanName.toLowerCase())) throw new Error("This jury name already exists.");

  state.juries = state.juries.map(jury => jury === oldName ? cleanName : jury).sort((a, b) => a.localeCompare(b));
  if (state.activeJury === oldName) state.activeJury = cleanName;
  state.juryAccessCodes[cleanName] = state.juryAccessCodes[oldName] || { code: generateJuryCode(), active: true, updatedAt: new Date().toISOString() };
  delete state.juryAccessCodes[oldName];
  Object.values(state.miniProjectReviews).forEach(review => {
    if (review.juryName === oldName) review.juryName = cleanName;
  });
  state.miniProjectReviews = Object.fromEntries(Object.values(state.miniProjectReviews).map(review => [miniReviewKey(review.groupId, review.juryName), review]));
  saveLocal();

  if (!remoteEnabled()) return;

  const { error: upsertError } = await supabaseClient
    .from("juries")
    .upsert({ name: cleanName, active: true }, { onConflict: "name" });
  if (upsertError) throw upsertError;

  await persistJuryAccessCode(cleanName);

  const { error: reviewError } = await supabaseClient
    .from("mini_project_reviews")
    .update({ jury_name: cleanName })
    .eq("jury_name", oldName);
  if (reviewError) throw reviewError;

  const { error: deleteError } = await supabaseClient
    .from("juries")
    .delete()
    .eq("name", oldName);
  if (deleteError) throw deleteError;

  await supabaseClient
    .from("jury_access_codes")
    .delete()
    .eq("jury_name", oldName);
}

async function deleteJuryAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete jury members.");
  if (state.juries.length <= 1) throw new Error("Keep at least one jury member.");

  state.juries = state.juries.filter(jury => jury !== name);
  if (state.activeJury === name) {
    state.juryAccessUnlocked = false;
    state.juryAccessCode = "";
    state.juryAccessJury = "";
    if (state.session?.role === "jury") state.session = null;
    state.activeJury = state.juries[0] || "Jury";
  }
  delete state.juryAccessCodes[name];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("juries")
    .delete()
    .eq("name", name);
  if (error) throw error;

  await supabaseClient
    .from("jury_access_codes")
    .delete()
    .eq("jury_name", name);
}

async function persistJuryAccessCode(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage jury codes.");
  const record = state.juryAccessCodes?.[name];
  if (!record?.code || !remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("jury_access_codes")
    .upsert({
      jury_name: name,
      access_code: normalizeAccessCode(record.code),
      active: record.active !== false
    }, { onConflict: "jury_name" });
  if (error) throw error;
}

async function regenerateJuryAccessCode(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage jury codes.");
  if (!state.juries.includes(name)) throw new Error("Choose a jury member.");

  state.juryAccessCodes[name] = {
    code: generateJuryCode(),
    active: true,
    updatedAt: new Date().toISOString()
  };
  if (state.activeJury === name && state.session?.role === "jury") {
    state.juryAccessUnlocked = false;
    state.juryAccessCode = "";
    state.juryAccessJury = "";
  }
  saveLocal();
  await persistJuryAccessCode(name);
}

async function regenerateAllJuryAccessCodes() {
  if (state.session?.role !== "admin") throw new Error("Only admin can manage jury codes.");
  state.juries.forEach(name => {
    state.juryAccessCodes[name] = {
      code: generateJuryCode(),
      active: true,
      updatedAt: new Date().toISOString()
    };
  });
  state.juryAccessUnlocked = false;
  state.juryAccessCode = "";
  state.juryAccessJury = "";
  saveLocal();

  if (!remoteEnabled()) return;

  const rows = state.juries.map(name => ({
    jury_name: name,
    access_code: state.juryAccessCodes[name].code,
    active: true
  }));
  const { error } = await supabaseClient
    .from("jury_access_codes")
    .upsert(rows, { onConflict: "jury_name" });
  if (error) throw error;
}

async function setJuryAccessPublic(value) {
  if (state.session?.role !== "admin") throw new Error("Only admin can change jury access.");
  state.juryAccessPublic = Boolean(value);
  if (state.juryAccessPublic) {
    state.juryAccessUnlocked = true;
    state.juryAccessCode = "";
    state.juryAccessJury = state.activeJury;
  }
  saveLocal();

  if (!remoteEnabled()) return;
  const { error } = await supabaseClient
    .from("jury_access_settings")
    .upsert({ id: true, public_access: state.juryAccessPublic }, { onConflict: "id" });
  if (error) throw error;
}

async function addMadaJuryAsAdmin(name, office) {
  if (state.session?.role !== "admin") throw new Error("Only admin can add Spoon Madagascar jury members.");
  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanOffice = madaOffices.includes(office) ? office : madaOffices[0];
  if (!cleanName) throw new Error("Enter a jury name.");
  if (state.madaJuries.some(jury => jury.toLowerCase() === cleanName.toLowerCase())) throw new Error("This jury member already exists.");

  state.madaJuries = [...state.madaJuries, cleanName].sort((a, b) => a.localeCompare(b));
  state.madaJuryOffices = { ...state.madaJuryOffices, [cleanName]: cleanOffice };
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("spoon_madagascar_juries")
    .upsert({ name: cleanName, office: cleanOffice, active: true }, { onConflict: "name" });
  if (error) throw error;
}

async function renameMadaJuryAsAdmin(oldName, newName, office) {
  if (state.session?.role !== "admin") throw new Error("Only admin can rename Spoon Madagascar jury members.");
  const cleanName = newName.trim().replace(/\s+/g, " ");
  if (!oldName || !cleanName) throw new Error("Choose a jury member and enter the new name.");
  const cleanOffice = madaOffices.includes(office) ? office : (state.madaJuryOffices?.[oldName] || madaOffices[0]);
  if (oldName !== cleanName && state.madaJuries.some(jury => jury !== oldName && jury.toLowerCase() === cleanName.toLowerCase())) throw new Error("This jury name already exists.");

  state.madaJuries = state.madaJuries.map(jury => jury === oldName ? cleanName : jury).sort((a, b) => a.localeCompare(b));
  if (state.activeMadaJury === oldName) state.activeMadaJury = cleanName;
  const nextMadaJuryOffices = { ...state.madaJuryOffices };
  delete nextMadaJuryOffices[oldName];
  nextMadaJuryOffices[cleanName] = cleanOffice;
  state.madaJuryOffices = nextMadaJuryOffices;
  Object.values(state.madaReviews).forEach(review => {
    if (review.juryName === oldName) review.juryName = cleanName;
  });
  state.madaReviews = Object.fromEntries(Object.values(state.madaReviews).map(review => [madaReviewKey(review.groupId, review.juryName), review]));
  saveLocal();

  if (!remoteEnabled()) return;

  const { error: upsertError } = await supabaseClient
    .from("spoon_madagascar_juries")
    .upsert({ name: cleanName, office: cleanOffice, active: true }, { onConflict: "name" });
  if (upsertError) throw upsertError;

  if (oldName !== cleanName) {
    const { error: reviewError } = await supabaseClient
      .from("spoon_madagascar_reviews")
      .update({ jury_name: cleanName })
      .eq("jury_name", oldName);
    if (reviewError) throw reviewError;

    const { error: deleteError } = await supabaseClient
      .from("spoon_madagascar_juries")
      .delete()
      .eq("name", oldName);
    if (deleteError) throw deleteError;
  }
}

async function deleteMadaJuryAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete Spoon Madagascar jury members.");
  if (state.madaJuries.length <= 1) throw new Error("Keep at least one jury member.");

  state.madaJuries = state.madaJuries.filter(jury => jury !== name);
  const nextMadaJuryOffices = { ...state.madaJuryOffices };
  delete nextMadaJuryOffices[name];
  state.madaJuryOffices = nextMadaJuryOffices;
  if (state.activeMadaJury === name) state.activeMadaJury = state.madaJuries[0] || null;
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("spoon_madagascar_juries")
    .delete()
    .eq("name", name);
  if (error) throw error;
}

async function verifyAdminSession() {
  if (!adminAuthEnabled()) return false;

  const { data: sessionResult, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError || !sessionResult.session) return false;

  const { data: isAdmin, error: adminError } = await supabaseClient.rpc("is_admin");
  if (adminError || !isAdmin) return false;

  const user = sessionResult.session.user;
  state.session = {
    name: user.email?.split("@")[0] || "Admin",
    email: user.email,
    role: "admin"
  };
  saveLocal();
  return true;
}

async function signInAdmin(email, password) {
  if (!adminAuthEnabled()) {
    if (password !== "admin") throw new Error("For preview mode, use the password “admin”.");
    state.session = { name: email.split("@")[0], email, role: "admin" };
    saveLocal();
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Admin email or password is incorrect.");

  const { data: isAdmin, error: adminError } = await supabaseClient.rpc("is_admin");
  if (adminError || !isAdmin) {
    await supabaseClient.auth.signOut();
    throw new Error("This account is not approved as an admin.");
  }

  state.session = {
    name: data.user.email?.split("@")[0] || "Admin",
    email: data.user.email,
    role: "admin"
  };
  saveLocal();
}

async function signOutAdmin() {
  if (remoteEnabled()) await supabaseClient.auth.signOut();
  state.reports = {};
  state.changeHistory = [];
  openCurrentPublicFlow();
}

async function loadSharedData(options = {}) {
  const includeAdminData = options.includeAdminData ?? state.session?.role === "admin";

  if (!remoteEnabled()) {
    state.syncStatus = cfg.demoMode ? "demo" : "offline";
    saveLocal();
    return;
  }

  state.syncStatus = "loading";
  saveLocal();

  try {
    const [mentorsResult, mentorCodesResult, juriesResult, juryCodesResult, jurySettingsResult, stakeholderCodesResult, eventGroupsResult, projectAssignments, corrections, remarks, adminFeedback, miniReviews, photoRecords, reports, aiUsage, history, madaJuriesResult, madaAssignments, madaReviews] = await Promise.all([
      supabaseClient.from("mentors").select("*").order("name", { ascending: true }),
      includeAdminData ? supabaseClient.from("mentor_access_codes").select("*").order("mentor_name", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      supabaseClient.from("juries").select("*").order("name", { ascending: true }),
      includeAdminData ? supabaseClient.from("jury_access_codes").select("*").order("jury_name", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      supabaseClient.from("jury_access_settings").select("*").limit(1),
      includeAdminData ? supabaseClient.from("stakeholder_access_codes").select("*").order("event_key", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      supabaseClient.from("event_groups").select("*").order("event_key", { ascending: true }).order("group_id", { ascending: true }),
      supabaseClient.from("mini_project_assignments").select("*").order("group_id", { ascending: true }),
      supabaseClient.from("group_corrections").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("individual_remarks").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("admin_individual_feedback").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("mini_project_reviews").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("newbie_photos").select("*").order("updated_at", { ascending: false }),
      includeAdminData ? supabaseClient.from("ai_reports").select("*").order("generated_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      includeAdminData ? supabaseClient.from("ai_usage_events").select("*").order("created_at", { ascending: false }).limit(500) : Promise.resolve({ data: [], error: null }),
      includeAdminData ? supabaseClient.from("change_history").select("*").order("changed_at", { ascending: false }).limit(50) : Promise.resolve({ data: [], error: null }),
      supabaseClient.from("spoon_madagascar_juries").select("*").order("name", { ascending: true }),
      supabaseClient.from("spoon_madagascar_assignments").select("*").order("group_id", { ascending: true }),
      supabaseClient.from("spoon_madagascar_reviews").select("*").order("updated_at", { ascending: false })
    ]);

    for (const result of [corrections, remarks, reports, history]) {
      if (result.error) throw result.error;
    }
    if (projectAssignments.error) console.warn("Could not load mini_project_assignments table. Run the topic assignment SQL setup when ready.", projectAssignments.error);
    if (miniReviews.error) console.warn("Could not load mini_project_reviews table. Run the mini project SQL setup when ready.", miniReviews.error);
    if (adminFeedback.error) console.warn("Could not load admin_individual_feedback table. Run the latest setup script to let admins add stakeholder notes.", adminFeedback.error);
    if (photoRecords.error) console.warn("Could not load newbie_photos table. Run the photo SQL setup when ready.", photoRecords.error);
    if (includeAdminData && aiUsage.error) console.warn("Could not load ai_usage_events table. Run the latest setup script to show AI usage.", aiUsage.error);
    state.mentorCodeSetupMissing = includeAdminData && Boolean(mentorCodesResult.error);
    if (state.mentorCodeSetupMissing) console.warn("Could not load mentor_access_codes table. Run the latest setup script to share mentor codes across devices.", mentorCodesResult.error);
    state.juryCodeSetupMissing = Boolean(jurySettingsResult.error) || (includeAdminData && Boolean(juryCodesResult.error));
    if (state.juryCodeSetupMissing) console.warn("Could not load jury access tables. Run the latest setup script to share jury codes/settings across devices.", jurySettingsResult.error || juryCodesResult.error);
    state.stakeholderCodeSetupMissing = includeAdminData && Boolean(stakeholderCodesResult.error);
    if (state.stakeholderCodeSetupMissing) console.warn("Could not load stakeholder_access_codes table. Run the latest setup script before sharing stakeholder links.", stakeholderCodesResult.error);
    if (eventGroupsResult.error) console.warn("Could not load event_groups table. Group edits will stay local until the setup script is run.", eventGroupsResult.error);
    if (madaAssignments.error) console.warn("Could not load spoon_madagascar_assignments table. Run the Spoon Madagascar SQL setup when ready.", madaAssignments.error);
    if (madaReviews.error) console.warn("Could not load spoon_madagascar_reviews table. Run the Spoon Madagascar SQL setup when ready.", madaReviews.error);
    if (!mentorsResult.error) applyMentorRows(mentorsResult.data);
    else console.warn("Could not load mentors table; using local mentor list.", mentorsResult.error);
    if (includeAdminData && !mentorCodesResult.error) applyMentorAccessCodeRows(mentorCodesResult.data);
    else ensureMentorAccessCodes();
    if (!juriesResult.error) applyJuryRows(juriesResult.data);
    else console.warn("Could not load juries table; using local jury list.", juriesResult.error);
    if (!eventGroupsResult.error) applyEventGroupRows(eventGroupsResult.data);
    if (!jurySettingsResult.error) applyJuryAccessSettingRows(jurySettingsResult.data);
    if (includeAdminData && !juryCodesResult.error) applyJuryAccessCodeRows(juryCodesResult.data);
    else ensureJuryAccessCodes();
    if (includeAdminData && !stakeholderCodesResult.error) applyStakeholderAccessRows(stakeholderCodesResult.data);
    else ensureStakeholderAccessCodes();
    if (!madaJuriesResult.error) applyMadaJuryRows(madaJuriesResult.data);
    else console.warn("Could not load spoon_madagascar_juries table; using local jury list.", madaJuriesResult.error);

    state.groupCorrections = {};
    state.individualRemarks = {};
    state.adminIndividualFeedback = {};
    state.miniProjectReviews = {};
    state.miniProjectAssignments = {};
    state.madaReviews = {};
    state.madaAssignments = {};
    if (includeAdminData) state.reports = {};

    corrections.data.forEach(applyGroupCorrectionRow);
    remarks.data.forEach(applyIndividualRemarkRow);
    if (!adminFeedback.error) adminFeedback.data.forEach(applyAdminIndividualFeedbackRow);
    if (!projectAssignments.error) projectAssignments.data.forEach(applyMiniProjectAssignmentRow);
    if (!miniReviews.error) miniReviews.data.forEach(applyMiniProjectReviewRow);
    if (!madaAssignments.error) madaAssignments.data.forEach(applyMadaAssignmentRow);
    if (!madaReviews.error) madaReviews.data.forEach(applyMadaReviewRow);
    applyPhotoRows(photoRecords.error ? [] : photoRecords.data);
    await hydratePhotoUrls();
    if (includeAdminData) {
      reports.data.forEach(applyReportRow);
      applyAIUsageRows(aiUsage.error ? [] : aiUsage.data);
      state.changeHistory = history.data || [];
    }
    state.syncStatus = "online";
    saveLocal();
  } catch (error) {
    console.error("Shared data load failed", error);
    state.syncStatus = "error";
    saveLocal();
    showToast(friendlyError(error, "Could not refresh shared data. Using the copy saved on this device."));
  }
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    saveLocal();
    const formOpen = Boolean(document.querySelector("#group-review-form, #mini-project-form, #mini-project-topic-form, #admin-individual-feedback-form, .admin-mini-review-form"));
    if (location.hash === "#admin" && state.session?.role === "admin") {
      adminDashboard(lastAdminMentor);
      return;
    }
    if (location.hash === "#admin-table" && state.session?.role === "admin" && !formOpen) {
      adminTablePage();
      return;
    }
    if (location.hash === "#mini-project" && state.session?.role === "jury" && !formOpen) {
      miniProjectDashboard();
      return;
    }
    if (location.hash === "#stakeholder" && !formOpen) {
      const params = new URLSearchParams(location.search);
      const eventKey = stakeholderEvents[params.get("stakeholder")] ? params.get("stakeholder") : state.session?.eventKey || "mauritius";
      stakeholderDashboard(eventKey);
      return;
    }
    if (!formOpen) openPublicForm();
  }, 350);
}

function scheduleMadaRefresh() {
  clearTimeout(madaRefreshTimer);
  madaRefreshTimer = setTimeout(() => {
    saveLocal();
    const formOpen = Boolean(document.querySelector("#mada-review-form, #mada-topic-form, #admin-individual-feedback-form, .admin-mada-review-form"));
    if (formOpen) return;
    if (location.hash === "#admin/spoon-madagascar" && state.session?.role === "admin") {
      madaAdminPage();
      return;
    }
    if (location.hash === "#mpm" && state.session?.role === "jury-mada") {
      if (state.madaJuryView === "review" && state.activeMadaGroup) return madaJuryReviewView(state.activeMadaGroup);
      if (state.madaJuryView === "groups") return madaJuryDashboard();
    }
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
    .on("postgres_changes", { event: "*", schema: "public", table: "admin_individual_feedback" }, payload => {
      if (payload.eventType === "DELETE") removeAdminIndividualFeedbackRow(payload.old);
      else applyAdminIndividualFeedbackRow(payload.new);
      scheduleRefresh();
      scheduleMadaRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "mini_project_reviews" }, payload => {
      if (payload.eventType === "DELETE") removeMiniProjectReviewRow(payload.old);
      else applyMiniProjectReviewRow(payload.new);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "mini_project_assignments" }, payload => {
      if (payload.eventType === "DELETE") removeMiniProjectAssignmentRow(payload.old);
      else applyMiniProjectAssignmentRow(payload.new);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "newbie_photos" }, async payload => {
      if (payload.eventType === "DELETE") removePhotoRow(payload.old);
      else applyPhotoRow(payload.new);
      await hydratePhotoUrls();
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "ai_reports" }, payload => {
      if (payload.eventType === "DELETE") removeReportRow(payload.old);
      else applyReportRow(payload.new);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_usage_events" }, payload => {
      applyAIUsageRow(payload.new);
      scheduleRefresh();
      scheduleMadaRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, async () => {
      const { data, error } = await supabaseClient.from("mentors").select("*").order("name", { ascending: true });
      if (!error) {
        applyMentorRows(data);
        scheduleRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "mentor_access_codes" }, async () => {
      const { data, error } = await supabaseClient.from("mentor_access_codes").select("*").order("mentor_name", { ascending: true });
      if (!error) {
        applyMentorAccessCodeRows(data);
        scheduleRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "juries" }, async () => {
      const { data, error } = await supabaseClient.from("juries").select("*").order("name", { ascending: true });
      if (!error) {
        applyJuryRows(data);
        scheduleRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "jury_access_codes" }, async () => {
      const { data, error } = await supabaseClient.from("jury_access_codes").select("*").order("jury_name", { ascending: true });
      if (!error) {
        applyJuryAccessCodeRows(data);
        scheduleRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "jury_access_settings" }, payload => {
      if (payload.new) applyJuryAccessSettingRows([payload.new]);
      scheduleRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "event_groups" }, async () => {
      const { data, error } = await supabaseClient.from("event_groups").select("*").order("event_key", { ascending: true }).order("group_id", { ascending: true });
      if (!error) {
        applyEventGroupRows(data);
        scheduleRefresh();
        scheduleMadaRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "spoon_madagascar_juries" }, async () => {
      const { data, error } = await supabaseClient.from("spoon_madagascar_juries").select("*").order("name", { ascending: true });
      if (!error) {
        applyMadaJuryRows(data);
        scheduleMadaRefresh();
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "spoon_madagascar_assignments" }, payload => {
      if (payload.eventType === "DELETE") removeMadaAssignmentRow(payload.old);
      else applyMadaAssignmentRow(payload.new);
      scheduleMadaRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "spoon_madagascar_reviews" }, payload => {
      if (payload.eventType === "DELETE") removeMadaReviewRow(payload.old);
      else applyMadaReviewRow(payload.new);
      scheduleMadaRefresh();
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
  const question = state.data.questions.find(item => item.id === Number(qid));
  const maxMarks = question?.maxMarks ?? null;
  const marksAwarded = normalizeMark(formData.marksAwarded, maxMarks);

  const correctionPayload = {
    group_id: group.id,
    group_name: group.name,
    question_position: qid,
    mentor_name: state.activeMentor,
    work_state: "completed",
    status: markStatus(marksAwarded, maxMarks),
    marks_awarded: marksAwarded,
    max_marks: maxMarks,
    correction: formData.correction || "",
    group_remark: formData.groupRemark || ""
  };

  const { error: correctionError } = await supabaseClient
    .from("group_corrections")
    .upsert(correctionPayload, { onConflict: "group_id,question_position" });

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
        .eq("question_position", qid);
    }

    return supabaseClient
      .from("individual_remarks")
      .upsert({ ...base, remark: value }, { onConflict: "group_id,participant_name,question_position" });
  });

  const remarkResults = await Promise.all(remarkJobs);
  const remarkError = remarkResults.find(result => result.error)?.error;
  if (remarkError) throw remarkError;

  state.syncStatus = "online";
  saveLocal();
}

async function markQuestionInProgress(group, qid) {
  const key = correctionKey(group.id, qid);
  const existing = state.groupCorrections[key];
  if (existing?.status) return;

  state.groupCorrections[key] = {
    ...existing,
    workState: "in_progress",
    mentorName: state.activeMentor,
    updatedAt: new Date().toISOString()
  };
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("group_corrections")
    .upsert({
      group_id: group.id,
      group_name: group.name,
      question_position: qid,
      mentor_name: state.activeMentor,
      work_state: "in_progress",
      status: null,
      marks_awarded: null,
      max_marks: state.data.questions.find(item => item.id === Number(qid))?.maxMarks ?? null,
      correction: existing?.correction || "",
      group_remark: existing?.groupRemark || ""
    }, { onConflict: "group_id,question_position" });

  if (error) console.error("Could not mark question in progress", error);
}

async function persistMiniProjectReview(group, formData) {
  if (!remoteEnabled()) return;

  state.syncStatus = "saving";
  scheduleRefresh();

  const scores = Object.fromEntries(miniProjectCriteria.map(criterion => [criterion.key, normalizeMark(formData[criterion.key], criterion.max) || 0]));
  const individualNotes = Object.fromEntries(group.participants.map(person => [person, formData[`miniNote::${person}`]?.trim() || ""]).filter(([, value]) => value));

  const { error } = await supabaseClient
    .from("mini_project_reviews")
    .upsert({
      group_id: group.id,
      group_name: group.name,
      jury_name: state.activeJury,
      scores,
      total_score: miniProjectCriteria.reduce((sum, criterion) => sum + (scores[criterion.key] || 0), 0),
      group_note: formData.groupNote || "",
      individual_notes: individualNotes
    }, { onConflict: "group_id,jury_name" });

  if (error) throw error;

  state.syncStatus = "online";
  saveLocal();
}

function miniProjectPayloadFromForm(form) {
  if (!form) return null;
  const group = groupById(form.dataset.group);
  if (!group) return null;
  const data = Object.fromEntries(new FormData(form));
  const scores = Object.fromEntries(miniProjectCriteria.map(criterion => [criterion.key, normalizeMark(data[criterion.key], criterion.max) || 0]));
  const individualNotes = Object.fromEntries(group.participants.map(person => [person, data[`miniNote::${person}`]?.trim() || ""]).filter(([, value]) => value));
  return { group, data, scores, individualNotes };
}

async function persistMadaReview(group, formData) {
  if (!remoteEnabled()) return;

  state.syncStatus = "saving";
  scheduleMadaRefresh();

  const scores = Object.fromEntries(madaCriteria.map(criterion => [criterion.key, normalizeMark(formData[criterion.key], criterion.max) || 0]));
  const individualNotes = madaIndividualNotesFromForm(group, formData);

  const { error } = await supabaseClient
    .from("spoon_madagascar_reviews")
    .upsert({
      group_id: group.id,
      group_name: group.name,
      jury_name: state.activeMadaJury,
      scores,
      total_score: madaCriteria.reduce((sum, criterion) => sum + (scores[criterion.key] || 0), 0),
      group_note: formData.groupNote || "",
      individual_notes: individualNotes
    }, { onConflict: "group_id,jury_name" });

  if (error) throw error;

  state.syncStatus = "online";
  saveLocal();
}

function madaReviewPayloadFromForm(form) {
  if (!form) return null;
  const group = madaGroupById(form.dataset.madaGroup);
  if (!group) return null;
  const data = Object.fromEntries(new FormData(form));
  const scores = Object.fromEntries(madaCriteria.map(criterion => [criterion.key, normalizeMark(data[criterion.key], criterion.max) || 0]));
  const individualNotes = madaIndividualNotesFromForm(group, data);
  return { group, data, scores, individualNotes };
}

function updateMiniProjectAutosaveUi(review) {
  const score = miniProjectScore(review);
  const progress = document.querySelector(".mini-toolbar .question-progress");
  const note = document.querySelector(".mini-toolbar .autosave-note");
  if (progress) {
    const label = progress.querySelector("span");
    const bar = progress.querySelector("i");
    if (label) label.textContent = `${score}/${miniProjectTotal} selected`;
    if (bar) bar.style.width = `${score / miniProjectTotal * 100}%`;
  }
  if (note) note.textContent = "Autosaved";
}

function sanitizeCriteriaInput(input) {
  const card = input.closest(".criterion-card");
  const max = Number(card?.dataset.criteriaMax);
  let value = input.value.trim();

  if (value === "") {
    card?.classList.remove("scored");
    const badge = card?.querySelector(".criterion-title-row span");
    if (badge) badge.textContent = `Not scored /${card?.dataset.criteriaMax || ""}`;
    return;
  }

  value = value.replace(/[^\d.]/g, "");
  const firstDecimal = value.indexOf(".");
  if (firstDecimal !== -1) {
    value = value.slice(0, firstDecimal + 1) + value.slice(firstDecimal + 1).replace(/\./g, "");
  }
  if (value === "" || value === ".") {
    input.value = "";
    card?.classList.remove("scored");
    const badge = card?.querySelector(".criterion-title-row span");
    if (badge) badge.textContent = `Not scored /${card?.dataset.criteriaMax || ""}`;
    return;
  }

  const safe = normalizeMark(Math.round(Number(value) * 2) / 2, max);
  input.value = safe === null ? "" : String(safe);
  card?.classList.toggle("scored", input.value !== "");
  const badge = card?.querySelector(".criterion-title-row span");
  if (badge) badge.textContent = input.value === "" ? `Not scored /${max}` : `${input.value}/${max}`;
}

async function saveMiniProjectDraft(form, options = {}) {
  const payload = miniProjectPayloadFromForm(form);
  if (!payload) return null;
  const { group, data, scores, individualNotes } = payload;
  const signature = JSON.stringify({ groupId: group.id, jury: state.activeJury, scores, groupNote: data.groupNote || "", individualNotes });
  if (!options.force && signature === miniAutosaveSignature) return state.miniProjectReviews[miniReviewKey(group.id, state.activeJury)];

  const review = {
    groupId: group.id,
    groupName: group.name,
    juryName: state.activeJury,
    scores,
    groupNote: data.groupNote || "",
    individualNotes,
    updatedAt: new Date().toISOString()
  };
  state.miniProjectReviews[miniReviewKey(group.id, state.activeJury)] = review;
  miniAutosaveSignature = signature;
  save();
  updateMiniProjectAutosaveUi(review);

  try {
    await persistMiniProjectReview(group, data);
    updateMiniProjectAutosaveUi(review);
    if (options.toast) showToast(savedOnlineMessage("Mini-project review"));
  } catch (error) {
    console.error("Mini project autosave failed", error);
    state.syncStatus = "error";
    save();
    const note = document.querySelector(".mini-review-topbar .autosave-note, .mini-toolbar .autosave-note");
    if (note) note.textContent = "Saved on this device";
    if (options.toast) showToast(friendlyError(error, localSyncIssueMessage("update the shared review")));
  }

  return review;
}

function queueMiniProjectAutosave(form, delay = 900) {
  clearTimeout(miniAutosaveTimer);
  const note = document.querySelector(".mini-toolbar .autosave-note");
  if (note) note.textContent = "Saving…";
  miniAutosaveTimer = setTimeout(() => saveMiniProjectDraft(form), delay);
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
    state.data.questions.forEach(question => {
      rows.push({
        report_key: `question|${group.id}|${question.id}`,
        report_type: "question",
        group_id: group.id,
        group_name: group.name,
        participant_name: null,
        content: state.reports[`question|${group.id}|${question.id}`] || buildQuestionSummary(group, question)
      });
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

async function deleteCorrectionAsAdmin(groupId, qid) {
  if (state.session?.role !== "admin") throw new Error("Only admin can remove corrections.");

  const key = correctionKey(groupId, qid);
  delete state.groupCorrections[key];
  Object.keys(state.individualRemarks).forEach(remarkId => {
    const [remarkGroupId, , remarkQid] = remarkId.split("|");
    if (remarkGroupId === String(groupId) && remarkQid === String(qid)) delete state.individualRemarks[remarkId];
  });
  delete state.reports[`question|${groupId}|${qid}`];
  delete state.reports[`group|${groupId}`];
  saveLocal();

  if (!remoteEnabled()) return;

  const [correctionResult, remarkResult, questionReportResult, groupReportResult] = await Promise.all([
    supabaseClient
      .from("group_corrections")
      .delete()
      .eq("group_id", groupId)
      .eq("question_position", qid),
    supabaseClient
      .from("individual_remarks")
      .delete()
      .eq("group_id", groupId)
      .eq("question_position", qid),
    supabaseClient
      .from("ai_reports")
      .delete()
      .eq("report_key", `question|${groupId}|${qid}`),
    supabaseClient
      .from("ai_reports")
      .delete()
      .eq("report_key", `group|${groupId}`)
  ]);

  const error = [correctionResult, remarkResult, questionReportResult, groupReportResult].find(result => result.error)?.error;
  if (error) throw error;
}

async function clearRecentChangesAsAdmin() {
  if (state.session?.role !== "admin") throw new Error("Only admin can clear recent changes.");
  state.changeHistory = [];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("change_history")
    .delete()
    .neq("id", 0);

  if (error) throw error;
}

async function saveMiniProjectAssignmentsAsAdmin(formData) {
  if (state.session?.role !== "admin") throw new Error("Only admin can assign mini-project titles.");

  const rows = [];
  const deleteGroupIds = [];
  const nextAssignments = {};

  state.data.groups.forEach(group => {
    const topicKey = formData[`topic::${group.id}`] || "";
    const topic = topicByKey(topicKey);
    delete state.reports[`group|${group.id}`];

    if (!topic) {
      deleteGroupIds.push(group.id);
      return;
    }

    const assignment = {
      groupId: group.id,
      groupName: group.name,
      topicKey,
      updatedAt: new Date().toISOString()
    };
    nextAssignments[String(group.id)] = assignment;
    rows.push({
      group_id: group.id,
      group_name: group.name,
      topic_key: topic.key,
      topic_title: topic.title,
      topic_subtitle: topic.subtitle,
      topic_brief: topic.brief
    });
  });

  state.miniProjectAssignments = nextAssignments;
  saveLocal();

  if (!remoteEnabled()) return;

  const actions = [];
  if (rows.length) {
    actions.push(supabaseClient
      .from("mini_project_assignments")
      .upsert(rows, { onConflict: "group_id" }));
  }
  if (deleteGroupIds.length) {
    actions.push(supabaseClient
      .from("mini_project_assignments")
      .delete()
      .in("group_id", deleteGroupIds));
  }

  const results = await Promise.all(actions);
  const error = results.find(result => result.error)?.error;
  if (error) throw error;
}

async function saveMadaAssignmentsAsAdmin(formData) {
  if (state.session?.role !== "admin") throw new Error("Only admin can assign Spoon Madagascar topics.");

  const rows = [];
  const deleteGroupIds = [];
  const nextAssignments = {};

  madaGroups().forEach(group => {
    const topicKey = formData[`madaTopic::${group.id}`] || "";
    const topic = madaTopicByKey(topicKey);

    if (!topic) {
      deleteGroupIds.push(group.id);
      return;
    }

    const assignment = {
      groupId: group.id,
      groupName: group.name,
      topicKey,
      updatedAt: new Date().toISOString()
    };
    nextAssignments[String(group.id)] = assignment;
    rows.push({
      group_id: group.id,
      group_name: group.name,
      topic_key: topic.key,
      topic_title: topic.title,
      topic_subtitle: topic.subtitle,
      topic_brief: topic.brief
    });
  });

  state.madaAssignments = nextAssignments;
  saveLocal();

  if (!remoteEnabled()) return;

  const actions = [];
  if (rows.length) {
    actions.push(supabaseClient
      .from("spoon_madagascar_assignments")
      .upsert(rows, { onConflict: "group_id" }));
  }
  if (deleteGroupIds.length) {
    actions.push(supabaseClient
      .from("spoon_madagascar_assignments")
      .delete()
      .in("group_id", deleteGroupIds));
  }

  const madaResults = await Promise.all(actions);
  const madaError = madaResults.find(result => result.error)?.error;
  if (madaError) throw madaError;
}

async function persistMiniReviewAsAdmin(review) {
  if (state.session?.role !== "admin") throw new Error("Only admin can edit jury feedback.");

  const group = groupById(review.groupId);
  const cleanReview = {
    groupId: Number(review.groupId),
    groupName: review.groupName || group?.name || `Group ${review.groupId}`,
    juryName: review.juryName,
    scores: Object.fromEntries(miniProjectCriteria.map(criterion => [criterion.key, miniCriterionScore(review.scores, criterion) || 0])),
    groupNote: review.groupNote || "",
    individualNotes: Object.fromEntries(Object.entries(review.individualNotes || {}).filter(([, value]) => String(value || "").trim())),
    updatedAt: new Date().toISOString()
  };

  state.miniProjectReviews[miniReviewKey(cleanReview.groupId, cleanReview.juryName)] = cleanReview;
  delete state.reports[`group|${cleanReview.groupId}`];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mini_project_reviews")
    .upsert({
      group_id: cleanReview.groupId,
      group_name: cleanReview.groupName,
      jury_name: cleanReview.juryName,
      scores: cleanReview.scores,
      total_score: miniProjectScore(cleanReview),
      group_note: cleanReview.groupNote,
      individual_notes: cleanReview.individualNotes
    }, { onConflict: "group_id,jury_name" });

  if (error) throw error;
}

async function deleteMiniReviewAsAdmin(groupId, juryName) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete jury feedback.");

  delete state.miniProjectReviews[miniReviewKey(groupId, juryName)];
  delete state.reports[`group|${groupId}`];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mini_project_reviews")
    .delete()
    .eq("group_id", groupId)
    .eq("jury_name", juryName);

  if (error) throw error;
}

async function persistAdminIndividualFeedbackAsAdmin(eventKey, data) {
  if (state.session?.role !== "admin") throw new Error("Only admin can add individual feedback.");
  const isMada = eventKey === "madagascar";
  const groups = isMada ? madaGroups() : state.data.groups;
  const adminName = state.session?.email || state.session?.name || "Admin";
  const now = new Date().toISOString();
  const rows = [];
  const deletions = [];
  clearStakeholderAISummaries(eventKey);

  groups.forEach(group => {
    (group.participants || []).forEach(person => {
      const feedback = String(data[`adminFeedback::${person}`] || "").trim();
      const key = adminFeedbackKey(eventKey, person);
      delete state.reports[`${isMada ? "mada-person" : "person"}|${person}`];

      if (feedback) {
        const record = {
          eventKey,
          groupId: Number(group.id),
          groupName: group.name,
          participantName: person,
          feedback,
          adminName,
          updatedAt: now
        };
        state.adminIndividualFeedback[key] = record;
        rows.push({
          event_key: eventKey,
          group_id: Number(group.id),
          group_name: group.name,
          participant_name: person,
          feedback,
          admin_name: adminName
        });
      } else if (state.adminIndividualFeedback[key]) {
        delete state.adminIndividualFeedback[key];
        deletions.push({ eventKey, person });
      }
    });
  });

  saveLocal();
  if (!remoteEnabled()) return;

  const jobs = [];
  if (rows.length) {
    jobs.push(supabaseClient
      .from("admin_individual_feedback")
      .upsert(rows, { onConflict: "event_key,participant_name" }));
  }
  deletions.forEach(item => {
    jobs.push(supabaseClient
      .from("admin_individual_feedback")
      .delete()
      .eq("event_key", item.eventKey)
      .eq("participant_name", item.person));
  });

  const results = await Promise.all(jobs);
  const error = results.find(result => result.error)?.error;
  if (error) throw error;
}

async function persistMadaReviewAsAdmin(review) {
  if (state.session?.role !== "admin") throw new Error("Only admin can edit Spoon Madagascar jury feedback.");

  const group = madaGroupById(review.groupId);
  const cleanReview = {
    groupId: Number(review.groupId),
    groupName: review.groupName || group?.name || `Group ${review.groupId}`,
    juryName: review.juryName,
    scores: Object.fromEntries(madaCriteria.map(criterion => [criterion.key, normalizeMark(review.scores?.[criterion.key], criterion.max) || 0])),
    groupNote: review.groupNote || "",
    individualNotes: Object.fromEntries((group?.participants || []).map(person => [person, review.individualNotes?.[person]?.trim() || ""]).filter(([, value]) => value)),
    updatedAt: new Date().toISOString()
  };

  state.madaReviews[madaReviewKey(cleanReview.groupId, cleanReview.juryName)] = cleanReview;
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("spoon_madagascar_reviews")
    .upsert({
      group_id: cleanReview.groupId,
      group_name: cleanReview.groupName,
      jury_name: cleanReview.juryName,
      scores: cleanReview.scores,
      total_score: madaProjectScore(cleanReview),
      group_note: cleanReview.groupNote,
      individual_notes: cleanReview.individualNotes
    }, { onConflict: "group_id,jury_name" });

  if (error) throw error;
}

async function deleteMadaReviewAsAdmin(groupId, juryName) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete Spoon Madagascar jury feedback.");

  delete state.madaReviews[madaReviewKey(groupId, juryName)];
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("spoon_madagascar_reviews")
    .delete()
    .eq("group_id", groupId)
    .eq("jury_name", juryName);

  if (error) throw error;
}

function refreshAdminMiniProjectView() {
  if (location.hash === "#admin-table") adminTablePage();
  else adminDashboard(lastAdminMentor);
}

function shell(content) {
  const { name, role } = state.session;
  const roleLabel = role === "jury" ? "Mini-project jury" : role === "jury-mada" ? "Spoon Madagascar Jury" : "Spoon mentor form";
  const accountControls = role === "admin"
    ? `<span>${esc(name)}</span><span class="role">Admin</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="logout">Log out</button>`
    : role === "jury-mada"
      // Spoon Madagascar jury never needs (or should be tempted to click into) the admin sign-in flow.
      ? `<span class="role">${roleLabel}</span><span class="role sync-pill">${esc(syncLabel())}</span>`
      : `<span class="role">${roleLabel}</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="admin-login">Admin</button>`;
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><img class="spoon-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"><span class="product-name">Hackathon Review Hub</span></div><div class="userbox">${accountControls}</div></header>${content}</div>`;
}

function loginView(message = "") {
  const returnLabel = location.hash === "#mini-project" ? "← Return to jury page" : "← Return";
  app.innerHTML = `<main class="login"><section class="login-art"><div class="brand"><img class="spoon-logo login-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"></div><div><p class="eyebrow">Protected area</p><h1>Admin.<br><span style="color:#12aaa3">Reports.</span><br><span class="orange-text">Insights.</span></h1><p class="subtle login-copy">The mentor and jury forms are separated. Consolidated feedback and participant reports remain in the protected administrator area.</p></div><button class="secondary public-return" data-action="return-current">${returnLabel}</button></section><section class="login-panel"><form class="login-card" id="login-form"><p class="eyebrow">Administrator access</p><h2>Admin sign in</h2><p class="subtle">Sign in with an approved admin account.</p>${message ? `<div class="notice">${esc(message)}</div>` : ""}<label>Email<input name="email" type="email" placeholder="tega@spoon.hackathon" required></label><label>Password<input name="password" type="password" placeholder="••••••••" required></label><button class="primary" type="submit">Sign in</button>${cfg.demoMode ? `<div class="demo-note"><strong>Preview mode</strong><br>Use any email with password <code>admin</code>.</div>` : `<div class="demo-note"><strong>Protected admin area</strong><br>Only approved administrator accounts can open admin mode.</div>`}</form></section></main>`;
}

function mentorAccessView(message = "") {
  app.innerHTML = `<main class="login mentor-code-login"><section class="login-art"><div class="brand"><img class="spoon-logo login-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"></div><div><p class="eyebrow">Mentor access</p><h1>Secure<br><span style="color:#12aaa3">mentor</span><br><span class="orange-text">workspace.</span></h1><p class="subtle login-copy">Enter the code shared by the admin to open the mentor correction page.</p></div><div class="public-return"><button class="secondary" data-action="public-form">← Mentor list</button><button class="secondary" data-action="admin-login">Admin sign in</button></div></section><section class="login-panel"><form class="login-card" id="mentor-code-form"><p class="eyebrow">Mentor code</p><h2>Unlock ${esc(state.activeMentor)}'s page</h2><p class="subtle">This replaces the old open-by-link access.</p>${message ? `<div class="notice">${esc(message)}</div>` : ""}<label>Access code<input name="accessCode" type="text" inputmode="text" autocomplete="one-time-code" placeholder="SP-MENTOR-XXXX-XXXX" required></label><button class="primary" type="submit">Continue</button><div class="demo-note"><strong>Need a code?</strong><br>Ask an admin to open the dashboard and copy your mentor code.</div></form></section></main>`;
}

function mentorTabs() {
  return `<div class="mentor-tabs" aria-label="Mentor workspaces">${state.mentors.map(name => `<button type="button" class="mentor-tab ${state.activeMentor === name ? "active" : ""}" data-mentor="${name}"><span>${name.slice(0, 1)}</span>${name}</button>`).join("")}</div>`;
}

function juryTabs() {
  return `<div class="mentor-tabs" aria-label="Jury workspaces">${state.juries.map(name => `<button type="button" class="mentor-tab ${state.activeJury === name ? "active" : ""}" data-jury="${name}"><span>${name.slice(0, 1)}</span>${name}</button>`).join("")}</div>`;
}

function madaJuryTabs() {
  return `<div class="mentor-tabs" aria-label="Spoon Madagascar jury workspaces">${state.madaJuries.map(name => `<button type="button" class="mentor-tab ${state.activeMadaJury === name ? "active" : ""}" data-mada-jury="${esc(name)}"><span>${esc(madaFirstName(name).slice(0, 1))}</span>${esc(madaFirstName(name))}</button>`).join("")}</div>`;
}

function criteriaSelectView(criterion, value = "") {
  const normalized = normalizeMark(value, criterion.max);
  const selected = normalized === null ? "" : Math.round(normalized * 2) / 2;
  const values = Array.from({ length: Math.round(Number(criterion.max) * 2) + 1 }, (_, index) => index / 2);
  return `<div class="criterion-card ${selected !== "" ? "scored" : ""}" data-criteria-max="${criterion.max}"><div class="criterion-copy"><div class="criterion-title-row"><strong>${esc(criterion.label)}</strong><span>${selected !== "" ? `${selected}/${criterion.max}` : `Not scored /${criterion.max}`}</span></div><p>${esc(criterion.prompt)}</p></div><label class="criteria-select-panel"><small>Score / ${criterion.max}</small><select name="${esc(criterion.key)}" data-criteria-input><option value="">—</option>${values.map(item => `<option value="${item}" ${selected === item ? "selected" : ""}>${item}</option>`).join("")}</select></label><details class="criteria-question-dropdown"><summary>Questions</summary><div><ul class="criteria-help">${(criterion.questions || []).map(question => `<li>${esc(question)}</li>`).join("")}</ul></div></details></div>`;
}

function miniTopicBriefView(topic) {
  if (!topic) return `<div class="mini-topic-brief empty">No project title assigned yet. Ask an admin to choose Smart Budget, Health Alert, or Water Wise for this group.</div>`;
  return `<details class="mini-topic-brief"><summary><span>Project brief</span><b>${esc(topicFullTitle(topic))}</b></summary><p>${esc(topic.brief)}</p><p><strong>Bonus AI:</strong> ${esc(topic.bonus)}</p></details>`;
}

function madaTopicBriefView(topic) {
  if (!topic) return `<div class="mini-topic-brief empty">No project title assigned yet. Ask an admin to choose Cyclone Ready Mada, Food Wise Madagascar, or Water &amp; Power Watch Mada for this group.</div>`;
  return `<details class="mini-topic-brief"><summary><span>Project brief</span><b>${esc(madaTopicFullTitle(topic))}</b></summary><p>${esc(topic.brief)}</p><p><strong>Bonus AI:</strong> ${esc(topic.bonus)}</p></details>`;
}

function answerGuideView(question) {
  const guide = answerGuides[question.id];
  if (!guide) {
    return `<div class="answer-panel hidden" data-answer-panel><p>No answer/test guide has been added for this question yet.</p></div>`;
  }

  const list = (title, items = []) => items.length
    ? `<div><strong>${esc(title)}</strong><ul>${items.map(item => `<li>${esc(item)}</li>`).join("")}</ul></div>`
    : "";
  const snippets = (guide.codeSnippets || []).length
    ? `<div class="answer-code-stack"><strong>Code snippet / reference</strong>${guide.codeSnippets.map(snippet => `<figure class="answer-code"><figcaption>${esc(snippet.title || "Reference")}</figcaption><pre><code>${esc(snippet.code)}</code></pre></figure>`).join("")}</div>`
    : "";

  return `<div class="answer-panel hidden" data-answer-panel>
    <div><strong>Question reminder</strong><p>${esc(guide.question || question.prompt)}</p></div>
    <div><strong>Expected answer</strong><p>${esc(guide.answer)}</p></div>
    ${guide.how ? `<div><strong>Detailed approach</strong><p>${esc(guide.how)}</p></div>` : ""}
    ${snippets}
    ${list("Marking checklist", guide.checklist)}
    ${list("What to verify", guide.details)}
    ${list("Test scenarios", guide.tests)}
  </div>`;
}

function markPickerView(question, value) {
  const max = Number(question.maxMarks);
  if (!Number.isFinite(max) || max <= 0) {
    return `<div class="mark-picker disabled">
      <input type="hidden" name="marksAwarded" value="0">
      <div class="pending-mark-box">
        <strong>Marks pending</strong>
        <span>Saved as 0 points until this question has an official maximum.</span>
      </div>
      <p>Mentors can still add remarks, but no extra score can be added accidentally.</p>
    </div>`;
  }

  const selected = value === "" || value === null || value === undefined ? "" : Number(value);
  const values = Array.from({ length: Math.round(max * 2) + 1 }, (_, index) => index / 2);
  const wholeMarks = values.filter(item => Number.isInteger(item));
  const optionLabel = item => `${item} / ${max}`;
  const optionValue = item => String(item);

  return `<div class="mark-picker">
    <label>Mark awarded <small class="optional">Choose from 0 to ${esc(max)} only</small>
      <select name="marksAwarded" required data-mark-select>
        <option value="">Select mark…</option>
        ${values.map(item => `<option value="${optionValue(item)}" ${selected === item ? "selected" : ""}>${optionLabel(item)}</option>`).join("")}
      </select>
    </label>
    <div class="mark-chips" aria-label="Quick mark buttons">
      ${wholeMarks.map(item => `<button type="button" class="mark-chip ${selected === item ? "active" : ""}" data-mark-value="${optionValue(item)}">${item}</button>`).join("")}
    </div>
    <p>Use the dropdown for half marks. Quick buttons are whole marks only.</p>
  </div>`;
}

function groupState(group) {
  const completed = state.data.questions.filter(q => state.groupCorrections[correctionKey(group.id, q.id)]?.status).length;
  const started = state.data.questions.filter(q => state.groupCorrections[correctionKey(group.id, q.id)]?.workState === "in_progress").length;
  const firstMissing = state.data.questions.find(q => !state.groupCorrections[correctionKey(group.id, q.id)]?.status)?.id || 1;
  if (completed === 0) return { label: "Not started", tone: "new", detail: "Start", completed, resume: 1 };
  if (completed === state.data.questions.length) return { label: "Completed", tone: "complete", detail: "Review", completed, resume: 1 };
  return { label: "In progress", tone: "started", detail: `${started || completed} active · next Q${firstMissing}`, completed, resume: firstMissing };
}

function mentorDashboard() {
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Review steps"><span class="active">1 <b>Mentor</b></span><i></i><span>2 <b>Choose group</b></span><i></i><span>3 <b>Submit review</b></span></nav><section class="mentor-choice"><p class="eyebrow orange-eyebrow">Start here</p><h1>Choose your mentor name</h1><p>Tap your name below. We’ll remember it on this device.</p>${mentorTabs()}</section><section class="group-heading"><div><span class="selected-mentor"><i>${state.activeMentor[0]}</i> Reviewing as <strong>${esc(state.activeMentor)}</strong></span><h2>Choose a group</h2></div><div class="status-key"><span><i class="new"></i>Not started</span><span><i class="started"></i>In progress</span><span><i class="complete"></i>Completed</span></div></section><section class="group-list">${state.data.groups.map(group => { const gs = groupState(group); return `<button class="group-row" data-group-review="${group.id}" data-resume-q="${gs.resume}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small>${group.participants.length} participants · ${gs.completed}/${state.data.questions.length} questions</small></span><span class="group-status ${gs.tone}"><i></i>${gs.label}<small>${gs.detail}</small></span><span class="row-arrow">→</span></button>`; }).join("")}</section><p class="help-line">In-progress groups automatically resume at the first unanswered question. Your review saves to the shared dashboard when connected. <button class="subtle-link" type="button" data-action="mada-jury">Spoon Madagascar jury →</button></p></main>`);
}

async function openMiniProject() {
  const params = new URLSearchParams(location.search);
  const urlAccessCode = params.get("juryAccess") || params.get("juryCode") || "";
  const urlJury = params.get("jury") || "";

  if (urlAccessCode) {
    try {
      const juryName = await unlockJuryFromAccessCode(urlAccessCode, urlJury);
      if (!juryName) {
        showToast("This jury URL is no longer valid. Ask admin for the latest private URL.");
        history.replaceState(null, "", `${location.pathname}#mini-project`);
        return miniProjectLanding();
      }
      history.replaceState(null, "", `${location.pathname}#mini-project`);
      showToast(`Jury page unlocked for ${juryName}`);
      return miniProjectDashboard();
    } catch (error) {
      showToast(friendlyError(error, "Could not verify this jury URL. Try again."));
      return miniProjectLanding();
    }
  }

  location.hash = "mini-project";
  state.session = { name: state.activeJury, role: "jury" };
  state.miniProjectView = "landing";
  state.activeMiniGroup = null;
  save();
  miniProjectLanding();
}

function openMadaJury() {
  location.hash = "mpm";
  state.session = { name: state.activeMadaJury, role: "jury-mada" };
  state.madaJuryView = "landing";
  state.activeMadaGroup = null;
  save();
  madaJuryLanding();
}

function miniProjectLanding() {
  state.miniProjectView = "landing";
  state.activeMiniGroup = null;
  saveLocal();
  shell(`<main class="page simple-page mini-jury-page"><section class="mini-jury-hero centered"><p class="eyebrow orange-eyebrow">Mini-project jury</p><h1>Choose your jury name</h1><p>Score each group out of ${miniProjectTotal} marks. Pick your name, then choose the group you want to review.</p><span class="mini-jury-score-chip">${miniProjectTotal} marks total</span></section><section class="mentor-choice mini-jury-choice">${juryTabs()}</section></main>`);
}

function madaJuryLanding() {
  state.madaJuryView = "landing";
  state.activeMadaGroup = null;
  saveLocal();
  shell(`<main class="page simple-page mini-jury-page"><section class="mini-jury-hero centered"><p class="eyebrow orange-eyebrow">Spoon Madagascar jury</p><h1>Choose your jury name</h1><p>Score each group out of ${madaProjectTotal} marks — the same criteria and scale as the Mauritius mini-project jury. Pick your name — we'll show only the groups from your home office.</p><span class="mini-jury-score-chip">${madaProjectTotal} marks total</span></section><section class="mentor-choice mini-jury-choice">${madaJuryTabs()}</section></main>`);
}

function miniProjectDashboard() {
  state.miniProjectView = "groups";
  state.activeMiniGroup = null;
  saveLocal();
  const reviewedCount = state.data.groups.filter(group => state.miniProjectReviews[miniReviewKey(group.id, state.activeJury)]).length;
  shell(`<main class="page simple-page mini-jury-page"><section class="mini-jury-hero split"><div><p class="eyebrow orange-eyebrow">Mini-project jury</p><h1>Choose a group</h1><p>Open a group, enter the criteria scores, and add notes if needed. Your work autosaves while you review.</p></div><aside class="mini-jury-profile"><span>${esc(state.activeJury[0] || "J")}</span><strong>${esc(state.activeJury)}</strong><small>${reviewedCount}/${state.data.groups.length} groups scored</small><button class="secondary" data-action="mini-project">Change jury</button></aside></section><section class="group-list mini-group-list">${state.data.groups.map(group => { const review = state.miniProjectReviews[miniReviewKey(group.id, state.activeJury)]; const score = miniProjectScore(review); const topic = topicForGroup(group); return `<button class="group-row mini-group-row" data-mini-group="${group.id}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small class="mini-topic-line">${topic ? `<b>${esc(topic.title)}</b> — ${esc(topic.subtitle)}` : "No title assigned yet"}</small><small>${group.participants.length} participants</small></span><span class="group-status ${review ? "complete" : "new"}"><i></i>${review ? `${score}/${miniProjectTotal}` : "Start"}<small>${review ? "Edit review" : "Not scored yet"}</small></span><span class="row-arrow">→</span></button>`; }).join("")}</section><p class="help-line">Admin combines the average mini-project score with the hackathon question marks.</p></main>`);
}

function madaJuryDashboard() {
  state.madaJuryView = "groups";
  state.activeMadaGroup = null;
  saveLocal();
  const office = madaJuryOffice(state.activeMadaJury);
  const groups = office ? madaGroupsForOffice(office) : [];
  const reviewedCount = groups.filter(group => state.madaReviews[madaReviewKey(group.id, state.activeMadaJury)]).length;
  shell(`<main class="page simple-page mini-jury-page"><section class="mini-jury-hero split"><div><p class="eyebrow orange-eyebrow">Spoon Madagascar jury</p><h1>Choose a group</h1><p>Open a group, enter the criteria scores, and add a group note. Groups are limited to your home office.</p></div><aside class="mini-jury-profile"><span>${esc(madaFirstName(state.activeMadaJury || "J").slice(0, 1))}</span><strong>${esc(madaFirstName(state.activeMadaJury || "Jury"))}</strong><small class="mada-office-badge">${esc(office || "No office set")}</small><small>${reviewedCount}/${groups.length} groups scored</small><button class="secondary" data-action="mada-jury">Change jury</button></aside></section><section class="group-list mini-group-list">${groups.length ? groups.map(group => { const review = state.madaReviews[madaReviewKey(group.id, state.activeMadaJury)]; const score = madaProjectScore(review); const topic = madaTopicForGroup(group); return `<button class="group-row mini-group-row" data-mada-group="${group.id}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small class="mini-topic-line">${topic ? `<b>${esc(topic.title)}</b> — ${esc(topic.subtitle)}` : "No title assigned yet"}</small><small>${group.participants.length} participants</small></span><span class="group-status ${review ? "complete" : "new"}"><i></i>${review ? `${score}/${madaProjectTotal}` : "Start"}<small>${review ? "Edit review" : "Not scored yet"}</small></span><span class="row-arrow">→</span></button>`; }).join("") : `<p class="help-line">No groups found for your office yet. Ask an admin to check your jury record.</p>`}</section><p class="help-line">Scored on the same ${madaProjectTotal}-point scale as the Mauritius mini-project.</p></main>`);
}

function miniProjectReviewView(groupId) {
  const group = groupById(groupId);
  if (!group) return miniProjectDashboard();
  state.miniProjectView = "review";
  state.activeMiniGroup = group.id;
  saveLocal();
  const review = state.miniProjectReviews[miniReviewKey(group.id, state.activeJury)] || { scores: {}, individualNotes: {} };
  const topic = topicForGroup(group);
  shell(`<main class="page guided-review mini-review-page"><div class="mini-review-topbar"><div class="mini-review-left"><button class="back-link" data-action="mini-dashboard">← Groups</button></div><div class="mini-review-title"><span>${esc(group.name)}</span><strong>${esc(topic?.title || "No title assigned")}</strong><small>${esc(state.activeJury)}</small>${topic ? `<em>${esc(topic.subtitle)}</em>` : ""}</div><div class="mini-review-meta"><div class="question-progress"><span>${miniProjectScore(review)}/${miniProjectTotal}</span><div><i style="width:${miniProjectScore(review) / miniProjectTotal * 100}%"></i></div></div><span class="autosave-note">${review.updatedAt ? "Saved" : "Not scored"}</span></div></div><section class="workflow mini-workflow"><form id="mini-project-form" data-group="${group.id}">${miniTopicBriefView(topic)}<div class="mini-console"><article class="card question-card mini-score-card"><div class="mini-card-strip"><strong>Criteria scores</strong><span>Half marks allowed · choose — to clear</span></div><div class="criteria-grid">${miniProjectCriteria.map(criterion => criteriaSelectView(criterion, miniCriterionScore(review.scores, criterion))).join("")}</div></article><aside class="card mini-notes-card"><div class="mini-card-strip note-strip"><strong>Notes</strong><span>${group.participants.length} participants</span></div><div class="jury-note-panel important"><div><strong>Group note</strong><button class="subtle-link note-clear" type="button" data-clear-note="group">Clear</button></div><textarea name="groupNote" placeholder="Group strengths, weaknesses, reason behind score…">${esc(review.groupNote)}</textarea></div><div class="jury-note-panel"><div><strong>Individual notes</strong><button class="subtle-link note-clear" type="button" data-clear-note="individual">Clear</button></div><div class="mini-individual-notes">${group.participants.map(person => `<label>${participantNameBlock(person)}<textarea class="compact" name="miniNote::${esc(person)}" placeholder="Optional note…">${esc(review.individualNotes?.[person] || "")}</textarea></label>`).join("")}</div></div></aside></div><div class="sticky-actions"><button class="secondary" type="submit" name="destination" value="dashboard">Save & choose another group</button><button class="primary" type="submit" name="destination" value="stay">Save review ✓</button></div></form></section></main>`);
}

function madaJuryReviewView(groupId) {
  const group = madaGroupById(groupId);
  if (!group) return madaJuryDashboard();
  state.madaJuryView = "review";
  state.activeMadaGroup = group.id;
  saveLocal();
  const review = state.madaReviews[madaReviewKey(group.id, state.activeMadaJury)] || { scores: {} };
  const topic = madaTopicForGroup(group);
  const score = madaProjectScore(review);
  shell(`<main class="page guided-review mini-review-page"><div class="mini-review-topbar"><div class="mini-review-left"><button class="back-link" data-action="mada-jury-dashboard">← Groups</button></div><div class="mini-review-title"><span>${esc(group.name)}</span><strong>${esc(topic?.title || "No title assigned")}</strong><small>${esc(madaFirstName(state.activeMadaJury || "Jury"))}</small>${topic ? `<em>${esc(topic.subtitle)}</em>` : ""}</div><div class="mini-review-meta"><div class="question-progress"><span>${score}/${madaProjectTotal} selected</span><div><i style="width:${madaProjectTotal ? (score / madaProjectTotal * 100) : 0}%"></i></div></div><span class="autosave-note">${review.updatedAt ? "Saved" : "Not scored"}</span></div></div><section class="workflow mini-workflow"><form id="mada-review-form" data-mada-group="${group.id}">${madaTopicBriefView(topic)}<div class="mini-console"><article class="card question-card mini-score-card"><div class="mini-card-strip"><strong>Criteria scores</strong><span>Half marks allowed · same criteria as the Mauritius mini-project</span></div><div class="criteria-grid">${madaCriteria.map(criterion => criteriaSelectView(criterion, madaCriterionScore(review.scores, criterion))).join("")}</div></article><aside class="card mini-notes-card"><div class="mini-card-strip note-strip"><strong>Notes</strong><span>${group.participants.length} participants</span></div><div class="jury-note-panel important"><div><strong>Group note</strong></div><textarea name="groupNote" placeholder="Group strengths, weaknesses, reason behind score…">${esc(review.groupNote || "")}</textarea></div><div class="jury-note-panel"><div><strong>Individual notes</strong></div><div class="mini-individual-notes">${group.participants.map(person => `<label>${participantNameBlock(person)}<textarea class="compact" name="madaNote::${esc(person)}" placeholder="Optional note…">${esc(review.individualNotes?.[person] || "")}</textarea></label>`).join("")}</div></div></aside></div><div class="sticky-actions"><button class="secondary" type="submit" name="destination" value="dashboard">Save & choose another group</button><button class="primary" type="submit" name="destination" value="stay">Save review ✓</button></div></form></section></main>`);
}

function correctionView(groupId, qid = 1) {
  const group = groupById(groupId);
  const q = state.data.questions.find(item => item.id === Number(qid));
  const correction = state.groupCorrections[correctionKey(group.id, q.id)] || {};
  const markValue = normalizeMark(correction.marksAwarded, q.maxMarks) ?? "";
  const ownerCopy = correction.status
    ? `Completed by ${correction.mentorName || "a mentor"}`
    : correction.workState === "in_progress"
      ? `In progress by ${correction.mentorName || "a mentor"}`
      : "Not started yet";
  shell(`<main class="page guided-review"><nav class="journey" aria-label="Review steps"><span class="done">✓ <b>Mentor</b></span><i></i><span class="done">✓ <b>${esc(group.name)}</b></span><i></i><span class="active">3 <b>Question ${q.id}</b></span></nav><div class="review-toolbar"><button class="back-link" data-action="dashboard">← Change group</button><div class="question-progress"><span>Question ${q.id} of ${state.data.questions.length}</span><div><i style="width:${q.id / state.data.questions.length * 100}%"></i></div></div><span class="autosave-note">${esc(ownerCopy)}</span></div><details class="question-jump"><summary>Jump to another question</summary><div class="question-nav">${state.data.questions.map(item => { const itemCorrection = state.groupCorrections[correctionKey(group.id, item.id)] || {}; return `<button class="qdot ${itemCorrection.status ? "done" : itemCorrection.workState === "in_progress" ? "started" : ""} ${item.id === q.id ? "active" : ""}" title="${esc(itemCorrection.status ? `${itemCorrection.marksAwarded ?? 0}/${itemCorrection.maxMarks ?? "?"} marks by ${itemCorrection.mentorName || "mentor"}` : itemCorrection.workState === "in_progress" ? `In progress by ${itemCorrection.mentorName || "mentor"}` : "Not started")}" data-group-q="${group.id}" data-q="${item.id}">${item.id}</button>`; }).join("")}</div></details><section class="workflow"><form id="group-review-form" data-group="${group.id}" data-q="${q.id}"><article class="card question-card"><p class="eyebrow">${esc(group.name)} · Shared marking</p><h1>${esc(q.title)}</h1><p class="subtle">${esc(q.prompt)}${q.maxMarks ? ` · Worth ${q.maxMarks} marks` : " · Marks pending"}</p><button class="answer-toggle" type="button" data-action="toggle-answer">💡 Answer / tests</button>${answerGuideView(q)}<div class="section-label"><span>1</span><div><strong>Give the group mark</strong><small>One shared mark per question. You can edit what another mentor started.</small></div></div>${markPickerView(q, markValue)}<label>Correction or model answer <small class="optional">Optional</small><textarea name="correction" placeholder="What is the correct answer or approach?">${esc(correction.correction)}</textarea></label><label>Group observation <small class="optional">Optional</small><textarea name="groupRemark" placeholder="What did the group do well, or what should they improve?">${esc(correction.groupRemark)}</textarea></label></article><article class="card individual-card"><div class="section-label"><span>2</span><div><strong>Any personal remarks?</strong><small>Optional — shared per participant/question, visible in admin only</small></div></div><div class="remark-list">${group.participants.map(person => { const entry = state.individualRemarks[remarkKey(group.id, person, q.id)] || {}; const remark = typeof entry === "string" ? entry : entry.remark || ""; return `<label>${participantNameBlock(person)}<textarea class="compact" name="remark::${esc(person)}" placeholder="Short, constructive note for admin…">${esc(remark)}</textarea></label>`; }).join("")}</div></article><div class="sticky-actions"><button class="secondary" type="submit" name="destination" value="dashboard">Save & leave</button><button class="primary" type="submit" name="destination" value="next">${q.id === state.data.questions.length ? "Finish group ✓" : "Save & continue →"}</button></div></form></section></main>`);
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function openPhotoViewer(url, name) {
  document.querySelector(".photo-viewer")?.remove();
  const viewer = document.createElement("div");
  viewer.className = "photo-viewer";
  viewer.innerHTML = `<div class="photo-viewer-card" role="dialog" aria-modal="true" aria-label="${esc(name)} photo"><button class="photo-viewer-close" type="button" data-action="close-photo">×</button><img src="${esc(url)}" alt="${esc(name)}" draggable="false" oncontextmenu="return false"><strong>${esc(name)}</strong><small>Tap outside or press Esc to close</small></div>`;
  document.body.appendChild(viewer);
}

function closePhotoViewer() {
  document.querySelector(".photo-viewer")?.remove();
}

function buildGroupSummary(group) {
  const entries = Object.entries(state.groupCorrections).filter(([key]) => key.split("|")[0] === String(group.id)).map(([key, value]) => ({ question: key.split("|")[1], ...value }));
  const miniReviews = miniReviewsForGroup(group);
  const topic = topicForGroup(group);
  const topicCopy = topic ? `Project: ${topicFullTitle(topic)}. ` : "";
  if (!entries.length && !miniReviews.length) return `${topicCopy}No mentor corrections or mini-project reviews have been submitted yet.`;
  if (!entries.length) return `${topicCopy}No question corrections yet. Mini project average: ${miniProjectAverage(group)}/${miniProjectTotal} from ${miniReviews.length} jury member(s).`;
  const score = groupScore(group);
  const max = knownTotalMarks();
  const observations = entries.map(item => item.groupRemark).filter(Boolean);
  const miniCopy = miniReviews.length ? ` Mini project average: ${miniProjectAverage(group)}/${miniProjectTotal} from ${miniReviews.length} jury member(s).` : " Mini project not scored yet.";
  return `${topicCopy}${entries.length} shared question marks assembled. Current score: ${score}/${max} hackathon marks.${miniCopy} ${observations.length ? `Key observations: ${observations.slice(0, 3).join(" · ")}` : "Add group observations to enrich the admin summary."}`;
}

function buildQuestionSummary(group, question) {
  const correction = state.groupCorrections[correctionKey(group.id, question.id)];
  if (!correction?.status) {
    return `Q${question.id}: not completed yet${correction?.mentorName ? ` — in progress by ${correction.mentorName}` : ""}.`;
  }

  const pieces = [`Q${question.id}: ${correction.marksAwarded ?? 0}/${correction.maxMarks ?? question.maxMarks ?? "?"} marks`];
  if (correction.correction) pieces.push(`Correction: ${correction.correction}`);
  if (correction.groupRemark) pieces.push(`Group note: ${correction.groupRemark}`);
  if (correction.mentorName) pieces.push(`Last edited by ${correction.mentorName}`);
  return pieces.join(" · ");
}

function scoreboardView() {
  const rows = combinedScoreboard();
  const leader = rows[0];
  return `<article class="card report-card scoreboard-card"><div class="report-heading"><div><p class="eyebrow">Combined scoreboard</p><h2>${leader ? `${esc(leader.group.name)} is leading overall` : "No scores yet"}</h2></div><span class="ai-badge">${knownTotalMarks()} + ${miniProjectTotal} marks</span></div><div class="scoreboard-list combined-scoreboard">${rows.map((row, index) => `<div class="${index === 0 && row.total > 0 ? "leader" : ""}"><span>${index + 1}</span><strong>${esc(row.group.name)}</strong><small>Hackathon ${row.hackathon}/${row.hackathonMax}</small><small>Mini ${row.mini}/${row.miniMax} · ${row.juryCount} jury</small><meter min="0" max="${row.max || 1}" value="${row.total}"></meter><b>${row.total}/${row.max}</b></div>`).join("")}</div></article>`;
}

function adminFullInfoTableView() {
  const scoreRows = combinedScoreboard();
  const rows = state.data.groups
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(group => scoreRows.find(row => Number(row.group.id) === Number(group.id)) || {
      group,
      hackathon: groupScore(group),
      hackathonMax: knownTotalMarks(),
      mini: miniProjectAverage(group),
      miniMax: miniProjectTotal,
      total: groupScore(group) + miniProjectAverage(group),
      max: knownTotalMarks() + miniProjectTotal,
      juryCount: miniReviewsForGroup(group).length
    });
  const questionSummary = group => state.data.questions.map(question => {
    const correction = state.groupCorrections[correctionKey(group.id, question.id)];
    return `<span class="${correction?.status ? "done" : correction?.workState === "in_progress" ? "started" : ""}">Q${question.id}: ${correction?.status ? `${correction.marksAwarded ?? 0}/${correction.maxMarks ?? question.maxMarks ?? "?"}` : correction?.workState === "in_progress" ? "in progress" : "—"}</span>`;
  }).join("");
  const individualSummary = group => group.participants.map(person => `<div class="admin-person-row">${participantNameBlock(person)}<p>${esc(state.reports[`person|${person}`] || buildPersonFeedback(person))}</p></div>`).join("");

  return `<article class="card report-card admin-full-table-card"><div class="report-heading"><div><p class="eyebrow">Everything assembled</p><h2>Group + individual review table</h2></div><span class="ai-badge">Admin only</span></div><div class="admin-table-wrap"><table class="admin-info-table"><thead><tr><th>Group</th><th>Score</th><th>Group notes</th><th>Questions</th><th>Individual feedback</th></tr></thead><tbody>${rows.map(row => { const topic = topicForGroup(row.group); return `<tr><td><strong>${esc(row.group.name)}</strong><small>${topic ? esc(topicFullTitle(topic)) : "No mini-project title assigned"}</small><small>${row.group.participants.length} participants</small></td><td><b>${row.total}/${row.max}</b><small>Hackathon ${row.hackathon}/${row.hackathonMax}</small><small>Mini ${row.mini}/${row.miniMax} · ${row.juryCount} jury</small></td><td><p>${esc(state.reports[`group|${row.group.id}`] || buildGroupSummary(row.group))}</p>${miniProjectBreakdownView(row.group, { compact: true })}</td><td><div class="admin-question-chips">${questionSummary(row.group)}</div></td><td><div class="admin-person-list">${individualSummary(row.group)}</div></td></tr>`; }).join("")}</tbody></table></div></article>`;
}

function miniProjectBreakdownView(group, options = {}) {
  const reviews = miniReviewsForGroup(group).sort((a, b) => String(a.juryName).localeCompare(String(b.juryName)));
  if (!reviews.length) return `<p class="summary-text mini-breakdown-empty">Mini project has not been scored yet.</p>`;

  const compactClass = options.compact ? " compact" : "";
  return `<div class="mini-jury-breakdown${compactClass}"><div class="mini-jury-breakdown-head"><strong>Mini-project jury detail</strong><span>${miniProjectAverage(group)}/${miniProjectTotal} average · ${reviews.length} jury</span></div>${reviews.map(review => {
    const individualNotes = Object.entries(review.individualNotes || {}).filter(([, note]) => String(note || "").trim());
    return `<div class="mini-jury-row"><div class="mini-jury-top"><div><strong>${esc(review.juryName || "Jury")}</strong><small>${miniProjectScore(review)}/${miniProjectTotal} points</small></div>${state.session?.role === "admin" ? `<div class="mini-jury-actions"><button class="secondary" data-action="admin-table" type="button">Edit</button><button class="secondary" type="button" data-clear-mini-scores="${esc(review.groupId)}|${esc(review.juryName)}">Clear points</button><button class="danger-mini" type="button" data-delete-mini-review="${esc(review.groupId)}|${esc(review.juryName)}">Delete</button></div>` : ""}</div><p>${esc(review.groupNote || "No group note from this jury.")}</p>${individualNotes.length ? `<ul>${individualNotes.map(([person, note]) => `<li><b>${esc(person)}:</b> ${esc(note)}</li>`).join("")}</ul>` : `<small>No individual notes from this jury.</small>`}</div>`;
  }).join("")}</div>`;
}

function madaProjectBreakdownView(group) {
  const reviews = madaReviewsForGroup(group).sort((a, b) => String(a.juryName).localeCompare(String(b.juryName)));
  if (!reviews.length) return `<p class="summary-text mini-breakdown-empty">Mini project has not been scored yet.</p>`;

  return `<div class="mini-jury-breakdown"><div class="mini-jury-breakdown-head"><strong>Mini-project jury detail</strong><span>${madaGroupAverage(group)}/${madaProjectTotal} average · ${reviews.length} jury</span></div>${reviews.map(review => {
    const individualNotes = Object.entries(review.individualNotes || {}).filter(([, note]) => String(note || "").trim());
    return `<div class="mini-jury-row"><div class="mini-jury-top"><div><strong>${esc(madaFirstName(review.juryName || "Jury"))}</strong><small>${madaProjectScore(review)}/${madaProjectTotal} points</small></div></div><p>${esc(review.groupNote || "No group note from this jury.")}</p>${individualNotes.length ? `<ul>${individualNotes.map(([person, note]) => `<li><b>${esc(person)}:</b> ${esc(note)}</li>`).join("")}</ul>` : `<small>No individual notes from this jury.</small>`}</div>`;
  }).join("")}</div>`;
}

function completedQuestionFeedback(group) {
  return state.data.questions
    .map(question => ({ question, correction: state.groupCorrections[correctionKey(group.id, question.id)] }))
    .filter(item => item.correction?.status || item.correction?.workState === "completed");
}

function participantStakeholderFeedback(person, group) {
  const questionNotes = participantQuestionNotes(person, group).map(item => `Q${item.qid} by ${item.mentor}: ${item.note}`);
  const miniNotes = participantMiniNotes(person, group).map(item => `${item.jury}: ${item.note}`);
  const adminNotes = participantAdminNotes("mauritius", person).map(item => `Admin: ${item.note}`);
  const notes = [...adminNotes, ...questionNotes, ...miniNotes];
  return notes.length ? notes.join(" · ") : "No individual stakeholder feedback yet.";
}

function participantAdminNotes(eventKey, person) {
  const note = state.adminIndividualFeedback?.[adminFeedbackKey(eventKey, person)];
  return note?.feedback?.trim()
    ? [{ admin: note.adminName || "Admin", note: note.feedback, updatedAt: note.updatedAt }]
    : [];
}

function participantQuestionNotes(person, group) {
  return Object.entries(state.individualRemarks)
    .filter(([key, value]) => {
      const [groupId, name, qid] = key.split("|");
      const correction = state.groupCorrections[correctionKey(group.id, qid)];
      const text = typeof value === "string" ? value : value?.remark;
      return groupId === String(group.id) && name === person && correction?.status && String(text || "").trim();
    })
    .map(([key, value]) => {
      const qid = key.split("|")[2];
      return {
        qid,
        mentor: typeof value === "string" ? "Mentor" : value.mentorName || "Mentor",
        note: typeof value === "string" ? value : value.remark
      };
    })
    .sort((a, b) => Number(a.qid) - Number(b.qid));
}

function participantMiniNotes(person, group) {
  return miniReviewsForGroup(group)
    .filter(review => review.individualNotes?.[person]?.trim())
    .map(review => ({
      jury: review.juryName || "Jury",
      score: `${miniProjectScore(review)}/${miniProjectTotal}`,
      note: review.individualNotes[person]
    }));
}

function participantMadaNotes(person) {
  return Object.values(state.madaReviews)
    .filter(review => review.individualNotes?.[person]?.trim())
    .map(review => ({
      jury: madaFirstName(review.juryName || "Jury"),
      score: `${madaProjectScore(review)}/${madaProjectTotal}`,
      note: review.individualNotes[person]
    }));
}

function stakeholderLevel(value, max) {
  const ratio = Number(max) > 0 ? Number(value) / Number(max) : 0;
  if (ratio >= 0.75) return "strong";
  if (ratio >= 0.5) return "promising";
  if (ratio > 0) return "developing";
  return "not enough scored evidence yet";
}

function usefulFeedbackSummary(person, group) {
  const adminNotes = participantAdminNotes("mauritius", person).map(item => item.note);
  const notes = [...adminNotes, ...participantQuestionNotes(person, group).map(item => item.note), ...participantMiniNotes(person, group).map(item => item.note)].filter(Boolean);
  const evidence = notes.slice(0, 2).join(" ");
  if (!notes.length) return `${person} has no saved individual notes yet. Current available evidence is group-level only: ${group.name} has ${completedQuestionFeedback(group).length}/${state.data.questions.length} completed question review(s) and mini-project average ${miniProjectAverage(group)}/${miniProjectTotal}.`;
  return `${person}: ${evidence}`;
}

function usefulMadaFeedbackSummary(person, group) {
  const adminNotes = participantAdminNotes("madagascar", person).map(item => item.note);
  const notes = [...adminNotes, ...participantMadaNotes(person).map(item => item.note)].filter(Boolean);
  const evidence = notes.slice(0, 2).join(" ");
  if (!notes.length) return `${person} has no saved individual notes yet. Current available evidence is group-level only: ${group.name} mini-project average ${madaGroupAverage(group)}/${madaProjectTotal}.`;
  return `${person}: ${evidence}`;
}

function fallbackStakeholderPersonSummary(person, group, isMada) {
  return isMada ? usefulMadaFeedbackSummary(person, group) : usefulFeedbackSummary(person, group);
}

function stakeholderPersonSummary(eventKey, person, group, isMada) {
  return state.stakeholderPersonSummaries?.[stakeholderPersonSummaryKey(eventKey, person)]
    || fallbackStakeholderPersonSummary(person, group, isMada);
}

function stakeholderWinnerView(eventKey, rows) {
  const winner = rows.find(row => (row.total ?? row.average ?? 0) > 0) || rows[0];
  if (!winner) return "";
  const score = winner.total !== undefined ? `${winner.total}/${winner.max}` : `${winner.average}/${winner.max}`;
  return `<section class="card report-card stakeholder-winner-card"><div><p class="eyebrow">Hackathon winner</p><h2>${esc(winner.group.name)}</h2><p class="subtle">${esc(stakeholderEventLabel(eventKey))} winner based on the current saved scores.</p></div><span>${esc(score)}</span></section>`;
}

function stakeholderMetricStrip(metrics) {
  return `<div class="stakeholder-metric-strip">${metrics.map(metric => `<div><strong>${esc(metric.value)}</strong><span>${esc(metric.label)}</span></div>`).join("")}</div>`;
}

function stakeholderQuestionPanel(group) {
  const completed = completedQuestionFeedback(group);
  if (!completed.length) return `<p class="summary-text">No completed question feedback yet.</p>`;
  return `<div class="question-summary-list stakeholder-question-list">${completed.map(({ question }) => `<div><strong>Q${question.id}</strong><p>${esc(buildQuestionSummary(group, question))}</p></div>`).join("")}</div>`;
}

function stakeholderMiniScoreList(group) {
  const reviews = miniReviewsForGroup(group);
  if (!reviews.length) return "";
  return `<div class="stakeholder-score-pills">${reviews.map(review => `<span>${esc(review.juryName || "Jury")}: ${miniProjectScore(review)}/${miniProjectTotal}</span>`).join("")}</div>`;
}

function stakeholderMadaScoreList(group) {
  const reviews = madaReviewsForGroup(group);
  if (!reviews.length) return "";
  return `<div class="stakeholder-score-pills">${reviews.map(review => `<span>${esc(madaFirstName(review.juryName || "Jury"))}: ${madaProjectScore(review)}/${madaProjectTotal}</span>`).join("")}</div>`;
}

function stakeholderNewbieDetails(person, group) {
  const adminNotes = participantAdminNotes("mauritius", person);
  const questionNotes = participantQuestionNotes(person, group);
  const miniNotes = participantMiniNotes(person, group);
  return `<details class="stakeholder-table-details"><summary>Open details</summary><div>${adminNotes.length ? `<h4>Admin feedback</h4><ul>${adminNotes.map(item => `<li><b>${esc(item.admin)}:</b> ${esc(item.note)}</li>`).join("")}</ul>` : ""}${questionNotes.length ? `<h4>Mentor question feedback</h4><ul>${questionNotes.map(item => `<li><b>Q${esc(item.qid)} · ${esc(item.mentor)}:</b> ${esc(item.note)}</li>`).join("")}</ul>` : `<p>No individual mentor notes from completed questions yet.</p>`}${miniNotes.length ? `<h4>Jury mini-project feedback</h4><ul>${miniNotes.map(item => `<li><b>${esc(item.jury)} · ${esc(item.score)}:</b> ${esc(item.note)}</li>`).join("")}</ul>` : `<p>No individual jury notes yet.</p>`}</div></details>`;
}

function stakeholderMadaNewbieDetails(person, group) {
  const adminNotes = participantAdminNotes("madagascar", person);
  const notes = participantMadaNotes(person);
  return `<details class="stakeholder-table-details"><summary>Open details</summary><div>${adminNotes.length ? `<h4>Admin feedback</h4><ul>${adminNotes.map(item => `<li><b>${esc(item.admin)}:</b> ${esc(item.note)}</li>`).join("")}</ul>` : ""}${notes.length ? `<h4>Jury mini-project feedback</h4><ul>${notes.map(item => `<li><b>${esc(item.jury)} · ${esc(item.score)}:</b> ${esc(item.note)}</li>`).join("")}</ul>` : `<p>No individual jury notes yet.</p>`}</div></details>`;
}

function stakeholderIndividualRow(person, group, isMada, eventKey) {
  const summary = stakeholderPersonSummary(eventKey, person, group, isMada);
  const noteCount = (isMada ? participantMadaNotes(person).length : participantQuestionNotes(person, group).length + participantMiniNotes(person, group).length) + participantAdminNotes(isMada ? "madagascar" : "mauritius", person).length;
  const groupScoreCopy = isMada ? `${madaGroupAverage(group)}/${madaProjectTotal}` : `${groupScore(group)}/${knownTotalMarks()}`;
  const miniCopy = isMada ? `${madaGroupAverage(group)}/${madaProjectTotal}` : `${miniProjectAverage(group)}/${miniProjectTotal}`;
  const extraGroupCopy = isMada ? `Office: ${group.office || "—"}` : `${completedQuestionFeedback(group).length}/${state.data.questions.length} questions complete`;
  return `<tr><td data-label="Newbie">${participantNameBlock(person, "stakeholder", false)}<small>${esc(noteCount)} note${noteCount === 1 ? "" : "s"}</small></td><td data-label="Summary"><p class="stakeholder-ai-summary">${esc(summary)}</p></td><td data-label="Group"><strong>${esc(group.name)}</strong><small>${esc(extraGroupCopy)}</small></td><td data-label="Question / group points"><strong>${esc(groupScoreCopy)}</strong><small>${isMada ? "Group mini-project average" : "Question points"}</small></td><td data-label="Mini-project"><strong>${esc(miniCopy)}</strong><small>Mini-project context</small></td><td data-label="Further info">${isMada ? stakeholderMadaNewbieDetails(person, group) : stakeholderNewbieDetails(person, group)}</td></tr>`;
}

function stakeholderIndividualDashboard(eventKey) {
  const isMada = eventKey === "madagascar";
  const people = isMada
    ? madaGroups().flatMap(group => group.participants.map(person => ({ group, person })))
    : state.data.groups.flatMap(group => group.participants.map(person => ({ group, person })));
  const status = state.stakeholderSummaryStatus?.[eventKey] || "local";
  const badge = status === "loading" ? "AI refreshing" : status === "ready" ? "AI summaries" : status === "cached" ? "Saved AI summaries" : status === "error" ? "AI unavailable" : "Local fallback";
  const errorCopy = state.stakeholderSummaryError?.[eventKey] || "Check the Edge Function deploy, Gemini secret, and Supabase SQL setup.";
  const statusCopy = status === "error" ? `<p class="notice compact-notice">AI summary could not load: ${esc(errorCopy)} Showing available saved/local information.</p>` : "";
  return `<section class="card report-card stakeholder-individual-section" id="stakeholder-individual"><div class="report-heading"><div><p class="eyebrow">Individual dashboard</p><h2>Newbie feedback summaries</h2><p class="subtle">Built like a full table view: scan each newbie, then open details only when needed.</p></div><span class="ai-badge">${esc(badge)}</span></div>${statusCopy}<div class="stakeholder-table-wrap"><table class="stakeholder-individual-table"><thead><tr><th>Newbie</th><th>Summary</th><th>Group</th><th>${isMada ? "Group points" : "Question points"}</th><th>Mini-project</th><th>Further info</th></tr></thead><tbody>${people.map(({ group, person }) => stakeholderIndividualRow(person, group, isMada, eventKey)).join("")}</tbody></table></div></section>`;
}

function stakeholderPayload(eventKey) {
  if (eventKey === "madagascar") {
    return {
      event: stakeholderEventLabel(eventKey),
      groups: madaGroups().map(group => ({
        group: group.name,
        office: group.office || "",
        miniProjectAverage: `${madaGroupAverage(group)}/${madaProjectTotal}`,
        miniProjectSummary: buildMadaGroupSummary(group),
        participants: group.participants.map(person => ({
          name: person,
          feedback: buildMadaPersonFeedback(person)
        }))
      }))
    };
  }

  return {
    event: stakeholderEventLabel(eventKey),
    groups: state.data.groups.map(group => ({
      group: group.name,
      completedQuestions: completedQuestionFeedback(group).map(({ question, correction }) => ({
        question: `Q${question.id}: ${question.prompt}`,
        marks: `${correction.marksAwarded ?? 0}/${correction.maxMarks ?? question.maxMarks ?? "?"}`,
        groupFeedback: correction.groupRemark || correction.correction || "",
        mentor: correction.mentorName || "Mentor"
      })),
      miniProjectAverage: `${miniProjectAverage(group)}/${miniProjectTotal}`,
      miniProjectSummary: buildMiniProjectSummary(group),
      participants: group.participants.map(person => ({
        name: person,
        feedback: participantStakeholderFeedback(person, group)
      }))
    }))
  };
}

function stakeholderFallbackSummary(eventKey) {
  const payload = stakeholderPayload(eventKey);
  const rows = payload.groups
    .map(group => {
      const questionCount = group.completedQuestions?.length ? `${group.completedQuestions.length} completed question(s), ` : "";
      return `${group.group}: ${questionCount}mini-project ${group.miniProjectAverage}. ${group.miniProjectSummary}`;
    })
    .join(" ");
  return `${payload.event} stakeholder view: ${rows || "No submitted feedback yet."}`;
}

async function generateStakeholderOpinion(eventKey) {
  if (!stakeholderEvents[eventKey]) throw new Error("Choose a stakeholder dashboard.");
  const dashboard = stakeholderPayload(eventKey);
  let summary = "";
  let personSummaries = {};

  if (remoteEnabled() && supabaseClient.functions?.invoke) {
    const accessCode = state.stakeholderAccessCode?.[eventKey] || state.stakeholderAccessCodes?.[eventKey]?.code || "";
    const { data, error } = await supabaseClient.functions.invoke("stakeholder-summary", {
      body: { eventKey, accessCode, dashboard }
    });
    if (error) throw error;
    summary = data?.summary || "";
    personSummaries = data?.personSummaries || {};
    if (data?.cached) state.stakeholderSummaryStatus[eventKey] = "cached";
  }

  state.stakeholderSummaries[eventKey] = summary || stakeholderFallbackSummary(eventKey);
  Object.entries(personSummaries).forEach(([person, content]) => {
    const value = String(content || "").trim();
    if (value) state.stakeholderPersonSummaries[stakeholderPersonSummaryKey(eventKey, person)] = value;
  });
  if (state.stakeholderSummaryStatus[eventKey] !== "cached") {
    state.stakeholderSummaryStatus[eventKey] = Object.keys(personSummaries).length ? "ready" : "local";
  }
  saveLocal();
  return state.stakeholderSummaries[eventKey];
}

function stakeholderPeople(eventKey) {
  return eventKey === "madagascar"
    ? madaGroups().flatMap(group => group.participants || [])
    : state.data.groups.flatMap(group => group.participants || []);
}

function hasStakeholderAISummaries(eventKey) {
  const people = stakeholderPeople(eventKey);
  return people.length > 0 && people.every(person => state.stakeholderPersonSummaries?.[stakeholderPersonSummaryKey(eventKey, person)]);
}

function clearStakeholderAISummaries(eventKey) {
  Object.keys(state.stakeholderPersonSummaries || {}).forEach(key => {
    if (key.startsWith(`${eventKey}|`)) delete state.stakeholderPersonSummaries[key];
  });
  delete state.stakeholderSummaries[eventKey];
  state.stakeholderSummaryStatus[eventKey] = "local";
  state.stakeholderSummaryError[eventKey] = "";
  stakeholderAISessionAttempts[eventKey] = false;
}

function queueStakeholderAISummary(eventKey) {
  if (!remoteEnabled() || !supabaseClient.functions?.invoke) return;
  if (!stakeholderAccessIsCurrent(eventKey)) return;
  if (stakeholderAIInFlight[eventKey] || stakeholderAISessionAttempts[eventKey]) return;

  stakeholderAIInFlight[eventKey] = true;
  stakeholderAISessionAttempts[eventKey] = true;
  state.stakeholderSummaryStatus[eventKey] = "loading";
  saveLocal();

  setTimeout(async () => {
    try {
      await generateStakeholderOpinion(eventKey);
      if (location.hash === "#stakeholder" && state.session?.eventKey === eventKey) stakeholderDashboard(eventKey);
    } catch (error) {
      console.error("Default stakeholder AI summary failed", error);
      state.stakeholderSummaryStatus[eventKey] = hasStakeholderAISummaries(eventKey) ? "cached" : "error";
      state.stakeholderSummaryError[eventKey] = friendlyError(error, error?.message || "AI request failed.");
      saveLocal();
    } finally {
      stakeholderAIInFlight[eventKey] = false;
    }
  }, 50);
}

function stakeholderAccessAdminView(eventKey) {
  ensureStakeholderAccessCodes();
  const record = state.stakeholderAccessCodes?.[eventKey] || {};
  const active = record.active !== false;
  const { code, privateUrl, shareText } = stakeholderAccessDetails(eventKey);
  const setupWarning = state.stakeholderCodeSetupMissing ? `<div class="notice">Run the latest Supabase setup before sharing stakeholder links online. Until then, this link may only work on this browser.</div>` : "";
  return adminAccordion({
    eyebrow: "Stakeholder sharing",
    title: `${stakeholderEventLabel(eventKey)} dashboard link`,
    subtitle: active ? "Read-only stakeholder dashboard is active." : "Access is revoked. The link and code will not open the dashboard.",
    badge: active ? "Active" : "Revoked",
    extraClass: "mentor-code-admin-card",
    content: `${setupWarning}<div class="admin-toggle-row"><span><strong>${active ? "Stakeholder access is active" : "Stakeholder access is revoked"}</strong><small>${active ? "Stakeholders with the private URL/code can view this read-only dashboard." : "The private URL/code is blocked until you enable access again or regenerate a new code."}</small></span>${active ? `<button class="danger-mini" type="button" data-revoke-stakeholder-access="${esc(eventKey)}">Revoke access</button>` : `<button class="primary" type="button" data-enable-stakeholder-access="${esc(eventKey)}">Enable access</button>`}</div><div class="mentor-code-grid"><div class="mentor-code-row"><span class="avatar">S</span><div><strong>${esc(stakeholderEventLabel(eventKey))}</strong><code>${esc(code)}</code><small class="mentor-url-line">${esc(privateUrl)}</small></div><div class="mentor-code-actions"><button class="secondary" type="button" data-copy-text="${esc(privateUrl)}">Copy URL</button><button class="secondary" type="button" data-copy-text="${esc(code)}">Copy code</button><button class="secondary" type="button" data-copy-text="${esc(shareText)}">Copy share text</button><button class="secondary" type="button" data-preview-stakeholder="${esc(eventKey)}">Preview</button><button class="danger-mini" type="button" data-regenerate-stakeholder-code="${esc(eventKey)}">Change code</button></div></div></div>`
  });
}

function adminIndividualFeedbackView(eventKey) {
  const groups = eventKey === "madagascar" ? madaGroups() : state.data.groups;
  const savedCount = groups.reduce((sum, group) => sum + (group.participants || []).filter(person => participantAdminNotes(eventKey, person).length).length, 0);
  const content = `<form id="admin-individual-feedback-form" data-event-key="${esc(eventKey)}" class="admin-individual-feedback-form">${groups.map(group => `<section class="admin-feedback-group"><div><strong>${esc(group.name)}</strong>${group.office ? `<small class="mada-office-badge">${esc(group.office)}</small>` : ""}</div><div class="admin-feedback-grid">${(group.participants || []).map(person => {
    const note = state.adminIndividualFeedback?.[adminFeedbackKey(eventKey, person)]?.feedback || "";
    return `<label>${participantNameBlock(person, "small", false)}<textarea name="adminFeedback::${esc(person)}" rows="3" placeholder="Admin feedback for stakeholder summary...">${esc(note)}</textarea></label>`;
  }).join("")}</div></section>`).join("")}<button class="primary" type="submit">Save individual feedback</button><p class="subtle">Empty a field and save to remove that admin note. These notes appear in stakeholder summaries and details.</p></form>`;
  return adminAccordion({
    eyebrow: "Stakeholder notes",
    title: "Add individual notes",
    subtitle: "Admin notes for each newbie, included in stakeholder summaries.",
    badge: `${savedCount} noted`,
    extraClass: "mentor-code-admin-card",
    content
  });
}

function aiUsageSummaryView(eventKey = "") {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const events = (state.aiUsageEvents || []).filter(item => {
    if (eventKey && item.eventKey !== eventKey) return false;
    return String(item.createdAt || "").startsWith(monthKey);
  });
  const calls = events.length;
  const tokens = events.reduce((sum, item) => sum + (Number(item.totalTokens) || 0), 0);
  const callLimit = Number(cfg.aiMonthlyCallLimit || 0);
  const tokenLimit = Number(cfg.aiMonthlyTokenLimit || 0);
  const callsLeft = callLimit ? Math.max(0, callLimit - calls) : null;
  const tokensLeft = tokenLimit ? Math.max(0, tokenLimit - tokens) : null;
  const latest = events[0];
  const generateButton = eventKey ? `<div class="subtle-actions admin-accordion-actions"><button class="primary" type="button" data-action="admin-stakeholder-summary" data-event-key="${esc(eventKey)}">Generate stakeholder AI summary</button></div>` : "";
  const content = `${generateButton}<div class="stakeholder-metric-strip ai-usage-strip"><div><strong>${calls}</strong><span>AI calls this month</span></div><div><strong>${callsLeft === null ? "Set cap" : callsLeft}</strong><span>Calls left</span></div><div><strong>${tokens.toLocaleString()}</strong><span>Tokens used</span></div><div><strong>${tokensLeft === null ? "Set cap" : tokensLeft.toLocaleString()}</strong><span>Tokens left</span></div></div><p class="subtle">${latest ? `Latest AI call: ${new Date(latest.createdAt).toLocaleString()}${latest.model ? ` · ${esc(latest.model)}` : ""}` : "No AI summaries generated yet this month."} Limits come from <code>config.js</code>. Usage updates only after this app calls the stakeholder AI summary function.</p>`;
  return adminAccordion({
    eyebrow: "AI usage",
    title: eventKey ? `${stakeholderEventLabel(eventKey)} AI usage` : "AI usage",
    subtitle: "Monthly calls and token estimate from stakeholder summary generation.",
    badge: `${calls} call${calls === 1 ? "" : "s"}`,
    extraClass: "mentor-code-admin-card",
    content
  });
}

function stakeholderAccessView(eventKey = "mauritius", message = "") {
  const label = stakeholderEventLabel(eventKey);
  shell(`<main class="page simple-page"><section class="welcome-panel stakeholder-gate"><div><p class="eyebrow orange-eyebrow">Stakeholder access</p><h1>${esc(label)} dashboard</h1><p class="subtle">Enter the private code from admin to open the read-only stakeholder dashboard.</p>${message ? `<div class="mentor-code-error">${esc(message)}</div>` : ""}<form id="stakeholder-code-form" data-event-key="${esc(eventKey)}" class="stakeholder-code-form"><label>Access code<input name="stakeholderCode" type="text" autocomplete="one-time-code" placeholder="SP-SHARE-XXXX-XXXX-XXXX" required></label><button class="primary" type="submit">Open dashboard</button></form></div></section></main>`);
}

function stakeholderDashboard(eventKey) {
  const isMada = eventKey === "madagascar";
  const rows = isMada ? madaScoreboard() : combinedScoreboard();
  const individualSection = stakeholderIndividualDashboard(eventKey);
  const winnerView = stakeholderWinnerView(eventKey, rows);
  const cards = isMada
    ? madaGroups().map(group => `<article class="card report-card stakeholder-group-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)} · ${esc(group.office || "")}</p><h2>Group and work context</h2></div><span class="ai-badge">${madaGroupAverage(group)}/${madaProjectTotal}</span></div>${stakeholderMetricStrip([{ value: `${madaGroupAverage(group)}/${madaProjectTotal}`, label: "Mini-project average" }, { value: String(madaReviewsForGroup(group).length), label: "Jury reviews" }, { value: String(group.participants.length), label: "Newbies" }])}<h3>Group summary</h3><p class="summary-text">${esc(buildMadaGroupSummary(group))}</p>${stakeholderMadaScoreList(group)}<details class="stakeholder-detail-block"><summary>More mini-project detail</summary>${madaProjectBreakdownView(group)}</details></article>`).join("")
    : state.data.groups.map(group => {
      const completed = completedQuestionFeedback(group);
      const total = groupScore(group) + miniProjectAverage(group);
      return `<article class="card report-card stakeholder-group-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)}</p><h2>Group and work context</h2></div><span class="ai-badge">${total}/${knownTotalMarks() + miniProjectTotal}</span></div>${stakeholderMetricStrip([{ value: `${total}/${knownTotalMarks() + miniProjectTotal}`, label: "Overall points" }, { value: `${groupScore(group)}/${knownTotalMarks()}`, label: "Question points" }, { value: `${miniProjectAverage(group)}/${miniProjectTotal}`, label: "Mini-project average" }, { value: `${completed.length}/${state.data.questions.length}`, label: "Completed questions" }])}<h3>Group summary</h3><p class="summary-text">${esc(buildGroupSummary(group))}</p><h3>Completed questions</h3>${stakeholderQuestionPanel(group)}<h3>Mini project</h3>${stakeholderMiniScoreList(group)}<details class="stakeholder-detail-block"><summary>More mini-project detail</summary>${miniProjectBreakdownView(group)}</details></article>`;
    }).join("");

  shell(`<main class="page admin-page stakeholder-page"><section class="hero"><div><p class="eyebrow">Stakeholder dashboard</p><h1>${esc(stakeholderEventLabel(eventKey))}</h1></div><div class="hero-actions"><button class="secondary" data-scroll-target="stakeholder-individual">Individual table</button><button class="secondary" data-scroll-target="stakeholder-groups">Group details</button><button class="secondary" data-action="refresh-stakeholder" data-event-key="${esc(eventKey)}">Refresh data</button></div></section><section class="report-stack">${winnerView}${individualSection}<div id="stakeholder-groups" class="stakeholder-anchor"></div>${cards}</section></main>`);
  queueStakeholderAISummary(eventKey);
}

async function openStakeholderDashboard() {
  const params = new URLSearchParams(location.search);
  const eventKey = stakeholderEvents[params.get("stakeholder")] ? params.get("stakeholder") : "mauritius";
  const code = params.get("stakeholderAccess") || params.get("stakeholderCode") || "";

  if (!stakeholderAccessIsCurrent(eventKey)) {
    if (!code) return stakeholderAccessView(eventKey);
    try {
      const ok = await unlockStakeholderFromAccessCode(eventKey, code);
      if (!ok) return stakeholderAccessView(eventKey, "This stakeholder link is no longer valid. Ask admin for the latest URL.");
    } catch (error) {
      return stakeholderAccessView(eventKey, friendlyError(error, "Could not verify this stakeholder link. Try again."));
    }
  }
  stakeholderDashboard(eventKey);
}

function miniProjectTopicAdminView() {
  const topicOptions = topicKey => [
    `<option value="">— Unassigned / remove title —</option>`,
    ...miniProjectTopics.map(topic => `<option value="${esc(topic.key)}" ${topicKey === topic.key ? "selected" : ""}>${esc(topicFullTitle(topic))}</option>`)
  ].join("");

  return adminAccordion({
    eyebrow: "Mini-project titles",
    title: "Assign group topics",
    subtitle: "Change or remove the titles shown on jury screens.",
    badge: `${Object.keys(state.miniProjectAssignments).length}/${state.data.groups.length} assigned`,
    extraClass: "mini-topic-admin-card",
    content: `<form id="mini-project-topic-form" class="mini-topic-admin-form"><div class="mini-topic-admin-grid">${state.data.groups.map(group => { const assignment = assignmentForGroup(group); const topic = topicByKey(assignment?.topicKey); return `<label><span><strong>${esc(group.name)}</strong><small>${topic ? `Current: ${esc(topic.title)}` : "Currently unassigned"}</small></span><select name="topic::${group.id}">${topicOptions(assignment?.topicKey)}</select></label>`; }).join("")}</div><details class="mini-topic-options"><summary>View the 3 topic briefs</summary>${miniProjectTopics.map(topic => `<section><strong>${esc(topicFullTitle(topic))}</strong><p>${esc(topic.brief)}</p><small><b>Bonus AI:</b> ${esc(topic.bonus)}</small></section>`).join("")}</details><button class="primary" type="submit">Save title changes</button></form>`
  });
}

function madaTopicAdminView() {
  const topicOptions = topicKey => [
    `<option value="">— Unassigned / remove title —</option>`,
    ...madaTopics.map(topic => `<option value="${esc(topic.key)}" ${topicKey === topic.key ? "selected" : ""}>${esc(madaTopicFullTitle(topic))}</option>`)
  ].join("");

  return `<article class="card report-card mini-topic-admin-card"><div class="report-heading"><div><p class="eyebrow">Spoon Madagascar titles</p><h2>Assign, change, or unassign group topics</h2><p class="subtle">Choose a title to assign/change it, or choose “Unassigned / remove title” to remove it from the jury screens.</p></div><span class="ai-badge">${Object.keys(state.madaAssignments).length}/${madaGroups().length} assigned</span></div><form id="mada-topic-form" class="mini-topic-admin-form"><div class="mini-topic-admin-grid">${madaGroups().map(group => { const assignment = madaAssignmentForGroup(group); const topic = madaTopicByKey(assignment?.topicKey); return `<label><span><strong>${esc(group.name)}</strong><small class="mada-office-badge">${esc(group.office)}</small><small>${topic ? `Current: ${esc(topic.title)}` : "Currently unassigned"}</small></span><select name="madaTopic::${group.id}">${topicOptions(assignment?.topicKey)}</select></label>`; }).join("")}</div><details class="mini-topic-options"><summary>View the 3 topic briefs</summary>${madaTopics.map(topic => `<section><strong>${esc(madaTopicFullTitle(topic))}</strong><p>${esc(topic.brief)}</p><small><b>Bonus AI:</b> ${esc(topic.bonus)}</small></section>`).join("")}</details><button class="primary" type="submit">Save title changes</button></form></article>`;
}

function adminMiniReviewEditorView() {
  const reviews = Object.values(state.miniProjectReviews)
    .sort((a, b) => Number(a.groupId) - Number(b.groupId) || String(a.juryName).localeCompare(String(b.juryName)));

  if (!reviews.length) {
    return `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Mini-project admin editor</p><h2>Jury feedback controls</h2></div><span class="ai-badge">0 reviews</span></div><p class="subtle">No jury feedback has been submitted yet.</p></article>`;
  }

  return `<article class="card report-card admin-mini-editor-card"><div class="report-heading"><div><p class="eyebrow">Mini-project admin editor</p><h2>Edit or remove jury feedback</h2><p class="subtle">Change criteria points, clear points while keeping notes, or delete a full jury feedback entry.</p></div><span class="ai-badge">${reviews.length} review${reviews.length === 1 ? "" : "s"}</span></div><div class="admin-mini-editor-list">${reviews.map(review => {
    const group = groupById(review.groupId);
    const score = miniProjectScore(review);
    return `<form class="admin-mini-review-form" data-group="${esc(review.groupId)}" data-jury="${esc(review.juryName)}"><div class="admin-mini-editor-head"><div><p class="eyebrow">${esc(group?.name || review.groupName || `Group ${review.groupId}`)}</p><h3>${esc(review.juryName)} feedback</h3><small>${score}/${miniProjectTotal} mini-project points</small></div><div class="admin-mini-actions"><button class="secondary" type="button" data-clear-mini-scores="${esc(review.groupId)}|${esc(review.juryName)}">Clear points</button><button class="danger-mini" type="button" data-delete-mini-review="${esc(review.groupId)}|${esc(review.juryName)}">Delete feedback</button><button class="primary" type="submit">Save changes</button></div></div><div class="admin-mini-score-grid">${miniProjectCriteria.map(criterion => `<label><span>${esc(criterion.label)} <b>/${criterion.max}</b></span><input type="number" min="0" max="${criterion.max}" step="0.5" name="${esc(criterion.key)}" value="${esc(miniCriterionScore(review.scores, criterion) || 0)}"></label>`).join("")}</div><label class="admin-mini-note-wide"><span>Group note</span><textarea name="groupNote" placeholder="Group-level feedback...">${esc(review.groupNote || "")}</textarea></label><div class="admin-mini-notes-grid">${(group?.participants || []).map(person => `<label>${participantNameBlock(person)}<textarea name="miniNote::${esc(person)}" placeholder="Individual note...">${esc(review.individualNotes?.[person] || "")}</textarea></label>`).join("")}</div></form>`;
  }).join("")}</div></article>`;
}

function madaReviewEditorView() {
  const reviews = Object.values(state.madaReviews)
    .sort((a, b) => Number(a.groupId) - Number(b.groupId) || String(a.juryName).localeCompare(String(b.juryName)));

  if (!reviews.length) {
    return `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Spoon Madagascar admin editor</p><h2>Jury feedback controls</h2></div><span class="ai-badge">0 reviews</span></div><p class="subtle">No jury feedback has been submitted yet.</p></article>`;
  }

  return `<article class="card report-card admin-mini-editor-card"><div class="report-heading"><div><p class="eyebrow">Spoon Madagascar admin editor</p><h2>Edit or remove jury feedback</h2><p class="subtle">Change criteria points or delete a full jury feedback entry.</p></div><span class="ai-badge">${reviews.length} review${reviews.length === 1 ? "" : "s"}</span></div><div class="admin-mini-editor-list">${reviews.map(review => {
    const group = madaGroupById(review.groupId);
    return `<form class="admin-mada-review-form" data-mada-group="${esc(review.groupId)}" data-mada-jury="${esc(review.juryName)}"><div class="admin-mini-editor-head"><div><p class="eyebrow">${esc(group?.name || review.groupName || `Group ${review.groupId}`)}</p><h3>${esc(madaFirstName(review.juryName))} feedback</h3><small>${madaProjectScore(review)}/${madaProjectTotal} points</small></div><div class="admin-mini-actions"><button class="danger-mini" type="button" data-delete-mada-review="${esc(review.groupId)}|${esc(review.juryName)}">Delete feedback</button><button class="primary" type="submit">Save changes</button></div></div><div class="admin-mini-score-grid">${madaCriteria.map(criterion => `<label><span>${esc(criterion.label)} <b>/${criterion.max}</b></span><input type="number" min="0" max="${criterion.max}" step="0.5" name="${esc(criterion.key)}" value="${esc(madaCriterionScore(review.scores, criterion) || 0)}"></label>`).join("")}</div><label class="admin-mini-note-wide"><span>Group note</span><textarea name="groupNote" placeholder="Group-level feedback...">${esc(review.groupNote || "")}</textarea></label>${(group?.participants || []).length ? `<div class="admin-mini-notes-grid">${group.participants.map(person => `<label>${participantNameBlock(person)}<textarea name="madaNote::${esc(person)}" placeholder="Individual note...">${esc(review.individualNotes?.[person] || "")}</textarea></label>`).join("")}</div>` : ""}</form>`;
  }).join("")}</div></article>`;
}

function juryAdminView() {
  ensureJuryAccessCodes();
  const setupWarning = state.juryCodeSetupMissing ? `<div class="notice">Run the latest Supabase setup before sharing jury codes online. Until then, these codes/settings may only work locally.</div>` : "";
  const juryRows = `<div class="mentor-code-grid">${state.juries.map(name => {
    const record = state.juryAccessCodes[name] || {};
    const { code, privateUrl, shareText } = juryAccessDetails(name);
    return `<div class="mentor-code-row"><span class="avatar">${esc(name[0])}</span><div><strong>${esc(name)}</strong><code>${esc(code)}</code><small class="mentor-url-line">${esc(privateUrl)}</small><small>${record.updatedAt ? `Updated ${new Date(record.updatedAt).toLocaleString()}` : "Ready to share"}</small></div><div class="mentor-code-actions"><button class="secondary" type="button" data-copy-text="${esc(privateUrl)}">Copy URL</button><button class="secondary" type="button" data-copy-text="${esc(code)}">Copy code</button><button class="secondary" type="button" data-copy-text="${esc(shareText)}">Copy share text</button><button class="danger-mini" type="button" data-regenerate-jury-code="${esc(name)}">Regenerate</button></div></div>`;
  }).join("")}</div>`;
  return adminAccordion({
    eyebrow: "Jury management",
    title: "Mini-project jury",
    subtitle: state.juryAccessPublic ? "Public mode is on: jury can enter without codes." : "Private mode: jury members need code or private URL.",
    badge: state.juryAccessPublic ? "Public" : `${state.juries.length} private`,
    content: `${setupWarning}<div class="admin-toggle-row"><span><strong>Public jury access</strong><small>Turn this on temporarily if code links cause issues. Turn it off to require private jury codes again.</small></span>${state.juryAccessPublic ? `<button class="danger-mini" type="button" data-revoke-jury-public>Revoke public access</button>` : `<button class="primary" type="button" data-make-jury-public>Make jury public</button>`}</div><form id="jury-form" class="inline-admin-form"><label>Add jury<input name="juryName" type="text" placeholder="Jury name" required></label><button class="primary" type="submit">Add jury</button></form><form id="jury-rename-form" class="inline-admin-form rename-admin-form"><label>Current jury<select name="oldJuryName" required>${state.juries.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join("")}</select></label><label>New name<input name="newJuryName" type="text" placeholder="Corrected jury name" required></label><button class="secondary" type="submit">Rename jury</button></form><div class="mentor-admin-list">${state.juries.map(name => `<div><span class="avatar">${esc(name[0])}</span><strong>${esc(name)}</strong><button class="danger-mini" data-delete-jury="${esc(name)}">Delete</button></div>`).join("")}</div><div class="subtle-actions admin-accordion-actions"><button class="secondary" type="button" data-regenerate-all-jury-codes>Regenerate all jury codes</button></div>${juryRows}`
  });
}

function mentorManagementView() {
  return adminAccordion({
    eyebrow: "Mentor management",
    title: "Spoon mentors",
    subtitle: "Add mentors and remove old mentor access.",
    badge: `${state.mentors.length} active`,
    content: `<form id="mentor-form" class="inline-admin-form"><label>Add mentor<input name="mentorName" type="text" placeholder="Mentor name" required></label><button class="primary" type="submit">Add mentor</button></form><div class="mentor-admin-list">${state.mentors.map(name => `<div><span class="avatar">${esc(name[0])}</span><strong>${esc(name)}</strong><button class="danger-mini" data-delete-mentor="${esc(name)}">Delete</button></div>`).join("")}</div>`
  });
}

function madaJuryAdminView() {
  return `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Jury management</p><h2>Spoon Madagascar jury</h2></div><span class="ai-badge">${state.madaJuries.length} active</span></div><form id="mada-jury-form" class="inline-admin-form"><label>Add jury<input name="madaJuryName" type="text" placeholder="Jury name" required></label><label>Office<select name="madaJuryOffice">${madaOffices.map(office => `<option value="${esc(office)}">${esc(office)}</option>`).join("")}</select></label><button class="primary" type="submit">Add jury</button></form><form id="mada-jury-rename-form" class="inline-admin-form rename-admin-form"><label>Current jury<select name="oldMadaJuryName" required>${state.madaJuries.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join("")}</select></label><label>New name<input name="newMadaJuryName" type="text" placeholder="Corrected jury name" required></label><label>Office<select name="newMadaJuryOffice">${madaOffices.map(office => `<option value="${esc(office)}">${esc(office)}</option>`).join("")}</select></label><button class="secondary" type="submit">Rename jury</button></form><div class="mentor-admin-list">${state.madaJuries.map(name => `<div class="mada-jury-admin-row"><span class="avatar">${esc(madaFirstName(name)[0] || "?")}</span><strong>${esc(madaFirstName(name))}</strong><small class="mada-office-badge">${esc(madaJuryOffice(name) || "—")}</small><button class="danger-mini" data-delete-mada-jury="${esc(name)}">Delete</button></div>`).join("")}</div></article>`;
}

function adminDetailedGroupCardsView() {
  return state.data.groups.map(group => { const topic = topicForGroup(group); return `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)}</p><h2>Group summary</h2>${topic ? `<p class="subtle">${esc(topicFullTitle(topic))}</p>` : ""}</div><span class="ai-badge">${groupScore(group) + miniProjectAverage(group)}/${knownTotalMarks() + miniProjectTotal} total</span></div><p class="summary-text">${esc(state.reports[`group|${group.id}`] || buildGroupSummary(group))}</p><h3>Mini project</h3>${miniProjectBreakdownView(group)}<h3>Question points</h3><div class="question-summary-list">${state.data.questions.map(question => { const hasCorrection = Boolean(state.groupCorrections[correctionKey(group.id, question.id)]); return `<div><strong>Q${question.id}</strong><p>${esc(state.reports[`question|${group.id}|${question.id}`] || buildQuestionSummary(group, question))}</p>${hasCorrection ? `<button class="danger-mini" data-delete-correction="${group.id}|${question.id}">Remove correction</button>` : ""}</div>`; }).join("")}</div><h3>Individual feedback</h3><div class="individual-grid">${group.participants.map(person => `<div class="feedback-tile">${participantNameBlock(person)}<p>${esc(state.reports[`person|${person}`] || buildPersonFeedback(person))}</p></div>`).join("")}</div></article>`; }).join("");
}

function adminTablePage() {
  shell(`<main class="page admin-page admin-table-page"><section class="hero"><div><p class="eyebrow">Admin table view</p><h1>All group + individual info</h1></div><button class="secondary" data-action="admin-dashboard">← Back to dashboard</button></section><section class="report-stack">${adminFullInfoTableView()}${adminMiniReviewEditorView()}</section></main>`);
}

function buildMadaGroupSummary(group) {
  const reviews = madaReviewsForGroup(group);
  const topic = madaTopicForGroup(group);
  const topicCopy = topic ? `Project: ${madaTopicFullTitle(topic)}. ` : "";
  if (!reviews.length) return `${topicCopy}No Spoon Madagascar jury feedback has been submitted yet.`;
  const average = madaGroupAverage(group);
  const juryDetails = reviews
    .slice()
    .sort((a, b) => String(a.juryName).localeCompare(String(b.juryName)))
    .map(review => `${esc(madaFirstName(review.juryName || "Jury"))}: ${madaProjectScore(review)}/${madaProjectTotal}${review.groupNote ? ` — ${review.groupNote}` : ""}`);
  return `${topicCopy}Average score: ${average}/${madaProjectTotal} from ${reviews.length} jury member(s). ${juryDetails.join(" · ")}`;
}

function buildMadaPersonFeedback(person) {
  const adminNotes = participantAdminNotes("madagascar", person);
  const notes = Object.values(state.madaReviews)
    .filter(review => review.individualNotes?.[person]?.trim())
    .map(review => ({ jury: review.juryName || "Jury", text: review.individualNotes[person] }));
  if (!adminNotes.length && !notes.length) return "No individual feedback has been submitted yet.";
  const adminCopy = adminNotes.length ? `Admin feedback: ${adminNotes.map(item => item.note).join(" · ")}` : "";
  const juryCopy = notes.length ? `${notes.length} jury note(s): ${notes.slice(0, 3).map(item => `${madaFirstName(item.jury)}: ${item.text}`).join(" · ")}` : "No jury individual notes.";
  return [adminCopy, juryCopy].filter(Boolean).join(" ");
}

function madaDetailedGroupCardsView() {
  return madaGroups().map(group => {
    const topic = madaTopicForGroup(group);
    const average = madaGroupAverage(group);
    return `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)} · ${esc(group.office)}</p><h2>Group summary</h2>${topic ? `<p class="subtle">${esc(madaTopicFullTitle(topic))}</p>` : ""}</div><span class="ai-badge">${average}/${madaProjectTotal}</span></div><p class="summary-text">${esc(state.reports[`mada-group|${group.id}`] || buildMadaGroupSummary(group))}</p><h3>Individual feedback</h3><div class="individual-grid">${group.participants.map(person => `<div class="feedback-tile">${participantNameBlock(person)}<p>${esc(state.reports[`mada-person|${person}`] || buildMadaPersonFeedback(person))}</p></div>`).join("")}</div></article>`;
  }).join("");
}

async function persistMadaReports() {
  if (!remoteEnabled()) return;

  const rows = [];
  madaGroups().forEach(group => {
    rows.push({
      report_key: `mada-group|${group.id}`,
      report_type: "group",
      group_id: group.id,
      group_name: group.name,
      participant_name: null,
      content: state.reports[`mada-group|${group.id}`] || buildMadaGroupSummary(group)
    });
    group.participants.forEach(person => {
      rows.push({
        report_key: `mada-person|${person}`,
        report_type: "person",
        group_id: group.id,
        group_name: group.name,
        participant_name: person,
        content: state.reports[`mada-person|${person}`] || buildMadaPersonFeedback(person)
      });
    });
  });

  const { error } = await supabaseClient.from("ai_reports").upsert(rows, { onConflict: "report_key" });
  if (error) throw error;
}

function madaAdminPage() {
  const scoreRows = madaScoreboard();
  const leader = scoreRows[0];
  const generatedCount = Object.keys(state.reports).filter(key => key.startsWith("mada-group|") || key.startsWith("mada-person|")).length;
  shell(`<main class="page admin-page"><section class="hero"><div><p class="eyebrow">Spoon Madagascar Admin</p><h1>Spoon Madagascar scoreboard & jury feedback</h1></div><div class="hero-actions"><button class="secondary" data-action="admin-dashboard">← Back to Mauritius admin</button><button class="primary" data-action="generate-mada-reports">✦ Generate AI summaries</button></div></section><section class="stats"><div class="stat"><strong>${state.madaJuries.length}</strong><span>Spoon Madagascar jury</span></div><div class="stat"><strong>${madaGroups().length}</strong><span>Groups</span></div><div class="stat"><strong>${madaProjectTotal}</strong><span>Total marks (same scale as Mauritius)</span></div><div class="stat"><strong>${generatedCount}</strong><span>Generated summaries</span></div></section><section class="report-stack"><article class="card report-card scoreboard-card"><div class="report-heading"><div><p class="eyebrow">Spoon Madagascar scoreboard</p><h2>${leader ? `${esc(leader.group.name)} is leading` : "No scores yet"}</h2></div><span class="ai-badge">${madaProjectTotal} marks total</span></div><div class="scoreboard-list combined-scoreboard">${scoreRows.map((row, index) => `<div class="${index === 0 && row.average > 0 ? "leader" : ""}"><span>${index + 1}</span><strong>${esc(row.group.name)}</strong><small class="mada-office-badge">${esc(row.group.office)}</small><small>${row.juryCount} jury</small><meter min="0" max="${row.max || 1}" value="${row.average}"></meter><b>${row.average}/${row.max}</b></div>`).join("")}</div></article>${adminIndividualFeedbackView("madagascar")}${stakeholderAccessAdminView("madagascar")}${aiUsageSummaryView("madagascar")}${madaDetailedGroupCardsView()}${newbieGroupsEditorView("madagascar")}${madaTopicAdminView()}${madaJuryAdminView()}${madaReviewEditorView()}</section></main>`);
}

function buildPersonFeedback(person) {
  const adminNotes = participantAdminNotes("mauritius", person);
  const remarks = Object.entries(state.individualRemarks)
    .filter(([key, value]) => key.split("|")[1] === person && (typeof value === "string" ? value.trim() : value.remark?.trim()))
    .map(([, value]) => typeof value === "string" ? { mentor: "Mentor", text: value } : { mentor: value.mentorName || "Mentor", text: value.remark });
  const miniNotes = Object.values(state.miniProjectReviews)
    .filter(review => review.individualNotes?.[person]?.trim())
    .map(review => ({ jury: review.juryName || "Jury", text: review.individualNotes[person] }));
  if (!adminNotes.length && !remarks.length && !miniNotes.length) return "No individual feedback has been submitted yet.";
  const adminCopy = adminNotes.length ? `Admin feedback: ${adminNotes.map(item => item.note).join(" · ")}` : "";
  const questionCopy = remarks.length ? `${remarks.length} question remark(s): ${remarks.slice(0, 3).map(x => `${x.mentor}: ${x.text}`).join(" · ")}` : "No question remarks.";
  const miniCopy = miniNotes.length ? `${miniNotes.length} mini-project note(s): ${miniNotes.slice(0, 3).map(x => `${x.jury}: ${x.text}`).join(" · ")}` : "No mini-project individual notes.";
  return [adminCopy, questionCopy, miniCopy].filter(Boolean).join(" ");
}

function buildMiniProjectSummary(group) {
  const reviews = miniReviewsForGroup(group);
  const topic = topicForGroup(group);
  const topicCopy = topic ? `Project title: ${topicFullTitle(topic)}. ` : "";
  if (!reviews.length) return `${topicCopy}Mini project has not been scored yet.`;
  const juryDetails = reviews
    .sort((a, b) => String(a.juryName).localeCompare(String(b.juryName)))
    .map(review => `${review.juryName || "Jury"}: ${miniProjectScore(review)}/${miniProjectTotal}${review.groupNote ? ` — ${review.groupNote}` : ""}`);
  return `${topicCopy}Average mini-project score: ${miniProjectAverage(group)}/${miniProjectTotal} from ${reviews.length} jury member(s). ${juryDetails.join(" · ")}`;
}

function historyList() {
  if (!state.changeHistory.length) return `<p class="subtle">No recent changes yet. Changes will appear here after mentors save.</p>`;
  const actionLabel = action => ({ INSERT: "Added", UPDATE: "Updated", DELETE: "Removed" }[String(action || "").toUpperCase()] || "Changed");
  const areaLabel = tableName => ({
    group_corrections: "question marks",
    individual_remarks: "individual feedback",
    admin_individual_feedback: "admin individual feedback",
    mini_project_reviews: "mini-project review",
    mini_project_assignments: "mini-project title",
    newbie_photos: "participant photo",
    ai_reports: "admin summary",
    mentors: "mentor list",
    juries: "jury list"
  }[String(tableName || "")] || "review data");
  return `<div class="mentor-inputs history-list">${state.changeHistory.slice(0, 12).map(item => `<div><span class="avatar">${esc((item.mentor_name || "?").slice(0, 1))}</span><strong>${esc(item.mentor_name || "System")}</strong><small>${esc(actionLabel(item.action))} ${esc(areaLabel(item.table_name))} · ${esc(item.group_name || "")}${item.question_position ? ` · Q${item.question_position}` : ""}<br>${new Date(item.changed_at).toLocaleString()}</small></div>`).join("")}</div>`;
}

function photoManagerView() {
  const participants = allParticipants();
  const uploaded = participants.filter(({ person }) => state.participantPhotos[person]).length;
  return `<details class="card report-card photo-manager-tab"><summary><span><strong>Newbie photo upload</strong><small>Hidden admin tool · ${uploaded}/${participants.length} uploaded</small></span><span class="ai-badge">Open</span></summary><form id="photo-upload-form" class="photo-upload-form"><label>Upload photo folder or multiple photos<input name="photos" type="file" accept="image/*" multiple webkitdirectory directory></label><button class="primary" type="submit">Upload & match photos</button><p class="subtle">Name files like <code>Sollinselvan Curpen.jpg</code>. The app compresses photos to display size and stores them with private, random file names.</p></form><div class="photo-admin-grid">${participants.map(({ group, person }) => `<div class="${state.participantPhotos[person] ? "has-photo" : ""}">${participantAvatar(person, "medium")}<strong>${esc(person)}</strong><small>${esc(group.name)} · ${state.participantPhotos[person] ? "Photo ready" : "No photo yet"}</small></div>`).join("")}</div></details>`;
}

function adminAccordion({ eyebrow, title, subtitle = "", badge = "", content = "", open = false, extraClass = "" }) {
  return `<details class="card report-card admin-accordion ${extraClass}" ${open ? "open" : ""}><summary><span><small class="eyebrow">${esc(eyebrow)}</small><strong>${esc(title)}</strong>${subtitle ? `<em>${esc(subtitle)}</em>` : ""}</span>${badge ? `<span class="ai-badge">${esc(badge)}</span>` : ""}</summary><div class="admin-accordion-body">${content}</div></details>`;
}

function newbieGroupsEditorView(eventKey) {
  const isMada = eventKey === "madagascar";
  const groups = isMada ? madaGroups() : state.data.groups;
  const offices = madaOffices.map(office => `<option value="${esc(office)}">${esc(office)}</option>`).join("");
  const rows = groups
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(group => `<section class="newbie-group-edit-row"><div class="newbie-group-edit-head"><span class="group-number">${esc(group.id)}</span><label>Group name<input name="name::${group.id}" value="${esc(group.name)}" required></label>${isMada ? `<label>Office<select name="office::${group.id}">${madaOffices.map(office => `<option value="${esc(office)}" ${group.office === office ? "selected" : ""}>${esc(office)}</option>`).join("")}</select></label>` : ""}</div><label>Participants <small>One participant per line</small><textarea name="participants::${group.id}" rows="5" required>${esc((group.participants || []).join("\n"))}</textarea></label></section>`)
    .join("");

  return adminAccordion({
    eyebrow: isMada ? "Spoon Madagascar groups" : "Mauritius groups",
    title: isMada ? "Edit Madagascar newbie groups" : "Edit Mauritius newbie groups",
    subtitle: "Change group names and participant lists.",
    badge: `${groups.length} groups`,
    extraClass: "newbie-group-editor-card",
    content: `<form id="${isMada ? "mada-groups-form" : "mauritius-groups-form"}" class="newbie-groups-form">${rows}<div class="sticky-actions admin-inline-actions"><button class="primary" type="submit">Save group changes</button></div></form>`
  });
}

async function saveNewbieGroupsAsAdmin(eventKey, formData) {
  if (state.session?.role !== "admin") throw new Error("Only admin can change newbie groups.");
  const isMada = eventKey === "madagascar";
  const currentGroups = isMada ? madaGroups() : state.data.groups;
  const nextGroups = currentGroups.map(group => {
    const name = String(formData[`name::${group.id}`] || "").trim().replace(/\s+/g, " ");
    const participants = String(formData[`participants::${group.id}`] || "")
      .split(/\r?\n/)
      .map(person => person.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    const office = isMada ? (madaOffices.includes(formData[`office::${group.id}`]) ? formData[`office::${group.id}`] : group.office || madaOffices[0]) : undefined;
    if (!name) throw new Error("Enter every group name.");
    if (!participants.length) throw new Error("Each group needs at least one participant.");
    return {
      id: Number(group.id),
      name,
      ...(isMada ? { office } : {}),
      participants
    };
  });

  if (isMada) state.madaGroups = nextGroups;
  else state.data.groups = nextGroups;
  saveLocal();

  if (!remoteEnabled()) return;

  const rows = nextGroups.map(group => ({
    event_key: isMada ? "madagascar" : "mauritius",
    group_id: group.id,
    group_name: group.name,
    office: group.office || null,
    participants: group.participants,
    active: true
  }));
  const { error } = await supabaseClient
    .from("event_groups")
    .upsert(rows, { onConflict: "event_key,group_id" });
  if (error) throw error;
}

function mentorAccessCodesView() {
  ensureMentorAccessCodes();
  const setupWarning = state.mentorCodeSetupMissing ? `<div class="notice">Run the latest <code>supabase/schema.sql</code> before sharing these codes online. Until then, these codes are only local to this browser.</div>` : "";
  const content = `${setupWarning}<div class="subtle-actions admin-accordion-actions"><button class="secondary" type="button" data-regenerate-all-mentor-codes>Regenerate all</button></div><div class="mentor-code-grid">${state.mentors.map(name => {
    const record = state.mentorAccessCodes[name] || {};
    const { code, privateUrl, shareText } = mentorAccessDetails(name);
    return `<div class="mentor-code-row"><span class="avatar">${esc(name[0])}</span><div><strong>${esc(name)}</strong><code>${esc(code)}</code><small class="mentor-url-line">${esc(privateUrl)}</small><small>${record.updatedAt ? `Updated ${new Date(record.updatedAt).toLocaleString()}` : "Ready to share"}</small></div><div class="mentor-code-actions"><button class="secondary" type="button" data-copy-text="${esc(privateUrl)}">Copy URL</button><button class="secondary" type="button" data-copy-text="${esc(code)}">Copy code</button><button class="secondary" type="button" data-copy-text="${esc(shareText)}">Copy share text</button><button class="danger-mini" type="button" data-regenerate-mentor-code="${esc(name)}">Regenerate</button></div></div>`;
  }).join("")}</div>`;
  return adminAccordion({
    eyebrow: "Secure mentor access",
    title: "Mentor codes and private URLs",
    subtitle: "Copy links or regenerate leaked mentor access.",
    badge: `${state.mentors.length} codes`,
    extraClass: "mentor-code-admin-card",
    content
  });
}

function auditTrailView() {
  return adminAccordion({
    eyebrow: "Audit trail",
    title: "Recent mentor changes",
    subtitle: "Latest saved edits and shared-data activity.",
    badge: syncLabel(),
    content: `<div class="subtle-actions">${state.changeHistory.length ? `<button class="subtle-link" data-action="clear-history">Clear recent changes</button>` : ""}</div>${historyList()}`
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function adminDashboard(selectedMentor = "all") {
  lastAdminMentor = selectedMentor;
  const totalCorrections = Object.keys(state.groupCorrections).length;
  const totalRemarks = Object.values(state.individualRemarks).filter(Boolean).length;
  shell(`<main class="page admin-page"><section class="hero"><div><p class="eyebrow">Admin command centre</p><h1>Scoreboard & feedback</h1></div><div class="hero-actions"><button class="secondary" data-action="admin-table">Full table view →</button><button class="secondary" data-action="mada-admin">Spoon Madagascar admin →</button><button class="primary" data-action="generate-reports">✦ Generate AI summaries</button></div></section><section class="stats"><div class="stat"><strong>${state.mentors.length}</strong><span>Spoon mentors</span></div><div class="stat"><strong>${totalCorrections}</strong><span>Marked questions</span></div><div class="stat"><strong>${knownTotalMarks() + miniProjectTotal}</strong><span>Combined total marks</span></div><div class="stat"><strong>${Object.keys(state.reports).length}</strong><span>Generated summaries</span></div></section><section class="report-stack">${scoreboardView()}${adminIndividualFeedbackView("mauritius")}${stakeholderAccessAdminView("mauritius")}${aiUsageSummaryView("mauritius")}${adminDetailedGroupCardsView()}${mentorManagementView()}${newbieGroupsEditorView("mauritius")}${mentorAccessCodesView()}${miniProjectTopicAdminView()}${photoManagerView()}${juryAdminView()}${auditTrailView()}</section></main>`);
}

async function openPublicForm() {
  const params = new URLSearchParams(location.search);
  const urlAccessCode = params.get("access") || params.get("code") || "";
  const urlMentor = params.get("mentor") || "";

  if (urlAccessCode) {
    mentorAccessView("Checking your private mentor URL...");
    try {
      const mentorName = await unlockMentorFromAccessCode(urlAccessCode, urlMentor);
      if (!mentorName) return mentorAccessView("This mentor URL is no longer valid. Ask an admin for the latest private URL.");
      history.replaceState(null, "", location.pathname);
      showToast(`Mentor page unlocked for ${mentorName}`);
      mentorDashboard();
      return;
    } catch (error) {
      return mentorAccessView(friendlyError(error, "Could not verify this mentor URL. Try again."));
    }
  }

  history.replaceState(null, "", location.pathname);
  state.session = { name: state.activeMentor, role: "mentor" };
  save();
  mentorDashboard();
}

function openCurrentPublicFlow() {
  if (location.hash === "#mini-project") {
    state.session = { name: state.activeJury, role: "jury" };
    save();
    if (state.miniProjectView === "review" && state.activeMiniGroup) return miniProjectReviewView(state.activeMiniGroup);
    if (state.miniProjectView === "groups") return miniProjectDashboard();
    return miniProjectLanding();
  }
  openPublicForm();
}

function notFoundView() {
  // Deliberately bare: no shell/topbar and no buttons or links out of this page.
  // A retired link (e.g. the old #mini-project-mada path) may have reached people who
  // shouldn't be pointed toward the mentor/jury/admin areas, so this is a dead end by design.
  app.innerHTML = `<main class="page simple-page not-found-page"><section class="mentor-choice"><h1>This link is no longer available</h1></section></main>`;
}

function dashboard() {
  if (location.hash === "#stakeholder") return openStakeholderDashboard();
  if (location.hash === "#admin-table") return state.session?.role === "admin" ? adminTablePage() : loginView();
  if (location.hash === "#admin") return state.session?.role === "admin" ? adminDashboard(lastAdminMentor) : loginView();
  if (location.hash === "#admin/spoon-madagascar") return state.session?.role === "admin" ? madaAdminPage() : loginView();
  if (location.hash === "#mini-project") {
    if (!state.juryAccessPublic && !juryAccessIsCurrent()) return openMiniProject();
    state.session = { name: state.activeJury, role: "jury" };
    saveLocal();
    if (state.miniProjectView === "review" && state.activeMiniGroup) return miniProjectReviewView(state.activeMiniGroup);
    if (state.miniProjectView === "groups") return miniProjectDashboard();
    return miniProjectLanding();
  }
  if (location.hash === "#mpm") {
    state.session = { name: state.activeMadaJury, role: "jury-mada" };
    saveLocal();
    if (state.madaJuryView === "review" && state.activeMadaGroup) return madaJuryReviewView(state.activeMadaGroup);
    if (state.madaJuryView === "groups") return madaJuryDashboard();
    return madaJuryLanding();
  }
  // Any hash that isn't one of the routes above (a typo, an old/removed link, etc.)
  // gets an explicit "not found" message instead of being silently sent home.
  if (location.hash && location.hash !== "#") return notFoundView();
  openPublicForm();
}

document.addEventListener("submit", async event => {
  event.preventDefault();

  if (event.target.id === "login-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await signInAdmin(data.email.trim().toLowerCase(), data.password);
      await loadSharedData({ includeAdminData: true });
      return dashboard();
    } catch (error) {
      return loginView(friendlyError(error, "Admin sign in failed. Check your email/password and try again."));
    }
  }

  if (event.target.id === "mentor-code-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      const mentorName = await unlockMentorFromAccessCode(data.accessCode);
      if (!mentorName) return mentorAccessView("This mentor code is not valid. Ask an admin for the latest code.");
      showToast(`Mentor page unlocked for ${mentorName}`);
      mentorDashboard();
    } catch (error) {
      mentorAccessView(friendlyError(error, "Could not verify this code. Try again."));
    }
    return;
  }

  if (event.target.id === "stakeholder-code-form") {
    const data = Object.fromEntries(new FormData(event.target));
    const eventKey = event.target.dataset.eventKey || "mauritius";
    try {
      const ok = await unlockStakeholderFromAccessCode(eventKey, data.stakeholderCode);
      if (!ok) return stakeholderAccessView(eventKey, "This stakeholder code is not valid. Ask admin for the latest code.");
      showToast(`Stakeholder dashboard unlocked for ${stakeholderEventLabel(eventKey)}`);
      stakeholderDashboard(eventKey);
    } catch (error) {
      stakeholderAccessView(eventKey, friendlyError(error, "Could not verify this code. Try again."));
    }
    return;
  }

  if (event.target.id === "mentor-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      const mentorName = await addMentorAsAdmin(data.mentorName || "");
      adminDashboard(lastAdminMentor);
      const details = mentorAccessDetails(mentorName);
      try {
        await copyTextToClipboard(details.shareText);
        showToast("✓ Mentor added. URL + code copied.");
      } catch (copyError) {
        showToast("✓ Mentor added. URL + code are shown in the dashboard.");
      }
      alert(`New mentor created: ${mentorName}\n\nPrivate URL:\n${details.privateUrl}\n\nBackup code:\n${details.code}`);
    } catch (error) {
      showToast(friendlyError(error, "Could not add mentor. Try again."));
    }
  }

  if (event.target.id === "jury-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      const juryName = await addJuryAsAdmin(data.juryName || "");
      adminDashboard(lastAdminMentor);
      const details = juryAccessDetails(juryName);
      try {
        await copyTextToClipboard(details.shareText);
        showToast("✓ Jury added. URL + code copied.");
      } catch (copyError) {
        showToast("✓ Jury added. URL + code are shown in the dashboard.");
      }
      alert(`New jury created: ${juryName}\n\nPrivate URL:\n${details.privateUrl}\n\nBackup code:\n${details.code}`);
    } catch (error) {
      showToast(friendlyError(error, "Could not add jury. Try again."));
    }
  }

  if (event.target.id === "jury-rename-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await renameJuryAsAdmin(data.oldJuryName || "", data.newJuryName || "");
      showToast("✓ Jury renamed");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not rename jury. Try again."));
    }
  }

  if (event.target.id === "mini-project-topic-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await saveMiniProjectAssignmentsAsAdmin(data);
      showToast(updatedOnlineMessage("Group titles"));
      adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Mini-project title save failed", error);
      showToast(friendlyError(error, "Could not save group titles. Try again."));
    }
  }

  if (event.target.id === "mauritius-groups-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await saveNewbieGroupsAsAdmin("mauritius", data);
      showToast(updatedOnlineMessage("Mauritius groups"));
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not save Mauritius groups. Try again."));
    }
  }

  if (event.target.id === "mada-groups-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await saveNewbieGroupsAsAdmin("madagascar", data);
      showToast(updatedOnlineMessage("Madagascar groups"));
      madaAdminPage();
    } catch (error) {
      showToast(friendlyError(error, "Could not save Madagascar groups. Try again."));
    }
  }

  if (event.target.id === "admin-individual-feedback-form") {
    const data = Object.fromEntries(new FormData(event.target));
    const eventKey = event.target.dataset.eventKey || "mauritius";
    try {
      await persistAdminIndividualFeedbackAsAdmin(eventKey, data);
      showToast(updatedOnlineMessage("Individual feedback"));
      if (eventKey === "madagascar") madaAdminPage();
      else adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Admin individual feedback save failed", error);
      showToast(friendlyError(error, "Could not save individual feedback. Try again."));
    }
  }

  if (event.target.classList.contains("admin-mini-review-form")) {
    const group = groupById(event.target.dataset.group);
    const data = Object.fromEntries(new FormData(event.target));
    const review = {
      groupId: Number(event.target.dataset.group),
      groupName: group?.name || `Group ${event.target.dataset.group}`,
      juryName: event.target.dataset.jury,
      scores: Object.fromEntries(miniProjectCriteria.map(criterion => [criterion.key, normalizeMark(data[criterion.key], criterion.max) || 0])),
      groupNote: data.groupNote || "",
      individualNotes: Object.fromEntries((group?.participants || []).map(person => [person, data[`miniNote::${person}`]?.trim() || ""]).filter(([, value]) => value))
    };

    try {
      await persistMiniReviewAsAdmin(review);
      showToast("✓ Jury feedback updated");
      adminTablePage();
    } catch (error) {
      console.error("Admin jury feedback update failed", error);
      showToast(friendlyError(error, "Could not update jury feedback. Try again."));
    }
  }

  if (event.target.id === "photo-upload-form") {
    const files = [...event.target.elements.photos.files];
    if (!files.length) return alert("Choose a folder or photos to upload.");

    const matched = files
      .map(file => ({ file, match: matchParticipantFromFile(file) }))
      .filter(item => item.match);
    const unmatched = files.length - matched.length;
    if (!matched.length) return alert("No photos matched participant names. Rename files to match participant names, for example: Sollinselvan Curpen.jpg");

    try {
      showToast(`Uploading ${matched.length} photo(s)…`);
      for (const item of matched) await uploadParticipantPhoto(item.file, item.match);
      await loadSharedData({ includeAdminData: true });
      showToast(`✓ Uploaded ${matched.length} photo(s)${unmatched ? ` · ${unmatched} unmatched` : ""}`);
      adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Photo upload failed", error);
      showToast(friendlyError(error, "Photo upload failed. Check the files and try again."));
    }
  }

  if (event.target.id === "mini-project-form") {
    if (!state.juryAccessPublic && !juryAccessIsCurrent()) {
      await promptForJuryCode(state.activeJury);
      if (!juryAccessIsCurrent()) return;
    }
    const submitter = event.submitter;
    const destination = submitter?.value || "stay";
    const payload = miniProjectPayloadFromForm(event.target);
    if (!payload) return;
    clearTimeout(miniAutosaveTimer);
    await saveMiniProjectDraft(event.target, { force: true, toast: true });

    if (destination === "dashboard") miniProjectDashboard();
    else miniProjectReviewView(payload.group.id);
  }

  if (event.target.id === "group-review-form") {
    const submitter = event.submitter;
    const data = Object.fromEntries(new FormData(event.target));
    data.destination = submitter?.value || data.destination || "next";

    const group = groupById(event.target.dataset.group);
    const qid = Number(event.target.dataset.q);
    const question = state.data.questions.find(item => item.id === qid);
    const marksAwarded = normalizeMark(data.marksAwarded, question?.maxMarks);
    if (marksAwarded === null) return alert("Choose a valid mark.");
    data.marksAwarded = String(marksAwarded);
    state.groupCorrections[correctionKey(group.id, qid)] = {
      status: markStatus(marksAwarded, question?.maxMarks),
      workState: "completed",
      marksAwarded,
      maxMarks: question?.maxMarks ?? null,
      correction: data.correction,
      groupRemark: data.groupRemark,
      mentorName: state.activeMentor,
      updatedAt: new Date().toISOString()
    };
    group.participants.forEach(person => {
      const value = data[`remark::${person}`]?.trim();
      const key = remarkKey(group.id, person, qid);
      if (value) state.individualRemarks[key] = { remark: value, mentorName: state.activeMentor, updatedAt: new Date().toISOString() };
      else delete state.individualRemarks[key];
    });
    save();

    try {
      await persistReview(group, qid, data);
      showToast(savedOnlineMessage("Review"));
    } catch (error) {
      console.error("Save failed", error);
      state.syncStatus = "error";
      save();
      showToast(friendlyError(error, localSyncIssueMessage("update the shared dashboard")));
    }

    if (data.destination === "dashboard" || qid === state.data.questions.length) mentorDashboard();
    else correctionView(group.id, qid + 1);
  }

  if (event.target.id === "mada-jury-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await addMadaJuryAsAdmin(data.madaJuryName || "", data.madaJuryOffice || "");
      showToast("✓ Spoon Madagascar jury added");
      madaAdminPage();
    } catch (error) {
      showToast(friendlyError(error, "Could not add jury. Try again."));
    }
  }

  if (event.target.id === "mada-jury-rename-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await renameMadaJuryAsAdmin(data.oldMadaJuryName || "", data.newMadaJuryName || "", data.newMadaJuryOffice || "");
      showToast("✓ Spoon Madagascar jury renamed");
      madaAdminPage();
    } catch (error) {
      showToast(friendlyError(error, "Could not rename jury. Try again."));
    }
  }

  if (event.target.id === "mada-topic-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await saveMadaAssignmentsAsAdmin(data);
      showToast(updatedOnlineMessage("Spoon Madagascar group titles"));
      madaAdminPage();
    } catch (error) {
      console.error("Spoon Madagascar title save failed", error);
      showToast(friendlyError(error, "Could not save group titles. Try again."));
    }
  }

  if (event.target.classList.contains("admin-mada-review-form")) {
    const group = madaGroupById(event.target.dataset.madaGroup);
    const data = Object.fromEntries(new FormData(event.target));
    const review = {
      groupId: Number(event.target.dataset.madaGroup),
      groupName: group?.name || `Group ${event.target.dataset.madaGroup}`,
      juryName: event.target.dataset.madaJury,
      scores: Object.fromEntries(madaCriteria.map(criterion => [criterion.key, normalizeMark(data[criterion.key], criterion.max) || 0])),
      groupNote: data.groupNote || "",
      individualNotes: madaIndividualNotesFromForm(group, data)
    };

    try {
      await persistMadaReviewAsAdmin(review);
      showToast("✓ Spoon Madagascar jury feedback updated");
      madaAdminPage();
    } catch (error) {
      console.error("Admin Spoon Madagascar jury feedback update failed", error);
      showToast(friendlyError(error, "Could not update jury feedback. Try again."));
    }
  }

  if (event.target.id === "mada-review-form") {
    const submitter = event.submitter;
    const destination = submitter?.value || "stay";
    const payload = madaReviewPayloadFromForm(event.target);
    if (!payload) return;
    const { group, data, scores, individualNotes } = payload;
    state.madaReviews[madaReviewKey(group.id, state.activeMadaJury)] = {
      groupId: group.id,
      groupName: group.name,
      juryName: state.activeMadaJury,
      scores,
      groupNote: data.groupNote || "",
      individualNotes,
      updatedAt: new Date().toISOString()
    };
    save();

    try {
      await persistMadaReview(group, data);
      showToast(savedOnlineMessage("Spoon Madagascar review"));
    } catch (error) {
      console.error("Spoon Madagascar review save failed", error);
      state.syncStatus = "error";
      save();
      showToast(friendlyError(error, localSyncIssueMessage("update the shared review")));
    }

    if (destination === "dashboard") madaJuryDashboard();
    else madaJuryReviewView(group.id);
  }
});

document.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button) {
    if (event.target.classList?.contains("photo-viewer")) closePhotoViewer();
    return;
  }

  if (button.dataset.scrollTarget) {
    document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (button.dataset.photoUrl) {
    openPhotoViewer(button.dataset.photoUrl, button.dataset.photoName || "Participant");
    return;
  }
  if (button.dataset.copyText !== undefined) {
    try {
      await copyTextToClipboard(button.dataset.copyText);
      showToast("Copied");
    } catch (error) {
      showToast("Could not copy automatically. Select the code and copy it manually.");
    }
    return;
  }
  if (button.dataset.regenerateStakeholderCode) {
    const eventKey = button.dataset.regenerateStakeholderCode;
    const ok = confirm(`Regenerate the ${stakeholderEventLabel(eventKey)} stakeholder link? The old stakeholder URL will stop working.`);
    if (!ok) return;

    try {
      await regenerateStakeholderAccessCode(eventKey);
      showToast(`✓ New stakeholder link generated for ${stakeholderEventLabel(eventKey)}`);
      eventKey === "madagascar" ? madaAdminPage() : adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not regenerate stakeholder link. Try again."));
    }
    return;
  }
  if (button.dataset.revokeStakeholderAccess) {
    const eventKey = button.dataset.revokeStakeholderAccess;
    const ok = confirm(`Revoke ${stakeholderEventLabel(eventKey)} stakeholder dashboard access? The current URL and code will stop opening the dashboard.`);
    if (!ok) return;

    try {
      await setStakeholderAccessActive(eventKey, false);
      showToast(`✓ ${stakeholderEventLabel(eventKey)} stakeholder access revoked`);
      eventKey === "madagascar" ? madaAdminPage() : adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not revoke stakeholder access."));
    }
    return;
  }
  if (button.dataset.enableStakeholderAccess) {
    const eventKey = button.dataset.enableStakeholderAccess;
    try {
      await setStakeholderAccessActive(eventKey, true);
      showToast(`✓ ${stakeholderEventLabel(eventKey)} stakeholder access enabled`);
      eventKey === "madagascar" ? madaAdminPage() : adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not enable stakeholder access."));
    }
    return;
  }
  if (button.dataset.previewStakeholder) {
    const eventKey = button.dataset.previewStakeholder;
    const { privateUrl } = stakeholderAccessDetails(eventKey);
    location.href = privateUrl;
    return;
  }
  if (button.dataset.regenerateMentorCode) {
    const name = button.dataset.regenerateMentorCode;
    const ok = confirm(`Regenerate ${name}'s mentor access code? Their old code will stop being the shared current code.`);
    if (!ok) return;

    try {
      await regenerateMentorAccessCode(name);
      showToast(`✓ New code generated for ${name}`);
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not regenerate mentor code. Try again."));
    }
    return;
  }
  if (button.dataset.regenerateAllMentorCodes !== undefined) {
    const ok = confirm("Regenerate all mentor access codes? You will need to share the new codes with every mentor.");
    if (!ok) return;

    try {
      await regenerateAllMentorAccessCodes();
      showToast("✓ All mentor codes regenerated");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not regenerate mentor codes. Try again."));
    }
    return;
  }
  if (button.dataset.regenerateJuryCode) {
    const name = button.dataset.regenerateJuryCode;
    const ok = confirm(`Regenerate ${name}'s jury access code? Their old private URL will stop working.`);
    if (!ok) return;

    try {
      await regenerateJuryAccessCode(name);
      showToast(`✓ New jury code generated for ${name}`);
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not regenerate jury code. Try again."));
    }
    return;
  }
  if (button.dataset.regenerateAllJuryCodes !== undefined) {
    const ok = confirm("Regenerate all jury access codes? You will need to share the new jury links.");
    if (!ok) return;

    try {
      await regenerateAllJuryAccessCodes();
      showToast("✓ All jury codes regenerated");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not regenerate jury codes. Try again."));
    }
    return;
  }
  if (button.dataset.makeJuryPublic !== undefined) {
    const ok = confirm("Make jury access public? Jury members will be able to enter without private codes until you revoke it.");
    if (!ok) return;

    try {
      await setJuryAccessPublic(true);
      showToast("✓ Jury access is public");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not make jury access public."));
    }
    return;
  }
  if (button.dataset.revokeJuryPublic !== undefined) {
    const ok = confirm("Revoke public jury access and require private jury codes again?");
    if (!ok) return;

    try {
      await setJuryAccessPublic(false);
      state.juryAccessUnlocked = false;
      state.juryAccessCode = "";
      state.juryAccessJury = "";
      showToast("✓ Public jury access revoked");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not revoke public jury access."));
    }
    return;
  }
  if (button.dataset.action === "close-photo") {
    closePhotoViewer();
    return;
  }
  if (button.dataset.action === "logout") await signOutAdmin();
  if (button.dataset.action === "admin-login") {
    location.hash = "admin";
    save();
    loginView();
  }
  if (button.dataset.action === "return-current") dashboard();
  if (button.dataset.action === "public-form") openPublicForm();
  if (button.dataset.action === "refresh-stakeholder") {
    clearStakeholderAISummaries(button.dataset.eventKey || "mauritius");
    await loadSharedData({ includeAdminData: false });
    stakeholderDashboard(button.dataset.eventKey || "mauritius");
    showToast("✓ Stakeholder data refreshed");
    return;
  }
  if (button.dataset.action === "stakeholder-summary") {
    const eventKey = button.dataset.eventKey || "mauritius";
    try {
      showToast(remoteEnabled() ? "Generating AI summary..." : "Generating local stakeholder summary...");
      await generateStakeholderOpinion(eventKey);
      stakeholderDashboard(eventKey);
      showToast("✓ Stakeholder opinion ready");
    } catch (error) {
      console.error("Stakeholder summary failed", error);
      showToast(friendlyError(error, "Could not generate the stakeholder opinion."));
    }
    return;
  }
  if (button.dataset.action === "admin-stakeholder-summary") {
    const eventKey = button.dataset.eventKey || "mauritius";
    try {
      clearStakeholderAISummaries(eventKey);
      showToast("Generating stakeholder AI summary...");
      await generateStakeholderOpinion(eventKey);
      await loadSharedData({ includeAdminData: true });
      showToast("✓ AI usage updated");
      if (eventKey === "madagascar") madaAdminPage();
      else adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Admin stakeholder summary failed", error);
      showToast(friendlyError(error, "Could not generate stakeholder AI summary. Check the Edge Function and secrets."));
    }
    return;
  }
  if (button.dataset.action === "admin-table") {
    location.hash = "admin-table";
    if (state.session?.role !== "admin") return loginView();
    adminTablePage();
    return;
  }
  if (button.dataset.action === "admin-dashboard") {
    location.hash = "admin";
    if (state.session?.role !== "admin") return loginView();
    adminDashboard(lastAdminMentor);
    return;
  }
  if (button.dataset.action === "mini-project") {
    openMiniProject();
    return;
  }
  if (button.dataset.action === "mini-dashboard") {
    if (!state.juryAccessPublic && !juryAccessIsCurrent()) return miniProjectLanding();
    miniProjectDashboard();
    return;
  }
  if (button.dataset.action === "dashboard") dashboard();
  if (button.dataset.action === "toggle-answer") {
    const panel = button.closest(".question-card")?.querySelector("[data-answer-panel]");
    panel?.classList.toggle("hidden");
    const isHidden = panel?.classList.contains("hidden");
    button.textContent = isHidden ? "💡 Answer / tests" : "Hide answer / tests";
    return;
  }
  if (button.dataset.markValue) {
    const picker = button.closest(".mark-picker");
    const select = picker?.querySelector("[data-mark-select]");
    if (!select) return;
    select.value = button.dataset.markValue;
    picker.querySelectorAll(".mark-chip").forEach(chip => chip.classList.toggle("active", chip === button));
    return;
  }
  if (button.dataset.clearNote) {
    const form = button.closest("#mini-project-form");
    if (!form) return;
    if (button.dataset.clearNote === "group") {
      const note = form.querySelector('textarea[name="groupNote"]');
      if (note) note.value = "";
    }
    if (button.dataset.clearNote === "individual") {
      form.querySelectorAll('textarea[name^="miniNote::"]').forEach(note => { note.value = ""; });
    }
    queueMiniProjectAutosave(form, 250);
    showToast(button.dataset.clearNote === "group" ? "Group note cleared" : "Individual notes cleared");
    return;
  }
  if (button.dataset.mentor) {
    if (state.activeMentor === button.dataset.mentor && mentorAccessIsCurrent()) return;
    state.activeMentor = button.dataset.mentor;
    state.mentorAccessUnlocked = false;
    state.mentorAccessCode = "";
    state.mentorAccessMentor = "";
    state.session = null;
    save();
    await promptForMentorCode(state.activeMentor);
    return;
  }
  if (button.dataset.jury) {
    state.activeJury = button.dataset.jury;
    state.juryAccessUnlocked = false;
    state.juryAccessCode = "";
    state.juryAccessJury = "";
    state.session = { name: state.activeJury, role: "jury" };
    save();
    await promptForJuryCode(state.activeJury);
    return;
  }
  if (button.dataset.miniGroup) {
    if (!state.juryAccessPublic && !juryAccessIsCurrent()) {
      await promptForJuryCode(state.activeJury);
      if (!juryAccessIsCurrent()) return;
    }
    miniProjectReviewView(button.dataset.miniGroup);
    return;
  }
  if (button.dataset.groupReview) {
    if (!mentorAccessIsCurrent()) {
      state.mentorAccessUnlocked = false;
      state.mentorAccessCode = "";
      state.mentorAccessMentor = "";
      state.session = null;
      save();
      await promptForMentorCode(state.activeMentor);
      if (!mentorAccessIsCurrent()) return;
      const group = groupById(button.dataset.groupReview);
      const qid = Number(button.dataset.resumeQ || 1);
      await markQuestionInProgress(group, qid);
      correctionView(group.id, qid);
      return;
    }
    const group = groupById(button.dataset.groupReview);
    const qid = Number(button.dataset.resumeQ || 1);
    await markQuestionInProgress(group, qid);
    correctionView(group.id, qid);
  }
  if (button.dataset.groupQ) {
    if (!mentorAccessIsCurrent()) {
      state.mentorAccessUnlocked = false;
      state.mentorAccessCode = "";
      state.mentorAccessMentor = "";
      state.session = null;
      save();
      await promptForMentorCode(state.activeMentor);
      if (!mentorAccessIsCurrent()) return;
      const group = groupById(button.dataset.groupQ);
      const qid = Number(button.dataset.q);
      await markQuestionInProgress(group, qid);
      correctionView(group.id, qid);
      return;
    }
    const group = groupById(button.dataset.groupQ);
    const qid = Number(button.dataset.q);
    await markQuestionInProgress(group, qid);
    correctionView(group.id, qid);
  }
  if (button.dataset.deleteCorrection) {
    const [groupId, qid] = button.dataset.deleteCorrection.split("|").map(Number);
    const ok = confirm(`Remove the correction and individual remarks for Group ${groupId}, Question ${qid}?`);
    if (!ok) return;

    try {
      await deleteCorrectionAsAdmin(groupId, qid);
      showToast("✓ Correction removed");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Delete correction failed", error);
      showToast(friendlyError(error, "Could not remove correction. Try again."));
    }
  }
  if (button.dataset.deleteMentor) {
    const name = button.dataset.deleteMentor;
    const ok = confirm(`Delete ${name} from the active mentor list? Existing corrections will keep their attribution.`);
    if (!ok) return;

    try {
      await deleteMentorAsAdmin(name);
      showToast("✓ Mentor deleted");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not delete mentor. Try again."));
    }
  }
  if (button.dataset.deleteJury) {
    const name = button.dataset.deleteJury;
    const ok = confirm(`Delete ${name} from the active jury list? Existing mini-project feedback will keep its attribution unless you delete the feedback separately.`);
    if (!ok) return;

    try {
      await deleteJuryAsAdmin(name);
      showToast("✓ Jury deleted");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(friendlyError(error, "Could not delete jury. Try again."));
    }
  }
  if (button.dataset.deleteMiniReview) {
    const [groupId, juryName] = button.dataset.deleteMiniReview.split("|");
    const group = groupById(groupId);
    const ok = confirm(`Delete ${juryName}'s mini-project feedback for ${group?.name || `Group ${groupId}`}? This removes points, group note, and individual notes for that jury entry.`);
    if (!ok) return;

    try {
      await deleteMiniReviewAsAdmin(Number(groupId), juryName);
      showToast("✓ Jury feedback deleted");
      refreshAdminMiniProjectView();
    } catch (error) {
      console.error("Delete jury feedback failed", error);
      showToast(friendlyError(error, "Could not delete jury feedback. Try again."));
    }
  }
  if (button.dataset.clearMiniScores) {
    const [groupId, juryName] = button.dataset.clearMiniScores.split("|");
    const review = state.miniProjectReviews[miniReviewKey(groupId, juryName)];
    if (!review) return;
    const ok = confirm(`Clear only the points from ${juryName}'s mini-project feedback? Notes will stay.`);
    if (!ok) return;

    try {
      await persistMiniReviewAsAdmin({
        ...review,
        scores: Object.fromEntries(miniProjectCriteria.map(criterion => [criterion.key, 0]))
      });
      showToast("✓ Jury points cleared");
      refreshAdminMiniProjectView();
    } catch (error) {
      console.error("Clear jury points failed", error);
      showToast(friendlyError(error, "Could not clear jury points. Try again."));
    }
  }
  if (button.dataset.action === "clear-history") {
    const ok = confirm("Clear the recent mentor changes list? This does not delete corrections or remarks.");
    if (!ok) return;

    try {
      await clearRecentChangesAsAdmin();
      showToast("✓ Recent changes cleared");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      console.error("Clear history failed", error);
      showToast(friendlyError(error, "Could not clear recent changes. Try again."));
    }
  }
  if (button.dataset.action === "generate-reports") {
    state.data.groups.forEach(group => {
      state.reports[`group|${group.id}`] = buildGroupSummary(group);
      state.data.questions.forEach(question => state.reports[`question|${group.id}|${question.id}`] = buildQuestionSummary(group, question));
      group.participants.forEach(person => state.reports[`person|${person}`] = buildPersonFeedback(person));
    });
    save();

    try {
      await persistReports();
      showToast(remoteEnabled() ? "✓ Reports saved online" : "✓ Reports generated on this device");
    } catch (error) {
      console.error("Report save failed", error);
      showToast(friendlyError(error, localSyncIssueMessage("save the reports online")));
    }

    adminDashboard(lastAdminMentor);
  }

  if (button.dataset.action === "generate-mada-reports") {
    madaGroups().forEach(group => {
      state.reports[`mada-group|${group.id}`] = buildMadaGroupSummary(group);
      group.participants.forEach(person => state.reports[`mada-person|${person}`] = buildMadaPersonFeedback(person));
    });
    save();

    try {
      await persistMadaReports();
      showToast(remoteEnabled() ? "✓ Spoon Madagascar reports saved online" : "✓ Spoon Madagascar reports generated on this device");
    } catch (error) {
      console.error("Spoon Madagascar report save failed", error);
      showToast(friendlyError(error, localSyncIssueMessage("save the Spoon Madagascar reports online")));
    }

    madaAdminPage();
  }

  if (button.dataset.action === "mada-admin") {
    location.hash = "admin/spoon-madagascar";
    if (state.session?.role !== "admin") return loginView();
    madaAdminPage();
    return;
  }
  if (button.dataset.action === "mada-jury") {
    openMadaJury();
    return;
  }
  if (button.dataset.action === "mada-jury-dashboard") {
    madaJuryDashboard();
    return;
  }
  if (button.dataset.madaJury) {
    if (state.activeMadaJury !== button.dataset.madaJury || state.session?.role !== "jury-mada") {
      state.activeMadaJury = button.dataset.madaJury;
      state.session = { name: state.activeMadaJury, role: "jury-mada" };
      save();
    }
    madaJuryDashboard();
    return;
  }
  if (button.dataset.madaGroup) {
    madaJuryReviewView(button.dataset.madaGroup);
    return;
  }
  if (button.dataset.deleteMadaJury) {
    const name = button.dataset.deleteMadaJury;
    const ok = confirm(`Delete ${madaFirstName(name)} from the active Spoon Madagascar jury list? Existing feedback will keep its attribution.`);
    if (!ok) return;

    try {
      await deleteMadaJuryAsAdmin(name);
      showToast("✓ Spoon Madagascar jury deleted");
      madaAdminPage();
    } catch (error) {
      showToast(friendlyError(error, "Could not delete jury. Try again."));
    }
  }
  if (button.dataset.deleteMadaReview) {
    const [groupId, juryName] = button.dataset.deleteMadaReview.split("|");
    const group = madaGroupById(groupId);
    const ok = confirm(`Delete ${madaFirstName(juryName)}'s Spoon Madagascar feedback for ${group?.name || `Group ${groupId}`}?`);
    if (!ok) return;

    try {
      await deleteMadaReviewAsAdmin(Number(groupId), juryName);
      showToast("✓ Spoon Madagascar jury feedback deleted");
      madaAdminPage();
    } catch (error) {
      console.error("Delete Spoon Madagascar jury feedback failed", error);
      showToast(friendlyError(error, "Could not delete jury feedback. Try again."));
    }
  }
});

document.addEventListener("change", event => {
  if (event.target.closest("#mini-project-form")) {
    if (event.target.matches("[data-criteria-input]")) {
      sanitizeCriteriaInput(event.target);
    }
    queueMiniProjectAutosave(event.target.closest("#mini-project-form"), 600);
  }
  if (event.target.closest("#mada-review-form") && event.target.matches("[data-criteria-input]")) {
    sanitizeCriteriaInput(event.target);
  }
  if (event.target.matches("[data-mark-select]")) {
    const picker = event.target.closest(".mark-picker");
    picker?.querySelectorAll(".mark-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.markValue === event.target.value));
    return;
  }
  if (event.target.id !== "mentor-select") return;
  state.activeMentor = event.target.value;
  state.session = { name: state.activeMentor, role: "mentor" };
  save();
  mentorDashboard();
  showToast(`Now reviewing as ${state.activeMentor}`);
});

document.addEventListener("input", event => {
  if (event.target.closest("#mada-review-form") && event.target.matches("[data-criteria-input]")) {
    sanitizeCriteriaInput(event.target);
  }
  const form = event.target.closest?.("#mini-project-form");
  if (!form) return;
  if (event.target.matches("[data-criteria-input]")) sanitizeCriteriaInput(event.target);
  queueMiniProjectAutosave(form, 900);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePhotoViewer();
});

window.addEventListener("hashchange", async () => {
  closePhotoViewer();
  if ((location.hash === "#admin" || location.hash === "#admin-table" || location.hash === "#admin/spoon-madagascar") && state.session?.role !== "admin") {
    const isAdmin = await verifyAdminSession();
    if (isAdmin) await loadSharedData({ includeAdminData: true });
  }
  dashboard();
});

async function boot() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin && (!state.session || state.session.role === "admin")) {
    state.session = location.hash === "#mini-project"
      ? { name: state.activeJury, role: "jury" }
      : location.hash === "#mpm"
        ? { name: state.activeMadaJury, role: "jury-mada" }
        : { name: state.activeMentor, role: "mentor" };
  }
  dashboard();
  await loadSharedData({ includeAdminData: isAdmin });
  subscribeSharedData();
  dashboard();
}

boot();
