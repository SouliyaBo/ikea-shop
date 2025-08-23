"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import Image from "next/image";

// Third Party
import { useTranslations } from "next-intl";
import { groupBy } from "lodash";

// Icons
import { ChevronLeft, Trash2 } from "lucide-react";

// UI
import { Button } from "@/components/ui/button";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import CartFooter from "@/components/Cart/CartFooter";
import Skeleton from "@/components/Skeleton";

// Helpers
import { DATA_CART } from "@/constants";
import numberFormat from "@/helpers/numberFormat";
import currencyDisplay, {
	formatToCurrencyTHB,
} from "@/helpers/currencyDisplay";
import { gets, create, remove } from "@/helpers/index";

export default function Cart() {
	const router = useRouter();
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const USER_DETAIL = USER_DATA?.data;
	const TOKEN = USER_DATA?.accessToken;
	const [dataCarts, setDataCarts] = useState([]);
	const [summaryPrice, setSummaryPrice] = useState(0);
	const [percentDiscount, setPercentDiscount] = useState(0);
	const [loading, setLoading] = useState(false);

	const [groupShopProducts, setGroupShopProducts] = useState([]);

	useEffect(() => {
		getCarts();
		checkFirstBill();
	}, []);

	useEffect(() => {
		const productGroupByShop = groupBy(dataCarts, "shop");

		const groupShopProducts = [];

		for (const [key, value] of Object.entries(productGroupByShop)) {
			groupShopProducts.push(value);
		}
		setGroupShopProducts(groupShopProducts);
	}, [dataCarts]);

	useEffect(() => {
	}, [groupShopProducts]);

	const getCarts = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/cart`,
			{
				createdBy: USER_DETAIL?._id,
			},
			TOKEN,
			setLoading,
			(data) => {
				setDataCarts(data?.data?.data);
				let _total = 0;
				for (let i = 0; i < data?.data?.data.length; i++) {
					const item = data?.data?.data[i];
					const discountPrice =
						item?.productId?.sellPrice *
						(1 - item?.productId?.percentDiscount / 100);
					_total += discountPrice * item?.qty;
				}
				setSummaryPrice(_total);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const handleClick = () => {
		localStorage.setItem(
			DATA_CART,
			JSON.stringify({
				data: dataCarts,
				total: summaryPrice,
				discount: summaryPrice * Number.parseFloat(percentDiscount),
			}),
		);
		router.push("/confirm-order");

	};

	const increment = (index, itemIndex) => {
		const _dataCarts = [...dataCarts];
		if (_dataCarts[itemIndex]?.qty < _dataCarts[itemIndex]?.productId?.qty) {
			_dataCarts[itemIndex].qty++;
			const discountPrice =
				_dataCarts[itemIndex]?.productId?.sellPrice *
				(1 - _dataCarts[itemIndex]?.productId?.percentDiscount / 100);
			const _total = summaryPrice + discountPrice;
			setSummaryPrice(_total);
			setDataCarts(_dataCarts);
		}
	};

	const decrement = (index, itemIndex) => {
		const _dataCarts = [...dataCarts];
		if (_dataCarts[itemIndex]?.qty > 1) {
			_dataCarts[itemIndex].qty--;
			const discountPrice =
				_dataCarts[itemIndex]?.productId?.sellPrice *
				(1 - _dataCarts[itemIndex]?.productId?.percentDiscount / 100);
			const _total = summaryPrice - discountPrice;
			setSummaryPrice(_total);
			setDataCarts(_dataCarts);
		}
	};

	const deleteItem = (index, itemIndex, id) => {
		const updatedCarts = [...dataCarts];
		const removedItem = updatedCarts.splice(itemIndex, 1)[0];
		const discountPrice =
			removedItem?.productId?.sellPrice *
			(1 - removedItem?.productId?.percentDiscount / 100);
		const totalPrice = summaryPrice - (removedItem?.qty || 0) * discountPrice;
		setDataCarts(updatedCarts);
		setSummaryPrice(totalPrice);

		remove(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/cart/${id}`,
			TOKEN,
			() => { },
			(data) => {
				getCarts();
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const checkFirstBill = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				customerId: USER_DETAIL?._id,
			},
			TOKEN,
			() => { },
			(data) => {
				if (data?.data?.data?.length === 0) setPercentDiscount(0.1);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	return loading ? (
		<div className="w-full p-4 space-y-4">
			<Skeleton className={"w-[200px] h-[20px] mx-auto"} />

			<div className="flex flex-col gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div className="w-full gap-2 flex-center" key={i}>
						<Skeleton className={"w-[100px] h-[100px] rounded-lg"} />
						<div className="flex-1 space-y-4">
							<Skeleton className={"w-[200px] h-[10px] "} />
							<Skeleton className={"w-[100px] h-[10px] "} />
						</div>
					</div>
				))}
			</div>
		</div>
	) : (
		<div className="relative w-full h-dvh">
			<section className="h-[85%] overflow-y-auto ">
				<div className="relative py-8 flex-center">
					<Button
						onClick={() => {
							router.push("/");
						}}
						className="absolute left-4 w-[50px] h-[50px] rounded-full bg-transparent border text-black"
					>
						<ChevronLeft size={38} />
					</Button>
					<h1 className="text-2xl font-bold">{t("yourCart")}</h1>
				</div>
				<div>
					{groupShopProducts?.length > 0 ? (
						groupShopProducts?.map((shopProducts, index) => (
							<div key={index} className="my-4 border-b">
								<h2 className="px-4 text-xl font-bold">
									{shopProducts?.[0]?.shop?.name || "Ikea Shop"}
								</h2>
								{shopProducts?.map((item, itemIndex) => (
									<div
										key={item?._id}
										className="w-full gap-4 p-4 flex-between"
									>
										<div className="relative h-[100px] w-[100px]">
											<Image
												src={
													item?.productId?.image !== ""
														? process.env.NEXT_PUBLIC_MEDIUM_RESIZE +
														item?.productId?.image
														: "/images/SD-default-image.png"
												}
												alt="product"
												fill
												sizes="100%"
												unoptimized
												className="object-contain w-full h-full rounded-xl"
											/>
										</div>
										<div className="flex flex-col items-start justify-start flex-1 h-full">
											<h4 className="text-sm text-black">
												{item?.productId?.name}
											</h4>
											<div className="flex items-center gap-2">
												{item?.productId?.percentDiscount > 0 ? (
													<small className="text-gray-500 line-through">
														{formatToCurrencyTHB(item?.productId?.sellPrice)}
													</small>
												) : null}
												<p className="font-semibold text-primary">
													{item?.productId?.percentDiscount > 0
														? formatToCurrencyTHB(
															item?.productId?.sellPrice -
															(item?.productId?.sellPrice *
																item?.productId?.percentDiscount) /
															100,
														)
														: formatToCurrencyTHB(
															item?.productId?.sellPrice,
														)}{" "}
													{/* {t("kip")} */}
												</p>
											</div>
											<small>{item?.note}</small>
											<div className="flex gap-2 mt-6">
												<div
													className="flex items-center justify-center w-8 h-8 text-white rounded-full cursor-pointer bg-primary"
													onClick={() => decrement(index, itemIndex)}
													onKeyDown={() => ""}
												>
													-
												</div>
												<div className="flex items-center justify-center w-20 text-gray-500 border border-gray-400 rounded-xl">
													{item?.qty ?? 0}
												</div>
												<div
													className="flex items-center justify-center w-8 h-8 text-white rounded-full cursor-pointer bg-primary"
													onClick={() => increment(index, itemIndex)}
													onKeyDown={() => ""}
												>
													+
												</div>
												<div
													className="flex items-center justify-center w-8 h-8 ml-8 rounded-full cursor-pointer text-primary"
													onClick={() =>
														deleteItem(index, itemIndex, item?._id)
													}
													onKeyDown={() => ""}
												>
													<Trash2 size={24} />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						))
					) : (
						<div className="flex-col gap-2 flex-center">
							<EmptyCartPlaceholder />
							<h2 className="text-xl font-bold ">{t("emptyCart")}</h2>
						</div>
					)}
				</div>
			</section>
			<div className="h-[15%] bg-white z-10">
				<CartFooter
					handleClick={handleClick}
					summaryPrice={summaryPrice}
					percentDiscount={percentDiscount}
				/>
			</div>
		</div>
	);
}
