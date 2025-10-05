"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Third Party
import { useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Icons
import {
	ChevronLeft,
	Store,
	Package,
	Eye,
	Archive,
	Sparkles,
	TrendingUp,
	DollarSign
} from "lucide-react";

import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets } from "@/helpers";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function MyStoreProducts({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const { toast } = useToast();

	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;

	const [productShops, setProductShops] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchMyStoreProducts();
	}, [id, TOKEN]);

	const fetchMyStoreProducts = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-shop-product?user=${id}`,
			{
				limit: 1000
			},
			TOKEN,
			setLoading,
			(data) => {
				setProductShops(data?.data);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
			},
		);
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh bg-gray-50">
			{/* Header */}
			<div className="sticky top-0 z-50 bg-white border-b shadow-sm">
				<div className="relative flex items-center px-4 py-3">
					<Button className="w-8 h-8 p-0 text-gray-700 bg-gray-100 border-0 rounded-full hover:bg-gray-200">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={20} />
						</Link>
					</Button>
					<div className="flex-1 text-center">
						<h1 className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900">
							<Store className="w-4 h-4 text-purple-500" />
							สินค้าในร้านของฉัน
						</h1>
					</div>
					<div className="w-8 h-8"></div> {/* Spacer for balance */}
				</div>
			</div>

			{/* Content */}
			<div className="p-3 pb-20">
				{loading ? (
					<div className="h-[50vh] flex items-center justify-center">
						<Loader />
					</div>
				) : !productShops?.data || productShops?.data?.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
						<EmptyCartPlaceholder />
						<div className="text-center">
							<h3 className="mb-1 text-base font-semibold text-gray-900">ร้านของคุณยังไม่มีสินค้า</h3>
							<p className="text-sm text-gray-500">ไปเลือกสินค้าเข้าร้านกันเถอะ</p>
							<Link href={`/select-product-to-store/${id}`}>
								<Button className="mt-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
									<Package className="w-4 h-4 mr-2" />
									เลือกสินค้าเข้าร้าน
								</Button>
							</Link>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{/* Store Info Banner */}
						<div className="p-4 border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
									<Store className="w-6 h-6 text-white" />
								</div>
								<div className="flex-1">
									<h3 className="font-bold text-purple-900">ร้านของคุณ</h3>
									<p className="text-sm text-purple-700">มีสินค้าทั้งหมด {productShops?.data?.length} รายการ</p>
								</div>
								<div className="text-right">
									<div className="text-xs text-purple-600">กำไรรวม</div>
									<div className="text-lg font-bold text-purple-900">
										{formatToCurrencyTHB(
											productShops?.data?.reduce((total, item) =>
												total + (item?.product?.sellPrice - item?.product?.buyPrice), 0
											) || 0
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Add More Products Button */}
						<div className="flex justify-center mb-4">
							<Link href={`/select-product-to-store/${id}`}>
								<Button
									variant="outline"
									className="text-purple-700 border-purple-300 hover:bg-purple-50"
								>
									<Package className="w-4 h-4 mr-2" />
									เพิ่มสินค้าเข้าร้าน
								</Button>
							</Link>
						</div>

						{/* Products List */}
						{productShops?.data?.map((item, index) => (
							<div
								key={item?._id}
								className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-purple-200"
							>
								<div className="flex gap-4">
									{/* Product Image */}
									<div className="relative w-24 h-24 overflow-hidden rounded-lg shadow-sm bg-gray-50">
										<Image
											src={
												item?.product?.image && item?.product?.image !== ""
													? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + item?.product?.image
													: "/images/SD-default-image.png"
											}
											alt={item?.product?.name}
											fill
											sizes="96px"
											className="object-contain p-2"
											unoptimized
										/>
										{/* Store Badge */}
										<div className="absolute top-1 right-1">
											<div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
												<Store className="w-3 h-3 text-white" />
											</div>
										</div>
									</div>

									{/* Product Info */}
									<div className="flex flex-col flex-1 gap-2">
										<div className="flex items-start justify-between">
											<h3 className="flex-1 mr-2 text-lg font-bold text-gray-900 line-clamp-2">
												{item?.product?.name}
											</h3>
											<div className="text-right">
												<div className="text-xs text-gray-500">ลำดับที่</div>
												<div className="text-sm font-bold text-gray-700">#{index + 1}</div>
											</div>
										</div>

										{/* Price Grid */}
										<div className="grid grid-cols-3 gap-2">
											<div className="p-2 text-center rounded-lg bg-blue-50">
												<div className="text-xs text-blue-600">ราคาทุน</div>
												<div className="text-sm font-bold text-blue-900">
													{formatToCurrencyTHB(item?.product?.buyPrice)}
												</div>
											</div>
											<div className="p-2 text-center rounded-lg bg-green-50">
												<div className="text-xs text-green-600">ราคาขาย</div>
												<div className="text-sm font-bold text-green-900">
													{formatToCurrencyTHB(item?.product?.sellPrice)}
												</div>
											</div>
											<div className="p-2 text-center rounded-lg bg-purple-50">
												<div className="text-xs text-purple-600">กำไร</div>
												<div className="text-sm font-bold text-purple-900">
													{formatToCurrencyTHB(item?.product?.sellPrice - item?.product?.buyPrice)}
												</div>
											</div>
										</div>

										{/* Profit Percentage */}
										<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
											<TrendingUp className="w-4 h-4 text-purple-500" />
											<span className="text-sm text-purple-700">
												กำไร {(((item?.product?.sellPrice - item?.product?.buyPrice) / item?.product?.buyPrice) * 100).toFixed(1)}%
											</span>
										</div>

										{/* Action Button */}
										<div className="mt-2">
											<Link
												href={`/product-store/${item?.product?._id}`}
												className="w-full"
											>
												<Button
													variant="outline"
													className="w-full h-8 text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
												>
													<Eye className="w-3 h-3 mr-1" />
													ดูรายละเอียดสินค้า
												</Button>
											</Link>
										</div>

										{/* In Store Status */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1 px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded-full w-fit">
												<Archive className="w-3 h-3" />
												อยู่ในร้านแล้ว
											</div>
											<div className="text-xs text-gray-500">
												เพิ่มเมื่อ: {new Date(item?.createdAt).toLocaleDateString('th-TH')}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}

						{/* Summary Card */}
						{productShops?.data && productShops?.data?.length > 0 && (
							<div className="p-6 mt-6 border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
								<h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-purple-900">
									<Sparkles className="w-5 h-5" />
									สรุปร้านของคุณ
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="p-3 bg-white rounded-lg">
										<div className="text-sm text-gray-600">จำนวนสินค้า</div>
										<div className="text-xl font-bold text-gray-900">{productShops?.data?.length} รายการ</div>
									</div>
									<div className="p-3 bg-white rounded-lg">
										<div className="text-sm text-gray-600">กำไรรวมทั้งหมด</div>
										<div className="text-xl font-bold text-purple-700">
											{formatToCurrencyTHB(
												productShops?.data?.reduce((total, item) =>
													total + (item?.product?.sellPrice - item?.product?.buyPrice), 0
												) || 0
											)}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 mt-4 text-sm text-purple-700">
									<DollarSign className="w-4 h-4" />
									<span>กำไรเฉลี่ยต่อสินค้า: {formatToCurrencyTHB(
										productShops?.data?.length > 0
											? (productShops?.data?.reduce((total, item) =>
												total + (item?.product?.sellPrice - item?.product?.buyPrice), 0
											) / productShops?.data?.length)
											: 0
									)}</span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
