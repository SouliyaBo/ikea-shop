"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// UI
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Component
import Footer from "@/components/Home/Footer";
import AnimateBanner from "@/components/AnimateBanner";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";

// Helper
import { gets, get, create } from "@/helpers/index";
import currencyDisplay from "@/helpers/currencyDisplay";
import numberFormat, { formatNumber } from "@/helpers/numberFormat";
import formatToCurrencyTHB from "@/helpers/currencyDisplay";

export default function Page() {
	// const { id } = params;
	const t = useTranslations("");
	const [userData, setUserData] = useState();
	const router = useRouter();
	const [dataProductLists, setDataProductLists] = useState([]);
	const [loading, setLoading] = useState(false);

	const { toast } = useToast();

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;
		if (USER_DATA) setUserData(USER_DATA);

		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale`,
			{
				// name: data,
				limit: 1000,
				isRecommend: true,
			},
			"",
			setLoading,
			(data) => {
				setDataProductLists(data.data);
			},
			(err) => {
				console.log(err);
			},
		);
	}, []);

	const handleAddToCart = (id, e) => {
		e.preventDefault();

		if (userData?.data === null || userData?.data === undefined) {
			toast({
				title: "ไม่สำเร็จ",
				description: (
					<div className="flex flex-col ">
						<p>กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อน</p>
						<Button
							onClick={() => router.push("/profile")}
							variant="outline"
							className="text-black"
						>
							เข้าสู่ระบบหรือสมัครสมาชิก
						</Button>
					</div>
				),

				variant: "destructive",
			});

			return;
		}

		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/cart`,
			{ productId: id, qty: 1 },
			userData?.accessToken,
			() => { },
			(data) => {
				if (data?.error === false) {
				}
			},
			(error) => {
				console.log("error::", error?.response?.data?.errorCode);
			},
		);
	};


	return loading ? (
		<div className="w-full p-4 space-y-4">
			<Skeleton className={"w-[200px]  h-[30px] mx-auto"} />
			<Skeleton className={"w-full h-[200px] rounded-md"} />

			<div className="grid items-center grid-cols-2 gap-4 ">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className={"w-full h-[180px] rounded-lg"} />
				))}
			</div>
		</div>
	) : (
		<div className="w-full h-dvh">
			<section className="h-[92%] overflow-x-auto">
				<div className="h-[10%] relative">
					<div className="absolute z-10 w-full mx-auto mt-5 ">
						<div className="w-[90%] mx-auto  flex items-center">
							<div
								onClick={() => router.back()}
								onKeyDown={() => { }}
								className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
							>
								<ChevronLeft size={24} className="text-white" />
							</div>
							<h1 className="w-[70%] mx-auto text-xl font-bold text-center translate-x-[-5%]">
								{t("recommendedProduct")}
							</h1>
						</div>
					</div>
				</div>
				<section className="flex flex-col gap-3 px-[16px] pb-[16px]">
					{/* <div className="bg-gradient-to-r from-rose-300 to-rose-500 h-[200px] w-full rounded-md flex-center text-white">
						Banner
					</div> */}
					<AnimateBanner />
					<div className="grid items-center grid-cols-2 gap-4">
						{dataProductLists?.data?.length > 0 &&
							dataProductLists?.data?.map((product) => (
								<Link
									key={product?._id}
									className="relative flex-col gap-4 p-2 bg-white rounded-md shadow flex-center"
									href={
										product?.commission > 0
											? `/product/${product?._id}?userCode=${userData?.data?.vipCode}`
											: `/product/${product?._id}`
									}
								>
									{product?.commission > 0 ? (
										<div className="absolute z-10 text-[12px] text-white px-4 py-2 rounded-full top-2 right-2 bg-primary">
											Commission {numberFormat(product?.commission)} %
										</div>
									) : null}
									<div className="relative h-[180px] overflow-hidden rounded-lg w-full">
										<Image
											unoptimized
											src={
												product?.image && product?.image !== ""
													? process.env.NEXT_PUBLIC_MEDIUM_RESIZE +
													product?.image
													: "/images/SD-default-image.png"
											}
											sizes="100%"
											alt="product"
											className="object-cover"
											fill
										/>
									</div>
									<div className="w-full text-left">
										<p className="text-xs text-gray-500">
											{t("sold")}: {formatNumber(product?.soldQty)}
										</p>
										<p className="text-sm truncate">{product?.name}</p>

										<div className="flex justify-between mt-4">
											{/* {product?.percentDiscount > 0 ? (
												<small className="text-gray-500 line-through">
													{formatToCurrencyTHB(product?.sellPrice)}
												</small>
											) : null} */}
											<p className="font-semibold text-md text-primary">
												{currencyDisplay(product?.sellPrice)}
											</p>
											{/* <Image
												onKeyDown={() => { }}
												alt="add to cart"
												onClick={(e) => handleAddToCart(product?._id, e)}
												src="/images/cart-plus-primary.min.svg"
												// className="w-6 h-6 "
												width={24}
												height={24}
												unoptimized
											/> */}
										</div>
									</div>
								</Link>
							))}
					</div>
				</section>
			</section>
			<div className="h-[8%]">
				<Footer />
			</div>
		</div>
	);
}
