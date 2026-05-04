import { redirect } from "next/navigation";

export default function LegacySettingPage() {
  redirect("/admin/settings");
}
