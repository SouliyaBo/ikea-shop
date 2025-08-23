"use client";
import { useState, useEffect } from "react";

// UI
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Third Party
import moment from "moment";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft, Wallet } from "lucide-react";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, get } from "@/helpers";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function MoneyUserHistory({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const [userToken, setUserToken] = useState(null);
	const [moneyUsers, setMoneyUsers] = useState(null);
	const [moneyUser, setMoneyUser] = useState(0);

	// Event Trigger
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;

		setUserToken(USER_DATA?.accessToken);
	}, []);

	useEffect(() => {
		if (userToken && id) {
			gets(
				// MONEY_USER_HISTORY,
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user-history`,
				{
					user: id,
				},
				userToken,
				setLoading,
				(data) => {
					setMoneyUsers(data?.data);
					setLoading(false);
				},
				(err) => {
					console.log(err);
					setLoading(false);
				},
			);

			get(
				// `${MONEY_USER}?user=${id}`,
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user?user=${id}`,
				userToken,
				() => {},
				(res) => {
					setMoneyUser(res.data?.data[0]);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [id, userToken]);

	// const getMoneyUser = () => {
	// 	get(
	// 		`${MONEY_USER}?user=${id}`,
	// 		userToken,
	// 		() => {},
	// 		(res) => {
	// 			console.log(res.data?.data);
	// 			setMoneyUser(res.data?.data[0]?.money);
	// 		},
	// 		(err) => {
	// 			console.log(err);
	// 		},
	// 	);
	// };

	const handleCopy = (text, setType) => {
		setType(true);

		if (navigator.clipboard?.writeText) {
			// Modern approach
			navigator.clipboard
				.writeText(text)
				.then(() => {
					setTimeout(() => {
						setType(false);
					}, 2000);
				})
				.catch((err) => {
					console.error("Failed to copy text: ", err);
					setType(false);
				});
		} else {
			// Fallback for older browsers or mobile devices
			const textArea = document.createElement("textarea");
			textArea.value = text;
			// Ensure the textarea is not visible and not focusable
			textArea.style.position = "fixed";
			textArea.style.opacity = "0";
			textArea.style.pointerEvents = "none";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand("copy");
				setTimeout(() => {
					setType(false);
				}, 2000);
			} catch (err) {
				console.error("Failed to copy text: ", err);
				setType(false);
			} finally {
				document.body.removeChild(textArea);
			}
		}
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh">
			<section className="w-full h-full overflow-y-auto">
				<div className="relative py-8 flex-center">
					<Button className="absolute left-4 w-[45px] h-[45px] rounded-full bg-transparent border text-black">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={28} />
						</Link>
					</Button>
					<h1 className="text-lg font-semibold">{t("incomeHistory")}</h1>
				</div>
				<div>
					{loading ? (
						<div className="h-[50vh] flex-center">
							<Loader />
						</div>
					) : moneyUsers?.total === 0 ? (
						<div className="flex-col h-full gap-2 p-4 flex-center">
							<div className="w-full p-4 space-y-2 text-center rounded-md shadow bg-gradient-to-r from-yellow-700 to-yellow-300">
								<p className="gap-2 text-2xl font-bold text-white flex-center">
									<Wallet />{" "}
									{moneyUser?.money ? formatToCurrencyTHB(moneyUser?.money) : 0}
								</p>

								{/* <div className="flex items-center justify-center w-full gap-2 text-white text-[14px]">
									{t("inviteCode")}: {moneyUser?.user?.vipCode}{" "}
									<span
										onKeyDown={() => {}}
										onClick={() =>
											handleCopy(moneyUser?.user?.vipCode, setIsCodeCopy)
										}
									>
										{isCodeCopy ? (
											<Check size={18} className="text-black cursor-pointer" />
										) : (
											<Copy size={18} className="text-black cursor-pointer" />
										)}
									</span>
								</div> */}
								{/* <div className="flex items-center justify-center text-white w-full gap-2 text-[12px]">
									{t("inviteLink")}: https://dee2u.com/register?code=
									{moneyUser?.user?.vipCode}{" "}
									<span
										onKeyDown={() => {}}
										onClick={() =>
											handleCopy(
												`https://dee2u.com/register?code=${moneyUser?.user?.vipCode}`,
												setIsLinkCopy,
											)
										}
									>
										{isLinkCopy ? (
											<Check size={18} className="text-black cursor-pointer" />
										) : (
											<Copy size={18} className="text-black cursor-pointer" />
										)}
									</span>
								</div> */}
							</div>
							<EmptyCartPlaceholder />
							{/* <h2 className="text-xl font-bold">ຍັງບໍ່ມີປະຫວັດລາຍຮັບ</h2> */}
						</div>
					) : (
						<div className="flex-col w-full gap-4 px-4 flex-center">
							<div className="w-full p-4 space-y-2 text-center rounded-md shadow bg-gradient-to-r from-yellow-700 to-yellow-300">
								<p className="gap-2 text-2xl font-bold text-white flex-center">
									<Wallet />{" "}
									{moneyUser.money
										? formatToCurrencyTHB(moneyUser?.money)
										: 0}{" "}
								</p>

								{/* <div className="flex items-center justify-center w-full gap-2 text-white text-[14px]">
									{t("inviteCode")}: {moneyUser?.user?.vipCode}{" "}
									<span
										onKeyDown={() => {}}
										onClick={() =>
											handleCopy(moneyUser?.user?.vipCode, setIsCodeCopy)
										}
									>
										{isCodeCopy ? (
											<Check size={18} className="text-black cursor-pointer" />
										) : (
											<Copy size={18} className="text-black cursor-pointer" />
										)}
									</span>
								</div> */}
								{/* <div className="flex items-center justify-center text-white w-full gap-2 text-[12px]">
									{t("inviteLink")}: https://dee2u.com/register?code=
									{moneyUser?.user?.vipCode}{" "}
									<span
										onKeyDown={() => {}}
										onClick={() =>
											handleCopy(
												`https://dee2u.com/register?code=${moneyUser?.user?.vipCode}`,
												setIsLinkCopy,
											)
										}
									>
										{isLinkCopy ? (
											<Check size={18} className="text-black cursor-pointer" />
										) : (
											<Copy size={18} className="text-black cursor-pointer" />
										)}
									</span>
								</div> */}
							</div>
							<p className="w-full text-[14px] text-gray-500">
								{t("incomeHistory")}
							</p>
							{moneyUsers?.data?.map((history) => (
								<div
									key={history?._id}
									className="w-full gap-2 pb-2 border-b text-[14px]"
								>
									<p>
										{t("quantity")}: &nbsp;
										<span
											className={`font-semibold${
												history?.type === "ADD"
													? " text-green-600"
													: " text-red-600"
											}`}
										>
											{history?.type === "ADD" ? "+" : "-"}
											{formatToCurrencyTHB(history?.money)}
										</span>
									</p>
									<p>
										{t("billNo")}: &nbsp; {history?.bill?.billNo}
									</p>
									<p>
										&nbsp;{" "}
										{moment(history?.createdAt).format("DD/MM/YYYY HH:mm")}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
