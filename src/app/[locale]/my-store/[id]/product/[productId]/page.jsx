/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/navigation";
import Link from "next/link";
import Image from "next/image";

// Icons
import {
	ChevronLeft,
	ShoppingCart,
	ArrowLeft,
	ArrowRight,
	Ban,
} from "lucide-react";

// UI

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import SweetAlert from "@/components/SweetAlert";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/AlertModal";
import { useToast } from "@/components/ui/use-toast";

// Third Party
import { useTranslations } from "next-intl";

// Helpers
import { get, gets, remove } from "@/helpers/index";
import numberFormat from "@/helpers/numberFormat";

export default function StoreProductDetail({ params }) {
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("");

	const id = pathname.split("/")[2];
	const { toast } = useToast();
	const [detailProduct, setDetailProduct] = useState({});
	const [productOptions, setProductOptions] = useState([]);

	const [banner, setBanner] = useState();
	const [loading, setLoading] = useState(false);

	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [filteredImages, setFilteredImages] = useState([]);

	const { productId } = params;
	useEffect(() => {
		_getProduct(productId);
		_getProductOption(productId);
	}, [productId]);

	useEffect(() => {
		// Filter images on component mount or when detailProduct changes
		const validImages =
			detailProduct?.imageDetail?.filter((image) => image && image !== "") ||
			[];
		setFilteredImages(validImages);
	}, [detailProduct]);

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

	const handleDelete = async () => {
		remove(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/${detailProduct?._id}`,
			TOKEN,
			() => { },
			(data) => {
				console.log(data);
				toast({
					title: t("productDeletedSuccessfully"),
					description: t("successful"),
					// action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
				});
				router.back();
			},
			(err) => {
				console.log(err);
				toast({
					title: t("unsuccessful") + ", " + t("somethingWentWrongPleaseTryAgain"),
					description: t("pleaseTryAgain"),
					variant: "destructive",
				});
			},
		);
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
			<section className="h-[90%] overflow-x-auto ">
				<div className="h-[50%] overflow-hidden ">
					<div className="w-full mx-auto mt-5 ">
						<div className="w-[90%] mx-auto flex items-center mb-4">
							<div
								onClick={() => {
									router.back();
								}}
								onKeyDown={() => { }}
								className="w-[36px] h-[36px] bg-primary rounded-full flex-center"
							>
								<ChevronLeft size={24} className="text-white" />
							</div>
							<h1 className="w-[70%] mx-auto text-xl font-bold text-center translate-x-[-5%]">
								{t("productDetail")}
							</h1>
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
						{detailProduct?.isBan ? (
							<div className="absolute flex-col w-full h-full gap-4 bg-rose-300/20 flex-center">
								<Ban size={48} className="text-rose-500" />
								<p className="max-w-[300px]  p-4 text-center text-black bg-white rounded-md">
									{detailProduct?.note}
								</p>
							</div>
						) : null}
					</div>
				</div>
				<div className="h-[50%] px-4 py-4 space-y-4">
					<div className="flex justify-between text-secondary">
						<small>{detailProduct?.categoryName}</small>
						<div className="flex flex-col">
							<small className="font-semibold text-primary">
								{" "}
								{t("sold")}: {numberFormat(detailProduct?.soldQty)}
							</small>
						</div>
					</div>
					<h1 className="text-lg font-semibold">{detailProduct?.name}</h1>
					<p className="font-semibold text-primary">
						{numberFormat(detailProduct?.sellPrice)}
					</p>

					{productOptions?.length > 0 ? (
						<Card>
							<CardHeader>
								<CardDescription>{t("productOptions")}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{productOptions?.map((option, index) => (
									<div key={option._id}>
										{option?.title}:
										<div className="my-4 space-x-2">
											{option?.values?.map((value, index) => (
												<small className="p-2 rounded-sm shadow" key={index}>
													{value}
												</small>
											))}
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					) : null}

					{filteredImages?.length > 0 ? (
						<Card>
							<CardHeader>
								{/* <CardTitle>ຮູບພາບເພີ່ມເຕີມຂອງສິນຄ້າ</CardTitle> */}
								<CardDescription>{t("additionalProductImages")}</CardDescription>
							</CardHeader>
							<CardContent>
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
													<DialogDescription>
														{detailProduct?.name}
													</DialogDescription>
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
							</CardContent>
						</Card>
					) : null}

					{/* <hr /> */}
					<Card>
						<CardHeader>
							{/* <CardTitle>{t("productDetail")}: </CardTitle> */}
							<CardDescription>{t("productDetail")}:</CardDescription>
						</CardHeader>
						<CardContent>
							<pre className="text-sm text-wrap">
								{detailProduct?.description}
							</pre>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* {display ? <Confirm setDisplay={setDisplay} /> : null}

			 */}
			<div className="h-[10%] rounded-t-md border flex-center gap-4 p-4">
				{/* <Button className="w-full" variant="outline">
					ລຶບ
				</Button> */}
				<AlertModal
					component={
						<Button className="w-full" variant="outline">
							{t("delete")}
						</Button>
					}
					title={t("confirmDeleteProduct")}
					confirmText={t("confirmDelete")}
					confirmFunction={handleDelete}
				/>
				<Button
					className="w-full"
					onClick={() =>
						router.push(`/my-store/${id}/edit-product/${productId}`)
					}
				>
					{t("edit")}
				</Button>
				{/* <ProductFooter
					handleAddToCart={handleAddToCart}
					decrement={decrement}
					increment={increment}
					count={count}
					qtyProduct={detailProduct?.qty}
					price={detailProduct?.sellPrice}
				/> */}
			</div>
		</div>
	);
}
