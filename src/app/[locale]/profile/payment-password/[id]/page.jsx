"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";

// Third Party
import { Formik } from "formik";
import { useTranslations } from "next-intl";

// Icons
import { ChevronLeft } from "lucide-react";

// UI
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileFooter from "@/components/Profile/EditProfileFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Constants and Helpers
import { USER, IMG_PREFIX_S3 } from "@/constants/api";
import { get, update, uploadS3File } from "@/helpers";
import { ADDRESS } from "@/constants/laoAddress";

export default function ProfileEdit({ params }) {
    const { id } = params;
    const t = useTranslations("");
    const router = useRouter();
    const USER_DATA = JSON.parse(localStorage.getItem("USER_DATA"));
    const ACCESS_TOKEN = USER_DATA.accessToken;

    const [userDetail, setUserDetail] = useState(null);
    const [province, setProvince] = useState(null);

    // Event Trigger
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [newImage, setNewImage] = useState(false);

    // Use Effect
    useEffect(() => {
        get(
            // `${USER}/${id}`,
            `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
            ACCESS_TOKEN,
            setLoading,
            (data) => {
                setUserDetail(data.data);
                setProvince(data.data.province);
                setLoading(false);
            },
            (error) => {
                console.log(error);
                setLoading(false);
            },
        );
    }, [id, ACCESS_TOKEN]);

    useEffect(() => {
        if (province) {
            console.log(province);
        }
    }, [province]);

    // Functions
    const handleGoBack = () => {
        router.back();
    };

    const handleUploadImage = async (event) => {
        setImageLoading(true);
        const imageUrl = await uploadS3File(event);

        if (imageUrl) {
            setNewImage(imageUrl);
        }

        setImageLoading(false);
    };

    const handleSubmit = async (values, resetForm) => {
        const prepareData = {
            pin: values.pin,
        };
        try {
            await update(
                `${process.env.NEXT_PUBLIC_API_LINK}/v1/api/user/${id}`,
                prepareData,
                USER_DATA.accessToken,
                setLoading,
                (data) => {
                    setUserDetail(data.data);
                    resetForm();
                    router.push(`/profile/${id}`);
                },
                (error) => {
                    console.log(error);
                },
            );
        } catch (error) {
            console.log(error);
        }
    };

    // Add this validation function
    const validatePaymentPassword = (values) => {
        const errors = {};

        // Check if payment password is provided
        if (!values.pin) {
            errors.pin = t("pleaseEnterThePaymentCodeFirst");
        } else if (values.pin.length < 6) {
            // Ensure password is at least 6 digits
            errors.pin = t("paymentPasswordLengthMustBe6digits");
        }

        // Check if confirmation matches
        if (values.confirmPin !== values.pin) {
            errors.confirmPin = t("passwordsDoNotMatch");
        }

        return errors;
    };

    return (
        <div className="relative w-full h-dvh">
            {/* <Button
					onClick={() => handleGoBack()}
					className=" w-[50px] h-[50px] rounded-full flex-center absolute text-white left-10 top-10"
				>
					<ChevronLeft size={38} />
				</Button> */}
            {loading ? (
                <div className="h-full flex-center">
                    <Loader />
                </div>
            ) : (
                <section className="w-full h-full px-4 py-2 overflow-y-auto">
                    <Button
                        onClick={() => handleGoBack()}
                        className=" w-[50px] h-[50px] rounded-full flex-center  text-white "
                    >
                        <ChevronLeft size={38} />
                    </Button>
                    <h1 className="w-full text-lg font-bold text-center">
                        {t("paymentPassword")}
                    </h1>

                    <Formik
                        initialValues={{
                            pin: "",
                            confirmPin: ""
                        }}
                        validate={validatePaymentPassword}
                        validateOnChange={true}
                        validateOnBlur={true}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            setSubmitting(true);
                            handleSubmit(values, resetForm);
                            setSubmitting(false);
                        }}
                    >
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            setFieldValue,
                            setFieldTouched,
                            errors,
                            touched
                        }) => (
                            <form onSubmit={handleSubmit} className="w-full">
                                <div className="flex-col w-full gap-4 flex-center">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="pin">{t("paymentPassword")}</Label>
                                        <Input
                                            type="password"
                                            id="pin"
                                            name="pin"
                                            maxLength={6}
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            value={values.pin}
                                            onChange={(e) => {
                                                // Only allow numeric input
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                setFieldValue('pin', numericValue);
                                                // Mark as touched to trigger validation
                                                setFieldTouched('pin', true, true);
                                            }}
                                            onBlur={handleBlur}
                                            placeholder={`${t("paymentPassword")}...`}
                                        />
                                        {errors.pin && touched.pin && (
                                            <div className="text-red-500 text-sm">{errors.pin}</div>
                                        )}
                                    </div>
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="confirmPin">{t("confirmPaymentPassword")}</Label>
                                        <Input
                                            type="password"
                                            id="confirmPin"
                                            name="confirmPin"
                                            maxLength={6}
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            value={values.confirmPin}
                                            onChange={(e) => {
                                                // Only allow numeric input
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                setFieldValue('confirmPin', numericValue);
                                                // Mark as touched to trigger validation
                                                setFieldTouched('confirmPin', true, true);
                                            }}
                                            onBlur={handleBlur}
                                            placeholder={`${t("confirmPaymentPassword")}...`}
                                        />
                                        {errors.confirmPin && touched.confirmPin && (
                                            <div className="text-red-500 text-sm">{errors.confirmPin}</div>
                                        )}
                                    </div>

                                    <Button
                                        className="w-[80%] rounded-full py-8 text-white"
                                        type="submit"
                                        disabled={
                                            values.confirmPin !== values.pin ? true : false
                                        }
                                    >
                                        {t("editProfile")}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Formik>
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
