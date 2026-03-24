import { redirect } from 'next/navigation'

// This page has been replaced by /interview
// Kept for redirect compatibility
export default function CreatePage() {
  redirect('/interview')
}
