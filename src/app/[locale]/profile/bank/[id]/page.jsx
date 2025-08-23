"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileFooter from "@/components/Profile/EditProfileFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Constants and Helpers
import { USER, IMG_PREFIX_S3 } from "@/constants/api";
import { create, get, update, uploadS3File } from "@/helpers";
import { ADDRESS } from "@/constants/laoAddress";
import { bankInLaos } from "@/constants/bankInLaos";
import { bankCurrency } from "@/constants/bankCurrency";
import SweetAlert from "@/components/SweetAlert";
import { DATA_BANK_UPDATE, PHONE } from "@/constants";
import DotSpinner from "@/components/DotSpinner";

export default function ProfileEdit({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const router = useRouter();
	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const ACCESS_TOKEN = USER_DATA.accessToken;
	const [userBank, setUserBank] = useState(null);

	// Event Trigger
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [newImage, setNewImage] = useState(false);

	// Use Effect
	useEffect(() => {
		get(
			// `${USER}/${id}`,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank?user=${id}`,
			ACCESS_TOKEN,
			setLoading,
			(data) => {
				setUserBank(data?.data?.data?.[0]);
				setLoading(false);
			},
			(error) => {
				console.log(error);
				setLoading(false);
			},
		);
	}, [id, ACCESS_TOKEN]);

	// Functions
	const handleGoBack = () => {
		router.push(`/profile/${id}`);
	};

	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);

		if (imageUrl) {
			setNewImage(imageUrl);
		}

		setImageLoading(false);
	};

	const handleSubmit = async (values, resetForm) => {
		const prepareData = {
			...values,
			qrCode: newImage || userBank?.qrCode,
			bankLogo: bankInLaos.find((bank) => bank.bankNameLa === values.name)?.img || userBank?.bankLogo,
		};

		try {
			if (userBank) {
				setLoading(true)
				localStorage.setItem(DATA_BANK_UPDATE, JSON.stringify({
					data: prepareData,
					userBankId: userBank?._id,
					userId: id
				}));
				localStorage.setItem(PHONE, USER_DATA?.data?.phone);
				// requestOTP(USER_DATA?.data?.phone);
				await create(
					`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank`,
					prepareData,
					USER_DATA.accessToken,
					setLoading,
					(data) => {
						console.log(data);
						resetForm();
						router.push(`/profile/${id}`);
					},
					(error) => {
						console.log('error:', error);
					},
				);
			} else {
				await create(
					`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank`,
					prepareData,
					USER_DATA.accessToken,
					setLoading,
					(data) => {
						console.log(data);
						resetForm();
						router.push(`/profile/${id}`);
					},
					(error) => {
						console.log('error:', error);
					},
				);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const requestOTP = (phone) => {
		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/request-otp`,
			{ phone: phone },
			"",
			setLoading,
			(data) => {
				if (data?.error === false) {
					router.push("/profile/verify-otp");
				}
			},
			(error) => {
				console.log("error:: ", error?.response?.data?.message);
				SweetAlert({
					icon: "error",
					title: t("somethingIsWrong"),
					text: t("pleaseCheckYourInternetConnectionAndTryAgain"),
				});
			},
		);
	};

	return (
		<div className="relative w-full h-dvh">
			{/* <Button
					onClick={() => handleGoBack()}
					className=" w-[50px] h-[50px] rounded-full flex-center absolute text-white left-10 top-10"
				>
					<ChevronLeft size={38} />
				</Button> */}
			{loading ? (
				<div className="h-full flex-center">
					<Loader />
				</div>
			) : (
				<section className="w-full h-full px-4 py-2 overflow-y-auto">
					<Button
						onClick={() => handleGoBack()}
						className=" w-[50px] h-[50px] rounded-full flex-center  text-white "
					>
						<ChevronLeft size={38} />
					</Button>
					<h1 className="w-full text-lg font-bold text-center">
						{t("yourBankInfo")}
					</h1>

					<Avatar className="w-[200px] h-[200px] my-4 mx-auto rounded">
						{imageLoading ? (
							<Loader />
						) : (
							<>
								<AvatarImage
									src={
										newImage
											? IMG_PREFIX_S3 + newImage
											: IMG_PREFIX_S3 + userBank?.qrCode
									}
									className="object-cover"
								/>
								<AvatarFallback className="rounded">{userBank?.accountName}</AvatarFallback>
							</>
						)}
					</Avatar>
					<div className="grid mx-auto my-4 w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="picture">{t("clickToUploadImage")}</Label>
						<Input id="picture" type="file" onChange={handleUploadImage} />
					</div>

					<Formik
						initialValues={{
							user: userBank?.user?._id || id,
							name: userBank?.name || "",
							currency: userBank?.currency || "",
							accountName: userBank?.accountName || "",
							accountNumber: userBank?.accountNumber || "",
						}}
						onSubmit={(values, { setSubmitting, resetForm }) => {
							setSubmitting(true);
							handleSubmit(values, resetForm);
							setSubmitting(false);
						}}
					>
						{({
							values,
							handleChange,
							handleSubmit,
							isSubmitting,
							setFieldValue,
						}) => (
							<form onSubmit={handleSubmit} className="w-full">
								<div className="flex-col w-full gap-4 flex-center">
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="name">{t("bankName")}</Label>
										<Input
											type="text"
											id="name"
											value={values.name}
											onChange={handleChange}
											placeholder={`${t("bankName")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="currency">{t("currency")}</Label>
										<Select
											onValueChange={(value) => {
												setFieldValue("currency", value);
											}}
											id="currency"
											name="currency"
											defaultValue={values.currency}
											className="w-full"
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={`${t("currency")}...`} />
											</SelectTrigger>
											<SelectContent className="w-full">
												{bankCurrency.map((item) => (
													<SelectItem
														key={item.id}
														value={item.name}
													>
														{item.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="accountName">{t("accountName")}</Label>
										<Input
											type="text"
											id="accountName"
											value={values.accountName}
											onChange={handleChange}
											placeholder={`${t("accountName")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="accountNumber">{t("accountNumber")}</Label>
										<Input
											type="text"
											id="accountNumber"
											value={values.accountNumber}
											onChange={handleChange}
											placeholder={`${t("accountNumber")}...`}
										/>
									</div>

									<Button
										className="w-[80%] rounded-full py-8 text-white"
										type="submit"
										disabled={loading}
									>
										{loading ? <DotSpinner /> : ''}
										{!userBank ? t("addBankInfo") : t("editBankInfo")}
									</Button>
								</div>
							</form>
						)}
					</Formik>
				</section>
			)}

			{/* <div className="h-[10%]">
				<EditProfileFooter
					handleClick={() => {
						alert("Hey");
					}}
				/>
			</div> */}
		</div>
	);
}
