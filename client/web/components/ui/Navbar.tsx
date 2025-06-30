"use client";
import React from "react";
import Image from "next/image";
import { navbarLinks } from "../constants/navbar-links";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarContent,
} from "./sidebar";

export function Navbar() {
  return (
    <>
      {/* Desktop/Tablet Navbar: original design, visible on sm and up */}
      <nav className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-md px-6 py-3 my-6 mx-auto flex items-center justify-between gap-4 hidden sm:flex">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/icons/Logo.svg"
            alt="RoadSense Logo"
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

      {/* Mobile: Hamburger and Sidebar, only visible on mobile */}
      <div className="sm:hidden">
        <SidebarProvider>
          <SidebarTrigger className="fixed top-4 left-4 z-50 w-10 h-10   bg-[var(--green)]/40  text-[var(--brown)] hover:text-[var(--light-brown)] cursor-pointer shadow-lg rounded-2xl flex items-center justify-center backdrop-blur-lg hover:bg-[var(--beige)]/80 transition-colors duration-200" />
          <Sidebar
            variant="sidebar"
            collapsible="offcanvas"
            className="bg-white/70 border border-white/30 backdrop-blur-lg rounded-3xl shadow-md"
          >
            <SidebarHeader className="flex flex-row items-center  gap-2  px-6 pt-6">
              <Image
                src="/icons/Logo.svg"
                alt="RoadSense Logo"
                width={32}
                height={32}
                priority
              />
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "var(--brown)" }}
              >
                RoadSense
              </span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu className="p-4">
                {navbarLinks.map((link) => (
                  <SidebarMenuItem key={link.name}>
                    <Link
                      href={link.href}
                      className="block text-base font-medium px-2 py-2 rounded-md transition-colors duration-200 hover:bg-[var(--beige)]/70 text-[var(--brown)]"
                      style={{ color: "var(--brown)" }}
                    >
                      {link.name}
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    </>
  );
}
