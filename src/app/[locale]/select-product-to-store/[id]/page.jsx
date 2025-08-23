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
import { ChevronLeft, Store } from "lucide-react";
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
        <div className="relative w-full overflow-y-auto h-dvh">
            <section className="w-full h-[100%] overflow-y-auto">
                <div className="relative py-8 flex-center">
                    <Button className="absolute left-4 w-[50px] h-[50px] rounded-full bg-transparent border text-black">
                        <Link href={`/profile/${id}`}>
                            <ChevronLeft size={38} />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">{showProductShop ? t("productsInTheStore") : t("selectProductsToAddToYourStore")}</h1>
                    <div onClick={() => handleShowProduct()} className="absolute right-4 underline cursor-pointer text-black"><Store /></div>
                </div>

                <div>
                    {loading ? (
                        <div className="h-[50vh] flex-center">
                            <Loader />
                        </div>
                    ) : products?.total === 0 ? (
                        <div className="flex-col h-full gap-2 flex-center">
                            <EmptyCartPlaceholder />

                        </div>
                    ) : showProductShop === false ? (
                        <div className="flex-col w-full gap-8 px-4 flex-center">
                            {products?.data?.map((product) => (
                                <Link
                                    key={product?._id}
                                    className=""
                                    href={`/product-store/${product?._id}`}
                                >
                                    <div
                                        key={product?._id}
                                        className="flex w-full gap-2 pb-2 border-b "
                                    >
                                        <div className="relative w-[120px] h-[120px]">
                                            <Image
                                                src={
                                                    product?.image && product?.image !== ""
                                                        ? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + product?.image
                                                        : "/images/SD-default-image.png"
                                                }
                                                alt={product?.productName}
                                                fill
                                                sizes="100%"
                                                className="object-contain "
                                                unoptimized
                                            />

                                        </div>
                                        <div className="flex flex-col items-start flex-1 ">
                                            <h1 className="font-bold">
                                                {product?.name}
                                            </h1>
                                            {/* <p>
                                            {t("quantity")}: {product?.qty}
                                        </p> */}
                                            <p>
                                                {t("wholesalePrice")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(product?.buyPrice)}
                                                </span>
                                            </p>
                                            <p>
                                                {t("sellingPrice")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(product?.sellPrice)}
                                                </span>
                                            </p>
                                            <p>
                                                {t("profit")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(product?.sellPrice - product?.buyPrice)}
                                                </span>
                                            </p>

                                            {/* <p>{moment(product?.createdAt).format("DD/MM/YYYY HH:mm")}</p> */}
                                        </div>
                                        <Button onClick={(e) => handleAddToCart(e, product?._id)} className="gap-3 -mb-4 text-white flex-between 
    w-full  /* Full width of container */
    min-w-[60px] max-w-[200px]  /* Min/max constraints */
    text-[clamp(0.75rem,2vw,1.25rem)]  /* Fluid text size */
    px-[clamp(0.5rem,2vw,1.5rem)]  /* Fluid padding */
    py-[clamp(0.25rem,1vw,0.75rem)]"
                                        >
                                            <img
                                                src="/images/cart-plus.svg"
                                                alt="cart"
                                                className="w-6 h-6"
                                            />
                                            <p>{t("add")}</p>
                                        </Button>
                                    </div>
                                </Link>
                            ))}

                        </div>
                    ) : (
                        <div className="flex-col w-full gap-8 px-4 flex-center">
                            {productShops?.data?.map((item) => (
                                <Link
                                    key={item?._id}
                                    href={`/product-store/${item?.product?._id}`}
                                >
                                    <div
                                        key={item?.product?._id}
                                        className="flex w-full gap-2 pb-2 border-b "
                                    >
                                        <div className="relative w-[120px] h-[120px]">
                                            <Image
                                                src={
                                                    item?.product?.image && item?.product?.image !== ""
                                                        ? process.env.NEXT_PUBLIC_MEDIUM_RESIZE + item?.product?.image
                                                        : "/images/SD-default-image.png"
                                                }
                                                alt={item?.product?.productName}
                                                fill
                                                sizes="100%"
                                                className="object-contain "
                                                unoptimized
                                            />

                                        </div>
                                        <div className="flex flex-col items-start flex-1 ">
                                            <h1 className="font-bold">
                                                {item?.product?.name}
                                            </h1>
                                            <p>
                                                {t("wholesalePrice")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(item?.product?.buyPrice)}
                                                </span>
                                            </p>
                                            <p>
                                                {t("sellingPrice")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(item?.product?.sellPrice)}
                                                </span>
                                            </p>
                                            <p>
                                                {t("profit")}:{" "}
                                                <span className="font-semibold text-primary">
                                                    {formatToCurrencyTHB(item?.product?.sellPrice - item?.product?.buyPrice)}
                                                </span>
                                            </p>

                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )

                    }
                </div>
            </section>
            {/* <div className="w-full h-[10%]">
                <OrderFooter total={products?.total} amount={products?.totalAmount} />
            </div> */}
        </div>
    );
}
