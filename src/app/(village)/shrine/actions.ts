"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function offerCropAction(userCropId: string) {
  const supabase = await createClient();
  await supabase.rpc("make_offering", { p_user_crop_id: userCropId });
  revalidatePath("/shrine");
}
