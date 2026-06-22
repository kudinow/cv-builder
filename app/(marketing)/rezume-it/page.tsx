import type { Metadata } from "next";
import { SegmentLandingPage, buildSegmentMetadata } from "@/components/landing/segment-landing-page";
import { SEGMENTS } from "@/lib/landing-segments";

export const metadata: Metadata = buildSegmentMetadata(SEGMENTS.it);

export default function RezumeItPage() {
  return <SegmentLandingPage data={SEGMENTS.it} />;
}
