import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* HostelSync header bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={24} showText={false} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
            Hostel<span className="text-[#8B2326]">Sync</span>
          </span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Form area */}
      <div className="flex flex-1 items-start justify-center px-4 pt-14 pb-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-2">
              Complaint Register
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Sign In
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Access your hostel complaint account
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full border border-border bg-card shadow-none rounded-[2px] p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-border rounded-[2px] text-foreground font-medium text-sm hover:bg-card",
                dividerLine: "bg-border",
                dividerText: "text-muted text-xs font-mono uppercase tracking-wider",
                formFieldLabel:
                  "text-[12px] font-bold uppercase tracking-wider text-[#44403C]",
                formFieldInput:
                  "border border-border bg-card rounded-[2px] text-foreground text-sm placeholder:text-muted focus:border-foreground focus:ring-1 focus:ring-foreground/20",
                formButtonPrimary:
                  "bg-foreground text-background hover:bg-foreground/90 rounded-[2px] font-bold tracking-wide",
                footerActionText: "text-muted text-xs font-mono",
                footerActionLink:
                  "text-foreground underline underline-offset-2 font-mono text-xs",
                identityPreviewText: "text-foreground font-mono text-sm",
                identityPreviewEditButton: "text-muted hover:text-foreground",
                alertText: "font-mono text-xs text-[#8B2326]",
                formFieldErrorText: "font-mono text-[11px] text-[#8B2326]",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
