"use client";
import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { MessageCircleWarning } from "lucide-react";

// UI
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import AlertModal from "@/components/AlertModal";

// Constants
import {
	get,
	update,
	uploadS3File,
	getAccessTokenFromLCStorage,
	getUserDataFromLCStorage,
} from "@/helpers";
import { ADDRESS } from "@/constants/laoAddress";

export default function NewRequestStore({ params }) {
	const id = params.id;
	const t = useTranslations("");
	const router = useRouter();
	const { toast } = useToast();

	const [accessToken, setAccessToken] = useState("");

	const [userData, setUserData] = useState(null);
	const [storeDetail, setStoreDetail] = useState(null);
	const [province, setProvince] = useState(null);
	const [imageLoading, setImageLoading] = useState(false);
	const [image, setImage] = useState("");
	const [imageError, setImageError] = useState("");
	const [isRejected, setIsRejected] = useState(false);

	/// Effect
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
		if (accessToken && id) {
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/shop/${id}`,
				accessToken,
				() => { },
				(data) => {
					setStoreDetail(data?.data);
					setProvince(data?.data?.province);
					setImage(data?.data?.image);

					if (data?.data?.status === "REJECTED") {
						setIsRejected(true);
					}
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [accessToken, id]);

	// Function
	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);
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
				phone: `66${values.phone}`,
				village: values.village,
				district: values.district,
				province: values.province,
				image,
				status: "REQUESTING",
			},
			userData?.accessToken,
			() => { },
			(data) => {
				toast({
					title: "ສໍາເລັດ",
					description: "ຮ້ອງຂໍເປີດຮ້ານສຳເລັດ",
				});

				setTimeout(() => {
					router.replace("/store-register/pending-review");
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
				<h1 className="text-2xl font-bold ">ຮ້ອງຂໍສະໝັກເປີດຮ້ານ</h1>
			</div>

			{storeDetail ? (
				<Formik
					enableReinitialize
					initialValues={{
						// Part 1

						name: storeDetail?.name || "",
						phone: storeDetail?.phone.slice(2) || "",
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
					{({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
						<form className="space-y-4" onSubmit={handleSubmit}>
							<section className="w-[80%] mx-auto flex-center">
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
									<Input
										id="picture"
										type="file"
										onChange={handleUploadImage}
									/>
								</div>
								{imageError ? <small>{imageError}</small> : null}
								<div className="space-y-2">
									<Label htmlFor="name">ຊື່ຮ້ານ</Label>
									<Input
										id="name"
										name="name"
										type="text"
										onChange={handleChange}
										value={values.name || storeDetail?.name}
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
											20
										</div>
										<Input
											id="phone"
											name="phone"
											type="number"
											onChange={handleChange}
											value={values.phone || storeDetail?.phone.slice(2)}
											placeholder="ເບີໂທຮ້ານ..."
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
									<Label htmlFor="province">{t("province")}</Label>
									<Select
										onValueChange={(value) => {
											setFieldValue("province", value);
											setProvince(value);
										}}
										id="province"
										name="province"
										defaultValue={values.province || storeDetail?.province}
										value={values.province || storeDetail?.province}
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
										defaultValue={values.district || storeDetail?.district}
										value={values.district || storeDetail?.district}
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
								<Button type="submit" className="w-full font-bold text-white">
									ຮ້ອງຂໍໃໝ່ອີກຄັ້ງ
								</Button>
							</section>
						</form>
					)}
				</Formik>
			) : null}
			<AlertModal
				footer={false}
				open={isRejected}
				defaultOpen={open}
				title="ຮ້ານຂອງທ່ານຖືກປະຕິເສດ"
				desc={
					<div className="flex-col gap-2 flex-center">
						<p>ກະລຸນາກອກຂໍ້ມູນການຮ້ອງຂໍເປີດຮ້ານໃຫ້ຖືກຕ້ອງ ເພື່ອຮ້ອງຂໍການເປີດຮ້ານຄ້າໃໝ່</p>
						<MessageCircleWarning size={100} className="text-primary" />
						<p>{storeDetail?.note}</p>
						<Button className="text-white" onClick={() => setIsRejected(false)}>
							ຕົກລົງ
						</Button>
					</div>
				}
			/>
		</main>
	);
}
