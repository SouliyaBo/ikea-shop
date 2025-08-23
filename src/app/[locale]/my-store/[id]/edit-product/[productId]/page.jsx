"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/navigation";

// Third Party
import { Formik } from "formik";
import axios from "axios";
import { useTranslations } from "next-intl";

// Icons
import { Trash } from "lucide-react";

// UI
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Loader from "@/components/Loader";
import DotSpinner from "@/components/DotSpinner";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import AlertModal from "@/components/AlertModal";

// Constant and Helpers
import {
	uploadS3File,
	create,
	update,
	getUserDataFromLCStorage,
	gets,
	get,
	remove,
} from "@/helpers";

export default function EditStoreProduct() {
	const router = useRouter();
	const pathname = usePathname();
	const id = pathname.split("/")[4];
	const t = useTranslations("");

	const [userData, setUserData] = useState(null);
	const [categories, setCategories] = useState(null);
	const [detailProduct, setDetailProduct] = useState({});

	const [image, setImage] = useState(null);
	const inputFileRef = useRef(null);

	const [oldAdditionalImage, setOldAdditionalImage] = useState([]);
	const [additionImages, setAdditionImages] = useState([]);
	const [preSignAdditionalImage, setPreSignAdditionalImage] = useState([]);
	const [options, setOptions] = useState([
		{
			title: "",
			values: [""],
		},
	]);

	// Event Trigger
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasOption, setHasOption] = useState(false);

	// Effect
	useEffect(() => {
		const user = getUserDataFromLCStorage();

		if (user) {
			setUserData(user);
		}
	}, []);

	useEffect(() => {
		if (userData?.accessToken) {
			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/category`,
				{},
				userData?.accessToken,
				() => {},
				(data) => {
					setCategories(data.data);
					// setIsLoading(false);
				},
				(error) => {
					console.log(error);
					// setIsLoading(false);
				},
			);

			_getProduct(id);
			_getProductOption(id);
		}
	}, [userData, id]);
	// Function
	const _getProduct = (id) => {
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale/${id}`,
			// TOKEN,
			"",
			setLoading,
			(data) => {
				setDetailProduct(data?.data);
				setImage(data?.data?.image);
				setOldAdditionalImage(data.data.imageDetail);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const _getProductOption = (id) => {
		gets(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product-option`,
			// TOKEN,
			{
				product: id,
			},
			"",
			setLoading,
			(data) => {
				const options = data?.data?.data;
				if (options?.length > 0) {
					setHasOption(true);
					setOptions(options);
				}
			},
			(err) => {
				console.log(err);
			},
		);
	};

	const handleUploadProductImage = async (event, setImage) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);

		if (imageUrl) {
			setImage(imageUrl);
			setImageLoading(false);
		}
	};

	const uploadS3FileMulti = async (event) => {
		try {
			const data = event;
			let generateName = "";
			let result = "CTLH";
			const characters = "0123456789";
			const charactersLength = characters.length;
			for (let i = 0; i < 9; i++) {
				generateName = result += characters.charAt(
					Math.floor(Math.random() * charactersLength),
				);
			}
			const parts = data?.name.split(".");
			const newImageName = `${generateName}.${parts[parts.length - 1]}`;
			const presignData = JSON.stringify({ fileName: newImageName });
			const config = {
				method: "post",
				maxBodyLength: Number.POSITIVE_INFINITY,
				// url: "https://api-dev.ctlhgroup.com:8081/v1/api/file/presign-url",
				// url: "https://api.ctlhgroup.com/v1/api/file/presign-url",
				url: `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/file/presign-url`,

				headers: {
					"Content-Type": "application/json",
				},
				data: presignData,
			};
			const responsePresignUrl = await axios.request(config);
			await axios({
				method: "PUT",
				url: responsePresignUrl?.data?.url,
				data: data,
				headers: {
					"Content-Type": " file/*; image/*",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
					"Access-Control-Allow-Headers":
						"Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total,
					);
				},
			});

			return newImageName;
		} catch (error) {
			console.error("File upload error:", error);
			throw error;
		}
	};

	const handleUpdateProduct = async (data) => {
		setIsSubmitting(true);
		try {
			// Start uploading all images and wait for all of them to finish
			const imageUploadPromises = additionImages.map((image) => {
				return uploadS3FileMulti(image);
			});

			const imageUrls = await Promise.all(imageUploadPromises);
			setPreSignAdditionalImage(imageUrls); // Assuming `uploadS3File` returns the URL

			const optionHasId = options.filter((option) => option?._id);
			// Foreach to update options has id via api
			for (const option of optionHasId) {
				update(
					`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product-option/${option._id}`,
					option,
					userData?.accessToken,
					() => {},
					(data) => {
						console.log(data);
					},
					(err) => {
						console.log(err);
					},
				);
			}

			const optionHasNoId = options.filter((option) => !option?._id);
			for (const option of optionHasNoId) {
				create(
					`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product-option`,
					{ ...option, product: id },
					userData?.accessToken,
					() => {},
					(data) => {
						console.log(data);
					},
					(err) => {
						console.log(err);
					},
				);
			}

			// Prepare your product data with the uploaded image URLs
			const prepareData = {
				// product: {
				...data,
				image: image,
				imageDetail: oldAdditionalImage.concat(imageUrls),
				shop: userData?.data?.shop,
				// },
				// productOptions: options,
			};

			update(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/${id}`,
				prepareData,
				userData?.accessToken,
				() => {},
				(data) => {
					console.log(data);
					toast({
						title: t("successful"),
						description: t("productUpdatedSuccessfully"),
					});

					setTimeout(() => {
						// navigate("/product-management/products-list");
						router.back();
					}, 1000);
				},
				(error) => {
					console.log(error);
					toast({
						title: t("unsuccessful"),
						description: t("somethingWentWrongPleaseTryAgain"),
					});
				},
			);
		} catch (error) {
			console.log(error);
			toast({
				title: t("imageUploadFailed"),
				description: t("pleaseTryAgain"),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteProductOptions = async (id, index) => {
		remove(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product-option/${id}`,
			userData?.accessToken,
			() => {},
			(data) => {
				console.log(data);

				removeOption(index);

				toast({
					title: t("successful"),
					description: t("optionDeletedSuccessfully"),
				});
			},
			(error) => {
				console.log(error);

				toast({
					title: t("unsuccessful"),
					description: t("somethingWentWrongPleaseTryAgain"),
					variant: "destructive",
				});
			},
		);
	};

	const handleSelectImages = (event) => {
		const files = event.target.files;
		if (files.length >= 5 || additionImages.length >= 5) {
			toast({
				title: t("cannotSelectMoreImages"),
				description: t("maximumFiveImagesAllowed"),
			});
			inputFileRef.current.files = null;
			return;
		}

		const fileArray = [];
		for (let i = 0; i < files.length; i++) {
			fileArray.push(files[i]);
		}
		setAdditionImages([...additionImages, ...fileArray]);
	};

	const handleRemoveAdditionImage = (index) => {
		const newImages = [...additionImages];
		newImages.splice(index, 1);
		inputFileRef.current.files = null;
		setAdditionImages(newImages);
	};

	const handleOptionChange = (e, optionIndex, valueIndex, field) => {
		const updatedOptions = [...options];
		if (field === "title") {
			updatedOptions[optionIndex].title = e.target.value;
		} else if (field === "value") {
			updatedOptions[optionIndex].values[valueIndex] = e.target.value;
		}
		setOptions(updatedOptions);
	};

	const addOption = () => {
		setOptions([
			...options,
			{
				// product
				title: "",
				values: [""],
			},
		]);
	};

	const addSubOption = (optionIndex) => {
		const updatedOptions = [...options];
		updatedOptions[optionIndex].values.push("");
		setOptions(updatedOptions);
	};

	const removeSubOption = (optionIndex, valueIndex) => {
		const updatedOptions = [...options];
		updatedOptions[optionIndex].values.splice(valueIndex, 1);
		setOptions(updatedOptions);
	};

	const removeOption = (optionIndex) => {
		const updatedOptions = [...options];
		updatedOptions.splice(optionIndex, 1);
		setOptions(updatedOptions);
	};

	return (
		<main className="p-4 space-y-4 overflow-y-auto h-dvh">
			<h1 className="w-full font-bold text-center">{t("editProduct")}</h1>

			<Formik
				enableReinitialize
				initialValues={{
					name: detailProduct?.name || "",
					buyPrice: detailProduct?.buyPrice || "",
					sellPrice: detailProduct?.sellPrice || "",
					description: detailProduct?.description || "",
					// qty: 0,
					categoryId: detailProduct?.categoryId || "",
					categoryName: detailProduct?.categoryName || "",
				}}
				onSubmit={(values) => {
					handleUpdateProduct(values);
				}}
			>
				{({
					values,
					handleChange,
					handleBlur,
					handleSubmit,
					errors,
					setFieldValue,
				}) => (
					<form onSubmit={handleSubmit} className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>{t("productInformation")}</CardTitle>
							</CardHeader>

							<CardContent>
								<div className="space-y-2">
									<Avatar className="w-[200px] h-[200px] rounded-md my-4 mx-auto">
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
									<Label htmlFor="picture">{t("storeProfileImage")}</Label>
									<Input
										id="picture"
										type="file"
										onChange={(event) =>
											handleUploadProductImage(event, setImage)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="name">{t("productName")}</Label>
									<Input
										id="name"
										name="name"
										type="text"
										onChange={handleChange}
										value={values.name}
										placeholder={t("productName") + "..."}
									/>
									{errors.name && (
										<small className="text-red-500">{errors.name}</small>
									)}
								</div>
								<div>
									<Label>{t("productCategory")}</Label>
									<Select
										onValueChange={(value) => {
											handleChange({ target: { name: "categoryId", value } });
											setFieldValue(
												"categoryName",
												categories?.data?.find(
													(category) => category._id === value,
												)?.name,
											);
										}}
										name="categoryId"
										id="categoryId"
										defaultValue={values.categoryId}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectProductCategory")} />
										</SelectTrigger>

										<SelectContent>
											{categories?.data?.map((category) => (
												<SelectItem key={category._id} value={category._id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="w-full gap-2 flex-center">
									<div className="w-full space-y-2">
										<Label htmlFor="buyPrice">{t("buyPrice")}</Label>
										<Input
											id="buyPrice"
											name="buyPrice"
											type="number"
											onChange={handleChange}
											value={values.buyPrice}
											placeholder={t("buyPrice") + "..."}
										/>
										{errors.buyPrice && (
											<small className="text-red-500">{errors.buyPrice}</small>
										)}
									</div>
									<div className="w-full space-y-2">
										<Label htmlFor="sellPrice">{t("sellingPrice")}</Label>
										<Input
											id="sellPrice"
											name="sellPrice"
											type="number"
											onChange={handleChange}
											value={values.sellPrice}
											placeholder={t("sellingPrice") + "..."}
										/>
										{errors.sellPrice && (
											<small className="text-red-500">{errors.sellPrice}</small>
										)}
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">{t("productDetail")}</Label>
									<Textarea
										id="description"
										name="description"
										// type=""
										onChange={handleChange}
										value={values.description}
										placeholder={t("productDetail") + "..."}
									/>
									{errors.description && (
										<small className="text-red-500">{errors.description}</small>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("productOptions")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex gap-2">
									<Checkbox
										onCheckedChange={() => setHasOption((prev) => !prev)}
										value={hasOption}
										checked={hasOption}
									/>
									<Label>{t("productHasOptions")}</Label>
								</div>
								{hasOption &&
									options.map((option, optionIndex) => (
										<div
											key={optionIndex}
											className="pb-4 my-4 space-y-2 border-b"
										>
											<div className="flex items-center w-full gap-4">
												<Input
													id={`option-${optionIndex}`}
													name={`option-${optionIndex}`}
													value={option.title}
													onChange={(e) =>
														handleOptionChange(
															e,
															optionIndex,
															undefined,
															"title",
														)
													}
													placeholder={t("options") + "..."}
													className=" border-primary"
												/>

												{option?._id ? (
													<AlertModal
														title={t("confirmDeleteOption")}
														component={
															<Button
																variant="outline"
																// onClick={() => removeOption(optionIndex)}
																className="text-red-500"
																type="button"
															>
																{t("deleteOption")}
															</Button>
														}
														desc={t("confirmDeleteOptionDescription")}
														confirmFunction={() =>
															handleDeleteProductOptions(
																option._id,
																optionIndex,
															)
														}
														confirmText={t("confirmDelete")}
													/>
												) : (
													<Button
														variant="outline"
														onClick={() => removeOption(optionIndex)}
														className="text-red-500"
														type="button"
													>
														{t("deleteOption")}
													</Button>
												)}
											</div>
											<div className="grid grid-cols-3 gap-2">
												{option.values.map((value, valueIndex) => (
													<div key={valueIndex} className="relative max-w-fit">
														<Input
															id={`value-${optionIndex}-${valueIndex}`}
															name={`value-${optionIndex}-${valueIndex}`}
															value={value}
															onChange={(e) =>
																handleOptionChange(
																	e,
																	optionIndex,
																	valueIndex,
																	"value",
																)
															}
															placeholder={t("type") + "..."}
															className="min-w-[50px]"
														/>
														<button
															onClick={() =>
																removeSubOption(optionIndex, valueIndex)
															}
															type="button"
															className="absolute -translate-y-1/2 top-1/2 right-2"
														>
															<Trash className="text-red-500" size={20} />
														</button>
													</div>
												))}
												<Button
													variant="outline"
													onClick={() => addSubOption(optionIndex)}
													type="button"
												>
													+
												</Button>
											</div>
										</div>
									))}
								{hasOption ? (
									<Button
										className="mt-6"
										type="button"
										onClick={addOption}
										variant="outline"
									>
										{t("addProductOption")} +
									</Button>
								) : null}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("additionalProductImages")}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="relative w-full flex-center h-[300px] border  rounded-md">
									{additionImages.length >= 5 ? (
										<div className="flex-col gap-3 flex-center">
											<p className="font-bold text-primary">
												{t("imagesComplete")} 5/5
											</p>
										</div>
									) : (
										<>
											<p>{t("clickToUploadProductImages")}</p>
											<input
												type="file"
												multiple
												accept="image/*"
												onChange={handleSelectImages}
												className="absolute inset-0 opacity-0 cursor-pointer"
												ref={inputFileRef}
											/>
										</>
									)}
								</div>
								<div className="grid w-full grid-cols-2 gap-4 md:grid-cols-5">
									{oldAdditionalImage?.length > 0 &&
										oldAdditionalImage?.map((image, index) => (
											<div
												key={image}
												className="relative w-full h-[190px] border"
											>
												<img
													src={process.env.NEXT_PUBLIC_S3_BUCKET + image}
													alt={image?.name}
													className="object-contain w-full h-full"
												/>
												<Trash
													className="absolute top-0 right-0 z-10 cursor-pointer text-primary"
													onClick={() =>
														setOldAdditionalImage(
															oldAdditionalImage.filter((i) => i !== image),
														)
													}
												/>
											</div>
										))}
									{additionImages?.length > 0 &&
										additionImages?.map((image, index) => (
											<div
												key={image.name}
												className="relative w-full h-[190px] border"
											>
												<img
													src={URL.createObjectURL(image)}
													alt={image.name}
													className="object-contain w-full h-full"
												/>
												<Trash
													className="absolute top-0 right-0 z-10 cursor-pointer text-primary"
													onClick={() => handleRemoveAdditionImage(index)}
												/>
											</div>
										))}
								</div>
							</CardContent>
						</Card>

						<section className="w-full gap-4 flex-center ">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => router.back()}
							>
								{t("cancel")}
							</Button>
							<Button
								disabled={isSubmitting}
								type="submit"
								className="w-full font-bold text-white"
							>
								{t("save")}
								{isSubmitting ? <DotSpinner /> : null}
							</Button>
						</section>
					</form>
				)}
			</Formik>
		</main>
	);
}
