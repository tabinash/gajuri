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

export async function addProduct(formData) {
  console.log("🚀 Adding product:", formData);

  const response = await httpClient.post("/marketplace/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
}

export async function deleteProduct(productId) {
  console.log("🚀 Deleting product with ID:", productId);

  const response = await httpClient.delete(
    `/marketplace/products/${productId}`
  );

  return response;
}
