import { A4_HEIGHT, A4_WIDTH, bulletsOf, contactLine, dateRange, type TemplateProps } from "./shared";

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#000000",
  textAlign: "center",
  margin: "0 0 4px 0",
};

const rule: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #000000",
  margin: "0 0 12px 0",
};

export function ClassicTemplate({ content }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications } = content;

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        background: "#FFFFFF",
        fontFamily: "Georgia, serif",
        color: "#000000",
        padding: "48px 56px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{personalInfo.fullName || "Your Name"}</div>
        <div style={{ fontSize: 12, marginTop: 8 }}>{contactLine(personalInfo)}</div>
      </div>

      {personalInfo.summary && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>Summary</div>
          <hr style={rule} />
          <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{personalInfo.summary}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>Experience</div>
          <hr style={rule} />
          {experience.map((job) => (
            <div key={job.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>
                  {job.role}
                  {job.company ? `, ${job.company}` : ""}
                </span>
                <span style={{ fontStyle: "italic", fontSize: 12 }}>{dateRange(job)}</span>
              </div>
              {bulletsOf(job).map((bullet, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    paddingLeft: 16,
                    position: "relative",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ position: "absolute", left: 2 }}>•</span>
                  {bullet}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>Education</div>
          <hr style={rule} />
          {education.map((edu) => (
            <div key={edu.id} style={{ fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>
                {edu.degree}
                {edu.field ? `, ${edu.field}` : ""}
              </span>{" "}
              — {edu.school} {dateRange(edu) ? `(${dateRange(edu)})` : ""}
              {edu.gpa ? `, GPA ${edu.gpa}` : ""}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>Skills</div>
          <hr style={rule} />
          {skills.map((group) => (
            <div key={group.id} style={{ fontSize: 12.5, marginBottom: 4 }}>
              {group.category ? <span style={{ fontWeight: 700 }}>{group.category}: </span> : null}
              {group.items.join(", ")}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>Projects</div>
          <hr style={rule} />
          {projects.map((project) => (
            <div key={project.id} style={{ fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{project.name}</span>
              {project.description ? ` — ${project.description}` : ""}
              {project.techStack ? ` (${project.techStack})` : ""}
              {project.link ? `. ${project.link}` : ""}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <div style={sectionTitle}>Certifications</div>
          <hr style={rule} />
          {certifications.map((cert) => (
            <div key={cert.id} style={{ fontSize: 12.5, marginBottom: 4 }}>
              {cert.name}
              {cert.issuer ? ` — ${cert.issuer}` : ""}
              {cert.date ? ` (${cert.date})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
