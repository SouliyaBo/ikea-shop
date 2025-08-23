"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft, Copy, Check, Wallet } from "lucide-react";
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
import { MONEY_USER_HISTORY, MONEY_USER, IMG_PREFIX_S3 } from "@/constants/api";
import numberFormat from "@/helpers/numberFormat";
import DotSpinner from "@/components/DotSpinner";
import { HandCoins, PencilLine } from "lucide-react";
import AlertModal from "@/components/AlertModal";

export default function StoreClaimHistory({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [userToken, setUserToken] = useState(null);
	const [historyClaims, setHistoryClaims] = useState(null);
	const [moneyUser, setMoneyUser] = useState(0);
	const [userBank, setUserBank] = useState(null);

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
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop-claim`,
			{
				shop: userId,
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
		await get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop-claim/claim-available/${userId}`,

			userToken,
			() => { },
			(res) => {
				setMoneyUser(res?.data?.money);
			},
			(err) => {
				console.log(err);
				setMoneyUser(0);
			},
		);
	};

	const getUserBank = async (userId) => {
		get(
			// `${USER}/${id}`,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop-bank?shop=${userId}`,
			userToken,
			setLoading,
			(data) => {
				setUserBank(data?.data?.data?.[0]);
				setLoading(false);
			},
			(error) => {
				console.log(error);
				setLoading(false);
			},
		);
	};

	const createClaim = async () => {
		await create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop-claim`,
			{
				shop: id,
			},
			userToken,
			setIsLoading,
			(data) => {
				router.refresh();
				getHistoryClaims(id);
				getMoneyUser(id);
			},
			(error) => {
				if (error?.response?.data?.message === "Unauthorized!")
					console.log("error:: ", error?.response?.data?.message);
			},
		);
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh">
			<section className="w-full h-full overflow-y-auto">
				<div className="relative py-8 flex-center">
					<Button
						onClick={() => router.back()}
						className="absolute left-4 w-[45px] h-[45px] rounded-full bg-transparent border text-black"
					>
						{/* <Link href={`/profile/${id}`}> */}
						<ChevronLeft size={28} />
						{/* </Link> */}
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
							<div className="w-full p-4 space-y-2 text-center rounded-md shadow bg-gradient-to-r from-red-400 to-red-500">
								<p className="gap-2 text-2xl font-bold text-white flex-center">
									<Wallet /> {moneyUser ? numberFormat(moneyUser) : 0}
								</p>

								<div className="flex items-center justify-center w-full gap-2 text-white text-[14px]">
									{t("accountNumber")}: {userBank?.accountNumber}{" "}
									{console.log("userBank", userBank)}
									<Link href={`/my-store/${id}/settings/bank/${id}`}>
										<PencilLine size={28} />
									</Link>
								</div>

								<AlertModal
									component={
										<Button
											className="gap-2 py-4 text-white bg-gray-600 rounded hover:bg-gray-500 disabled:bg-black flex-center"
											disabled={isLoading || moneyUser === 0 ? true : false}
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
												{moneyUser ? numberFormat(moneyUser) : 0}
											</p>
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
													{numberFormat(history?.money)}
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
