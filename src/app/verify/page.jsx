import { Suspense } from "react";
import VerifyClient from "./VerifyClient";

// THIS IS THE KEY: Force full dynamic rendering (no prerendering at all)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }>
      <VerifyClient />
    </Suspense>
  );
}