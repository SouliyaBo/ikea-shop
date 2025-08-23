"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";
import moment from "moment";

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Home/Footer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AlertModal from "@/components/AlertModal";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";

// Icons
import { Settings2, Ban, Search } from "lucide-react";

// Helpers
import numberFormat from "@/helpers/numberFormat";
import {
	get,
	gets,
	getAccessTokenFromLCStorage,
	getUserDataFromLCStorage,
	update,
	uploadS3File,
} from "@/helpers";
import { convertShopShippingStatus } from "@/helpers/convertStatus";
import { ReceiptText } from "lucide-react";

export default function MyStoreDetail({ params }) {
	const { id } = params;
	const [accessToken, setAccessToken] = useState("");

	const t = useTranslations("");
	const router = useRouter();
	const { toast } = useToast();

	const [userData, setUserData] = useState(null);
	const [storeDetail, setStoreDetail] = useState(null);
	const [shopProducts, setShopProducts] = useState(null);
	const [shopOrders, setShopOrders] = useState(null);
	const [expresses, setExpresses] = useState(null);
	const [isBanned, setIsBanned] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);

	const [expressBill, setExpressBill] = useState(null);
	const [selectedExpress, setSelectedExpress] = useState(null);

	// Filter
	const [filter, setFilter] = useState({
		name: "",
	});

	// Effect
	useEffect(() => {
		const token = getAccessTokenFromLCStorage();
		const user = getUserDataFromLCStorage();

		if (token) {
			setAccessToken(token);
		}

		if (user) {
			setUserData(user);
		}
	}, []);

	useEffect(() => {
		if (id && accessToken) {
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop/${id}`,
				accessToken,
				() => { },
				(data) => {
					setStoreDetail(data?.data);

					if (data?.data?.status === "BLOCKED") {
						setIsBanned(true);
					} else if (data?.data?.status === "REJECTED") {
						router.replace(`/new-request-store/${id}`);
					} else if (data?.data?.status === "REQUEST") {
						router.replace("/store-register/pending-review");
					}
				},
				(err) => {
					console.log(err);
				},
			);

			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product`,
				{
					// name: data,
					limit: 1000,
					skip: 0,
					shop: id,
				},
				accessToken,
				() => { },
				(data) => {
					setShopProducts(data?.data);
				},
				(err) => {
					console.log(err);
				},
			);

			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
				{
					shop: id,
					status_in: [
						"SHIPPING",
						"FINISHED",
						"RETURN",
						"REQUEST_TO_SHOP",
						"APPROVED_FROM_SHOP",
						"REJECTED_FROM_SHOP",
						"SHOP_SHIPPING_TO_CTLH",
						"CTLH_RECEIVED",
						"RETURN_TO_SHOP",
					],
				},
				accessToken,
				() => { },
				(data) => {
					setShopOrders(data?.data);
				},
				(err) => {
					console.log(err);
				},
			);

			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/express`,
				{
					skip: 0,
					limit: 1000,
				},
				accessToken,
				() => { },
				(data) => {
					setExpresses(data?.data?.data);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [accessToken, id, router.replace]);

	useEffect(() => {
		if (filter.name === "" && accessToken && id) {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product`,
				{
					// name: data,
					limit: 1000,
					skip: 0,
					shop: id,
				},
				accessToken,
				() => { },
				(data) => {
					setShopProducts(data?.data);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [filter.name, accessToken, id]);

	// Functions
	const searchProduct = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product`,
			{
				// name: data,
				limit: 1000,
				skip: 0,
				shop: id,
				...filter,
			},
			accessToken,
			() => { },
			(data) => {
				setShopProducts(data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);
		if (imageUrl) {
			setExpressBill(imageUrl);
		}

		setImageLoading(false);
	};

	const getOrders = () => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill`,
			{
				shop: id,
				status_in: [
					"SHIPPING",
					"FINISHED",
					"RETURN",
					"REQUEST_TO_SHOP",
					"APPROVED_FROM_SHOP",
					"REJECTED_FROM_SHOP",
					"SHOP_SHIPPING_TO_CTLH",
					"CTLH_RECEIVED",
					"RETURN_TO_SHOP",
				],
			},
			accessToken,
			() => { },
			(data) => {
				setShopOrders(data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const handleToggleFunction = (id, value) => {
		update(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/${id}`,
			{ status: value === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
			accessToken,
			() => { },
			(data) => {
				console.log(data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const updateBillStatus = (status, billId) => {
		const prepareData =
			status === "SHOP_SHIPPING_TO_CTLH"
				? {
					status: status,
					photo: expressBill,
					expressCTLH: selectedExpress,
				}
				: {
					status: status,
				};

		update(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/bill/${billId}`,
			prepareData,
			accessToken,
			() => { },
			(data) => {
				console.log(data);
				toast({
					title: "ສຳເລັດ",
					description: "ການດຳເນີນການສຳເລັດ",
				});
				getOrders();
			},
			(err) => {
				console.log(err);
				toast({
					title: "ຫຼົ້ມເຫຼວ",
					description: "ກະລຸນາລອງໃໝ່ອີກຄັ້ງ",
					variant: "destructive",
				});
			},
		);
	};

	return (
		<main className="relative w-full h-dvh">
			{/* <section className="h-[8%] w-full flex-center shadow  font-bold">
				ຮ້ານຂອງຂ້ອຍ
			</section> */}
			<div className="sticky h-[8%] top-0 z-20 w-full p-4 bg-gradient-to-r from-rose-100 to-rose-200">
				<div className="w-full flex-between">
					<h2 className="w-full text-2xl font-extrabold text-left">
						{storeDetail?.name}
					</h2>
					<button
						type="button"
						className="p-2 bg-white rounded-full"
						onClick={() => router.push(`/my-store/${id}/settings`)}
					>
						<Settings2 size={24} className="text-primary" />
					</button>
				</div>
			</div>
			<section className="w-full h-[82%] relative overflow-y-auto  space-y-4">
				{/* MyStoreDetail {id} */}
				<div className="flex flex-col gap-4 h-[20%] space-y-4 py-2 px-4 bg-gradient-to-r from-yellow-100 to-yellow-200 w-full">
					<div className="w-full gap-4 flex-center">
						{storeDetail?.image ? (
							<Image
								src={process.env.NEXT_PUBLIC_S3_BUCKET + storeDetail?.image}
								alt="logo"
								width={100}
								height={100}
								className="w-20 h-20 rounded-full"
							/>
						) : (
							<div className="w-20 h-20 bg-[#ffec00] rounded-full" />
						)}

						<div className="flex-1 space-y-2">
							<h2 className="text-xl font-bold text-primary">
								{`${userData?.data?.firstName} ${userData?.data?.lastName}`}
							</h2>
							<div className="gap-4 w-fit flex-center">
								<p>{storeDetail?.phone}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full h-[80px]  flex-center  mx-auto  absolute top-[12%]">
					<div className="w-[70%] h-full bg-white shadow rounded-xl flex items-center justify-around">
						<div className="flex-col space-y-2 flex-center">
							<p className="text-lg font-bold">{shopProducts?.total}</p>
							<p>ສິນຄ້າ</p>
						</div>
						<div className="flex-col space-y-2 flex-center">
							<p className="text-lg font-bold">{shopOrders?.total}</p>
							<p>ອໍເດີ້ທັງໝົດ</p>
						</div>
					</div>
				</div>

				<Tabs defaultValue="product" className="w-full px-4 translate-y-10 ">
					<TabsList className="w-full bg-yellow-100">
						<TabsTrigger className="w-full focus:bg-primary" value="product">
							ສິນຄ້າທັງໝົດ
						</TabsTrigger>
						<TabsTrigger className="w-full focus:bg-primary" value="order">
							ລາຍການ Order ລ່າສຸດ
						</TabsTrigger>
					</TabsList>
					<TabsContent value="product">
						<div className="input-search-container">
							<Search size={24} className="input-search-icon" />
							<input
								type="text"
								className="input-search"
								onChange={(event) => {
									const newFilter = { ...filter, name: event.target.value };
									setFilter(newFilter);
								}}
								placeholder={t("searchProduct")}
							/>
							<button
								className="btn-search"
								type="submit"
								onClick={() => searchProduct()}
							>
								{t("search")}
							</button>
						</div>
						{shopProducts?.total === 0 ? (
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
								<p className="text-center">
									{/* {t("notFound")} */}
									ບໍ່ມີສິນຄ້າ
								</p>
							</div>
						) : (
							<div className="grid w-full h-full grid-cols-2 gap-4 py-4">
								{shopProducts?.data?.map((product) => (
									<div key={product?._id} className="relative">
										<Link
											className="relative flex-col gap-4 p-2 bg-white rounded-md shadow flex-center"
											// href={`product/${product?._id}`}
											href={`${id}/product/${product?._id}`}
										>
											<div className="relative h-[180px] overflow-hidden rounded-lg w-full">
												<Image
													unoptimized
													src={
														product?.image && product?.image !== ""
															? process.env.NEXT_PUBLIC_MEDIUM_RESIZE +
															product?.image
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
													{t("sold")}: {numberFormat(product?.soldQty)}
												</p>
												<p className="text-sm truncate">
													{product?.name} {product?.isBan ? "(ຖືກແບນ)" : null}
												</p>
												<div className="flex justify-between mt-4">
													<p className="font-semibold text-md text-primary">
														{numberFormat(product?.sellPrice)} {t("kip")}
													</p>
													{/* <Image
												onKeyDown={() => {}}
												// onClick={(e) => handleAddToCart(product?._id, e)}
												src="/images/cart-plus-primary.min.svg"
												alt="cart"
												// className="w-6 h-6 "
												width={24}
												height={24}
												unoptimized
											/> */}
												</div>
											</div>
											{product?.isBan ? (
												<div className="absolute top-0 left-0 flex-col w-full h-full gap-4 rounded-md bg-red-300/50 flex-center">
													<Ban className="text-white" size={48} />
													<p className="p-2 font-bold text-center text-red-500 bg-white rounded-md">
														{product?.note}
													</p>
												</div>
											) : null}
										</Link>
										{!product?.isBan ? (
											<Switch
												checked={product?.status === "ACTIVE"}
												onCheckedChange={() => {
													handleToggleFunction(product?._id, product?.status);
													setShopProducts((prev) => {
														return {
															...prev,
															data: prev?.data?.map((p) => {
																if (p?._id === product?._id) {
																	return {
																		...p,
																		status:
																			p?.status === "ACTIVE"
																				? "INACTIVE"
																				: "ACTIVE",
																	};
																}
																return p;
															}),
														};
													});
												}}
												className="absolute z-20 right-3 bottom-3"
											/>
										) : null}
									</div>
								))}
							</div>
						)}
					</TabsContent>
					<TabsContent value="order">
						<div className="w-full h-full py-4 space-y-4 ">
							{shopOrders?.data?.map((item, index) => (
								<div
									className="w-full gap-2 flex items-start justify-between h-[120px] shadow-md rounded-md p-4"
									key={index}
								>
									{/* <div className="w-[120px] h-[120px] relative">
										<Image
											unoptimized
											src={
												// product?.image && product?.image !== ""
												// 	? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
												"/images/SD-default-image.png"
											}
											sizes="100%"
											alt="product"
											className="object-cover rounded-xl"
											fill
										/>
									</div> */}
									<div>
										<h3>{item?.billNo}</h3>
										<small>
											{moment(item?.createdAt).format("DD MMM YYYY")}
										</small>
									</div>

									<div className="flex flex-col justify-center h-full gap-2">
										<p className="font-bold text-primary">
											{numberFormat(item?.billAmount)}
										</p>
										<h3 className="text-sm">
											{convertShopShippingStatus(item?.status)}
										</h3>
										{item?.status === "REQUEST_TO_SHOP" ? (
											<div className="my-2 space-x-2">
												<AlertModal
													component={
														<Button className="text-white">ປະຕິເສດ</Button>
													}
													confirmFunction={() =>
														updateBillStatus("REJECTED_FROM_SHOP", item?._id)
													}
													title="ຢືນຢັນການປະຕິເສດ"
													desc="ທ່ານຢືນຢັນທີ່ຈະປະຕິເສດການສັ່ງຊື້ແທ້ບໍ"
													confirmText="ຢືນຢັນການປະຕິເສດ"
												/>
												<AlertModal
													component={<Button variant="outline">ຍອມຮັບ</Button>}
													confirmFunction={() =>
														updateBillStatus("APPROVED_FROM_SHOP", item?._id)
													}
													title="ຍອມຮັບການສັ່ງຊື້"
													desc="ທ່ານຢືນຢັນທີ່ຈະຍອມຮັບສັ່ງຊື້ແທ້ບໍ"
													confirmText="ຢືນຢັນການຍອມຮັບ"
												/>
											</div>
										) : item?.status === "APPROVED_FROM_SHOP" ? (
											<AlertModal
												component={
													<Button variant="outline">ດຳເນີນການຈັດສົ່ງ</Button>
												}
												title="ດຳເນີນການຈັດສົ່ງ"
												confirmText="ຢືນຢັນການຈັດສົ່ງ"
												confirmFunction={() => {
													updateBillStatus("SHOP_SHIPPING_TO_CTLH", item?._id);
												}}
												disableConfirm={selectedExpress && expressBill}
												desc={
													<div className="flex flex-col gap-4">
														<p>ກະລຸນາເລືອກຂົນສົ່ງ ແລະ ອັບໂຫຼດໃບບິນ</p>
														<Select>
															<SelectTrigger className="w-full">
																<SelectValue placeholder="ກະລຸນາເລືອກຂົນສົ່ງ" />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	<SelectLabel>ຂົນສົ່ງ</SelectLabel>

																	{expresses?.map((item) => (
																		<SelectItem
																			key={item?._id}
																			value={item?._id}
																			onClick={() =>
																				setSelectedExpress(item?.id)
																			}
																		>
																			{item?.name}
																		</SelectItem>
																	))}
																</SelectGroup>
															</SelectContent>
														</Select>
														<div className="space-y-2">
															<div className=" h-[400px] w-full my-4 mx-auto relative flex-center">
																{imageLoading ? (
																	<Loader />
																) : expressBill ? (
																	<>
																		<Image
																			src={
																				process.env.NEXT_PUBLIC_S3_BUCKET +
																				expressBill
																			}
																			className="object-cover"
																			fill
																		/>
																	</>
																) : (
																	<ReceiptText size={300} />
																)}
															</div>
															<Label htmlFor="picture">ຮູບໃບບິນຂົນສົ່ງ</Label>
															<Input
																id="picture"
																type="file"
																onChange={handleUploadImage}
															/>
														</div>
													</div>
												}
											/>
										) : null}
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</section>

			<section className="h-[10%]">
				<Footer />
			</section>
			<AlertModal
				footer={false}
				open={isBanned}
				title="ຮ້ານຂອງທ່ານຖືກແບນ"
				desc={
					<div className="flex-col gap-2 flex-center">
						<Ban size={100} className="text-primary" />
						<p>{storeDetail?.note}</p>
						<Button className="text-white" onClick={() => router.back()}>
							ກັບສູ່ໜ້າຫຼັກ
						</Button>
					</div>
				}
			/>
		</main>
	);
}
