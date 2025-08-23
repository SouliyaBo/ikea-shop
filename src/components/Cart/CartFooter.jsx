import Link from "next/link";

// Third Party
import { useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";

// Constants and Helpers
import numberFormat from "@/helpers/numberFormat";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function CartFooter({
	handleClick,
	summaryPrice,
	percentDiscount,
}) {
	const t = useTranslations("");

	return (
		<footer className="w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
			<div className="flex-col w-full gap-4 flex-center ">
				{/* <div className="w-[80%] border-b pb-4 border-dashed">
					<div className="flex-between">
						<p className="text-secondary">ລາຄາລວມ</p>
						<p className="font-semibold">{numberFormat(25000)} ກີບ</p>
					</div>
					<div className="flex-between">
						<p className="text-secondary">ຄ່າຂົນສົ່ງ</p>
						<p className="font-semibold">{numberFormat(10000)} ກີບ</p>
					</div>
				</div> */}
				{summaryPrice !== 0 ? (
					<>
						<div className="w-[80%] flex-between">
							{/* <p className="text-secondary">{t("total")}</p> */}
							{/* <p className="font-semibold">
								{formatToCurrencyTHB(summaryPrice ?? 0)}
							</p> */}
						</div>
						{percentDiscount && Number.parseFloat(percentDiscount) > 0 ? (
							<>
								<div className="w-[80%] flex-between">
									<p className="text-secondary">ส่วนลด</p>
									<p className="font-semibold">
										{formatToCurrencyTHB(
											summaryPrice * Number.parseFloat(percentDiscount),
										) ?? 0}{" "}
										{/* ກີບ */}
									</p>
								</div>

								<div className="w-[80%] flex-between">
									<p className="text-secondary">เงินสุทธิ</p>
									<p className="font-semibold">
										{formatToCurrencyTHB(
											summaryPrice -
											summaryPrice * Number.parseFloat(percentDiscount),
										) ?? 0}{" "}
										{/* ກີບ */}
									</p>
								</div>
							</>
						) : (
							""
						)}
						<Button
							className="w-[80%] rounded-full py-8 text-white"
							onClick={() => handleClick()}
						>
							{t("processToBuy")}
						</Button>
					</>
				) : (
					<Button className="w-[80%] rounded-full py-8 text-white relative">
						<Link href={"/"} className="absolute inset-0 flex-center">
							{t("goToShopping")}
						</Link>
					</Button>
				)}
			</div>
		</footer>
	);
}
