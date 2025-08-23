/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import { Button } from "@/components/ui/button";

// Constants and Helpers
import { PHONE } from "@/constants";
import { create } from "@/helpers";

export default function page() {
	const t = useTranslations("");
	const router = useRouter();

	const handleGoBack = () => {
		router.replace("/profile");
	};

	const handleLogin = (value) => {
		localStorage.setItem(PHONE, JSON.stringify(value));

		try {
			create(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/request-otp`,
				{ phone: value.phone },
				"",
				() => {},
				(data) => {
					if (data?.error === false) {
						router.push("/request-otp/verify-otp");
					}
				},
				(error) => {
					console.log("error:: ", error?.response?.data?.message);
				},
			);
		} catch (error) {
			console.log(error);
		}
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
				<h1 className="text-xl font-semibold mt-[60px]">{t("requestOTP")}</h1>
			</div>
			<Formik
				enableReinitialize
				initialValues={{
					phone: "",
				}}
				validate={(values) => {
					const errors = {};
					if (!values.phone) errors.phone = "ກະລຸນາປ້ອນ";
				}}
				onSubmit={async (values) => {
					const newValue = { ...values };
					newValue.phone = `20${newValue.phone}`;
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
								<div className="flex-1 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg">
									20
								</div>
								<input
									type="phone"
									className={`${
										errors?.phone && touched.phone
											? "border-red-500 "
											: "border-gray-300 "
									}appearance-none block w-full text-gray-700 border rounded-r-lg py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
									value={values.phone}
									onChange={handleChange}
									onBlur={handleBlur}
									id="phone"
									name="phone"
									maxLength={8}
									placeholder="XXXX-XXXX"
								/>
							</div>
						</div>
						<button
							onClick={handleSubmit}
							className="w-full h-12 px-6 font-semibold text-white rounded-md bg-primary"
							type="button"
						>
							{t("continue")}
						</button>
					</form>
				)}
			</Formik>
		</div>
	);
}
