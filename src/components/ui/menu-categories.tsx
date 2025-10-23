import { useRef, useState } from "react"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"

interface MenuCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function MenuCategories({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    document.body.style.cursor = 'grabbing';
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = '';
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = x - startX.current;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };


  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="flex w-max space-x-2 p-2 overflow-x-auto select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: 'grab' }}
      >
        {categories.map((category) => (
          <Card
            key={category}
            className={cn(
              "inline-flex shrink-0 cursor-pointer transition-colors",
              selectedCategory === category
                ? "border-primary bg-primary/10"
                : "hover:bg-muted/50"
            )}
            onClick={() => handleCategoryClick(category)}
            style={{ minWidth:  'max-content' }}
          >
            <CardContent className="p-4">
              <p className="font-semibold">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export { MenuCategories };