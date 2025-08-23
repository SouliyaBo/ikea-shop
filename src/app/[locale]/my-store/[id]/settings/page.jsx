"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "@/navigation";
import Image from "next/image";

// Icons
import {
	DoorOpen,
	Ambulance,
	Store,
	PackageSearch,
	PackagePlus,
	ClipboardList,
	HandCoins,
	CreditCard,
} from "lucide-react";

// Helper and Constants
import {
	get,
	getAccessTokenFromLCStorage,
	getUserDataFromLCStorage,
} from "@/helpers";

export default function StoreSetting() {
	const router = useRouter();

	const [accessToken, setAccessToken] = useState("");
	const [userData, setUserData] = useState(null);
	const [storeDetail, setStoreDetail] = useState(null);

	useEffect(() => {
		const token = getAccessTokenFromLCStorage();
		const user = getUserDataFromLCStorage();

		if (token) {
			setAccessToken(token);
		}

		if (user) {
			setUserData(user);
		}
	}, []);

	useEffect(() => {
		if (userData) {
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop/${userData?.data?.shop}`,
				accessToken,
				() => {},
				(data) => {
					setStoreDetail(data?.data);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [accessToken, userData]);

	const menus = [
		{
			id: 1,
			title: "ເພີ່ມສິນຄ້າ ແລະ ບໍລິການ",
			link: "settings/product/add",
			icon: PackagePlus,
		},
		// {
		// 	id: 2,
		// 	title: "ຄຳສັ່ງຊື້ ແລະ ຈັດສົ່ງ",
		// 	link: "settings/order-history",
		// 	icon: ClipboardList,
		// },
		// {
		// 	id: 3,
		// 	title: "ຈັດການສິນຄ້າ ແລະ ບໍລິການ",
		// 	link: "",
		// 	icon: PackageSearch,
		// },
		{
			id: 4,
			title: "ຈັດການຮ້ານ",
			link: "settings/store",
			icon: Store,
		},
		// {
		// 	id: 5,
		// 	title: "ຈັດການຂົນສົ່ງ",
		// 	link: "",
		// 	icon: Ambulance,
		// },
		{
			id: 5,
			title: "ຕັ້ງຄ່າບັນຊີທະນາຄານ",
			link: `settings/bank/${storeDetail?._id}`,
			icon: CreditCard,
		},
		{
			id: 6,
			title: "ການເຄຣມເງິນ",
			link: `settings/claim-money/${storeDetail?._id}`,
			icon: HandCoins,
		},
	];

	return (
		<main className="h-dvh">
			<section className="flex-center flex-col gap-4 h-[25%] space-y-4 p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 w-full">
				<div className="w-full flex-between">
					<h2 className="w-full text-2xl font-extrabold text-left">
						{storeDetail?.name}
					</h2>
					<button
						type="button"
						className="p-2 bg-white rounded-full"
						onClick={() => router.back()}
					>
						<DoorOpen size={24} className="text-primary" />
					</button>
				</div>

				<div className="w-full gap-4 flex-center">
					{storeDetail?.image ? (
						<Image
							src={process.env.NEXT_PUBLIC_S3_BUCKET + storeDetail?.image}
							alt="logo"
							width={100}
							height={100}
							className="w-20 h-20 rounded-full"
						/>
					) : (
						<div className="w-20 h-20 bg-[#ffec00] rounded-full" />
					)}

					<div className="flex-1 space-y-2">
						<h2 className="text-xl font-bold text-primary">
							{`${userData?.data?.firstName} ${userData?.data?.lastName}`}
						</h2>
						<div className="gap-4 w-fit flex-center">
							<p>{storeDetail?.phone}</p>
						</div>
					</div>
				</div>
			</section>
			<section className="w-full h-full p-4">
				<div className="grid w-full grid-cols-3 gap-4 p-4 rounded-lg shadow">
					{menus
						.filter((menu) => menu !== null)
						.map((menu) => (
							<Link
								href={menu.link}
								key={menu.id}
								className="flex flex-col items-center gap-2 text-center h-fit"
							>
								{/* <div className="w-16 h-16 rounded-full bg-primary" /> */}
								<menu.icon className="w-12 h-12 text-primary" />
								<p className="text-sm text-foreground">{menu.title}</p>
							</Link>
						))}
				</div>
			</section>
		</main>
	);
}
