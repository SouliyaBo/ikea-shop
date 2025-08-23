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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// Constants and Helpers
import { IMG_PREFIX_S3 } from "@/constants/api";
import { get, update, uploadS3File } from "@/helpers";

export default function ProfileEdit({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const router = useRouter();
	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const ACCESS_TOKEN = USER_DATA.accessToken;

	const [userDetail, setUserDetail] = useState(null);
	const [province, setProvince] = useState(null);

	// Event Trigger
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [newImage, setNewImage] = useState(false);

	// Use Effect
	useEffect(() => {
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

	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);

		if (imageUrl) {
			setNewImage(imageUrl);
		}

		setImageLoading(false);
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
				USER_DATA.accessToken,
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
					<Avatar className="w-[200px] h-[200px] my-4 mx-auto">
						{imageLoading ? (
							<Loader />
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
					<h2 className="text-xl font-semibold text-center">
						{userDetail?.firstName} {userDetail?.lastName}
					</h2>
					<div className="grid mx-auto my-4 w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="picture">{t("clickToUploadImage")}</Label>
						<Input id="picture" type="file" onChange={handleUploadImage} />
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
