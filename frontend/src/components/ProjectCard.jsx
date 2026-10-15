import {
    ArrowUpRight,
    Github,
    ExternalLink,
    Code2,
} from 'lucide-react';

import { PlayCircle } from 'lucide-react';

import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
    // Use the existing admin Documentation URL for the project video
    const documentationUrl =
        project.documentationUrl || project.documentationURL || '';

    return (
        <article
            className="panel group"
            style={{
                overflow: 'hidden',
                position: 'relative',
                borderRadius: 20,
                border: '1px solid rgba(181,243,107,0.12)',
                background: 'linear-gradient(145deg, #151c18, #101411)',
                transition:
                    'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-7px)';
                e.currentTarget.style.borderColor = 'rgba(181,243,107,0.4)';
                e.currentTarget.style.boxShadow =
                    '0 18px 45px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor =
                    'rgba(181,243,107,0.12)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Project Cover */}
            <div
                style={{
                    height: 210,
                    position: 'relative',
                    overflow: 'hidden',
                    background: project.cover?.url
                        ? `center / cover no-repeat url("${project.cover.url}")`
                        : 'radial-gradient(circle at 70% 20%, #354b32, #111815 65%)',
                }}
            >
                {project.cover?.url ? (
                    <img
                        src={project.cover.url}
                        alt={`${project.name} project cover`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.5s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <span
                            className="mono"
                            style={{
                                fontSize: 52,
                                fontWeight: 800,
                                letterSpacing: -3,
                                color: '#b5f36b',
                                textShadow: '0 0 35px rgba(181,243,107,0.2)',
                            }}
                        >
                            {project.name?.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Cover Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to top, rgba(10,15,12,0.75), transparent 65%)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Category */}
                <div
                    style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                    }}
                >
                    <span
                        className="tag"
                        style={{
                            backdropFilter: 'blur(12px)',
                            background: 'rgba(15,22,17,0.8)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            padding: '7px 11px',
                            borderRadius: 8,
                            fontSize: 11,
                        }}
                    >
                        {project.category || 'Selected Project'}
                    </span>
                </div>

                {/* Featured Badge */}
                {project.featured && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                        }}
                    >
                        <span
                            className="tag"
                            style={{
                                background: '#b5f36b',
                                color: '#11180e',
                                border: '1px solid #b5f36b',
                                borderRadius: 8,
                                padding: '7px 11px',
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: 0.8,
                            }}
                        >
                            ★ FEATURED
                        </span>
                    </div>
                )}
            </div>

            {/* Project Details */}
            <div style={{ padding: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <p
                            className="eyebrow"
                            style={{
                                margin: '0 0 10px',
                                fontSize: 11,
                                letterSpacing: 1.5,
                                textTransform: 'uppercase',
                                color: '#b5f36b',
                            }}
                        >
                            Project Showcase
                        </p>

                        <h3
                            style={{
                                margin: '0 0 12px',
                                fontSize: 23,
                                lineHeight: 1.3,
                                fontWeight: 750,
                                letterSpacing: -0.6,
                                color: '#f2f5ef',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {project.name}
                        </h3>
                    </div>

                    <div
                        style={{
                            width: 38,
                            height: 38,
                            minWidth: 38,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 11,
                            color: '#b5f36b',
                            background: 'rgba(181,243,107,0.08)',
                            border: '1px solid rgba(181,243,107,0.16)',
                        }}
                    >
                        <Code2 size={19} />
                    </div>
                </div>

                {/* Description */}
                <p
                    className="muted"
                    style={{
                        margin: '0 0 20px',
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: '#a4aea5',
                        minHeight: 50,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {project.shortDescription ||
                        'Project details will be added.'}
                </p>

                {/* Technologies */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 24,
                    }}
                >
                    {(project.technologies || []).slice(0, 4).map((tech) => (
                        <span
                            className="tag"
                            key={tech}
                            style={{
                                padding: '6px 10px',
                                fontSize: 11,
                                borderRadius: 7,
                                color: '#c9d4c7',
                                background: 'rgba(255,255,255,0.035)',
                                border: '1px solid rgba(255,255,255,0.09)',
                            }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        paddingTop: 18,
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <Link
                        className="btn btn-primary"
                        to={`/projects/${project.slug}`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '11px 16px',
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'transform 0.2s ease',
                        }}
                    >
                        Explore Project
                        <ArrowUpRight size={16} />
                    </Link>

                    {/* GitHub */}
                    {project.githubUrl && (
                        <a
                            className="btn"
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View source code on GitHub"
                            title="View GitHub Repository"
                            style={{
                                width: 43,
                                height: 43,
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.035)',
                                color: '#e4ebe2',
                                transition:
                                    'background 0.2s ease, border-color 0.2s ease',
                            }}
                        >
                            <Github size={18} />
                        </a>
                    )}



                    {/* Live Demo */}
                    {project.liveUrl && (
                        <a
                            className="btn"
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open live project demo"
                            title="View Live Demo 🚀"
                            style={{
                                width: 43,
                                height: 43,
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 10,
                                border: '1px solid rgba(181,243,107,0.2)',
                                background: 'rgba(181,243,107,0.07)',
                                color: '#b5f36b',
                                fontSize: 20,
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                        >
                            🚀
                        </a>
                    )}


                    {/* Project Video: Admin Documentation URL */}
                    {documentationUrl && (
                        <a
                            className="btn"
                            href={documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Watch ${project.name} project video`}
                            title="Watch Project Video"
                            style={{
                                width: 43,
                                height: 43,
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 10,
                                border: '1px solid rgba(181,243,107,0.2)',
                                background: 'rgba(181,243,107,0.07)',
                                color: '#b5f36b',
                                transition:
                                    'background 0.2s ease, border-color 0.2s ease',
                            }}
                        >
                            <PlayCircle size={18} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
