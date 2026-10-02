"""Seed content — mirrors Frontend/src/data/mockData.ts (same ids, prices, stock)."""

DIVISIONS = [
    {"id": "div-bakery", "name": "U.I. Bakery / U & I Fast Food", "slug": "bakery-fastfood",
     "description": "Fresh, hygienic, bromate-free bread and pastries from our ultra-modern bakery on U.I Ajibode road.",
     "short_description": "Bromate-free bread, pastries & fast food", "icon": "🍞", "sort_order": 1},
    {"id": "div-petrol", "name": "U.I. Petrol Station", "slug": "petrol-station",
     "description": "Reliable fuel, lubricants, car wash and quick services.", "short_description": "Fuel, lubricants & auto care",
     "icon": "⛽", "sort_order": 2},
    {"id": "div-printing", "name": "U.I. Printing Press", "slug": "printing-press",
     "description": "High-quality offset & digital printing.", "short_description": "Offset, digital & large format printing",
     "icon": "🖨️", "sort_order": 3},
    {"id": "div-hse", "name": "U.I. Health, Safety and Environment Unit", "slug": "health-safety",
     "description": "HSE consultancy, fumigation, waste management and safety training.",
     "short_description": "HSE consultancy & fumigation", "icon": "🏥", "sort_order": 4},
    {"id": "div-consult", "name": "U.I. Consultancy Services Unit", "slug": "consultancy",
     "description": "Academic, business and research consultancy.", "short_description": "Research & business consultancy",
     "icon": "💼", "sort_order": 5},
    {"id": "div-hotels", "name": "U.I. Hotels", "slug": "hotels",
     "description": "Comfortable accommodation from Deluxe Double to Premium Royal Suite, plus gym, pool, restaurant and conference facilities.",
     "short_description": "Rooms, suites & event facilities", "icon": "🏨", "sort_order": 6},
]

CATEGORIES = [
    {"id": "cat-bread", "name": "Bread", "slug": "bread", "division_id": "div-bakery", "sort_order": 1},
    {"id": "cat-snacks", "name": "Snacks", "slug": "snacks", "division_id": "div-bakery", "sort_order": 2},
    {"id": "cat-standard", "name": "Standard Rooms", "slug": "standard", "division_id": "div-hotels", "sort_order": 1},
    {"id": "cat-executive", "name": "Executive Rooms", "slug": "executive", "division_id": "div-hotels", "sort_order": 2},
    {"id": "cat-luxury", "name": "Luxury Rooms", "slug": "luxury", "division_id": "div-hotels", "sort_order": 3},
    {"id": "cat-suite", "name": "Suites", "slug": "suites", "division_id": "div-hotels", "sort_order": 4},
]

ROOMS = [
    {"id": "room-double-deluxe", "name": "DOUBLE ROOM DELUXE", "slug": "double-room-deluxe",
     "description": "Standard Room with 5x7 Bed, Sofa, Study Area, Couch", "short_description": "A Standard Room with 5x7 Bed, Sofa, Study Area, Couch",
     "price": 30000, "category_id": "cat-standard", "division_id": "div-hotels",
     "capacity": 2, "bed_type": "Double", "bed_size": "5 x 7", "total_rooms": 20,
     "amenities": ["Free WiFi", "Air Conditioning", "DSTV", "Ensuite Bathroom", "Study Desk", "Wardrobe", "24/7 Power", "Room Service"],
     "features": ["Sofa", "Study Area", "Couch", "Mini Fridge"]},
    {"id": "room-royal-standard", "name": "ROYAL STANDARD", "slug": "royal-standard",
     "description": "Standard Room with 6x6 Bed, Study Area, Couch", "short_description": "A Standard Room with 6x6 Bed, Study Area, Couch",
     "price": 32500, "category_id": "cat-standard", "division_id": "div-hotels",
     "capacity": 2, "bed_type": "Queen", "bed_size": "6 x 6", "total_rooms": 15,
     "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Ensuite Bathroom", "Study Desk", "Wardrobe", "24/7 Power"],
     "features": ["Study Area", "Couch", "Work Desk"]},
    {"id": "room-royal-executive", "name": "ROYAL EXECUTIVE", "slug": "royal-executive",
     "description": "Standard Room with 6x7 Bed, Study Area, Couch", "short_description": "A Standard Room with 6x7 Bed, Study Area, Couch",
     "price": 37500, "category_id": "cat-executive", "division_id": "div-hotels",
     "capacity": 2, "bed_type": "King", "bed_size": "6 x 7", "total_rooms": 10,
     "amenities": ["Free WiFi", "Air Conditioning", "Smart TV", "Coffee Maker", "Work Desk", "24/7 Power"],
     "features": ["Study Area", "Couch", "Executive Lounge Access"]},
    {"id": "room-luxury-king", "name": "LUXURY KING BED", "slug": "luxury-king-bed",
     "description": "Living Room And Standard Bedroom with 6x7 Bed", "short_description": "A Living Room And Standard Bedroom with 6x7 Bed, Study Area, Couch",
     "price": 60000, "category_id": "cat-luxury", "division_id": "div-hotels",
     "capacity": 3, "bed_type": "King + Sofa Bed", "bed_size": "6 x 7", "total_rooms": 8,
     "amenities": ["Free WiFi", "2x Smart TV", "Living Room", "Mini Bar", "Study Area", "24/7 Power"],
     "features": ["Separate Living Room", "Study Area", "Couch"]},
    {"id": "room-executive-suite", "name": "EXECUTIVE SUITE", "slug": "executive-suite",
     "description": "Living Room + Bedroom with Mini Dining and Mini Kitchen", "short_description": "A Living Room And Standard Bedroom with Mini Dining, Mini Kitchen",
     "price": 110000, "category_id": "cat-suite", "division_id": "div-hotels",
     "capacity": 4, "bed_type": "King", "bed_size": "6 x 7", "total_rooms": 5,
     "amenities": ["Free WiFi", "Living Room", "Mini Kitchen", "Mini Dining", "DSTV + Netflix", "Complimentary Breakfast"],
     "features": ["Mini Dining", "Mini Kitchen", "Study Area", "Guest Toilet"]},
    {"id": "room-premium-royal", "name": "PREMIUM ROYAL SUITE", "slug": "premium-royal-suite",
     "description": "Flagship suite with jacuzzi and concierge", "short_description": "A Living Room And Standard Bedroom with Mini Dining, Mini Kitchen",
     "price": 120000, "category_id": "cat-suite", "division_id": "div-hotels",
     "capacity": 4, "bed_type": "Premium King", "bed_size": "6 x 7", "total_rooms": 3,
     "amenities": ["Free WiFi", "Jacuzzi", "Concierge", "Mini Kitchen", "Complimentary Breakfast + Dinner"],
     "features": ["Mini Dining", "Mini Kitchen", "Jacuzzi", "VIP Lounge"]},
]

PRODUCTS = [
    ("prod-sardine", "Sardine Bread", "sardine-bread", 1500, "UI-BRD-SAR-001", 500, True),
    ("prod-white-300", "Whole White Bread (Small)", "white-bread-small", 300, "UI-BRD-WHT-300", 1000, True),
    ("prod-white-500", "Whole White Bread (Medium)", "white-bread-medium", 500, "UI-BRD-WHT-500", 1000, False),
    ("prod-white-1000", "Whole White Bread (Jumbo)", "white-bread-jumbo", 1000, "UI-BRD-WHT-1000", 800, True),
    ("prod-wheat", "Whole Wheat Bread", "whole-wheat-bread", 1200, "UI-BRD-WHT-WHEAT", 600, True),
    ("prod-meatpie", "Meat Pie", "meat-pie", 500, "UI-SNK-MEAT-001", 300, False),
    ("prod-chickenpie", "Chicken Pie", "chicken-pie", 800, "UI-SNK-CHK-001", 250, True),
    ("prod-jamdough", "Jam Doughnuts", "jam-doughnuts", 500, "UI-SNK-JAM-001", 400, False),
    ("prod-eggbuns", "Egg Buns", "egg-buns", 500, "UI-SNK-EGG-001", 350, False),
    ("prod-milky", "Milky Doughnuts", "milky-doughnuts", 700, "UI-SNK-MLK-001", 300, True),
    ("prod-sausage", "Sausage Roll", "sausage-roll", 500, "UI-SNK-SAU-001", 400, False),
]

FACILITIES = [
    ("fac-pool", "Swimming Pool", "swimming-pool", "Outdoor pool with lifeguard & bar", "🏊", False),
    ("fac-gym", "Fitness Gym", "gym", "Cardio, weights & personal trainer", "🏋️", False),
    ("fac-restaurant", "Restaurant & Bar", "restaurant", "Local & continental cuisine", "🍽️", False),
    ("fac-conference", "Conference Halls", "conference", "Events, weddings & conferences", "🎤", True),
]

ADMINS = [
    # (email, first, last, role, division_id) — password: "password" (change after first login)
    ("admin@univent.ui.edu.ng", "Super", "Admin", "super_admin", None),
    ("hotels@univent.ui.edu.ng", "Hotel", "Manager", "division_admin", "div-hotels"),
    ("bakery@univent.ui.edu.ng", "Bakery", "Manager", "division_admin", "div-bakery"),
    ("petrol@univent.ui.edu.ng", "Petrol", "Manager", "division_admin", "div-petrol"),
    ("printing@univent.ui.edu.ng", "Print", "Manager", "division_admin", "div-printing"),
    ("hse@univent.ui.edu.ng", "HSE", "Manager", "division_admin", "div-hse"),
    ("consult@univent.ui.edu.ng", "Consult", "Manager", "division_admin", "div-consult"),
]
