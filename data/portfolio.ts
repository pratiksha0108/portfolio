export type FeaturedProject = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  description: string;
  problem: string;
  userSegments: { title: string; description: string }[];
  whatWeDid: string[];
  howWeBuilt: string[];
  outcome: string;
  impact: string;
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
    eyebrow: "AI and ML · Developer analytics",
    description:
      "An interactive product that turns repository activity into visual trends and forward-looking signals for engineering teams.",
    problem:
      "GitHub contains rich activity data, but raw counts do not explain whether delivery health is improving, where work is accumulating, or what teams should expect next.",
    userSegments: [
      {
        title: "Engineering leaders",
        description: "Need an early view of delivery risk, workload, and contributor trends.",
      },
      {
        title: "Repository maintainers",
        description: "Need to understand issue flow, pull request activity, and release patterns.",
      },
      {
        title: "Analysts and contributors",
        description: "Need a visual way to compare historical behavior with forecasted activity.",
      },
    ],
    whatWeDid: [
      "Designed a dashboard that combines descriptive analytics with forward-looking forecasts.",
      "Mapped GitHub activity into product signals such as issues, pull requests, commits, contributors, branches, and releases.",
      "Made model outputs visible so users could compare approaches instead of receiving one unexplained prediction.",
    ],
    howWeBuilt: [
      "Used React for interactive exploration and Flask for GitHub API retrieval and data preparation.",
      "Separated forecasting into an independent service using LSTM, Prophet, and statistical models.",
      "Containerized the services with Docker and designed deployment around Google Cloud.",
    ],
    outcome:
      "The result is a working analytics experience that lets a user move from repository data to historical patterns and six forecasted signals in one flow.",
    impact:
      "The product reframes repository data as a planning tool, helping technical teams discuss capacity and delivery risk with evidence instead of isolated counts.",
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
    eyebrow: "Generative AI · Concept prototype",
    description:
      "A working customer service concept that explores conversational support, product guidance, and image-assisted issue intake.",
    problem:
      "Retail customers repeatedly ask about orders, returns, products, and damaged items, while support teams spend time collecting the same context before they can help.",
    userSegments: [
      {
        title: "Order-focused shoppers",
        description: "Want quick status updates and next steps without searching multiple screens.",
      },
      {
        title: "Product explorers",
        description: "Want guidance that narrows choices based on an expressed need.",
      },
      {
        title: "Customers reporting damage",
        description: "Need a simple way to explain an issue and provide visual evidence.",
      },
    ],
    whatWeDid: [
      "Created a conversational entry point that can handle several common service intents.",
      "Separated the concept into product recommendations, order context, and image-assisted damage intake.",
      "Built the interaction directly so the concept could be evaluated through behavior rather than static mockups.",
    ],
    howWeBuilt: [
      "Used React to prototype the end-to-end interaction and OpenAI models for conversational responses.",
      "Structured each service journey as a focused module so additional workflows could be added independently.",
      "Explored image input for damage intake to reduce the amount of information customers need to type.",
    ],
    outcome:
      "The result is a working prototype with three service journeys and a shared conversational interface that demonstrates how context can remain within one experience.",
    impact:
      "The concept shows how support intake could become faster and more consistent while giving customers a clearer path from question to resolution.",
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
    problem:
      "Insurance quotes require extensive personal and risk information. Long forms create uncertainty about progress, make errors harder to recover from, and can discourage completion.",
    userSegments: [
      {
        title: "First-time shoppers",
        description: "Need plain guidance, visible progress, and confidence about what information is required.",
      },
      {
        title: "Auto and health customers",
        description: "Need different questions and coverage choices within a consistent product experience.",
      },
      {
        title: "Returning account users",
        description: "Need to review quotes, manage a profile, and continue from previously entered information.",
      },
    ],
    whatWeDid: [
      "Split a complex quote request into guided stages with review and confirmation states.",
      "Designed separate auto and health journeys while preserving a shared account and navigation model.",
      "Completed the broader product loop with login, registration, dashboard, profile, and quote detail screens.",
    ],
    howWeBuilt: [
      "Used React Router to model the product journey across discovery, quoting, account, and detail views.",
      "Used Formik and Yup to manage multi-step form state and validation feedback.",
      "Used Material UI to create consistent form controls, progress indicators, review cards, and responsive layouts.",
    ],
    outcome:
      "The result is an end-to-end prototype with two quote journeys, five guided stages, and the supporting screens needed to continue after form submission.",
    impact:
      "The experience reduces cognitive load, makes progress visible, and gives users a clearer sense of control during a high-information financial decision.",
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
      "A single-sitting K-12 registration form created friction for staff and families completing lengthy enrollment workflows.",
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
