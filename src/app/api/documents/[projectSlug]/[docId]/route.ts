import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getProjectBySlug } from "@/lib/projects";
import { verifyDownloadToken } from "@/lib/download-token";

// Maps each project's document id -> actual filename inside /protected-documents/<slug>/
const DOCUMENT_FILES: Record<string, Record<string, string>> = {
  "eltiera-views": {
    brochure: "Eltiera-Views-Brochure.pdf",
    "payment-plan": "Eltiera-Views-Payment-Plan.pdf",
  },
  "sky-level-1": {
    brochure: "Sky-Level-1-Brochure.pdf",
    "price-list": "Sky-Level-1-Price-List.xlsx",
  },
  "terra-woods": {
    "fact-sheet": "Terra-Woods-Fact-Sheet.pdf",
  },
  "albero-creek": {
    brochure: "albero-creek-brochure.pdf",
    "fact-sheet": "albero-creek-fact-sheet.pdf",
    "floor-plans": "albero-creek-floor-plans.pdf",
    "payment-plan": "albero-creek-payment-plan.pdf",
  },
  "city-walk-crestlane": {
    brochure: "city-walk-crestlane-brochure.pdf",
    "prices-payment-plan": "city-walk-crestlane-prices-payment-plan.pdf",
    "project-briefing": "city-walk-crestlane-project-briefing.pdf",
  },
  "dubai-harbour-residence": {
    brochure: "dubai-harbour-residence-brochure.pdf",
    factsheet: "dubai-harbour-residence-factsheet.pdf",
    "payment-plan": "dubai-harbour-residence-payment-plan.jpeg",
  },
  "jumeirah-asora-bay": {
    brochure: "jumeirah-asora-bay-brochure.pdf",
    "master-plan": "jumeirah-asora-bay-master-plan.pdf",
  },
  "eltiera-views-towers-1-2": {
    brochure: "eltiera-views-brochure.pdf",
    "amenities-plan": "eltiera-views-amenities-plan.pdf",
    "payment-plan": "eltiera-views-payment-plan.pdf",
    "location-map": "eltiera-views-location-map.pdf",
  },
  "fairmont-solara-tower": {
    brochure: "fairmont-residences-solara-tower-brochure.pdf",
  },
  "meriva-sunset": {
    "project-brief": "meriva-sunset-project-brief.pdf",
    "floor-plans": "meriva-sunset-floor-plans.pdf",
    "typical-plan": "meriva-sunset-typical-plan.pdf",
    "the-meriva-collection-brochure": "the-meriva-collection-brochure.pdf",
  },
  "mercedes-benz-places-binghatti-city": {
    brochure: "mercedes-benz-places-binghatti-city-brochure.pdf",
    "maybach-vision": "mercedes-maybach-ultimate-luxury-vision.pdf",
    "maybach-6-brochure": "project-maybach-6-brochure.pdf",
  },
  passo: {
    brochure: "passo-project-brochure.pdf",
    "availability-pricing": "passo-availability-pricing.pdf",
  },
  "meriva-gardens": {
    brochure: "meriva-gardens-brochure.pdf",
    "project-brief": "meriva-gardens-project-brief.pdf",
    "amenities-plan": "meriva-gardens-amenities-plan.pdf",
    availability: "meriva-gardens-availability.png",
  },
  "palm-jebel-ali-villas": {
    "digital-brochure": "palm-jebel-ali-villas-digital-brochure.pdf",
    "project-briefing": "palm-jebel-ali-villas-project-briefing.pdf",
    masterplan: "palm-jebel-ali-masterplan.pdf",
  },
  "palm-central": {
    brochure: "palm-central-brochure.pdf",
    "prices-payment-plan": "palm-central-prices-and-payment-plan.pdf",
  },
  "safa-gate": {
    brochure: "safa-gate-brochure.pdf",
    "price-list": "safa-gate-price-list.pdf",
  },
  "w-residences": {
    brochure: "w-residences-brochure-tower-3.pdf",
    "price-list-towers-1-2": "w-residences-tower-1-2-price-list.pdf",
    "price-list-tower-3": "w-residences-tower-3-price-list.pdf",
  },
  "kaia-residences": {
    brochure: "Kaia-Residences-Technical-Brochure.pdf",
    "sale-offer": "Kaia-Residences-Sample-Sale-Offer.pdf",
  },
  "floarea-breeze": {
    brochure: "Floarea-Breeze-Brochure.pdf",
    "payment-plan": "Floarea-Breeze-Payment-Plan.pdf",
  },
  "mirari-lagoon": {
    brochure: "mirari-lagoon-brochure.pdf",
    "payment-plan": "mirari-lagoon-payment-plan.pdf",
  },
  "the-archive-imtiaz": {
    brochure: "the-archive-imtiaz-brochure.pdf",
  },
  "the-symphony-imtiaz": {
    brochure: "the-symphony-imtiaz-brochure.pdf",
  },
  "omya-residences": {
    brochure: "Omya-Residences-Brochure.pdf",
    "sale-offer": "Omya-Residences-Sale-Offer.pdf",
  },
  "the-wow-tower": {
    brochure: "The-Wow-Tower-Brochure.pdf",
    "sale-offer": "The-Wow-Tower-Sale-Offer.pdf",
  },
};

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/documents/[projectSlug]/[docId]">
) {
  const { projectSlug, docId } = await context.params;
  const token = request.nextUrl.searchParams.get("token");

  const project = getProjectBySlug(projectSlug);
  const document = project?.documents.find((d) => d.id === docId);

  if (!project || !document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!token || !verifyDownloadToken(token, projectSlug, docId)) {
    return NextResponse.json(
      { error: "This link has expired. Please submit the enquiry form again to get a fresh download link." },
      { status: 403 }
    );
  }

  const filename = DOCUMENT_FILES[projectSlug]?.[docId];
  if (!filename) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "protected-documents", projectSlug, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File is currently unavailable." }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
