/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
// Helpers
import { create } from "@/helpers";
import { USER_DATA } from "@/constants";
import { countries } from "@/constants/country";
import { IS_TESTING_MODE, getSessionDuration } from "@/config/testConfig";

export default function Login() {
	const router = useRouter();
	const t = useTranslations("");
	const [selectedCountry, setSelectedCountry] = useState({ id: "66", code: "+66", flag: "🇹🇭", name: "ไทย" });
	// Effects
	useEffect(() => {
		localStorage.clear();
	}, []);

	const handleGoBack = () => {
		router.replace("/profile");
	};

	const handleLogin = (values) => {
		create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/login-website`,
			values,
			"",
			() => { },
			(data) => {
				console.log("data", data);
				// เพิ่ม loginTime ลงใน userData
				const userDataWithTime = {
					...data,
					loginTime: new Date().getTime(),
					lastActivity: new Date().getTime()
				};
				localStorage.setItem(USER_DATA, JSON.stringify(userDataWithTime));
				
				// แสดงข้อมูลการทดสอบ
				if (IS_TESTING_MODE) {
					const sessionDuration = getSessionDuration();
					console.log(`🧪 โหมดทดสอบ: Session จะหมดอายุใน ${sessionDuration / 1000} วินาที`);
				}
				
				router.replace("/");
			},
			(error) => {
				console.log("error:: ", error);
				// ใช้ alert ธรรมดาแทน SweetAlert เพื่อป้องกัน SSR error
				alert("ไม่สำเร็จ!\n\nกรุณาลองใหม่อีกครั้ง");
			},
		);
	};


	return (
		<div className="relative w-full h-screen p-6">
			<Button
				onClick={() => handleGoBack()}
				className=" w-[50px] h-[50px] rounded-full flex-center absolute text-white left-4 top-4"
			>
				<ChevronLeft size={38} />
			</Button>
			<div className="flex-center">
				<h1 className="text-xl font-semibold mt-[60px]">{t("login")}</h1>
				{IS_TESTING_MODE && (
					<div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
						🧪 โหมดทดสอบ: Session หมดอายุใน {getSessionDuration() / 1000} วินาที
					</div>
				)}
			</div>
			<Formik
				enableReinitialize
				initialValues={{
					phone: "",
					password: "",
				}}
				validate={(values) => {
					const errors = {};
					if (!values.phone) errors.phone = t("pleaseEnter");
					if (!values.password) errors.password = t("pleaseEnter");

					return errors;
				}}
				onSubmit={async (values) => {
					const newValue = { ...values };
					newValue.phone = `${selectedCountry?.id}${newValue.phone}`;
					handleLogin(newValue);
				}}
			>
				{({
					values,
					errors,
					touched,
					handleChange,
					handleSubmit,
					handleBlur,
				}) => (
					<form className="mt-[40px]">
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="phone"
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
						{/* <div className="mb-4">
							<div>
								<a
									href="/request-otp"
									className="italic text-blue-500 underline cursor-pointer"
								>
									{t("forgotPassword")}
								</a>
							</div>
						</div> */}
						<button
							onClick={handleSubmit}
							className="w-full h-12 px-6 font-semibold text-white rounded-md bg-primary"
							type="button"
						>
							{t("login")}
						</button>
					</form>
				)}
			</Formik>
		</div>
	);
}
