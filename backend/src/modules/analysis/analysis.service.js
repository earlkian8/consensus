import fetch from "node-fetch";
import { supabase } from "../../shared/database/supabase.js";

const MODEL_SERVICE_URL =
  process.env.MODEL_SERVICE_URL || "http://127.0.0.1:5001";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const clampSuggested = (value) => Math.max(1, Math.round(value));

const buildRuleSuggestion = (latestPrepared, latestExcess) => {
  if (!Number.isFinite(latestPrepared) || latestPrepared <= 0) return null;

  const excess = Number.isFinite(latestExcess) ? latestExcess : 0;
  const wastePct = Math.round((excess / latestPrepared) * 100);

  let action = "same";
  let adjustmentPct = 0;

  if (wastePct >= 50) {
    action = "down";
    adjustmentPct = 60;
  } else if (wastePct > 30) {
    action = "down";
    adjustmentPct = 40;
  } else if (wastePct >= 15) {
    action = "down";
    adjustmentPct = 20;
  } else if (wastePct < 5) {
    action = "up";
    adjustmentPct = 10;
  }

  let suggested = latestPrepared;
  if (action === "down") {
    suggested = latestPrepared * (1 - adjustmentPct / 100);
  } else if (action === "up") {
    suggested = latestPrepared * (1 + adjustmentPct / 100);
  }

  return {
    wastePct,
    action,
    adjustmentPct,
    suggested: clampSuggested(suggested),
  };
};

const buildModelReasoning = (
  productName,
  modelSuggested,
  rule,
  finalSuggested,
) => {
  const parts = [];

  if (Number.isFinite(modelSuggested)) {
    parts.push(
      `System suggests ${productName} at ${Math.round(modelSuggested)} portions.`,
    );
  }

  if (rule) {
    if (rule.action === "down") {
      parts.push(
        `System suggests reducing to ${finalSuggested} based on ${rule.wastePct}% waste.`,
      );
    } else if (rule.action === "up") {
      parts.push(
        `System suggests increasing to ${finalSuggested} based on ${rule.wastePct}% waste.`,
      );
    } else {
      parts.push(
        `System suggests keeping the same quantity based on ${rule.wastePct}% waste.`,
      );
    }
  }

  return parts.length ? parts.join(" ") : null;
};

const requestModelPrediction = async (date, item) => {
  try {
    const response = await fetch(`${MODEL_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, item }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        error: data?.error || "Model prediction failed",
        status: response.status,
      };
    }

    return { data };
  } catch (error) {
    return { error: error.message || "Model prediction failed" };
  }
};

const trainModels = async () => {
  try {
    const response = await fetch(`${MODEL_SERVICE_URL}/train`, {
      method: "POST",
    });
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Model] Training failed:", error.message);
    return false;
  }
};

/**
 * Gets portion recommendations using the local model service.
 */
export const getModelRecommendations = async (date, products) => {
  const recommendations = [];
  let trainedOnce = false;

  for (const product of products) {
    try {
      const { data: history } = await supabase
        .from("production_details")
        .select("amount, excess, production_plans(date)")
        .eq("p_fk", product.id)
        .order("created_at", { ascending: false })
        .limit(7);

      const latest = history?.[0] ?? null;
      const latestPrepared = toNumber(latest?.amount);
      const latestExcess = toNumber(latest?.excess);
      const rule = buildRuleSuggestion(latestPrepared, latestExcess);

      let modelSuggested = null;
      let modelError = null;

      if (!MODEL_SERVICE_URL) {
        modelError = "Model service URL missing";
      } else {
        let prediction = await requestModelPrediction(date, product.name);

        if (prediction.error && prediction.status === 404 && !trainedOnce) {
          trainedOnce = await trainModels();
          if (trainedOnce) {
            prediction = await requestModelPrediction(date, product.name);
          }
        }

        if (prediction.error) {
          modelError = prediction.error;
        } else {
          modelSuggested = toNumber(prediction.data?.recommended_portions);
        }
      }

      let suggestedAmount = modelSuggested;
      let source = "model";

      if (!Number.isFinite(suggestedAmount)) {
        suggestedAmount = rule?.suggested ?? null;
        source = rule ? "rule-fallback" : "missing";
      } else if (
        rule &&
        rule.action === "down" &&
        suggestedAmount > rule.suggested
      ) {
        suggestedAmount = rule.suggested;
        source = "backend-override";
      } else if (
        rule &&
        rule.action === "up" &&
        suggestedAmount < rule.suggested
      ) {
        suggestedAmount = rule.suggested;
        source = "backend-override";
      }

      if (Number.isFinite(suggestedAmount)) {
        suggestedAmount = clampSuggested(suggestedAmount);
      }

      const reasoning = buildModelReasoning(
        product.name,
        modelSuggested,
        rule,
        suggestedAmount,
      );

      if (!reasoning && modelError) {
        console.warn(`[Model] ${product.name}: ${modelError}`);
      }

      recommendations.push({
        productId: product.id,
        name: product.name,
        suggestedAmount,
        reasoning,
        source,
        wastePct: rule?.wastePct ?? null,
      });
    } catch (error) {
      console.error(`[Model] Error for ${product.name}:`, error.message);
      recommendations.push({
        productId: product.id,
        name: product.name,
        suggestedAmount: null,
      });
    }
  }

  return recommendations;
};
