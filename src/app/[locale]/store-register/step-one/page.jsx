"use client";
import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// UI
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Constants
import { uploadS3File, create } from "@/helpers";
import { ADDRESS } from "@/constants/laoAddress";

export default function StoreRegisterStepOne() {
	const t = useTranslations("");
	const router = useRouter();

	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const ACCESS_TOKEN = USER_DATA.accessToken;

	const [province, setProvince] = useState(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [image, setImage] = useState("");
	const [imageError, setImageError] = useState("");
	const registerData =
		typeof localStorage !== "undefined" &&
		JSON.parse(localStorage.getItem("storeRegisterStep1"));

	const [formSubmitting, setFormSubmitting] = useState(false);

	// useEffect
	useEffect(() => {
		if (registerData) {
			setProvince(registerData.province);
			setImage(registerData.image);
		}
	}, []);

	// Function
	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);

		console.log(imageUrl);

		if (imageUrl) {
			setImage(imageUrl);
		}

		setImageLoading(false);
	};

	const handleSubmit = (values) => {
		setImageError("");
		if (image === "") {
			setImageError("ກະລຸນາອັບໂຫຼດຮູບພາບ");
			return;
		}

		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop`,
			{
				...values,
				phone: `66${values.phone}`,
				image,
			},
			ACCESS_TOKEN,
			setFormSubmitting,
			(data) => {
				localStorage.setItem("shopData", JSON.stringify(data.data));
				router.push("/store-register/pending-review");
			},
			(error) => {
				setError("ມີບາງຢ່າງຜິດພາດ, ກະລຸນາລອງໃໝ່");
			},
		);
	};

	return (
		<main className="p-4 space-y-4 overflow-y-auto h-dvh">
			<div className="w-full text-center">
				<h1 className="text-2xl font-bold ">ຮ້ອງຂໍສະໝັກເປີດຮ້ານ</h1>
			</div>

			<Formik
				initialValues={{
					// Part 1

					name: registerData?.name || "",
					phone: registerData?.phone || "",
					village: registerData?.village || "",
					district: registerData?.district || "",
					province: registerData?.province || "",
				}}
				validate={(values) => {
					const errors = {};

					if (!values.name) {
						errors.name = "ກະລຸນາປ້ອນຊື່ຮ້ານ";
					}
					// if (!values.storeDescription) {
					// 	errors.storeDescription = "ກະລຸນາປ້ອນລາຍລະອຽດຮ້ານ";
					// }
					if (!values.phone) {
						errors.phone = "ກະລຸນາປ້ອນເບີໂທລະສັບ";
					}

					return errors;
				}}
				onSubmit={(values) => {
					handleSubmit(values);
				}}
			>
				{({
					handleChange,
					handleSubmit,
					values,
					errors,
					setFieldValue,
					handleBlur,
				}) => (
					<form className="space-y-4" onSubmit={handleSubmit}>
						{console.log(errors)}
						<section className="w-[80%] mx-auto flex-center">
							{/* <div className="flex-col flex-center">
								<div className="w-10 h-10 font-bold text-white bg-[#ffec00] rounded-full flex-center">
									1
								</div>
								<p className="font-bold text-[#ffec00]">ຂໍ້ມູນຮ້ານ</p>
							</div>
							<hr className="flex-1 h-2 text-gray-200 " />
							<div className="flex-col flex-center">
								<div className="w-10 h-10 border border-gray-400 rounded-full flex-center">
									2
								</div>
								<p>ນະໂຍບາຍ</p>
							</div> */}
							{/* <hr className="flex-1 h-2 text-gray-200 " />
							<div className="flex-col flex-center">
								<div className="w-10 h-10 border border-gray-400 rounded-full flex-center">
									3
								</div>s
								<p>ນະໂຍບາຍ</p>
							</div> */}
						</section>

						<section className="space-y-4">
							<div className="space-y-2">
								<Avatar className="w-[200px] h-[200px] my-4 mx-auto">
									{imageLoading ? (
										<Loader />
									) : (
										<>
											<AvatarImage
												src={process.env.NEXT_PUBLIC_S3_BUCKET + image}
												className="object-cover"
											/>
											<AvatarFallback>{values.name}</AvatarFallback>
										</>
									)}
								</Avatar>
								<Label htmlFor="picture">ຮູບພາບໂປຣຟາຍຮ້ານ</Label>
								<Input id="picture" type="file" onChange={handleUploadImage} />
							</div>
							{imageError ? <small>{imageError}</small> : null}
							<div className="space-y-2">
								<Label htmlFor="name">ຊື່ຮ້ານ</Label>
								<Input
									id="name"
									name="name"
									type="text"
									onChange={handleChange}
									value={values.name}
									placeholder="ຊື່ຮ້ານ..."
								/>
								{errors.name && (
									<small className="text-red-500">{errors.name}</small>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">ເບີໂທຮ້ານ</Label>
								<div className="gap-2 flex-center">
									<div className="max-w-[10%] rounded-md bg-neutral-100 border p-2">
										66
									</div>
									<Input
										id="phone"
										name="phone"
										type="number"
										onChange={handleChange}
										value={values.phone}
										placeholder="xx-xxxx-xxxx"
									/>
								</div>
								{errors.phone && (
									<small className="text-red-500">{errors.phone}</small>
								)}
							</div>
							{/* <div className="space-y-2">
								<Label htmlFor="phone">ລາຍລະອຽດຮ້ານ</Label>
								<Textarea
									id="storeDescription"
									name="storeDescription"
									type="number"
									onChange={handleChange}
									value={values.storeDescription}
									placeholder="ລາຍລະອຽດຮ້ານ..."
								/>
								{errors.storeDescription && (
									<small className="text-red-500">
										{errors.storeDescription}
									</small>
								)}
							</div> */}
							<div className="grid w-full  items-center gap-1.5">
								{/* <Label htmlFor="province">{t("province")}</Label>
								<Select
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
								<label
									className="block mb-2 text-sm font-bold text-gray-700"
									for="province"
								>
									{t("province")}
								</label>
								<input
									type="text"
									value={values.province}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`${
										errors?.province && touched.province
											? "border-red-500 "
											: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
									placeholder={`${t("province")}...`}
									id="province"
									name="province"
								/>
							</div>

							<div className="grid w-full  items-center gap-1.5">
								{/* <Label htmlFor="district">{t("district")}</Label>
								<Select
									onValueChange={(value) => {
										setFieldValue("district", value);
										// setProvince(value);
									}}
									id="district"
									name="district"
									defaultValue={values.district}
									className="w-full"
									disabled={!province ? true : false}
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
								<label
									className="block mb-2 text-sm font-bold text-gray-700"
									for="district"
								>
									{t("district")}
								</label>
								<input
									type="text"
									value={values.district}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`${
										errors?.district && touched.district
											? "border-red-500 "
											: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
									placeholder={`${t("district")}...`}
									id="district"
									name="district"
								/>
							</div>

							<div className="grid w-full  items-center gap-1.5">
								<Label htmlFor="village">{t("village")}</Label>
								<Input
									type="village"
									id="village"
									value={values.village}
									onChange={handleChange}
									placeholder={`${t("village")}...`}
								/>
							</div>
						</section>

						<section className="w-full gap-4 flex-center ">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => router.back()}
							>
								ຍົກເລີກ
							</Button>
							<Button type="submit" className="w-full font-bold text-white">
								ດຳເນີນການຕໍ່
							</Button>
						</section>
					</form>
				)}
			</Formik>
		</main>
	);
}
