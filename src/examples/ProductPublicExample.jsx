// ตัวอย่างการใช้งานใน public page (เช่น หน้าแสดงสินค้า)
// ไฟล์นี้แสดงวิธีการดึงข้อมูลสินค้าโดยไม่ต้องใช้ authentication

"use client";
import { useState, useEffect } from "react";
import { get } from "@/helpers";

const ProductPublicExample = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// ดึงข้อมูลสินค้าโดยไม่ต้องใช้ token
		// เนื่องจาก /v1/api/product เป็น public endpoint
		get(
			`${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product`,
			null, // ไม่ส่ง token
			setLoading,
			(data) => {
				setProducts(data?.data || []);
			},
			(error) => {
				console.error("Error loading products:", error);
			}
		);
	}, []);

	if (loading) {
		return <div>Loading products...</div>;
	}

	return (
		<div>
			<h1>สินค้าทั้งหมด (ไม่ต้อง Login)</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{products.map((product) => (
					<div key={product.id} className="border p-4 rounded">
						<h2>{product.name}</h2>
						<p>{product.description}</p>
						<p className="font-bold">{product.price} บาท</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProductPublicExample;
