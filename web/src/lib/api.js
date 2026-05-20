const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";

const req = async (method, path, body) => {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data;
};

export const api = {
    uploadProductImage: (image, filename) => req("POST", "/products/upload-image", { image, filename }),
    getProducts: () => req("GET", "/products"),
    createProduct: (body) => req("POST", "/products", body),
    updateProduct: (id, body) => req("PATCH", `/products/${id}`, body),
    deleteProduct: (id) => req("DELETE", `/products/${id}`),
};
