"use client";
import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonsProps } from "./navbar.types";

export const Buttons: FC<ButtonsProps> = ({ icon, title, route }) => {
  const active = usePathname() === route;
  return <Link href={route} className={`xp-nav-button ${active ? "xp-nav-button--active" : ""}`} aria-current={active ? "page" : undefined}>{icon}<span>{title}</span></Link>;
};
