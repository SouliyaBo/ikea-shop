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
	CreditCard,
	HandCoins,
	DiamondPercent,
	RectangleEllipsis,
	XCircle,
	TrendingDown,
	BanknoteIcon,
} from "lucide-react";

// UI
import Footer from "@/components/Home/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";

// Constants
import { get } from "@/helpers";
import numberFormat from "@/helpers/numberFormat";
import { gets } from "@/helpers/index";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

const VIP_TIERS = {
	0: {
		name: "Member",
		color: "from-[#084392] to-[#064080]",
		textColor: "text-white",
		icon: Star,
		benefits: ["Basic Support"],
		bgPattern: "bg-gradient-to-br from-blue-50 to-blue-100",
		borderColor: "border-[#084392]",
	},
	1: {
		name: "Silver Elite",
		color: "from-slate-400 to-slate-600",
		textColor: "text-slate-100",
		icon: Star,
		benefits: ["5% Cashback", "Priority Support"],
		bgPattern: "bg-gradient-to-br from-slate-50 to-slate-100",
		borderColor: "border-slate-400",
	},
	2: {
		name: "Gold Premium",
		color: "from-yellow-400 to-yellow-600",
		textColor: "text-yellow-100",
		icon: Award,
		benefits: ["10% Cashback", "VIP Support", "Exclusive Deals"],
		bgPattern: "bg-gradient-to-br from-yellow-50 to-amber-100",
		borderColor: "border-yellow-400",
	},
	3: {
		name: "Platinum Royal",
		color: "from-purple-400 to-purple-600",
		textColor: "text-purple-100",
		icon: Crown,
		benefits: ["15% Cashback", "Personal Manager", "Early Access"],
		bgPattern: "bg-gradient-to-br from-purple-50 to-violet-100",
		borderColor: "border-purple-400",
	},
	4: {
		name: "Diamond Prestige",
		color: "from-blue-400 to-cyan-600",
		textColor: "text-blue-100",
		icon: Diamond,
		benefits: ["20% Cashback", "Concierge Service", "Luxury Perks"],
		bgPattern: "bg-gradient-to-br from-blue-50 to-cyan-100",
		borderColor: "border-blue-400",
	},
	5: {
		name: "Black Infinity",
		color: "from-gray-800 to-black",
		textColor: "text-gray-100",
		icon: Sparkles,
		benefits: ["25% Cashback", "White Glove Service", "Unlimited Access"],
		bgPattern: "bg-gradient-to-br from-gray-900 to-black",
		borderColor: "border-gray-800",
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
	const [orderCount, setOrderCount] = useState(0);
	const [shippingCount, setShippingCount] = useState(0);
	const [userVipLevel, setUserVipLevel] = useState(0);

	const currentVip = VIP_TIERS[userVipLevel] || VIP_TIERS[0];
	const VipIcon = currentVip.icon;

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
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
				userToken,
				() => { },
				(res) => {
					setUserDetail(res.data);
					setUserVipLevel(parseInt(res.data?.vipLevel) || 0);
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
			// Get REQUEST status orders count
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
				{
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

			// Get SHIPPING status orders count
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
				{
					customerId: id,
					status: "SHIPPING"
				},
				userToken,
				() => { },
				(data) => {
					setShippingCount(data?.data?.total || 0);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [userToken, id]);

	const getMoneyUser = () => {
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/money-user?user=${id}`,
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
		<div className="flex flex-col w-full h-dvh">
			<section className="relative flex-1 overflow-x-hidden overflow-y-auto bg-blue-50 scroll-smooth">
				{/* VIP Header Section */}
				<div className="relative">
					{/* VIP Background Header */}
					<div className={`${userVipLevel >= 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-gradient-to-r from-gray-100 to-gray-200'} px-4 pt-8 pb-6 relative overflow-hidden`}>
						{/* Premium Pattern Overlay */}
						{userVipLevel > 0 && (
							<div className="absolute inset-0 opacity-10">
								<div className="absolute top-0 left-0 w-32 h-32 -translate-x-16 -translate-y-16 bg-white rounded-full"></div>
								<div className="absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 bg-white rounded-full"></div>
								<div className="absolute bottom-0 w-40 h-40 -translate-x-20 translate-y-20 bg-white rounded-full left-1/2"></div>
							</div>
						)}

						{/* Contact Support */}
						<div className="absolute z-10 top-4 right-4">
							<a href="https://line.me/ti/p/jLKF6aZaYc" target="_blank"
								className={`${userVipLevel >= 0 ? currentVip.textColor : 'text-gray-700'} hover:bg-white/20 flex items-center text-sm rounded-full px-3 py-1 backdrop-blur-sm transition-all duration-300`}>
								<Phone className="w-3 h-3 mr-1" />
								<span className="hidden sm:inline">Support</span>
							</a>
						</div>

						{/* VIP Status Badge */}
						{userVipLevel > 0 && (
							<div className="relative z-10 flex justify-center mb-4">
								<div className={`bg-white/20 ${currentVip.textColor} px-6 py-2 rounded-full backdrop-blur-md border border-white/30 shadow-xl`}>
									<div className="flex items-center gap-2">
										<VipIcon className="w-5 h-5" />
										<span className="text-sm font-bold">VIP {userVipLevel}</span>
										<span className="text-xs font-medium opacity-90">- {currentVip.name}</span>
									</div>
								</div>
							</div>
						)}

						{/* Profile Section */}
						<div className="relative z-10 flex items-center gap-4">
							<div className="relative">
								<Avatar className={`w-20 h-20 ${userVipLevel >= 0 ? `border-4 ${currentVip.borderColor} shadow-2xl` : 'border-2 border-gray-300'} transition-all duration-300`}>
									<AvatarImage src={process.env.NEXT_PUBLIC_MEDIUM_RESIZE + userDetail?.image || "/placeholder.svg"} alt="Profile" />
									<AvatarFallback className={`text-xl font-bold ${userVipLevel >= 0 ? 'bg-white/20 text-white' : 'bg-gray-100'}`}>
										{userDetail?.firstName?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								{userVipLevel > 0 && (
									<div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${currentVip.color} rounded-full flex items-center justify-center border-3 border-white shadow-xl animate-pulse`}>
										<VipIcon className="w-4 h-4 text-white" />
									</div>
								)}
							</div>
							<div className="flex-1">
								<h1 className={`text-xl font-bold ${userVipLevel >= 0 ? currentVip.textColor : 'text-gray-800'} mb-1`}>
									{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED"
										? userDetail?.memberShopName
										: `${userDetail?.firstName} ${userDetail?.lastName}`}
								</h1>
								<p className={`text-sm ${userVipLevel >= 0 ? currentVip.textColor + ' opacity-90' : 'text-gray-500'} mb-2`}>
									Member ID: {userDetail?.vipCode}
								</p>
								{/* VIP Benefits Preview */}
								{/* {userVipLevel > 0 && (
									<div className="flex flex-wrap gap-1">
										{currentVip.benefits.slice(0, 2).map((benefit, index) => (
											<span key={index} className="px-2 py-1 text-xs text-white rounded-full bg-white/20 backdrop-blur-sm">
												{benefit}
											</span>
										))}
									</div>
								)} */}
							</div>
						</div>
					</div>

					{/* Balance Cards with VIP Styling */}
					{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" && (
						<div className="relative z-20 px-4 -mt-4">
							<div className="flex gap-3">
								<div className={`flex-1 ${userVipLevel > 0 ? currentVip.bgPattern : 'bg-yellow-50'} rounded-xl p-4 flex items-center gap-3 shadow-lg border ${userVipLevel > 0 ? currentVip.borderColor : 'border-yellow-200'} backdrop-blur-sm`}>
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-yellow-500'} rounded-full flex items-center justify-center shadow-lg`}>
										<Wallet className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-xs font-medium text-gray-600">กระเป่าเงิน</p>
										<p className="text-lg font-bold text-gray-800">{moneyUser?.money ? formatToCurrencyTHB(moneyUser?.money) : '฿0'}</p>
									</div>
								</div>
								<div className={`flex-1 ${userVipLevel > 0 ? currentVip.bgPattern : 'bg-orange-50'} rounded-xl p-4 flex items-center gap-3 shadow-lg border ${userVipLevel > 0 ? currentVip.borderColor : 'border-orange-200'} backdrop-blur-sm`}>
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-orange-500'} rounded-full flex items-center justify-center shadow-lg`}>
										<PiggyBank className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-xs font-medium text-gray-600">กำไร</p>
										<p className="text-lg font-bold text-gray-800">{moneyProfit ? formatToCurrencyTHB(moneyProfit?.money) : '฿0'}</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* View All Link */}
					<div className="flex justify-end px-4 mt-4 mb-">
						<Link href={`/order-tabs/${id}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800">
							ดูทั้งหมด <ChevronRight className="w-3 h-3" />
						</Link>
					</div>
				</div>

				{/* Main Content Section */}
				<div className="px-4 pb-20 bg-blue-50">
					{/* Order Status Section */}
					<div className="mb-6">
						<h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
							<ClipboardList className="w-5 h-5 text-blue-600" />
							คำสั่งของฉัน
						</h2>
						<div className="grid grid-cols-4 gap-2">
							<Link href={`/pending-orders/${id}`} className="flex flex-col items-center p-3 transition-all duration-200 bg-blue-50 rounded-xl">
								<div className="relative flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
									<ClipboardList className="w-6 h-6 text-white" />
									{orderCount > 0 && (
										<div className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg -top-2 -right-2 animate-pulse">
											{orderCount}
										</div>
									)}
								</div>
								<span className="text-xs font-medium text-center text-gray-700">คำสั่งซื้อ</span>
							</Link>
							<Link href={`/shipping-orders/${id}`} className="flex flex-col items-center p-3 transition-all duration-200 rounded-xl">
								<div className="relative flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-orange-500 to-orange-600">
									<ArchiveRestore className="w-6 h-6 text-white" />
									{shippingCount > 0 && (
										<div className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg -top-2 -right-2 animate-pulse">
											{shippingCount}
										</div>
									)}
								</div>
								<span className="text-xs font-medium text-center text-gray-700">รอการจัดส่ง</span>
							</Link>
							<Link href={`/completed-orders/${id}`} className="flex flex-col items-center p-3 rounded-xl">
								<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-green-600">
									<Coins className="w-6 h-6 text-white" />
								</div>
								<span className="text-xs font-medium text-center text-gray-700">จัดส่งสำเร็จ</span>
							</Link>
							<Link href={`/cancelled-orders/${id}`} className="flex flex-col items-center p-3 rounded-xl">
								<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-red-500 to-red-600">
									<XCircle className="w-6 h-6 text-white" />
								</div>
								<span className="text-xs font-medium text-center text-gray-700">ยกเลิก</span>
							</Link>
						</div>
					</div>

					{/* Services Grid Section */}
					<div className="space-y-6">
						{/* First Row - Main Services */}
						<div>
							<h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-gray-800">
								<Sparkles className="w-5 h-5 text-purple-600" />
								บริการหลัก
							</h3>
							<div className="grid grid-cols-3 gap-3">
								<Link href={`/select-product-to-store/${id}`} className="flex flex-col items-center p-3 transition-all duration-200 ">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-green-600">
										<ArchiveRestore className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">{t("selectProductsToAddToYourStore")}</span>
								</Link>
								<Link href={`/my-store-products/${id}`} className="flex flex-col items-center p-3 transition-all duration-200">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-orange-500 to-orange-600">
										<PiggyBank className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">ดูสินค้าในร้าน</span>
								</Link>
								<Link href={`/profile/payment-password/${id}`} className="flex flex-col items-center p-3 transition-all duration-200">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-red-500 to-red-600">
										<RectangleEllipsis className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">{t("paymentPassword")}</span>
								</Link>
								{/* <div className="flex flex-col items-center p-3 transition-all duration-200 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
										<DiamondPercent className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">การประเมินผล</span>
								</div> */}
							</div>
						</div>

						{/* Third Row - Settings */}
						<div>
							<h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-gray-800">
								<UserRoundCog className="w-5 h-5 text-gray-600" />
								การตั้งค่า
							</h3>
							<div className="grid grid-cols-4 gap-3">
								<Link href={`/profile/edit/${id}`} className="flex flex-col items-center p-3 transition-all duration-200 rounded-xl ">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700">
										<UserRoundCog className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">แก้ไขโปรไฟล์</span>
								</Link>
								<Link href={`/profile/bank/${id}`} className="flex flex-col items-center p-3 transition-all duration-200">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-green-600 to-green-700">
										<CreditCard className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">แก้ไขข้อมูลธนาคาร</span>
								</Link>
								<Link href={`/withdraw-profit/${id}`} className="flex flex-col items-center p-3 transition-all duration-200">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-orange-600 to-orange-700">
										<TrendingDown className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">ถอนกำไร</span>
								</Link>
								<Link href={`/profile/top-up/${id}`} className="flex flex-col items-center p-3 transition-all duration-200">
									<div className="flex items-center justify-center w-12 h-12 mb-2 rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-purple-700">
										<BanknoteIcon className="w-6 h-6 text-white" />
									</div>
									<span className="text-xs font-medium text-center text-gray-700">ถอน</span>
								</Link>
							</div>
						</div>
					</div>

					{/* Additional Menu for Members */}
					{/* {userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" && (
						<div className={`mt-6 ${userVipLevel > 0 ? currentVip.bgPattern : 'bg-gray-50'} rounded-xl p-4 border ${userVipLevel > 0 ? currentVip.borderColor : 'border-gray-200'} shadow-lg`}>
							<h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
								<Crown className={`w-5 h-5 ${userVipLevel > 0 ? 'text-yellow-600' : 'text-gray-600'}`} />
								เมนูสมาชิก {userVipLevel > 0 && <span className="text-sm font-medium text-yellow-600">VIP</span>}
							</h3>
							<div className="grid grid-cols-2 gap-3">
								<Link href={`/profile/bank/${id}`} className="flex items-center gap-3 p-4 transition-all duration-200 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-blue-500'} rounded-lg flex items-center justify-center shadow-lg`}>
										<CreditCard className="w-5 h-5 text-white" />
									</div>
									<span className="text-sm font-medium text-gray-700">{t("editBankInfo")}</span>
								</Link>
								<Link href={`/profile/payment-password/${id}`} className="flex items-center gap-3 p-4 transition-all duration-200 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-green-500'} rounded-lg flex items-center justify-center shadow-lg`}>
										<Wallet className="w-5 h-5 text-white" />
									</div>
									<span className="text-sm font-medium text-gray-700">{t("paymentPassword")}</span>
								</Link>
								<Link href={`/select-product-to-store/${id}`} className="flex items-center gap-3 p-4 transition-all duration-200 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-purple-500'} rounded-lg flex items-center justify-center shadow-lg`}>
										<ArchiveRestore className="w-5 h-5 text-white" />
									</div>
									<span className="text-sm font-medium text-gray-700">{t("selectProductsToAddToYourStore")}</span>
								</Link>
								<Link href={`/withdraw-profit/${id}`} className="flex items-center gap-3 p-4 transition-all duration-200 bg-white shadow-md rounded-xl hover:bg-gray-50 hover:shadow-lg">
									<div className={`w-10 h-10 ${userVipLevel > 0 ? `bg-gradient-to-r ${currentVip.color}` : 'bg-orange-500'} rounded-lg flex items-center justify-center shadow-lg`}>
										<PiggyBank className="w-5 h-5 text-white" />
									</div>
									<span className="text-sm font-medium text-gray-700">{t("withdrawProfit")}</span>
								</Link>
							</div>
						</div>
					)} */}

					{/* Logout Button */}
					<Link href="/logout" className="flex items-center justify-center gap-3 p-4 mt-6 transition-all duration-200 border border-red-200 shadow-lg bg-gradient-to-r from-red-50 to-pink-50 rounded-xl hover:from-red-100 hover:to-pink-100 hover:shadow-xl">
						<div className="flex items-center justify-center w-8 h-8 rounded-full shadow-lg bg-gradient-to-r from-red-500 to-red-600">
							<LogOut className="w-4 h-4 text-white" />
						</div>
						<span className="text-lg font-bold text-red-600">{t("logout")}</span>
					</Link>
				</div>
			</section>

			<div className="h-[65px] flex-shrink-0">
				<Footer />
			</div>
		</div>
	);
}
