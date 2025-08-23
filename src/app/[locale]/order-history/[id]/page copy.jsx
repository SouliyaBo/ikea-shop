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
import { ChevronLeft } from "lucide-react";
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
	const [dataBills, setDataBills] = useState(null);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [paymentPin, setPaymentPin] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState("REQUEST");
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
				// setOrders(data?.data);
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
		setSelectedOrder(order);
		setIsDialogOpen(true);
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
						`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill/${selectedOrder?.billId?._id}`,
						{ status: "USER_PAYMENT_COMPLETED" },
						TOKEN,
						() => { },
						(data) => {
							getOrderBuyFormAdmin(billId, TOKEN)
							toast({
								title: t("successful"),
								description: t("confirmSuccessfulPayment"),
							});
							setIsSubmitting(false)
							setIsDialogOpen(false);
						},
						(err) => {
							console.log(err);
							toast({
								title: t("unsuccessful"),
								description: t("insufficientFundsInTheSystem"),
							});
							update(
								`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill/${selectedOrder?.billId?._id}`,
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
									รายการสั่งซื้อ
								</TabsTrigger>
								<TabsTrigger className="w-full focus:bg-[#084392]" value="inProgress" onClick={() => setStatus("SHIPPING")}>
									กำลังจัดส่ง
								</TabsTrigger>
								<TabsTrigger className="w-full focus:bg-[#084392]" value="deliveryCompleted">
									ส่งสำเร็จ
								</TabsTrigger>
							</TabsList>
							<TabsContent value="orderList">
								<div>
									{loading ? (
										<div className="h-[50vh] flex-center">
											<Loader />
										</div>
									) : orders?.total === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{orders?.data
												?.filter(order => order?.status === 'REQUEST')  // กรองเฉพาะ status REQUEST
												?.map((order) => (
													<div
														key={order?._id}
														className="flex w-full gap-2 pb-2 border-b "
														onClick={() => handleOrderClick(order)}
													>
														<div className="relative w-[120px] h-[120px]">
															<Image
																src={IMG_PREFIX_S3 + order?.productId?.image}
																alt={order?.productName}
																fill
																sizes="100%"
																className="object-contain "
																unoptimized
															/>
														</div>

														<div className="flex flex-col items-end flex-1 ">
															<h1 className="font-bold text-right">
																{order?.productName}
															</h1>
															<p>
																{t("quantity")}: {order?.qty}
															</p>
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
																	{formatToCurrencyTHB(order?.productId?.sellPrice - order?.productId?.buyPrice)}
																</span>
															</p>

															<p>{moment(order?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														</div>
													</div>
												))}
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
									) : orders?.total === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{orders?.data
												?.filter(order => order?.status === 'SHIPPING')  // กรองเฉพาะ status REQUEST
												?.map((order) => (
													<div
														key={order?._id}
														className="flex w-full gap-2 pb-2 border-b "
													>
														<div className="relative w-[120px] h-[120px]">
															<Image
																src={IMG_PREFIX_S3 + order?.productId?.image}
																alt={order?.productName}
																fill
																sizes="100%"
																className="object-contain "
																unoptimized
															/>
														</div>

														<div className="flex flex-col items-end flex-1 ">
															<h1 className="font-bold text-right">
																{order?.productName}
															</h1>
															<p>
																{t("quantity")}: {order?.qty}
															</p>
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
																	{formatToCurrencyTHB(order?.productId?.sellPrice - order?.productId?.buyPrice)}
																</span>
															</p>

															<p>{moment(order?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														</div>
													</div>
												))}
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
									) : orders?.total === 0 ? (
										<div className="flex-col h-full gap-2 flex-center">
											<EmptyCartPlaceholder />

										</div>
									) : (
										<div>
											{orders?.data
												?.filter(order => order?.status === 'FINISHED')?.map((order) => (
													<div
														key={order?._id}
														className="flex w-full gap-2 pb-2 border-b "
													>
														<div className="relative w-[120px] h-[120px]">
															<Image
																src={IMG_PREFIX_S3 + order?.productId?.image}
																alt={order?.productName}
																fill
																sizes="100%"
																className="object-contain "
																unoptimized
															/>
														</div>

														<div className="flex flex-col items-end flex-1 ">
															<h1 className="font-bold text-right">
																{order?.productName}
															</h1>
															<p>
																{t("quantity")}: {order?.qty}
															</p>
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
																	{formatToCurrencyTHB(order?.productId?.sellPrice - order?.productId?.buyPrice)}
																</span>
															</p>

															<p>{moment(order?.createdAt).format("DD/MM/YYYY HH:mm")}</p>
														</div>
													</div>
												))}
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>

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
						<div className="flex items-center gap-4">
							{selectedOrder && (
								<>
									<div className="relative w-[80px] h-[80px]">
										<Image
											src={IMG_PREFIX_S3 + selectedOrder?.productId?.image}
											alt={selectedOrder?.productName}
											fill
											sizes="100%"
											className="object-contain"
											unoptimized
										/>
									</div>
									<div>
										<h3 className="font-semibold">{selectedOrder?.productName}</h3>
										<p>{t("quantity")}: {selectedOrder?.qty}</p>
										<p className="font-bold text-primary">
											{formatToCurrencyTHB(selectedOrder?.productId?.buyPrice * selectedOrder?.qty)}
										</p>
									</div>
								</>
							)}
						</div>
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

const renderOrderStatus = (status) => {
	switch (status) {
		case "SHIPPING":
			return "ກຳລັງຈັດສົ່ງ";
		case "FINISHED":
			return "ຈັດສົ່ງສຳເລັດ";
		case "REQUEST":
			return "ອໍເດີ້";
		case "CANCEL":
			return "ຖືກຍົກເລີກ";
		default:
			return status;
	}
};
