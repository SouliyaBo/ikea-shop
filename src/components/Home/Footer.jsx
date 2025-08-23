"use client";
import { useEffect, useState } from "react";
import { usePathname, Link } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import { Home, ShoppingCart, User, Store, HeartHandshake } from "lucide-react";

// Helpers
import { getUserDataFromLCStorage } from "@/helpers";

export default function Footer() {
	const pathname = usePathname();
	const t = useTranslations("");
	const [userData, setUserData] = useState(undefined);

	const shopData =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("shopData"))
			: null;

	useEffect(() => {
		const dataLogin = getUserDataFromLCStorage();

		if (dataLogin) {
			setUserData(dataLogin);
		}
	}, []);

	return (
		<footer className="w-full h-full border shadow-xl text-primary-foreground flex-center">
			<div className="flex justify-around w-full ">
				<Link
					href={"/"}
					className={`flex flex-col items-center justify-center ${pathname === "/" ? "text-primary" : "text-primary-foreground"
						}`}
				>
					<Home size={28} />
					<span className="text-[12px]">{t("home")}</span>
				</Link>

				<Link
					href={"/cart"}
					className={`flex flex-col items-center justify-center ${pathname.startsWith("/cart")
							? "text-primary"
							: "text-primary-foreground"
						}`}
				>
					<ShoppingCart size={28} />
					<span className="text-[12px]">{t("cart")}</span>
				</Link>
				{/* {userData?.data?._id ? (
					<Link
						// href={"/partnership/request"}
						href={
							userData?.data?.role === "MEMBER"
								? `/partnership/request?userId=${userData?.data?._id}`
								: "/partnership/request"
						}
						className={`flex flex-col items-center justify-center ${
							pathname.startsWith("/partnership")
								? "text-primary"
								: "text-primary-foreground"
						}`}
					>
						<HeartHandshake size={28} />
						<span className="text-[12px]">
							{userData?.data?.role === "MEMBER"
								? "อัปเกต Partner"
								: "สมัครเป็น Partner"}
						</span>
					</Link>
				) : null} */}
				{/* {shopData || userData?.data?.shop ? (
					<Link
						href={
							shopData?.status === "REQUESTING"
								? "/store-register/pending-review"
								: `/my-store/${userData?.data?.shop}`
						}
						className={`flex flex-col items-center justify-center ${
							pathname.startsWith("/my-store")
								? "text-primary"
								: "text-primary-foreground"
						}`}
					>
						<Store size={28} />
						<span className="text-[12px]">ຮ້ານຂອງຂ້ອຍ</span>
					</Link>
				) : null} */}
				<Link
					href={`/profile${userData?.data?._id ? `/${userData?.data?._id}` : ""}`}
					className={`flex flex-col items-center justify-center ${pathname.startsWith("/profile")
							? "text-primary"
							: "text-primary-foreground"
						}`}
				>
					<User size={28} />
					<span className="text-[12px]">{t("account")}</span>
				</Link>
			</div>
		</footer>
	);
}
