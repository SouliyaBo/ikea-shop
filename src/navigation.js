import { createSharedPathnamesNavigation } from "next-intl/navigation";

// export const locales = ["la", "th", "en"];
export const locales = ["th", "la", "en", "sv", "ru", "ja", "zh"];
export const localePrefix = "always"; // Default
// export const localePrefix = "never";

export const { Link, redirect, usePathname, useRouter } =
	createSharedPathnamesNavigation({ locales, localePrefix });
