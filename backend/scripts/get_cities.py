import requests
import pandas as pd
import os
from typing import Tuple

class CityDatabase:
    def __init__(self, csv_file: str = "cities.csv"):
        self.csv_file = csv_file
        self.data_url = "http://download.geonames.org/export/dump/cities15000.zip"

    def download_and_process_data(self) -> None:
        """Download, process, and sort city data by descending population, save to CSV"""
        local_zip = "cities15000.zip"
        if not os.path.exists(local_zip):
            response = requests.get(self.data_url)
            with open(local_zip, 'wb') as f:
                f.write(response.content)

        # Read the data (assumes manual unzip of cities15000.zip)
        df = pd.read_csv(
            "cities15000.txt",
            sep='\t',
            header=None,
            names=['geonameid', 'name', 'asciiname', 'alternatenames', 'latitude', 
                   'longitude', 'feature_class', 'feature_code', 'country_code', 
                   'cc2', 'admin1_code', 'admin2_code', 'admin3_code', 'admin4_code',
                   'population', 'elevation', 'dem', 'timezone', 'modification_date']
        )

        # Select only the essential columns
        result_df = df[['name', 'latitude', 'longitude', 'country_code', 'admin1_code', 'population']]

        # Sort by population descending
        result_df = result_df.sort_values(by='population', ascending=False)

        # Save to CSV
        result_df.to_csv(self.csv_file, index=False)
        print(f"City data saved to {self.csv_file}, sorted by descending population")

    def get_city(self, city_input: str) -> Tuple[str, float, float]:
        """Retrieve city coordinates from CSV (first match)"""
        df = pd.read_csv(self.csv_file)
        
        city_input = city_input.lower().strip()
        
        # Find first match by name
        matches = df[df['name'].str.lower() == city_input]
        if not matches.empty:
            row = matches.iloc[0]
            return (row['name'], row['latitude'], row['longitude'])
        
        raise ValueError(f"City '{city_input}' not found. Please specify more details (e.g., country code).")

def main():
    city_db = CityDatabase()
    
    if not os.path.exists(city_db.csv_file):
        print("Downloading and processing city data...")
        city_db.download_and_process_data()
    else:
        print(f"Using existing {city_db.csv_file}")

    test_cities = ["Portland", "Paris"]
    for city in test_cities:
        try:
            name, lat, lon = city_db.get_city(city)
            print(f"{city} -> {name}: ({lat}, {lon})")
        except ValueError as e:
            print(f"{city}: {str(e)}")

if __name__ == "__main__":
    main()