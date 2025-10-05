"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";

// Third Party
import { useTranslations } from "next-intl";

// UI
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
// Icons
import {
	ChevronLeft,
	Store,
	ShoppingCart,
	Package,
	DollarSign,
	TrendingUp,
	Eye,
	Plus,
	Archive,
	Sparkles
} from "lucide-react";
import EmptyCartPlaceholder from "@/components/Cart/EmptyCartPlaceholder";
import Loader from "@/components/Loader";

// Constants and Helpers
import { gets, create } from "@/helpers";
import { formatToCurrencyTHB } from "@/helpers/currencyDisplay";

export default function SelectProductToStore({ params }) {
    const { id } = params;
    const t = useTranslations("");
    const { toast } = useToast();
    const USER_DATA =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("USER_DATA"))
            : null;
    const TOKEN = USER_DATA?.accessToken;
    const [products, setProducts] = useState(null);
    const [productShops, setProductShops] = useState(null);
    const [showProductShop, setShowProductShop] = useState(false);

    // Event Trigger
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        gets(
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/product/sale`, {
            limit: 1000,
        },
            TOKEN,
            setLoading,
            (data) => {
                setProducts(data?.data);
                setLoading(false);
            },
            (err) => {
                console.log(err);
                setLoading(false);
            },
        );

        gets(
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-shop-product?user=${id}`, {
            limit: 1000
        },
            TOKEN,
            setLoading,
            (data) => {
                setProductShops(data?.data);
                setLoading(false);
            },
            (err) => {
                console.log(err);
                setLoading(false);
            },
        );
    }, [id, TOKEN]);
    const handleShowProduct = () => {
        setShowProductShop(!showProductShop)
    }
    const handleAddToCart = (e, productId) => {
        e.preventDefault();
        if (USER_DATA?.data === null || USER_DATA?.data === undefined) {
            toast({
                title: "ไม่สำเร็จ",
                description: (
                    <div className="flex flex-col">
                        <p>กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อน</p>
                        <Button
                            onClick={() => router.push("/profile")}
                            variant="outline"
                            className="text-black"
                        >
                            เข้าสู่ระบบหรือสมัครสมาชิก
                        </Button>
                    </div>
                ),

                variant: "destructive",
            });

            return;
        }

        create(
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-shop-product`,
            {
                product: productId,
                vipCode: USER_DATA?.data?.vipCode,
                user: USER_DATA?.data?._id
            },
            TOKEN,
            () => { },
            (data) => {
                if (data?.error === false) {
                    toast({
                        title: "สำเร็จ",
                        description: "สินค้าได้ถูกเพิ่มไปยังร้านค้าของคุณแล้ว",
                    });
                }
            },
            (error) => {
                if (error?.response?.data?.error === true)
                    toast({
                        title: "ไม่สำเร็จ",
                        description: "กรุณาลองใหม่อีกครั้ง",
                        variant: "destructive",
                    });
                console.log("error:: ", error);
            },
        );

    };

    return (
        <div className="relative w-full overflow-y-auto h-dvh bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="relative flex items-center px-4 py-3">
                    <Button className="w-8 h-8 p-0 text-gray-700 bg-gray-100 border-0 rounded-full hover:bg-gray-200">
                        <Link href={`/profile/${id}`}>
                            <ChevronLeft size={20} />
                        </Link>
                    </Button>
                    <div className="flex-1 text-center">
                        <h1 className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900">
                            {showProductShop ? (
                                <>
                                    <Archive className="w-4 h-4 text-blue-500" />
                                    สินค้าในร้าน
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4 text-green-500" />
                                    เลือกสินค้าเข้าร้าน
                                </>
                            )}
                        </h1>
                    </div>
                    <Button
                        onClick={handleShowProduct}
                        className="w-8 h-8 p-0 text-gray-700 bg-gray-100 border-0 rounded-full hover:bg-gray-200"
                    >
                        {showProductShop ? <ShoppingCart size={20} /> : <Store size={20} />}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 pb-20">
                {loading ? (
                    <div className="h-[50vh] flex items-center justify-center">
                        <Loader />
                    </div>
                ) : products?.total === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
                        <EmptyCartPlaceholder />
                        <div className="text-center">
                            <h3 className="mb-1 text-base font-semibold text-gray-900">ไม่มีสินค้า</h3>
                            <p className="text-sm text-gray-500">ยังไม่มีสินค้าให้เลือก</p>
                        </div>
                    </div>
                ) : showProductShop === false ? (
                    <div className="space-y-3">
                        {/* Info Banner */}
                        <div className="p-4 border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900">เลือกสินค้าเข้าร้านของคุณ</h3>
                                    <p className="text-sm text-blue-700">คลิกปุ่มเพิ่มเพื่อนำสินค้าเข้าร้าน</p>
                                </div>
                            </div>
                        </div>

                        {products?.data?.map((product) => (
                            <div
                                key={product?._id}
                                className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-blue-200"
                            >
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 overflow-hidden rounded-lg shadow-sm bg-gray-50">
                                        <Image
                                            src={
                                                product?.image && product?.image !== ""
                                                    ? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
                                                    : "/images/SD-default-image.png"
                                            }
                                            alt={product?.name}
                                            fill
                                            sizes="96px"
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex flex-col flex-1 gap-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product?.name}</h3>

                                        {/* Price Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="p-2 text-center rounded-lg bg-blue-50">
                                                <div className="text-xs text-blue-600">ราคาทุน</div>
                                                <div className="text-sm font-bold text-blue-900">
                                                    {formatToCurrencyTHB(product?.buyPrice)}
                                                </div>
                                            </div>
                                            <div className="p-2 text-center rounded-lg bg-green-50">
                                                <div className="text-xs text-green-600">ราคาขาย</div>
                                                <div className="text-sm font-bold text-green-900">
                                                    {formatToCurrencyTHB(product?.sellPrice)}
                                                </div>
                                            </div>
                                            <div className="p-2 text-center rounded-lg bg-purple-50">
                                                <div className="text-xs text-purple-600">กำไร</div>
                                                <div className="text-sm font-bold text-purple-900">
                                                    {formatToCurrencyTHB(product?.sellPrice - product?.buyPrice)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-2">
                                            <Link
                                                href={`/product-store/${product?._id}`}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-8 text-xs border-gray-300 hover:bg-gray-50"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    ดูรายละเอียด
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={(e) => handleAddToCart(e, product?._id)}
                                                className="h-8 px-4 text-xs text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                เพิ่มเข้าร้าน
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Store Products Banner */}
                        <div className="p-4 border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                                    <Archive className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-900">สินค้าในร้านของคุณ</h3>
                                    <p className="text-sm text-purple-700">สินค้าที่คุณได้เลือกเข้าร้านแล้ว</p>
                                </div>
                            </div>
                        </div>

                        {productShops?.data?.map((item) => (
                            <div
                                key={item?._id}
                                className="p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-purple-200"
                            >
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 overflow-hidden rounded-lg shadow-sm bg-gray-50">
                                        <Image
                                            src={
                                                item?.product?.image && item?.product?.image !== ""
                                                    ? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + item?.product?.image
                                                    : "/images/SD-default-image.png"
                                            }
                                            alt={item?.product?.name}
                                            fill
                                            sizes="96px"
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                        {/* In Store Badge */}
                                        <div className="absolute top-1 right-1">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                                                <Store className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex flex-col flex-1 gap-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item?.product?.name}</h3>

                                        {/* Price Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="p-2 text-center rounded-lg bg-blue-50">
                                                <div className="text-xs text-blue-600">ราคาทุน</div>
                                                <div className="text-sm font-bold text-blue-900">
                                                    {formatToCurrencyTHB(item?.product?.buyPrice)}
                                                </div>
                                            </div>
                                            <div className="p-2 text-center rounded-lg bg-green-50">
                                                <div className="text-xs text-green-600">ราคาขาย</div>
                                                <div className="text-sm font-bold text-green-900">
                                                    {formatToCurrencyTHB(item?.product?.sellPrice)}
                                                </div>
                                            </div>
                                            <div className="p-2 text-center rounded-lg bg-purple-50">
                                                <div className="text-xs text-purple-600">กำไร</div>
                                                <div className="text-sm font-bold text-purple-900">
                                                    {formatToCurrencyTHB(item?.product?.sellPrice - item?.product?.buyPrice)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <div className="mt-2">
                                            <Link
                                                href={`/product-store/${item?.product?._id}`}
                                                className="w-full"
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-8 text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    ดูรายละเอียด
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* In Store Status */}
                                        <div className="flex items-center gap-1 px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded-full w-fit">
                                            <Store className="w-3 h-3" />
                                            อยู่ในร้านแล้ว
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
