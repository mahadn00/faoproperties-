"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setLeadStatus } from "@/lib/leads-db";
import { isLeadStatus } from "@/lib/lead-status";

export async function updateLeadStatus(formData: FormData) {
  // The leads page's own sign-in check doesn't cover its server actions —
  // these are separate POST endpoints, so verify again here.
  if (!(await isAdminAuthenticated())) throw new Error("Not signed in");

  const id = Number(formData.get("id"));
  const status = formData.get("status");
  if (!Number.isInteger(id) || id <= 0 || !isLeadStatus(status)) throw new Error("Invalid status update");

  await setLeadStatus(id, status);
  revalidatePath("/admin/leads");
}
