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
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";
import DotSpinner from "@/components/DotSpinner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Constants
import { uploadS3File, getUserDataFromLCStorage, get, update } from "@/helpers";
import { ADDRESS } from "@/constants/laoAddress";

export default function EditStore() {
	const t = useTranslations("");
	const router = useRouter();
	const { toast } = useToast();

	const [userData, setUserData] = useState(null);
	const [storeDetail, setStoreDetail] = useState(null);

	const [province, setProvince] = useState(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [image, setImage] = useState("");
	const [imageError, setImageError] = useState("");

	// Effect
	useEffect(() => {
		const user = getUserDataFromLCStorage();
		if (user) {
			setUserData(user);
		}
	}, []);

	useEffect(() => {
		if (userData) {
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop/${userData?.data?.shop}`,
				userData?.accessToken,
				() => {},
				(data) => {
					setStoreDetail(data?.data);
					setImage(data?.data?.image);
					setProvince(data?.data?.province);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [userData]);

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

		update(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop/${userData?.data?.shop}`,
			{
				name: values.name,
				phone: values.phone,
				village: values.village,
				district: values.district,
				province: values.province,
				image,
			},
			userData?.accessToken,
			() => {},
			(data) => {
				toast({
					title: "ສໍາເລັດ",
					description: "ອັບເດດຂໍ້ມູນຮ້ານສຳເລັດ",
				});

				setTimeout(() => {
					router.back();
				}, 1000);
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
		<main className="p-4 space-y-4 overflow-y-auto h-dvh">
			<div className="w-full text-center">
				<h1 className="text-2xl font-bold ">ຈັດກການຂໍ້ມູນຮ້ານ</h1>
			</div>

			<Formik
				enableReinitialize
				initialValues={{
					// Part 1

					name: storeDetail?.name || "",
					phone: storeDetail?.phone || "",
					village: storeDetail?.village || "",
					district: storeDetail?.district || "",
					province: storeDetail?.province || "",
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
					isSubmitting,
				}) => (
					<form className="space-y-4" onSubmit={handleSubmit}>
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
								<Input
									id="phone"
									name="phone"
									type="number"
									onChange={handleChange}
									value={values.phone}
									placeholder="ເບີໂທຮ້ານ..."
								/>
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
								<Label htmlFor="province">{t("province")}</Label>
								<Select
									onValueChange={(value) => {
										setFieldValue("province", value);
										setProvince(value);
									}}
									id="province"
									name="province"
									value={values.province}
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
								</Select>
							</div>

							<div className="grid w-full  items-center gap-1.5">
								<Label htmlFor="district">{t("district")}</Label>
								<Select
									onValueChange={(value) => {
										setFieldValue("district", value);
										// setProvince(value);
									}}
									id="district"
									name="district"
									value={values.district}
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
								</Select>
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
							<Button
								disabled={isSubmitting}
								type="submit"
								className="w-full font-bold text-white"
							>
								ບັນທຶກການແກ້ໄຂ
								{isSubmitting ? <DotSpinner /> : null}
							</Button>
						</section>
					</form>
				)}
			</Formik>
		</main>
	);
}
