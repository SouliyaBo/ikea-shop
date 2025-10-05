"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Third Party
import moment from "moment";
import { useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Icons
import {
	ChevronLeft,
	MapPinned,
	Clock,
	Package,
	DollarSign,
	User,
	Phone,
	CalendarDays,
	ShoppingCart,
	Receipt,
	CheckCircle,
	Star,
	Award
} from "lucide-react";

import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, create, update } from "@/helpers";
import { IMG_PREFIX_S3 } from "@/constants/api";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { useToast } from "@/components/ui/use-toast";

export default function CompletedOrders({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;

	const [dataBills, setDataBills] = useState(null);
	const [billIdPayment, setBillIdPayment] = useState("");
	const [isOrderListDialogOpen, setIsOrderListDialogOpen] = useState(false);
	const [ordersInBill, setOrdersInBill] = useState([]);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		fetchCompletedOrders();
	}, [id, TOKEN]);

	const fetchCompletedOrders = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				customerId: id,
				status: "FINISHED"
			},
			TOKEN,
			setLoading,
			(data) => {
				setDataBills(data?.data?.data);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
			},
		);
	};

	const handleShowOrderInBill = (billId) => {
		setLoading(true);
		setBillIdPayment(billId);
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/export-product`,
			{
				billId: billId,
			},
			TOKEN,
			setLoading,
			(data) => {
				setOrdersInBill(data?.data?.data);
				setIsOrderListDialogOpen(true);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
				toast({
					title: "Error",
					description: "Failed to fetch order details",
					variant: "destructive",
				});
			}
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
							<CheckCircle className="w-4 h-4 text-green-500" />
							คำสั่งซื้อที่เสร็จสิ้น
						</h1>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-3 pb-20">
				{loading ? (
					<div className="h-[50vh] flex items-center justify-center">
						<Loader />
					</div>
				) : !dataBills || dataBills.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
						<EmptyCartPlaceholder />
						<div className="text-center">
							<h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีคำสั่งซื้อที่เสร็จสิ้น</h3>
							<p className="text-sm text-gray-500">คำสั่งซื้อที่เสร็จสิ้นแล้วจะแสดงที่นี่</p>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{dataBills.map((bill, index) => (
							<div
								key={bill?._id}
								onClick={() => handleShowOrderInBill(bill?._id)}
								className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md hover:border-green-200"
							>
								{/* Header - Compact */}
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600">
											<CheckCircle className="w-4 h-4 text-white" />
										</div>
										<div>
											<h3 className="text-base font-bold text-gray-900">เลขที่: {bill?.billNo}</h3>
											<div className="flex items-center gap-1 text-xs text-gray-500">
												<CalendarDays className="w-3 h-3" />
												<span>{moment(bill?.createdAt).format("DD/MM/YY HH:mm")}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
										<CheckCircle className="w-3 h-3" />
										เสร็จสิ้น
									</div>
								</div>

								{/* Compact Info Grid */}
								<div className="grid grid-cols-3 gap-2 mb-3">
									<div className="p-2 text-center rounded-lg bg-blue-50">
										<div className="text-xs text-blue-600">ราคาทุน</div>
										<div className="text-sm font-bold text-blue-900">
											{formatToCurrencyTHB(bill?.costAmount)}
										</div>
									</div>
									<div className="p-2 text-center rounded-lg bg-green-50">
										<div className="text-xs text-green-600">ราคาขาย</div>
										<div className="text-sm font-bold text-green-900">
											{formatToCurrencyTHB(bill?.billAmount)}
										</div>
									</div>
									<div className="p-2 text-center rounded-lg bg-purple-50">
										<div className="text-xs text-purple-600">กำไร</div>
										<div className="text-sm font-bold text-purple-900">
											{formatToCurrencyTHB(bill?.billAmount - bill?.costAmount)}
										</div>
									</div>
								</div>

								{/* Customer Info - Compact */}
								<div className="flex items-center gap-2 p-2 text-sm rounded-lg bg-gray-50">
									<User className="w-4 h-4 text-gray-500" />
									<span className="font-medium text-gray-900">{bill?.name}</span>
									<Phone className="w-4 h-4 ml-auto text-gray-500" />
									<span className="text-gray-700">{bill?.phoneNumber}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Order List Dialog */}
			<Dialog open={isOrderListDialogOpen} onOpenChange={setIsOrderListDialogOpen}>
				<DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl">
							<CheckCircle className="w-6 h-6 text-green-600" />
							รายละเอียดคำสั่งซื้อ (เสร็จสิ้น)
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : (
							<div className="space-y-4">
								{/* Completed Status Banner */}
								<div className="p-4 border border-green-200 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
									<div className="flex items-center gap-3">
										<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600">
											<CheckCircle className="w-6 h-6 text-white" />
										</div>
										<div>
											<h3 className="font-bold text-green-900">คำสั่งซื้อเสร็จสิ้นแล้ว</h3>
											<p className="text-sm text-green-700">
												ขอบคุณสำหรับการสั่งซื้อ คำสั่งซื้อนี้ได้เสร็จสิ้นเรียบร้อยแล้ว
											</p>
										</div>
									</div>
								</div>

								{ordersInBill?.map((order) => (
									<div
										key={order?._id}
										className="flex gap-4 p-4 transition-colors duration-200 border border-gray-100 bg-gray-50 rounded-xl hover:bg-gray-100"
									>
										<div className="relative w-24 h-24 overflow-hidden bg-white rounded-lg shadow-sm">
											<Image
												src={IMG_PREFIX_S3 + order?.productId?.image}
												alt={order?.productName}
												fill
												sizes="96px"
												className="object-contain p-2"
												unoptimized
											/>
										</div>
										<div className="flex flex-col flex-1 gap-2">
											<h3 className="text-lg font-bold text-gray-900">{order?.productName}</h3>

											<div className="flex items-center gap-4 text-sm">
												<div className="flex items-center gap-1">
													<Package className="w-4 h-4 text-blue-500" />
													<span className="text-gray-600">จำนวน:</span>
													<span className="font-semibold text-blue-600">{order?.qty}</span>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-3 mt-2">
												<div className="p-3 rounded-lg bg-blue-50">
													<p className="mb-1 text-xs text-blue-600">ราคาทุน</p>
													<p className="font-bold text-blue-900">
														{formatToCurrencyTHB(order?.productId?.buyPrice)}
													</p>
												</div>
												<div className="p-3 rounded-lg bg-green-50">
													<p className="mb-1 text-xs text-green-600">ราคาขาย</p>
													<p className="font-bold text-green-900">
														{formatToCurrencyTHB(order?.productId?.sellPrice)}
													</p>
												</div>
											</div>

											<div className="p-3 mt-2 rounded-lg bg-purple-50">
												<div className="flex items-center justify-between">
													<span className="text-sm text-purple-600">กำไรต่อชิ้น</span>
													<span className="font-bold text-purple-900">
														{formatToCurrencyTHB(
															order?.productId?.sellPrice - order?.productId?.buyPrice
														)}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
												<CalendarDays className="w-3 h-3" />
												<span>{moment(order?.createdAt).format("DD/MM/YYYY HH:mm")}</span>
											</div>
										</div>
									</div>
								))}

								{ordersInBill.length > 0 && (
									<div className="p-6 border border-green-100 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
										<div className="flex items-center justify-between mb-4">
											<span className="text-lg font-semibold text-gray-700">รวมยอดทั้งหมด</span>
											<span className="text-2xl font-bold text-green-700">
												{formatToCurrencyTHB(ordersInBill[0]?.billId?.billAmount)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-green-600">
											<Star className="w-4 h-4" />
											<span>ขอบคุณสำหรับการสั่งซื้อ หวังว่าจะได้รับใช้อีกครั้ง</span>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsOrderListDialogOpen(false)}
						>
							ปิด
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
