"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Icons
import {
	ChevronLeft,
	MapPinned,
	ClipboardList,
	ArchiveRestore,
	CheckCircle,
	XCircle,
	Package,
	DollarSign,
	User,
	Phone,
	CalendarDays,
	Star,
	TrendingUp,
	AlertTriangle
} from "lucide-react";

import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, create, update } from "@/helpers";
import { IMG_PREFIX_S3 } from "@/constants/api";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function OrderTabs({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;

	const [dataBills, setDataBills] = useState(null);
	const [billIdPayment, setBillIdPayment] = useState("");
	const [checkButtonStatus, setCheckButtonStatus] = useState("");
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [paymentPin, setPaymentPin] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState("REQUEST");
	const [isOrderListDialogOpen, setIsOrderListDialogOpen] = useState(false);
	const [ordersInBill, setOrdersInBill] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchAllOrders();
	}, [id, TOKEN]);

	const fetchAllOrders = () => {
		// Fetch all orders regardless of status
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				customerId: id,
				// Don't filter by status to get all orders
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

	const handleTabChange = (value) => {
		setActiveTab(value);
	};

	const handleShowOrderInBill = (billId, status) => {
		setLoading(true);
		setCheckButtonStatus(status);
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
				alert("Failed to fetch order details");
			}
		);
	};

	const handlePaymentConfirm = async () => {
		if (!paymentPin || paymentPin.length < 6) {
			alert("Please enter a valid PIN code");
		} else {
			setIsSubmitting(true);
			await create(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/check-pin`,
				{
					user: id,
					pin: parseInt(paymentPin)
				},
				TOKEN,
				setLoading,
				(data) => {
					update(
						`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill/${billIdPayment}`,
						{ status: "USER_PAYMENT_COMPLETED" },
						TOKEN,
						() => { },
						(data) => {
							fetchAllOrders();
							alert(t("confirmSuccessfulPayment") || "Payment successful");
							setIsSubmitting(false);
							setIsDialogOpen(false);
							setIsOrderListDialogOpen(false);
						},
						(err) => {
							console.log(err);
							alert(t("insufficientFundsInTheSystem") || "Insufficient funds");
							setIsSubmitting(false);
							setTimeout(() => {
								setIsDialogOpen(false);
							}, 2000);
						},
					);
					setLoading(false);
				},
				(err) => {
					alert(t("paymentCodeIsInvalid") || "Invalid payment code");
					setIsSubmitting(false);
				},
			);
		}
		setIsSubmitting(false);
	};

	const getStatusInfo = (status) => {
		switch (status) {
			case "REQUEST":
				return {
					label: "รอชำระ",
					color: "bg-blue-500",
					bgColor: "bg-blue-50",
					textColor: "text-blue-700"
				};
			case "SHIPPING":
				return {
					label: "กำลังจัดส่ง",
					color: "bg-orange-500",
					bgColor: "bg-orange-50",
					textColor: "text-orange-700"
				};
			case "FINISHED":
				return {
					label: "เสร็จสิ้น",
					color: "bg-green-500",
					bgColor: "bg-green-50",
					textColor: "text-green-700"
				};
			case "CANCEL":
				return {
					label: "ยกเลิก",
					color: "bg-red-500",
					bgColor: "bg-red-50",
					textColor: "text-red-700"
				};
			default:
				return {
					label: "ไม่ทราบสถานะ",
					color: "bg-gray-500",
					bgColor: "bg-gray-50",
					textColor: "text-gray-700"
				};
		}
	};

	const getFilteredBills = (status) => {
		return dataBills?.filter(bill => bill?.status === status) || [];
	};

	// Status Icon Component
	const StatusIcon = ({ status, className = "w-4 h-4" }) => {
		const iconProps = { className };

		switch (status) {
			case "REQUEST":
				return <ClipboardList {...iconProps} />;
			case "SHIPPING":
				return <ArchiveRestore {...iconProps} />;
			case "FINISHED":
				return <CheckCircle {...iconProps} />;
			case "CANCEL":
				return <XCircle {...iconProps} />;
			default:
				return <AlertTriangle {...iconProps} />;
		}
	};

	// Status Badge Component
	const StatusBadge = ({ status, label }) => {
		const getStatusStyles = (status) => {
			switch (status) {
				case "REQUEST":
					return "bg-blue-50 text-blue-700";
				case "SHIPPING":
					return "bg-orange-50 text-orange-700";
				case "FINISHED":
					return "bg-green-50 text-green-700";
				case "CANCEL":
					return "bg-red-50 text-red-700";
				default:
					return "bg-gray-50 text-gray-700";
			}
		};

		return (
			<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${getStatusStyles(status)}`}>
				{label}
			</span>
		);
	};

	const renderOrderCard = (bill) => {
		const statusInfo = getStatusInfo(bill?.status);

		// Define hover border colors
		const getHoverBorderClass = (status) => {
			switch (status) {
				case 'REQUEST':
					return 'hover:border-blue-200';
				case 'SHIPPING':
					return 'hover:border-orange-200';
				case 'FINISHED':
					return 'hover:border-green-200';
				case 'CANCEL':
					return 'hover:border-red-200';
				default:
					return 'hover:border-gray-200';
			}
		};

		return (
			<div
				key={bill?._id}
				onClick={() => handleShowOrderInBill(bill?._id, bill?.status)}
				className={`p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md ${getHoverBorderClass(bill?.status)}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<div className={`flex items-center justify-center w-8 h-8 rounded-full ${statusInfo.color}`}>
							<StatusIcon status={bill?.status} className="w-4 h-4 text-white" />
						</div>
						<div>
							<h3 className="text-base font-bold text-gray-900">เลขที่: {bill?.billNo}</h3>
							<div className="flex items-center gap-1 text-xs text-gray-500">
								<CalendarDays className="w-3 h-3" />
								<span>{moment(bill?.createdAt).format("DD/MM/YY HH:mm")}</span>
							</div>
						</div>
					</div>
					<StatusBadge status={bill?.status} label={statusInfo.label} />
				</div>

				{/* Price Grid */}
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

				{/* Customer Info */}
				<div className="flex items-center gap-2 p-2 text-sm rounded-lg bg-gray-50">
					<User className="w-4 h-4 text-gray-500" />
					<span className="font-medium text-gray-900">{bill?.name}</span>
					<Phone className="w-4 h-4 ml-auto text-gray-500" />
					<span className="text-gray-700">{bill?.phoneNumber}</span>
					<MapPinned className="w-4 h-4 ml-auto text-gray-500" />
									<span className="text-gray-700">{bill?.address}</span>
				</div>
			</div>
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
							<Package className="w-4 h-4 text-blue-500" />
							รายการคำสั่งซื้อ
						</h1>
					</div>
					<div className="w-8 h-8"></div> {/* Spacer */}
				</div>
			</div>

			{/* Content */}
			<div className="p-3 pb-20">
				<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
					{/* Tabs List */}
					<TabsList className="grid w-full grid-cols-4 mb-4">
						<TabsTrigger
							value="REQUEST"
							className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white"
						>
							<ClipboardList className="w-3 h-3 mr-1" />
							รอชำระ
						</TabsTrigger>
						<TabsTrigger
							value="SHIPPING"
							className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
						>
							<ArchiveRestore className="w-3 h-3 mr-1" />
							จัดส่ง
						</TabsTrigger>
						<TabsTrigger
							value="FINISHED"
							className="text-xs data-[state=active]:bg-green-500 data-[state=active]:text-white"
						>
							<CheckCircle className="w-3 h-3 mr-1" />
							เสร็จสิ้น
						</TabsTrigger>
						<TabsTrigger
							value="CANCEL"
							className="text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white"
						>
							<XCircle className="w-3 h-3 mr-1" />
							ยกเลิก
						</TabsTrigger>
					</TabsList>

					{/* Tab Contents */}
					<TabsContent value="REQUEST" className="space-y-3">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : getFilteredBills("REQUEST").length === 0 ? (
							<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
								<EmptyCartPlaceholder />
								<div className="text-center">
									<h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีคำสั่งซื้อที่รอชำระ</h3>
									<p className="text-sm text-gray-500">คำสั่งซื้อที่รอชำระเงินจะแสดงที่นี่</p>
								</div>
							</div>
						) : (
							getFilteredBills("REQUEST").map(bill => renderOrderCard(bill))
						)}
					</TabsContent>

					<TabsContent value="SHIPPING" className="space-y-3">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : getFilteredBills("SHIPPING").length === 0 ? (
							<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
								<EmptyCartPlaceholder />
								<div className="text-center">
									<h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีคำสั่งซื้อที่กำลังจัดส่ง</h3>
									<p className="text-sm text-gray-500">คำสั่งซื้อที่กำลังจัดส่งจะแสดงที่นี่</p>
								</div>
							</div>
						) : (
							getFilteredBills("SHIPPING").map(bill => renderOrderCard(bill))
						)}
					</TabsContent>

					<TabsContent value="FINISHED" className="space-y-3">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : getFilteredBills("FINISHED").length === 0 ? (
							<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
								<EmptyCartPlaceholder />
								<div className="text-center">
									<h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีคำสั่งซื้อที่เสร็จสิ้น</h3>
									<p className="text-sm text-gray-500">คำสั่งซื้อที่เสร็จสิ้นแล้วจะแสดงที่นี่</p>
								</div>
							</div>
						) : (
							getFilteredBills("FINISHED").map(bill => renderOrderCard(bill))
						)}
					</TabsContent>

					<TabsContent value="CANCEL" className="space-y-3">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : getFilteredBills("CANCEL").length === 0 ? (
							<div className="flex flex-col items-center justify-center h-[50vh] gap-3">
								<EmptyCartPlaceholder />
								<div className="text-center">
									<h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีคำสั่งซื้อที่ยกเลิก</h3>
									<p className="text-sm text-gray-500">คำสั่งซื้อที่ยกเลิกจะแสดงที่นี่</p>
								</div>
							</div>
						) : (
							getFilteredBills("CANCEL").map(bill => renderOrderCard(bill))
						)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Order Details Dialog */}
			<Dialog open={isOrderListDialogOpen} onOpenChange={setIsOrderListDialogOpen}>
				<DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl">
							<Package className="w-6 h-6 text-blue-600" />
							รายละเอียดคำสั่งซื้อ
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : (
							<div className="space-y-4">
								{/* Status Banner */}
								{checkButtonStatus && (
									<div className={`p-4 border rounded-xl ${getStatusInfo(checkButtonStatus).bgColor} border-opacity-50`}>
										<div className="flex items-center gap-3">
											<div className={`flex items-center justify-center w-12 h-12 rounded-full ${getStatusInfo(checkButtonStatus).color}`}>
												<StatusIcon status={checkButtonStatus} className="w-6 h-6 text-white" />
											</div>
											<div>
												<h3 className={`font-bold ${getStatusInfo(checkButtonStatus).textColor}`}>
													สถานะ: {getStatusInfo(checkButtonStatus).label}
												</h3>
												<p className={`text-sm ${getStatusInfo(checkButtonStatus).textColor}`}>
													{checkButtonStatus === 'REQUEST' && 'รอการชำระเงิน'}
													{checkButtonStatus === 'SHIPPING' && 'สินค้ากำลังจัดส่ง'}
													{checkButtonStatus === 'FINISHED' && 'คำสั่งซื้อเสร็จสิ้นแล้ว'}
													{checkButtonStatus === 'CANCEL' && 'คำสั่งซื้อถูกยกเลิก'}
												</p>
											</div>
										</div>
									</div>
								)}

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
									<div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
										<div className="flex items-center justify-between mb-4">
											<span className="text-lg font-semibold text-gray-700">รวมยอดทั้งหมด</span>
											<span className="text-2xl font-bold text-blue-700">
												{formatToCurrencyTHB(ordersInBill[0]?.billId?.billAmount)}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-blue-600">
											<Star className="w-4 h-4" />
											<span>ขอบคุณสำหรับการสั่งซื้อ</span>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
					<DialogFooter>
						{checkButtonStatus === "REQUEST" && (
							<Button
								className="text-white bg-blue-600 hover:bg-blue-700"
								onClick={() => setIsDialogOpen(true)}
							>
								ชำระเงิน
							</Button>
						)}
						<Button
							variant="outline"
							onClick={() => setIsOrderListDialogOpen(false)}
						>
							ปิด
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Payment Confirmation Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>ยืนยันการชำระเงิน</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="pin" className="text-sm font-medium">
								กรุณาใส่รหัส PIN เพื่อยืนยันการชำระเงิน
							</label>
							<Input
								id="pin"
								type="password"
								placeholder="ใส่รหัส PIN"
								value={paymentPin}
								onChange={(e) => setPaymentPin(e.target.value)}
								maxLength={6}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={isSubmitting}
						>
							ยกเลิก
						</Button>
						<Button
							className="text-white"
							onClick={handlePaymentConfirm}
							disabled={isSubmitting}
						>
							{isSubmitting ? "กำลังดำเนินการ..." : "ยืนยัน"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
