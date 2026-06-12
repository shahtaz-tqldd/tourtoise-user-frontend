import { cn } from "@/lib/utils";
import { FreeMode, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

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
          modules={[FreeMode, Scrollbar]}
          slidesPerView="auto"
          spaceBetween={14}
          freeMode
          scrollbar={{ draggable: true, hide: false }}
          className="card-slider !overflow-hidden !pb-5"
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={getKey(item, index)}
              className={cn(
                "!h-auto !w-[min(78vw,320px)] shrink-0",
                slideClassName,
              )}
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
