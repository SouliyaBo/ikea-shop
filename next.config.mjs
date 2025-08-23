import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "store-rich-bucket.s3.ap-southeast-1.amazonaws.com",
			},
		],
		domains: [
			"d1nyiqd6or4wyo.cloudfront.net",
			"d14lubrvufovrq.cloudfront.net",
			"dev.dee2u.com",
			"dee2u.com",
			"www.dee2u.com",
			"ctlhgroup.com",
			"www.ctlhgroup.com",
		],
		loader: "default",
	},
};

export default withNextIntl(nextConfig);
