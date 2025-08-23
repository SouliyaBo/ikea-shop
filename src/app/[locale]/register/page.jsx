"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// UI
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import DotSpinner from "@/components/DotSpinner";
import SweetAlert from "@/components/SweetAlert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

// Helpers and Constants
import { DATA_REGISTER } from "@/constants";
import { create } from "@/helpers";
import { countries } from "@/constants/country";

function RegisterChild() {
	const t = useTranslations("");
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [paramInviteCode, setParamInviteCode] = useState();
	const [selectedCountry, setSelectedCountry] = useState({ id: "66", code: "+66", flag: "🇹🇭", name: "ไทย" });

	// const [acceptTerm, setAcceptTerm] = useState(false);
	const { toast } = useToast();

	const searchParams = useSearchParams();

	useEffect(() => {
		setParamInviteCode(searchParams.get("code"));
	}, [searchParams]);

	const handleGoBack = () => {
		router.back();
	};

	const handleRegister = (values) => {
		try {
			localStorage.setItem(DATA_REGISTER, JSON.stringify(values));
			setLoading(true);
			create(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/register`,
				{
					...values,
				},
				"",
				() => { },
				(data) => {
					localStorage.removeItem(DATA_REGISTER);

					toast({
						title: "สำเร็จ",
						description: "ลงทะเบียนสำเร็จ.",
					});
					setLoading(false);
					router.push("/login");
					// handleLogin();
				},
				(error) => {
					console.log("error:: ", error?.response?.data);
					setLoading(false);
					if (error?.response?.data?.errorCode === "PHONE_ALREADY_EXIST") {
						SweetAlert({
							icon: "error",
							title: "ไม่สำเร็จ!",
							text: "มีผู้ใช้งานแล้ว.",
						});
					}
				},
			);
		} catch (error) {
			console.log(error);
			setLoading(false);
			SweetAlert({
				icon: "error",
				title: "ไม่สำเร็จ!",
				text: "กรุณาลองใหม่อีกครั้ง.",
			});
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
					router.push("/register/verify-otp");
				}
			},
			(error) => {
				SweetAlert({
					icon: "error",
					title: "ไม่สำเร็จ!",
					text: "กรุณาลองใหม่อีกครั้ง.",
				});
			},
		);
	};

	return (
		<div className="relative w-full p-6 overflow-y-auto h-dvh ">
			<Button
				onClick={() => handleGoBack()}
				className=" w-[50px] h-[50px] rounded-full flex-center absolute text-white left-4 top-4"
			>
				<ChevronLeft size={38} />
			</Button>
			<div className="flex-center">
				<h1 className="text-xl font-semibold mt-[60px]">{t("register")}</h1>
			</div>
			<Formik
				enableReinitialize
				initialValues={{
					firstName: "",
					lastName: "",
					gender: "MALE",
					role: "CUSTOMER",
					phone: "",
					email: "",
					memberShopName: "",
					password: "",
					inviteCodeL1: paramInviteCode ?? "",
					village: "",
					district: "",
					province: "",
					vipLevel: "0"
				}}
				validate={(values) => {
					const errors = {};
					if (!values.firstName) errors.firstName = "กรุณากรอกข้อมูล";
					if (!values.lastName) errors.lastName = "กรุณากรอกข้อมูล";
					if (!values.phone) errors.phone = "กรุณากรอกข้อมูล";
					if (values.role === "MEMBER") {
						if (!values.memberShopName) errors.memberShopName = "กรุณากรอกข้อมูล";
					}
					if (!values.password) errors.password = "กรุณากรอกข้อมูล";
					if (!values.province) errors.province = "กรุณากรอกข้อมูล";
					if (!values.district) errors.district = "กรุณากรอกข้อมูล";
					if (!values.village) errors.village = "กรุณากรอกข้อมูล";

					return errors;
				}}
				onSubmit={async (values) => {
					const newValue = { ...values };
					newValue.phone = `${selectedCountry?.id}${newValue.phone}`;
					handleRegister(newValue);
				}}
			>
				{({
					values,
					errors,
					touched,
					handleChange,
					handleSubmit,
					handleBlur,
					setFieldValue,
				}) => (
					<form className="mt-[40px]">
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="firstName"
							>
								{t("firstName")}
							</label>
							<input
								type="text"
								value={values.firstName}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.firstName && touched.firstName
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("firstName")}...`}
								id="firstName"
								name="firstName"
							/>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="lastName"
							>
								{t("lastName")}
							</label>
							<input
								type="text"
								value={values.lastName}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.lastName && touched.lastName
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("lastName")}...`}
								id="lastName"
								name="lastName"
							/>
						</div>
						<div className="mb-4">
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
								className={`${errors?.province && touched.province
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("province")}...`}
								id="province"
								name="province"
							/>
						</div>
						<div className="mb-4">
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
								className={`${errors?.district && touched.district
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("district")}...`}
								id="district"
								name="district"
							/>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="village"
							>
								{t("village")}
							</label>
							<input
								type="text"
								value={values.village}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.village && touched.village
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("village")}...`}
								id="village"
								name="village"
							/>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="lastName"
							>
								{t("gender")}
							</label>
							<div className="flex items-center gap-10">
								<div className="flex items-center">
									<input
										type="radio"
										className="w-5 h-5 border border-2 border-gray-300 rounded-full appearance-none checked:bg-primary checked:border-transparent"
										value="MALE"
										name="gender"
										checked={values.gender === "MALE" ? true : false}
										onChange={handleChange}
										onBlur={handleBlur}
										id="male"
									/>
									<label htmlFor="male" className="ml-2">
										{t("male")}
									</label>
								</div>
								<div className="flex items-center">
									<input
										type="radio"
										className="w-5 h-5 border border-2 border-gray-300 rounded-full appearance-none checked:bg-primary checked:border-transparent"
										value="FEMALE"
										name="gender"
										checked={values.gender === "FEMALE" ? true : false}
										onChange={handleChange}
										onBlur={handleBlur}
										id="female"
									/>
									<label htmlFor="female" className="ml-2">
										{t("female")}
									</label>
								</div>
							</div>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="userType"
							>
								{t("userType")}
							</label>
							<div className="flex items-center gap-10">
								<div className="flex items-center">
									<input
										type="radio"
										className="w-5 h-5 border border-2 border-gray-300 rounded-full appearance-none checked:bg-primary checked:border-transparent"
										value="CUSTOMER"
										name="role"
										checked={values.role === "CUSTOMER" ? true : false}
										onChange={handleChange}
										onBlur={handleBlur}
										id="role"
									/>
									<label htmlFor="customer" className="ml-2">
										{t("customer")}
									</label>
								</div>
								<div className="flex items-center">
									<input
										type="radio"
										className="w-5 h-5 border border-2 border-gray-300 rounded-full appearance-none checked:bg-primary checked:border-transparent"
										value="MEMBER"
										name="role"
										checked={values.role === "MEMBER" ? true : false}
										onChange={handleChange}
										onBlur={handleBlur}
										id="role"
									/>
									<label htmlFor="member" className="ml-2">
										{t("OpenYourShopNow")}
									</label>
								</div>
							</div>
						</div>
						{values.role === "MEMBER" ? (
							<div className="mb-4">
								<label
									className="block mb-2 text-sm font-bold text-gray-700"
									for="nameTheShop"
								>
									{t("nameTheShop")}
								</label>
								<input
									type="text"
									value={values.memberShopName}
									onChange={handleChange}
									onBlur={handleBlur}
									className={`${errors?.memberShopName && touched.memberShopName
										? "border-red-500 "
										: "border-gray-300 "
										}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
									placeholder="Ikea Shop"
									id="memberShopName"
									name="memberShopName"
								/>
							</div>
						) : null}


						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								htmlFor="phone"
							>
								{t("phone")}
							</label>
							<div className="flex mb-3">
								<Select
									value={selectedCountry.id}
									onValueChange={(value) => {
										const country = countries.find(c => c.id === value);
										setSelectedCountry(country);
									}}
								>
									<SelectTrigger className="w-24 rounded-r-none border-r-0 h-[46px] flex items-center"> {/* Added h-[46px] to match input height */}
										<SelectValue placeholder="+66" />
									</SelectTrigger>
									<SelectContent className="max-h-[300px]">
										{countries.map((country) => (
											<SelectItem key={country.id} value={country.id}>
												<span className="flex items-center gap-2">
													<span>{country.flag}</span>
													<span>{country.code}</span>
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<input
									type="phone"
									className={`${errors?.phone && touched.phone
										? "border-red-500 "
										: "border-gray-300 "
										}appearance-none block w-full text-gray-700 border rounded-r-lg py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
									value={values.phone}
									onChange={handleChange}
									onBlur={handleBlur}
									id="phone"
									name="phone"
									maxLength={10}
									placeholder="xxxxx-xxxxx"
								/>
							</div>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="email"
							>
								{t("email")}
							</label>
							<input
								type="email"
								value={values.email}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.email && touched.email
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder="abc@gmail.com"
								id="email"
								name="email"
							/>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="password"
							>
								{t("password")}
							</label>
							<input
								type="password"
								value={values.password}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.password && touched.password
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder="**********"
								id="password"
								name="password"
							/>
						</div>
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="password"
							>
								{t("inviteCode")}
							</label>
							<input
								type="text"
								value={values.inviteCodeL1}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${errors?.inviteCodeL1 && touched.inviteCodeL1
									? "border-red-500 "
									: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder={`${t("inviteCode")}...`}
								id="inviteCodeL1"
								name="inviteCodeL1"
								disabled={!!paramInviteCode}
							/>
						</div>

						<button
							onClick={handleSubmit}
							className="w-full h-12 gap-2 px-6 font-semibold text-white rounded-md flex-center bg-primary disabled:bg-slate-700"
							type="button"
							disabled={loading}
						>
							{t("register")}
							{loading && <DotSpinner />}
						</button>
					</form>
				)}
			</Formik>
		</div>
	);
}

export default function Register() {
	return (
		<Suspense>
			<RegisterChild />
		</Suspense>
	);
}
