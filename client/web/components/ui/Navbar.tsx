"use client";
import React from "react";
import Image from "next/image";
import { navbarLinks } from "../constants/navbar-links";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-md px-6 py-3 my-6 mx-auto flex items-center justify-between  gap-4">
      <Link href="/" className="cursor-pointer">
        <Image
          src="/icons/Logo.svg"
          alt="AltRoute Logo"
          width={32}
          height={32}
          priority
        />
      </Link>

      <ul className="flex list-none m-0 p-0 gap-2">
        {navbarLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-base font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:bg-[var(--beige)]/50"
              style={{ color: "var(--brown)" }}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
