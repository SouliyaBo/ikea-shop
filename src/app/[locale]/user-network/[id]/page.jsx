"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

// Third Party
import moment from "moment";
import { useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";

// Icons
import {
	ChevronLeft,
	CircleUser,
	CircleChevronDown,
	Workflow,
} from "lucide-react";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, get } from "@/helpers";
import numberFormat from "@/helpers/numberFormat";
import DisplayDate from "@/helpers/displayDate";

export default function UserNetwork({ params }) {
	const { id } = params;
	const t = useTranslations("");
	const [userToken, setUserToken] = useState(null);
	const [networkList, setNetworkList] = useState([]);
	const [childList, setChildList] = useState([]);

	// Event Trigger
	const [loading, setLoading] = useState(false);
	const [selectedChild, setSelectedChild] = useState(null);

	useEffect(() => {
		const USER_DATA =
			typeof window !== "undefined"
				? JSON.parse(localStorage.getItem("USER_DATA"))
				: null;

		setUserToken(USER_DATA?.accessToken);
	}, []);

	useEffect(() => {
		if (userToken && id) {
			get(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user?inviteCodeL1User=${id}`,
				userToken,
				() => {},
				(res) => {
					setNetworkList(res.data?.data);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [id, userToken]);

	const findChildMember = (id) => {
		setChildList(null);

		if (id === selectedChild) {
			setSelectedChild(null);
			return;
		}

		setSelectedChild(id);
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user?inviteCodeL1User=${id}`,
			userToken,
			() => {},
			(res) => {
				setChildList(res.data?.data);
			},
			(err) => {
				console.log(err);
			},
		);
	};

	return (
		<div className="relative w-full overflow-y-auto h-dvh">
			<section className="w-full h-[90%] overflow-y-auto">
				<div className="relative py-8 flex-center">
					<Button className="absolute left-4 w-[45px] h-[45px] rounded-full bg-transparent border text-black">
						<Link href={`/profile/${id}`}>
							<ChevronLeft size={28} />
						</Link>
					</Button>
					<h1 className="text-lg font-semibold">{t("network")}</h1>
				</div>
				<div>
					{loading ? (
						<div className="h-[50vh] flex-center">
							<Loader />
						</div>
					) : networkList?.length === 0 ? (
						<div className="flex-col h-full gap-2 flex-center">
							<EmptyCartPlaceholder />
							{/* <h2 className="text-xl font-bold">ຍັງບໍ່ມີທີມ</h2> */}
						</div>
					) : (
						<div className="flex-col w-full gap-4 px-4 flex-center">
							{networkList?.map((item) => (
								<div
									key={item?._id}
									// className="w-full p-4 space-y-2 text-center rounded-md shadow "
									className={`w-full p-4 space-y-2 text-center ${
										selectedChild === item?._id
											? "bg-gradient-to-r from-red-400 to-red-500"
											: "bg-white "
									} rounded-md shadow-xl`}
									onClick={() => findChildMember(item?._id)}
									onKeyDown={() => {}}
								>
									<div className="relative gap-2 flex-center">
										<div className="w-[60px] relative h-[60px] flex-center rounded-full overflow-hidden">
											{item?.image ? (
												<Image
													src={
														process.env.NEXT_PUBLIC_SMALL_RESIZE + item?.image
													}
													alt="profile"
													className="object-cover w-full h-full"
													fill
													sizes="100%"
													unoptimized
												/>
											) : (
												<CircleUser className="w-[50px] h-[50px] text-primary" />
											)}
										</div>
										<div className="flex-1 h-full text-left">
											<h3
												className={`${
													selectedChild === item?._id
														? "text-white font-bold"
														: "text-black"
												}`}
											>
												{item?.firstName} {item?.lastName}
											</h3>
											<small
												className={`${
													selectedChild === item?._id
														? "text-white"
														: "text-gray-500"
												}`}
											>
												{t("registrationDate")}:{" "}
												{item?.createdAt ? DisplayDate(item?.createdAt) : "-"}
											</small>
										</div>
										<div className="absolute right-2">
											<CircleChevronDown className="text-gray-300" />
										</div>
									</div>
									{childList?.length > 0 && selectedChild === item?._id ? (
										<div className="space-y-2 border-l ml-[9%]">
											{childList?.map((child) => (
												<div
													className="gap-2 p-2 rounded-md ml-[10%] bg-white/70 flex-center "
													key={child?._id}
												>
													<div className="w-[50px] h-[50px] flex-center rounded-full relative overflow-hidden">
														{child?.image ? (
															<Image
																src={
																	process.env.NEXT_PUBLIC_SMALL_RESIZE +
																	child?.image
																}
																alt="profile"
																className="object-cover w-full h-full"
																fill
																sizes="100%"
																unoptimized
															/>
														) : (
															<CircleUser className="w-[40px] h-[40px] text-gray-500" />
														)}
													</div>
													<div className="flex-1 h-full text-left">
														<h3 className="text-black text-[14px]">
															{child?.firstName} {child?.lastName}
														</h3>
														<small className="text-gray-500 text-[12px]">
															{t("registrationDate")}:{" "}
															{child?.createdAt
																? DisplayDate(child?.createdAt)
																: "-"}
														</small>
													</div>
												</div>
											))}
										</div>
									) : childList?.length <= 0 && selectedChild === item?._id ? (
										<div className="w-full gap-4 pt-4 text-gray-300 border-t flex-center">
											<Workflow size={28} />
											{/* <p>ບໍ່ມີຂໍ້ມູນ</p> */}
										</div>
									) : null}
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
