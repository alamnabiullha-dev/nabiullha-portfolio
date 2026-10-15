
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  X,
  Code2,
  GraduationCap,
  Trophy,
  BriefcaseBusiness,
  Sparkles,
  ExternalLink,
  Search,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import SiteNav from '../components/SiteNav.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import api, { messageOf } from '../services/api.js';

const ACCENT = '#b5f36b';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function SectionTitle({ eyebrow, title, desc, number }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ maxWidth: 700, marginBottom: 42 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 15,
        }}
      >
        {number && (
          <span className="mono" style={{ color: ACCENT, fontSize: 12 }}>
            {number}
          </span>
        )}
        <span className="eyebrow" style={{ letterSpacing: 2, fontSize: 11 }}>
          {eyebrow}
        </span>
        <span
          style={{
            height: 1,
            width: 45,
            background: 'rgba(181,243,107,0.35)',
          }}
        />
      </div>

      <h2
        className="heading"
        style={{
          fontSize: 'clamp(30px, 4.5vw, 48px)',
          lineHeight: 1.15,
          letterSpacing: '-0.045em',
          margin: '0 0 16px',
        }}
      >
        {title}
      </h2>

      {desc && (
        <p
          className="muted"
          style={{ lineHeight: 1.9, fontSize: 15, maxWidth: 620, margin: 0 }}
        >
          {desc}
        </p>
      )}
    </motion.div>
  );
}

function Surface({ children, style = {}, className = 'panel' }) {
  return (
    <div
      className={className}
      style={{
        border: '1px solid rgba(181,243,107,0.12)',
        borderRadius: 18,
        background:
          'linear-gradient(145deg, rgba(24,32,26,0.92), rgba(15,20,16,0.96))',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
      aria-label={label}
      title={label}
      className="portfolio-social"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12,
        color: '#d9e4d8',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.035)',
      }}
    >
      {children}
    </a>
  );
}

function groupSkills(skills) {
  return Object.entries(
    skills.reduce((acc, skill) => {
      const category =
        typeof skill === 'string' ? 'Other' : skill.category || 'Other';

      (acc[category] ||= []).push(skill);
      return acc;
    }, {})
  );
}

export default function Portfolio({ data, loading, error }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
    website: '',
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategory, setProjectCategory] = useState('All');
  const [preview, setPreview] = useState(null);
  const [failedCertificates, setFailedCertificates] = useState({});

  const profile = data?.profile || {};
  const settings = data?.settings || {};
  const projects = data?.projects || [];
  const skills = data?.skills || [];
  const education = data?.education || [];
  const achievements = data?.achievements || [];
  const experiences = data?.experiences || [];

  const college =
    education.find(
      (item) =>
        item.level === 'college' || item.institution?.includes('SRM')
    ) || education[0];

  const categories = [
    ...new Set(projects.map((project) => project.category).filter(Boolean)),
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      projectCategory === 'All' || project.category === projectCategory;

    const searchableText =
      `${project.name || ''} ${project.shortDescription || ''} ${(project.technologies || []).join(' ')}`.toLowerCase();

    return (
      matchesCategory &&
      searchableText.includes(projectSearch.toLowerCase())
    );
  });

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setResult('');

    try {
      await api.post('/contact', form);
      setResult('Thanks for reaching out. Your message has been sent.');

      setForm({
        name: '',
        email: '',
        organization: '',
        subject: '',
        message: '',
        website: '',
      });
    } catch (err) {
      setResult(messageOf(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main
        className="container section"
        style={{ minHeight: '65vh', display: 'grid', placeItems: 'center' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              margin: '0 auto 18px',
              border: '3px solid rgba(181,243,107,0.15)',
              borderTopColor: ACCENT,
              borderRadius: '50%',
              animation: 'portfolioSpin .8s linear infinite',
            }}
          />
          <p className="muted">Loading portfolio...</p>
          <style>{`
            @keyframes portfolioSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="container section">
        <Surface style={{ padding: 30 }}>
          <p className="error">{error}</p>
          <p className="muted">Please try again in a moment.</p>
        </Surface>
      </main>
    );
  }

  return (
    <>
      <SiteNav profile={profile} />

      <main>
        {/* HERO */}
        <section
          className="container grid-bg"
          style={{
            position: 'relative',
            padding: 'clamp(60px, 8vw, 110px) 0 80px',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 420,
              height: 420,
              right: '-5%',
              top: '5%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(181,243,107,0.12), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              alignItems: 'center',
              gap: 'clamp(35px, 6vw, 75px)',
            }}
          >
            {/* INTRODUCTION */}
            <div style={{ minWidth: 0 }}>
              <motion.div variants={fadeUp}>
                <span
                  className="tag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '10px 14px',
                    borderRadius: 30,
                    background: 'rgba(181,243,107,0.06)',
                    border: '1px solid rgba(181,243,107,0.2)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: profile.available ? ACCENT : '#829087',
                    }}
                  />
                  {profile.availabilityLabel ||
                    (profile.available
                      ? 'Open to internships & opportunities'
                      : 'Building my next project')}
                </span>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="eyebrow"
                style={{ marginTop: 30, letterSpacing: 2, color: ACCENT }}
              >
                {profile.headline ||
                  ''}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(42px, 6vw, 76px)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.065em',
                  margin: '20px 0 26px',
                  overflowWrap: 'anywhere',
                }}
              >
                {profile.name || 'Nabiullha Alam'}
                <span style={{ color: ACCENT }}>.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="muted"
                style={{
                  fontSize: 'clamp(16px, 2vw, 19px)',
                  lineHeight: 1.95,
                  maxWidth: 650,
                  margin: 0,
                }}
              >
                {profile.heroText ||
                  'I’m a BCA Data Science student building thoughtful web applications and strengthening my foundations in software engineering, data structures, and full-stack development.'}
              </motion.p>

              {/* ACTION BUTTONS */}
              <motion.div
                variants={fadeUp}
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 30,
                }}
              >
                <a href="#projects" className="btn btn-primary">
                  Explore projects <ArrowDown size={16} />
                </a>

                <a href="#contact" className="btn">
                  Let’s connect <ArrowUpRight size={16} />
                </a>

                {settings.resumeVisible && profile.resume?.url && (
                  <a
                    className="btn"
                    href={profile.resume.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Resume <ExternalLink size={15} />
                  </a>
                )}
              </motion.div>

              {/* SOCIAL LINKS */}
              <motion.div
                variants={fadeUp}
                style={{
                  display: 'flex',
                  gap: 11,
                  marginTop: 30,
                  flexWrap: 'wrap',
                }}
              >
                {profile.githubUrl && (
                  <SocialLink href={profile.githubUrl} label="GitHub">
                    <Github size={19} />
                  </SocialLink>
                )}

                {profile.linkedinUrl && (
                  <SocialLink href={profile.linkedinUrl} label="LinkedIn">
                    <Linkedin size={19} />
                  </SocialLink>
                )}

                <SocialLink
                  href={`mailto:${profile.email || 'alamnabiullha@gmail.com'}`}
                  label="Email"
                >
                  <Mail size={19} />
                </SocialLink>
              </motion.div>
            </div>

            {/* CIRCULAR PROFILE PHOTO */}
            <motion.div
              variants={fadeUp}
              style={{
                width: '100%',
                maxWidth: 250,
                justifySelf: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {profile.photo?.url ? (
                <div
                  style={{
                    width: 'clamp(150px, 20vw, 210px)',
                    aspectRatio: '1 / 1',
                    padding: 5,
                    borderRadius: '50%',
                    border: '2px solid rgba(181,243,107,0.85)',
                    background: 'linear-gradient(145deg, #283a2b, #101411)',
                    boxShadow:
                      '0 0 22px rgba(181,243,107,0.18), 0 10px 28px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={profile.photo.url}
                    alt={profile.name || 'Profile photo'}
                    loading="eager"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 'clamp(150px, 20vw, 210px)',
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    border: '2px dashed rgba(181,243,107,0.4)',
                    background: '#141a15',
                    display: 'grid',
                    placeItems: 'center',
                    color: ACCENT,
                    textAlign: 'center',
                    padding: 20,
                    boxSizing: 'border-box',
                  }}
                >
                  Upload your profile photo in Admin
                </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* QUICK PROFILE INFORMATION */}
        <section
          className="container"
          style={{
            padding: '30px 0 46px',
            borderTop: '1px solid #202922',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
              gap: 14,
            }}
          >
            {[
              {
                icon: GraduationCap,
                label: 'Education',
                value: college
                  ? `${college.degree || ''} ${college.field || ''}`.trim() ||
                  college.institution
                  : 'Add education details in Admin',
              },
              {
                icon: Sparkles,
                label: 'CGPA / Marks',
                value: college?.score || college?.percentage || '—',
              },
              {
                icon: MapPin,
                label: 'Based in',
                value: profile.location || '—',
              },

            ].map((item) => {
              const Icon = item.icon;

              return (
                <Surface
                  key={item.label}
                  style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 13,
                  }}
                >
                  <div
                    style={{
                      width: 39,
                      height: 39,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 11,
                      background: 'rgba(181,243,107,0.08)',
                      color: ACCENT,
                    }}
                  >
                    <Icon size={19} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      className="eyebrow"
                      style={{ fontSize: 10, marginBottom: 8 }}
                    >
                      {item.label}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.7,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                </Surface>
              );
            })}
          </div>
        </section>



        {/* ABOUT AND EDUCATION */}
        {settings.sectionVisibility?.about !== false && (
          <section className="section" id="about">
            <div className="container">
              <SectionTitle
                number=""
                eyebrow="About me"
                title="Aspiring Software Engineer. Building real-world solutions."
                desc={profile.about || 'Add your introduction in Admin → Profile.'}
              />

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 255px), 1fr))',
                  gap: 16,
                }}
              >
                {education.map((item, i) => {
                  const startYear = item.startYear || item.startDate;
                  const endYear = item.endYear || item.endDate;

                  const period =
                    item.period ||
                    (startYear && endYear
                      ? `${startYear} – ${endYear}`
                      : startYear || endYear || '');

                  return (
                    <motion.div key={item._id || i} variants={fadeUp}>
                      <Surface style={{ padding: 24, height: '100%' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 23,
                          }}
                        >
                          <GraduationCap size={25} color={ACCENT} />
                          <span className="tag">
                            {item.level || 'Education'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 19, lineHeight: 1.5 }}>
                          {item.degree || item.level}
                        </h3>

                        <p
                          className="muted"
                          style={{ fontSize: 13, lineHeight: 1.8 }}
                        >
                          {item.institution}
                        </p>

                        <span className="tag">
                          {item.score ||
                            item.percentage ||
                            item.board ||
                            'Education record'}
                        </span>

                        {period && (
                          <p
                            className="muted"
                            style={{ fontSize: 12, marginTop: 10 }}
                          >
                            {period}
                          </p>
                        )}
                      </Surface>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        )}

        {/* SKILLS */}
        {settings.sectionVisibility?.skills !== false && (
          <section
            className="section"
            id="skills"
            style={{ background: '#0c100d' }}
          >
            <div className="container">
              <SectionTitle
                number="02"
                eyebrow="My toolkit"
                title="Tools I work with."
                desc="A growing set of skills I use while learning, building, and improving."
              />

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.12 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                  gap: 16,
                }}
              >
                {groupSkills(skills).map(([group, items]) => (
                  <motion.div key={group} variants={fadeUp}>
                    <Surface style={{ padding: 23, height: '100%' }}>
                      <h3 style={{ fontSize: 16 }}>
                        <Code2 size={18} color={ACCENT} /> {group}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                        {items.map((skill) => {
                          const name =
                            typeof skill === 'string' ? skill : skill.name;

                          return (
                            <span className="tag" key={name}>
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    </Surface>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}



        {/* PROJECTS */}
        {settings.sectionVisibility?.projects !== false && (
          <section
            className="section relative isolate overflow-hidden"
            id="projects"
          >
            {/* Background Video */}
            <video
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source
                src="/videos/projects-background.mp4"
                type="video/mp4"
              />
            </video>

            {/* Dark Overlay */}
            <div className="absolute inset-0 -z-10 bg-black/70 pointer-events-none" />

            <div className="container relative z-10">
              <SectionTitle
                number="03"
                eyebrow="Selected work"
                title="Ideas turned into applications."
                desc="Explore my projects, source code, live applications, and video demonstrations."
              />

              {projects.length > 0 ? (
                <>
                  {/* Search and Category Filter */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 15,
                      flexWrap: 'wrap',
                      marginBottom: 25,
                    }}
                  >
                    <p className="muted">
                      {filteredProjects.length} projects found
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <input
                        className="input"
                        aria-label="Search projects"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(event) =>
                          setProjectSearch(event.target.value)
                        }
                      />

                      <select
                        className="input"
                        aria-label="Filter projects"
                        value={projectCategory}
                        onChange={(event) =>
                          setProjectCategory(event.target.value)
                        }
                      >
                        <option value="All">All categories</option>

                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project Cards */}
                  {filteredProjects.length > 0 ? (
                    <motion.div
                      layout
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
                        gap: 20,
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project) => {
                          const demoVideoUrl =
                            project.documentationUrl ||
                            project.documentationURL ||
                            '';

                          return (
                            <motion.div
                              key={
                                project._id ||
                                project.slug ||
                                project.name
                              }
                              layout
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.97 }}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                              }}
                            >
                              <ProjectCard project={project} />

                              {/* Video Demo Link */}
                              {demoVideoUrl.trim() && (
                                <a
                                  href={demoVideoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    width: '100%',
                                    textDecoration: 'none',
                                    boxSizing: 'border-box',
                                  }}
                                  aria-label={`Watch demo video for ${project.name}`}
                                >
                                  <span aria-hidden="true">▶</span>
                                  Watch Project Demo
                                  <span aria-hidden="true">↗</span>
                                </a>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <Surface
                      style={{
                        padding: 30,
                        textAlign: 'center',
                      }}
                    >
                      <p>No projects match your search.</p>

                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setProjectSearch('');
                          setProjectCategory('All');
                        }}
                      >
                        Clear filters
                      </button>
                    </Surface>
                  )}
                </>
              ) : (
                <Surface style={{ padding: 28 }}>
                  <Code2 color={ACCENT} size={28} />
                  <p className="muted">
                    Add or publish projects from your admin dashboard.
                  </p>
                </Surface>
              )}
            </div>
          </section>
        )}



        {/* ACHIEVEMENTS AND EXPERIENCE */}
        {settings.sectionVisibility?.achievements !== false && (
          <section className="section" id="achievements" style={{ background: '#0c100d' }}>
            <div className="container">
              <SectionTitle
                number="04"
                eyebrow="Achievements & Certificates"
                title="Milestones worth sharing."
                desc="Explore my certificates, technical achievements, competitions, and experience."
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
                  gap: 24,
                }}
              >
                {[...achievements, ...experiences].length > 0 ? (
                  [...achievements, ...experiences].map((item, i) => {
                    const isExperience =
                      experiences.includes(item) && !achievements.includes(item);
                    const certificate = item.certificate;
                    const certificateUrl = certificate?.url;
                    const key =
                      item._id || item.id || `${item.title || item.role}-${i}`;
                    const failed = Boolean(failedCertificates[key]);
                    const title = item.title || item.role || 'Achievement';
                    const organization =
                      item.organization ||
                      item.eventName ||
                      item.company ||
                      'Organization';
                    const description =
                      item.description || 'A milestone in my learning journey.';
                    const isPdf =
                      certificate?.format?.toLowerCase() === 'pdf' ||
                      certificate?.resourceType === 'raw' ||
                      /\.pdf(?:$|[?#])/i.test(certificateUrl || '');

                    return (
                      <motion.article
                        key={key}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="panel"
                        style={{
                          overflow: 'hidden',
                          borderRadius: 18,
                          border: '1px solid rgba(181,243,107,0.15)',
                          background: '#111612',
                        }}
                      >
                        <div
                          style={{
                            height: 250,
                            padding: 12,
                            background: '#f1f5f9',
                            display: 'grid',
                            placeItems: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {certificateUrl && !failed ? (
                            isPdf ? (
                              <iframe
                                title={`${title} certificate`}
                                src={certificateUrl}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  border: 0,
                                  background: '#fff',
                                }}
                              />
                            ) : (
                              <img
                                src={certificateUrl}
                                alt={`${title} certificate`}
                                loading="lazy"
                                onClick={() => setPreview(certificate)}
                                onError={() =>
                                  setFailedCertificates((previous) => ({
                                    ...previous,
                                    [key]: true,
                                  }))
                                }
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  cursor: 'pointer',
                                }}
                              />
                            )
                          ) : (
                            <div style={{ textAlign: 'center', color: '#64748b' }}>
                              {isExperience ? (
                                <BriefcaseBusiness size={38} />
                              ) : (
                                <Trophy size={38} />
                              )}
                              <p>
                                {failed
                                  ? 'Certificate image could not load'
                                  : 'No certificate uploaded'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div style={{ padding: 22 }}>
                          <h3 style={{ fontSize: 19 }}>{title}</h3>
                          <p style={{ color: ACCENT, fontSize: 13 }}>
                            {organization}
                          </p>
                          <p className="muted" style={{ fontSize: 13, lineHeight: 1.85 }}>
                            {description}
                          </p>

                          {item.date && (
                            <p className="muted" style={{ fontSize: 12 }}>
                              {item.date}
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {certificateUrl && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setPreview(certificate)}
                              >
                                View Certificate <ArrowUpRight size={15} />
                              </button>
                            )}

                            {item.verificationUrl && (
                              <a
                                className="btn"
                                href={item.verificationUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Verify <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })
                ) : (
                  <Surface style={{ padding: 30 }}>
                    <p className="muted">
                      Add achievements and certificates from the admin dashboard.
                    </p>
                  </Surface>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {settings.sectionVisibility?.contact !== false && (
          <section className="section" id="contact">
            <div className="container">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: 45,
                  alignItems: 'start',
                }}
              >
                <div>
                  <SectionTitle
                    number="05"
                    eyebrow="Get in touch"
                    title="Let’s build something useful."
                    desc="I’m interested in internship and software engineering opportunities. Send a note and I’ll get back to you."
                  />

                  <Surface style={{ padding: 22, marginBottom: 15 }}>
                    <Mail size={20} color={ACCENT} />
                    <p className="eyebrow">Email me</p>
                    <a
                      href={`mailto:${profile.email || 'alamnabiullha@gmail.com'}`}
                      style={{ color: '#e3eadf', overflowWrap: 'anywhere' }}
                    >
                      {profile.email || 'alamnabiullha@gmail.com'}
                    </a>
                  </Surface>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {profile.githubUrl && (
                      <a className="btn" href={profile.githubUrl} target="_blank" rel="noreferrer">
                        <Github size={16} /> GitHub
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a className="btn" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                        <Linkedin size={16} /> LinkedIn
                      </a>
                    )}
                    {profile.phone && (
                      <a className="btn" href={`tel:${profile.phone}`}>
                        <Send size={15} /> Call
                      </a>
                    )}
                  </div>
                </div>

                <Surface style={{ padding: 'clamp(20px, 4vw, 30px)' }}>
                  <h3 style={{ fontSize: 23 }}>Send a message</h3>
                  <p className="muted" style={{ fontSize: 13 }}>
                    Have an opportunity or project in mind? Let’s talk.
                  </p>

                  <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                    {/* Spam honeypot */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '-10000px',
                        width: 1,
                        height: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <label>
                        Leave blank
                        <input
                          tabIndex={-1}
                          autoComplete="off"
                          name="website"
                          value={form.website}
                          onChange={(event) =>
                            setForm({ ...form, website: event.target.value })
                          }
                        />
                      </label>
                    </div>

                    <input
                      required
                      maxLength={100}
                      className="input"
                      placeholder="Your name"
                      aria-label="Your name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />

                    <input
                      required
                      type="email"
                      maxLength={254}
                      className="input"
                      placeholder="Email address"
                      aria-label="Email address"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                    />

                    <input
                      maxLength={120}
                      className="input"
                      placeholder="Company or organization (optional)"
                      aria-label="Company or organization"
                      value={form.organization}
                      onChange={(event) =>
                        setForm({ ...form, organization: event.target.value })
                      }
                    />

                    <input
                      required
                      maxLength={160}
                      className="input"
                      placeholder="Subject"
                      aria-label="Subject"
                      value={form.subject}
                      onChange={(event) =>
                        setForm({ ...form, subject: event.target.value })
                      }
                    />

                    <textarea
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={5}
                      className="input"
                      placeholder="Tell me about the opportunity..."
                      aria-label="Your message"
                      value={form.message}
                      onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                      }
                    />

                    {result && (
                      <div
                        role="status"
                        aria-live="polite"
                        className={result.startsWith('Thanks') ? 'notice' : 'error'}
                        style={{
                          display: 'flex',
                          gap: 9,
                          fontSize: 13,
                          lineHeight: 1.7,
                        }}
                      >
                        {result.startsWith('Thanks') && (
                          <CheckCircle2 size={17} />
                        )}
                        {result}
                      </div>
                    )}

                    <button
                      disabled={sending}
                      className="btn btn-primary"
                      type="submit"
                    >
                      {sending ? 'Sending message...' : 'Send message'}
                      {!sending && <ArrowUpRight size={16} />}
                    </button>
                  </form>
                </Surface>
              </div>
            </div>
          </section>
        )}

        {/* CERTIFICATE MODAL */}
        <AnimatePresence>
          {preview && (
            <CertificateModal
              certificate={preview}
              onClose={() => setPreview(null)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid #202922',
          background: '#0c100d',
        }}
      >
        <div
          className="container"
          style={{
            padding: '25px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 15,
            color: '#98a49b',
            fontSize: 12,
          }}
        >
          <span>
            © {new Date().getFullYear()} {profile.name || 'Nabiullha Alam'}.
            Built with care.
          </span>

          <Link
            to="/admin/login"
            style={{
              color: '#b5c0b5',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            Admin access <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>
    </>
  );
}

function CertificateModal({ certificate, onClose }) {
  const isPdf =
    certificate?.format?.toLowerCase() === 'pdf' ||
    certificate?.resourceType === 'raw' ||
    /\.pdf(?:$|[?#])/i.test(certificate?.url || '');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Certificate preview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(12px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className="panel"
        style={{
          width: 'min(1000px, 100%)',
          height: 'min(85vh, 780px)',
          padding: 12,
          position: 'relative',
          borderRadius: 18,
          border: '1px solid rgba(181,243,107,0.2)',
          background: '#111612',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={onClose}
          aria-label="Close certificate preview"
          title="Close preview"
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 2,
            width: 42,
            height: 42,
            padding: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 11,
            background: '#182019',
          }}
        >
          <X size={18} />
        </button>

        {certificate?.url ? (
          isPdf ? (
            <iframe
              title="Certificate PDF"
              src={certificate.url}
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                borderRadius: 12,
                background: '#fff',
              }}
            />
          ) : (
            <img
              src={certificate.url}
              alt="Certificate"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 12,
              }}
            />
          )
        ) : (
          <div
            className="muted"
            style={{
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: 20,
            }}
          >
            Certificate preview is unavailable.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
