import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function buildHtml(data: any) {
  const projects = (data.projects || []).slice(0, 2)
  const internships = (data.internships || []).slice(0, 2)
  const technicalSkills = (data.skills?.technical || []).slice(0, 8)
  const toolSkills = (data.skills?.tools || []).slice(0, 6)
  const softSkills = (data.skills?.soft || []).slice(0, 6)
  const certifications = (data.certifications || []).slice(0, 3)
  const achievements = (data.achievements || []).slice(0, 3)

  const fullName = `${data.personal?.firstName || ""} ${data.personal?.lastName || ""}`.trim()
  const contactLine = [
    data.personal?.email,
    data.personal?.phone,
    data.personal?.linkedin,
    data.personal?.github,
    data.personal?.portfolio
  ].filter(Boolean).join(" | ")

  const educationLine = `${data.academic?.course || ""}${data.academic?.specialization ? `, ${data.academic.specialization}` : ""}`
  const eduMeta = [
    data.academic?.year,
    data.academic?.cgpa ? `CGPA: ${data.academic.cgpa}` : null,
    data.academic?.expectedGraduation ? `Graduation: ${data.academic.expectedGraduation}` : null
  ].filter(Boolean).join(" | ")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${fullName} - Resume</title>
  <style>
    @page { size: A4; margin: 12mm; }
    html, body { padding: 0; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Inter, Arial, sans-serif; color: #111; }
    .container { max-width: 800px; margin: 0 auto; padding: 0; }
    .header { text-align: center; margin-bottom: 8px; }
    .name { font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
    .contact { font-size: 11px; color: #333; margin-top: 6px; }
    .section { margin-top: 12px; }
    .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .item-title { font-weight: 600; font-size: 12px; }
    .item-sub { font-size: 11px; color: #444; }
    ul { padding-left: 16px; margin: 4px 0 0 0; }
    li { font-size: 11px; line-height: 1.35; margin-bottom: 3px; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .skill-pill { font-size: 11px; border: 1px solid #ddd; border-radius: 6px; padding: 2px 6px; }
    .small { font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="name">${fullName || "Unnamed Student"}</div>
      <div class="contact">${contactLine || ""}</div>
    </div>

    <div class="section">
      <div class="section-title">Education</div>
      <div class="item-title">${educationLine || ""}</div>
      <div class="item-sub">${eduMeta || ""}</div>
      <div class="small">10th: ${data.academic?.tenthMarks || ""} (${data.academic?.tenthBoard || ""}, ${data.academic?.tenthYear || ""})</div>
      <div class="small">12th: ${data.academic?.twelfthMarks || ""} (${data.academic?.twelfthBoard || ""}, ${data.academic?.twelfthYear || ""})</div>
    </div>

    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-list">
        ${technicalSkills.map((s: string) => `<span class="skill-pill">${s}</span>`).join("")}
      </div>
      ${toolSkills.length ? `<div class="small" style="margin-top:6px"><strong>Tools:</strong> ${toolSkills.join(", ")}</div>` : ""}
      ${softSkills.length ? `<div class="small" style="margin-top:4px"><strong>Soft:</strong> ${softSkills.join(", ")}</div>` : ""}
    </div>

    ${projects.length ? `<div class="section">
      <div class="section-title">Projects</div>
      ${projects.map((p: any) => `
        <div>
          <div class="item-title">${p.title || "Project"}</div>
          <div class="item-sub">${[p.technologies, p.duration].filter(Boolean).join(" | ")}</div>
          ${p.description ? `<ul><li>${p.description}</li></ul>` : ""}
          ${p.github ? `<div class="small">GitHub: ${p.github}</div>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${internships.length ? `<div class="section">
      <div class="section-title">Internships</div>
      ${internships.map((i: any) => `
        <div>
          <div class="item-title">${[i.company, i.position].filter(Boolean).join(" — ")}</div>
          <div class="item-sub">${[i.location, i.duration].filter(Boolean).join(" | ")}</div>
          ${i.description ? `<ul><li>${i.description}</li></ul>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${certifications.length ? `<div class="section">
      <div class="section-title">Certifications</div>
      <ul>
        ${certifications.map((c: any) => `<li>${[c.name, c.issuer, c.date].filter(Boolean).join(" — ")}</li>`).join("")}
      </ul>
    </div>` : ""}

    ${achievements.length ? `<div class="section">
      <div class="section-title">Achievements</div>
      <ul>
        ${achievements.map((a: any) => `<li>${[a.title, a.date].filter(Boolean).join(" — ")}${a.description ? `: ${a.description}` : ""}</li>`).join("")}
      </ul>
    </div>` : ""}
  </div>
</body>
</html>`
}

function buildHtmlJake(data: any) {
  const projects = (data.projects || []).slice(0, 3)
  const internships = (data.internships || []).slice(0, 2)
  const technicalSkills = (data.skills?.technical || []).slice(0, 10)
  const toolSkills = (data.skills?.tools || []).slice(0, 8)
  const softSkills = (data.skills?.soft || []).slice(0, 6)
  const certifications = (data.certifications || []).slice(0, 4)
  const achievements = (data.achievements || []).slice(0, 4)

  const fullName = `${data.personal?.firstName || ""} ${data.personal?.lastName || ""}`.trim()
  const location = data.personal?.location || ""
  const contactItems = [
    data.personal?.email,
    data.personal?.phone,
    data.personal?.linkedin,
    data.personal?.github,
    data.personal?.portfolio
  ].filter(Boolean)

  const educationLine = `${data.academic?.course || ""}${data.academic?.specialization ? `, ${data.academic.specialization}` : ""}`
  const eduMeta = [
    data.academic?.year,
    data.academic?.cgpa ? `CGPA: ${data.academic.cgpa}` : null,
    data.academic?.expectedGraduation ? `Graduation: ${data.academic.expectedGraduation}` : null
  ].filter(Boolean).join(" • ")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${fullName} - Resume</title>
  <style>
    @page { size: A4; margin: 12mm; }
    html, body { padding: 0; margin: 0; }
    body { font-family: Inter, Segoe UI, Roboto, Arial, sans-serif; color: #111; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .name { font-size: 26px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; }
    .subheader { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #333; }
    .contacts { display: flex; flex-wrap: wrap; gap: 10px; }
    .section { margin-top: 12px; }
    .section-title { font-size: 12.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 2px solid #222; padding-bottom: 3px; }
    .item { margin-top: 6px; }
    .item-title { font-weight: 700; font-size: 12px; }
    .item-sub { font-size: 11px; color: #444; }
    .bullets { margin: 4px 0 0 0; padding-left: 16px; }
    .bullets li { font-size: 11px; line-height: 1.35; margin-bottom: 3px; }
    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .skill-pill { font-size: 11px; border: 1px solid #aaa; border-radius: 6px; padding: 2px 6px; background: #f8f8f8; }
    .meta { font-size: 11px; color: #444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="name">${fullName || "Unnamed Student"}</div>
      <div class="subheader">
        <div class="meta">${location || ""}</div>
        <div class="contacts">${contactItems.map((c: string) => `<span>${c}</span>`).join(" • ")}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Education</div>
      <div class="item">
        <div class="item-title">${educationLine || ""}</div>
        <div class="item-sub">${eduMeta || ""}</div>
        <div class="meta">10th: ${data.academic?.tenthMarks || ""} (${data.academic?.tenthBoard || ""}, ${data.academic?.tenthYear || ""})</div>
        <div class="meta">12th: ${data.academic?.twelfthMarks || ""} (${data.academic?.twelfthBoard || ""}, ${data.academic?.twelfthYear || ""})</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-row">
        ${technicalSkills.map((s: string) => `<span class="skill-pill">${s}</span>`).join("")}
      </div>
      ${toolSkills.length ? `<div class="meta" style="margin-top:6px"><strong>Tools:</strong> ${toolSkills.join(", ")}</div>` : ""}
      ${softSkills.length ? `<div class="meta" style="margin-top:4px"><strong>Soft:</strong> ${softSkills.join(", ")}</div>` : ""}
    </div>

    ${projects.length ? `<div class="section">
      <div class="section-title">Projects</div>
      ${projects.map((p: any) => `
        <div class="item">
          <div class="item-title">${p.title || "Project"}</div>
          <div class="item-sub">${[p.technologies, p.duration].filter(Boolean).join(" • ")}</div>
          ${p.description ? `<ul class="bullets"><li>${p.description}</li></ul>` : ""}
          ${p.github ? `<div class="meta">GitHub: ${p.github}</div>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${internships.length ? `<div class="section">
      <div class="section-title">Internships</div>
      ${internships.map((i: any) => `
        <div class="item">
          <div class="item-title">${[i.company, i.position].filter(Boolean).join(" — ")}</div>
          <div class="item-sub">${[i.location, i.duration].filter(Boolean).join(" • ")}</div>
          ${i.description ? `<ul class="bullets"><li>${i.description}</li></ul>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${certifications.length ? `<div class="section">
      <div class="section-title">Certifications</div>
      <ul class="bullets">
        ${certifications.map((c: any) => `<li>${[c.name, c.issuer, c.date].filter(Boolean).join(" — ")}</li>`).join("")}
      </ul>
    </div>` : ""}

    ${achievements.length ? `<div class="section">
      <div class="section-title">Achievements</div>
      <ul class="bullets">
        ${achievements.map((a: any) => `<li>${[a.title, a.date].filter(Boolean).join(" — ")}${a.description ? `: ${a.description}` : ""}</li>`).join("")}
      </ul>
    </div>` : ""}
  </div>
</body>
</html>`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = body?.data || {}
    const style = body?.style || "ats"

    const html = style === "jake" ? buildHtmlJake(data) : buildHtml(data)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    })

    await browser.close()

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(data.personal?.firstName || "Resume") + "_Resume"}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error("PDF generation error:", err)
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}