"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ImageDetails } from "../destination/_types";

interface ImageSliderProps {
  images: ImageDetails[];
  title: string;
}

const ImageSlider = ({ images, title }: ImageSliderProps) => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        className="rounded-2xl overflow-hidden"
      >
        {images?.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-[460px]">
              <Image
                src={img.image_url}
                alt={`${title} ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        /* --- ARROWS --- */
        .swiper-button-next,
        .swiper-button-prev {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border-radius: 9999px;
          padding: 8px;
          color: #222336ff;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 10px;
          font-weight: bold;
        }

        /* Position arrows further inside */
        .swiper-button-next {
          right: 16px !important;
        }
        .swiper-button-prev {
          left: 16px !important;
        }

        /* --- PAGINATION BULLETS --- */
        /* This is the key change to fix the rounded bottom */
        .swiper-pagination {
          /* Position the pagination absolutely inside the slider */
          position: absolute !important;
          bottom: 16px !important; /* Add some padding from the bottom edge */
          /* Remove the margin that was pushing it outside */
          margin-top: 0 !important;
        }

        .swiper-pagination-bullet {
          /* Use white for better visibility on diverse images */
          background: #ffffff;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          margin: 0 4px; /* Add some space between bullets */
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;
