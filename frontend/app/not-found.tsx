import Link from "next/link";
import {
  FileQuestion,
  ArrowLeft,
  Search,
  LayoutDashboard,
  FolderGit2,
  Receipt,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-xl text-center">
        {/* Visual Badge / Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <FileQuestion className="h-8 w-8 text-slate-700" />
        </div>

        {/* Status code & Title */}
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>Error 404</span>
          <span>•</span>
          <span>Page Not Found</span>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          We couldn’t locate that page
        </h1>

        <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          The link you followed may be incorrect, the financial record or document may have moved, or you may lack active access permissions.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <FolderGit2 className="h-4 w-4" />
            Go to Projects
          </Link>

          <Link
            href="/control-center"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            Control Center
          </Link>
        </div>

        {/* Helpful Shortcuts Card */}
        <div className="mt-10 rounded-xl border border-slate-200/80 bg-white p-5 text-left shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Destinations
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Link
              href="/projects"
              className="group flex items-center justify-between rounded-lg border border-transparent p-2.5 hover:border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">All Developments</span>
              </div>
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/draws"
              className="group flex items-center justify-between rounded-lg border border-transparent p-2.5 hover:border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Draw Requests</span>
              </div>
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/reconciliation"
              className="group flex items-center justify-between rounded-lg border border-transparent p-2.5 hover:border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Reconciliation Ledger</span>
              </div>
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition" />
            </Link>

            <Link
              href="/account"
              className="group flex items-center justify-between rounded-lg border border-transparent p-2.5 hover:border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-slate-900" />
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Account & Security</span>
              </div>
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-xs text-slate-400">
          Need assistance? Contact your organization administrator or reach support.
        </p>
      </div>
    </div>
  );
}
