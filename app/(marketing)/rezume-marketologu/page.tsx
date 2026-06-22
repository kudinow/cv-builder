import type { Metadata } from "next";
import { SegmentLandingPage, buildSegmentMetadata } from "@/components/landing/segment-landing-page";
import { SEGMENTS } from "@/lib/landing-segments";

export const metadata: Metadata = buildSegmentMetadata(SEGMENTS.marketing);

export default function RezumeMarketologuPage() {
  return <SegmentLandingPage data={SEGMENTS.marketing} />;
}
