
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import DrinkBuilder from "@/components/drink-builder/DrinkBuilder";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import HamburgerMenu from "@/components/HamburgerMenu";
import VirtualBarista from "@/components/VirtualBarista";
import ProductReviews from "@/components/ProductReviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Star, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useMenuWithRatings } from "@/hooks/useMenuWithRatings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Menu = () => {
  const session = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDrinkBuilder, setShowDrinkBuilder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { getValue, setValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";
  const addToCart = useAddToCart();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!session && getValue("isGuest") !== "true") {
      setValue("isGuest", "true");
      console.log("Guest mode enabled in Menu component");
    }

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(9);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: menuItems, isLoading } = useMenuWithRatings(selectedCategory === "all" ? undefined : selectedCategory);

  const { data: productRatings } = useQuery({
    queryKey: ['product-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('product_name, rating');
      
      if (error) {
        console.error("Error fetching product ratings:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} ratings for product_ratings query`);
      
      const ratingMap: Record<string, { avg: number; count: number }> = {};
      data.forEach(review => {
        if (!ratingMap[review.product_name]) {
          ratingMap[review.product_name] = { avg: 0, count: 0 };
        }
        ratingMap[review.product_name].avg += review.rating;
        ratingMap[review.product_name].count += 1;
      });
      
      Object.keys(ratingMap).forEach(product => {
        ratingMap[product].avg = 
          ratingMap[product].avg / ratingMap[product].count;
      });
      
      return ratingMap;
    },
  });

  const handleSizeChange = (itemId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const getItemPrice = (item: any) => {
    const selectedSize = selectedSizes[item.id] || 'medium';
    return item.size_options?.[selectedSize]?.price || item.price;
  };

  const addToCartHandler = (item: any) => {
    const selectedSize = selectedSizes[item.id] || 'medium';
    const price = item.size_options?.[selectedSize]?.price || item.price;
    const volume = item.size_options?.[selectedSize]?.volume;
    const displayName = `${item.name} (${selectedSize} - ${volume} mL)`;
    
    console.log("Menu: Adding item to cart:", displayName);
    
    addToCart({
      productName: displayName,
      price: price,
      quantity: 1,
      size: selectedSize
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categories = ["all", ...new Set(menuItems?.map((item: any) => item.category))];
  
  const filteredItems = menuItems?.filter((item: any) => {
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const totalPages = Math.ceil((filteredItems?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems?.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background menu-page-container">
      <div id="menu-section" className="container mx-auto px-4 sm:px-6 pt-16 md:pt-20 pb-12">
        <motion.h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Our Menu
        </motion.h1>

        {!session && !isGuest && (
          <motion.div 
            className="mb-6 sm:mb-8 p-3 sm:p-4 bg-secondary/20 rounded-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-3">Create an account to earn rewards with every purchase!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Button 
                variant="default" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  localStorage.setItem("isGuest", "true");
                  window.location.reload();
                }}
              >
                Continue as Guest
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = "/auth"}
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center mb-6 sm:mb-8">
          <Button
            variant={showDrinkBuilder ? "default" : "outline"}
            onClick={() => setShowDrinkBuilder(!showDrinkBuilder)}
            className="w-full max-w-xs sm:max-w-md"
          >
            {showDrinkBuilder ? "View Menu" : "Create Custom Drink"}
          </Button>
        </div>

        {showDrinkBuilder ? (
          <DrinkBuilder />
        ) : (
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-auto md:min-w-[200px] mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden p-1.5"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="text-xs">{showFilters ? 'Hide' : 'Show'}</span>
                </Button>
              </div>
              
              <div className={`relative mb-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search drinks and treats..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-full"
                />
              </div>
              
              <ScrollArea className={`w-full md:w-auto md:min-w-[180px] md:flex-shrink-0 mb-4 md:mb-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                <div className="flex md:flex-col gap-1.5 pb-4 md:pb-0">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className="flex-shrink-0 whitespace-nowrap justify-start text-left capitalize text-xs sm:text-sm py-1.5 h-auto"
                      size="sm"
                    >
                      {category === "all" ? "All Items" : category}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="md:hidden" />
              </ScrollArea>
            </div>

            <div className="flex-1">
              {currentItems?.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-lg shadow-sm">
                  <p className="text-muted-foreground mb-2">No items found matching your search.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    size="sm"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {currentItems?.map((item: any) => (
                      <motion.div
                        key={item.id}
                        className="bg-card rounded-lg shadow-sm overflow-hidden h-full border border-muted hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.01 }}
                        layout
                      >
                        <div className="relative h-32 sm:h-40 overflow-hidden">
                          <img 
                            src={item.name === "Cherry Blossom Latte" 
                              ? "https://i.ibb.co/cK1xgwSj/DALL-E-2025-03-15-23-06-58-A-beautifully-crafted-cherry-blossom-latte-in-a-ceramic-cup-The-latte-has.webp" 
                              : item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1497636577773-f1231844b336';
                            }}
                          />
                        </div>
                        
                        <div className="p-3 sm:p-4">
                          <div className="flex justify-between items-start mb-1 sm:mb-2">
                            <h3 className="text-base sm:text-lg font-semibold">{item.name}</h3>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <button 
                                  className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                                  onClick={() => setSelectedProduct(item.name)}
                                >
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                                    <span>
                                      {productRatings?.[item.name]?.avg 
                                        ? productRatings[item.name].avg.toFixed(1) 
                                        : "-"}
                                    </span>
                                    <span className="text-xs hidden sm:inline">
                                      ({productRatings?.[item.name]?.count || 0})
                                    </span>
                                  </div>
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{item.name} Reviews</DialogTitle>
                                </DialogHeader>
                                <ProductReviews productName={item.name} />
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2">{item.description}</p>
                          
                          {item.size_options && (
                            <div className="mb-3">
                              <RadioGroup 
                                value={selectedSizes[item.id] || 'medium'} 
                                onValueChange={(value) => handleSizeChange(item.id, value)}
                                className="flex gap-2 justify-between"
                              >
                                {item.size_options.small && (
                                  <div className="flex items-center space-x-1 flex-1">
                                    <RadioGroupItem value="small" id={`${item.id}-small`} className="size-3" />
                                    <Label htmlFor={`${item.id}-small`} className="text-xs">
                                      S ({item.size_options.small.volume} mL)
                                    </Label>
                                  </div>
                                )}
                                {item.size_options.medium && (
                                  <div className="flex items-center space-x-1 flex-1">
                                    <RadioGroupItem value="medium" id={`${item.id}-medium`} className="size-3" />
                                    <Label htmlFor={`${item.id}-medium`} className="text-xs">
                                      M ({item.size_options.medium.volume} mL)
                                    </Label>
                                  </div>
                                )}
                                {item.size_options.large && (
                                  <div className="flex items-center space-x-1 flex-1">
                                    <RadioGroupItem value="large" id={`${item.id}-large`} className="size-3" />
                                    <Label htmlFor={`${item.id}-large`} className="text-xs">
                                      L ({item.size_options.large.volume} mL)
                                    </Label>
                                  </div>
                                )}
                              </RadioGroup>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-sm sm:text-base font-bold">${getItemPrice(item).toFixed(2)}</span>
                            <Button 
                              onClick={() => addToCartHandler(item)}
                              size="sm"
                              className="text-xs px-2 sm:px-3 h-8 sm:h-9"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-6 sm:mt-8">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }} 
                              />
                            </PaginationItem>
                          )}
                          
                          {Array.from({ length: totalPages }).map((_, index) => {
                            const pageNumber = index + 1;
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    href="#"
                                    isActive={pageNumber === currentPage}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handlePageChange(pageNumber);
                                    }}
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            
                            if (
                              (pageNumber === currentPage - 2 && pageNumber > 1) ||
                              (pageNumber === currentPage + 2 && pageNumber < totalPages)
                            ) {
                              return <PaginationItem key={pageNumber}>...</PaginationItem>;
                            }
                            
                            return null;
                          })}
                          
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }} 
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <VirtualBarista />
    </div>
  );
};

export default Menu;
