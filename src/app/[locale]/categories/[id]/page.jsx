"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import Footer from "@/components/Home/Footer";
import Skeleton from "@/components/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Helpers
import { gets, get, create } from "@/helpers/index";
import { formatNumber } from "@/helpers/numberFormat";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function Page({ params }) {
	const t = useTranslations("");
	const router = useRouter();
	const { id } = params;
	const [userData, setUserData] = useState();
	const [dataProductLists, setDataProductLists] = useState([]);
	const [categoryData, setCategoryData] = useState({});
	const [loading, setLoading] = useState(false);

	const { toast } = useToast();

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;
		if (USER_DATA) setUserData(USER_DATA);

		_getProduct(id);
		_getCategories(id);
	}, [id]);

	const _getProduct = (id) => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale/`,
			{ categoryId: id },
			"",
			setLoading,
			(data) => {
				setDataProductLists(data?.data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const _getCategories = (id) => {
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/category/sale/${id}`,
			"",
			() => { },
			(data) => {
				setCategoryData(data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

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
				toast({
					title: "สำเร็จ",
					description: "สินค้าได้ถูกเพิ่มไปยังตะกร้าสำเร็จ",
				});
			},
			(error) => {
				toast({
					title: "ไม่สำเร็จ",
					description: "กรุณาลองใหม่อีกครั้ง",
					variant: "destructive",
				});
			},
		);
	};

	return loading ? (
		<div className="w-full p-4">
			<Skeleton className={"w-[200px] h-[30px] mx-auto"} />

			<div className="grid items-center grid-cols-2 gap-4 my-4">
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
								// href={"/"}
								onClick={() => router.back()}
								onKeyDown={() => { }}
								className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
							>
								<ChevronLeft size={24} className="text-white" />
							</div>
							<h1 className="w-[70%] mx-auto text-xl font-bold text-center translate-x-[-5%]">
								{categoryData?.name}
							</h1>
						</div>
					</div>
				</div>
				<section className="flex flex-col gap-3 p-[16px]">
					<div className="grid items-center grid-cols-2 gap-4">
						{dataProductLists?.length > 0 &&
							dataProductLists?.map((product) => (
								<Link
									key={product?._id}
									className="relative flex-col gap-4 p-2 bg-white rounded-md shadow flex-center"
									href={
										userData?.data?.role === "MEMBER"
											? `/product/${product?._id}?userCode=${userData?.data?.vipCode}`
											: `/product/${product?._id}`
									}
								>
									{/* {product?.commission > 0 ? (
										<div className="absolute z-10 text-[12px] text-white px-4 py-2 rounded-full top-2 right-2 bg-primary">
											Commission {numberFormat(product?.commission)} %
										</div>
									) : null} */}
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
											{product?.percentDiscount > 0 ? (
												<small className="text-gray-500 line-through">
													{formatToCurrencyTHB(product?.sellPrice)}
												</small>
											) : null}
											<p className="font-semibold text-md text-primary">
												{product?.percentDiscount > 0
													? formatToCurrencyTHB(
														product?.sellPrice -
														product?.sellPrice *
														(product?.percentDiscount / 100),
													)
													: formatToCurrencyTHB(product?.sellPrice)}{" "}
												{/* {t("kip")} */}
											</p>
											<Image
												onKeyDown={() => { }}
												alt="add to cart"
												onClick={(e) => handleAddToCart(product?._id, e)}
												src="/images/cart-plus-primary.min.svg"
												width={24}
												height={24}
												unoptimized
											/>
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
