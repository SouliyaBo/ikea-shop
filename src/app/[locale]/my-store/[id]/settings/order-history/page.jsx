"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import Link from "@/navigation";
import Image from "next/image";

// Third Party
import { useTranslations } from "next-intl";
import moment from "moment";

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { Store } from "lucide-react";

// Helper and Constants
import numberFormat from "@/helpers/numberFormat";

export default function StoreOrderHistory() {
	const t = useTranslations("");
	const router = useRouter();

	return (
		<main className="relative w-full space-y-4 h-dvh">
			<div className="sticky h-[10%] top-0 z-20 w-full p-4 bg-gradient-to-r from-rose-100 to-rose-200">
				<div className="w-full flex-between">
					<h2 className="w-full text-2xl font-extrabold text-left">
						ຄຳສັ່ງຊື້ ແລະ ຈັດສົ່ງ
					</h2>
					<button
						type="button"
						className="p-2 bg-white rounded-full"
						onClick={() => router.back()}
					>
						<Store size={24} className="text-primary" />
					</button>
				</div>
			</div>

			<div className="w-full h-[80px]  flex-center  mx-auto  ">
				<div className="w-[70%] h-full bg-white shadow rounded-xl flex items-center justify-around">
					<div className="flex-col space-y-2 flex-center">
						<p className="text-lg font-bold">50</p>
						<p>ຂົນສົ່ງ</p>
					</div>
					<div className="flex-col space-y-2 flex-center">
						<p className="text-lg font-bold">100</p>
						<p>ຈັດສົ່ງໂດຍທາງຮ້ານ</p>
					</div>
					<div className="flex-col space-y-2 flex-center">
						<p className="text-lg font-bold">100</p>
						<p>ໜ້າຮ້ານ</p>
					</div>
					{/* <div className="flex-col space-y-2 flex-center">
							<p className="text-lg font-bold">20</p>
							<p>ສິນຄ້າ</p>
						</div> */}
				</div>
			</div>

			<section className="w-full h-[90%] relative overflow-y-auto  space-y-4">
				<Tabs defaultValue="express" className="relative w-full px-4">
					<TabsList className="sticky top-0 z-10 w-full bg-rose-100">
						<TabsTrigger className="w-full focus:bg-primary" value="express">
							ຂົນສົ່ງ
						</TabsTrigger>
						<TabsTrigger className="w-full focus:bg-primary" value="self">
							ຈັດສົ່ງໂດຍທາງຮ້ານ
						</TabsTrigger>
						<TabsTrigger className="w-full focus:bg-primary" value="walkIn">
							ລູກຄ້າມາເອົາເອງໜ້າຮ້ານ
						</TabsTrigger>
					</TabsList>
					<TabsContent value="express">
						<div className="w-full h-full py-4 space-y-4 ">
							{Array.from({ length: 20 }).map((_, index) => (
								<div className="w-full gap-2 flex-center h-[120px]" key={index}>
									<div className="w-[120px] h-[120px] relative">
										<Image
											unoptimized
											src={
												// product?.image && product?.image !== ""
												// 	? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
												"/images/SD-default-image.png"
											}
											sizes="100%"
											alt="product"
											className="object-cover rounded-xl"
											fill
										/>
									</div>

									<div className="flex flex-col flex-1 h-full">
										<h3 className="text-lg">X</h3>
										<p className="font-bold text-primary">30,000</p>
										<p>ທ່ານ ລູກຄ້າ</p>
										<small>{moment().format("DD MMM YYYY")}</small>
									</div>
								</div>
							))}
						</div>
					</TabsContent>
					<TabsContent value="self">
						<div className="w-full h-full py-4 space-y-4 ">
							{Array.from({ length: 20 }).map((_, index) => (
								<div className="w-full gap-2 flex-center h-[120px]" key={index}>
									<div className="w-[120px] h-[120px] relative">
										<Image
											unoptimized
											src={
												// product?.image && product?.image !== ""
												// 	? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
												"/images/SD-default-image.png"
											}
											sizes="100%"
											alt="product"
											className="object-cover rounded-xl"
											fill
										/>
									</div>

									<div className="flex flex-col flex-1 h-full">
										<h3 className="text-lg">X</h3>
										<p className="font-bold text-primary">30,000</p>
										<p>ທ່ານ ລູກຄ້າ</p>
										<small>{moment().format("DD MMM YYYY")}</small>
									</div>
								</div>
							))}
						</div>
					</TabsContent>
					<TabsContent value="walkIn">
						<div className="w-full h-full py-4 space-y-4 ">
							{Array.from({ length: 20 }).map((_, index) => (
								<div className="w-full gap-2 flex-center h-[120px]" key={index}>
									<div className="w-[120px] h-[120px] relative">
										<Image
											unoptimized
											src={
												// product?.image && product?.image !== ""
												// 	? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
												"/images/SD-default-image.png"
											}
											sizes="100%"
											alt="product"
											className="object-cover rounded-xl"
											fill
										/>
									</div>

									<div className="flex flex-col flex-1 h-full">
										<h3 className="text-lg">X</h3>
										<p className="font-bold text-primary">30,000</p>
										<p>ທ່ານ ລູກຄ້າ</p>
										<small>{moment().format("DD MMM YYYY")}</small>
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</section>
		</main>
	);
}
