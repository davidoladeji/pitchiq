"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Provider = {
  id: string;
  name: string;
};

const PROVIDER_ICONS: Record<string, string> = {
  google:
    "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
  github:
    "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  );
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const handleDevLogin = async () => {
    setSigningIn(true);
    try {
      const res = await signIn("dev-login", {
        redirect: false,
        email: "dev@pitchiq.local",
      });
      if (res?.error) {
        setSigningIn(false);
        return;
      }
      // Force full page load to pick up new session cookie
      window.location.href = "/dashboard";
    } catch {
      setSigningIn(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-navy-50/50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <main
            id="main"
            tabIndex={-1}
            aria-labelledby="signin-heading"
            className="outline-none"
          >
            <div className="text-center mb-8">
              <Link
                href="/"
                aria-label="PitchIQ home"
                className="inline-flex items-center gap-2.5 mb-6 min-h-[44px] min-w-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric shadow-glow">
                  <span className="font-bold text-white text-sm">P</span>
                </div>
                <span className="font-bold text-2xl tracking-tight text-navy">
                  PitchIQ
                </span>
              </Link>
              <h1
                id="signin-heading"
                className="text-2xl font-bold text-navy tracking-tight mb-2"
              >
                Sign in to PitchIQ
              </h1>
              <p className="text-navy-500 text-sm">
                Save decks, track PIQ scores, and access analytics.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 space-y-3">
              {providers ? (
                Object.values(providers).map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    disabled={signingIn}
                    onClick={() =>
                      provider.id === "dev-login"
                        ? handleDevLogin()
                        : signIn(provider.id, { callbackUrl: "/dashboard" })
                    }
                    aria-label={`Sign in with ${provider.name}`}
                    className="w-full min-h-[44px] flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-navy-200 text-sm font-medium text-navy shadow-sm hover:bg-navy-50 hover:border-navy-300 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {PROVIDER_ICONS[provider.id] && (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={PROVIDER_ICONS[provider.id]} />
                      </svg>
                    )}
                    Continue with {provider.name}
                  </button>
                ))
              ) : (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl bg-navy-100 animate-pulse motion-reduce:animate-none"
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-navy-500">
              By signing in you agree to our terms. We never share your data.
            </p>
          </main>
        </div>
      </div>
    </>
  );
}
