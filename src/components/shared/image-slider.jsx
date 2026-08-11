import React from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";
import { Image } from "./utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const ImagePreview = ({
  images,
  className = "",
  altPrefix = "Gallery photo",
  imageWidth = 900,
  content_type = MEDIA_CONTENT_TYPE.ATTRACTION,
}) => {
  return (
    <div className={cn("overflow-hidden", className)}>
      {images.length > 0 && (
        <Swiper
          modules={[Pagination]}
          pagination={
            images.length > 1
              ? { clickable: true, dynamicBullets: true }
              : false
          }
          className={cn(
            "image-slider w-full",
            images.length > 1 &&
              "!pb-7 [&_.swiper-pagination]:!bottom-0 [&_.swiper-pagination-bullet]:!bg-[#009966] [&_.swiper-pagination-bullet]:!opacity-30 [&_.swiper-pagination-bullet-active]:!opacity-100",
          )}
        >
          {images.map((image, index) => (
            <SwiperSlide
              key={`${image}-${index}`}
              className="!h-auto aspect-[16/9] overflow-hidden"
            >
              <Image
                src={image}
                alt={`${altPrefix} ${index + 1}`}
                width={imageWidth}
                content_type={content_type}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ImagePreview;
