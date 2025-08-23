/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// UI
import SideModal from "../SideModal";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import numberFormat from "@/helpers/numberFormat";
import { Button } from "@/components/ui/button";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function ProductFooter({
	price,
	handleAddToCart,
	decrement,
	increment,
	count,
	qtyProduct,
	shop,
	productOptions,
	selectOption,
	setSelectOption,
	productDetail,
}) {
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;

	useEffect(() => {
		if (productOptions?.length > 0) {
			const updatedOptions = [...selectOption]; // Copy current options
			for (const option of productOptions) {
				const index = updatedOptions.findIndex(
					(opt) => opt.title === option.title,
				);
				if (index !== -1) {
					// If title exists, update the value
					updatedOptions[index].value = option.values[0];
				} else {
					// If title does not exist, add new option
					updatedOptions.push({
						title: option.title,
						value: option.values[0],
					});
				}
			}
			setSelectOption(updatedOptions);
		}
	}, [productOptions, selectOption, setSelectOption]);

	// Function
	const handleOptionClick = (title, value) => {
		setSelectOption((prevOptions) => {
			const updatedOptions = [...prevOptions];
			const index = updatedOptions.findIndex((opt) => opt.title === title);
			if (index !== -1) {
				// If title exists, update the value
				updatedOptions[index].value = value;
			} else {
				// If title does not exist, add new option
				updatedOptions.push({
					title,
					value,
				});
			}
			return updatedOptions;
		});
	};

	// Check if current user is the shop owner
	const isShopOwner = shop?._id === USER_DATA?.data?.shop && 
		shop?._id !== undefined && 
		USER_DATA?.data?.shop !== undefined;

	// Check if product has options
	const hasOptions = shop && productOptions?.length > 0;

	// Calculate the display price with discount
	const displayPrice = productDetail?.percentDiscount > 0
		? productDetail?.sellPrice - (productDetail?.sellPrice * (productDetail?.percentDiscount / 100))
		: productDetail?.sellPrice;

	return (
		<footer className="w-full h-full border shadow-xl rounded-t-2xl flex-center text-primary-foreground">
			<div className="w-full px-4 flex-between">
				<div>
					<small className="text-secondary">{t("total")}</small>
					<p className="font-semibold">
						{formatToCurrencyTHB(displayPrice)}
					</p>
				</div>
				
				{/* Render add to cart button based on conditions */}
				{isShopOwner ? null : (
					hasOptions ? (
						<SideModal
							side={"bottom"}
							component={
								<Button className="gap-3 -mb-4 text-white flex-between">
									<img
										src="/images/cart-plus.svg"
										alt="cart"
										className="w-6 h-6"
									/>
									<p>{t("add")}</p>
								</Button>
							}
						>
							<Card>
								<CardHeader>
									<CardDescription>ตัวเลือกสินค้า</CardDescription>
								</CardHeader>
								<CardContent className="w-full space-y-2">
									{productOptions?.map((option) => (
										<div key={option._id} className="w-full">
											{option?.title}:
											<div className="my-4 space-x-2">
												{option?.values?.map((value, index) => (
													<small
														className={`p-2 rounded-sm shadow ${
															selectOption?.find((item) => item.value === value)
																? "bg-primary text-white"
																: "bg-white text-gray-500"
														}`}
														key={index}
														onClick={() =>
															handleOptionClick(option.title, value)
														}
														onKeyDown={() => {}}
													>
														{value}
													</small>
												))}
											</div>
										</div>
									))}
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<p>
										{productDetail?.name}{" "}
										{selectOption?.map(
											(item, index) =>
												`${item.title}: ${item.value} ${
													index === selectOption.length - 1 ? "" : ", "
												}`,
										)}
										<br />
										<span className="text-primary">จำนวน: {count}</span>
									</p>
									<Button
										className="text-white"
										onClick={() => handleAddToCart()}
									>
										<img
											src="/images/cart-plus.svg"
											alt="cart"
											className="w-6 h-6 mr-4"
										/>
										เพิ่มเข้าตะกร้า
									</Button>
								</CardFooter>
							</Card>
						</SideModal>
					) : (
						<Button
							className="gap-3 -mb-4 text-white flex-between"
							onClick={() => handleAddToCart()}
						>
							<img src="/images/cart-plus.svg" alt="cart" className="w-6 h-6" />
							<p>{t("add")}</p>
						</Button>
					)
				)}
			</div>
		</footer>
	);
}
