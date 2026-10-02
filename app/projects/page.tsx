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
function Preview({image, featured=false}:{image:string;title:string;href:string;featured?:boolean}) {
 return <div className={styles.preview}><Image src={`${basePath}/projects/${image}-concept.png`} width={1536} height={1024} alt="" unoptimized loading={featured?'eager':'lazy'}/></div>;
}
export default function Projects(){
 return <main className={styles.page}>
  <nav className={styles.nav} aria-label="Projects navigation"><Link href="/">← Back to portfolio</Link><a href="https://github.com/pratiksha0108" target="_blank" rel="noreferrer">GitHub ↗</a></nav>
  <header className={styles.header}><p className={styles.eyebrow}>THE PROJECT COLLECTION</p><h1>Ideas, made tangible.</h1><p>Explore the questions I’m investigating, the products I’m prototyping, and the systems I’ve built.</p></header>
  <section aria-label="Featured live project" className={styles.featured}>
   <div><p className={styles.eyebrow}>FEATURED PROJECT</p><h2>RAG Guardian</h2><p>Test how a sample AI assistant responds when business policies change.</p><div className={styles.links}><a className={styles.primary} href="https://pratiksha0108.github.io/rag-guardian/" target="_blank" rel="noreferrer">Explore ↗</a></div></div>
   <Preview image="guardian" title="RAG Guardian" href="https://pratiksha0108.github.io/rag-guardian/" featured/>
  </section>
  <section aria-labelledby="all-projects"><h2 id="all-projects" className={styles.sectionTitle}>More projects</h2><div className={styles.grid}>{[...featuredProjects,...supportingProjects].map(project=>{
   const preview=previews[project.repo.split('/').pop()!];
   return <article key={project.repo} className={styles.card}>
    <Preview image={preview.image} title={project.title} href={project.liveUrl}/>
    <div className={styles.cardBody}><h3>{project.title}</h3><p>{preview.description}</p><div className={styles.links}><a className={styles.primary} href={project.liveUrl} target="_blank" rel="noreferrer">Explore ↗</a></div></div>
   </article>;
  })}</div></section>
  <footer className={styles.footer}><p>Portfolio prototypes, not live commercial services. Dataset sources and demo limitations are explained inside each project.</p><Link href="/#work">Explore detailed case studies on my portfolio →</Link></footer>
 </main>;
}
