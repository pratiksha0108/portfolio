import Link from 'next/link';
import Image from 'next/image';
import {featuredProjects,supportingProjects} from '@/data/portfolio';
import styles from './projects.module.css';

export const metadata={title:'Projects | Pratiksha Shirsat',description:'Explore AI product experiments and software projects, including the live RAG Guardian prototype.'};
const basePath = process.env.NODE_ENV === 'production' ? '/portfolio' : '';
const previews: Record<string, {image:string; emoji:string; description:string; note:string}> = {
 'Github-Data-Forecasting': {image:'radar',emoji:'📊',description:'Explore GitHub activity, compare forecasts, and test a capacity plan.',note:'Public GitHub data · Hypothetical planning scenarios'},
 'nike-customer-service-ai': {image:'care',emoji:'💬',description:'Turn 8,469 practice support tickets into a human-first service playbook.',note:'Practice dataset · Rule-based assistance, not live AI'},
 'Insurance-Quote-System': {image:'insurance',emoji:'🛡️',description:'Build a sample coverage plan and see how each choice changes the estimate.',note:'Fictional pricing · Not a real insurance quote'},
 'Flight-Management-System': {image:'boarding',emoji:'✈️',description:'Pick your flight, choose a seat, and explore the operations behind the trip.',note:'Fictional flights · No payments or real tickets'},
 'Blogging-Platform': {image:'community',emoji:'✍️',description:'Explore a community from both sides: contributor and moderator.',note:'Local-only posts · Demonstration roles, not authentication'},
};
function Preview({image, title, href, featured=false}:{image:string;title:string;href:string;featured?:boolean}) {
 return <a className={styles.preview} href={href} target="_blank" rel="noreferrer" aria-label={`Explore ${title}`}><Image src={`${basePath}/projects/${image}.png`} width={1280} height={800} alt={`${title} app preview`} unoptimized loading={featured?'eager':'lazy'}/><span className={styles.previewLink}>Explore project ↗</span></a>;
}
function sourceNote(repo: string) {
 if (repo.endsWith('/Github-Data-Forecasting')) return 'Real public GitHub data with transparent statistical baselines. Capacity and queue are hypothetical; no staffing or productivity claims.';
 if (repo.endsWith('/nike-customer-service-ai')) return 'Kaggle practice data with customer details excluded. Transparent routing rules and templates, not live AI. Handling times are assumptions, not measured savings.';
 if (repo.endsWith('/Flight-Management-System')) return 'Fictional flights and fares with working seat-inventory rules. Browser-session reservations only: no payment, live airline connection, or real tickets.';
 return 'Interactive browser adaptation with sample data. Original technologies are listed above; backend services are not running in the demo.';
}
export default function Projects(){
 return <main className={styles.page}>
  <nav className={styles.nav} aria-label="Projects navigation"><Link href="/">← Back to portfolio</Link><a href="https://github.com/pratiksha0108" target="_blank" rel="noreferrer">GitHub ↗</a></nav>
  <header className={styles.header}><p className={styles.eyebrow}>THE PROJECT COLLECTION</p><h1>Ideas, made tangible.</h1><p>Explore the questions I’m investigating, the products I’m prototyping, and the systems I’ve built.</p></header>
  <section aria-label="Featured live project" className={styles.featured}>
   <div><p className={styles.eyebrow}><span aria-hidden="true">🤖 </span> FEATURED · AI PRODUCT EXPERIMENT</p><h2>RAG Guardian</h2><p>Change a café policy. Catch outdated answers. Test whether the fix actually helps.</p><div className={styles.tags}><span>AI evaluation</span><span>Product strategy</span><span>Interactive prototype</span></div><p className={styles.note}>Fictional café · Scripted replies, not a live AI integration.</p><div className={styles.links}><a className={styles.primary} href="https://pratiksha0108.github.io/rag-guardian/" target="_blank" rel="noreferrer">Explore project ↗</a><a href="https://github.com/pratiksha0108/rag-guardian" target="_blank" rel="noreferrer">Source code</a></div></div>
   <Preview image="guardian" title="RAG Guardian" href="https://pratiksha0108.github.io/rag-guardian/" featured/>
  </section>
  <section aria-labelledby="all-projects"><h2 id="all-projects" className={styles.sectionTitle}>More projects</h2><div className={styles.grid}>{[...featuredProjects,...supportingProjects].map(project=>{
   const preview=previews[project.repo.split('/').pop()!];
   return <article key={project.repo} className={styles.card}>
    <Preview image={preview.image} title={project.title} href={project.liveUrl}/>
    <div className={styles.cardBody}><h3><span aria-hidden="true">{preview.emoji} </span>{project.title}</h3><p>{preview.description}</p><div className={styles.tags}>{project.stack.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div><p className={styles.note}>{preview.note}</p><details className={styles.details}><summary>About this demo</summary><p>{project.description}</p><p>{sourceNote(project.repo)}</p><p>Built with: {project.stack.join(', ')}.</p></details><div className={styles.links}><a className={styles.primary} href={project.liveUrl} target="_blank" rel="noreferrer">Explore project ↗</a><a href={project.repo} target="_blank" rel="noreferrer">Source code</a></div></div>
   </article>;
  })}</div></section>
  <footer className={styles.footer}><Link href="/#work">Explore detailed case studies on my portfolio →</Link></footer>
 </main>;
}
