"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft, Headset } from "lucide-react";

// UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// Constants and Helpers
import { USER, IMG_PREFIX_S3 } from "@/constants/api";
import { create, get, uploadS3File } from "@/helpers";
import DotSpinner from "@/components/DotSpinner";
import { useToast } from "@/components/ui/use-toast";

export default function TopUp({ params }) {
    const { id } = params;
    const t = useTranslations("");
    const router = useRouter();
    const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
    const ACCESS_TOKEN = USER_DATA.accessToken;
    const [userBank, setUserBank] = useState(null);
    const { toast } = useToast();

    // Event Trigger
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [newImage, setNewImage] = useState(false);

    // Use Effect
    useEffect(() => {
        get(
            // `${USER}/${id}`,
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user-bank?user=${id}`,
            ACCESS_TOKEN,
            setLoading,
            (data) => {
                setUserBank(data?.data?.data?.[0]);
                setLoading(false);
            },
            (error) => {
                console.log(error);
                setLoading(false);
            },
        );
    }, [id, ACCESS_TOKEN]);

    // Functions
    const handleGoBack = () => {
        router.push(`/profile/${id}`);
    };

    const handleUploadImage = async (event) => {
        setImageLoading(true);
        const imageUrl = await uploadS3File(event);
        if (imageUrl) {
            setNewImage(imageUrl);
        }

        setImageLoading(false);
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        const prepareData = {
            ...values,
            receipt: newImage ? newImage : userBank?.qrCode,

        };
        await create(
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/recharge`,
            prepareData,
            USER_DATA.accessToken,
            setLoading,
            (data) => {
                console.log(data);
                toast({
                    title: t("successful"),
                    description: t("topUpSuccessfulWaitingForAdminApproval"),
                });
                setTimeout(() => {
                    setLoading(false);
                    router.push(`/profile/${id}`);
                }, 1000);


            },
            (error) => {
                console.log('error:', error);
            },
        );

    };

    return (
        <div className="relative w-full h-dvh">
            {loading ? (
                <div className="h-full flex-center">
                    <Loader />
                </div>
            ) : (
                <section className="w-full h-full px-4 overflow-y-auto bg-gradient-to-t from-blue-100 to-white">
                    <div className="relative py-8 flex-center">
                        <Button
                            onClick={() => handleGoBack()}
                            className=" w-[50px] h-[50px] rounded-full flex-center  text-white "
                        >
                            <ChevronLeft size={38} />
                        </Button>
                        <h1 className="w-full text-xl font-bold text-center">
                            {t("topUp")}
                        </h1>
                    </div>

                    <div className="text-center flex flex-col gap-6">
                        <div className="text-center">
                            <h1 className="text-lg font-bold">{t("contactServiceDepartment")}</h1>
                            <p>{t("contactServiceDetail")}</p>
                        </div>
                        <div className="px-10 flex justify-center">
                            <img src="/images/line-qr.png" className="w-[50%]" alt="contact" />
                        </div>
                        <div className="text-center">
                            <a href="https://line.me/R/ti/p/@442avwvd?ts=05062354&oat_content=url" target="_bank" className="underline" >
                                <span>{t("clickHereToContactCustomerService")}</span>
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* <div className="h-[10%]">
				<EditProfileFooter
					handleClick={() => {
						alert("Hey");
					}}
				/>
			</div> */}
        </div>
    );
}
