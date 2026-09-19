"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SubscriptionCheckoutModal } from "./subscription-checkout-modal";

interface ProCheckoutButtonProps {
  isLoggedIn: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ProCheckoutButton({ isLoggedIn, className, children }: ProCheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link href="/register" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>

      <SubscriptionCheckoutModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
