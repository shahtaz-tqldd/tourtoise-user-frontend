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
}) => {
  if (!items.length) return null;

  return (
    <>
      <div className="w-full min-w-0 overflow-hidden pb-1 lg:hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={12}
          pagination={{ clickable: true }}
          className="card-slider !overflow-hidden !pb-8 [&_.swiper-pagination-bullet-active]:!bg-primary [&_.swiper-pagination-bullet]:!h-1.5 [&_.swiper-pagination-bullet]:!w-1.5 [&_.swiper-pagination-bullet]:!bg-slate-300 [&_.swiper-pagination-bullet]:!opacity-100"
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
        {items.map((item, index) => (
          <div key={getKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>
    </>
  );
};

export default CardSlider;
