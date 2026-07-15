"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft, Camera } from "lucide-react";

// UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";

// Constants and Helpers
import { IMG_PREFIX_S3 } from "@/constants/api";
import { get, update, uploadS3File } from "@/helpers";

export default function ProfileEdit({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const router = useRouter();
	const { toast } = useToast();
	// อ่าน USER_DATA จาก localStorage ใน useEffect เท่านั้น (ป้องกัน error ตอน SSR)
	const [USER_DATA, setUserData] = useState(null);
	const ACCESS_TOKEN = USER_DATA?.accessToken;

	const fileInputRef = useRef(null);

	const [userDetail, setUserDetail] = useState(null);
	const [province, setProvince] = useState(null);

	// Event Trigger
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [newImage, setNewImage] = useState(false);

	// อ่านข้อมูลผู้ใช้จาก localStorage หลัง mount (ฝั่ง client เท่านั้น)
	useEffect(() => {
		setUserData(JSON.parse(localStorage.getItem("USER_DATA") || "null"));
	}, []);

	// Use Effect
	useEffect(() => {
		if (!ACCESS_TOKEN) return;
		get(
			// `${USER}/${id}`,
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
			ACCESS_TOKEN,
			setLoading,
			(data) => {
				setUserDetail(data.data);
				setProvince(data.data.province);
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
		router.back();
	};

	const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

	const handleUploadImage = async (event) => {
		const file = event?.target?.files?.[0];
		if (!file) return;

		// ตรวจสอบว่าเป็นไฟล์รูปภาพ
		if (!file.type.startsWith("image/")) {
			toast({
				variant: "destructive",
				title: t("invalidImageType"),
			});
			event.target.value = "";
			return;
		}

		// ตรวจสอบขนาดไฟล์
		if (file.size > MAX_IMAGE_SIZE) {
			toast({
				variant: "destructive",
				title: t("imageTooLarge"),
			});
			event.target.value = "";
			return;
		}

		setImageLoading(true);
		try {
			const imageUrl = await uploadS3File(event);
			if (imageUrl) {
				setNewImage(imageUrl);
				toast({ title: t("uploadImageSuccess") });
			} else {
				throw new Error("No image url returned");
			}
		} catch (error) {
			console.log(error);
			toast({
				variant: "destructive",
				title: t("uploadImageError"),
			});
		} finally {
			setImageLoading(false);
			// รีเซ็ต input เพื่อให้เลือกไฟล์เดิมซ้ำได้
			event.target.value = "";
		}
	};

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async (values, resetForm) => {
		if (!values.password) {
			// biome-ignore lint/performance/noDelete: <explanation>
			delete values.password;
		}

		const prepareData = {
			...values,
			image: newImage || userDetail?.image,
		};

		try {
			await update(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
				prepareData,
				USER_DATA?.accessToken,
				setLoading,
				(data) => {
					setUserDetail(data.data);
					resetForm();
					router.push(`/profile/${id}`);
				},
				(error) => {
					console.log(error);
				},
			);
		} catch (error) {
			console.log(error);
		}
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
						{t("yourProfile")}
					</h1>
					<div className="relative w-[200px] h-[200px] my-4 mx-auto">
						<button
							type="button"
							onClick={openFilePicker}
							disabled={imageLoading}
							className="relative block w-full h-full rounded-full group focus:outline-none"
							aria-label={t("clickToUploadImage")}
						>
							<Avatar className="w-full h-full">
								{imageLoading ? (
									<div className="flex-center w-full h-full">
										<Loader />
									</div>
								) : (
									<>
										<AvatarImage
											src={
												newImage
													? IMG_PREFIX_S3 + newImage
													: IMG_PREFIX_S3 + userDetail?.image
											}
											className="object-cover"
										/>
										<AvatarFallback>{userDetail?.firstName}</AvatarFallback>
									</>
								)}
							</Avatar>
							{!imageLoading && (
								<span className="absolute bottom-2 right-2 flex-center w-12 h-12 text-white rounded-full shadow-md bg-primary">
									<Camera size={22} />
								</span>
							)}
						</button>
					</div>
					<h2 className="text-xl font-semibold text-center">
						{userDetail?.firstName} {userDetail?.lastName}
					</h2>
					<div className="flex flex-col items-center mx-auto my-4 w-full max-w-sm gap-1.5">
						<Button
							type="button"
							variant="outline"
							onClick={openFilePicker}
							disabled={imageLoading}
						>
							<Camera size={18} className="mr-2" />
							{t("clickToUploadImage")}
						</Button>
						<Input
							ref={fileInputRef}
							id="picture"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleUploadImage}
						/>
					</div>

					<Formik
						initialValues={{
							firstName: userDetail?.firstName || "",
							lastName: userDetail?.lastName || "",
							password: "",
							village: userDetail?.village || "",
							memberShopName: userDetail?.memberShopName || "",
							district: userDetail?.district || "",
							province: userDetail?.province || "",
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
										<Label htmlFor="firstName">{t("firstName")}</Label>
										<Input
											type="text"
											id="firstName"
											value={values.firstName}
											onChange={handleChange}
											placeholder={`${t("firstName")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="lastName">{t("lastName")}</Label>
										<Input
											type="text"
											id="lastName"
											value={values.lastName}
											onChange={handleChange}
											placeholder={`${t("lastName")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="password">{t("password")}</Label>
										<Input
											type="password"
											id="password"
											value={values.password}
											onChange={handleChange}
											placeholder={`${t("password")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="memberShopName">{t("memberShopName")}</Label>
										<Input
											type="memberShopName"
											id="memberShopName"
											value={values.memberShopName}
											onChange={handleChange}
											placeholder={`${t("memberShopName")}...`}
										/>
									</div>
									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="province">{t("province")}</Label>
										<Input
											type="province"
											id="province"
											value={values.province}
											onChange={handleChange}
											placeholder={`${t("province")}...`}
										/>
										{/* <Select
											onValueChange={(value) => {
												setFieldValue("province", value);
												setProvince(value);
											}}
											id="province"
											name="province"
											defaultValue={values.province}
											className="w-full"
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={`${t("province")}...`} />
											</SelectTrigger>
											<SelectContent className="w-full">
												{ADDRESS.map((item) => (
													<SelectItem
														key={item.province_name}
														value={item.province_name}
													>
														{item.province_name}
													</SelectItem>
												))}
											</SelectContent>
										</Select> */}
									</div>

									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="district">{t("district")}</Label>
										<Input
											type="district"
											id="district"
											value={values.district}
											onChange={handleChange}
											placeholder={`${t("district")}...`}
										/>
										{/* <Select
											onValueChange={(value) => {
												setFieldValue("district", value);
												// setProvince(value);
											}}
											id="district"
											name="district"
											defaultValue={values.district}
											className="w-full"
											disabled={!province}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={`${t("district")}...`} />
											</SelectTrigger>
											<SelectContent className="w-full">
												{ADDRESS?.find(
													(item) => item.province_name === province,
												)?.district_list?.map((item) => (
													<SelectItem key={item.district} value={item.district}>
														{item.district}
													</SelectItem>
												))}
											</SelectContent>
										</Select> */}
									</div>

									<div className="grid w-full max-w-sm items-center gap-1.5">
										<Label htmlFor="village">{t("village")}</Label>
										<Input
											type="village"
											id="village"
											value={values.village}
											onChange={handleChange}
											placeholder={`${t("village")}...`}
										/>
									</div>

									<Button
										className="w-[80%] rounded-full py-8 text-white"
										type="submit"
										disabled={isSubmitting}
									>
										{t("editProfile")}
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
