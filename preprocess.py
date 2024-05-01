import os
import json

def extract_info_from_filenames(directory):
    files = os.listdir(directory)
    companies = {}

    for filename in files:
        if filename.endswith(".csv"):
            parts = filename.split('_')
            company_name = parts[0]
            duration = '_'.join(parts[1:]).replace('.csv', '')

            if company_name not in companies:
                companies[company_name] = []
            companies[company_name].append(duration)

    return companies

def main():
    directory = 'data\LeetCode-Questions-CompanyWise'  # Directory where your CSVs are stored
    company_info = extract_info_from_filenames(directory)
    
    # Write the company information to a JSON file
    with open('company_data.json', 'w') as json_file:
        json.dump(company_info, json_file, indent=4)

if __name__ == "__main__":
    main()
