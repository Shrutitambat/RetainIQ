# ai/gemini.py
# ─────────────────────────────────────────────
# Google Gemini AI integration (google-genai SDK).
# Used for:
# 1. Explaining WHY a customer might churn (plain English)
# 2. Generating personalized retention recommendations
# 3. Creating executive summary for entire analysis
# ─────────────────────────────────────────────

from google import genai
from google.genai import types
import json
import os
from dotenv import load_dotenv

load_dotenv()

# One shared client instance — created once at import time
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _generate(prompt: str, max_tokens: int = 500) -> str:
    """Low-level helper: call Gemini and return stripped text."""
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(max_output_tokens=max_tokens)
    )
    return response.text.strip()


def get_customer_insight(
    features: dict,
    top_factors: list,
    churn_probability: float
) -> dict:
    """
    For a single customer:
    - Explain in plain English why they might churn
    - Suggest 3 personalized retention actions
    - Assign a customer segment

    Returns dict with: explanation, recommendations, segment
    """

    # Format top factors for the prompt (guard against None values)
    factors_text = "\n".join([
        f"- {f['feature']}: {f['direction']} churn risk (impact: {abs(f['value']):.3f})"
        for f in top_factors
        if f.get("value") is not None
    ])

    prompt = f"""You are a senior customer retention analyst at a telecom company.

Customer Data: {json.dumps(features, indent=2)}
Top Risk Factors:
{factors_text}
Churn Probability: {churn_probability:.1%}

Respond with ONLY a valid JSON object, no markdown, no extra text:
{{
  "explanation": "2-3 sentences explaining why this customer is at risk",
  "recommendations": ["action 1", "action 2", "action 3"],
  "segment": "one of: Loyal Customer, Price-Sensitive, At-Risk, New Customer, High-Value At-Risk, Disengaged"
}}"""

    try:
        text = _generate(prompt, 500)
        # Strip markdown code fences if Gemini adds them
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        # Graceful fallback — never crash the whole analysis
        return {
            "explanation": f"This customer shows a {churn_probability:.1%} churn probability based on usage patterns.",
            "recommendations": [
                "Reach out with personalized retention offer",
                "Review their service plan",
                "Assign dedicated support",
            ],
            "segment": "At-Risk",
        }


def get_executive_summary(stats: dict) -> str:
    """
    Generate a business-level executive summary
    for the entire uploaded customer dataset.
    """
    prompt = f"""You are a Chief Customer Officer. Write a 3-4 sentence executive summary for this churn analysis.

Results: {stats['total']} customers analyzed. High risk: {stats['high_risk']} ({stats['high_risk_pct']:.1f}%). Medium: {stats['medium_risk']} ({stats['medium_risk_pct']:.1f}%). Low: {stats['low_risk']} ({stats['low_risk_pct']:.1f}%). Avg churn probability: {stats['avg_prob']:.1%}. Top drivers: {', '.join(stats['top_factors'])}.

Be direct and business-focused. No bullet points."""

    try:
        return _generate(prompt, 300)
    except Exception:
        return (
            f"Analysis complete. {stats['high_risk']} customers "
            f"({stats['high_risk_pct']:.1f}%) are at high risk of churning. "
            "Immediate retention action is recommended, focusing on the identified risk factors."
        )