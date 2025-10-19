"use client";
import { useState, useEffect } from "react";
import { Link } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import {
	ArrowLeft,
	HelpCircle,
	Users,
	Store,
	ShoppingCart,
	Truck,
	CheckCircle,
	Wallet,
	CreditCard,
	AlertCircle,
	PhoneCall,
	Clock,
	DollarSign,
	Package,
	Trash2,
	Shield,
	ChevronDown,
	ChevronUp,
	Sparkles,
} from "lucide-react";

// UI
import Footer from "@/components/Home/Footer";

export default function Help({ params }) {
	const { id } = params;
	const t = useTranslations("");

	const [expandedSection, setExpandedSection] = useState(null);

	const toggleSection = (sectionId) => {
		setExpandedSection(expandedSection === sectionId ? null : sectionId);
	};

	const processSteps = [
		{
			id: 1,
			title: "การลงทะเบียนสมาชิก",
			icon: Users,
			color: "from-blue-500 to-blue-600",
			description: "ใช้หมายเลขโทรศัพท์หรืออีเมลในการลงทะเบียนบัญชีสมัครเป็นสมาชิก",
		},
		{
			id: 2,
			title: "การเปิดร้านค้า",
			icon: Store,
			color: "from-green-500 to-green-600",
			description: 'กดใส่ "ฉันต้องการเปิดร้านค้า" → กรอกข้อมูลการสมัครส่วนบุคคลหรือข้อมูลการสมัครขององค์กร → "เปิดร้านค้า" → รอการตรวจสอบระบบ',
		},
		{
			id: 3,
			title: "ศูนย์จัดซื้อ",
			icon: ShoppingCart,
			color: "from-purple-500 to-purple-600",
			description: "หลังจากเปิดร้านสำเร็จ เลือกสินค้าที่คุณต้องการขาย และสามารถ 'ลบสินค้า' ที่คุณไม่ต้องการขายได้",
		},
		{
			id: 4,
			title: "การส่งสินค้า",
			icon: Truck,
			color: "from-orange-500 to-orange-600",
			description: "ดูหรือชำระเงินสำหรับสินค้าที่ลูกค้าซื้อในร้านค้าของคุณ",
		},
		{
			id: 5,
			title: "การรับสินค้า",
			icon: CheckCircle,
			color: "from-teal-500 to-teal-600",
			description: "ตรวจสอบว่าลูกค้าได้รับสินค้าแล้วหรือไม่",
		},
		{
			id: 6,
			title: "ยอดร้านค้า",
			icon: DollarSign,
			color: "from-yellow-500 to-yellow-600",
			description: "หลังจากที่ลูกค้าได้รับสินค้า เงินต้นทุนและค่าคอมมิชชั่นจะถูกส่งคืนให้กับคุณ",
		},
		{
			id: 7,
			title: "กำไรรวม",
			icon: Sparkles,
			color: "from-pink-500 to-pink-600",
			description: "กำไรรวมของร้านค้าของคุณจากวันที่เปิดร้านจะเพิ่มขึ้นอยู่อีกช่องให้เราเห็นตลอด",
		},
		{
			id: 8,
			title: "การโอนยอดคงเหลือ",
			icon: Wallet,
			color: "from-indigo-500 to-indigo-600",
			description: "เติมเงินเพื่อโอนยอดร้านค้าของคุณไปยังบัญชีสมาชิก ซึ่งสามารถใช้ชำระตามค่าสั่งซื้อของลูกค้าหรือถอนเงินได้",
		},
		{
			id: 9,
			title: "วิธีการเติมเงิน",
			icon: CreditCard,
			color: "from-emerald-500 to-emerald-600",
			description: "รองรับการชำระเงินดอลลาร์สหรัฐ และการโอนเงินผ่านธนาคารของแต่ละประเทศ โปรดติดต่อฝ่ายบริการลูกค้าออนไลน์",
		},
		{
			id: 10,
			title: "การถอนเงิน",
			icon: Package,
			color: "from-red-500 to-red-600",
			description: "ผูกบัตรธนาคารหรือที่อยู่การรับสกุลเงินดอลลาร์สหรัฐ",
		},
	];

	const faqs = [
		{
			id: 1,
			question: "ลูกค้ามาจากที่ไหน?",
			answer: "สวัสดีค่ะ ห้างสรรพสินค้าของเราเป็นบริษัทใหญ่ของประเทศสวีเดนและ IKEA มีสาขาทั่วโลกมากกว่า 460 สาขา ในกว่า 60 ประเทศทั่วโลก ในเครือของ IKEA SHOP และลูกค้าของเรามาจากห้างสรรพสินค้า IKEA SHOP เป็นหลัก",
			icon: Users,
		},
		{
			id: 2,
			question: "สินค้าจะส่งถึงมือลูกค้าเมื่อไหร่?",
			answer: "สวัสดีค่ะ ทางห้างสนับสนุนผู้ค้ารายใหม่ โดยผู้ผลิตจะรับประกันการจัดส่งหรือสั่งซื้อของในร้านค้าใหม่ การจะส่งถึงมือลูกค้าโดยผู้ค้าสามารถรับเงินต้นทุนและค่าคอมมิชชั่นได้ทันที ออเดอร์แรกการจัดส่งสินค้าใช้เวลา 24 ชั่วโมง ส่วนออเดอร์ต่อไปสินค้าจะส่งถึงมือลูกค้าภายใน 3-7 วันและจัดส่งถึงลูกค้าภายใน 7-14 วัน ในช่วงวันหยุด ขึ้นกับระยะทางที่ลูกค้าอยู่ด้วยค่ะ ถ้าสินค้าถึงลูกค้าทางบริษัทจะแจ้งให้ทราบโดยทันทีค่ะ",
			icon: Truck,
		},
		{
			id: 3,
			question: "ใช้เวลานานแค่ไหนในการเติมเงินและถอนเงิน?",
			answer: "สวัสดีค่ะ เนื่องจากมีผู้ค้าจำนวนมากการเติมเงินและถอนเงินจำเป็นต้องจัดติดต่อกัน และต้องได้รอตามคิว ทางการเงินจะดำเนินการภายใน 15 นาที",
			icon: Clock,
		},
		{
			id: 4,
			question: "ทำไมลูกค้าชำระหรือจ่ายเงินแล้วห้างสรรพสินค้าต้องจ่ายเงินอีก?",
			answer: "สวัสดีค่ะ เพื่อป้องกันไม่ให้ห้างสรรพสินค้าบางรายไม่ส่งสินค้าให้กับลูกค้าเงินที่ลูกค้าจ่ายจะถูกเก็บไว้ที่บริษัทและยังสะดวกสำหรับบริษัทในการคืนเงินให้กับลูกค้าโดยตรงเมื่อต้องการคืนสินค้า ดังนั้นห้างสรรพสินค้าจำเป็นต้องจ่ายกับผู้ผลิตหรือบริษัทในการจัดส่งสินค้า เมื่อลูกค้าได้รับสินค้าแล้วผู้ผลิตหรือบริษัทจะคืนเงินที่ห้างสรรพสินค้าจ่ายให้กับลูกค้า พร้อมด้วยกำไรให้กับห้างสรรพสินค้า (เงินต้นทุนและค่าคอมมิชชั่นจะถูกเครดิตไว้ที่ในเวลาเดียวกัน)",
			icon: DollarSign,
		},
		{
			id: 5,
			question: "เปิดห้างสรรพสินค้าต้องสต๊อกสินค้าไหม?",
			answer: "สวัสดีค่ะ ไม่จำเป็นต้องสต๊อกสินค้าเพื่อเปิดร้าน สินค้าเป็นการจัดหาโดยตรงจากผู้ผลิตและผู้ค้าจะต้องเลือกรูปถ่ายของสินค้าที่จะขายในตะกร้าเท่านั้น",
			icon: Package,
		},
		{
			id: 6,
			question: "ขอปิดร้านได้ไหม?",
			answer: "สวัสดีค่ะ ห้างสรรพสินค้าต้องชำระเงินสำหรับค่าสั่งซื้อทั้งหมดเพื่อจัดส่งให้กับลูกค้าก่อนที่จะเสนอเพื่อจะขอปิดร้านค้าของคุณ",
			icon: Store,
		},
		{
			id: 7,
			question: "ถ้าไม่จ่ายสินค้าจะมีผลเสียหายไหม?",
			answer: "ถ้าหากลูกค้าไม่มาชำระสินค้าภายใน 24 ชั่วโมง ร้านของลูกค้าจะเสียเครดิตและร้านที่เชิญมาจะได้รับความเสียหายด้วย",
			icon: AlertCircle,
		},
		{
			id: 8,
			question: "ถ้าลบสินค้าจะเป็นอะไรไหม?",
			answer: "สวัสดีค่ะ ถ้าหากลูกค้าลบสินค้าโดยไม่แจ้งให้บริษัททราบถือว่าผิดกฎของบริษัทอย่างร้ายแรง ต้องแจ้งให้ทางบริษัททราบก่อนถึงจะสามารถลบสินค้าได้ค่ะ!",
			icon: Trash2,
		},
	];

	return (
		<div className="flex flex-col w-full h-dvh">
			<section className="relative flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 scroll-smooth">
				{/* Header */}
				<div className="sticky top-0 z-10 border-b border-red-100 shadow-sm bg-white/95 backdrop-blur-md">
					<div className="flex items-center gap-4 px-4 py-4">
						<Link href={`/profile/${id}`} className="flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-full hover:bg-red-50">
							<ArrowLeft className="w-5 h-5 text-gray-600" />
						</Link>
						<div className="flex-1">
							<h1 className="text-xl font-bold text-gray-800">ช่วยเหลือ!</h1>
							<p className="text-sm text-gray-500">คู่มือการใช้งาน และคำถามที่พบบ่อย</p>
						</div>
						<a
							href="https://line.me/ti/p/jLKF6aZaYc"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
						>
							<PhoneCall className="w-4 h-4" />
							<span>ติดต่อเรา</span>
						</a>
					</div>
				</div>

				{/* Content */}
				<div className="px-4 pb-20">
					{/* Introduction */}
					<div className="py-6 mb-6 text-center border shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl border-white/20">
						<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-r from-red-500 to-pink-500">
							<HelpCircle className="w-8 h-8 text-white" />
						</div>
						<h2 className="mb-2 text-2xl font-bold text-gray-800">ยินดีต้อนรับสู่ IKEA SHOP</h2>
						<p className="max-w-2xl mx-auto mb-4 leading-relaxed text-gray-600">
							เราเป็นห้างสรรพสินค้าระดับโลกที่มีความร่วมมือกับผู้ผลิตทั่วโลก
							คุณสามารถเปิดร้านในห้างของเราเพื่อช่วยผู้ผลิตจำหน่ายสินค้า
							และได้รับค่าคอมมิชชั่น 20%-35% ของเงินต้นทุน
						</p>
						<div className="max-w-3xl mx-auto">
							<div className="p-4 text-left border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
								<h3 className="mb-3 text-lg font-semibold text-blue-800">🏢 เกี่ยวกับ IKEA</h3>
								<p className="mb-2 text-sm leading-relaxed text-blue-700">
									สรรพสินค้าของเรามีความร่วมมือกับผู้ผลิตทั่วโลกและได้มีการเซ็นสัญญากัน
									ลูกค้าของเรามาจากทั่วทุกมุมโลก มีสาขาทั่วโลกมากกว่า 460 สาขา ในกว่า 60 ประเทศ
								</p>
								<p className="text-sm leading-relaxed text-blue-700">
									🎯 <strong>ข้อแตกต่างหลัก:</strong> คุณไม่จำเป็นต้องสต๊อกสินค้า ไม่ต้องแบกรับค่าใช้จ่ายใดๆ
									หลังจากเปิดร้านแล้วเลือกสินค้าที่คุณต้องการขายในศูนย์การจัดซื้อ
									เมื่อลูกค้าสั่งซื้อ คุณติดต่อบริษัทเพื่อจัดส่งสินค้า
								</p>
							</div>
						</div>
					</div>

					{/* Process Steps */}
					<div className="mb-8">
						<h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-gray-800">
							<div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-purple-500">
								<Shield className="w-4 h-4 text-white" />
							</div>
							กระบวนการทำงาน
						</h3>
						<div className="grid gap-4">
							{processSteps.map((step, index) => {
								const IconComponent = step.icon;
								return (
									<div key={step.id} className="relative">
										<div className="flex items-start gap-4 p-6 transition-all duration-200 border shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl border-white/30 hover:shadow-xl">
											<div className={`flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl shadow-lg bg-gradient-to-r ${step.color}`}>
												<IconComponent className="w-6 h-6 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 mb-2">
													<span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full bg-gradient-to-r ${step.color}`}>
														{step.id}
													</span>
													<h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
												</div>
												<p className="leading-relaxed text-gray-600">{step.description}</p>
											</div>
										</div>
										{index < processSteps.length - 1 && (
											<div className="flex justify-center my-2">
												<ChevronDown className="w-5 h-5 text-gray-400" />
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* Key Benefits */}
					<div className="p-6 mb-8 border shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl border-white/20">
						<h3 className="flex items-center gap-3 mb-4 text-xl font-bold text-gray-800">
							<Sparkles className="w-6 h-6 text-yellow-600" />
							จุดเด่นของระบบ
						</h3>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-gradient-to-r from-green-400 to-green-500">
									<CheckCircle className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-800">ไม่ต้องสต๊อกสินค้า</h4>
									<p className="text-sm text-gray-600">เลือกสินค้าจากศูนย์จัดซื้อเท่านั้น</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500">
									<DollarSign className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-800">ค่าคอมมิชชั่นสูง</h4>
									<p className="text-sm text-gray-600">20% - 35% ของเงินต้นทุน</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-gradient-to-r from-purple-400 to-purple-500">
									<Truck className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-800">ไม่มีค่าขนส่ง</h4>
									<p className="text-sm text-gray-600">ผู้ผลิตรับผิดชอบการขนส่งโดยตรง</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-gradient-to-r from-red-400 to-red-500">
									<Shield className="w-4 h-4 text-white" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-800">รับประกันคุณภาพ</h4>
									<p className="text-sm text-gray-600">ห้างรับประกันการให้บริการ</p>
								</div>
							</div>
						</div>
					</div>

					{/* FAQ Section */}
					<div>
						<h3 className="flex items-center gap-3 mb-6 text-xl font-bold text-gray-800">
							<div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md bg-gradient-to-r from-orange-500 to-red-500">
								<HelpCircle className="w-4 h-4 text-white" />
							</div>
							คำถามที่พบบ่อย
						</h3>
						<div className="space-y-3">
							{faqs.map((faq) => (
								<div key={faq.id} className="overflow-hidden border shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl border-white/30">
									<button
										onClick={() => toggleSection(faq.id)}
										className="flex items-center justify-between w-full p-6 text-left transition-all duration-200 hover:bg-white/50"
									>
										<div className="flex items-center gap-4">
											<div className="flex items-center justify-center w-10 h-10 shadow-md rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
												<faq.icon className="w-5 h-5 text-white" />
											</div>
											<h4 className="text-lg font-semibold text-gray-800">{faq.question}</h4>
										</div>
										{expandedSection === faq.id ? (
											<ChevronUp className="flex-shrink-0 w-5 h-5 text-gray-500" />
										) : (
											<ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-500" />
										)}
									</button>
									{expandedSection === faq.id && (
										<div className="px-6 pb-6">
											<div className="p-4 border border-orange-100 ml-14 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
												<p className="leading-relaxed text-gray-700">{faq.answer}</p>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Contact Section */}
					<div className="p-6 mt-8 text-center border shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl border-white/20">
						<h3 className="mb-3 text-xl font-bold text-gray-800">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
						<p className="mb-4 text-gray-600">ทีมงานของเราพร้อมให้บริการ 24/7</p>
						<a
							href="https://line.me/ti/p/jLKF6aZaYc"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-3 px-6 py-3 text-lg font-semibold text-white transition-all duration-200 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
						>
							<PhoneCall className="w-5 h-5" />
							ติดต่อฝ่ายบริการลูกค้า
						</a>
					</div>
				</div>
			</section>

			<div className="h-[65px] flex-shrink-0">
				<Footer />
			</div>
		</div>
	);
}
