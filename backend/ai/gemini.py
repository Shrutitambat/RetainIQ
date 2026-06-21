import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def _safe_factors_text(top_factors: list) -> str:
    lines = []
    for f in top_factors:
        feature = f.get("feature", "unknown")
        direction = f.get("direction", "affects")
        value = f.get("value")
        if value is None:
            lines.append(f"- {feature}: {direction} churn risk")
        else:
            lines.append(f"- {feature}: {direction} churn risk (impact: {abs(value):.3f})")
    return "\n".join(lines)


def get_customer_insight(features: dict, top_factors: list, churn_probability: float) -> dict:
    factors_text = _safe_factors_text(top_factors)

    prompt = f"""You are a senior customer retention analyst at a telecom company.

Customer Data:
{json.dumps(features, indent=2, default=str)}

Top Risk Factors (from SHAP analysis):
{factors_text}

Churn Probability: {churn_probability:.1%}

Respond with ONLY a valid JSON object, no markdown formatting, no extra text:
{{
  "explanation": "2-3 sentences explaining in plain business English why this specific customer is at risk, referencing their actual data",
  "recommendations": ["specific action 1 tailored to this customer", "specific action 2", "specific action 3"],
  "segment": "exactly one of: Loyal Customer, Price-Sensitive, At-Risk, New Customer, High-Value At-Risk, Disengaged"
}}"""

    try:
        logger.info(f"Calling Groq for customer insight, churn_prob={churn_probability}")
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        text = response.choices[0].message.content.strip()
        logger.info(f"Groq raw response: {text[:200]}")
        return json.loads(text)
    except Exception:
        logger.exception("Groq call failed for get_customer_insight")
        return {
            "explanation": f"This customer shows a {churn_probability:.1%} churn probability based on their usage patterns and service interactions.",
            "recommendations": [
                "Reach out proactively with a personalized retention offer",
                "Review their service plan and suggest better-fit options",
                "Assign a dedicated customer success representative"
            ],
            "segment": "At-Risk"
        }


def get_executive_summary(stats: dict) -> str:
    prompt = f"""You are a Chief Customer Officer presenting churn analysis results to the executive team.

Analysis Results:
- Total customers analyzed: {stats['total']}
- High risk: {stats['high_risk']} customers ({stats['high_risk_pct']:.1f}%)
- Medium risk: {stats['medium_risk']} customers ({stats['medium_risk_pct']:.1f}%)
- Low risk: {stats['low_risk']} customers ({stats['low_risk_pct']:.1f}%)
- Average churn probability: {stats['avg_prob']:.1%}
- Top churn drivers: {', '.join(stats['top_factors'])}

Write a 3-4 sentence executive summary. State the key finding, identify the most critical risk factors, recommend immediate action. Be direct, business-focused, no bullet points."""

    try:
        logger.info("Calling Groq for executive summary")
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        logger.exception("Groq call failed for get_executive_summary")
        return f"Analysis complete. {stats['high_risk']} customers ({stats['high_risk_pct']:.1f}%) are at high risk of churning. Immediate retention action is recommended, focusing on the identified risk factors."