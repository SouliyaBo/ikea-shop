/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/navigation";
import { Formik } from "formik";
import React from "react";
import { create } from "@/helpers";

export default function page() {
	const router = useRouter();
	// const dataLocal = JSON.parse(localStorage.getItem("PHONE"))
	const dataLocal =
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("PHONE"))
			: null;

	const handleGoBack = () => {
		router.replace("/profile");
	};

	const handleLogin = (values) => {
		try {
			create(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/auth/forget-password`,
				{ ...values, code: dataLocal?.registerCode },
				"",
				() => {},
				(data) => {
					// localStorage.setItem(USER_DATA, JSON.stringify(data));
					router.replace("/login");
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
				<h1 className="text-xl font-semibold mt-[60px]">ເຂົ້າສູ່ລະບົບ</h1>
			</div>
			<Formik
				enableReinitialize
				initialValues={{
					phone: dataLocal?.phone,
					password: "",
					confirm_password: "",
				}}
				validate={(values) => {
					const errors = {};
					if (!values.phone) errors.phone = "ກະລຸນາປ້ອນ";
					if (!values.password) errors.password = "ກະລຸນາປ້ອນ";
					if (!values.confirm_password) errors.confirm_password = "ກະລຸນາປ້ອນ";

					if (values.password && values.confirm_password) {
						if (values.password !== values.confirm_password) {
							errors.password = "ລະຫັດຜ່ານບໍ່ຕົງກັນ";
							errors.confirm_password = "ລະຫັດຜ່ານບໍ່ຕົງກັນ";
						}
					}
					return errors;
				}}
				onSubmit={async (values) => {
					values.confirm_password = undefined;
					handleLogin(values);
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
								ເບີໂທລະສັບ
							</label>
							<div className="flex mb-3">
								<div className="flex-1 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg">
									20
								</div>
								<input
									type="phone"
									disabled
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
						<div className="mb-4">
							<label
								className="block mb-2 text-sm font-bold text-gray-700"
								for="password"
							>
								ລະຫັດຜ່ານ
							</label>
							<input
								type="password"
								value={values.password}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${
									errors?.password && touched.password
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
								for="confirm-password"
							>
								ຢືນຢັນລະຫັດຜ່ານ
							</label>
							<input
								type="password"
								value={values.confirm_password}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`${
									errors?.confirm_password && touched.confirm_password
										? "border-red-500 "
										: "border-gray-300 "
								}appearance-none block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white`}
								placeholder="**********"
								id="confirm-password"
								name="confirm_password"
							/>
						</div>
						<button
							onClick={handleSubmit}
							className="w-full h-12 px-6 font-semibold text-white rounded-md bg-primary"
							type="button"
						>
							ເຂົ້າສູ່ລະບົບ
						</button>
					</form>
				)}
			</Formik>
		</div>
	);
}
