import type { Metadata } from "next";
import { SegmentLandingPage, buildSegmentMetadata } from "@/components/landing/segment-landing-page";
import { SEGMENTS } from "@/lib/landing-segments";

export const metadata: Metadata = buildSegmentMetadata(SEGMENTS.manager);

export default function RezumeRukovoditelyuPage() {
  return <SegmentLandingPage data={SEGMENTS.manager} />;
}
