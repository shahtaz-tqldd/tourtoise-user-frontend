import React from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";

const ImagePreview = ({
  images,
  className = "",
  altPrefix = "Gallery photo",
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
          className="aspect-[16/9] image-slider w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image}-${index}`}>
              <img
                src={image}
                alt={`${altPrefix} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ImagePreview;
