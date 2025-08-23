"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useRouter } from "@/navigation";

// Third Party
// import { Formik } from "formik";
import { useTranslations } from "next-intl";
import { groupBy } from "lodash";

// UI
import { Button } from "@/components/ui/button";
import AlertSuccess from "@/components/ui/alertSuccess";
import AlertError from "@/components/ui/alertError";
import DotSpinner from "@/components/DotSpinner";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import { Input } from "@/components/ui/input";

// Icons
import { ChevronLeft, Headset } from "lucide-react";

// Constant and Helper
import { IMG_PREFIX_S3 } from "@/constants";
import { gets, uploadS3File, create, get } from "@/helpers/index";
import currencyDisplay, {
	formatToCurrencyTHB,
} from "@/helpers/currencyDisplay";
import numberFormat from "@/helpers/numberFormat";

import { MONEY_USER } from "@/constants/api";
import { data } from "autoprefixer";

export default function ConfirmOrder() {
	const router = useRouter();
	const t = useTranslations("");
	const { toast } = useToast();
	// const DATA_CART = JSON.parse(localStorage.getItem("DATA_CART"));
	const DATA_CART =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("DATA_CART"))
			: null;

	const [TOKEN, setTOKEN] = useState();
	const [userData, setUserData] = useState();

	const [moneyUser, setMoneyUser] = useState(0);
	const [useDiscount, setUseDiscount] = useState(false);
	const [clickContact, setClickContact] = useState(false);
	// const [dataBanks, setDataBanks] = useState([]);
	const [imageQrCode, setImageQrCode] = useState("");
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(false);
	// const [imageSlip, setImageSlip] = useState("");
	const [transport, setTransport] = useState("payStart");
	const [erroringText, setErroringText] = useState("");
	const [exportSuccess, setExportSuccess] = useState(false);
	const [express, setExpress] = useState("");
	const [expressError, setExpressError] = useState("");
	const [major, setMajor] = useState("");
	const [majorError, setMajorError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isAcceptTerm, setIsAcceptTerm] = useState(false);

	const [bcelQrCode, setBcelQrCode] = useState("");
	const [bcelResponse, setBcelResponse] = useState(null);
	const [slip, setSlip] = useState("");
	const [imageLoading, setImageLoading] = useState(false);

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;

		setTOKEN(USER_DATA?.accessToken);
		setUserData(USER_DATA?.data);

		// getBanks();
	}, []);

	useEffect(() => {
		if (TOKEN && userData) {
			getMoneyUser();
			// generateBCELQrCode();
		}
	}, [TOKEN, userData]);

	useEffect(() => {
		if (express) {
			setExpressError("");
		} else {
			setExpressError("กรุณาป้อนข้อมูลการจัดส่ง");
		}

		return () => {
			setExpressError("");
		};
	}, [express]);

	useEffect(() => {
		if (major && express !== "ຮັບສິນຄ້າຢູ່ໜ້າຮ້ານ") {
			setMajorError("");
		} else {
			setMajorError("กรุณาป้อนข้อมูลการจัดส่ง");
		}

		return () => {
			setMajorError("");
		};
	}, [major, express]);

	const getMoneyUser = () => {
		get(
			`${MONEY_USER}?user=${userData?._id}`,
			TOKEN,
			() => { },
			(res) => {
				if (res.data?.data?.length > 0) setMoneyUser(res.data?.data[0]?.money);
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
			setSlip(imageUrl);
		}

		setImageLoading(false);
	};

	const _handleConfirm = async () => {
		const productGroupByShop = groupBy(DATA_CART?.data, "shop");
		const groupShopProducts = [];
		const productVipCode = localStorage.getItem("productVipCode");


		for (const [key, value] of Object.entries(productGroupByShop)) {
			console.log(key);
			groupShopProducts.push(value);
		}
		if (groupShopProducts.length > 0) {
			const discountPerGroup = useDiscount
				? Math.min(DATA_CART?.total, moneyUser) / groupShopProducts.length
				: 0;

			for (const shopProducts of groupShopProducts) {
				const newData = shopProducts.map((item) => ({
					productId: item?.productId?._id,
					qty: item?.qty || 0,
					categoryId: item?.productId?.categoryId,
				}));

				const totalAmount = shopProducts.map((item) => {
					const discountPrice =
						item?.productId?.sellPrice *
						(1 - item?.productId?.percentDiscount / 100);
					return discountPrice * item?.qty;
				});

				const total = totalAmount.reduce((a, b) => a + b, 0);

				const payload = {
					totalAmount: total,
					express: express,
					major: major,
					paymentType: "ຕົ້ນທາງ",
					customerPaymentImage: slip,
					data: newData,
					discount: discountPerGroup,
					shop: shopProducts[0]?.shop?._id,
					vipCode: productVipCode,
					// photo: slip,
					// image: slip,
					// slip: slip,
				};

				if (productVipCode === userData?.vipCode || !productVipCode) {
					delete payload.vipCode;
				}
				// Uncomment and adjust the following try-catch block if you want to make the API call
				try {
					create(
						`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/export-product/website`,
						payload,
						TOKEN,
						setIsLoading,
						(data) => {
							setExportSuccess(true);
							toast({
								title: "สำเร็จ",
								description: "การสั่งชื้อสินค้าสำเร็จ",
							});
							router.replace("/success-payment");
							setTimeout(() => {
								setExportSuccess(false);
							}, 3000);
						},
						(error) => {
							if (error?.response?.data?.message === "Unauthorized!") {
								console.log("error:: ", error?.response?.data?.message);
							} else {
								setError(true);
								setErroringText("Something went wrong!");
								setTimeout(() => {
									setError(false);
								}, 3000);
							}
						},
					);
				} catch (err) {
					console.error("API call failed: ", err);
					setError(true);
					setErroringText("API call failed!");
					setTimeout(() => {
						setError(false);
					}, 3000);
				}
			}
		}
	};



	return (
		<div className="relative w-full h-dvh">
			<section className="h-[85%] overflow-y-auto p-5">
				<div className="relative py-8 flex-center">
					<Button
						onClick={() => {
							router.push("/cart");
						}}
						className="absolute left-4 w-[50px] h-[50px] rounded-full bg-transparent border text-black"
					>
						<ChevronLeft size={38} />
					</Button>
					<h1 className="text-2xl font-bold">รวมยอด</h1>
				</div>
				<div className="flex flex-col justify-between gap-4">
					<table className="w-full border-collapse">
						<thead>
							<tr>
								<th className="px-4 py-2 text-gray-800 border border-gray-400 text-start">
									{t("productName")}
								</th>
								<th className="px-4 py-2 text-gray-800 border border-gray-400 text-start">
									{t("quantity")}
								</th>
								<th className="px-4 py-2 text-gray-800 border border-gray-400 text-start">
									{t("price")}
								</th>
							</tr>
						</thead>
						<tbody>
							{DATA_CART?.data?.length > 0 &&
								DATA_CART?.data?.map((item) => (
									<tr key={item?._id}>
										<td className="px-4 py-2 text-gray-800 border border-gray-400">
											{item?.productName}
											<br />
											<small>{item?.note}</small>
										</td>
										<td className="px-4 py-2 text-gray-800 border border-gray-400">
											{item?.qty}
										</td>
										<td className="px-4 py-2 text-gray-800 border border-gray-400">
											{item?.productId?.percentDiscount > 0
												? formatToCurrencyTHB(
													item?.productId?.sellPrice *
													(1 - item?.productId?.percentDiscount / 100),
												)
												: formatToCurrencyTHB(item?.productId?.sellPrice)}{" "}
											{/* {t("kip")} */}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
				<div className="flex flex-col items-end pt-4 pb-3">
					<div className="text-lg font-semibold">{t("totalPrice")}</div>
					<div className="font-normal">
						{formatToCurrencyTHB(DATA_CART?.total)}
						{/* {t("kip")} */}
					</div>
				</div>
				<div className="flex flex-col items-end pb-3">
					<div className="text-lg font-semibold">{t("discount")}</div>
					<div className="font-normal">
						{formatToCurrencyTHB(
							useDiscount
								? DATA_CART?.total <= moneyUser
									? DATA_CART?.total
									: moneyUser
								: DATA_CART?.discount,
						)}{" "}
						{/* {t("kip")} */}
					</div>
				</div>

				<div className="flex flex-col items-end pb-3">
					<div className="text-lg font-semibold">{t("moneyToPay")}</div>
					<div className="font-normal">
						{formatToCurrencyTHB(
							DATA_CART?.total -
							(useDiscount
								? DATA_CART?.total <= moneyUser
									? DATA_CART?.total
									: moneyUser
								: DATA_CART?.discount),
						)}{" "}
						{/* {t("kip")} */}
					</div>
				</div>

				<hr className="mt-4" />
				<>
					<div className="flex flex-col gap-2 mt-4">
						{moneyUser && moneyUser > 0 ? (
							<>
								<div className="font-bold">{t("discount")}: </div>
								<div className="flex gap-2">
									<input
										type="checkbox"
										id="moneyUser"
										name="moneyUser"
										checked={useDiscount}
										onChange={() => setUseDiscount(!useDiscount)}
									/>
									<label for="moneyUser">
										ນຳໃຊ້ລາຍຮັບໃນລະບົບຂອງທ່ານ &nbsp;
										<span className="text-primary">
											({numberFormat(moneyUser)} {t("kip")})
										</span>
									</label>
								</div>
							</>
						) : (
							""
						)}
						<label
							for="express"
							className="block mb-2 text-sm font-bold text-gray-700"
						>
							{/* {t("express")}
							<span className="font-normal text-green-500">
								(จัดส่งฟรีทั่วปะเทด)
							</span> */}
							ผู้รับ : ที่อยู่ (จัดส่ง)
						</label>

						{/* <select
							onChange={(e) => setExpress(e.target?.value)}
							className="px-4 py-2 pr-8 bg-white border border-gray-400 rounded shadow hover:border-gray-500 focus:outline-none focus:shadow-outline"
						>
							{expresses?.map((item) => (
								<option key={item} value={item}>
									{item}
								</option>
							))}
						</select> */}
						<input
							type="text"
							value={express}
							name="express"
							id="express"
							onChange={(e) => setExpress(e.target?.value)}
							className="px-4 py-2 pr-8 bg-white border border-gray-400 rounded shadow hover:border-gray-500 focus:outline-none focus:shadow-outline"
							placeholder={`${t("express")}...`}
						/>
						{expressError ? (
							<small className="text-red-500">{expressError}</small>
						) : (
							""
						)}
					</div>

					<div className="flex flex-col gap-2 mt-4">
						<label
							for="major"
							className="block mb-2 text-sm font-bold text-gray-700"
						>
							{t("branch")}
						</label>

						<input
							type="text"
							name="major"
							placeholder={`${t("branch")}...`}
							onChange={(e) => setMajor(e.target?.value)}
							className="px-4 py-2 pr-8 bg-white border border-gray-400 rounded shadow hover:border-gray-500 focus:outline-none focus:shadow-outline"
						/>
						{majorError ? (
							<small className="text-red-500">{majorError}</small>
						) : (
							""
						)}
						{/* <div className="w-[300px] h-[300px] relative mx-auto border border-primary">
							<Image fill src={"/images/bank-qr.jpg"} />
						</div> */}
						{imageLoading ? (
							<Loader />
						) : null
							// slip ? (
							// 	<img
							// 		src={IMG_PREFIX_S3 + slip}
							// 		alt={slip}
							// 		className="w-full h-full"
							// 	/>
							// ) : (
							// 	<p className="text-red-500">กรุณาอัปโหลดสลิป</p>
							// )
						}
						{/* <div className="grid mx-auto my-4 w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="picture">{t("clickToUploadImage")}</Label>
							<Input id="picture" type="file" onChange={handleUploadImage} />
						</div> */}
						<button type="button" onClick={() => setClickContact(true)}>
							<a href="https://line.me/R/ti/p/@442avwvd?ts=05062354&oat_content=url" target="_bank" className="flex flex-row underline justify-end text-blue-500" >
								<Headset className="mr-2" /><span>{t("contactServiceCenter")}</span>
							</a>
						</button>
					</div>
				</>
			</section>
			<div className="h-[15%] bg-white z-10">
				<div className="w-full h-full border shadow-xl rounded-t-2xl text-primary-foreground flex-center">
					<div className="flex-col w-full gap-4 flex-center ">
						<Button
							className="w-[80%] rounded-full py-8 text-white disabled:bg-gray-400 flex-center gap-4"
							onClick={() => _handleConfirm()}
							disabled={isLoading || !express || !major || !clickContact}
						>
							{t("processToBuy")}
							{isLoading && <DotSpinner />}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

const expresses = ["ມີໄຊ", "ຮຸ່ງອາລຸນ", "ອານຸສິດ", "ຮັບສິນຄ້າຢູ່ໜ້າຮ້ານ"];
