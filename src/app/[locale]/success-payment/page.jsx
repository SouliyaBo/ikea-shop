import Link from "next/link";
import Image from "next/image";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import { BadgeCheck } from "lucide-react";

export default function SuccessPayment() {
	const t = useTranslations("");

	return (
		<div className="flex-col min-h-screen flex-center">
			<BadgeCheck size={64} className="text-green-500" />
			<h3 className="text-3xl font-bold text-green-500">{t("orderSuccess")}</h3>
			<p>{t("thankYouVeryMuch")}</p>
			<Image
				className="w-full h-full"
				src="/images/confirm-order.png"
				alt="confirm order"
				width={100}
				height={100}
				sizes="100%"
				unoptimized
			/>
			<Link
				href="/"
				className="p-4 text-white rounded-xl bg-primary"
				role="button"
			>
				{t("continueShopping")}
			</Link>
		</div>
	);
}
