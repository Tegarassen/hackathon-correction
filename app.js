const app = document.querySelector("#app");
const cfg = window.SPOON_CONFIG || { demoMode: true };
const supabaseClient = !cfg.demoMode && cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

const defaultMentors = ["Chevish", "Mehreen", "Pratish", "Vinasha", "Diraj", "Ayush", "Ijaaz", "Kevan", "Keshav", "Tega", "Ashutosh", "Semarchy"];
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
    { id: 13, title: "Question 13 — Leet Speak", prompt: "Leet Speak", maxMarks: 3 },
    ...Array.from({ length: 7 }, (_, i) => ({ id: i + 14, title: `Question ${i + 14}`, prompt: "Marks pending — configure when available.", maxMarks: null }))
  ]
};

let state = JSON.parse(localStorage.getItem("spoon-state-v2") || "null") || {};
state = {
  session: state.session || null,
  activeMentor: state.activeMentor || "Chevish",
  mentors: state.mentors || defaultMentors,
  groupCorrections: state.groupCorrections || {},
  individualRemarks: state.individualRemarks || {},
  participantPhotos: state.participantPhotos || {},
  photoUrls: state.photoUrls || {},
  reports: state.reports || {},
  changeHistory: state.changeHistory || [],
  syncStatus: "loading",
  juryName: state.juryName || null,
  activeJuryOffice: state.activeJuryOffice || null,
  juryTopics: state.juryTopics || {},
  juryScores: state.juryScores || {},
  juryRemarks: state.juryRemarks || {},
  data: seed
};

if (!state.mentors?.length) state.mentors = defaultMentors;
if (!state.mentors.includes(state.activeMentor)) state.activeMentor = state.mentors[0] || "Mentor";

let lastAdminMentor = "all";
let refreshTimer = null;
let juryRefreshTimer = null;

const saveLocal = () => localStorage.setItem("spoon-state-v2", JSON.stringify(state));
const save = saveLocal;
const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const groupById = id => state.data.groups.find(group => group.id === Number(id));
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
const scoreboard = () => state.data.groups
  .map(group => ({ group, score: groupScore(group), max: knownTotalMarks() }))
  .sort((a, b) => b.score - a.score);

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

// ===================================================================================
// Mada Jury — parallel feature for the Madagascar mini-project hackathon jury flow.
// This is a completely separate concept from the Spoon mentor correction flow above:
// separate seed data, separate state keys, separate Supabase tables. Nothing above
// this block or in the mentor-correction views/handlers is modified by this feature.
// ===================================================================================

const juryOffices = ["Diego", "Fina", "Tana"];

const juryTopics = [
  {
    id: 1,
    title: "Cyclone Ready Mada: Helping Citizens Prepare, Report, and Recover",
    description: "Design and implement an app that helps citizens in Madagascar prepare for cyclones, receive safety alerts, find nearby shelters, report damage, and access recovery information after disasters such as Cyclone Gezani and Cyclone Fytia."
  },
  {
    id: 2,
    title: "Food Wise Madagascar: Understanding Food Prices and Hunger Risks",
    description: "Design and implement an app that helps citizens and authorities understand food prices and hunger risks across Madagascar."
  },
  {
    id: 3,
    title: "Water & Power Watch Mada: Helping Citizens Track Service Cuts",
    description: "Design and implement an app that helps citizens track water and power service cuts across Madagascar."
  }
];

const juryCriteria = [
  { key: "usability", label: "Usability", prompt: "Is the app easy to use during urgent cyclone/emergency situations?", bonus: false },
  { key: "content", label: "Content", prompt: "Is the disaster information accurate, simple, practical, and relevant to Madagascar?", bonus: false },
  { key: "interactivity", label: "Interactivity", prompt: "Are users able to check alerts, complete emergency checklists, report damages, or find shelters on a map?", bonus: false },
  { key: "design", label: "Design", prompt: "Is the app visually clear, serious, accessible, and suitable for emergency communication?", bonus: false },
  { key: "performance", label: "Performance", prompt: "Does the app load quickly and work well on mobile devices? (Also consider whether a backend stores cyclone alerts, shelter locations, emergency contacts, and citizen reports.)", bonus: false },
  { key: "innovation", label: "Innovation", prompt: "Does the app offer a useful and creative way to help citizens before, during, and after cyclones?", bonus: false },
  { key: "collaboration", label: "Collaboration", prompt: "Were effective collaboration tools and practices used during development?", bonus: false },
  { key: "bonus_ai", label: "Bonus — AI integration", prompt: "Integrate AI to explain cyclone warnings in simple language and generate personalised safety advice for families, students, elderly people, and people living in high-risk areas.", bonus: true }
];

const juryMembersSeed = [
  { name: "Jhonny Raherison", office: "Tana" },
  { name: "Tojonirina Rarivoarison (Tojo)", office: "Tana" },
  { name: "Gianna Ramasombazaha", office: "Tana" },
  { name: "Joël Randrianarivelo", office: "Tana" },
  { name: "Kintana Andriambololona", office: "Fina" },
  { name: "Tovonirina Andrianarivelo (Tovo)", office: "Fina" },
  { name: "Ya'sin Figuelia", office: "Diego" },
  { name: "Hermeland Botrahaly", office: "Diego" }
];

const juryGroupsSeed = [
  { id: 1, office: "Diego", name: "Diego · Group 1", participants: ["ANDRY Nizwami Ibrahim", "RANAIVOSOA Edwino"] },
  { id: 2, office: "Fina", name: "Fina · Group 1", participants: ["ANDRITIANA Saotra Idealilalaina", "RAZAFINATOANDRO Ando Henri", "ANDRIANTSILAVINA Tsiferana Heritsilavo", "AMBOARAMPITIAVANA Nomena Sarobidy"] },
  { id: 3, office: "Fina", name: "Fina · Group 2", participants: ["RAKOTONIRINA Andrianina Laïscia", "BEMAZAVA julio", "RALAIVAO Ambinintsoa Francky", "VALISOAFANDRESENA Setraniaina Andriamampiandra"] },
  { id: 4, office: "Tana", name: "Tana · Group 1", participants: ["ANDRIANARIVONY Zo Michaël", "RAKOTOARISOA Andy Ny Rindra", "MBOLATSIORY Rihantiana Tiarintsoa", "VOLOLONIRINA Doris Sylvie", "RANDRIANARIVELO Stéphan"] },
  { id: 5, office: "Tana", name: "Tana · Group 2", participants: ["MAMPIONONA Njakarimanana Nerson", "RABENARIVO Ryan Lizka", "Rakotonirina Tahina Fanomezantsoa", "RAZAFIMAMY Antonino Iraky Ny Avo", "RATOVONJOELY Ny Ando Irintsoa"] }
];

const juryGroupById = id => juryGroupsSeed.find(group => group.id === Number(id));
const juryGroupsForOffice = office => juryGroupsSeed.filter(group => group.office === office);
const juryScoreKey = (groupId, criterionKey) => `${groupId}|${criterionKey}`;
const juryRemarkKeyFor = (groupId, juryName) => `${groupId}|${juryName}`;
const juryBaseCriteria = () => juryCriteria.filter(c => !c.bonus);
const juryBonusCriterion = () => juryCriteria.find(c => c.bonus);
const juryGroupTopic = groupId => state.juryTopics[groupId] || null;
const juryGroupBaseTotal = groupId => juryBaseCriteria().reduce((sum, c) => sum + (Number(state.juryScores[juryScoreKey(groupId, c.key)]?.score) || 0), 0);
const juryGroupBonus = groupId => {
  const bonus = juryBonusCriterion();
  return Number(state.juryScores[juryScoreKey(groupId, bonus.key)]?.score) || 0;
};
const juryGroupComplete = groupId => juryBaseCriteria().every(c => {
  const entry = state.juryScores[juryScoreKey(groupId, c.key)];
  return entry && entry.score !== null && entry.score !== undefined;
});
const juryGroupAnyScore = groupId => juryCriteria.some(c => Boolean(state.juryScores[juryScoreKey(groupId, c.key)]));

function applyJuryTopicRow(row) {
  if (!row) return;
  state.juryTopics[row.group_id] = { topicId: row.topic_id, juryName: row.jury_name || "", updatedAt: row.updated_at };
}

function removeJuryTopicRow(row) {
  if (!row) return;
  delete state.juryTopics[row.group_id];
}

function applyJuryScoreRow(row) {
  if (!row) return;
  state.juryScores[juryScoreKey(row.group_id, row.criterion_key)] = {
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    maxScore: row.max_score ?? 10,
    label: row.criterion_label || "",
    juryName: row.jury_name || "",
    updatedAt: row.updated_at
  };
}

function removeJuryScoreRow(row) {
  if (!row) return;
  delete state.juryScores[juryScoreKey(row.group_id, row.criterion_key)];
}

function applyJuryRemarkRow(row) {
  if (!row) return;
  const key = juryRemarkKeyFor(row.group_id, row.jury_name);
  if (row.remark?.trim()) state.juryRemarks[key] = { remark: row.remark, updatedAt: row.updated_at };
  else delete state.juryRemarks[key];
}

function removeJuryRemarkRow(row) {
  if (!row) return;
  delete state.juryRemarks[juryRemarkKeyFor(row.group_id, row.jury_name)];
}

async function loadJuryData() {
  if (!remoteEnabled()) return;

  try {
    const [topics, scores, remarks] = await Promise.all([
      supabaseClient.from("jury_group_topics").select("*"),
      supabaseClient.from("jury_scores").select("*"),
      supabaseClient.from("jury_remarks").select("*")
    ]);
    if (topics.error) throw topics.error;
    if (scores.error) throw scores.error;
    if (remarks.error) throw remarks.error;

    state.juryTopics = {};
    state.juryScores = {};
    state.juryRemarks = {};
    (topics.data || []).forEach(applyJuryTopicRow);
    (scores.data || []).forEach(applyJuryScoreRow);
    (remarks.data || []).forEach(applyJuryRemarkRow);
    saveLocal();
  } catch (error) {
    console.warn("Could not load Mada Jury tables. Run supabase_mada_jury.sql to set them up.", error);
  }
}

function scheduleJuryRefresh() {
  clearTimeout(juryRefreshTimer);
  juryRefreshTimer = setTimeout(() => {
    saveLocal();
    if (!location.hash.startsWith("#jury")) return;
    if (document.querySelector("#jury-group-form")) return;
    juryRouter();
  }, 350);
}

function subscribeJuryData() {
  if (!remoteEnabled()) return;

  supabaseClient
    .channel("mada-jury")
    .on("postgres_changes", { event: "*", schema: "public", table: "jury_group_topics" }, payload => {
      if (payload.eventType === "DELETE") removeJuryTopicRow(payload.old);
      else applyJuryTopicRow(payload.new);
      scheduleJuryRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "jury_scores" }, payload => {
      if (payload.eventType === "DELETE") removeJuryScoreRow(payload.old);
      else applyJuryScoreRow(payload.new);
      scheduleJuryRefresh();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "jury_remarks" }, payload => {
      if (payload.eventType === "DELETE") removeJuryRemarkRow(payload.old);
      else applyJuryRemarkRow(payload.new);
      scheduleJuryRefresh();
    })
    .subscribe();
}

async function persistJuryTopic(groupId, topicId) {
  state.juryTopics[groupId] = { topicId, juryName: state.juryName, updatedAt: new Date().toISOString() };
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("jury_group_topics")
    .upsert({ group_id: groupId, topic_id: topicId, jury_name: state.juryName }, { onConflict: "group_id" });
  if (error) throw error;
}

async function persistJuryScores(groupId, scoresByKey) {
  Object.entries(scoresByKey).forEach(([key, value]) => {
    const criterion = juryCriteria.find(c => c.key === key);
    state.juryScores[juryScoreKey(groupId, key)] = {
      score: value,
      maxScore: 10,
      label: criterion?.label || key,
      juryName: state.juryName,
      updatedAt: new Date().toISOString()
    };
  });
  saveLocal();

  if (!remoteEnabled()) return;

  const rows = Object.entries(scoresByKey).map(([key, value]) => {
    const criterion = juryCriteria.find(c => c.key === key);
    return {
      group_id: groupId,
      criterion_key: key,
      criterion_label: criterion?.label || key,
      score: value,
      max_score: 10,
      jury_name: state.juryName
    };
  });

  const { error } = await supabaseClient.from("jury_scores").upsert(rows, { onConflict: "group_id,criterion_key" });
  if (error) throw error;
}

async function persistJuryRemark(groupId, remarkText) {
  const key = juryRemarkKeyFor(groupId, state.juryName);
  const clean = (remarkText || "").trim();
  if (clean) state.juryRemarks[key] = { remark: clean, updatedAt: new Date().toISOString() };
  else delete state.juryRemarks[key];
  saveLocal();

  if (!remoteEnabled()) return;

  if (!clean) {
    const { error } = await supabaseClient
      .from("jury_remarks")
      .delete()
      .eq("group_id", groupId)
      .eq("jury_name", state.juryName);
    if (error) throw error;
    return;
  }

  const { error } = await supabaseClient
    .from("jury_remarks")
    .upsert({ group_id: groupId, jury_name: state.juryName, remark: clean }, { onConflict: "group_id,jury_name" });
  if (error) throw error;
}

function juryMarkPickerView(criterion, value) {
  const max = 10;
  const selected = value === null || value === undefined || value === "" ? "" : Number(value);
  const values = Array.from({ length: max + 1 }, (_, index) => index);

  return `<div class="mark-picker">
    <label>${esc(criterion.label)}${criterion.bonus ? `<span class="ai-badge bonus-badge">Bonus · not counted in base 70</span>` : ""} <small class="optional">Choose from 0 to ${max}</small></label>
    <p class="question-hint">${esc(criterion.prompt)}</p>
    <div class="mark-chips" aria-label="Score buttons for ${esc(criterion.label)}">
      ${values.map(item => `<button type="button" class="mark-chip ${selected === item ? "active" : ""}" data-jury-mark-value="${item}" data-jury-criterion="${esc(criterion.key)}">${item}</button>`).join("")}
    </div>
    <input type="hidden" name="score::${esc(criterion.key)}" value="${selected === "" ? "" : selected}" data-jury-score-input="${esc(criterion.key)}">
  </div>`;
}

function juryOfficeScoreboardView(office) {
  const groups = juryGroupsForOffice(office);
  const maxBase = juryBaseCriteria().length * 10;
  const rows = groups
    .map(group => ({ group, base: juryGroupBaseTotal(group.id), bonus: juryGroupBonus(group.id) }))
    .sort((a, b) => (b.base + b.bonus) - (a.base + a.bonus));

  return `<article class="card report-card scoreboard-card"><div class="report-heading"><div><p class="eyebrow">${esc(office)} scoreboard</p><h2>${rows[0] && rows[0].base > 0 ? `${esc(rows[0].group.name)} is leading` : "No scores yet"}</h2></div><span class="ai-badge">${maxBase} base + 10 bonus</span></div><div class="scoreboard-list">${rows.map((row, index) => `<div class="${index === 0 && row.base > 0 ? "leader" : ""}"><span>${index + 1}</span><strong>${esc(row.group.name)}</strong><meter min="0" max="${maxBase}" value="${row.base}"></meter><b>${row.base}/${maxBase} <span class="bonus-tag">+${row.bonus} bonus</span></b></div>`).join("")}</div></article>`;
}

const juryFirstName = (name = "") => String(name).replace(/\(.*?\)/g, "").trim().split(/\s+/)[0] || name;

function juryNameView() {
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Jury steps"><span class="active">1 <b>Jury member</b></span><i></i><span>2 <b>Office</b></span><i></i><span>3 <b>Score groups</b></span></nav><section class="mentor-choice"><p class="eyebrow orange-eyebrow">Mada Jury</p><h1>Choose your name</h1><p>Tap your name below. We’ll remember it on this device.</p><div class="mentor-tabs" aria-label="Jury members">${juryMembersSeed.map(member => `<button class="mentor-tab ${state.juryName === member.name ? "active" : ""}" data-jury-name="${esc(member.name)}"><span>${esc(member.name.slice(0, 1))}</span>${esc(juryFirstName(member.name))}<small class="optional">${esc(member.office)} office</small></button>`).join("")}</div></section></main>`);
}

function juryOfficeView() {
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Jury steps"><span class="done">✓ <b>Jury member</b></span><i></i><span class="active">2 <b>Office</b></span><i></i><span>3 <b>Score groups</b></span></nav><section class="mentor-choice"><p class="eyebrow orange-eyebrow">Mada Jury · ${esc(state.juryName)}</p><h1>Choose an office</h1><p>We couldn't find your office automatically — pick it below.</p></section><div class="status-row jury-office-row">${juryOffices.map(office => `<button class="status jury-office-card ${state.activeJuryOffice === office ? "selected" : ""}" data-jury-office="${esc(office)}"><strong>${esc(office)}</strong><small>${juryGroupsForOffice(office).length} group(s)</small></button>`).join("")}</div><p class="help-line"><button class="back-link" data-action="jury-change-name">← Change jury name</button></p></main>`);
}

function juryGroupListView() {
  const office = state.activeJuryOffice;
  const groups = juryGroupsForOffice(office);
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Jury steps"><span class="done">✓ <b>Jury member</b></span><i></i><span class="done">✓ <b>${esc(office)}</b></span><i></i><span class="active">3 <b>Score groups</b></span></nav><section class="group-heading"><div><span class="selected-mentor"><i>${esc(state.juryName.slice(0, 1))}</i> Judging as <strong>${esc(state.juryName)}</strong> · ${esc(office)}</span><h2>Choose a group</h2></div><div class="status-key"><span><i class="new"></i>Not started</span><span><i class="started"></i>In progress</span><span><i class="complete"></i>Complete</span></div></section><section class="group-list">${groups.map(group => {
    const complete = juryGroupComplete(group.id);
    const anyScore = juryGroupAnyScore(group.id);
    const tone = complete ? "complete" : anyScore ? "started" : "new";
    const label = complete ? "Complete" : anyScore ? "In progress" : "Not started";
    const topicEntry = juryGroupTopic(group.id);
    const topicTitle = topicEntry ? (juryTopics.find(t => t.id === topicEntry.topicId)?.title || "Unknown topic") : "No topic chosen yet";
    return `<button class="group-row" data-jury-group="${group.id}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small>${group.participants.length} participant(s) · ${esc(topicTitle)}</small></span><span class="group-status ${tone}"><i></i>${label}<small>${juryGroupBaseTotal(group.id)}/${juryBaseCriteria().length * 10} base</small></span><span class="row-arrow">→</span></button>`;
  }).join("")}</section>${juryOfficeScoreboardView(office)}<p class="help-line"><button class="back-link" data-action="jury-change-name">← Change jury name</button></p></main>`);
}

function juryGroupView(groupId) {
  const group = juryGroupById(groupId);
  if (!group) return juryGroupListView();
  if (state.activeJuryOffice !== group.office) {
    state.activeJuryOffice = group.office;
    saveLocal();
  }

  const office = group.office;
  const topicEntry = juryGroupTopic(group.id);
  const myRemark = state.juryRemarks[juryRemarkKeyFor(group.id, state.juryName)]?.remark || "";
  const baseTotal = juryGroupBaseTotal(group.id);
  const bonusTotal = juryGroupBonus(group.id);
  const maxBase = juryBaseCriteria().length * 10;

  shell(`<main class="page guided-review"><nav class="journey" aria-label="Jury steps"><span class="done">✓ <b>Jury member</b></span><i></i><span class="done">✓ <b>${esc(office)}</b></span><i></i><span class="active">3 <b>${esc(group.name)}</b></span></nav><div class="review-toolbar"><button class="back-link" data-action="jury-back-groups">← Change group</button><div class="question-progress"><span>${esc(group.name)}</span><div><i style="width:${Math.min(100, maxBase ? (baseTotal / maxBase) * 100 : 0)}%"></i></div></div><span class="autosave-note">${baseTotal}/${maxBase} base + ${bonusTotal}/10 bonus</span></div><section class="workflow"><form id="jury-group-form" data-jury-group="${group.id}"><article class="card question-card"><p class="eyebrow">${esc(group.name)} · Judging as ${esc(state.juryName)}</p><h1>${esc(group.name)}</h1><p class="subtle">Participants: ${group.participants.map(esc).join(", ")}</p><div class="section-label"><span>1</span><div><strong>Project topic</strong><small>Editable any time by any jury member</small></div></div><div class="status-row jury-topic-row">${juryTopics.map(topic => `<button type="button" class="status jury-topic-card ${topicEntry?.topicId === topic.id ? "selected" : ""}" data-jury-topic="${topic.id}"><strong>Topic ${topic.id}</strong><small>${esc(topic.title)}</small></button>`).join("")}</div><input type="hidden" name="topicId" value="${topicEntry?.topicId || ""}" data-jury-topic-input><div class="section-label"><span>2</span><div><strong>Score the criteria</strong><small>0–10 per criterion, plus a separate bonus score</small></div></div>${juryCriteria.map(criterion => juryMarkPickerView(criterion, state.juryScores[juryScoreKey(group.id, criterion.key)]?.score)).join("")}<label>Overall remark <small class="optional">Optional — your own note, visible to other jury members</small><textarea class="compact" name="remark" placeholder="Overall impression of this group's project…">${esc(myRemark)}</textarea></label></article><div class="sticky-actions"><button class="secondary" type="button" data-action="jury-back-groups">Back</button><button class="primary" type="submit">Save scores</button></div></form></section>${juryOfficeScoreboardView(office)}</main>`);
}

function juryRouter() {
  const path = location.hash.replace(/^#jury\/?/, "");
  const parts = path.split("/").filter(Boolean);
  if (!state.juryName) return juryNameView();
  // Office is known from the jury member's own record — no separate picker step.
  if (!state.activeJuryOffice) {
    state.activeJuryOffice = juryMembersSeed.find(member => member.name === state.juryName)?.office || null;
    saveLocal();
  }
  if (!state.activeJuryOffice) return juryOfficeView();
  if (parts[0] === "group" && parts[1]) return juryGroupView(Number(parts[1]));
  return juryGroupListView();
}

const allParticipants = () => state.data.groups.flatMap(group => group.participants.map(person => ({ group, person })));
const normalizePhotoName = value => String(value || "")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .replace(/\.[^.]+$/g, "")
  .replace(/[^a-z0-9]+/gi, "")
  .toLowerCase();
const initials = name => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";
const photoFor = person => state.photoUrls?.[person] || "";

function participantAvatar(person, size = "small") {
  const url = photoFor(person);
  return url
    ? `<button type="button" class="photo-open" data-photo-url="${esc(url)}" data-photo-name="${esc(person)}" title="Open ${esc(person)} photo"><img class="participant-photo ${size}" src="${esc(url)}" alt="${esc(person)}" draggable="false" oncontextmenu="return false"></button>`
    : `<span class="participant-photo placeholder ${size}">${esc(initials(person))}</span>`;
}

function participantNameBlock(person) {
  return `<span class="participant-name-block">${participantAvatar(person)}<span>${esc(person)}</span></span>`;
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
  if (!remoteEnabled()) throw new Error("Supabase is required for photo upload.");
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
  if (state.syncStatus === "online") return "Live Supabase";
  if (state.syncStatus === "saving") return "Saving…";
  if (state.syncStatus === "error") return "Sync issue";
  return "Connecting…";
}

function applyGroupCorrectionRow(row) {
  if (!row) return;
  const question = state.data.questions.find(item => item.id === Number(row.question_position));
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

function applyReportRow(row) {
  if (!row) return;
  state.reports[row.report_key] = row.content || "";
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

  if (activeMentors.length) state.mentors = activeMentors;
  if (!state.mentors.includes(state.activeMentor)) state.activeMentor = state.mentors[0] || "Mentor";
  if (state.session?.role === "mentor") state.session.name = state.activeMentor;
}

async function addMentorAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can add mentors.");
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) throw new Error("Enter a mentor name.");
  if (state.mentors.some(mentor => mentor.toLowerCase() === cleanName.toLowerCase())) throw new Error("This mentor already exists.");

  state.mentors = [...state.mentors, cleanName].sort((a, b) => a.localeCompare(b));
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mentors")
    .upsert({ name: cleanName, active: true }, { onConflict: "name" });
  if (error) throw error;
}

async function deleteMentorAsAdmin(name) {
  if (state.session?.role !== "admin") throw new Error("Only admin can delete mentors.");
  if (state.mentors.length <= 1) throw new Error("Keep at least one mentor.");

  state.mentors = state.mentors.filter(mentor => mentor !== name);
  if (state.activeMentor === name) state.activeMentor = state.mentors[0] || "Mentor";
  saveLocal();

  if (!remoteEnabled()) return;

  const { error } = await supabaseClient
    .from("mentors")
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
    throw new Error("This Supabase user is not registered as an admin.");
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
  openPublicForm();
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
    const [mentorsResult, corrections, remarks, photoRecords, reports, history] = await Promise.all([
      supabaseClient.from("mentors").select("*").order("name", { ascending: true }),
      supabaseClient.from("group_corrections").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("individual_remarks").select("*").order("updated_at", { ascending: false }),
      supabaseClient.from("newbie_photos").select("*").order("updated_at", { ascending: false }),
      includeAdminData ? supabaseClient.from("ai_reports").select("*").order("generated_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      includeAdminData ? supabaseClient.from("change_history").select("*").order("changed_at", { ascending: false }).limit(50) : Promise.resolve({ data: [], error: null })
    ]);

    for (const result of [corrections, remarks, reports, history]) {
      if (result.error) throw result.error;
    }
    if (photoRecords.error) console.warn("Could not load newbie_photos table. Run the photo SQL setup when ready.", photoRecords.error);
    if (!mentorsResult.error) applyMentorRows(mentorsResult.data);
    else console.warn("Could not load mentors table; using local mentor list.", mentorsResult.error);

    state.groupCorrections = {};
    state.individualRemarks = {};
    if (includeAdminData) state.reports = {};

    corrections.data.forEach(applyGroupCorrectionRow);
    remarks.data.forEach(applyIndividualRemarkRow);
    applyPhotoRows(photoRecords.error ? [] : photoRecords.data);
    await hydratePhotoUrls();
    if (includeAdminData) {
      reports.data.forEach(applyReportRow);
      state.changeHistory = history.data || [];
    }
    state.syncStatus = "online";
    saveLocal();
  } catch (error) {
    console.error("Supabase load failed", error);
    state.syncStatus = "error";
    saveLocal();
    showToast(error.message ? `Supabase load failed: ${error.message}` : "Could not load Supabase data. Using local copy.");
  }
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    saveLocal();
    if (location.hash.startsWith("#jury")) return;
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
    .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, async () => {
      const { data, error } = await supabaseClient.from("mentors").select("*").order("name", { ascending: true });
      if (!error) {
        applyMentorRows(data);
        scheduleRefresh();
      }
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

function shell(content) {
  const { name, role } = state.session;
  const inJury = location.hash.startsWith("#jury");
  const accountControls = role === "admin"
    ? `<span>${esc(name)}</span><span class="role">Admin</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="logout">Log out</button>`
    : `<span class="role">Spoon mentor form</span><span class="role sync-pill">${esc(syncLabel())}</span><button class="ghost" data-action="admin-login">Admin</button>`;
  const juryNav = inJury
    ? `<button class="ghost" data-action="jury-exit">← Group correction</button>`
    : `<button class="ghost" data-action="jury-home">Mada Jury</button>`;
  app.innerHTML = `<div class="shell"><header class="topbar"><div class="brand"><img class="spoon-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"><span class="product-name">Hackathon Review Hub</span></div><div class="userbox">${juryNav}${accountControls}</div></header>${content}</div>`;
}

function loginView(message = "") {
  app.innerHTML = `<main class="login"><section class="login-art"><div class="brand"><img class="spoon-logo login-logo" src="https://spoonconsulting.com/wp-content/uploads/elementor/thumbs/Logo-Spoon-Spoon-Consulting-2024-scaled-rah72gsdflipzz9bau5ypzlaz4ldjbb0h0vj24z8x8.webp" alt="Spoon Consulting"></div><div><p class="eyebrow">Protected area</p><h1>Admin.<br><span style="color:#12aaa3">Reports.</span><br><span class="orange-text">Insights.</span></h1><p class="subtle login-copy">The Spoon mentor form is for internal review. Consolidated feedback and participant reports remain in the protected administrator area.</p></div><button class="secondary public-return" data-action="public-form">← Return to Spoon mentor form</button></section><section class="login-panel"><form class="login-card" id="login-form"><p class="eyebrow">Supabase administrator access</p><h2>Admin sign in</h2><p class="subtle">Sign in with the admin user registered in Supabase Auth.</p>${message ? `<div class="notice">${esc(message)}</div>` : ""}<label>Email<input name="email" type="email" placeholder="tega@spoon.hackathon" required></label><label>Password<input name="password" type="password" placeholder="••••••••" required></label><button class="primary" type="submit">Sign in</button>${cfg.demoMode ? `<div class="demo-note"><strong>Preview mode</strong><br>Use any email with password <code>admin</code>.</div>` : `<div class="demo-note"><strong>Protected by Supabase</strong><br>Only users listed in <code>admin_users</code> can open admin mode.</div>`}</form></section></main>`;
}

function mentorTabs() {
  return `<div class="mentor-tabs" aria-label="Mentor workspaces">${state.mentors.map(name => `<button class="mentor-tab ${state.activeMentor === name ? "active" : ""}" data-mentor="${name}"><span>${name.slice(0, 1)}</span>${name}</button>`).join("")}</div>`;
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
  shell(`<main class="page simple-page"><nav class="journey" aria-label="Review steps"><span class="active">1 <b>Mentor</b></span><i></i><span>2 <b>Choose group</b></span><i></i><span>3 <b>Submit review</b></span></nav><section class="mentor-choice"><p class="eyebrow orange-eyebrow">Start here</p><h1>Choose your mentor name</h1><p>Tap your name below. We’ll remember it on this device.</p>${mentorTabs()}</section><section class="group-heading"><div><span class="selected-mentor"><i>${state.activeMentor[0]}</i> Reviewing as <strong>${esc(state.activeMentor)}</strong></span><h2>Choose a group</h2></div><div class="status-key"><span><i class="new"></i>Not started</span><span><i class="started"></i>In progress</span><span><i class="complete"></i>Completed</span></div></section><section class="group-list">${state.data.groups.map(group => { const gs = groupState(group); return `<button class="group-row" data-group-review="${group.id}" data-resume-q="${gs.resume}"><span class="group-number">${group.id}</span><span class="group-info"><strong>${esc(group.name)}</strong><small>${group.participants.length} participants · ${gs.completed}/20 questions</small></span><span class="group-status ${gs.tone}"><i></i>${gs.label}<small>${gs.detail}</small></span><span class="row-arrow">→</span></button>`; }).join("")}</section><p class="help-line">In progress groups automatically resume at the first unanswered question. Your review saves securely to Supabase.</p></main>`);
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
  if (!entries.length) return "No mentor corrections have been submitted yet.";
  const score = groupScore(group);
  const max = knownTotalMarks();
  const observations = entries.map(item => item.groupRemark).filter(Boolean);
  return `${entries.length} shared question marks assembled. Current score: ${score}/${max} known marks. ${observations.length ? `Key observations: ${observations.slice(0, 3).join(" · ")}` : "Add group observations to enrich the admin summary."}`;
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
  const rows = scoreboard();
  const leader = rows[0];
  return `<article class="card report-card scoreboard-card"><div class="report-heading"><div><p class="eyebrow">Scoreboard</p><h2>${leader ? `${esc(leader.group.name)} is leading` : "No scores yet"}</h2></div><span class="ai-badge">${knownTotalMarks()} known marks</span></div><div class="scoreboard-list">${rows.map((row, index) => `<div class="${index === 0 && row.score > 0 ? "leader" : ""}"><span>${index + 1}</span><strong>${esc(row.group.name)}</strong><meter min="0" max="${row.max || 1}" value="${row.score}"></meter><b>${row.score}/${row.max}</b></div>`).join("")}</div></article>`;
}

function buildPersonFeedback(person) {
  const remarks = Object.entries(state.individualRemarks)
    .filter(([key, value]) => key.split("|")[1] === person && (typeof value === "string" ? value.trim() : value.remark?.trim()))
    .map(([, value]) => typeof value === "string" ? { mentor: "Mentor", text: value } : { mentor: value.mentorName || "Mentor", text: value.remark });
  if (!remarks.length) return "No individual feedback has been submitted yet.";
  return `${remarks.length} remarks assembled from ${new Set(remarks.map(x => x.mentor)).size} mentor(s). ${remarks.slice(0, 4).map(x => `${x.mentor}: ${x.text}`).join(" · ")}`;
}

function historyList() {
  if (!state.changeHistory.length) return `<p class="subtle">No Supabase history yet. Changes will appear here after mentors save.</p>`;
  return `<div class="mentor-inputs history-list">${state.changeHistory.slice(0, 12).map(item => `<div><span class="avatar">${esc((item.mentor_name || "?").slice(0, 1))}</span><strong>${esc(item.mentor_name || "System")}</strong><small>${esc(item.action)} ${esc(item.table_name)} · ${esc(item.group_name || "")}${item.question_position ? ` · Q${item.question_position}` : ""}<br>${new Date(item.changed_at).toLocaleString()}</small></div>`).join("")}</div>`;
}

function photoManagerView() {
  const participants = allParticipants();
  const uploaded = participants.filter(({ person }) => state.participantPhotos[person]).length;
  return `<details class="card report-card photo-manager-tab"><summary><span><strong>Newbie photo upload</strong><small>Hidden admin tool · ${uploaded}/${participants.length} uploaded</small></span><span class="ai-badge">Open</span></summary><form id="photo-upload-form" class="photo-upload-form"><label>Upload photo folder or multiple photos<input name="photos" type="file" accept="image/*" multiple webkitdirectory directory></label><button class="primary" type="submit">Upload & match photos</button><p class="subtle">Name files like <code>Sollinselvan Curpen.jpg</code>. The app compresses them to display-size WebP files and stores random paths in Supabase.</p></form><div class="photo-admin-grid">${participants.map(({ group, person }) => `<div class="${state.participantPhotos[person] ? "has-photo" : ""}">${participantAvatar(person, "medium")}<strong>${esc(person)}</strong><small>${esc(group.name)} · ${state.participantPhotos[person] ? "Photo ready" : "No photo yet"}</small></div>`).join("")}</div></details>`;
}

function adminDashboard(selectedMentor = "all") {
  lastAdminMentor = selectedMentor;
  const totalCorrections = Object.keys(state.groupCorrections).length;
  const totalRemarks = Object.values(state.individualRemarks).filter(Boolean).length;
  shell(`<main class="page admin-page"><section class="hero"><div><p class="eyebrow">Admin command centre</p><h1>Scoreboard & feedback</h1></div><button class="primary" data-action="generate-reports">✦ Generate AI summaries</button></section><section class="stats"><div class="stat"><strong>${state.mentors.length}</strong><span>Spoon mentors</span></div><div class="stat"><strong>${totalCorrections}</strong><span>Marked questions</span></div><div class="stat"><strong>${knownTotalMarks()}</strong><span>Known total marks</span></div><div class="stat"><strong>${Object.keys(state.reports).length}</strong><span>Generated summaries</span></div></section><section class="report-stack">${scoreboardView()}${photoManagerView()}<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Mentor management</p><h2>Spoon mentors</h2></div><span class="ai-badge">${state.mentors.length} active</span></div><form id="mentor-form" class="inline-admin-form"><label>Add mentor<input name="mentorName" type="text" placeholder="Mentor name" required></label><button class="primary" type="submit">Add mentor</button></form><div class="mentor-admin-list">${state.mentors.map(name => `<div><span class="avatar">${esc(name[0])}</span><strong>${esc(name)}</strong><button class="danger-mini" data-delete-mentor="${esc(name)}">Delete</button></div>`).join("")}</div></article><article class="card report-card"><div class="report-heading"><div><p class="eyebrow">Audit trail</p><h2>Recent mentor changes</h2></div><div class="subtle-actions"><span class="ai-badge">${esc(syncLabel())}</span>${state.changeHistory.length ? `<button class="subtle-link" data-action="clear-history">Clear recent changes</button>` : ""}</div></div>${historyList()}</article>${state.data.groups.map(group => `<article class="card report-card"><div class="report-heading"><div><p class="eyebrow">${esc(group.name)}</p><h2>Group summary</h2></div><span class="ai-badge">${groupScore(group)}/${knownTotalMarks()} marks</span></div><p class="summary-text">${esc(state.reports[`group|${group.id}`] || buildGroupSummary(group))}</p><h3>Question points</h3><div class="question-summary-list">${state.data.questions.map(question => { const hasCorrection = Boolean(state.groupCorrections[correctionKey(group.id, question.id)]); return `<div><strong>Q${question.id}</strong><p>${esc(state.reports[`question|${group.id}|${question.id}`] || buildQuestionSummary(group, question))}</p>${hasCorrection ? `<button class="danger-mini" data-delete-correction="${group.id}|${question.id}">Remove correction</button>` : ""}</div>`; }).join("")}</div><h3>Individual feedback</h3><div class="individual-grid">${group.participants.map(person => `<div class="feedback-tile">${participantNameBlock(person)}<p>${esc(state.reports[`person|${person}`] || buildPersonFeedback(person))}</p></div>`).join("")}</div></article>`).join("")}</section></main>`);
}

function openPublicForm() {
  history.replaceState(null, "", location.pathname);
  state.session = { name: state.activeMentor, role: "mentor" };
  save();
  mentorDashboard();
}

function dashboard() {
  if (location.hash.startsWith("#jury")) return juryRouter();
  if (location.hash === "#admin") return state.session?.role === "admin" ? adminDashboard(lastAdminMentor) : loginView();
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
      return loginView(error.message || "Admin sign in failed.");
    }
  }

  if (event.target.id === "mentor-form") {
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await addMentorAsAdmin(data.mentorName || "");
      showToast("✓ Mentor added");
      adminDashboard(lastAdminMentor);
    } catch (error) {
      showToast(error.message || "Could not add mentor.");
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
      showToast(error.message ? `Photo upload failed: ${error.message}` : "Photo upload failed.");
    }
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
      showToast(remoteEnabled() ? "✓ Review saved to Supabase" : "✓ Review saved locally");
    } catch (error) {
      console.error("Save failed", error);
      state.syncStatus = "error";
      save();
      showToast(error.message ? `Supabase sync failed: ${error.message}` : "Saved locally, but Supabase sync failed.");
    }

    if (data.destination === "dashboard" || qid === state.data.questions.length) mentorDashboard();
    else correctionView(group.id, qid + 1);
  }

  if (event.target.id === "jury-group-form") {
    const groupId = Number(event.target.dataset.juryGroup);
    const data = Object.fromEntries(new FormData(event.target));
    const topicId = data.topicId ? Number(data.topicId) : null;

    const scoresByKey = {};
    juryCriteria.forEach(criterion => {
      const raw = data[`score::${criterion.key}`];
      if (raw !== undefined && raw !== "") {
        scoresByKey[criterion.key] = Math.max(0, Math.min(10, Math.round(Number(raw))));
      }
    });

    try {
      if (topicId) await persistJuryTopic(groupId, topicId);
      if (Object.keys(scoresByKey).length) await persistJuryScores(groupId, scoresByKey);
      await persistJuryRemark(groupId, data.remark || "");
      showToast(remoteEnabled() ? "✓ Jury scores saved to Supabase" : "✓ Jury scores saved locally");
    } catch (error) {
      console.error("Jury save failed", error);
      showToast(error.message ? `Jury sync failed: ${error.message}` : "Saved locally, but Supabase sync failed.");
    }

    juryGroupView(groupId);
  }
});

document.addEventListener("click", async event => {
  const button = event.target.closest("button");
  if (!button) {
    if (event.target.classList?.contains("photo-viewer")) closePhotoViewer();
    return;
  }

  if (button.dataset.photoUrl) {
    openPhotoViewer(button.dataset.photoUrl, button.dataset.photoName || "Participant");
    return;
  }
  if (button.dataset.action === "close-photo") {
    closePhotoViewer();
    return;
  }
  if (button.dataset.action === "logout") await signOutAdmin();
  if (button.dataset.action === "admin-login") {
    location.hash = "admin";
    state.session = { name: "", role: "mentor" };
    save();
    loginView();
  }
  if (button.dataset.action === "public-form") openPublicForm();
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
  if (button.dataset.mentor) {
    state.activeMentor = button.dataset.mentor;
    state.session.name = state.activeMentor;
    save();
    mentorDashboard();
  }
  if (button.dataset.groupReview) {
    const group = groupById(button.dataset.groupReview);
    const qid = Number(button.dataset.resumeQ || 1);
    await markQuestionInProgress(group, qid);
    correctionView(group.id, qid);
  }
  if (button.dataset.groupQ) {
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
      showToast(error.message ? `Remove failed: ${error.message}` : "Could not remove correction.");
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
      showToast(error.message || "Could not delete mentor.");
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
      showToast(error.message ? `Clear failed: ${error.message}` : "Could not clear recent changes.");
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
      showToast(remoteEnabled() ? "✓ Reports saved to Supabase" : "✓ Reports generated locally");
    } catch (error) {
      console.error("Report save failed", error);
      showToast("Reports generated locally, but Supabase sync failed.");
    }

    adminDashboard(lastAdminMentor);
  }

  if (button.dataset.action === "jury-home") {
    location.hash = "jury";
    dashboard();
    return;
  }
  if (button.dataset.action === "jury-exit") {
    location.hash = "";
    dashboard();
    return;
  }
  if (button.dataset.action === "jury-change-name") {
    state.juryName = null;
    state.activeJuryOffice = null;
    saveLocal();
    location.hash = "jury";
    dashboard();
    return;
  }
  if (button.dataset.action === "jury-back-groups") {
    location.hash = "jury";
    dashboard();
    return;
  }
  if (button.dataset.juryName) {
    state.juryName = button.dataset.juryName;
    state.activeJuryOffice = juryMembersSeed.find(member => member.name === state.juryName)?.office || null;
    saveLocal();
    location.hash = "jury";
    dashboard();
    return;
  }
  if (button.dataset.juryOffice) {
    state.activeJuryOffice = button.dataset.juryOffice;
    saveLocal();
    location.hash = "jury";
    dashboard();
    return;
  }
  if (button.dataset.juryGroup) {
    location.hash = `jury/group/${button.dataset.juryGroup}`;
    dashboard();
    return;
  }
  if (button.dataset.juryTopic) {
    const form = button.closest("form");
    const input = form?.querySelector("[data-jury-topic-input]");
    if (input) input.value = button.dataset.juryTopic;
    form?.querySelectorAll(".jury-topic-card").forEach(card => card.classList.toggle("selected", card === button));
    return;
  }
  if (button.dataset.juryMarkValue !== undefined && button.dataset.juryCriterion) {
    const picker = button.closest(".mark-picker");
    const input = picker?.querySelector(`[data-jury-score-input="${button.dataset.juryCriterion}"]`);
    if (input) input.value = button.dataset.juryMarkValue;
    picker?.querySelectorAll(".mark-chip").forEach(chip => chip.classList.toggle("active", chip === button));
    return;
  }
});

document.addEventListener("change", event => {
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

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePhotoViewer();
});

async function boot() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin && (!state.session || state.session.role === "admin")) state.session = { name: state.activeMentor, role: "mentor" };
  dashboard();
  await loadSharedData({ includeAdminData: isAdmin });
  await loadJuryData();
  subscribeSharedData();
  subscribeJuryData();
  dashboard();
}

boot();
