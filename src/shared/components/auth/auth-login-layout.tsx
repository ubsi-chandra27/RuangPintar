/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthLoginLayout({
  children,
  title = "Masuk ke Ruang Pintar",
  description = "Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan informasi sekolah.",
  backLink,
  badge,
  wideForm = false,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  backLink?: { href: string; label: string };
  badge?: string;
  wideForm?: boolean;
}) {
  return (
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-gradient-to-r from-[#DFECFA] via-[#EDF5FC] to-[#F8FAFD] text-[#0F172A]">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(37,99,235,0.06),transparent_40%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 size-[500px] rounded-full bg-gradient-to-tl from-blue-200/20 via-sky-100/30 to-transparent blur-3xl"
      />

      {/* Background Hero Artwork (Seamless Gradient Blend) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Desktop Artwork: Full inset-0 container, image spans left half, mask reaches 100% transparent well before edge */}
        <div className="hidden lg:block absolute inset-0">
          <img
            src="/images/auth/login-hero-astronaut.png"
            alt="Astronaut Ruang Pintar"
            className="h-full w-[65%] xl:w-[60%] 2xl:w-[55%] object-cover object-[26%_center] xl:object-[30%_center] select-none [mask-image:linear-gradient(to_right,black_0%,black_36%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.25)_66%,transparent_80%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_36%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.25)_66%,transparent_80%)]"
          />
        </div>

        {/* Mobile / Tablet Artwork: Anchored to bottom with smooth vertical gradient mask */}
        <div className="lg:hidden absolute bottom-0 inset-x-0 h-[260px] sm:h-[320px]">
          <img
            src="/images/auth/login-hero-astronaut.png"
            alt="Astronaut Ruang Pintar"
            className="h-full w-full object-cover object-[15%_bottom] select-none [mask-image:linear-gradient(to_top,black_40%,rgba(0,0,0,0.25)_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_40%,rgba(0,0,0,0.25)_75%,transparent_100%)]"
          />
        </div>
      </div>

      {/* Header Brand Logo (Desktop/Tablet) */}
      <header className="absolute top-0 left-0 z-30 hidden sm:flex p-6 sm:p-8 lg:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3.5 rounded-[12px] pr-3 outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30"
        >
          <div className="relative size-11 sm:size-12 shrink-0 drop-shadow-[0_6px_14px_rgba(15,23,42,0.1)] flex items-center justify-center">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Ruang Pintar Logo"
              width={48}
              height={48}
              priority
              className="size-full object-contain"
            />
          </div>
          <span className="grid gap-0.5">
            <span className="text-[17px] leading-5 font-bold tracking-[-0.025em] text-[#1E293B]">
              Ruang Pintar
            </span>
            <span className="text-[11px] leading-4 font-semibold tracking-[0.025em] text-[#475569]">
              Academic Learning Platform
            </span>
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 min-h-[100dvh] w-full flex flex-col justify-between pt-6 sm:pt-20 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,560px)] xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,560px)] lg:grid-rows-1 lg:pt-0">
        {/* Left Column Spacer (Artwork shines through underneath) */}
        <div className="hidden lg:block pointer-events-none" aria-hidden="true" />

        {/* Right Form Container */}
        <section className="relative z-10 flex w-full flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:px-10 xl:px-12 pt-4 pb-8 lg:py-12">
          {/* Mobile Brand Logo */}
          <div className="flex sm:hidden items-center justify-center gap-2.5 mb-5">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Ruang Pintar Logo"
              width={34}
              height={34}
              priority
              className="size-8 object-contain drop-shadow-sm"
            />
            <span className="text-[16px] font-bold text-[#1E293B] tracking-tight">
              Ruang Pintar
            </span>
          </div>

          <div
            className={`w-full ${
              wideForm ? "max-w-[560px]" : "max-w-[440px] sm:max-w-[470px]"
            } rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(30,58,138,0.08),0_1px_3px_rgba(15,23,42,0.04)] p-6 sm:p-9 transition-all`}
          >
            {/* Optional Back Link */}
            {backLink && (
              <Link
                href={backLink.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] mb-4 group transition-colors"
              >
                <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span>
                <span>{backLink.label}</span>
              </Link>
            )}

            {/* Header Content */}
            <div className="mb-5 space-y-2 sm:mb-6 sm:space-y-2">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-[11px] font-bold tracking-wide uppercase">
                  {badge}
                </div>
              )}
              <h1 className="text-[22px] leading-[1.2] font-bold tracking-[-0.03em] text-[#0F172A] sm:text-[28px] 2xl:text-[32px]">
                {title}
              </h1>
              <p className="max-w-[44ch] text-[12.5px] leading-5 text-[#475569] sm:text-[13.5px] sm:leading-6">
                {description}
              </p>
            </div>
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
