import csv
import json
from collections import defaultdict
import os

def extract_info_from_filenames(directory):
    """
    Extract company names and durations from CSV filenames in the specified directory.

    Parameters:
    directory (str): The directory containing the CSV files.

    Returns:
    dict: A dictionary where the keys are company names and the values are lists of durations.
    """
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

def process_company_data(directory, company_info):
    """
    Process CSV files and collect question data with frequency for each company and duration.

    Parameters:
    directory (str): Directory where the CSV files are stored.
    company_info (dict): Dictionary containing company names and their respective durations.

    Returns:
    dict: A dictionary containing question IDs, titles, and frequency per company and duration.
    """
    # Initialize a structure to hold question data
    question_data = defaultdict(lambda: {'title': None, 'companies': defaultdict(dict)})

    # Iterate over each company and their durations
    for company, durations in company_info.items():
        for duration in durations:
            csv_file = os.path.join(directory, f'{company}_{duration}.csv')
            
            # Open the CSV and read the questions
            with open(csv_file, 'r') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    question_id = row['ID']
                    question_title = row['Title']
                    frequency = row['Frequency']
                    
                    # If the question ID is already in the data, append company details
                    if not question_data[question_id]['title']:
                        question_data[question_id]['title'] = question_title
                    
                    # Add company and duration with frequency
                    question_data[question_id]['companies'][company][duration] = frequency

    return question_data

def save_json(data, filepath):
    """
    Save a dictionary as a JSON file.

    Parameters:
    data (dict): The data to save.
    filepath (str): The path where the JSON file will be saved.
    """
    with open(filepath, 'w') as json_file:
        json.dump(data, json_file, indent=4)

def load_json(filepath):
    """
    Load data from a JSON file.

    Parameters:
    filepath (str): The path to the JSON file.

    Returns:
    dict: The loaded data from the JSON file.
    """
    with open(filepath, 'r') as json_file:
        return json.load(json_file)

# Define the directory where CSV files are stored
directory = 'data/LeetCode-Questions-CompanyWise'

# Step 1: Extract company info from filenames
company_info = extract_info_from_filenames(directory)

# Step 2: Save the company info to a JSON file
save_json(company_info, 'company_data.json')

# Step 3: Load the company data
company_data = load_json('company_data.json')

# Step 4: Process CSV files and gather question data
question_data = process_company_data(directory, company_data)

# Step 5: Sort question data by question ID
sorted_question_data = dict(sorted(question_data.items(), key=lambda item: int(item[0])))

# Step 6: Save the sorted question data to a JSON file
save_json(sorted_question_data, 'preprocessed_questions_sorted.json')

print("Preprocessing complete!")
