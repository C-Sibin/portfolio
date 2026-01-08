import { useState, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CarouselSectionProps {
  title: string;
  children: ReactNode[];
  viewAllContent?: ReactNode;
  itemsPerView?: number;
}

export const CarouselSection = ({
  title,
  children,
  viewAllContent,
  itemsPerView = 2,
}: CarouselSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewAll, setShowViewAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = children.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  const scrollPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < maxIndex;

  return (
    <>
      <div className="relative">
        {/* Header with View All */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-primary animate-fade-in-up glow-text">
            {title}
          </h2>
          {totalItems > itemsPerView && (
            <Button
              variant="outline"
              onClick={() => setShowViewAll(true)}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              View All ({totalItems})
            </Button>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative px-12">
          {/* Left Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-primary/50 bg-background/80 backdrop-blur-sm transition-all ${
              canScrollPrev
                ? "hover:bg-primary/20 hover:border-primary"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
            <span className="sr-only">Previous</span>
          </Button>

          {/* Items Container */}
          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out gap-8"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView + 2)}%)`,
              }}
            >
              {children.map((child, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 32 / itemsPerView}px)` }}
                >
                  {child}
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border-primary/50 bg-background/80 backdrop-blur-sm transition-all ${
              canScrollNext
                ? "hover:bg-primary/20 hover:border-primary"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-5 w-5 text-primary" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Pagination Dots */}
        {totalItems > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Dialog */}
      <Dialog open={showViewAll} onOpenChange={setShowViewAll}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">{title}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            {viewAllContent || children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
