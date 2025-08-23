// UI
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import AllProduct from "@/components/Home/AllProduct";

export default function Home() {
	return (
		<main className="flex flex-col w-full h-dvh">
			<div style={{ height: 60 }}>
				<Header />
			</div>
			<div style={{ height: "calc(100% - 9% - 50px)" }}>
				<AllProduct />
			</div>
			<div className="h-[9%]">
				<Footer />
			</div>
		</main>
	);
}
