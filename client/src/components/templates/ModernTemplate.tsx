import { A4_HEIGHT, A4_WIDTH, bulletsOf, contactLine, dateRange, type TemplateProps } from "./shared";

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#0F172A",
  borderLeft: "3px solid #3B82F6",
  paddingLeft: 10,
  marginBottom: 10,
};

export function ModernTemplate({ content }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications } = content;

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        background: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        color: "#0F172A",
      }}
    >
      <div style={{ background: "#0F172A", color: "#FFFFFF", padding: "36px 44px" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {personalInfo.fullName || "Your Name"}
        </div>
        <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 10 }}>
          {contactLine(personalInfo)}
        </div>
      </div>

      <div style={{ padding: "28px 44px" }}>
        {personalInfo.summary && (
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Summary</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#334155" }}>
              {personalInfo.summary}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Experience</div>
            {experience.map((job) => (
              <div key={job.id} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {job.role}
                    {job.company ? ` — ${job.company}` : ""}
                  </span>
                  <span style={{ fontWeight: 500, color: "#94A3B8", fontSize: 11.5 }}>
                    {dateRange(job)}
                  </span>
                </div>
                {bulletsOf(job).map((bullet, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      marginTop: 4,
                      paddingLeft: 14,
                      position: "relative",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ position: "absolute", left: 0 }}>•</span>
                    {bullet}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Education</div>
            {education.map((edu) => (
              <div key={edu.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>
                <strong>
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ""}
                </strong>{" "}
                — {edu.school} {dateRange(edu) ? `(${dateRange(edu)})` : ""}
                {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Skills</div>
            {skills.map((group) => (
              <div key={group.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 4 }}>
                {group.category ? <strong>{group.category}: </strong> : null}
                {group.items.join(", ")}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Projects</div>
            {projects.map((project) => (
              <div key={project.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>
                <strong>{project.name}</strong>
                {project.description ? ` — ${project.description}` : ""}
                {project.techStack ? ` (${project.techStack})` : ""}
                {project.link ? ` · ${project.link}` : ""}
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={sectionTitle}>Certifications</div>
            {certifications.map((cert) => (
              <div key={cert.id} style={{ fontSize: 12.5, color: "#334155", marginBottom: 4 }}>
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
