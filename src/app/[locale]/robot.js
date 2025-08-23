const locales = ["th", "la", "en"];
const defaultLocale = "th";

export default function robots() {
	const baseUrl = "https://www.dee2u.com";

	const localizedPaths = locales.map((locale) => ({
		allow: ["/", `/${locale}/product`],
	}));

	const rules = {
		userAgent: "*",
		allow: [
			"/",
			...locales.flatMap((locale) => [`/${locale}`, `/${locale}/product`]),
		],
		disallow: [],
	};

	const sitemaps = locales.map((locale) => `${baseUrl}/${locale}/sitemap.xml`);

	return {
		rules,
		sitemap: sitemaps,
	};
}
