import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/AuthProvider";
import SessionChecker from "@/components/SessionChecker";
import SessionWarning from "@/components/SessionWarning";

// I18
import { NextIntlClientProvider, useMessages } from "next-intl";
import { locales } from "@/navigation";
import { notFound } from "next/navigation";
const notoSanLao = Noto_Sans_Lao({ subsets: ["lao"] });

export const metadata = {
	title: {
		default: "IKEA Shopping",
		template: "%s | IKEA Shopping",
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'IKEA Shopping',
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: 'website',
		siteName: 'IKEA Shopping',
		title: 'IKEA Shop - Your Home Furniture Store',
		description: 'Shop the best furniture and home accessories',
	},
	twitter: {
		card: 'summary',
		title: 'IKEA Shop - Your Home Furniture Store',
		description: 'Shop the best furniture and home accessories',
	},
	viewport: {
		themeColor: '#0051ba',
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
	},
	// description:
	// 	"ຊື້-ຂາຍສິນຄ້າກັບ ດີທູຢູ ຊ໊ອບງ່າຍຈ່າຍສະດວກ ລາຄາກົງກັບໜ້າຮ້ານ ມີໂປຣໂມຊັ່ນຫຼາກຫຼາຍ ຮັບໂບນັດພິເສດ ນຳສິນຄ້າໄປຣີວິວຮັບຄອມມິດຊັ່ນສູງ ສ່ວນຫຼຸດພິເສດ ຮັບປະກັນສິນຄ້າ ລົງທະບຽນເປີດຮ້ານຄ້າຟຣີ ສະໝັກງ່າຍ-ອະນຸມັດໄວ ເງື່ອນໄຂບໍ່ຊັບຊ້ອນ.",
	metadataBase: new URL("https://www.ikea-shop-online.com/"),
	// keywords: [
	// 	"ctlh",
	// 	"dee2u",
	// 	"dee 2 u",
	// 	"d 2 u",
	// 	"ຈັນທະລັກ",
	// 	"ຈັນທະລັກຮຸ່ງເຮືອງ",
	// 	"ຂາຍເຄື່ອງ",
	// 	"ລາຄາຖືກ",
	// 	"ສິນຄ້າລາຄາຖືກ",
	// ],
	// openGraph: {
	// 	descriptions: "",
	// 	images: [],
	// },
};

export default function LocaleLayout({ children, params: { locale } }) {
	if (!locales.includes(locale)) {
		notFound();
	}

	const messages = useMessages();

	return (
		<html lang={locale}>
			<head>
				{/* PWA Meta Tags */}
				<meta name="application-name" content="IKEA Shopping" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="IKEA Shopping" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-config" content="/icons/browserconfig.xml" />
				<meta name="msapplication-TileColor" content="#0051ba" />
				<meta name="msapplication-tap-highlight" content="no" />

				{/* Apple Touch Icons */}
				<link rel="apple-touch-icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="152x152" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="167x167" href="/favicon.ico" />

				{/* Regular Icons */}
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
				<link rel="icon" href="/favicon.ico" />

				{/* Splash Screens for iOS */}
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="2048x2732" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="1668x2224" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="1536x2048" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="1125x2436" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="1242x2208" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="750x1334" />
				<link rel="apple-touch-startup-image" href="/favicon.ico" sizes="640x1136" />
			</head>
			<body
				className={`${notoSanLao.className}  max-w-[475px] mx-auto border h-dvh overflow-y-hidden max-h-dvh`}
			>
				<NextIntlClientProvider messages={messages} locale={locale}>
					{/* แสดงเฉพาะ children และ Toaster ก่อน */}
					{children}
					<Toaster />
				</NextIntlClientProvider>
				{/* โหลด testing helpers ในโหมด development */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							if (typeof window !== "undefined") {
								import("/src/utils/testingHelpers.js");
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}