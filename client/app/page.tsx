"use client";

import { PortalLayout } from "./components/PortalLayout";
import { SNAPApplicationWizard } from "./components/SNAPApplicationWizard";

export default function Home() {
  return (
    <PortalLayout activeTab="snap">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          SNAP Application Portal
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Complete your Supplemental Nutrition Assistance Program (SNAP)
          application by providing your bank transaction information. This
          secure portal helps streamline the application process.
        </p>
      </div>
      <SNAPApplicationWizard />
    </PortalLayout>
  );
}
