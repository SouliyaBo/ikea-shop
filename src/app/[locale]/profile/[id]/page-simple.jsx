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
	const [orderCount, setOrderCount] = useState(0);
	const [userVipLevel, setUserVipLevel] = useState(0);

	const currentVip = VIP_TIERS[userVipLevel];
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
					setUserVipLevel(parseInt(res.data?.vipLevel));
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
			<section className="relative flex-1 overflow-x-hidden overflow-y-auto bg-white scroll-smooth">
				{/* Header Section with Profile */}
				<div className="relative px-4 pt-8 pb-4 bg-white">
					{/* Header with Title */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<Avatar className="w-12 h-12 border-2 border-gray-200">
								<AvatarImage src={process.env.NEXT_PUBLIC_MEDIUM_RESIZE + userDetail?.image || "/placeholder.svg"} alt="Profile" />
								<AvatarFallback className="text-sm font-bold bg-gray-100">{userDetail?.firstName?.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<h1 className="text-lg font-semibold text-gray-800">
									{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED"
										? userDetail?.memberShopName
										: `${userDetail?.firstName} ${userDetail?.lastName}`}
								</h1>
								<p className="text-sm text-gray-500">ID: {userDetail?.vipCode}</p>
							</div>
						</div>
						<a href="https://line.me/ti/p/jLKF6aZaYc" target="_blank" className="text-sm text-blue-600 hover:text-blue-800">
							<Phone className="w-4 h-4" />
						</a>
					</div>

					{/* Balance Cards */}
					{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" && (
						<div className="flex gap-4 mb-6">
							<div className="flex items-center flex-1 gap-3 p-4 rounded-lg bg-yellow-50">
								<div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full">
									<span className="text-sm font-bold text-white">฿</span>
								</div>
								<div>
									<p className="text-xs text-gray-600">คูปอง</p>
									<p className="text-sm font-semibold">{moneyUser?.money ? formatToCurrencyTHB(moneyUser?.money) : 0}</p>
								</div>
							</div>
							<div className="flex items-center flex-1 gap-3 p-4 rounded-lg bg-orange-50">
								<div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full">
									<PiggyBank className="w-4 h-4 text-white" />
								</div>
								<div>
									<p className="text-xs text-gray-600">ห้างสรรพสินค้า</p>
									<p className="text-sm font-semibold">{moneyProfit ? formatToCurrencyTHB(moneyProfit?.money) : 0}</p>
								</div>
							</div>
						</div>
					)}

					{/* View All Link */}
					<div className="flex justify-end mb-4">
						<Link href={`/order-history/${id}`} className="text-sm text-blue-600 hover:text-blue-800">
							ดูทั้งหมด &gt;
						</Link>
					</div>
				</div>

				{/* Main Content Section */}
				<div className="px-4 pb-20 bg-white">
					{/* Order Status Section */}
					<div className="mb-6">
						<h2 className="mb-4 text-base font-semibold text-gray-800">คำสั่งของฉัน</h2>
						<div className="grid grid-cols-5 gap-3">
							<Link href={`/order-history/${id}`} className="flex flex-col items-center p-3 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-500 rounded-lg">
									<ClipboardList className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">คำสั่งซื้อ</span>
								{orderCount > 0 && (
									<div className="flex items-center justify-center w-5 h-5 mt-1 text-xs text-white bg-red-500 rounded-full">
										{orderCount}
									</div>
								)}
							</Link>
							<div className="flex flex-col items-center p-3 rounded-lg bg-orange-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-orange-500 rounded-lg">
									<ArchiveRestore className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">รอการจัดส่ง</span>
							</div>
							<div className="flex flex-col items-center p-3 rounded-lg bg-green-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-green-500 rounded-lg">
									<Coins className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">รับสินค้า</span>
							</div>
						</div>
					</div>

					{/* Services Grid Section */}
					<div className="space-y-6">
						{/* First Row - Main Services */}
						<div className="grid grid-cols-4 gap-3">
							<div className="flex flex-col items-center p-3 rounded-lg bg-green-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-green-500 rounded-lg">
									<UserRoundCog className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">แก้ไขโปรไฟล์</span>
							</div>
							<Link href={`/profile/payment-password/${id}`} className="flex flex-col items-center p-3 transition-colors rounded-lg bg-orange-50 hover:bg-orange-100">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-orange-500 rounded-lg">
									<Key className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">รหัสผ่านชำระเงิน</span>
							</Link>
							<Link href={`/profile/bank/${id}`} className="flex flex-col items-center p-3 rounded-lg bg-red-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-red-500 rounded-lg">
									<Landmark className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">แก้ไขข้อมูลธนาคาร</span>
							</Link>
							<Link href={`/profile/top-up/${id}`} className="flex flex-col items-center p-3 rounded-lg bg-blue-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-600 rounded-lg">
									<Coins className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">ฝากเงิน</span>
							</Link>
						</div>

						{/* Second Row - Additional Services */}
						<div className="grid grid-cols-4 gap-3">
							<Link href={`/order-history/${id}`} className="flex flex-col items-center p-3 rounded-lg bg-red-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-red-500 rounded-lg">
									<ClipboardList className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">การจัดสั่งชื้อ</span>
							</Link>
							<Link href={`/select-product-to-store/${id}`} className="flex flex-col items-center p-3 transition-colors rounded-lg bg-pink-50 hover:bg-pink-100">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-pink-500 rounded-lg">
									<ArchiveRestore className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">เลือกสินค้าเข้าร้าน</span>
							</Link>
							<a href="https://line.me/ti/p/jLKF6aZaYc" target="_blank" className="flex flex-col items-center p-3 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-500 rounded-lg">
									<Phone className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">ดูสินค้าในร้าน</span>
							</a>
							<Link href={`/claim-history/${id}`} className="flex flex-col items-center p-3 rounded-lg bg-red-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-red-600 rounded-lg">
									<HandCoins className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">ถอน</span>
							</Link>

						</div>

						{/* Third Row - Settings */}
						<div className="grid grid-cols-4 gap-3">
							{/* <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-600 rounded-lg">
									<Award className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">เกี่ยวกับเรา</span>
							</div> */}
							{/* <Link href={`/profile/edit/${id}`} className="flex flex-col items-center p-3 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
								<div className="flex items-center justify-center w-10 h-10 mb-2 bg-blue-600 rounded-lg">
									<UserRoundCog className="w-5 h-5 text-white" />
								</div>
								<span className="text-xs text-center text-gray-700">ตั้งค่า</span>
							</Link> */}
							<div className="flex flex-col items-center p-3"></div>
							<div className="flex flex-col items-center p-3"></div>
						</div>
					</div>

					{/* Additional Menu for Members */}
					{userDetail?.role === "MEMBER" && userDetail?.memberStatus === "APPROVED" && (
						<div className="p-4 mt-6 rounded-lg bg-gray-50">
							<h3 className="mb-3 text-sm font-semibold text-gray-800">เมนูสมาชิก</h3>
							<div className="grid grid-cols-2 gap-3">
								<Link href={`/profile/bank/${id}`} className="flex items-center gap-3 p-3 transition-colors bg-white rounded-lg hover:bg-gray-50">
									<CreditCard className="w-5 h-5 text-blue-600" />
									<span className="text-sm text-gray-700">{t("editBankInfo")}</span>
								</Link>
								<Link href={`/profile/payment-password/${id}`} className="flex items-center gap-3 p-3 transition-colors bg-white rounded-lg hover:bg-gray-50">
									<Wallet className="w-5 h-5 text-green-600" />
									<span className="text-sm text-gray-700">{t("paymentPassword")}</span>
								</Link>
								<Link href={`/select-product-to-store/${id}`} className="flex items-center gap-3 p-3 transition-colors bg-white rounded-lg hover:bg-gray-50">
									<ArchiveRestore className="w-5 h-5 text-purple-600" />
									<span className="text-sm text-gray-700">{t("selectProductsToAddToYourStore")}</span>
								</Link>
								<Link href={`/withdraw-profit/${id}`} className="flex items-center gap-3 p-3 transition-colors bg-white rounded-lg hover:bg-gray-50">
									<PiggyBank className="w-5 h-5 text-orange-600" />
									<span className="text-sm text-gray-700">{t("withdrawProfit")}</span>
								</Link>
							</div>
						</div>
					)}

					{/* Logout Button */}
					<Link href="/logout" className="flex items-center justify-center gap-3 p-4 mt-6 transition-colors rounded-lg bg-red-50 hover:bg-red-100">
						<LogOut className="w-5 h-5 text-red-600" />
						<span className="font-medium text-red-600">{t("logout")}</span>
					</Link>
				</div>
			</section>

			<div className="h-[65px] flex-shrink-0">
				<Footer />
			</div>
		</div>
	);
}
