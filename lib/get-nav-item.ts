import { navItems, type NavItem } from "@/lib/nav";

export function getNavItemByHref(href: string): NavItem {
  const item = navItems.find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`No nav item for href: ${href}`);
  }
  return item;
}
