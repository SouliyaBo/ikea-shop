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
	Receipt
} from "lucide-react";

import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, create, update } from "@/helpers";
import { IMG_PREFIX_S3 } from "@/constants/api";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { useToast } from "@/components/ui/use-toast";

export default function PendingOrders({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;

	const [dataBills, setDataBills] = useState(null);
	const [billIdPayment, setBillIdPayment] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isOrderListDialogOpen, setIsOrderListDialogOpen] = useState(false);
	const [ordersInBill, setOrdersInBill] = useState([]);
	const [paymentPin, setPaymentPin] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		fetchPendingOrders();
	}, [id, TOKEN]);

	const fetchPendingOrders = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				customerId: id,
				status: "REQUEST"
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

	const handlePaymentConfirm = async () => {
		if (!paymentPin || paymentPin.length < 6) {
			toast({
				title: "Error",
				description: "Please enter a valid PIN code",
				variant: "destructive",
			});
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
							fetchPendingOrders();
							toast({
								title: t("successful"),
								description: t("confirmSuccessfulPayment"),
							});
							setIsSubmitting(false);
							setIsDialogOpen(false);
							setIsOrderListDialogOpen(false);
							setPaymentPin("");
						},
						(err) => {
							console.log(err);
							toast({
								title: t("unsuccessful"),
								description: t("insufficientFundsInTheSystem"),
							});
							update(
								`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill/${billIdPayment}`,
								{ status: "REQUEST" },
								TOKEN,
								() => { },
								(data) => {
									setIsSubmitting(false);
									setTimeout(() => {
										setIsDialogOpen(false);
									}, 2000);
								},
								(err) => {
								},
							);
						},
					);
					setLoading(false);
				},
				(err) => {
					toast({
						title: t("unsuccessful"),
						description: t("paymentCodeIsInvalid"),
					});
					setIsSubmitting(false);
				},
			);
		}
		setIsSubmitting(false);
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
							<Clock className="w-4 h-4 text-orange-500" />
							{t("pendingOrders")}
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
							<h3 className="mb-1 text-base font-semibold text-gray-900">{t("noPendingOrders")}</h3>
							<p className="text-sm text-gray-500">{t("ordersWillAppearHere")}</p>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{dataBills.map((bill, index) => (
							<div
								key={bill?._id}
								onClick={() => handleShowOrderInBill(bill?._id)}
								className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md hover:border-blue-200"
							>
								{/* Header - Compact */}
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
											<Receipt className="w-4 h-4 text-white" />
										</div>
										<div>
											<h3 className="text-base font-bold text-gray-900">{t("orderNumber")}: {bill?.billNo}</h3>
											<div className="flex items-center gap-1 text-xs text-gray-500">
												<CalendarDays className="w-3 h-3" />
												<span>{moment(bill?.createdAt).format("DD/MM/YY HH:mm")}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
										<Clock className="w-3 h-3" />
										{t("pendingPayment")}
									</div>
								</div>

								{/* Compact Info Grid */}
								<div className="grid grid-cols-3 gap-2 mb-3">
									<div className="p-2 text-center rounded-lg bg-blue-50">
										<div className="text-xs text-blue-600">{t("costPrice")}</div>
										<div className="text-sm font-bold text-blue-900">
											{formatToCurrencyTHB(bill?.costAmount)}
										</div>
									</div>
									<div className="p-2 text-center rounded-lg bg-green-50">
										<div className="text-xs text-green-600">{t("sellingPriceShort")}</div>
										<div className="text-sm font-bold text-green-900">
											{formatToCurrencyTHB(bill?.billAmount)}
										</div>
									</div>
									<div className="p-2 text-center rounded-lg bg-purple-50">
										<div className="text-xs text-purple-600">{t("profitShort")}</div>
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
									<MapPinned className="w-4 h-4 ml-auto text-gray-500" />
									<span className="text-gray-700">{bill?.address}</span>
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
							<ShoppingCart className="w-6 h-6 text-blue-600" />
							{t("orderDetails")}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						{loading ? (
							<div className="h-[50vh] flex items-center justify-center">
								<Loader />
							</div>
						) : (
							<div className="space-y-4">
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
													<span className="text-gray-600">{t("quantityShort")}:</span>
													<span className="font-semibold text-blue-600">{order?.qty}</span>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-3 mt-2">
												<div className="p-3 rounded-lg bg-blue-50">
													<p className="mb-1 text-xs text-blue-600">{t("costPrice")}</p>
													<p className="font-bold text-blue-900">
														{formatToCurrencyTHB(order?.productId?.buyPrice)}
													</p>
												</div>
												<div className="p-3 rounded-lg bg-green-50">
													<p className="mb-1 text-xs text-green-600">{t("sellingPriceShort")}</p>
													<p className="font-bold text-green-900">
														{formatToCurrencyTHB(order?.productId?.sellPrice)}
													</p>
												</div>
											</div>

											<div className="p-3 mt-2 rounded-lg bg-purple-50">
												<div className="flex items-center justify-between">
													<span className="text-sm text-purple-600">{t("profitPerItem")}</span>
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
									<div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
										<div className="flex items-center justify-between">
											<span className="text-lg font-semibold text-gray-700">{t("totalAmount")}</span>
											<span className="text-2xl font-bold text-blue-700">
												{formatToCurrencyTHB(ordersInBill[0]?.billId?.costAmount)}
											</span>
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
							className="mr-2"
						>
							{t("close")}
						</Button>
						<Button
							className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
							onClick={() => setIsDialogOpen(true)}
						>
							<DollarSign className="w-4 h-4 mr-2" />
							{t("makePayment")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Payment Confirmation Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<DollarSign className="w-5 h-5 text-green-600" />
							{t("confirmPayment")}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="pin" className="text-sm font-medium">
								{t("enterYourPaymentPINToConfirm")}
							</label>
							<Input
								id="pin"
								type="password"
								placeholder={t("enterPIN")}
								value={paymentPin}
								onChange={(e) => setPaymentPin(e.target.value)}
								maxLength={6}
								className="font-mono text-lg tracking-widest text-center"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDialogOpen(false);
								setPaymentPin("");
							}}
							disabled={isSubmitting}
						>
							{t("cancel")}
						</Button>
						<Button
							className="text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
							onClick={handlePaymentConfirm}
							disabled={isSubmitting}
						>
							{isSubmitting ? t("processingAction") : t("confirmText")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
