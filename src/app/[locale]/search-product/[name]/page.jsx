"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

// UI
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Third Party
import { useTranslations } from "next-intl";

// Component
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import Skeleton from "@/components/Skeleton";

// Constant and Helper
import { gets, create } from "@/helpers";
import numberFormat, { formatNumber } from "@/helpers/numberFormat";

export default function SearchProduct({ params }) {
	const [userData, setUserData] = useState();

	const t = useTranslations("");
	const [dataProductLists, setDataProductLists] = useState(null);
	const name = decodeURIComponent(params.name);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		_getSearchProduct(decodeURIComponent(name));

		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;
		if (USER_DATA) setUserData(USER_DATA);
	}, [name]);

	const _getSearchProduct = (data) => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-shop-product`,
			{
				name: data,
			},
			"",
			setLoading,
			(data) => {
				setDataProductLists(data?.data);
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
				title: t("unsuccessful"),
				description: t("pleaseLoginOrRegisterFirst"),
				variant: "destructive",
				action: (
					<Button
						onClick={() => router.push("/profile")}
						variant="outline"
						className="text-black"
					>
						{t("loginOrRegister")}
					</Button>
				),
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
					title: t("addToCartSuccess"),
					description: t("operationSuccessful"),
				});
			},
			(error) => {
				console.log("error::", error?.response?.data?.errorCode);
				toast({
					title: t("unsuccessful"),
					description: t("pleaseTryAgain"),
					variant: "destructive",
				});
			},
		);
	};

	if (loading) {
		return (
			<div className="w-full p-4">
				<Skeleton className={"w-[200px] h-[30px] mx-auto"} />

				<div className="grid items-center grid-cols-2 gap-4 my-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className={"w-full h-[180px] rounded-lg"} />
					))}
				</div>
			</div>
		);
	}
	return (
		<main className="flex flex-col w-full h-dvh">
			<div className="h-[60px]">
				<Header />
			</div>
			<div style={{ height: "calc(100% - 10% - 50px)" }}>
				<section className="flex flex-col w-full h-full gap-4 px-4 py-2 overflow-y-auto">
					<h2 className="my-4 text-xl font-semibold text-center">
						{t("searchResult")}:{" "}
						<span className="font-bold text-primary">{name}</span>
					</h2>
					{dataProductLists?.data?.length > 0 ? (
						<div className="grid items-center grid-cols-2 gap-4">
							{dataProductLists?.data?.map((product) => (
								// <Link
								// 	key={product?._id}
								// 	className="flex-col gap-4 p-2 bg-white rounded-md shadow flex-center"
								// 	// href={`/product/${product?._id}`}
								// 	href={"/#"}
								// >
									<div key={product?._id}>
									<div className="relative h-[180px] overflow-hidden rounded-lg w-full">
										<Image
											unoptimized
											src={
												product?.product?.image && product?.product?.image !== ""
													? process.env.NEXT_PUBLIC_MEDIUM_RESIZE +
													product?.product?.image
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
											{t("sold")}: {formatNumber(product?.product?.soldQty)}
										</p>
										<p className="text-sm truncate">{product?.product?.name}</p>
										<div className="flex justify-between mt-4">
											<p className="font-semibold text-md text-primary">
												{numberFormat(product?.product?.sellPrice)} $
											</p>
											{/* <Image
												onKeyDown={() => { }}
												onClick={(e) => handleAddToCart(product?.product?._id, e)}
												src="/images/cart-plus-primary.min.svg"
												alt="cart"
												// className="w-6 h-6 "
												width={24}
												height={24}
												unoptimized
											/> */}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex-col w-full h-full gap-4 flex-center">
							<Image
								src="/images/empty.png"
								alt="empty"
								width={300}
								height={300}
								quality={100}
								sizes="100%"
								unoptimized
							/>
							<p className="text-center">{t("notFound")}</p>
						</div>
					)}
				</section>
			</div>
			<div className="h-[10%]">
				<Footer />
			</div>
		</main>
	);
}
