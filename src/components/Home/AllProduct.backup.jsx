"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, Link } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";
import { IconPickerItem } from "react-icons-picker";

// UI
import AdvertiseSlider from "./AdvertiseSlider";
import Loader from "../Loader";
import DotSpinner from "../DotSpinner";
import Skeleton from "../Skeleton";
import { useToast } from "@/components/ui/use-toast";

// Helpers
import  { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import numberFormat, { formatNumber } from "@/helpers/numberFormat";
import { create, gets } from "@/helpers";
import { Button } from "../ui/button";

export default function AllProduct() {
	const router = useRouter();
	const [userData, setUserData] = useState();
	const t = useTranslations("");
	const [dataProductLists, setDataProductLists] = useState(null);
	const [dataProductRecommendLists, setDataProductRecommendLists] = useState(
		[],
	);
	const [categoriesList, setCategoriesList] = useState([]);
	const [selectCategory, setSelectCategory] = useState("");
	const [dataBannerLists, setDataBannerLists] = useState("");

	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [isLoadMore, setIsLoadMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;
		if (USER_DATA) setUserData(USER_DATA);

		// setLoading(true);

		Promise.all([
			_getProductRecommend(),
			_getProduct(),
			_getCategories(),
			_getBanner(),
		])
			.then(
				([productRecommendData, productData, categoriesData, bannerData]) => {
					setDataProductRecommendLists(productRecommendData);
					setDataProductLists(productData);
					setCategoriesList(categoriesData);
					setDataBannerLists(bannerData);
					setLoading(false);
				},
			)
			.catch((err) => {
				setLoading(false);
				console.error(err);
			});
	}, []);

	useEffect(() => {
		if (dataProductLists) {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale`,
				{
					limit: 20,
					skip: Math.ceil((currentPage - 1) * 20),
				},
				"",
				setIsLoadMore,
				(response) => {
					const newData = response?.data?.data; // new product data array
					const newTotal = response?.data?.total; // new total count if needed
					// const newProductData = {
					// 	data: [...dataProductLists.data, ...newData],
					// 	total: newTotal,
					// };
					// console.log("new product", newProductData);
					setDataProductLists((prevState) => ({
						...prevState, // spread previous state to retain other values
						data: [...prevState.data, ...newData], // concatenate new data to existing data
						total: newTotal, // update total count
					}));
					setDataProductLists(newProductData);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [currentPage]);

	const _getCategories = () => {
		return new Promise((resolve, reject) => {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/category/sale`,
				{},
				"",
				() => { },
				(data) => {
					resolve(data?.data?.data);
				},
				(err) => {
					reject(err);
				},
			);
		});
	};

	const _getProductRecommend = () => {
		return new Promise((resolve, reject) => {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale`,
				{
					// name: data,
					limit: 4,
					isRecommend: true,
				},
				"",
				() => { },
				(data) => {
					resolve(data?.data);
				},
				(err) => {
					reject(err);
				},
			);
		});
	};

	const _getProduct = () => {
		return new Promise((resolve, reject) => {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale`,
				{
					// name: data,
					limit: 1000,
				},
				"",
				() => { },
				(data) => {
					resolve(data?.data);
				},
				(err) => {
					reject(err);
				},
			);
		});
	};

	const _getBanner = () => {
		return new Promise((resolve, reject) => {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/banner`,
				{},
				"",
				() => { },
				(data) => {
					resolve(data?.data?.data);
				},
				(err) => {
					reject(err);
				},
			);
		});
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
				console.log("error::", error?.response?.data?.errorCode);
				toast({
					title: "ไม่สำเร็จ",
					description: "กรุณาลองใหม่อีกครั้ง",
					variant: "destructive",
				});
			},
		);
	};

	return loading ? (
		<div className="flex flex-col w-full h-full p-4 ">
			<Skeleton className={"w-full h-[150px] rounded-md"} />
			<div className="grid justify-center grid-cols-5 gap-2 my-4 justify-items-center">
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton key={index} className={" h-[40px] w-[40px] rounded-md"} />
				))}
			</div>
			<div className="mt-6 space-y-4">
				<Skeleton className={"w-[150px] h-[20px] rounded-md"} />
				<div className="grid items-center grid-cols-2 gap-2 ">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton key={index} className={" h-[180px] w-full rounded-md"} />
					))}
				</div>
			</div>
		</div>
	) : (
		// <div className="flex flex-col w-full h-full gap-4 px-4 py-2 overflow-y-auto bg-[#eee]">
		<div className="flex flex-col w-full h-full gap-4 py-2 overflow-y-auto bg-[#eee]">
			<section className="flex flex-col gap-3 p-4 bg-white ">
				<div>
					<AdvertiseSlider data={dataBannerLists} />
				</div>
				<div className="mt-2 category-container">
					{categoriesList?.length > 0 &&
						categoriesList?.map((category) => (
							<div
								key={category.name}
								className="flex flex-col items-center"
								onClick={() => setSelectCategory(category?._id)}
								onKeyDown={() => ""}
							>
								<div className="flex-center  relative  gap-2 w-[40px] h-[40px]">
									{category?.image ? (
										<Image
											src={`${process.env.NEXT_PUBLIC_MEDIUM_RESIZE}${category?.image}`}
											alt="user"
											className="object-contain rounded-md "
											fill
											priority
											sizes="100%"
											unoptimized
										/>
									) : (
										<IconPickerItem
											value={category?.icon}
											size={24}
											className="text-primary"
										/>
									)}
									<Link
										href={`categories/${category?._id}`}
										className="absolute inset-0 opacity-0"
									/>
								</div>

								<p className="w-full text-[10px] text-nowrap">
									{category?.name}
								</p>
							</div>
						))}
				</div>
			</section>

			{/* <section className="flex flex-col gap-3 px-4 py-2 bg-white">
				<h2 className="text-xl font-semibold">ໝວດໝູ່ສີນຄ້າ</h2>
			</section> */}

			{dataProductRecommendLists?.data?.length > 0 && (
				// <section className="flex flex-col gap-3 p-4 bg-gradient-to-t from-[#084392] to-white">
				<section className="flex flex-col gap-3 p-4 bg-gradient-to-t from-[#f59e0b] to-white">
					<div className="w-full flex-between">
						<h2 className="text-lg font-semibold">{t("recommendedProduct")}</h2>
						<Link
							className="text-gray-400 cursor-pointer text-primary"
							href={"/featured-product"}
						>
							{t("seeMore")}
						</Link>
					</div>
					<div className="grid items-center grid-cols-2 gap-2">
						{dataProductRecommendLists?.data?.map((product) => (
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
												? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
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
												{numberFormat(product?.sellPrice)}
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
										{/* <Image
											onKeyDown={() => { }}
											onClick={(e) => handleAddToCart(product?._id, e)}
											src="/images/cart-plus-primary.min.svg"
											alt="cart"
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
			)}

			<section className="flex flex-col gap-3 p-4 bg-gradient-to-t from-[#084392] to-white ">
				<h2 className="text-lg font-semibold">{t("allProduct")}</h2>
				<div className="grid items-center grid-cols-2 gap-2">
					{dataProductLists?.data?.length > 0 &&
						dataProductLists?.data?.map((product) => (
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
												? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
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
									<div className="flex items-center justify-between mt-4">
										{product?.percentDiscount > 0 ? (
											<small className="text-gray-500 line-through">
												{numberFormat(product?.sellPrice)}
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
										{/* {product?.shop !== undefined &&
											userData?.data?.shop !== undefined &&
											product?.shop === userData?.data?.shop ? null : (
											<Image
												onKeyDown={() => { }}
												alt="add to cart"
												onClick={(e) =>
													product?.shop
														? router.push(
															product?.commission > 0
																? `/product/${product?._id}?userCode=${userData?.data?.vipCode}`
																: `/product/${product?._id}`,
														)
														: handleAddToCart(product?._id, e)
												}
												src="/images/cart-plus-primary.min.svg"
												// className="w-6 h-6 "
												width={24}
												height={24}
												unoptimized
											/>
										)} */}
									</div>
								</div>
							</Link>
						))}
				</div>
			</section>
		</div>
	);
}
