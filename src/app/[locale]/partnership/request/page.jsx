"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";

// Third Party
import clsx from "clsx";

// Component
import Footer from "@/components/Home/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

// Helper
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";
import { create, uploadS3File, gets } from "@/helpers";

export default function RequestPartnership() {
	const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
	const ACCESS_TOKEN = USER_DATA?.accessToken;

	const searchParams = useSearchParams();
	const router = useRouter();
	const [selectedPackage, setSelectedPackage] = useState(1);
	const [packages, setPackages] = useState([
		{
			id: 1,
			price: 5000,
			commission: 3,
		},
		{
			id: 2,
			price: 10000,
			commission: 5,
		},
		{
			id: 3,
			price: 30000,
			commission: 7,
		},
		{
			id: 4,
			price: 50000,
			commission: 10,
		},
		{
			id: 5,
			price: 200000,
			commission: 15,
		},
		{
			id: 6,
			price: 500000,
			commission: 20,
		},
		{
			id: 7,
			price: 1000000,
			commission: 30,
		},
	]);

	const [userId, setUserId] = useState("");
	const [paymentHistory, setPaymentHistory] = useState(null);

	const [isAgreement, setIsAgreement] = useState(false);
	const [slip, setSlip] = useState("");
	const [imageLoading, setImageLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(false);

	// Effect
	useEffect(() => {
		if (searchParams.get("userId")) {
			const userId = searchParams.get("userId");

			setUserId(userId);

			gets(
				`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/top-up-history`,
				{
					userId: userId,
				},
				ACCESS_TOKEN,
				setDataLoading,
				(res) => {
					const data = res?.data?.data;

					setPaymentHistory(data);
				},
				(err) => {
					console.log(err);
				},
			);
		}
	}, [searchParams, ACCESS_TOKEN]);

	useEffect(() => {
		if (paymentHistory?.length > 0) {
			const latestPaymentApproved = paymentHistory.find(
				(item) => item.status === "APPROVED",
			);

			const canUpgradePackages = packages.filter(
				(item) => item.price > latestPaymentApproved?.topUpAmount,
			);

			setPackages(canUpgradePackages);
		}
	}, [paymentHistory]);

	// function
	const handleUploadImage = async (event) => {
		setImageLoading(true);
		const imageUrl = await uploadS3File(event);
		if (imageUrl) {
			setSlip(imageUrl);
		}

		setImageLoading(false);
	};

	const handleRequesting = async () => {
		const packagePlan = packages.find((item) => item.id === selectedPackage);

		const data = {
			topUpAmount: packagePlan.price,
			billTopUpImage: slip,
			userId: USER_DATA?.data?._id,
		};

		await create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/register-member`,
			data,
			ACCESS_TOKEN,
			setLoading,
			(data) => {

				router.push("/partnership/pending");
			},
			(error) => {
				console.log("error:: ", error?.response?.data?.data?.message);
			},
		);
	};

	const handleUpgradePackage = async () => {
		const packagePlan = packages.find((item) => item.id === selectedPackage);

		const data = {
			topUpAmount: packagePlan.price,
			billTopUpImage: slip,
			userId: USER_DATA?.data?._id,
		};

		await create(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/member-top-up`,
			data,
			ACCESS_TOKEN,
			setLoading,
			(data) => {
				router.push("/partnership/pending");
			},
			(error) => {
				console.log("error:: ", error?.response?.data?.data?.message);
			},
		);
	};

	return (
		<main className="h-dvh">
			<section className="h-[92%]  flex-col py-8 overflow-scroll">
				<h1 className="w-full text-2xl font-bold text-center">
					{userId ? "การอัปเกรด Partner" : "การสมัครเป็น Partner"}
				</h1>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					// data-name="Layer 1"
					dataName="Layer 1"
					className="w-[200px] h-[200px] mx-auto"
					viewBox="0 0 746 721.34323"
					xmlnsXlink="http://www.w3.org/1999/xlink"
				>
					<title>Request</title>
					<path
						d="M907.60236,809.95184v-72.34S935.794,788.89781,907.60236,809.95184Z"
						transform="translate(-227 -89.32838)"
						fill="#f1f1f1"
					/>
					<path
						d="M909.34383,809.93912l-53.28962-48.92125S912.8994,774.9334,909.34383,809.93912Z"
						transform="translate(-227 -89.32838)"
						fill="#f1f1f1"
					/>
					<path
						d="M721.38766,408.51766,438.60244,573.79556a4.32611,4.32611,0,0,1-5.91113-1.55023L250.842,261.107a4.32609,4.32609,0,0,1,1.55022-5.91112L535.17747,89.918a4.3261,4.3261,0,0,1,5.91112,1.55023l181.8493,311.13836A4.3261,4.3261,0,0,1,721.38766,408.51766Z"
						transform="translate(-227 -89.32838)"
						fill="#fff"
					/>
					<path
						d="M721.38766,408.51766,438.60244,573.79556a4.32611,4.32611,0,0,1-5.91113-1.55023L250.842,261.107a4.32609,4.32609,0,0,1,1.55022-5.91112L535.17747,89.918a4.3261,4.3261,0,0,1,5.91112,1.55023l181.8493,311.13836A4.3261,4.3261,0,0,1,721.38766,408.51766ZM253.26442,256.68812a2.59553,2.59553,0,0,0-.93013,3.54668L434.18358,571.37315a2.59553,2.59553,0,0,0,3.54668.93014l282.78522-165.2779a2.59552,2.59552,0,0,0,.93014-3.54667L539.59632,92.34036a2.59553,2.59553,0,0,0-3.54668-.93014Z"
						transform="translate(-227 -89.32838)"
						fill="#3f3d56"
					/>
					<path
						d="M435.03979,287.67306l-70.1367,40.99241a4.32609,4.32609,0,0,1-5.91112-1.55023l-40.99241-70.1367a4.32608,4.32608,0,0,1,1.55023-5.91112l70.1367-40.99241a4.32609,4.32609,0,0,1,5.91112,1.55023L436.59,281.76194A4.32608,4.32608,0,0,1,435.03979,287.67306ZM320.422,252.55969a2.59552,2.59552,0,0,0-.93014,3.54667l40.99241,70.1367a2.59552,2.59552,0,0,0,3.54667.93014l70.1367-40.99241a2.59552,2.59552,0,0,0,.93014-3.54667l-40.99241-70.1367a2.59552,2.59552,0,0,0-3.54667-.93014Z"
						transform="translate(-227 -89.32838)"
						fill="#f2f2f2"
					/>
					<path
						d="M419.90917,308.028l-70.1367,40.99241a3.89341,3.89341,0,0,1-5.32-1.39521l-40.99241-70.1367a3.89342,3.89342,0,0,1,1.39521-5.32l70.1367-40.99241a3.89342,3.89342,0,0,1,5.32,1.39521l40.99241,70.1367A3.89342,3.89342,0,0,1,419.90917,308.028Z"
						transform="translate(-227 -89.32838)"
						fill="#ffb543"
					/>
					<path
						d="M589.19632,255.13236,369.83258,383.34266a3.889,3.889,0,0,1-3.9248-6.71522l219.36373-128.2103a3.889,3.889,0,0,1,3.92481,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M549.73949,309.2249l-166.38813,97.248a3.889,3.889,0,0,1-3.92481-6.71522l166.38814-97.24795a3.889,3.889,0,1,1,3.9248,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M538.736,170.509l-96.99757,56.69163a3.889,3.889,0,0,1-3.92481-6.71521l96.99757-56.69163A3.889,3.889,0,0,1,538.736,170.509Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M528.04745,207.78755l-72.79026,42.54331a3.889,3.889,0,0,1-3.92481-6.71522l72.79026-42.54331a3.889,3.889,0,0,1,3.92481,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M616.23386,301.39274,396.87013,429.603a3.889,3.889,0,0,1-3.92481-6.71522l219.36374-128.2103a3.889,3.889,0,0,1,3.9248,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M576.777,355.48528l-166.38814,97.248a3.889,3.889,0,1,1-3.9248-6.71522l166.38813-97.24795a3.889,3.889,0,1,1,3.92481,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M643.27141,347.65312,423.90767,475.86342a3.889,3.889,0,0,1-3.9248-6.71522L639.3466,340.9379a3.889,3.889,0,0,1,3.92481,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M656.79018,370.78331,437.42645,498.9936a3.889,3.889,0,1,1-3.92481-6.71521l219.36374-128.2103a3.889,3.889,0,1,1,3.9248,6.71522Z"
						transform="translate(-227 -89.32838)"
						fill="#ccc"
					/>
					<path
						d="M585.85233,460.8263a84.70308,84.70308,0,0,0,8.2014-11.47053c2.16171-3.64878,4.2824-7.55,4.759-11.82932a11.68306,11.68306,0,0,0-3.49862-9.98546,8.22181,8.22181,0,0,0-9.64609-1.09646,9.80894,9.80894,0,0,0-4.923,8.75985,12.959,12.959,0,0,0,5.53588,9.81385c6.48388,4.69765,16.60994,4.4522,23.52077.87731,7.784-4.02657,11.80578-14.56146,5.69036-21.77281-1.272-1.4999-3.38871.17627-3.07005,1.79433a8.72086,8.72086,0,0,0,17.279-2.13545l-2.7491,1.60676a20.99018,20.99018,0,0,0,20.87922-2.23986,19.4701,19.4701,0,0,0,3.90715-3.77622c1.34569-1.75547,3.60614-2.88981,5.43647-4.15451l13.19043-9.11411c1.94021-1.34062.09538-4.53543-1.86081-3.18378l-11.946,8.25429c-1.99075,1.37553-3.99447,2.73415-5.973,4.12714-1.4144.9958-2.28466,2.60338-3.57157,3.78591a17.28811,17.28811,0,0,1-18.25191,3.08747,1.86585,1.86585,0,0,0-2.7491,1.60675,5.0482,5.0482,0,0,1-10.02595,1.18765l-3.07006,1.79434c3.94506,4.652,1.31808,11.78725-3.22684,14.90874-5.08283,3.49093-12.59333,4.09689-18.32272,1.92692a10.81086,10.81086,0,0,1-6.365-5.84005,6.44305,6.44305,0,0,1,1.462-7.373,4.62265,4.62265,0,0,1,6.427-.06854,8.269,8.269,0,0,1,2.19083,7.45928c-.5909,3.69454-2.63337,7.10141-4.53329,10.257a78.797,78.797,0,0,1-7.337,10.21716c-1.52123,1.80027,1.10343,4.39464,2.64071,2.57538Z"
						transform="translate(-227 -89.32838)"
						fill="#ffb543"
					/>
					<path
						d="M618.59271,548.50763a8.67233,8.67233,0,0,1,.872,1.051l40.84857-.99946,4.76541-8.70792,14.08178,5.47419-6.93809,16.23551a6.59134,6.59134,0,0,1-6.8516,3.95362l-46.15126-5.57517a8.64875,8.64875,0,1,1-.62683-11.43176Z"
						transform="translate(-227 -89.32838)"
						fill="#ffb7b7"
					/>
					<polygon
						points="524.753 707.256 511.322 707.256 504.932 655.449 524.755 655.45 524.753 707.256"
						fill="#ffb7b7"
					/>
					<path
						d="M755.17806,809.60436l-43.308-.00161V809.055a16.85758,16.85758,0,0,1,16.85668-16.8564h.00107l26.451.00107Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<polygon
						points="402.792 706.958 390.441 701.681 404.916 651.529 423.145 659.317 402.792 706.958"
						fill="#ffb7b7"
					/>
					<path
						d="M627.82776,809.60436l-39.826-17.014.21518-.50375a16.85759,16.85759,0,0,1,22.12325-8.87963l.001.00042,24.3243,10.39164Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<polygon
						points="459.468 470.402 458.496 486.141 486.887 489.179 516.593 492.358 507.849 468.459 459.468 470.402"
						fill="#ffb7b7"
					/>
					<path
						d="M684.60236,575.67162l-11.02912-76.88748,19.11648-6.26508,5.61475-7.7001,27.32289,1.61686,4.01137,8.98546,14.56924,6.88423-2.239,41.58174,1.63341,34.78437Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M677.66064,555.06728l-19.44456-7.77975.08288-.346c.08348-.3488,8.35927-34.93247,9.45817-40.48989,1.14475-5.79,5.3269-7.39073,5.50452-7.4559l.12974-.04788,7.69528,2.34222,3.37955,26.55448Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M639.79576,787.18106l-25.88371-5.30948,41.36969-114.1538,14.15862-38.93618s8.9802-31.21887,13.03747-43.30013l2.44851-16.21028,57.96181,6.41562s16.18859,23.77448,11.27061,62.52545l2.22432,145.65037L730.49937,785.19,708.819,638.29442l-38.05126,80.5271s-11.99335,34.36378-20.57424,41.81214Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M719.64415,581.093a8.67278,8.67278,0,0,1,1.36357.07512L748.0481,550.5344l-3.14545-9.415,13.58853-6.60419,7.18819,16.12634a6.59137,6.59137,0,0,1-1.75929,7.71237l-35.46688,30.052a8.64875,8.64875,0,1,1-8.80905-7.31289Z"
						transform="translate(-227 -89.32838)"
						fill="#ffb7b7"
					/>
					<path
						d="M745.8896,553.5156l-11.2798-26.53276,4.39939-18.48144,4.74015-5.9887a2.73032,2.73032,0,0,1,2.19377.02051c1.74821.70363,3.23693,2.86,4.42494,6.40951l10.57114,30.11085Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M687.36746,474.98733V454.98412a26.8043,26.8043,0,0,1,53.6086,0v20.00321a3.60464,3.60464,0,0,1-3.60058,3.60058H690.968A3.60463,3.60463,0,0,1,687.36746,474.98733Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<circle cx="481.66375" cy="369.1419" r="19.65197" fill="#ffb7b7" />
					<path
						d="M681.0262,456.58438a21.22738,21.22738,0,0,1,21.20341-21.2034h4.00083a21.22721,21.22721,0,0,1,21.20321,21.2034v.40006H718.979l-2.88366-8.07473-.57666,8.07473H711.1492l-1.45492-4.07409-.29106,4.07409h-28.377Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M706.72972,480.8373a3.54728,3.54728,0,0,1-.28188-3.76623c4.23955-8.06379,10.17546-22.96384,2.29646-32.15282l-.5663-.66026h22.87359v34.34145l-20.77892,3.66621a3.67755,3.67755,0,0,1-.63721.05626A3.58611,3.58611,0,0,1,706.72972,480.8373Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<polygon
						points="212.904 695.94 225.042 700.278 247.551 655.523 229.636 649.121 212.904 695.94"
						fill="#9f616a"
					/>
					<path
						d="M432.60236,795.92854l5.62164-15.7298,23.90478,8.54334a16.197,16.197,0,0,1,9.79011,20.67889l-.17712.49491Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<polygon
						points="291.836 707.946 304.726 707.945 310.859 658.226 291.834 658.227 291.836 707.946"
						fill="#9f616a"
					/>
					<path
						d="M515.54791,793.06587l25.3854-.001h.001a16.1777,16.1777,0,0,1,16.178,16.17747v.52571l-41.56364.00154Z"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M489.45887,479.62865l5.60594-11.07722s20.884,5.23229,22.78254,17.3361Z"
						transform="translate(-227 -89.32838)"
						fill="#f1f1f1"
					/>
					<polygon
						points="239.328 516.96 254.573 602.034 214.093 673.622 238.276 683.085 279.282 613.691 284.539 594.765 287.693 693.599 309.503 692.937 319.502 600.65 303.464 514.857 239.328 516.96"
						fill="#2f2e41"
					/>
					<path
						d="M495.26738,626.39974c-22.39644,0-36.61635-4.28374-36.93491-4.35151l-.5157-.10986L469.4823,567.8526l.5252-49.88931c0-21.14145,13.91444-36.728,15.84531-38.16653a9.09551,9.09551,0,0,1,4.83743-5.94508c4.64131-2.10593,10.313.421,10.55173.52982l17.02328,6.38248.08009.23616c.2051.60478,22.62721,74.21379,22.62721,74.21379s-1.35707,64.315-1.83016,66.422C539.14239,621.6359,507.71147,626.39974,495.26738,626.39974Z"
						transform="translate(-227 -89.32838)"
						fill="#3f3d56"
					/>
					<circle cx="285.4768" cy="352.72704" r="23.00821" fill="#9f616a" />
					<polygon
						points="259.823 432.715 300.076 488.877 306.02 462.65 259.823 432.715"
						opacity="0.2"
					/>
					<path
						d="M613.02352,560.25673a9.87366,9.87366,0,0,1-14.82487-3.07339l-34.64668,5.5456,7.506-16.61679,31.75033-2.71866a9.92718,9.92718,0,0,1,10.21526,16.86324Z"
						transform="translate(-227 -89.32838)"
						fill="#9f616a"
					/>
					<polygon
						points="345.842 455.838 358.291 454.617 361.741 471.983 346.076 472.26 345.842 455.838"
						fill="#f1f1f1"
					/>
					<path
						d="M583.04706,567.36242l-60.96976-5.42884L491.29145,512.973l-.09483-.4327a16.85541,16.85541,0,0,1,31.4666-11.28612l18.072,35.25105,36.47268,5.51312Z"
						transform="translate(-227 -89.32838)"
						fill="#3f3d56"
					/>
					<path
						d="M492.87889,462.03183l19.09695.68547c1.16406.04178,4.32334-12.521,4.7369-15.12708a7.11274,7.11274,0,0,1,7.41971-5.754c1.42953.135,5.03429-2.53568,8.754-5.69809,7.062-6.00388,6.69461-17.28005-1.063-22.35333q-.318-.208-.62428-.37983c-4.89391-2.73917-10.61888-3.659-16.22678-3.72917-5.08371-.06358-10.31154.57628-14.79018,2.98249-8.02926,4.31383-12.3024,13.74076-12.67776,22.84774s2.5442,18.012,5.85721,26.50324"
						transform="translate(-227 -89.32838)"
						fill="#2f2e41"
					/>
					<path
						d="M971.60236,810.67162H228a1,1,0,0,1,0-2H972a1,1,0,0,1,1,1C973,810.22386,972.15461,810.67162,971.60236,810.67162Z"
						transform="translate(-227 -89.32838)"
						fill="#cbcbcb"
					/>
				</svg>

				<div className="flex flex-col max-w-[80%] mx-auto w-full my-4 gap-3">
					{packages.map((item, index) => (
						<div
							onKeyDown={() => {}}
							onClick={() => setSelectedPackage(item.id)}
							key={index}
							className={clsx(
								"flex gap-3 p-4  shadow-lg rounded-2xl cursor-pointer",
								selectedPackage === item.id
									? "border-2 border-primary"
									: "bg-white",
							)}
						>
							<div
								className={clsx(
									selectedPackage === item.id
										? "bg-primary text-white"
										: "text-black",
									"h-6 w-6 flex items-center justify-center rounded-full ",
								)}
							>
								{item.id}
							</div>
							<div className="flex-1">
								<p>ราคา: {formatToCurrencyTHB(item.price)}</p>
								<p>commission: {item.commission} %</p>
							</div>
						</div>
					))}
				</div>

				<div className="flex items-center gap-2 my-4 max-w-[80%] mx-auto w-full">
					<Checkbox
						id="agreement"
						name="agreement"
						checked={isAgreement}
						onCheckedChange={(value) => setIsAgreement(value)}
					/>
					<Label htmlFor="agreement">ยอมรับเงื่อนไขการสมัคร Partner</Label>
				</div>

				{isAgreement ? (
					<div className="w-[300px] h-[300px] relative mx-auto border border-primary">
						<Image fill src={"/images/bank-qr.jpg"} />
					</div>
				) : null}

				{slip ? (
					<div className="flex items-center justify-center w-full mt-2">
						<Dialog>
							<DialogTrigger>
								<Button variant="outline" className="mx-auto">
									ดูสลิป
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>สลิป</DialogTitle>

									<Image
										width={300}
										height={300}
										className="object-contain w-full h-full"
										src={process.env.NEXT_PUBLIC_S3_BUCKET + slip}
									/>
								</DialogHeader>
							</DialogContent>
						</Dialog>
					</div>
				) : null}

				{!imageLoading ? (
					<div className="grid w-full mx-auto my-4 max-w-sm items-center gap-1.5">
						<Label htmlFor="picture">อัพโหลดสลิป</Label>
						<Input
							disabled={!isAgreement}
							id="picture"
							type="file"
							onChange={handleUploadImage}
						/>
					</div>
				) : (
					<p className="w-full mx-auto my-8 text-center">กำลังอัพโหลดสลิป...</p>
				)}

				<div className="flex items-center justify-center w-full">
					<Button
						disabled={!isAgreement || !slip || loading || !selectedPackage}
						onClick={() => {
							userId !== undefined
								? handleUpgradePackage()
								: handleRequesting();
						}}
					>
						{loading ? "กำลังสมัคร..." : "สมัครเป็น Partner"}
					</Button>
				</div>
			</section>
			<section className="h-[8%]">
				<Footer />
			</section>
		</main>
	);
}
