"use client";

import { useEffect, useState } from "react";
import { getProductsByCategory } from "@/repositories/MarketplaceRepository";

const categories = [
  "ELECTRONIC",
  "COMPUTER",
  "FURNITURE",
  "FOOD",
  "FASHION",
  "SPORTS",
  "ART",
  "BOOKS",
  "HOME & GARDEN",
];

const LocalMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("ELECTRONIC");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProductsByCategory(selectedCategory);
      console.log("API Response:", response);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch products");
      }

      setProducts(response.data || []);
      console.log("XYZ Success: Products fetched successfully!");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // Simple function to select category (for API call)
  const selectCategory = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      {/* Trigger fetch by changing category */}
      {categories.map((cat) => (
        <button key={cat} onClick={() => selectCategory(cat)}>
          {cat}
        </button>
      ))}

      {/* Status */}
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && products.length > 0 && (
        <p>{products.length} products fetched successfully!</p>
      )}
    </div>
  );
};

export default LocalMarketplace;
