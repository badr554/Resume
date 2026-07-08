import { A4_HEIGHT, A4_WIDTH, bulletsOf, contactLine, dateRange, type TemplateProps } from "./shared";

const sectionTitle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#64748B",
  marginBottom: 12,
};

const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #E2E8F0",
  margin: "24px 0",
};

export function MinimalTemplate({ content }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications } = content;

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        background: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        color: "#0F172A",
        padding: "56px 60px",
      }}
    >
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {personalInfo.fullName || "Your Name"}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
          {contactLine(personalInfo)}
        </div>
      </div>

      {personalInfo.summary && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Summary</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.7, color: "#334155" }}>
              {personalInfo.summary}
            </div>
          </div>
        </>
      )}

      {experience.length > 0 && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Experience</div>
            {experience.map((job) => (
              <div key={job.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>
                    {job.role}
                    {job.company ? ` · ${job.company}` : ""}
                  </span>
                  <span style={{ color: "#94A3B8", fontSize: 11.5 }}>{dateRange(job)}</span>
                </div>
                {bulletsOf(job).map((bullet, i) => (
                  <div
                    key={i}
                    style={{ fontSize: 12, color: "#475569", marginTop: 5, lineHeight: 1.6 }}
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {education.length > 0 && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ""}
                </span>{" "}
                · {edu.school} {dateRange(edu) ? `· ${dateRange(edu)}` : ""}
                {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
              </div>
            ))}
          </div>
        </>
      )}

      {skills.length > 0 && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 4 }}>
                {group.category ? <span style={{ fontWeight: 600 }}>{group.category} · </span> : null}
                {group.items.join(", ")}
              </div>
            ))}
          </div>
        </>
      )}

      {projects.length > 0 && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Projects</div>
            {projects.map((project) => (
              <div key={project.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{project.name}</span>
                {project.description ? ` — ${project.description}` : ""}
                {project.techStack ? ` · ${project.techStack}` : ""}
                {project.link ? ` · ${project.link}` : ""}
              </div>
            ))}
          </div>
        </>
      )}

      {certifications.length > 0 && (
        <>
          <hr style={divider} />
          <div>
            <div style={sectionTitle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 4 }}>
                {cert.name}
                {cert.issuer ? ` · ${cert.issuer}` : ""}
                {cert.date ? ` · ${cert.date}` : ""}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
