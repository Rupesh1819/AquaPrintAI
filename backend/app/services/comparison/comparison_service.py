from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.product.product_details import get_product_details
from typing import List

def get_comparison_data(db: Session, product_ids: List[str]) -> dict:
    if len(product_ids) < 2 or len(product_ids) > 4:
        raise HTTPException(status_code=400, detail="Must compare between 2 and 4 products.")

    products_data = []
    for pid in product_ids:
        try:
            # We reuse the robust product_details service to fetch everything we need
            details = get_product_details(db, pid)
            products_data.append(details)
        except Exception:
            # Skip invalid products
            continue

    if len(products_data) < 2:
        raise HTTPException(status_code=404, detail="Not enough valid products found for comparison.")

    # Calculate Decision Matrix Score for each product
    # Weighting: 
    # Water Footprint (35%) -> Lower is better
    # Sustainability Score (25%) -> Higher is better
    # Carbon Footprint (15%) -> Lower is better (placeholder if none)
    # Packaging / Materials (15%) -> Default base score
    # AI/Relevance (10%) -> Default base score

    # First, find max footprints across all compared products to normalize
    max_total_water = 1
    for p in products_data:
        total = sum(f['amount'] for f in p['footprints'] if f['type'] != 'total')
        p['total_water_liters'] = total
        if total > max_total_water:
            max_total_water = total

    for p in products_data:
        water_score = 0
        if p['total_water_liters'] > 0:
            # Invert so lower footprint = higher score (max 35)
            water_score = max(0, 35 - ((p['total_water_liters'] / max_total_water) * 35))
        else:
            water_score = 17 # Default middle if no data

        eco_score = p['score']['overall_score'] * 0.25 # Max 25
        
        # Carbon footprint (mocked 15 max)
        carbon_score = 10 
        # Materials (mocked 15 max)
        materials_score = 10
        # AI baseline (10 max)
        ai_score = 8 

        p['decision_matrix_score'] = round(water_score + eco_score + carbon_score + materials_score + ai_score, 1)

    # Sort to determine winner internally
    sorted_products = sorted(products_data, key=lambda x: x['decision_matrix_score'], reverse=True)
    winner_id = sorted_products[0]['id']

    return {
        "products": products_data,
        "winner_id": winner_id
    }
