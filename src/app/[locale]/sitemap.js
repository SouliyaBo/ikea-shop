const defaultLocale = "th";
const locales = ["th", "la", "en"];

// The API answers 503 while the system is suspended; the sitemap then lists static pages only
async function fetchProducts() {
	try {
		const response = await fetch(
			`${process.env.API_LINK}/v1/api/product/sale?limit=1000`,
		);
		if (!response.ok) return [];
		const products = (await response.json())?.data?.data;
		return Array.isArray(products) ? products : [];
	} catch (error) {
		return [];
	}
}

export default async function sitemap() {
	const baseUrl = "https://www.dee2u.com";

	const products = await fetchProducts();

	const productSitemap = products
		.map((product) => {
			const id = product?._id;
			if (!id) return null;

			const url = `${baseUrl}/product/${id}`;
			const lastModified = new Date().toISOString();

			return { url, lastModified };
		})
		.filter(Boolean);

	const staticPaths = ["/"]; // Add more static paths if needed

	const pathnames = [
		...staticPaths.map((path) => ({
			url: `${baseUrl}${path}`,
			lastModified: new Date().toISOString(),
		})),
		...productSitemap,
	];

	function getUrl(pathname, locale) {
		return `${baseUrl}/${locale}${pathname === baseUrl ? "" : pathname.replace(baseUrl, "")}`;
	}

	return pathnames.map((pathnameObj) => ({
		url: getUrl(pathnameObj.url, defaultLocale),
		lastModified: pathnameObj.lastModified,
		// alternates: {
		// 	languages: Object.fromEntries(
		// 		locales.map((locale) => [locale, getUrl(pathnameObj.url, locale)]),
		// 	),
		// },
	}));
}
