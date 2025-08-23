import React from "react";

// Third Party
import { useTranslations } from "next-intl";

// Styles
import "../styles/banner-card.css";
import { ShoppingBag } from "lucide-react";

export default function AnimateBanner() {
	const t = useTranslations("");

	return (
		<div>
			<div className="e-card playing">
				<div className="image" />

				<div className="wave" />
				<div className="wave" />
				<div className="wave" />

				<div className="flex-col -translate-y-20 infotop flex-center">
					<ShoppingBag size={60} />
					<p>{t("recommendedProduct")}</p>
					<small>Ikea</small>
				</div>
			</div>
		</div>
	);
}
