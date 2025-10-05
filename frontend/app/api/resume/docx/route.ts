import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function mapDocxData(data: any) {
  const fullName = `${data.personal?.firstName || ""} ${data.personal?.lastName || ""}`.trim()
  const contactLine = [
    data.personal?.email,
    data.personal?.phone,
    data.personal?.linkedin,
    data.personal?.github,
    data.personal?.portfolio,
  ].filter(Boolean).join(" | ")

  function joinList(items?: any[], formatter?: (x: any) => string, sep = "\n") {
    if (!items || !items.length) return ""
    return items.map(formatter || ((x:any)=>String(x || ""))).filter(Boolean).join(sep)
  }

  const technicalSkills = joinList(data.skills?.technical, (s:string)=>s, ", ")
  const toolsSkills = joinList(data.skills?.tools, (s:string)=>s, ", ")
  const softSkills = joinList(data.skills?.soft, (s:string)=>s, ", ")

  const projectsList = joinList((data.projects||[]), (p:any)=>{
    const meta = [p.technologies, p.duration].filter(Boolean).join(" • ")
    const desc = p.description ? `: ${p.description}` : ""
    const gh = p.github ? ` [${p.github}]` : ""
    return `• ${p.title || "Project"}${meta?` — ${meta}`:""}${desc}${gh}`
  })

  const internshipsList = joinList((data.internships||[]), (i:any)=>{
    const title = [i.company, i.position].filter(Boolean).join(" — ")
    const meta = [i.location, i.duration].filter(Boolean).join(" • ")
    const desc = i.description ? `: ${i.description}` : ""
    return `• ${title}${meta?` — ${meta}`:""}${desc}`
  })

  const certificationsList = joinList((data.certifications||[]), (c:any)=>{
    return `• ${[c.name, c.issuer, c.date].filter(Boolean).join(" — ")}`
  })

  const achievementsList = joinList((data.achievements||[]), (a:any)=>{
    const base = [a.title, a.date].filter(Boolean).join(" — ")
    return `• ${base}${a.description?`: ${a.description}`:""}`
  })

  return {
    fullName: fullName || "Unnamed Student",
    location: data.personal?.location || data.personal?.address || "",
    email: data.personal?.email || "",
    phone: data.personal?.phone || "",
    linkedin: data.personal?.linkedin || "",
    github: data.personal?.github || "",
    portfolio: data.personal?.portfolio || "",
    contactLine,

    course: data.academic?.course || "",
    specialization: data.academic?.specialization || "",
    year: data.academic?.year || "",
    cgpa: data.academic?.cgpa || "",
    expectedGraduation: data.academic?.expectedGraduation || "",
    tenthMarks: data.academic?.tenthMarks || "",
    tenthBoard: data.academic?.tenthBoard || "",
    tenthYear: data.academic?.tenthYear || "",
    twelfthMarks: data.academic?.twelfthMarks || "",
    twelfthBoard: data.academic?.twelfthBoard || "",
    twelfthYear: data.academic?.twelfthYear || "",

    skillsTechnical: technicalSkills,
    skillsTools: toolsSkills,
    skillsSoft: softSkills,

    projectsList,
    internshipsList,
    certificationsList,
    achievementsList,
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), { status: 400 })
    }

    const form = await req.formData()
    const templateFile = form.get("template") as File | null
    const rawData = form.get("data") as string | null
    if (!templateFile) {
      return new Response(JSON.stringify({ error: "Missing 'template' .docx file" }), { status: 400 })
    }

    const arrayBuffer = await templateFile.arrayBuffer()
    const zip = new PizZip(arrayBuffer)
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

    let dataObj: any = {}
    if (rawData) {
      try { dataObj = JSON.parse(rawData) } catch {}
    }

    const mapped = mapDocxData(dataObj || {})
    doc.setData(mapped)
    doc.render()

    const out = doc.getZip().generate({ type: "nodebuffer" })

    const filenameBase = (mapped.fullName || "Resume").replace(/\s+/g, "_")
    return new Response(out, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filenameBase}_Filled.docx"`,
      },
    })
  } catch (err: any) {
    console.error("DOCX generation error:", err)
    return Response.json({ error: "Failed to generate DOCX" }, { status: 500 })
  }
}