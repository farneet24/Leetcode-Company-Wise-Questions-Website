from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException
from time import sleep
import os
import csv
import json

# PATH = 'C:\\Users\\Farneet\\Downloads\\chromedriver.exe'

# options = Options()
# options.add_experimental_option('detach', True)
# options.add_argument('--ignore-certificate-errors')
# cService = webdriver.ChromeService(executable_path=PATH)
# driver = webdriver.Chrome(service=cService, options=options)

# driver.get('https://leetcode.com/problemset/all/')

# def extract_problem_data():
#     try:
#         WebDriverWait(driver, 10).until(
#             EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div[role="rowgroup"]'))
#         )
#         elements = driver.find_elements(By.CSS_SELECTOR, 'div[role="row"]')
#         data = []
#         for element in elements[1:]:  # Skip the header row
#             text = element.text.split()
#             if len(text) >= 4:  # Ensuring there's enough data to parse
#                 problem_id = text[0].strip('.')
#                 problem_name = ' '.join(text[1:-2])
#                 acceptance_rate = text[-2].strip('%')
#                 difficulty = text[-1]
#                 data.append([problem_id, problem_name, acceptance_rate, difficulty])
#         return data
#     except StaleElementReferenceException:
#         return extract_problem_data()

# def click_next_button():
#     try:
#         next_button = WebDriverWait(driver, 1).until(
#             EC.presence_of_element_located((By.CSS_SELECTOR, 'button[aria-label="next"]:not([disabled])'))
#         )
#         if next_button.is_enabled():
#             next_button.click()
#             sleep(2)  # Wait for page to load
#             return True
#         else:
#             return False
#     except NoSuchElementException:
#         return False

# # File to store problem details
# file_path = 'problem_data.csv'
# if os.path.exists(file_path):
#     os.remove(file_path)  # Delete the file if it exists to start fresh

# # Write data to CSV file
# with open(file_path, 'w', newline='', encoding='utf-8') as file:
#     writer = csv.writer(file)
#     writer.writerow(['Problem ID', 'Problem Name', 'Acceptance Rate', 'Difficulty'])  # Column headers
#     while True:
#         problem_data = extract_problem_data()
#         if problem_data:
#             writer.writerows(problem_data)
#         if not click_next_button():
#             break

# driver.quit()


# File paths
csv_file_path = 'problem_data.csv'
json_file_path = 'problem_data.json'

data_dict = {}

with open(csv_file_path, 'r', newline='', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        problem_id = row['Problem ID']
        problem_data = {
            "id": row['Problem ID'],
            "name": row['Problem Name'],
            "acceptance": row['Acceptance Rate'],
            "difficulty": row['Difficulty'],
            "displayText": f'{row["Problem ID"]}. {row["Problem Name"]}'
        }
        data_dict[problem_id] = problem_data

# Write data to JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(data_dict, json_file, indent=4)

print("Conversion to JSON completed successfully!")

