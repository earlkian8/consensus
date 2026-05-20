import fetch from "node-fetch";

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || "http://model:5001";

/**
 * Gets portion recommendations from the Python AI model for a list of products on a specific date.
 */
export const getRecommendations = async (date, products) => {
  const recommendations = [];

  for (const product of products) {
    try {
      const response = await fetch(`${MODEL_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date,
          item: product.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Model service error for ${product.name}:`, errorData.error);
        recommendations.push({
          productId: product.id,
          name: product.name,
          suggestedAmount: null,
          error: errorData.error
        });
        continue;
      }

      const data = await response.json();
      recommendations.push({
        productId: product.id,
        name: product.name,
        suggestedAmount: data.recommended_portions
      });
    } catch (error) {
      console.error(`Failed to connect to model service for ${product.name}:`, error.message);
      recommendations.push({
        productId: product.id,
        name: product.name,
        suggestedAmount: null,
        error: "Connection failed"
      });
    }
  }

  return recommendations;
};
