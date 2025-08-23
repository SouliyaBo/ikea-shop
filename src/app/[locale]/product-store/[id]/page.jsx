/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Icons
import { ChevronLeft, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";

// UI
import ProductFooter from "@/components/Product/ProductFooter";
import Confirm from "@/components/ui/confirm";
import AlertSuccess from "@/components/ui/alertSuccess";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import SweetAlert from "@/components/SweetAlert";
import Skeleton from "@/components/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Third Party
import { useTranslations } from "next-intl";

// Helpers
import { get, create, gets } from "@/helpers/index";
import numberFormat, { formatNumber } from "@/helpers/numberFormat";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { getUserDataFromLCStorage } from "@/helpers";

export default function ProductDetail({ params }) {
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;
	const router = useRouter();
	const t = useTranslations("");
	const { toast } = useToast();
	const searchParams = useSearchParams();

	const [detailProduct, setDetailProduct] = useState({});
	const [productOptions, setProductOptions] = useState([]);

	const [display, setDisplay] = useState(null);
	const [success, setSuccess] = useState(false);
	const [count, setCount] = useState(1);
	const [banner, setBanner] = useState();
	const [loading, setLoading] = useState(false);

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [filteredImages, setFilteredImages] = useState([]);
	const [selectOption, setSelectOption] = useState([]);
	const [userData, setUserData] = useState(undefined);

	const { id } = params;
	useEffect(() => {
		_getProduct(id);
		_getProductOption(id);
	}, [id]);

	useEffect(() => {
		const dataLogin = getUserDataFromLCStorage();

		if (dataLogin) {
			setUserData(dataLogin);
		}
	}, []);
	useEffect(() => {
		// Filter images on component mount or when detailProduct changes
		const validImages =
			detailProduct?.imageDetail?.filter((image) => image && image !== "") ||
			[];
		setFilteredImages(validImages);
	}, [detailProduct]);
	useEffect(() => {
		if (searchParams?.get("userCode")) {
			const inviteUserCode = searchParams?.get("userCode");

			if (inviteUserCode !== USER_DATA?.data?.vipCode) {
				localStorage.setItem("productVipCode", inviteUserCode);
			}

			console.log("searchParams: ", searchParams?.get("userCode"));
		}
	}, [searchParams, USER_DATA]);

	const _getProduct = (id) => {
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale/${id}`,
			// TOKEN,
			"",
			setLoading,
			(data) => {
				setDetailProduct(data?.data);
				setBanner(data?.data?.image);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const _getProductOption = (id) => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product-option`,
			// TOKEN,
			{
				product: id,
			},
			"",
			setLoading,
			(data) => {
				setProductOptions(data?.data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const handleAddToCart = () => {
		if (USER_DATA?.data === null || USER_DATA?.data === undefined) {
			toast({
				title: "ไม่สำเร็จ",
				description: (
					<div className="flex flex-col">
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
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-shop-product`,
			{
				product: id,
				vipCode: USER_DATA?.data?.vipCode,
				user: USER_DATA?.data?._id
			},
			TOKEN,
			() => { },
			(data) => {
				if (data?.error === false) {
					toast({
						title: "สำเร็จ",
						description: "สินค้าได้ถูกเพิ่มไปยังร้านค้าของคุณแล้ว",
					});
				}
			},
			(error) => {
				if (error?.response?.data?.error === true)
					toast({
						title: "ไม่สำเร็จ",
						description: "กรุณาลองใหม่อีกครั้ง",
						variant: "destructive",
					});
				console.log("error:: ", error);
			},
		);

		// create(
		// 	`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/cart`,
		// 	{
		// 		productId: id,
		// 		qty: count,
		// 		note:
		// 			selectOption?.length > 0
		// 				? selectOption
		// 					.map(
		// 						(item, index) =>
		// 							`${item.title}: ${item.value}${index === selectOption.length - 1 ? "" : ", "}`,
		// 					)
		// 					.join("") // Join the mapped values into a single string
		// 				: null,
		// 		shop: detailProduct?.shop,
		// 	},
		// 	TOKEN,
		// 	() => { },
		// 	(data) => {
		// 		if (data?.error === false) {
		// 			toast({
		// 				title: "สำเร็จ",
		// 				description: "สินค้าได้ถูกเพิ่มไปยังตะกร้าสำเร็จ",
		// 			});
		// 		}

		// 		console.log("success: ", data);
		// 	},
		// 	(error) => {
		// 		if (error?.response?.data?.message === "Unauthorized!")
		// 			toast({
		// 				title: "ไม่สำเร็จ",
		// 				description: "กรุณาลองใหม่อีกครั้ง",
		// 				variant: "destructive",
		// 			});
		// 		console.log("error:: ", error?.response?.data?.message);
		// 	},
		// );
	};

	const handlePrev = () => {
		setCurrentImageIndex((prev) =>
			prev > 0 ? prev - 1 : filteredImages.length - 1,
		);
	};

	const handleNext = () => {
		setCurrentImageIndex((prev) =>
			prev < filteredImages.length - 1 ? prev + 1 : 0,
		);
	};

	const increment = () => {
		if (detailProduct?.shop) {
			setCount((prevCount) => prevCount + 1);
		} else {
			if (count < detailProduct?.qty) {
				setCount((prevCount) => prevCount + 1);
			}
		}
	};

	const decrement = () => {
		if (count > 1) {
			setCount((prevCount) => prevCount - 1);
		}
	};

	const handleCopyProductLink = () => {
		navigator.clipboard
			.writeText(window.location.href)
			.then(() => {
				toast({
					title: "สำเร็จ",
					description: "Copy Link สำเร็จ.",
				});
			})
			.catch((error) => {
				toast({
					title: "ไม่สำเร็จ",
					description: "Copy Link ไม่สำเร็จ.",
					variant: "destructive",
				});
			});
	};

	return loading ? (
		<div className="w-full p-4 space-y-4">
			<Skeleton className={"w-[150px] mx-auto h-[20px] "} />
			<Skeleton className={"w-full h-[300px] rounded-md"} />

			<Skeleton className={"w-[200px] h-[20px] "} />
			<Skeleton className={"w-[100px] h-[10px] "} />
			<div className="grid grid-cols-5 gap-4">
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton key={index} className={"w-full h-[60px] rounded-md"} />
				))}
			</div>
			<div className="flex flex-col w-full gap-3">
				{Array.from({ length: 10 }).map((_, index) => (
					<Skeleton key={index} className={"w-full h-[10px] rounded-md"} />
				))}
			</div>
		</div>
	) : (
		<div className="relative w-full h-dvh">
			<section className="h-[90%] overflow-x-auto">
				<div className="h-[50%] overflow-hidden ">
					<div className="w-full mx-auto mt-5 ">
						<div className="w-[90%] mx-auto flex items-center mb-4">
							{/* <Link
								href={"/"}
								className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
							>
								<ChevronLeft size={24} className="text-white" />
							</Link> */}
							<div
								onClick={() => {
									router.push(`/select-product-to-store${userData?.data?._id ? `/${userData?.data?._id}` : ""}`);
								}}
								onKeyDown={() => { }}
								className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
							>
								<ChevronLeft size={24} className="text-white" />
							</div>
							<h1 className="w-[70%] mx-auto text-xl font-bold text-center translate-x-[-5%]">
								{t("productDetail")}
							</h1>
							<div>
								{/* <Link
									href={"/cart"}
									className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
								>
									<ShoppingCart size={24} className="text-white" />
								</Link> */}
							</div>
						</div>
					</div>
					<div className="relative w-full h-full">
						<Image
							fill
							src={
								detailProduct?.image !== ""
									? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + banner
									: "/images/SD-default-image.png"
							}
							alt="product"
							className="object-contain w-full h-full "
							unoptimized
						/>
					</div>
				</div>
				<div className="h-[50%] px-4 py-4 ">
					<div className="flex justify-between text-secondary">
						<small>{detailProduct?.categoryName}</small>
						<div className="flex flex-col">
							{!detailProduct?.shop ? (
								<small>
									{" "}
									{t("stock")}: {numberFormat(detailProduct?.qty)}
								</small>
							) : null}
							<small className="font-semibold text-primary">
								{" "}
								{t("sold")}: {formatNumber(detailProduct?.soldQty)}
							</small>
						</div>
					</div>
					{/* {detailProduct?.commission > 0 &&
					USER_DATA?.data !== null &&
					USER_DATA?.data !== undefined ? (
						<div className="my-2 flex-between">
							<p className="text-primary">
								สินค้านี้มีค่าคอมมิชชั่น {numberFormat(detailProduct?.commission)}%
							</p>
							<Button className="text-white" onClick={handleCopyProductLink}>
								Copy Link
							</Button>
						</div>
					) : null} */}
					{USER_DATA?.data?.role === "MEMBER" ? (
						<div className="my-2 flex-between">
							{/* <p className="text-primary">
								สินค้านี้มีค่าคอมมิชชั่น {numberFormat(detailProduct?.commission)}%
							</p> */}
							<Button className="text-white" onClick={handleCopyProductLink}>
								Copy Link
							</Button>
						</div>
					) : null}
					<h1 className="text-lg font-semibold">{detailProduct?.name}</h1>
					<div className="flex items-center gap-2">
						{detailProduct?.percentDiscount > 0 ? (
							<small className="text-gray-500 line-through">
								{formatToCurrencyTHB(detailProduct?.sellPrice)}
							</small>
						) : null}
						<p className="font-semibold text-primary">
							{detailProduct?.percentDiscount > 0
								? formatToCurrencyTHB(
									detailProduct?.sellPrice -
									detailProduct?.sellPrice *
									(detailProduct?.percentDiscount / 100),
								)
								: formatToCurrencyTHB(detailProduct?.sellPrice)}{" "}
							{/* {t("kip")} */}
						</p>
					</div>

					<div className="grid grid-cols-5 gap-3 my-4">
						{filteredImages?.map((image, index) => (
							<Dialog key={index}>
								{image ? (
									<DialogTrigger
										onClick={() => setCurrentImageIndex(index)}
										className="relative overflow-hidden flex-center h-[60px] w-[60px] border rounded-md cursor-pointer"
									>
										<Image
											// width={60}
											// height={60}
											fill
											src={process.env.NEXT_PUBLIC_SMALL_RESIZE + image}
											alt={image}
											className="object-cover"
											unoptimized
										/>
									</DialogTrigger>
								) : null}
								<DialogContent>
									<DialogHeader>
										<DialogTitle>{t("additionalImages")}</DialogTitle>
										<DialogDescription>{detailProduct?.name}</DialogDescription>
									</DialogHeader>
									<div className="relative flex-center">
										<button
											type="button"
											onClick={handlePrev}
											className="absolute p-2 bg-white rounded-md left-2"
										>
											<ArrowLeft size={24} className="text-primary" />
										</button>
										<Image
											src={`${process.env.NEXT_PUBLIC_MEDIUM_RESIZE}${detailProduct?.imageDetail[currentImageIndex]}`}
											alt={`Product ${currentImageIndex}`}
											className="border rounded-md cursor-pointer"
											width={300}
											height={300}
											unoptimized
										/>
										<button
											type="button"
											onClick={handleNext}
											className="absolute p-2 bg-white rounded-md right-2"
										>
											<ArrowRight size={24} className="text-primary" />
										</button>
									</div>
								</DialogContent>
							</Dialog>
						))}
					</div>
					<hr />
					<small className="mt-3 font-semibold text-ms">
						{t("productDetail")}:{" "}
					</small>
					<pre className="text-sm text-wrap">{detailProduct?.description}</pre>
				</div>
			</section>

			<div className="h-[10%]">
				<ProductFooter
					productDetail={detailProduct}
					shop={detailProduct?.shop}
					handleAddToCart={handleAddToCart}
					decrement={decrement}
					increment={increment}
					count={count}
					qtyProduct={detailProduct?.qty}
					price={detailProduct?.sellPrice}
					productOptions={productOptions}
					selectOption={selectOption}
					setSelectOption={setSelectOption}
				/>
			</div>
		</div>
	);
}
