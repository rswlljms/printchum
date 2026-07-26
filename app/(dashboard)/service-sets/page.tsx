import type { Metadata } from "next";

import { ServiceSetsManager } from "@/components/service-sets/service-sets-manager";

export const metadata: Metadata = {
  title: "Service Sets",
};

export default function ServiceSetsPage() {
  return <ServiceSetsManager />;
}
