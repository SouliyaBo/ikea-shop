"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// Constants and Helpers
import { get } from "@/helpers";

export default function TopUp({ params }) {
    const { id } = params;
    const t = useTranslations("");
    const router = useRouter();
    const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
    const ACCESS_TOKEN = USER_DATA.accessToken;

    // Event Trigger
    const [loading, setLoading] = useState(false);

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

                    <div className="flex flex-col gap-6 text-center">
                        <div className="text-center">
                            <h1 className="text-lg font-bold">{t("contactServiceDepartment")}</h1>
                            <p>{t("contactServiceDetail")}</p>
                        </div>
                        <div className="flex justify-center px-10">
                            <img src="/images/line-qr.png" className="w-[50%]" alt="contact" />
                        </div>
                        <div className="text-center">
                            <a href="https://line.me/ti/p/jLKF6aZaYc" target="_bank" className="underline" >
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
