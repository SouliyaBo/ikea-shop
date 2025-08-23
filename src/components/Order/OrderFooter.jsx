import Link from "next/link";
import { Button } from "../ui/button";

import { useTranslations } from "next-intl";
import numberFormat from "@/helpers/numberFormat";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function OrderFooter({ total, amount }) {
	const t = useTranslations("");
	return (
		<footer className="w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
			<div className="flex-col w-full gap-4 flex-center">
				{total !== 0 ? (
					<div className="w-full">
						<div className="w-[80%] mx-auto flex-between">
							<p className="text-secondary">{t("allList")}</p>
							<p className="font-semibold">
								{total} {t("list")}
							</p>
						</div>
						<div className="w-[80%] mx-auto flex-between">
							<p className="text-secondary">{t("totalPrice")}</p>
							<p className="font-semibold">
								{formatToCurrencyTHB(amount ?? 0)}
							</p>
						</div>
					</div>
				) : (
					<Button className="w-[80%] relative rounded-full py-8 text-white">
						<Link className="absolute inset-0 flex-center" href={"/"}>
							{t("continueShopping")}
						</Link>
					</Button>
				)}
			</div>
		</footer>
	);
}
