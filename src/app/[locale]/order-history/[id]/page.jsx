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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Icons
import { ChevronLeft, MapPinned } from "lucide-react";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import OrderFooter from "@/components/Order/OrderFooter";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, create, update } from "@/helpers";
import { EXPORT_PRODUCT, IMG_PREFIX_S3 } from "@/constants/api";
import numberFormat from "@/helpers/numberFormat";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { useToast } from "@/components/ui/use-toast";

export default function OrderHistory({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const USER_DATA =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("USER_DATA"))
			: null;
	const TOKEN = USER_DATA?.accessToken;

	const [orders, setOrders] = useState(null);
	const [billId, setBillId] = useState("");
	const [billIdPayment, setBillIdPayment] = useState("");
	const [checkButtonStatus, setCheckButtonStatus] = useState("");
	const [dataBills, setDataBills] = useState(null);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [paymentPin, setPaymentPin] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState("REQUEST");
	// Add these new state variables
	const [isOrderListDialogOpen, setIsOrderListDialogOpen] = useState(false);
	const [ordersInBill, setOrdersInBill] = useState([]);
	const { toast } = useToast();

	// Event Trigger
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		gets(
			// EXPORT_PRODUCT,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				// customerId: fakeId,
				customerId: id,
				status: status
			},
			TOKEN,
			setLoading,
			(data) => {
				setDataBills(data?.data?.data);
				setBillId(data?.data?.data[0]._id);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
			},
		);
	}, [id, TOKEN, status]);



	useEffect(() => {
		if (billId !== "") {
			getOrderBuyFormAdmin(billId, TOKEN)
		}
	}, [billId, TOKEN]);

	const getOrderBuyFormAdmin = (billId, TOKEN) => {
		gets(
			// EXPORT_PRODUCT,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/export-product`,
			{
				// customerId: fakeId,
				billId: billId,
			},
			TOKEN,
			setLoading,
			(data) => {
				setOrders(data?.data);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
			},
		);
	}

	const handleOrderClick = (order) => {
		gets(
			// EXPORT_PRODUCT,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				// customerId: fakeId,
				customerId: id,
				status: status
			},
			TOKEN,
			setLoading,
			(data) => {
				setDataBills(data?.data?.data);
				setBillId(data?.data?.data[0]._id);
				setLoading(false);
			},
			(err) => {
				console.log(err);
				setLoading(false);
			},
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
				// EXPORT_PRODUCT,
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
							handleOrderClick()
							getOrderBuyFormAdmin(billId, TOKEN)
							toast({
								title: t("successful"),
								description: t("confirmSuccessfulPayment"),
							});
							setIsSubmitting(false)
							setIsDialogOpen(false);
							setIsOrderListDialogOpen(false)
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
									getOrderBuyFormAdmin(billId, TOKEN)
									setIsSubmitting(false)
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
					setIsSubmitting(false)
				},
			);
		}
		setIsSubmitting(false);
	};
	const handleTabChange = (value) => {
		// Map tab values to status values
		const statusMap = {
			orderList: "REQUEST",
			inProgress: "SHIPPING",
			deliveryCompleted: "FINISHED"
		};

		setStatus(statusMap[value]);
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
				toast({
					title: "Error",
					description: "Failed to fetch order details",
					variant: "destructive",
				});
			}
		);
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh">
			<section className="w-full h-[100%] overflow-y-auto">
				<div className="relative py-4 flex-center">
					<Button className="absolute left-4 w-[50px] h-[50px] rounded-full bg-transparent border text-black">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={38} />
						</Link>
					</Button>
					<h1 className="text-2xl font-bold">{t("buyList")}</h1>
				</div>

				<div>
					<div className="flex-col w-full gap-8 flex-center">
						<Tabs
							value={Object.entries({
								orderList: "REQUEST",
								inProgress: "SHIPPING",
								deliveryCompleted: "FINISHED"
							}).find(([_, v]) => v === status)?.[0] || "orderList"}
							onValueChange={handleTabChange}
							defaultValue="orderList" className="relative w-full px-4">
							<TabsList className="sticky top-0 z-10 w-full">
								<TabsTrigger className="w-full focus:bg-[#084392]" value="orderList" onClick={() => setStatus("REQUEST")}>
									{t("orderList")}
								</TabsTrigger>
								<TabsTrigger className="w-full focus:bg-[#084392]" value="inProgress" onClick={() => setStatus("SHIPPING")}>
									{t("inProgress")}
								</TabsTrigger>
								<TabsTrigger className="w-full focus:bg-[#084392]" value="deliveryCompleted">
									{t("deliveredCompleted")}
								</TabsTrigger>
							</TabsList>
							<TabsContent value="orderList">
								<div>
									{loading ? (
										<div className="h-[50vh] flex-center">
											<Loader />
										</div>
									) : dataBills?.filter(bill => bill?.status === 'REQUEST').length === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{dataBills?.filter(bill => bill?.status === 'REQUEST')?.map((bill) =>
												<div
													key={bill?._id}
													onClick={() => handleShowOrderInBill(bill?._id)}
													className="flex w-full gap-2 pb-2 border-b cursor-pointer"
												>
													<div className="flex flex-col items-end flex-1 ">
														<div className="w-full flex flex-row justify-between">
															<h1 className="font-bold">
																เลขที่บิล:
															</h1>
															<h1 className="font-bold">
																{bill?.billNo}
															</h1>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("wholesalePrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.costAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("sellPrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("profit")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount - bill?.costAmount)}
															</p>
														</div>
														<p className="text-[12px]">{moment(bill?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														<div className="w-full flex flex-row gap-2 border-t">
															<div className="flex flex-col justify-center"><MapPinned /></div>
															<div className="text-[12px]">
																<p>{bill?.name}{" "}{bill?.phoneNumber}</p>
																<p className="text-gray-500">{bill?.address}</p>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									)}
								</div>

							</TabsContent>
							<TabsContent value="inProgress">
								<div>
									{loading ? (
										<div className="h-[50vh] flex-center">
											<Loader />
										</div>
									) : dataBills?.filter(bill => bill?.status === 'SHIPPING').length === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{dataBills?.filter(bill => bill?.status === 'SHIPPING')?.map((bill) =>
												<div
													key={bill?._id}
													onClick={() => handleShowOrderInBill(bill?._id, bill?.status)}
													className="flex w-full gap-2 pb-2 border-b cursor-pointer"
												>
													<div className="flex flex-col items-end flex-1 ">
														<div className="w-full flex flex-row justify-between">
															<h1 className="font-bold">
																เลขที่บิล:
															</h1>
															<h1 className="font-bold">
																{bill?.billNo}
															</h1>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("wholesalePrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.costAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("sellPrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("profit")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount - bill?.costAmount)}
															</p>
														</div>
														<p className="text-[12px]">{moment(bill?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														<div className="w-full flex flex-row gap-2 border-t">
															<div className="flex flex-col justify-center"><MapPinned /></div>
															<div className="text-[12px]">
																<p>{bill?.name}{" "}{bill?.phoneNumber}</p>
																<p className="text-gray-500">{bill?.address}</p>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</TabsContent>
							<TabsContent value="deliveryCompleted">
								<div>
									{loading ? (
										<div className="h-[50vh] flex-center">
											<Loader />
										</div>
									) : dataBills?.filter(bill => bill?.status === 'FINISHED').length === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{dataBills?.filter(bill => bill?.status === 'FINISHED')?.map((bill) =>
												<div
													key={bill?._id}
													onClick={() => handleShowOrderInBill(bill?._id, bill?.status)}
													className="flex w-full gap-2 pb-2 border-b cursor-pointer"
												>
													<div className="flex flex-col items-end flex-1 ">
														<div className="w-full flex flex-row justify-between">
															<h1 className="font-bold">
																เลขที่บิล:
															</h1>
															<h1 className="font-bold">
																{bill?.billNo}
															</h1>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("wholesalePrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.costAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("sellPrice")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount)}
															</p>
														</div>
														<div className="w-full flex flex-row justify-between">
															<p>{t("profit")}:{" "}</p>
															<p className="font-semibold text-primary">
																{formatToCurrencyTHB(bill?.billAmount - bill?.costAmount)}
															</p>
														</div>
														<p className="text-[12px]">{moment(bill?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														<div className="w-full flex flex-row gap-2 border-t">
															<div className="flex flex-col justify-center"><MapPinned /></div>
															<div className="text-[12px]">
																<p>{bill?.name}{" "}{bill?.phoneNumber}</p>
																<p className="text-gray-500">{bill?.address}</p>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>
						{/* Order List Dialog */}
						<Dialog open={isOrderListDialogOpen} onOpenChange={setIsOrderListDialogOpen}>
							<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{t("orderList")}</DialogTitle>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									{loading ? (
										<div className="h-[50vh] flex-center">
											<Loader />
										</div>
									) : (
										<div className="space-y-4">
											{ordersInBill?.map((order) => (
												<div
													key={order?._id}
													className="flex w-full gap-4 pb-4 border-b"
												>
													<div className="relative w-[100px] h-[100px]">
														<Image
															src={IMG_PREFIX_S3 + order?.productId?.image}
															alt={order?.productName}
															fill
															sizes="100%"
															className="object-contain"
															unoptimized
														/>
													</div>
													<div className="flex flex-col flex-1">
														<h3 className="font-bold">{order?.productName}</h3>
														<p>{t("quantity")}: {order?.qty}</p>
														<p>
															{t("wholesalePrice")}:{" "}
															<span className="font-semibold text-primary">
																{formatToCurrencyTHB(order?.productId?.buyPrice)}
															</span>
														</p>
														<p>
															{t("sellPrice")}:{" "}
															<span className="font-semibold text-primary">
																{formatToCurrencyTHB(order?.productId?.sellPrice)}
															</span>
														</p>
														<p>
															{t("profit")}:{" "}
															<span className="font-semibold text-primary">
																{formatToCurrencyTHB(
																	order?.productId?.sellPrice - order?.productId?.buyPrice
																)}
															</span>
														</p>
														<p className="text-sm text-gray-500">
															{moment(order?.createdAt).format("DD/MM/YYYY HH:mm")}
														</p>
													</div>
												</div>
											))}

										</div>
									)}
									{checkButtonStatus === "SHIPPING" || checkButtonStatus === "FINISHED" ? null :
										<div className="text-left">
											<p>รวมยอด: <span>{formatToCurrencyTHB(ordersInBill[0]?.billId?.costAmount)}</span></p>

										</div>
									}
								</div>
								<DialogFooter>
									{checkButtonStatus === "SHIPPING" || checkButtonStatus === "FINISHED" ? null :
										<Button className="text-white" onClick={() => setIsDialogOpen(true)}>
											{t("makePayment")}
										</Button>
									}
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					{/* )} */}
				</div>
			</section>
			{/* <div className="w-full h-[10%]">
				<OrderFooter total={orders?.total} amount={orders?.totalAmount} />
			</div> */}
			{/* Payment Confirmation Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{t("confirmPayment")}</DialogTitle>
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
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={isSubmitting}
						>
							{t("cancel")}
						</Button>
						<Button
							className="text-white"
							onClick={handlePaymentConfirm}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Processing..." : t("confirmText")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

		</div>
	);
}





