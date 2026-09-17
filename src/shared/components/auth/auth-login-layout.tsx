/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthLoginLayout({
  children,
  title = "Masuk ke Ruang Pintar",
  description = "Gunakan akun sekolah Anda untuk mengakses pembelajaran, aktivitas akademik, dan informasi sekolah.",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-[#EEF4FB] via-[#F8FAFC] to-[#FFFFFF] text-[#0F172A]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(37,99,235,0.06),transparent_35%)]"
      />

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
      <main className="relative z-10 min-h-[100dvh] w-full flex flex-col justify-between pt-6 sm:pt-20 lg:grid lg:grid-cols-[minmax(0,56%)_minmax(420px,44%)] lg:grid-rows-1 lg:pt-0">
        {/* Left Hero Artwork (Desktop) / Bottom Hero Artwork (Mobile) */}
        <section
          aria-label="Ilustrasi ruang belajar"
          className="relative order-2 mt-auto w-full h-[280px] sm:h-[340px] overflow-hidden flex items-end justify-center lg:order-1 lg:mt-0 lg:h-full lg:min-h-[100dvh] lg:overflow-visible"
        >
          <img
            src="/images/auth/login-hero-astronaut.png"
            alt="Astronaut Ruang Pintar"
            className="w-full h-full object-cover object-[14%_bottom] select-none pointer-events-none sm:object-[15%_bottom] lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-[125%] lg:max-w-none lg:object-cover lg:object-[32%_center] xl:w-[122%] xl:object-[34%_center]"
          />
        </section>

        {/* Right Form Container */}
        <section className="relative z-10 order-1 flex w-full flex-col justify-start lg:justify-center items-center lg:items-start px-6 sm:px-10 lg:px-12 xl:px-16 pt-4 pb-2 lg:py-12">
          <div className="w-full max-w-[440px] sm:max-w-[470px]">
            <div className="mb-5 space-y-2 sm:mb-8 sm:space-y-3">
              <h1 className="text-[26px] leading-[1.2] font-bold tracking-[-0.03em] text-[#0F172A] sm:text-[34px] 2xl:text-[38px]">
                {title}
              </h1>
              <p className="max-w-[42ch] text-[13px] leading-5 text-[#475569] sm:text-[15px] sm:leading-6">
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
