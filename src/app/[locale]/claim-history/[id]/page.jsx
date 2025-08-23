"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft, Wallet, Phone } from "lucide-react";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import {
	gets,
	get,
	create,
	convertClaimStatusToText,
	convertClaimStatusToColor,
} from "@/helpers";
import numberFormat from "@/helpers/numberFormat";
import DotSpinner from "@/components/DotSpinner";
import { HandCoins, PencilLine } from "lucide-react";
import AlertModal from "@/components/AlertModal";
import { Input } from "@/components/ui/input";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function MoneyUserHistory({ params }) {
	const { id } = params;
	const t = useTranslations("");

	const [isLoading, setIsLoading] = useState(false);
	const [userToken, setUserToken] = useState(null);
	const [historyClaims, setHistoryClaims] = useState(null);
	const [moneyUser, setMoneyUser] = useState(0);
	const [userBank, setUserBank] = useState(null);
	const [editableMoney, setEditableMoney] = useState(0);
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
			getHistoryClaims(id);
			getMoneyUser(id);
			getUserBank(id);
		}
	}, [id, userToken]);

	const getHistoryClaims = async (userId) => {
		await gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-claim`,
			{
				user: userId,
			},
			userToken,
			setLoading,
			(data) => {
				setHistoryClaims(data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const getMoneyUser = async (userId) => {
		await gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user`,
			{
				user: userId,
			},
			userToken,
			() => { },
			(res) => {
				setMoneyUser(res.data?.data[0]);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const getUserBank = async (userId) => {
		await gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank`,
			{
				user: userId,
			},
			userToken,
			() => { },
			(res) => {
				setUserBank(res?.data?.data?.[0]);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const createClaim = async () => {
		await create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-claim`,
			{
				user: id,
				money: editableMoney,
			},
			userToken,
			setIsLoading,
			(data) => {
				getHistoryClaims(id);
				getMoneyUser(id);
			},
			(error) => {
				if (error?.response?.data?.message === "Unauthorized!")
					console.log("error:: ", error?.response?.data?.message);
			},
		);
	};

	// Add function to handle money value changes
	const handleMoneyChange = (e) => {
		setEditableMoney(e.target.value);
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh bg-gradient-to-t from-blue-50 to-white">
			<section className="w-full h-full overflow-y-auto">
				<div className="relative py-8 flex-center">
					<Button className="absolute left-4 w-[45px] h-[45px] rounded-full bg-transparent border text-black">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={28} />
						</Link>
					</Button>
					<h1 className="text-lg font-semibold">{t("claimHistory")}</h1>
				</div>
				<div>
					{loading ? (
						<div className="h-[50vh] flex-center">
							<Loader />
						</div>
					) : (
						<div className="flex-col w-full gap-4 px-4 flex-center">
							<div className="w-full p-4 space-y-2 text-center rounded-md shadow bg-gradient-to-r from-blue-700 to-blue-300">
								<p className="gap-2 text-2xl font-bold text-white flex-center">
									<Wallet />{" "}
									{moneyUser?.money ? numberFormat(moneyUser?.money) : 0}
								</p>

								<div className="flex items-center justify-center w-full gap-2 text-white text-[14px]">
									{t("accountNumber")}: {userBank?.accountNumber}{" "}
									<Link href={`/profile/bank/${id}`}>
										<PencilLine size={28} />
									</Link>
								</div>

								<AlertModal
									component={
										<Button
											className="gap-2 py-4 text-white bg-gray-600 rounded hover:bg-gray-500 disabled:bg-black flex-center"
											disabled={
												isLoading || moneyUser?.money === 0 ? true : false
											}
										>
											{isLoading ? <DotSpinner /> : <HandCoins />}
											{t("claimButton")}
										</Button>
									}
									title={t("confirmClaimTitle")}
									confirmText={t("confirmText")}
									desc={
										<div className="flex flex-col items-center w-full">
											<p className="my-4 text-2xl font-bold text-gray-600">
												{moneyUser?.money
													? formatToCurrencyTHB(moneyUser?.money)
													: 0}{" "}
												$
											</p>
											<Input
												type="text"
												value={editableMoney}
												onChange={handleMoneyChange}

											/>
											<p className="my-2 text-lg text-gray-600">
												{moment().format("DD/MM/yyyy HH:mm")}
											</p>
											<div className="flex flex-col items-center w-full px-2 py-4 my-4 border border-gray-300 rounded">
												<p className="mb-4 text-lg font-bold text-gray-600">
													{t("yourBankInfo")}
												</p>
												<p className="text-gray-600">
													<b>{t("bankName")}: &nbsp;</b>
													{userBank?.name}
												</p>
												<p className="text-gray-600">
													<b>{t("accountName")}: &nbsp;</b>
													{userBank?.accountName} ({userBank?.currency})
												</p>
												<p className="text-gray-600">
													<b>{t("accountNumber")}: &nbsp;</b>
													{userBank?.accountNumber}
												</p>
											</div>
										</div>
									}
									confirmFunction={createClaim}
								/>
							</div>
							<div className="text-[12px] text-center">
								<p>{t("ifTheWithdrawnAmountIsNotCreditedWithin30MinutesPleaseReachOutToOurSupportTeam")}</p>
								<a href="https://line.me/R/ti/p/@442avwvd?ts=05062354&oat_content=url" target="_bank" className={`hover:bg-white/20 flex justify-center underline`}>
									<Phone className="w-4 h-4 mr-2" /><span>{t("contactServiceDepartment")}</span>
								</a>
							</div>
							{historyClaims?.total === 0 ? (
								<>
									<EmptyCartPlaceholder />
									<h2 className="text-xl font-bold">{t("noClaimHistory")}</h2>
								</>
							) : (
								<>
									<p className="w-full text-[14px] text-gray-500">
										{t("claimHistory")}
									</p>
									{historyClaims?.data?.map((history) => (
										<div
											key={history?._id}
											className="w-full gap-2 pb-2 border-b text-[14px]"
										>
											<p>
												{t("quantity")}: &nbsp;
												<span className={`font-semibold text-gray-600`}>
													{formatToCurrencyTHB(history?.money)}
												</span>
											</p>
											<p>
												{t("claimStatus")}: &nbsp;
												<span
													className={`font-semibold ${convertClaimStatusToColor(history?.status)}`}
												>
													{t(convertClaimStatusToText(history?.status))}
												</span>
											</p>
											<p>
												{moment(history?.createdAt).format("DD/MM/YYYY HH:mm")}
											</p>
										</div>
									))}
								</>
							)}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
