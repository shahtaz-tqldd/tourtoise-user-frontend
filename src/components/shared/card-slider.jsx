import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const CardSlider = ({
  items = [],
  renderItem,
  getKey = (item) => item.id || item.slug || item.name,
  desktopClassName,
  slideClassName,
  desktopItems = items,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) return null;

  return (
    <>
      <div className="relative w-full min-w-0 overflow-hidden pb-1 lg:hidden">
        <span
          className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-slate-950/65 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur"
          aria-live="polite"
        >
          {activeIndex + 1} / {items.length}
        </span>
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={12}
          pagination={
            items.length > 1
              ? { clickable: true, dynamicBullets: true }
              : false
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="card-slider !overflow-hidden !pb-8 [&_.swiper-pagination]:!bottom-0 [&_.swiper-pagination-bullet]:!bg-primary [&_.swiper-pagination-bullet]:!opacity-30 [&_.swiper-pagination-bullet-active]:!opacity-100"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={getKey(item, index)}
              className={cn("!h-auto", slideClassName)}
            >
              <div className="h-full">{renderItem(item, index)}</div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div
        className={cn(
          "hidden min-w-0 gap-4 lg:grid lg:grid-cols-3",
          desktopClassName,
        )}
      >
        {desktopItems.map((item, index) => (
          <div key={getKey(item, index)} className="h-full">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </>
  );
};

export default CardSlider;
