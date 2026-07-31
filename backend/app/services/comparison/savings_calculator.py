def calculate_water_savings(winner_water_liters: float, average_others_water_liters: float) -> dict:
    """
    Calculates estimated water savings assuming the user consumes 1 unit of this product daily.
    """
    savings_per_unit = average_others_water_liters - winner_water_liters
    
    if savings_per_unit <= 0:
        return {
            "per_unit": 0,
            "daily": 0,
            "monthly": 0,
            "yearly": 0
        }
        
    return {
        "per_unit": round(savings_per_unit, 2),
        "daily": round(savings_per_unit, 2),
        "monthly": round(savings_per_unit * 30, 2),
        "yearly": round(savings_per_unit * 365, 2)
    }
