import { projects } from "@/lib/projects";
import { SITE_NAME, SITE_DESCRIPTION, CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/constants";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

// Plain-text, Markdown-formatted summary of the site for AI crawlers and
// answer engines (ChatGPT, Perplexity, Claude, etc). Not an official web
// standard, but an emerging convention (see llmstxt.org) that several of
// these crawlers now check for — the equivalent of robots.txt/sitemap.xml,
// but written for an LLM to read rather than a search-index bot to parse.
// Regenerated from `projects` at request time so it never drifts out of
// sync with the site.
export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} is a real estate agency listing luxury off-plan (pre-construction) residential developments in Dubai, UAE. The site is available in English, Arabic, Persian, Serbian and Turkish.`,
    "",
    `Contact: ${CONTACT_EMAIL} | WhatsApp: ${WHATSAPP_DISPLAY}`,
    "",
    "## Projects",
    "",
  ];

  for (const project of projects) {
    const url = absoluteUrl(`/projects/${project.slug}`);
    const developer = project.developer ? `Developer: ${project.developer}. ` : "";
    const handover = project.handover ? `Handover: ${project.handover}. ` : "";
    lines.push(
      `- [${project.name}](${url}): ${project.summary} Starting price: ${project.startingPrice}. ${developer}${handover}Community: ${project.community}.`
    );
  }

  lines.push("", "## Other resources", "", `- Sitemap: ${absoluteUrl("/sitemap.xml")}`, `- Homepage: ${SITE_URL}`);

  return lines.join("\n") + "\n";
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
