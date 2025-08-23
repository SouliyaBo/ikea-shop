"use client";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
// Import Swiper styles
import "swiper/css";

export default function AdvertiseSlider({ data }) {
	return (
		<Swiper
			modules={[Pagination, Autoplay]}
			// className="h-[200px]"
			className="h-[150px]"
			spaceBetween={50}
			pagination={true}
			autoplay={{
				delay: 2500,
				disableOnInteraction: false,
			}}
			loop={true}
			// slidesPerView={3}
		>
			{data.length > 0 &&
				data.map((item) => (
					<SwiperSlide
						className="relative w-full overflow-hidden bg-white rounded-lg"
						key={item?._id}
					>
						<Image
							unoptimized
							src={process.env.NEXT_PUBLIC_MEDIUM_RESIZE + item?.image}
							alt={"advertise"}
							fill
							className="object-cover"
							sizes="100%"
						/>
					</SwiperSlide>
				))}
		</Swiper>
	);
}
