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
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-[#E7EEFA] text-[#0F172A]">
      {/* 
        Full background illustration: login-hero-astronaut.png used in its entirety.
        Desktop: The whole 1619x971 artwork covers the viewport. The astronaut is on the left,
        the organic fluid wave runs through the middle, and the open pastel canvas extends across the right.
        Mobile: Matches auth-layout-reference.png - clean light background at top, astronaut anchored at bottom.
      */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Desktop: Entire illustration covering the viewport */}
        <div className="hidden lg:block absolute inset-0">
          <img
            src="/images/auth/login-hero-astronaut.png"
            alt="Ruang Pintar Background"
            className="h-full w-full object-cover object-left-center 2xl:object-center select-none pointer-events-none"
          />
        </div>

        {/* Mobile / Tablet (< lg): Matching reference auth-layout-reference.png */}
        <div className="lg:hidden absolute inset-0 flex flex-col justify-between">
          <div className="w-full h-full bg-gradient-to-b from-[#E7EEFA] via-[#EEF5FC] to-[#DFECFB]" />
          <div className="absolute bottom-0 inset-x-0 h-[280px] sm:h-[340px] overflow-hidden">
            <img
              src="/images/auth/login-hero-astronaut.png"
              alt="Astronaut Ruang Pintar"
              className="h-full w-full object-cover object-[16%_bottom] select-none pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,#000_22%,#000_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_22%,#000_100%)]"
            />
          </div>
        </div>
      </div>

      {/* Header Brand Logo (Desktop/Tablet) */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-6 sm:p-8 lg:px-12 lg:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3.5 rounded-xl pr-3 outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30"
        >
          <div className="relative size-10 sm:size-11 shrink-0 drop-shadow-[0_4px_12px_rgba(15,23,42,0.12)] flex items-center justify-center">
            <Image
              src="/images/brand/ruang-pintar-mark.png"
              alt="Ruang Pintar Logo"
              width={44}
              height={44}
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

        {/* Top-Right Quick Action Link */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1E293B] border border-white/90 shadow-xs backdrop-blur-sm transition-all"
          >
            Coba Gratis
          </Link>
        </div>
      </header>

      {/* Main Container - Balanced Center-Right positioning with subtle glass effect */}
      <main className="relative z-10 min-h-[100dvh] w-full flex flex-col justify-between pt-20 sm:pt-24 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,470px)_minmax(0,0.42fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(440px,480px)_minmax(0,0.5fr)] lg:grid-rows-1 lg:pt-0">
        {/* Left Column Spacer (Full artwork shines through) */}
        <div className="hidden lg:block pointer-events-none" aria-hidden="true" />

        {/* Center-Right Form Container: Shifted comfortably inward from right edge */}
        <section className="relative z-10 flex w-full flex-col justify-start lg:justify-center items-center px-4 sm:px-6 lg:px-0 pt-4 pb-8 lg:py-12">
          {/* Subtle Frosted Glass Container (Effek Glass Tipis) */}
          <div
            className={`w-full ${
              wideForm ? "max-w-[540px]" : "max-w-[430px] sm:max-w-[460px]"
            } rounded-2xl sm:rounded-3xl bg-white/45 backdrop-blur-md border border-white/65 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.06),0_1px_2px_rgba(255,255,255,0.7)] p-6 sm:p-8 lg:p-9 transition-all`}
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
            <div className="mb-5 space-y-1.5 sm:mb-6 sm:space-y-2">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2563EB] text-[11px] font-bold tracking-wide uppercase">
                  {badge}
                </div>
              )}
              <h1 className="text-[26px] leading-[1.2] font-bold tracking-[-0.035em] text-[#0F172A] sm:text-[30px] xl:text-[34px]">
                {title}
              </h1>
              {description && (
                <p className="max-w-[42ch] text-[12.5px] leading-5 text-[#475569] sm:text-[13.5px] sm:leading-6">
                  {description}
                </p>
              )}
            </div>

            {/* Form Fields & Controls */}
            {children}
          </div>
        </section>

        {/* Right Spacer (Guarantees form never hugs the right edge) */}
        <div className="hidden lg:block pointer-events-none" aria-hidden="true" />
      </main>
    </div>
  );
}
