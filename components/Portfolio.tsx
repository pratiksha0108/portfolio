"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import HeroCursorTracker from "@/components/HeroCursorTracker";
import { ProjectDemo } from "@/components/ProjectDemos";
import {
  capabilities,
  featuredProjects,
  productLoop,
  productStories,
  supportingProjects,
  type FeaturedProject,
} from "@/data/portfolio";

const navItems = [
  { id: "work", label: "Work" },
  { id: "stories", label: "Product stories" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <header className="section-heading reveal">
      <p className="section-eyebrow"><span />{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        {copy ? <p>{copy}</p> : null}
      </div>
    </header>
  );
}

function TiltSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--pointer-x", `${x * 100}%`);
    element.style.setProperty("--pointer-y", `${y * 100}%`);
    element.style.setProperty("--rotate-x", `${(0.5 - y) * 4}deg`);
    element.style.setProperty("--rotate-y", `${(x - 0.5) * 5}deg`);
  };

  const reset = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rotate-x", "0deg");
    element.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={`tilt-surface ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: FeaturedProject;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className={`project-modal case-study-modal accent-${project.accent}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${project.id}-modal-title`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close case study">
          ×
        </button>
        <div className="modal-index">{project.index}</div>
        <p className="section-eyebrow"><span />{project.eyebrow}</p>
        <h3 id={`${project.id}-modal-title`}>{project.title}</h3>
        <p className="modal-lede">{project.description}</p>

        <div className="case-study-summary">
          <section>
            <span className="modal-label">Problem</span>
            <p>{project.problem}</p>
          </section>
          <section>
            <span className="modal-label">Outcome</span>
            <p>{project.outcome}</p>
          </section>
          <section>
            <span className="modal-label">Impact</span>
            <p>{project.impact}</p>
          </section>
        </div>

        <section className="case-study-segments">
          <span className="modal-label">User segments</span>
          <div>
            {project.userSegments.map((segment) => (
              <article key={segment.title}>
                <strong>{segment.title}</strong>
                <p>{segment.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="case-study-method">
          <section>
            <span className="modal-label">What we did</span>
            <ol>
              {project.whatWeDid.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>
          <section>
            <span className="modal-label">How we built it</span>
            <ol>
              {project.howWeBuilt.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>
        </div>

        <div className="modal-proof">
          {project.proof.map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </div>

        <div className="modal-footer">
          <div className="stack-list">
            {project.stack.map((item) => <span key={item}>{item}</span>)}
          </div>
          <a href={project.repo} target="_blank" rel="noreferrer">
            View source <Arrow diagonal />
          </a>
        </div>
      </article>
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const commands = [
    ...navItems.map((item) => ({ label: `Go to ${item.label}`, href: `#${item.id}`, meta: "Section" })),
    { label: "Open GitHub", href: "https://github.com/pratiksha0108", meta: "External" },
    { label: "Open LinkedIn", href: "https://www.linkedin.com/in/pratiksha-shirsat", meta: "External" },
    { label: "Email Pratiksha", href: "mailto:pvshirsat01@gmail.com", meta: "Contact" },
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="command-backdrop" onMouseDown={onClose} role="presentation">
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Quick navigation" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search"><span>⌘</span><input value="Navigate portfolio" readOnly aria-label="Command palette" /><kbd>esc</kbd></div>
        <div className="command-list">
          {commands.map((command, index) => (
            <a
              key={command.label}
              href={command.href}
              onClick={onClose}
              target={command.meta === "External" ? "_blank" : undefined}
              rel={command.meta === "External" ? "noreferrer" : undefined}
            >
              <i>{String(index + 1).padStart(2, "0")}</i>
              <span>{command.label}</span>
              <small>{command.meta}</small>
              <b>↗</b>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("work");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStory, setActiveStory] = useState(productStories[0].id);
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [productLens, setProductLens] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? window.scrollY / max : 0);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll<HTMLElement>(".reveal").forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0.05, 0.2, 0.5] },
    );

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    const initialFrame = window.requestAnimationFrame(updateProgress);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selectedStory = productStories.find((story) => story.id === activeStory) ?? productStories[0];

  return (
    <main className={`portfolio-shell ${productLens ? "is-product-lens" : ""}`}>
      <div className="scroll-progress" aria-hidden="true"><i style={{ transform: `scaleX(${scrollProgress})` }} /></div>

      <header className="site-header">
        <a href="#top" className="site-logo" aria-label="Pratiksha Shirsat, home">
          <span>PS</span><i>/</i>
        </a>

        <nav className={mobileNavOpen ? "is-open" : ""} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "is-active" : ""}
              onClick={() => setMobileNavOpen(false)}
            >
              <span>{item.label}</span><i />
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className={`lens-toggle ${productLens ? "is-active" : ""}`} onClick={() => setProductLens((active) => !active)} aria-pressed={productLens}>
            <span className="lens-dot" /> Product lens
          </button>
          <button type="button" className="command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open quick navigation">
            <span>⌘</span>K
          </button>
          <button type="button" className="menu-trigger" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen} aria-label="Toggle navigation">
            <i /><i />
          </button>
        </div>
      </header>

      <section id="top" className="hero-section">
        <HeroCursorTracker />
        <div className="hero-overlay" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-status reveal is-visible">
            <span><i /> Chicago, IL</span>
            <span>Open to product-building teams</span>
          </div>

          <p className="hero-kicker reveal is-visible">Developer × Consultant × Product Builder</p>
          <h1 className="reveal is-visible">
            I turn conversations
            <span>into working products.</span>
          </h1>
          <p className="hero-description reveal is-visible">
            I listen to users, frame the real problem, build the prototype, and help cross-functional teams ship what matters.
          </p>
          <div className="hero-actions reveal is-visible">
            <a href="#work" className="primary-button">Explore selected work <Arrow /></a>
            <a href="mailto:pvshirsat01@gmail.com" className="text-link">Start a conversation <Arrow diagonal /></a>
          </div>

          <div className="hero-proof reveal is-visible">
            <div><strong>40%</strong><span>FCR improvement</span></div>
            <div><strong>15+</strong><span>global stakeholders</span></div>
            <div><strong>$7M</strong><span>pipeline redesigned</span></div>
          </div>
        </div>

        <a href="#product-loop" className="hero-scroll" aria-label="Scroll to product approach">
          <span>Scroll to explore</span><i>↓</i>
        </a>

        <div className="lens-note lens-note-hero" aria-hidden="true">
          <span>01</span> The hero behaves like a product: interaction creates immediate feedback.
        </div>
      </section>

      <section id="product-loop" className="product-loop-section section-pad">
        <div className="section-orbit" aria-hidden="true" />
        <SectionHeading
          eyebrow="How I work"
          title="A product loop with code in the middle."
          copy="I do not treat product thinking and building as separate jobs. Each step creates evidence for the next one."
        />

        <div className="product-loop-grid">
          {productLoop.map((step, index) => (
            <article key={step.title} className="loop-card reveal" style={{ "--delay": `${index * 70}ms` } as CSSProperties}>
              <span className="loop-number">{step.number}</span>
              <div className="loop-icon" aria-hidden="true"><i /><b /></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <small>{step.proof}</small>
            </article>
          ))}
        </div>
        <div className="loop-connector" aria-hidden="true"><i /></div>
        <div className="lens-note lens-note-loop" aria-hidden="true"><span>02</span> Each capability is tied to a behavior and proof, not a keyword cloud.</div>
      </section>

      <section id="work" className="work-section section-pad">
        <SectionHeading
          eyebrow="Selected builds"
          title="Products you can interact with, not just read about."
          copy="The demos below recreate the core product idea of each build. Change a forecast, run a service scenario, or shape a quote."
        />

        <div className="featured-projects">
          {featuredProjects.map((project, index) => (
            <article key={project.id} className={`featured-project accent-${project.accent} ${index % 2 ? "is-reversed" : ""}`}>
              <div className="project-copy reveal">
                <div className="project-index"><span>{project.index}</span><i /></div>
                <p className="project-eyebrow">{project.eyebrow}</p>
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-proof-row">
                  {project.proof.map((item) => (
                    <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
                  ))}
                </div>
                <div className="project-links">
                  <button type="button" onClick={() => setSelectedProject(project)}>Open case study <Arrow /></button>
                  <a href={project.repo} target="_blank" rel="noreferrer">Source <Arrow diagonal /></a>
                </div>
              </div>

              <TiltSurface className="project-demo-wrap reveal">
                <ProjectDemo type={project.demo} />
                <span className="demo-corner-label">Interactive prototype</span>
              </TiltSurface>
            </article>
          ))}
        </div>
        <div className="lens-note lens-note-work" aria-hidden="true"><span>03</span> The portfolio demonstrates prototyping instead of merely claiming it.</div>
      </section>

      <section id="stories" className="stories-section section-pad">
        <SectionHeading
          eyebrow="Professional product stories"
          title="The work behind the metrics."
          copy="Client identities stay private. The problem, decision, and measurable outcome remain visible."
        />

        <div className="stories-layout reveal">
          <div className="story-tabs" role="tablist" aria-label="Professional product stories">
            {productStories.map((story, index) => (
              <button
                key={story.id}
                type="button"
                role="tab"
                aria-selected={activeStory === story.id}
                className={activeStory === story.id ? "is-active" : ""}
                onClick={() => setActiveStory(story.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p><small>{story.label}</small><strong>{story.title}</strong></p>
                <i>↗</i>
              </button>
            ))}
          </div>

          <article className="story-panel" key={selectedStory.id}>
            <div className="story-panel-top">
              <p className="section-eyebrow"><span />{selectedStory.label}</p>
              <span className="story-confidential">Anonymized client work</span>
            </div>
            <h3>{selectedStory.title}</h3>
            <div className="story-narrative">
              <div><span>Problem</span><p>{selectedStory.problem}</p></div>
              <div><span>Product move</span><p>{selectedStory.move}</p></div>
              <div><span>Outcome</span><p>{selectedStory.result}</p></div>
            </div>
            <div className="story-metrics">
              {selectedStory.metrics.map((metric) => (
                <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
              ))}
            </div>
          </article>
        </div>
        <div className="lens-note lens-note-stories" aria-hidden="true"><span>04</span> Confidentiality is a constraint, not an excuse to hide decision quality.</div>
      </section>

      <section className="experiments-section section-pad">
        <SectionHeading
          eyebrow="More experiments"
          title="Focused builds. Different product muscles."
          copy="Each project explores a distinct user need, workflow, and technical decision, adding range to how I understand and build products."
        />

        <div className="supporting-grid">
          {supportingProjects.map((project) => (
            <TiltSurface key={project.title} className="supporting-card reveal">
              <a href={project.repo} target="_blank" rel="noreferrer">
                <span className="supporting-symbol">{project.symbol}</span>
                <span className="supporting-arrow">↗</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div>{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
              </a>
            </TiltSurface>
          ))}
          <TiltSurface className="supporting-card github-card reveal">
            <a href="https://github.com/pratiksha0108" target="_blank" rel="noreferrer">
              <span className="supporting-symbol">{`</>`}</span>
              <span className="supporting-arrow">↗</span>
              <h3>Everything else lives on GitHub.</h3>
              <p>Browse the code, coursework, experiments, and earlier systems that shaped the work above.</p>
              <div><span>github.com/pratiksha0108</span></div>
            </a>
          </TiltSurface>
        </div>
      </section>

      <section id="about" className="about-section section-pad">
        <div className="about-grid">
          <div className="about-statement reveal">
            <p className="section-eyebrow"><span />About</p>
            <blockquote>
              “I like talking to people about what is not working. Because I build, I do not have to stop at a deck or wait for someone else to make the prototype.”
            </blockquote>
            <p>
              I now bring product strategy, AI prototypes, enterprise platforms, and technical delivery together in Chicago. My path includes technology consulting in India, a Master of Computer Science at Illinois Institute of Technology, and an earlier foundation in civil engineering. That range helps me translate between the person experiencing the problem and the team building the solution.
            </p>
            <a href="mailto:pvshirsat01@gmail.com" className="primary-button">Talk product with me <Arrow /></a>
          </div>

          <div className="experience-stack" aria-label="Experience and education timeline">
            <article className="experience-card reveal" style={{ "--experience-delay": "0ms" } as CSSProperties}>
              <span>Aug 2025 to present</span>
              <h3>Technology Consultant / Developer</h3>
              <p>Servio Consulting · Chicago</p>
              <small>Product strategy, AI and enterprise platforms, stakeholder alignment, UAT, analytics, and cross-functional delivery.</small>
            </article>
            <article className="experience-card reveal" style={{ "--experience-delay": "90ms" } as CSSProperties}>
              <span>Aug 2023 to May 2025</span>
              <h3>Master of Computer Science</h3>
              <p>Illinois Institute of Technology · Chicago</p>
              <small>Software project management, data systems, modeling, analytics, and technical product foundations.</small>
            </article>
            <article className="experience-card reveal" style={{ "--experience-delay": "180ms" } as CSSProperties}>
              <span>Nov 2021 to Jun 2023</span>
              <h3>Cloud Engineer</h3>
              <p>Tata Consultancy Services · India</p>
              <small>Cloud migration roadmaps, Azure and AKS, observability, cross-functional delivery, and 99.99% reliability.</small>
            </article>
            <article className="experience-card reveal" style={{ "--experience-delay": "270ms" } as CSSProperties}>
              <span>Aug 2017 to May 2021</span>
              <h3>Bachelor of Technology in Civil Engineering</h3>
              <p>Vishwakarma Institute of Information Technology · Pune, India</p>
              <small>An engineering foundation in structured problem solving, systems thinking, planning, and working within real-world constraints.</small>
            </article>
          </div>
        </div>

        <div className="capability-marquee" aria-label="Capabilities">
          <div>
            {[...capabilities, ...capabilities].map((capability, index) => (
              <span key={`${capability}-${index}`}>{capability}<i>✦</i></span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-orb contact-orb-one" aria-hidden="true" />
        <div className="contact-orb contact-orb-two" aria-hidden="true" />
        <div className="contact-content reveal">
          <p className="section-eyebrow"><span />Next conversation</p>
          <h2>Have a hard problem and a room full of different opinions?</h2>
          <p>That is usually where I do my best work.</p>
          <a href="mailto:pvshirsat01@gmail.com" className="contact-email">pvshirsat01@gmail.com <Arrow diagonal /></a>
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/pratiksha-shirsat" target="_blank" rel="noreferrer">LinkedIn <Arrow diagonal /></a>
            <a href="https://github.com/pratiksha0108" target="_blank" rel="noreferrer">GitHub <Arrow diagonal /></a>
          </div>
        </div>
        <footer>
          <span>Designed and built by Pratiksha Shirsat.</span>
          <span>Chicago · 2026</span>
          <button type="button" onClick={() => setCommandOpen(true)}>Press ⌘K to jump</button>
        </footer>
      </section>

      {selectedProject ? <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} /> : null}
      {commandOpen ? <CommandPalette onClose={() => setCommandOpen(false)} /> : null}
    </main>
  );
}
