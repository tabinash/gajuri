import httpClient from "./http";

export async function getProductsByCategory(category) {
  try {
    console.log(`🌐 Fetching products from API for category: ${category}`);
    const response = await httpClient.get(
      `/marketplace/products?category=${category}`
    );
    console.log(response);
    return response;
  } catch (error) {
    console.error(
      `❌ Error fetching products for category ${category}:`,
      error
    );
    throw error;
  }
}

export async function getProductByUserId(userId) {
  console.log("🚀 Fetching product by user ID:", userId);

  const response = await httpClient.get(`/marketplace/user/${userId}`);
  console.log("🚀 user products:", response);

  return response;
}
export async function getProductById(productId) {
  console.log("🚀 Fetching product by ID:", productId);  
  const response = await httpClient.get(`/marketplace/products/${productId}`);
  console.log("🚀 product details:", response);
  return response;
} 


export async function addProduct(formData) {
  console.log("🚀 Adding product:", formData);

  const response = await httpClient.post("/marketplace/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
}
export async function markProductSold(productId) {
  console.log("🚀 Marking product as unavailable with ID:", productId);
  
  const response = await httpClient.put(`/marketplace/products/${productId}/mark-sold`);
  console.log("🚀 Mark Product Unavailable Response:", response) ; 
  return response;
}
