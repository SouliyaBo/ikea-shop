const defaultLocale = "th";
const locales = ["th", "la", "en"];

export default async function sitemap() {
	const baseUrl = "https://www.dee2u.com";

	const response = await fetch(
		`${process.env.API_LINK}/v1/api/product/sale?limit=1000`,
	);

	const productsData = await response.json();

	if (!productsData || !productsData.data || !productsData.data.data) {
		throw new Error("Invalid products data");
	}

	const productSitemap = productsData.data.data
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
