"use client";
import { useState, useEffect } from "react";
import { Link } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import {
	UserRoundCog,
	ClipboardList,
	ChevronRight,
	Award,
	Sparkles,
	Crown,
	Diamond,
	Star,
	PiggyBank,
	Phone,
	Coins,
	LogOut,
	Wallet,
	ArchiveRestore,
} from "lucide-react";
// UI
import Footer from "@/components/Home/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";
// Constants
import { get } from "@/helpers";
import numberFormat from "@/helpers/numberFormat";
import { HandCoins } from "lucide-react";
import { CreditCard } from "lucide-react";
import { gets } from "@/helpers/index";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { DiamondPercent } from "lucide-react";

const VIP_TIERS = {
	0: {
		name: "",
		color: "from-slate-400 to-slate-600",
		textColor: "text-slate-100",
		icon: Star,
		benefits: ["5% Cashback", "Priority Support"],
		bgPattern: "bg-gradient-to-br from-slate-50 to-slate-100",
	},
	1: {
		name: "Silver Elite",
		color: "from-slate-400 to-slate-600",
		textColor: "text-slate-100",
		icon: Star,
		benefits: ["5% Cashback", "Priority Support"],
		bgPattern: "bg-gradient-to-br from-slate-50 to-slate-100",
	},
	2: {
		name: "Gold Premium",
		color: "from-yellow-400 to-yellow-600",
		textColor: "text-yellow-100",
		icon: Award,
		benefits: ["10% Cashback", "VIP Support", "Exclusive Deals"],
		bgPattern: "bg-gradient-to-br from-yellow-50 to-amber-100",
	},
	3: {
		name: "Platinum Royal",
		color: "from-purple-400 to-purple-600",
		textColor: "text-purple-100",
		icon: Crown,
		benefits: ["15% Cashback", "Personal Manager", "Early Access"],
		bgPattern: "bg-gradient-to-br from-purple-50 to-violet-100",
	},
	4: {
		name: "Diamond Prestige",
		color: "from-blue-400 to-cyan-600",
		textColor: "text-blue-100",
		icon: Diamond,
		benefits: ["20% Cashback", "Concierge Service", "Luxury Perks"],
		bgPattern: "bg-gradient-to-br from-blue-50 to-cyan-100",
	},
	5: {
		name: "Black Infinity",
		color: "from-gray-800 to-black",
		textColor: "text-gray-100",
		icon: Sparkles,
		benefits: ["25% Cashback", "White Glove Service", "Unlimited Access"],
		bgPattern: "bg-gradient-to-br from-gray-900 to-black",
	},
}

export default function Profile({ params }) {
	const { id } = params;
	const t = useTranslations("");

	// Data
	const [userData, setUserData] = useState(null);
	const [userToken, setUserToken] = useState(null);
	const [userDetail, setUserDetail] = useState(null);
	const [moneyUser, setMoneyUser] = useState(0);
	const [moneyProfit, setMoneyProfit] = useState(null);

	const profileMenu = userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" ?
		[
			{
				title: t("editProfile"),
				icon: UserRoundCog,
				link: "/profile/edit/",
				role: "APPROVED"
			},
			{
				title: t("paymentPassword"),
				icon: UserRoundCog,
				link: "/profile/payment-password/",
				role: "APPROVED"
			},
			{
				title: t("editBankInfo"),
				icon: CreditCard,
				link: "/profile/bank/",
				role: "APPROVED"
			},
			{
				title: t("topUp"),
				icon: Coins,
				link: "/profile/top-up/",
				role: "APPROVED"
			},
			{
				title: t("selectProductsToAddToYourStore"),
				icon: ArchiveRestore,
				link: "/select-product-to-store/",
				role: "APPROVED"
			},
			{
				title: t("buyList"),
				icon: ClipboardList,
				link: "/order-history/",
				role: "APPROVED",
				badge: true
			},
			// {
			// 	title:
			// 		userDetail?.role === "MEMBER" ? "อัปเกต Partner" : "สมัครเป็น Partner",
			// 	icon: HeartHandshake,
			// 	link:
			// 		userDetail?.role === "MEMBER"
			// 			? `/partnership/request?userId=${id}`
			// 			: "/partnership/request",
			// },
			// {
			// 	title: t("incomeHistory"),
			// 	icon: Coins,
			// 	link: "/money-user-history/",
			// },
			{
				title: t("withdrawProfit"),
				icon: PiggyBank,
				link: "/withdraw-profit/",
				role: "APPROVED"
			},
			{
				title: t("claimHistory"),
				icon: HandCoins,
				link: "/claim-history/",
				role: "APPROVED"
			},
			// {
			// 	title: t("network"),
			// 	icon: Network,-
			// 	link: "/user-network/",
			// },
		] : [
			{
				title: t("editProfile"),
				icon: UserRoundCog,
				link: "/profile/edit/",
				role: "APPROVED"
			},
			{
				title: t("paymentPassword"),
				icon: UserRoundCog,
				link: "/profile/payment-password/",
				role: "APPROVED"
			},
			{
				title: t("editBankInfo"),
				icon: CreditCard,
				link: "/profile/bank/",
				role: "APPROVED"
			},
			{
				title: t("topUp"),
				icon: Coins,
				link: "/profile/top-up/",
				role: "APPROVED"
			},
			{
				title: t("buyList"),
				icon: ClipboardList,
				link: "/order-history/",
				role: "APPROVED",
				badge: true
			},
			{
				title: t("claimHistory"),
				icon: HandCoins,
				link: "/claim-history/",
				role: "APPROVED"
			},
		];
	// Add this with your other state variables
	const [orderCount, setOrderCount] = useState(0);
	const [userVipLevel, setUserVipLevel] = useState(0)
	const currentVip = VIP_TIERS[userVipLevel]
	const VipIcon = currentVip.icon
	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;

		setUserToken(USER_DATA?.accessToken);
		setUserData(USER_DATA);
	}, []);

	// Effect
	useEffect(() => {
		if (userToken && id) {
			get(
				// `${USER}/${id}`,
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
				userToken,
				() => { },
				(res) => {
					setUserDetail(res.data);
					setUserVipLevel(parseInt(res.data?.vipLevel))
					const newUserData = {
						data: res.data,
						accessToken: userToken,
						refreshToken: userData?.refreshToken,
					};

					localStorage.setItem("USER_DATA", JSON.stringify(newUserData));
				},
				(err) => {
					console.log(err);
				},
			);
			getMoneyUser();
			getMoneyUserProfit();
		}
	}, [userToken, id]);

	useEffect(() => {
		if (userToken) {
			gets(
				// EXPORT_PRODUCT,
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
				{
					// customerId: fakeId,
					customerId: id,
					status: "REQUEST"
				},
				userToken,
				() => { },
				(data) => {
					setOrderCount(data?.data?.total || 0);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [userToken, id]);
	const getMoneyUser = () => {
		get(
			// `${MONEY_USER}?user=${id}`,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user?user=${id}`,
			userToken,
			() => { },
			(res) => {
				// Store the original first item along with calculated totals
				setMoneyUser(res.data?.data[0]);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const getMoneyUserProfit = async () => {
		await gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user-profit`,
			{
				user: id,
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

	return (
		<div className="w-full h-dvh flex flex-col">
			<section className="flex-1 relative overflow-y-auto overflow-x-hidden bg-gradient-to-t from-gray-100 to-white scroll-smooth">
				{/* Header Section with Profile */}
				<div className="relative">
					<div className={`bg-gradient-to-r ${currentVip.color} px-6 pt-12 pb-20 sm:pb-24 md:pb-28`}>
						<div className="absolute top-4 right-4">
							<a href="https://line.me/R/ti/p/@442avwvd?ts=05062354&oat_content=url" target="_bank" className={`${currentVip.textColor} hover:bg-white/20 flex`}>
								<Phone className="w-4 h-4 mr-2" /><span>Contact Support</span>
							</a>
						</div>

						{/* VIP Status Badge */}
						{userVipLevel > 0 &&
							<div className="flex justify-center mb-6">
								<Badge variant="destructive" className={`bg-white/20 ${currentVip.textColor} px-4 py-2 text-sm font-semibold backdrop-blur-sm `} >
									<VipIcon className="w-4 h-4 mr-2" />
									VIP Level {userVipLevel} - {currentVip.name}
								</Badge>
							</div>
						}

						{/* Profile Avatar */}
						<div className="flex justify-center mb-4">
							<div className="relative">
								<Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-white/30 shadow-2xl">
									<AvatarImage src={process.env.NEXT_PUBLIC_MEDIUM_RESIZE + userDetail?.image || "/placeholder.svg"} alt="Profile" />
									<AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20">{userDetail?.firstName.charAt(0)}</AvatarFallback>
								</Avatar>
								{userVipLevel > 0 && <div
									className={`absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${currentVip.color} rounded-full flex items-center justify-center border-3 border-white shadow-lg`}
								>
									<VipIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								</div>}
							</div>
						</div>

						{/* User Info */}
						<div className="text-center">
							<h1 className={`text-xl sm:text-2xl font-bold ${currentVip.textColor} mb-1`}>
								{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED"
									? userDetail?.memberShopName
									: `${userDetail?.firstName} ${userDetail?.lastName}`}
							</h1>
							<p className={`${currentVip.textColor} opacity-90 text-sm sm:text-base`}>Member ID: {userDetail?.vipCode}</p>
						</div>
					</div>
				</div>

				{/* Overlapping Content Section */}
				<div className="px-4 -mt-12 sm:-mt-16 md:-mt-20 relative z-10 pb-20 min-h-0 flex-1">
					{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" ? (
						<div className="w-full p-3 sm:p-4 mb-4 space-y-3 sm:space-y-4 text-center rounded-lg shadow-lg border bg-white border-blue-200">
							<p className="text-lg font-bold text-primary">{t("yourBalance")}</p>
							<p className="gap-2 text-xl sm:text-2xl font-bold text-primary flex justify-center items-center">
								<Wallet className="text-primary" />
								{moneyUser?.money ? formatToCurrencyTHB(moneyUser?.money) : 0}
							</p>
							<div className="flex items-center justify-around w-full">
								<p className="gap-2 text-xl sm:text-2xl font-bold text-blue-700 flex justify-center items-center">
									<PiggyBank className="text-blue-700" />
									{moneyProfit ? formatToCurrencyTHB(moneyProfit?.money) : 0}
								</p>
							</div>
						</div>
					) : null}

					<div className="flex flex-col w-full gap-0 px-0 bg-white rounded-lg shadow-md">
						{profileMenu.map((item) => (
							<Link
								key={item?.title}
								href={
									item?.link.startsWith("/partnership")
										? item?.link
										: item?.link + id
								}
								className={`${(userDetail?.role === "MEMBER" && userDetail?.memberStatus !== "APPROVED" &&
									item.link === "/money-user-history/") ||
									(!userDetail?.role === "MEMBER" &&
										item.link === "/claim-history/") ||
									(
										!userDetail?.role === "MEMBER" &&
										item.link === "/user-network/"
									)
									? "hidden"
									: "flex"
									} items-center justify-between w-full py-4 px-4 border-b border-gray-200 last:border-b-0`}
							>
								<div className="gap-2 flex items-center">
									{item?.icon ? (
										<item.icon size={24} className="text-primary" />
									) : null}
									{item?.badge ?
										<div className="relative">
											<div className="p-2 rounded-lg">
												<span className="text-sm sm:text-base">{item?.title}</span>
											</div>
											<Badge
												variant="error"
												size="sm"
												className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
											>
												{item.title === t("buyList") ? orderCount : 0}
											</Badge>
										</div> :
										<span className="text-sm sm:text-base">{item?.title}</span>
									}
								</div>
								<ChevronRight className="text-primary" size={24} />
							</Link>
						))}

						<Link
							href={"/logout"}
							className="flex items-center justify-between w-full py-4 px-4"
						>
							<div className="gap-2 flex items-center">
								<LogOut size={24} className="text-primary" />
								<span className="text-sm sm:text-base">{t("logout")}</span>
							</div>
							<ChevronRight className="text-primary" size={24} />
						</Link>
					</div>
				</div>
			</section>

			<div className="h-[65px] flex-shrink-0">
				<Footer />
			</div>
		</div>
	);
}


