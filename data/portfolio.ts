export type FeaturedProject = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  description: string;
  challenge: string;
  decisions: string[];
  proof: { value: string; label: string }[];
  stack: string[];
  repo: string;
  demo: "forecast" | "service" | "insurance";
  accent: "cyan" | "coral" | "lime";
};

export type ProductStory = {
  id: string;
  label: string;
  title: string;
  problem: string;
  move: string;
  result: string;
  metrics: { value: string; label: string }[];
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "forecast-lab",
    index: "01",
    title: "GitHub Forecast Lab",
    eyebrow: "AI/ML · Developer analytics",
    description:
      "An interactive product that turns repository activity into visual trends and forward-looking signals for engineering teams.",
    challenge:
      "GitHub exposes plenty of activity data, but raw counts do not tell a team what is changing or what may happen next.",
    decisions: [
      "Combined descriptive analytics and forecasting in one experience.",
      "Separated GitHub data retrieval from the forecasting service so each part could scale independently.",
      "Compared LSTM, Prophet, and statistical approaches instead of hiding the model choice.",
    ],
    proof: [
      { value: "6", label: "signals forecast" },
      { value: "3", label: "model families" },
      { value: "60%", label: "faster query time" },
    ],
    stack: ["React", "Flask", "GitHub API", "TensorFlow", "Prophet", "Docker", "GCP"],
    repo: "https://github.com/pratiksha0108/Github-Data-Forecasting",
    demo: "forecast",
    accent: "cyan",
  },
  {
    id: "service-ai",
    index: "02",
    title: "Retail Service AI",
    eyebrow: "GenAI · Concept prototype",
    description:
      "A working customer-service concept that explores conversational support, product guidance, and image-assisted issue intake.",
    challenge:
      "Customers repeat order, return, product, and damage questions while support teams manually gather context.",
    decisions: [
      "Started with a conversational interface to validate the support experience quickly.",
      "Explored separate modules for recommendations, order context, and visual damage intake.",
      "Built the prototype directly so stakeholders could react to behavior, not a static slide deck.",
    ],
    proof: [
      { value: "1", label: "working prototype" },
      { value: "3", label: "service journeys" },
      { value: "AI", label: "first interaction" },
    ],
    stack: ["React", "OpenAI", "JavaScript", "Image input", "Conversation design"],
    repo: "https://github.com/pratiksha0108/nike-customer-service-ai",
    demo: "service",
    accent: "coral",
  },
  {
    id: "insurance-journey",
    index: "03",
    title: "Insurance Quote Journey",
    eyebrow: "Fintech UX · Full-stack concept",
    description:
      "An end-to-end insurance experience spanning discovery, guided data collection, validation, quote review, and account management.",
    challenge:
      "Insurance quotes require a lot of personal and risk information, which makes clarity, progress, and validation essential.",
    decisions: [
      "Split complex input into guided steps instead of one intimidating form.",
      "Designed distinct auto and health journeys while keeping a shared account experience.",
      "Added validation, review, dashboard, profile, and quote-detail states to complete the product loop.",
    ],
    proof: [
      { value: "2", label: "quote journeys" },
      { value: "5", label: "guided steps" },
      { value: "8+", label: "product screens" },
    ],
    stack: ["React", "Material UI", "Formik", "Yup", "React Router", "Product UX"],
    repo: "https://github.com/pratiksha0108/Insurance-Quote-System",
    demo: "insurance",
    accent: "lime",
  },
];

export const productStories: ProductStory[] = [
  {
    id: "student-support",
    label: "Enterprise AI",
    title: "From support backlog to an AI-assisted student experience",
    problem:
      "A university support experience had slow enrollment responses and fragmented expectations across global stakeholder groups.",
    move:
      "Led roadmap execution with a five-person agile squad, aligned more than 15 stakeholders, and guided an Agentforce-enabled support workflow from requirements through release.",
    result:
      "The product improved the quality and speed of first responses while strengthening the business case for continued investment.",
    metrics: [
      { value: "+40%", label: "first-contact resolution" },
      { value: "<2 min", label: "enrollment response" },
      { value: "$2M+", label: "renewal supported" },
    ],
  },
  {
    id: "enrollment-experiment",
    label: "Experimentation",
    title: "A registration flow tested with real schools, not opinions",
    problem:
      "A single-sitting K–12 registration form created friction for staff and families completing lengthy enrollment workflows.",
    move:
      "Designed an A/B test against a multi-section, save-and-resume experience and evaluated behavior across more than 350 students and 15 schools.",
    result:
      "The redesigned journey made the workflow easier to adopt and materially increased completed enrollments.",
    metrics: [
      { value: "+80%", label: "staff adoption" },
      { value: "+60%", label: "completed enrollments" },
      { value: "350+", label: "students observed" },
    ],
  },
  {
    id: "sales-forecasting",
    label: "B2B workflow",
    title: "Turning an inconsistent sales process into a dependable forecast",
    problem:
      "Sales leaders were spending hours reconciling pipeline stages and could not rely on a consistent view of a seven-million-dollar pipeline.",
    move:
      "Partnered with leadership to standardize opportunity stages, forecast categories, dashboards, and the operating rhythm around them.",
    result:
      "The new workflow improved forecast confidence and returned most of a working day to the team every week.",
    metrics: [
      { value: "+35%", label: "forecast accuracy" },
      { value: "$7M", label: "pipeline covered" },
      { value: "12h → 3h", label: "weekly reporting" },
    ],
  },
];

export const supportingProjects = [
  {
    title: "Flight Operations System",
    description:
      "A Java and MySQL desktop system with traveler and administrator journeys for domestic and international schedules, booking, editing, and account access.",
    stack: ["Java", "Swing", "MySQL", "JDBC"],
    repo: "https://github.com/pratiksha0108/Flight-Management-System",
    symbol: "✈",
  },
  {
    title: "Community Blogging Platform",
    description:
      "A role-aware community product with topic-based posts, threaded replies, moderation controls, login, and user-management experiences.",
    stack: ["React", "Material UI", "Role-based UX"],
    repo: "https://github.com/pratiksha0108/Blogging-Platform",
    symbol: "✦",
  },
];

export const productLoop = [
  {
    number: "01",
    title: "Listen",
    description: "Talk to users and stakeholders until the real friction becomes visible.",
    proof: "Requirements discovery · user research · journey mapping",
  },
  {
    number: "02",
    title: "Frame",
    description: "Turn a broad complaint into a focused problem, a priority, and a measurable outcome.",
    proof: "Roadmaps · acceptance criteria · OKRs and KPIs",
  },
  {
    number: "03",
    title: "Prototype",
    description: "Build enough of the idea to learn from something people can actually use.",
    proof: "React · AI · Salesforce · data prototypes",
  },
  {
    number: "04",
    title: "Ship",
    description: "Bring engineering, QA, operations, and business teams through the same release decision.",
    proof: "UAT · release criteria · defect prioritization",
  },
  {
    number: "05",
    title: "Learn",
    description: "Measure adoption and quality, then use the signal to choose the next iteration.",
    proof: "A/B testing · dashboards · customer feedback",
  },
];

export const capabilities = [
  "Product strategy",
  "Roadmap ownership",
  "Customer discovery",
  "Rapid prototyping",
  "AI product development",
  "Data analysis",
  "Agile delivery",
  "UAT and release",
  "Salesforce",
  "React and JavaScript",
  "Python and SQL",
  "Cloud platforms",
];
