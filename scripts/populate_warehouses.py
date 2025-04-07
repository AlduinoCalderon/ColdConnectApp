import os
import requests
import json
from typing import List, Dict
import random
from datetime import datetime, time
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de la API
API_URL = os.getenv('VITE_API_URL', 'https://coldstoragehub.onrender.com/API')
GOOGLE_MAPS_API_KEY = os.getenv('VITE_GOOGLE_MAPS_API_KEY')
GOOGLE_PLACES_API_KEY = os.getenv('VITE_GOOGLE_PLACES_API_KEY')

# Lista de estados posibles
STATUSES = ["active", "maintenance", "closed"]
AMENITIES = [
    {"type": "24/7 Access", "available": True, "description": "Acceso 24/7"},
    {"type": "Security Cameras", "available": True, "description": "Cámaras de seguridad"},
    {"type": "Climate Control", "available": True, "description": "Control de clima"},
    {"type": "Loading Dock", "available": True, "description": "Muelle de carga"},
    {"type": "Forklift", "available": True, "description": "Montacargas"}
]

def get_warehouses_from_google_maps(location: str, radius: int = 5000) -> List[Dict]:
    """Obtiene almacenes de Google Places API"""
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"cold storage warehouse {location}",
        "key": GOOGLE_PLACES_API_KEY,
        "radius": radius
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    warehouses = []
    for place in data.get("results", []):
        # Obtener detalles del lugar
        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        details_params = {
            "place_id": place["place_id"],
            "key": GOOGLE_PLACES_API_KEY,
            "fields": "name,formatted_address,geometry,opening_hours,formatted_phone_number"
        }
        
        details_response = requests.get(details_url, params=details_params)
        details_data = details_response.json()
        
        if details_data.get("result"):
            result = details_data["result"]
            warehouse = {
                "name": result.get("name", "Almacén sin nombre"),
                "address": result.get("formatted_address", ""),
                "status": random.choice(STATUSES),
                "amenities": random.sample(AMENITIES, random.randint(2, len(AMENITIES))),
                "operatingHours": {
                    "weekdays": [
                        {
                            "day": "Lunes",
                            "open": "08:00",
                            "close": "18:00"
                        },
                        {
                            "day": "Martes",
                            "open": "08:00",
                            "close": "18:00"
                        },
                        {
                            "day": "Miércoles",
                            "open": "08:00",
                            "close": "18:00"
                        },
                        {
                            "day": "Jueves",
                            "open": "08:00",
                            "close": "18:00"
                        },
                        {
                            "day": "Viernes",
                            "open": "08:00",
                            "close": "18:00"
                        }
                    ]
                },
                "location": {
                    "x": result["geometry"]["location"]["lng"],
                    "y": result["geometry"]["location"]["lat"]
                },
                "storageUnits": generate_storage_units()
            }
            warehouses.append(warehouse)
    
    return warehouses

def generate_storage_units() -> List[Dict]:
    """Genera unidades de almacenamiento aleatorias"""
    units = []
    num_units = random.randint(5, 20)
    
    for i in range(num_units):
        unit = {
            "unitId": i + 1,
            "warehouseId": 0,  # Se actualizará después
            "name": f"Unidad {i + 1}",
            "width": random.randint(2, 5),
            "height": random.randint(2, 4),
            "depth": random.randint(2, 5),
            "costPerHour": random.uniform(10, 50),
            "minTemp": random.randint(-20, 0),
            "maxTemp": random.randint(0, 10),
            "minHumidity": random.randint(30, 50),
            "maxHumidity": random.randint(50, 70),
            "status": random.choice(["available", "occupied", "maintenance", "reserved"])
        }
        units.append(unit)
    
    return units

def get_existing_owners() -> List[int]:
    """Obtiene IDs de dueños existentes de la API"""
    response = requests.get(f"{API_URL}/users")
    if response.status_code == 200:
        users = response.json()
        return [user["userId"] for user in users if user["role"] == "owner"]
    return []

def create_warehouses(warehouses: List[Dict]):
    """Crea los almacenes en la API"""
    owners = get_existing_owners()
    if not owners:
        print("No hay dueños existentes en la base de datos")
        return
    
    for warehouse in warehouses:
        # Asignar un dueño aleatorio
        warehouse["ownerId"] = random.choice(owners)
        
        response = requests.post(f"{API_URL}/warehouses", json=warehouse)
        if response.status_code == 201:
            print(f"Almacén creado: {warehouse['name']}")
        else:
            print(f"Error al crear almacén {warehouse['name']}: {response.text}")

def main():
    # Verificar que las API keys estén configuradas
    if not GOOGLE_MAPS_API_KEY or not GOOGLE_PLACES_API_KEY:
        print("Error: Las API keys de Google no están configuradas en el archivo .env")
        return

    # Buscar almacenes solo en Osaka
    location = "Osaka, Japan"
    print(f"Buscando almacenes en {location}...")
    warehouses = get_warehouses_from_google_maps(location)
    print(f"Encontrados {len(warehouses)} almacenes en {location}")
    
    if warehouses:
        create_warehouses(warehouses)
    else:
        print("No se encontraron almacenes en Osaka")

if __name__ == "__main__":
    main() 