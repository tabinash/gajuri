"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Camera, Info } from "lucide-react";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

type Step = "signin" | "photos";

export default function Page() {
  const router = useRouter();
  const from = useSearchParams().get("from") || "/";
  const [step, setStep] = useState<Step>("signin");

  // Sign-in state
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  // Photo onboarding state
  const [avatar, setAvatar] = useState<string>("");
  const [cover, setCover] = useState<string>("");

  const avatarInput = useRef<HTMLInputElement | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);

  const [dragCover, setDragCover] = useState(false);
  const [dragAvatar, setDragAvatar] = useState(false);

  const onSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy: emails containing "hasphoto" skip the photo step
    const needsPhotos = !email.toLowerCase().includes("hasphoto");
    setStep(needsPhotos ? "photos" : "signin");
    if (!needsPhotos) router.replace(from || "/");
  };

  const pickCover = async (file?: File) => {
    if (!file) return;
    setCover(await fileToDataUrl(file));
  };
  const pickAvatar = async (file?: File) => {
    if (!file) return;
    setAvatar(await fileToDataUrl(file));
  };

  const onDropCover = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragCover(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await pickCover(f);
  };
  const onDropAvatar = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragAvatar(false);
    const f = e.dataTransfer.files?.[0];
    if (f) await pickAvatar(f);
  };

  const onContinuePhotos = async () => {
    // TODO: persist avatar & cover
    router.replace(from || "/");
  };

  return (
    <main className="relative min-h-dvh">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Centered column */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center p-4 sm:p-6">
        <div className="w-full">
          {/* Card */}
          <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-2xl sm:p-8">
            {step === "signin" ? (
              <>
                <h1 className="text-center text-[22px] font-semibold text-gray-800">
                  Sign in to your account
                </h1>

                <form onSubmit={onSignIn} className="mt-6 space-y-3">
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      autoComplete="email"
                      required
                      className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    />
                  </label>

                  <div className="relative">
                    <label className="block">
                      <span className="sr-only">Password</span>
                      <input
                        type={showPw ? "text" : "password"}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link href="/forgot-password" className="text-sm text-gray-700 underline hover:text-gray-900">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={!email.trim() || !pw.trim()}
                    className="mt-2 w-full rounded-full bg-green-600 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Sign in
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-700">
                  Don’t have an account?{" "}
                  <Link href="/signup" className="font-medium underline hover:text-gray-900">
                    Sign up
                  </Link>
                </p>

                <p className="mt-2 text-center text-xs text-gray-500">
                  Demo: use an email containing “hasphoto” to skip the next step.
                </p>
              </>
            ) : (
              <>
                {/* Step header */}
                <div className="text-center">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Step 2 of 2
                  </div>
                  <h1 className="mt-1 text-[22px] font-semibold text-gray-800">
                    Add your photos
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    This is a first-time setup to add your profile and cover photos.
                  </p>
                </div>

                {/* Two dropzones */}
                <div className="mt-6 space-y-4">
                  {/* Cover */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setDragCover(true)}
                    onDragLeave={() => setDragCover(false)}
                    onDrop={onDropCover}
                    className={[
                      "overflow-hidden rounded-2xl border-2 border-dashed transition",
                      dragCover ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="relative h-44 w-full">
                      {cover ? (
                        <img src={cover} alt="Cover preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500">
                          <Camera size={18} />
                          <div className="text-sm">
                            Drag & drop your cover here, or
                            <button
                              type="button"
                              onClick={() => coverInput.current?.click()}
                              className="ml-1 font-medium text-gray-800 underline hover:opacity-80"
                            >
                              browse
                            </button>
                          </div>
                          <div className="text-xs text-gray-400">Recommended 1200×400 or larger</div>
                        </div>
                      )}
                      <input
                        ref={coverInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickCover(e.target.files?.[0])}
                      />
                    </div>
                  </div>

                  {/* Profile */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setDragAvatar(true)}
                    onDragLeave={() => setDragAvatar(false)}
                    onDrop={onDropAvatar}
                    className={[
                      "flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition",
                      dragAvatar ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white">
                      {avatar ? (
                        <img src={avatar} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center rounded-full bg-gray-200 text-xs text-gray-600">
                          Profile
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-700">
                        Drag & drop your profile photo here, or
                        <button
                          type="button"
                          onClick={() => avatarInput.current?.click()}
                          className="ml-1 font-medium text-gray-800 underline hover:opacity-80"
                        >
                          browse
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">Square 256×256 or larger recommended</div>
                    </div>

                    <input
                      ref={avatarInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickAvatar(e.target.files?.[0])}
                    />
                  </div>

                  {/* Note */}
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <Info size={14} className="mt-0.5 shrink-0 text-gray-500" />
                    <p>You’re adding these for the first time as part of onboarding.</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => router.replace(from || "/")}
                      className="text-sm text-gray-700 underline hover:text-gray-900"
                    >
                      Skip for now
                    </button>
                    <button
                      type="button"
                      onClick={onContinuePhotos}
                      disabled={!avatar}
                      className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Finish setup
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}