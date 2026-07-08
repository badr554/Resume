import { A4_HEIGHT, A4_WIDTH, bulletsOf, contactLine, dateRange, type TemplateProps } from "./shared";

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  color: "#000000",
  margin: "18px 0 8px 0",
};

export function ATSSafeTemplate({ content }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects, certifications } = content;

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        background: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        color: "#000000",
        padding: "48px 52px",
        fontSize: 12.5,
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700 }}>{personalInfo.fullName || "Your Name"}</div>
      <div style={{ marginTop: 6 }}>{contactLine(personalInfo)}</div>

      {personalInfo.summary && (
        <div>
          <div style={sectionTitle}>Summary</div>
          <div>{personalInfo.summary}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <div style={sectionTitle}>Experience</div>
          {experience.map((job) => (
            <div key={job.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>
                {job.role}
                {job.company ? `, ${job.company}` : ""}
                {dateRange(job) ? ` (${dateRange(job)})` : ""}
              </div>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
                {bulletsOf(job).map((bullet, i) => (
                  <li key={i} style={{ marginTop: 2 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div>
          <div style={sectionTitle}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: 6 }}>
              {edu.degree}
              {edu.field ? `, ${edu.field}` : ""} - {edu.school}
              {dateRange(edu) ? ` (${dateRange(edu)})` : ""}
              {edu.gpa ? `, GPA ${edu.gpa}` : ""}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <div style={sectionTitle}>Skills</div>
          {skills.map((group) => (
            <div key={group.id} style={{ marginBottom: 4 }}>
              {group.category ? `${group.category}: ` : ""}
              {group.items.join(", ")}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div style={sectionTitle}>Projects</div>
          {projects.map((project) => (
            <div key={project.id} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>{project.name}</span>
              {project.description ? ` - ${project.description}` : ""}
              {project.techStack ? ` (${project.techStack})` : ""}
              {project.link ? `. ${project.link}` : ""}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div>
          <div style={sectionTitle}>Certifications</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {certifications.map((cert) => (
              <li key={cert.id} style={{ marginBottom: 2 }}>
                {cert.name}
                {cert.issuer ? `, ${cert.issuer}` : ""}
                {cert.date ? ` (${cert.date})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
