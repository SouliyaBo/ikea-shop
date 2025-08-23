"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import moment from "moment";
import { useTranslations } from "next-intl";

// Icons
import { ArrowRight, Wallet, DollarSign, Info, ChevronLeft, CheckCircle } from "lucide-react";
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

export default function WithdrawProfit({ params }) {
	const { id } = params;
	const t = useTranslations("");

	const [isLoading, setIsLoading] = useState(false);
	const [userToken, setUserToken] = useState(null);
	const [moneyUser, setMoneyUser] = useState(0);
	const [moneyProfit, setMoneyProfit] = useState(null);
	// Event Trigger
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState("")
	const [isProcessing, setIsProcessing] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)

	const availableProfit = 125000.5
	const mainWalletBalance = 45000.25
	const minWithdrawal = 100
	const maxWithdrawal = moneyProfit?.money;

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;

		setUserToken(USER_DATA?.accessToken);
	}, []);

	useEffect(() => {
		if (userToken && id) {
			getMoneyUser(id);
			getMoneyUserProfit(id);
		}
	}, [id, userToken]);



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

	const getMoneyUserProfit = async (userId) => {
		await gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user-profit`,
			{
				user: userId,
			},
			userToken,
			() => { },
			(res) => {
				setMoneyProfit(res?.data?.data?.[0]);
			},
			(err) => {
				console.log(err);
			},
		);
	};



	const handleWithdraw = async () => {
		if (!amount || Number.parseFloat(amount) > 1000000) return

		setIsProcessing(true)

		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user-profit`,
			{
				user: id,
				money: amount,
			},
			userToken,
			setIsLoading,
			(data) => {
				// Simulate API call
				setTimeout(() => {
					setIsProcessing(false);
					setIsSuccess(true);
					getMoneyUserProfit();
					// Reset after 3 seconds
					setTimeout(() => {
						setIsSuccess(false)
						setAmount("")
					}, 3000)
				}, 2000)
				getMoneyUser(id);
			},
			(error) => {
				if (error?.response?.data?.message === "Unauthorized!")
					console.log("error:: ", error?.response?.data?.message);
			},
		);
	}

	const setMaxAmount = () => {
		setAmount(availableProfit.toString())
	}

	if (isSuccess) {
		return (
			<div className="max-w-md mx-auto p-6">
				<Card className="p-8 text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">{t("withdrawalSuccessful")}!</h2>
					<p className="text-gray-600 mb-4">
						{formatToCurrencyTHB(Number.parseFloat(amount))} {t("hasBeenTransferredToYourMainWallet")}.
					</p>
					<p className="text-sm text-gray-500">{t("transactionWillBeProcessedWithin24Hours")}.</p>
				</Card>
			</div>
		)
	}

	return (
		<div className="relative w-full overflow-y-auto h-dvh bg-gradient-to-t from-blue-100 to-white">
			<section className="w-full h-full overflow-y-auto">
				<div className="relative py-8 flex-center">
					<Button className="absolute left-4 w-[45px] h-[45px] rounded-full bg-transparent border text-black">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={28} />
						</Link>
					</Button>
					<h1 className="text-lg font-semibold">{t("withdrawProfit")}</h1>
				</div>
				<div>
					<div className="max-w-md mx-auto p-6">
						<div className="text-center mb-6">
							<h1 className="text-2xl font-bold text-gray-900 mb-2">{t("withdrawProfit")}</h1>
							<p className="text-gray-600">{t("transferYourEarningsToMainWallet")}</p>
						</div>

						{/* Balance Cards */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							<Card className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<DollarSign className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-gray-600">{t("availableProfit")}</span>
								</div>
								<p className="text-lg font-bold text-green-600">{formatToCurrencyTHB(Number.parseFloat(moneyProfit?.money))}</p>
							</Card>

							<Card className="p-4">
								<div className="flex items-center gap-2 mb-2">
									<Wallet className="h-4 w-4 text-blue-600" />
									<span className="text-sm font-medium text-gray-600">{t("mainWallet")}</span>
								</div>
								<p className="text-lg font-bold text-blue-600">{formatToCurrencyTHB(Number.parseFloat(moneyUser?.money))}</p>
							</Card>
						</div>

						{/* Withdrawal Form */}
						<Card className="p-6 mb-6">
							<div className="space-y-4">
								<div>
									<Label htmlFor="amount" className="text-base font-medium">
										{t("withdrawalAmount")}
									</Label>
									<div className="relative mt-2">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
										<Input
											id="amount"
											type="number"
											placeholder="0.00"
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											className="pl-8 h-12 text-lg"
											// min={minWithdrawal}
											max={maxWithdrawal}
											step="0.01"
										/>
									</div>
									{/* <div className="flex justify-between items-center mt-2">
										<span className="text-sm text-gray-500">Min: {formatToCurrencyTHB(minWithdrawal)}</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={setMaxAmount}
											className="text-blue-600 hover:text-blue-700 p-0 h-auto"
										>
											Max: {formatToCurrencyTHB(maxWithdrawal)}
										</Button>
									</div> */}
								</div>

								{/* Quick Amount Buttons */}
								{/* <div className="grid grid-cols-3 gap-2">
									{[25, 50, 75].map((percentage) => {
										const quickAmount = (availableProfit * percentage) / 100
										return (
											<Button
												key={percentage}
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setAmount(quickAmount.toFixed(2))}
												className="text-sm"
											>
												{percentage}%
											</Button>
										)
									})}
								</div> */}
							</div>
						</Card>

						{/* Transfer Preview */}
						{amount && amount <= maxWithdrawal && (
							<Card className="p-4 mb-6 bg-blue-50 border-blue-200">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-green-600" />
										<span className="text-sm font-medium">{t("profitWallet")}</span>
									</div>
									<ArrowRight className="h-4 w-4 text-gray-400" />
									<div className="flex items-center gap-2">
										<Wallet className="h-4 w-4 text-blue-600" />
										<span className="text-sm font-medium">{t("mainWallet")}</span>
									</div>
								</div>
								<div className="text-center mt-2">
									<p className="text-lg font-bold text-blue-600">{formatToCurrencyTHB(Number.parseFloat(amount))}</p>
								</div>
							</Card>
						)}

						{/* Info Card */}
						<Card className="p-4 mb-6 bg-gray-50">
							<div className="flex gap-3">
								<Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
								<div className="text-sm text-gray-600">
									<p className="font-medium mb-1">{t("importantInformation")}:</p>
									<ul className="space-y-1 text-xs">
										{/* <li>• Withdrawals are processed within 24 hours</li> */}
										<li>• {t("maximumWithdrawalAmountIs")} {formatToCurrencyTHB(maxWithdrawal)}</li>
										<li>• {t("noFeesForProfitWithdrawals")}</li>
										<li>•{t("fundsWillAppearInYourMainWallet")}</li>
									</ul>
								</div>
							</div>
						</Card>

						{/* Withdraw Button */}
						<Button
							onClick={handleWithdraw}
							disabled={
								!amount ||
								Number.parseFloat(amount) > maxWithdrawal ||
								isProcessing
							}
							className="w-full h-12 text-white"
						>
							{isProcessing ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									{t("processing")}...
								</div>
							) : (
								`${t("claimButton")} ${amount ? formatToCurrencyTHB(Number.parseFloat(amount)) : formatToCurrencyTHB(0)}`
							)}
						</Button>

						{/* Error Message */}
						{amount && amount > maxWithdrawal && (
							<p className="text-sm text-red-600 mt-2 text-center">
								{Number.parseFloat(amount) > minWithdrawal
									? `${t("maximumWithdrawalAmountIs")} ${formatToCurrencyTHB(maxWithdrawal)}`
									: `${t("maximumWithdrawalAmountIs")} ${formatToCurrencyTHB(maxWithdrawal)}`}
							</p>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
