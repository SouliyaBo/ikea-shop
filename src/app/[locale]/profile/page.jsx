"use client";
// Third Party
import { useTranslations } from "next-intl";

// UI
import Footer from "@/components/Home/Footer";
import { User } from "lucide-react";
import { useRouter } from "@/navigation";

export default function Profile() {
	const router = useRouter();
	const t = useTranslations("");

	return (
		<div className="w-full h-dvh ">
			<section className="h-[90%] overflow-hidden flex flex-col items-center relative">
				<div className="w-full h-[180px] bg-primary relative">
					<div className="absolute inset-x-0 bottom-[-50px] w-[100px] h-[100px] rounded-full mx-auto bg-primary flex-center border-4 border-white">
						<User size={56} className="text-white" />
					</div>
				</div>
				<h2 className="text-xl font-semibold mt-[60px]">
					{t("login")} {t("or")} {t("register")}
				</h2>
				{/* <p className="font-normal mt-[10px]">ເພື່ອສັ່ງຊື່ສິນຄ້າ</p> */}
				<div className="flex-center mt-[15px] gap-4">
					<button
						onClick={() => router.push("/register")}
						className="h-12 px-6 font-semibold text-white rounded-md bg-secondary"
						type="button"
					>
						{t("register")}
					</button>
					<button
						onClick={() => router.push("/login")}
						className="h-12 px-6 font-semibold text-white rounded-md bg-primary"
						type="button"
					>
						{t("login")}
					</button>
				</div>

				{/* <Link
					// href="/about-us"
					href="https://www.ctlhgroup.com/"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-[15px] text-primary"
				>
					{t("aboutUs")}
				</Link> */}

				{/* <div className="absolute px-4 bottom-4">
					<h2 className="text-[14px]">ເງື່ອນໄຂ ແລະ ນະໂຍບາຍການນຳໃຊ້ລະບົບ:</h2>
					<div className="flex flex-wrap items-center gap-1 text-[12px]">
						<Link href={"/term/register"} className="text-red-500 underline">
							ນະໂຍບາຍການສະໝັກສະມາຊິກ
						</Link>
						,
						<Link href={"/term/privacy"} className="text-red-500 underline">
							ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວສຳລັບເວັບໄຊທ໌
						</Link>
						,
						<Link href={"/term/purchase"} className="text-red-500 underline">
							ເງື່ອນໄຂການສັ່ງຊື້ສິນຄ້າ
						</Link>
					</div>
				</div> */}
			</section>
			<div className="h-[10%]">
				<Footer />
			</div>
		</div>
	);
}
