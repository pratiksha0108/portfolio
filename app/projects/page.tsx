import Link from 'next/link';
import {featuredProjects,supportingProjects} from '@/data/portfolio';
import styles from './projects.module.css';

export const metadata={title:'Projects | Pratiksha Shirsat',description:'Explore AI product experiments and software projects, including the live RAG Guardian prototype.'};
export default function Projects(){
 return <main className={styles.page}>
  <nav className={styles.nav} aria-label="Projects navigation"><Link href="/">← Back to portfolio</Link><a href="https://github.com/pratiksha0108" target="_blank" rel="noreferrer">GitHub ↗</a></nav>
  <header className={styles.header}><p className={styles.eyebrow}>THE PROJECT COLLECTION</p><h1>Ideas, made tangible.</h1><p>Explore the questions I’m investigating, the products I’m prototyping, and the systems I’ve built.</p></header>
  <section aria-label="Featured live project" className={styles.featured}>
   <div><p className={styles.eyebrow}>NEW · AI PRODUCT EXPERIMENT</p><h2><a href="https://pratiksha0108.github.io/rag-guardian/" target="_blank" rel="noreferrer">RAG Guardian ↗</a></h2><p>When business policies change, does the AI assistant keep up? Compare outdated answers, overly strict guardrails and an updated assistant against the same questions.</p><div className={styles.tags}><span>AI evaluation</span><span>Product strategy</span><span>Interactive prototype</span></div><p className={styles.note}>Fictional café scenarios and scripted responses. No live business integration or proven customer outcomes.</p><div className={styles.links}><a className={styles.primary} href="https://pratiksha0108.github.io/rag-guardian/" target="_blank" rel="noreferrer">Open RAG Guardian ↗</a><a href="https://github.com/pratiksha0108/rag-guardian" target="_blank" rel="noreferrer">View source</a></div></div>
   <div className={styles.experiment} aria-label="What to explore"><span>01 / CHANGE A POLICY</span><strong>New rules.<br/>Same reliable bot?</strong><span>02 / TEST THE OLD ANSWERS</span><p>Inspect evidence, not just a score.</p><span>03 / VERIFY A FIX</span><p>Useful answers matter as much as safe refusals.</p></div>
  </section>
  <section aria-labelledby="all-projects"><h2 id="all-projects" className={styles.sectionTitle}>More projects</h2><div className={styles.grid}>{[...featuredProjects,...supportingProjects].map(project=><article key={project.repo} className={styles.card}><h3><a href={project.liveUrl} target="_blank" rel="noreferrer">{project.title} ↗</a></h3><p>{project.description}</p><div className={styles.tags}>{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div><p className={styles.note}>Interactive browser adaptation with sample data. Original technologies are listed above; backend services are not running in the demo.</p><div className={styles.links}><a className={styles.primary} href={project.liveUrl} target="_blank" rel="noreferrer">Open live demo ↗</a><a href={project.repo} target="_blank" rel="noreferrer">Source code</a></div></article>)}</div></section>
  <footer className={styles.footer}><Link href="/#work">Explore detailed case studies on my portfolio →</Link></footer>
 </main>;
}
