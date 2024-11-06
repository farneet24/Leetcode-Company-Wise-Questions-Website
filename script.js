// <----------------- Dropdown Functionality ----------------->
// Accessing the dropdown elements
const companySelect = document.getElementById("company-select");
const durationSelect = document.getElementById("duration-select");
const sortSelect = document.getElementById("sort-select");
const difficultyFilter = document.getElementById("difficulty-filter");
const currentSelection = document.getElementById("current-selection");

// Event listener to handle the dropdown selection
document.addEventListener("DOMContentLoaded", function () {
  fetch("company_data.json")
    .then((response) => response.json())
    .then((data) => initializeDropdowns(data))
    .catch((error) => console.error("Error loading company data:", error));
});

// Function to initialize the dropdowns
function initializeDropdowns(companyData) {
  Object.keys(companyData).forEach((company) => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company.charAt(0).toUpperCase() + company.slice(1);
    companySelect.appendChild(option);
  });

  companySelect.addEventListener("change", function () {
    const selectedCompany = companySelect.value;
    const durations = companyData[selectedCompany];

    durationSelect.innerHTML = '<option value="">Select Duration</option>';
    durations.forEach((duration) => {
      const option = document.createElement("option");
      option.value = duration;
      option.textContent = formatDuration(duration);
      durationSelect.appendChild(option);
    });

    updateCompanyLogo(selectedCompany);
  });

  function updateDisplay() {
    const company = companySelect.value;
    const duration = durationSelect.value;
    const sort = sortSelect.value;
    const difficulty = difficultyFilter.value;

    const logoImg = document.getElementById("company-logo");
    const currentSelection = document.getElementById("current-selection");

    if (company && duration) {
      currentSelection.textContent = `${
        company.charAt(0).toUpperCase() + company.slice(1)
      } - ${formatDuration(duration)} Problems`;
      updateCompanyLogo(company);
      loadCompanyQuestions(company, duration, sort, difficulty);
    } else {
      logoImg.style.display = "none";
      currentSelection.textContent = "";
      clearTable();
    }
  }

  companySelect.addEventListener("change", updateDisplay);
  durationSelect.addEventListener("change", updateDisplay);
  sortSelect.addEventListener("change", updateDisplay);
  difficultyFilter.addEventListener("change", updateDisplay);
}






// <----------------- Company Logo Functionality ----------------->
// Function to update the company logo
function updateCompanyLogo(companyName) {
  const logoImg = document.getElementById("company-logo");
  logoImg.src = `https://logo.clearbit.com/${companyName}.com`;
  logoImg.style.display = "block";
}

// Function to load the company questions
function loadCompanyQuestions(company, duration, sort, difficulty) {
  const csvFile = `data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
  fetch(csvFile)
    .then((response) => response.text())
    .then((csvText) => {
      displayTable(csvText, sort, difficulty);
    })
    .catch((error) => console.error("Failed to load data:", error));
}





// <----------------- Table Display and Manipulation Functionality ----------------->
// Function to display the table when company and time are selected
function displayTable(csvData, sort, difficulty) {
  
  // Get the container for the table
  const tableContainer = document.getElementById("table-container");

  if (tableContainer.innerHTML == "") {
    if (window.problemsSolvedPerDayChart) {
      window.problemsSolvedPerDayChart.destroy();
    }
    if (window.problemsSolvedByHourChart) {
      window.problemsSolvedByHourChart.destroy();
    }
  }

  tableContainer.innerHTML = ""; // Clear previous content

  // Split CSV data into rows and filter out any empty rows
  let rows = csvData.split("\n").filter((row) => row.trim());
  // console.log("Rows", rows);
  // Extract the header row
  const header = rows.shift();
  rows.unshift(header + ",Attempted?,Date Solved");
  // header += ",Attempted,Date Solved";

  // console.log("Header", header);
  // Sort rows if sort option is provided
  if (sort) {
    rows = sortRows(rows, sort, header);
  }

  // Filter rows by difficulty if the difficulty filter is applied
  if (difficulty) {
    rows = filterRows(rows, difficulty, header);
  }

  // Reinsert the header at the beginning of the rows array

  // Create a new table element
  const table = document.createElement("table");
  table.classList.add("styled-table"); // Apply custom table styles
  let checkboxCount = 0; // Counter for the checkboxes
  // Iterate over each row to create table rows
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    const cells = row.split(",");

    if (index > 0) {
      cells.push(""); // For 'Attempted' checkbox
      cells.push(""); // For 'Date Solved' input
    }

    cells.forEach((cell, cellIndex) => {
      const cellElement = document.createElement(index === 0 ? "th" : "td");
      cellElement.classList.add("border", "px-4", "py-2", "text-center"); // Apply Tailwind CSS classes

      if (index === 0) {
        cellElement.style.backgroundColor = "#009879"; // Header cells background color
        cellElement.style.color = "white";
      }

      if (index === 0 && cellIndex === cells.length - 2) {
        // Set text for 'Attempted' header
        cellElement.textContent = "Attempted?";
      } else if (index === 0 && cellIndex === cells.length - 1) {
        // Set text for 'Attempted' header
        cellElement.textContent = "Date Solved";
      } else if (index > 0 && cellIndex === cells.length - 2) {
        // Checkbox for 'Attempted'
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-blue-600");
        checkbox.id = `attempt-${cells[0]}`;
        checkbox.checked = JSON.parse(
          localStorage.getItem(checkbox.id) || "false"
        );

        if (checkbox.checked) {
          checkboxCount++; // count the already checked boxes
        }

        checkbox.addEventListener("change", function () {
          const dateInput = document.getElementById(`date-${cells[0]}`);
          if (this.checked) {
            const currentDate = formatDate(new Date());
            dateInput.value = currentDate;
            localStorage.setItem(`date-${cells[0]}`, currentDate);
            localStorage.setItem(`attempt-${cells[0]}`, this.checked);
            checkboxCount++; // if checked, increment the counter
          } else {
            dateInput.value = "";
            localStorage.removeItem(`date-${cells[0]}`);
            localStorage.removeItem(`attempt-${cells[0]}`);
            checkboxCount--; // if unchecked, decrement the counter
          }
          updateProgress(); // Update the progress bar
        });

        const label = document.createElement("label");
        label.classList.add("inline-flex", "justify-center", "items-center");
        label.appendChild(checkbox);
        cellElement.appendChild(label);
      } else if (index > 0 && cellIndex === cells.length - 1) {
        // Input for 'Date Solved'
        const dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.id = `date-${cells[0]}`;
        dateInput.classList.add("form-input", "text-center");
        dateInput.value = localStorage.getItem(`date-${cells[0]}`) || "";
        dateInput.disabled = true; // Disable the input field, can't change the date now

        dateInput.addEventListener("change", function () {
          localStorage.setItem(this.id, this.value);
        });

        cellElement.appendChild(dateInput);
      } else if (index > 0 && cellIndex === 5) {
        // Handling link cells
        cellElement.style.display = "flex";
        cellElement.style.flexDirection = "row-reverse";
        cellElement.style.justifyContent = "space-around";
        const link = document.createElement("a");
        link.href = cell;
        link.target = "_blank";
        const leetCodeIcon = new Image();
        leetCodeIcon.src = "leetcode.svg";
        leetCodeIcon.alt = "LeetCode";
        leetCodeIcon.style.alignItems = "center";
        leetCodeIcon.style.height = "47px";
        leetCodeIcon.style.width = "30px";
        link.appendChild(leetCodeIcon);
        cellElement.appendChild(link);
      } else if (cellIndex === 3) {
        // Special formatting for the Difficulty column
        const difficultyTag = document.createElement("span");
        difficultyTag.classList.add("difficulty-tag");

        if (cell === "Easy") {
          difficultyTag.classList.add("difficulty-easy");
        } else if (cell === "Medium") {
          difficultyTag.classList.add("difficulty-medium");
        } else if (cell === "Hard") {
          difficultyTag.classList.add("difficulty-hard");
        }
        difficultyTag.textContent = cell;
        cellElement.appendChild(difficultyTag);
      } else if (index > 0 && cellIndex === 4) {
        // Formatting for frequency cells
        cellElement.textContent = `${parseFloat(cell).toFixed(2)}%`;
      } else {
        // Normal cell handling
        cellElement.textContent = cell;
      }

      tr.appendChild(cellElement);
    });

    table.appendChild(tr);
  });

  // Create a div to display the number of questions
  const rowCountDisplay = document.createElement("div");
  rowCountDisplay.className = "row-count-display"; // Assign the class to the div

  // Create a container for the image and text
  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container"; // New container for flex alignment

  // Create the image element
  const img = document.createElement("img");
  img.src =
    "https://cdn-icons-png.freepik.com/256/15441/15441427.png?semt=ais_hybrid";
  img.alt = "Statistics Icon";
  img.className = "row-count-icon"; // Assign a class for separate CSS styling

  // Create the text content
  const textContent = document.createElement("div");
  textContent.className = "progress-text";
  textContent.textContent = `Progress: ${checkboxCount} out of ${
    rows.length - 1
  } answered (${((checkboxCount / (rows.length - 1)) * 100).toFixed(2)}%)`;

  // Append the image and text to the content container
  contentContainer.appendChild(img);
  contentContainer.appendChild(textContent);

  // Create the text content (as tooltip text)
  const tooltipText = document.createElement("span");
  tooltipText.className = "tooltip-text";
  let questionRemaining = rows.length - 1 - checkboxCount;
  tooltipText.textContent = `${questionRemaining} ${
    questionRemaining == 1 ? "question" : "questions"
  } remaining`;

  // Create the progress bar container
  const progressBarContainer = document.createElement("div");
  progressBarContainer.className = "progress-bar-container";

  // Create the progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";

  // Set the progress bar width based on the percentage
  const progressPercentage = (checkboxCount / (rows.length - 1)) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  // Append elements to the display container
  progressBarContainer.appendChild(progressBar);
  rowCountDisplay.appendChild(contentContainer);
  rowCountDisplay.appendChild(progressBarContainer);
  rowCountDisplay.appendChild(tooltipText);

  // Update the progress bar when the checkboxes are changed
  function updateProgress() {
    const totalQuestions = rows.length - 1;
    const progressPercentage = (checkboxCount / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    textContent.textContent = `Progress: ${checkboxCount} out of ${totalQuestions} answered (${progressPercentage.toFixed(2)}%)`;
    tooltipText.textContent = `${totalQuestions - checkboxCount} ${totalQuestions - checkboxCount === 1 ? "question" : "questions"} remaining`;
  }

  // Insert the row count above the table
  tableContainer.insertBefore(rowCountDisplay, tableContainer.firstChild);
  tableContainer.appendChild(table);
}

// Function to sort the rows based on the selected column
function sortRows(rows, sort, header) {
  const headerParts = header.split(",");
  const sortKey = sort.split("-")[0].trim();
  // Adjust the sort key to match the header case
  const capitalizedSortKey =
    sortKey.charAt(0).toUpperCase() + sortKey.slice(1).toLowerCase();
  const columnIndex = headerParts.indexOf(capitalizedSortKey);

  if (columnIndex === -1) {
    console.error("Sort key not found in header:", capitalizedSortKey);
    return rows; // Return unsorted rows to prevent further errors
  }

  const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
  const isAscending = sort.includes("asc"); // Determine sorting order

  rows.sort((a, b) => {
    let rowA = a.split(",");
    let rowB = b.split(",");
    let valA = rowA[columnIndex];
    let valB = rowB[columnIndex];

    if (valA === undefined || valB === undefined) {
      console.error(
        "Undefined value found for sort key",
        capitalizedSortKey,
        "at index",
        columnIndex
      );
      return 0;
    }

    valA = valA.trim();
    valB = valB.trim();

    if (capitalizedSortKey === "Frequency") {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else if (capitalizedSortKey === "Difficulty") {
      valA = difficultyOrder[valA];
      valB = difficultyOrder[valB];
    }

    if (valA < valB) {
      return isAscending ? -1 : 1; // Adjust return based on sorting order
    } else if (valA > valB) {
      return isAscending ? 1 : -1; // Adjust return based on sorting order
    }
    return 0;
  });
  return rows;
}

// Define the filterRows function
function filterRows(rows, difficulty, header) {
  // Find the index of the "Difficulty" column from the header
  const headers = header.split(",");
  const difficultyIndex = headers.indexOf("Difficulty");

  // Return the header and rows where the difficulty matches
  return rows.filter((row, index) => {
    // Include the header row by default
    if (index === 0) return true;

    const cells = row.split(",");
    // Compare the cell value with the desired difficulty
    return cells[difficultyIndex] === difficulty;
  });
}












// <----------------- Time Functionalities ----------------->
function formatDate(date) {
  const nth = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  let day = date.getDate();
  let month = date.toLocaleString("default", { month: "long" });
  let year = date.getFullYear();
  let hour = date.getHours() % 12 || 12; // Convert to 12 hour format
  let minute = date.getMinutes().toString().padStart(2, "0");
  let ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${day}${nth(day)} ${month} ${year}, ${hour}:${minute} ${ampm}`;
}

function formatDuration(duration) {
  return duration
    .replace("months", " Months")
    .replace("year", " Year")
    .replace("alltime", "All Time");
}

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isLast7Days(date, now) {
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  return date >= oneWeekAgo && date <= now;
}

function isLastMonth(date, now) {
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  return date >= oneMonthAgo && date <= now;
}

// Updated to format date strings for ChartJS
function parseDate(input) {
  if (!input) {
    return new Date();
  }
  const parts = input.match(
    /(\d+)(st|nd|rd|th)? (\w+) (\d+), (\d+):(\d+) (AM|PM)/
  );
  if (!parts) return new Date(input); // Fallback to default parser if regex fails

  const num = parseInt(parts[1], 10);
  const month = parts[3];
  const year = parseInt(parts[4], 10);
  let hour = parseInt(parts[5], 10);
  const minute = parseInt(parts[6], 10);
  const ampm = parts[7];

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return new Date(`${month} ${num}, ${year} ${hour}:${minute}:00`);
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDateWithEmoji(date) {
  const nth = (d) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getTimeEmoji = (hour) => {
    if (hour >= 5 && hour < 12) return "🌅"; // Morning
    if (hour >= 12 && hour < 18) return "☀️"; // Afternoon
    if (hour >= 18 && hour < 22) return "🌆"; // Evening
    return "🌙"; // Night
  };

  let day = date.getDate();
  let month = date.toLocaleString("default", { month: "long" });
  let year = date.getFullYear();
  let hour = date.getHours();
  let minute = date.getMinutes().toString().padStart(2, "0");
  let ampm = hour >= 12 ? "PM" : "AM";
  let emoji = getTimeEmoji(hour);

  hour = hour % 12 || 12; // Convert to 12 hour format

  return `${emoji} ${day}${nth(
    day
  )} ${month} ${year}, ${hour}:${minute} ${ampm}`;
}














// <----------------- Search Functionality ----------------->
// Handling the search functionality
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadAndSetIndex();
    initializeSearchRecommendations();
  } catch (error) {
    console.error("Failed to initialize search:", error);
  }
});

document.getElementById("search-button").addEventListener("click", () => {
  const id = document.getElementById("id-search").value.trim();
  if (id) {
    searchByID(id);
  }
});

// Event listener to handle "Enter" key in the input field
document.getElementById("id-search").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default action to avoid submitting the form
    const id = document.getElementById("id-search").value.trim();
    if (id) {
      searchByID(id);
    }
  }
});

function searchByID(id) {
  fetch("preprocessed_companies.json")
    .then((response) => response.json())
    .then((data) => {
      // If the question was asked in any company, then print the companies using the table
      if (data[id]) {
        const problem = data[id];
        const title = problem.title;
        const problemNameSlug = title.toLowerCase().replace(/ /g, "-");
        const link = `https://leetcode.com/problems/${problemNameSlug}/description/`;
        displaySearchResults(problem.companies, title, link);
      } else {
        // If the question was not asked in any company, then search in the problem data
        return fetch("problem_data.json");
      }
    }).then((response) => {
      if (response) return response.json();
    }).then((problemData) => {
      // The problem title is extracted from the problems dataset and then it is printed without companies.
      if (problemData) {
        const problem = problemData[id];
        console.log(problem);
        if (problem) {
          const problemNameSlug = problem["name"].toLowerCase().replace(/ /g, "-");
          const problemLink = `https://leetcode.com/problems/${problemNameSlug}/description/`;
          displaySearchResults({}, problem["name"], problemLink);
        }
      }
    }).catch((error) => console.error("Error loading data:", error));
}

// Preparing the data for the Search functionality
let searchIndex;
let searchArray = [];

async function loadAndSetIndex() {
  try {
    const response = await fetch("problem_data.json");
    const data = await response.json();
    searchIndex = data;
    searchArray = Object.values(searchIndex);
    return searchIndex;
  } catch (error) {
    console.error("Error loading search index:", error);
    throw error;
  }
}

// Add the recommendation UI and functionality
function initializeSearchRecommendations() {
  const searchInput = document.getElementById('id-search');
  const searchButton = document.getElementById('search-button');
  let recommendationsContainer = null;

  // Create recommendations container
  function createRecommendationsContainer() {
    const container = document.createElement('div');
    container.className = 'absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto';
    container.style.top = '100%';
    container.style.display = 'none';
    searchInput.parentElement.appendChild(container);
    return container;
  }

  // Create recommendation item
  function createRecommendationItem(problem) {
    const item = document.createElement('div');
    item.className = 'px-4 py-2 hover:bg-gray-300 cursor-pointer flex items-center justify-between';
    
    const leftContent = document.createElement('div');
    leftContent.className = 'flex-1 text-black';
    leftContent.textContent = problem.displayText;

    const rightContent = document.createElement('div');
    rightContent.className = `text-sm ${getDifficultyColor(problem.difficulty)}`;
    rightContent.textContent = problem.difficulty;

    item.appendChild(leftContent);
    item.appendChild(rightContent);

    item.addEventListener('click', () => {
      searchInput.value = problem.id;
      hideRecommendations();
      searchButton.click();
    });

    return item;
  }

  // Get color class based on difficulty
  function getDifficultyColor(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  // Show recommendations
  function showRecommendations(recommendations) {
    if (!recommendationsContainer) {
      recommendationsContainer = createRecommendationsContainer();
    }

    recommendationsContainer.innerHTML = '';
    
    if (recommendations.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'px-4 py-2 text-gray-500';
      noResults.textContent = 'No matching problems found';
      recommendationsContainer.appendChild(noResults);
    } else {
      // Show all recommendations instead of limiting to 5
      recommendations.forEach(problem => {
        recommendationsContainer.appendChild(createRecommendationItem(problem));
      });
    }

    recommendationsContainer.style.display = 'block';
  }

  // Hide recommendations
  function hideRecommendations() {
    if (recommendationsContainer) {
      recommendationsContainer.style.display = 'none';
    }
  }

  // Filter problems based on input
  function filterProblems(query) {
    query = query.toLowerCase();
    return searchArray.filter(problem => {
      return problem.id.includes(query) || 
             problem.name.toLowerCase().includes(query) ||
             problem.displayText.toLowerCase().includes(query);
    });
  }

  // Add event listeners
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
      const recommendations = filterProblems(query);
      showRecommendations(recommendations);
    } else {
      hideRecommendations();
    }
  });

  // Close recommendations when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !recommendationsContainer?.contains(e.target)) {
      hideRecommendations();
    }
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (!recommendationsContainer || recommendationsContainer.style.display === 'none') return;

    const items = recommendationsContainer.children;
    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('bg-gray-300'));

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          items[currentIndex]?.classList.remove('bg-gray-300');
          items[currentIndex + 1].classList.add('bg-gray-300');
          items[currentIndex + 1].scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex]?.classList.remove('bg-gray-300');
          items[currentIndex - 1].classList.add('bg-gray-300');
          items[currentIndex - 1].scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'Enter':
        if (currentIndex !== -1) {
          e.preventDefault();
          items[currentIndex].click();
        }
        break;
      case 'Escape':
        hideRecommendations();
        break;
    }
  });
}

function displaySearchResults(data, title, link) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";

  const titleLinkContainer = document.createElement("div");
  titleLinkContainer.style.display = "flex";
  titleLinkContainer.style.alignItems = "center";
  titleLinkContainer.style.justifyContent = "center";
  titleLinkContainer.style.marginBottom = "10px";

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  titleElement.style.fontSize = "30px";
  titleElement.style.marginRight = "10px";

  const titleCheckbox = document.createElement("input");
  titleCheckbox.type = "checkbox";
  titleCheckbox.id = "title-checkbox";
  titleCheckbox.classList.add(
    "form-checkbox",
    "h-5",
    "w-5",
    "text-blue-600",
    "mr-2"
  );

  const checkboxId = parseInt(document.getElementById("id-search").value);

  function getLocalStorageItem(key, checkboxId, defaultValue = false) {
    let checkAttempted = localStorage.getItem(`${key}-${checkboxId}`);
    return JSON.parse(checkAttempted || defaultValue);
  }

  titleCheckbox.checked = getLocalStorageItem("attempt", checkboxId);

  titleCheckbox.addEventListener("change", function () {
    if (this.checked) {
      localStorage.setItem(`attempt-${checkboxId}`, this.checked);
      const currentDate = formatDate(new Date());
      localStorage.setItem(`date-${checkboxId}`, currentDate);
    } else {
      localStorage.removeItem(`attempt-${checkboxId}`);
      localStorage.removeItem(`date-${checkboxId}`);
      localStorage.removeItem(`companies-${checkboxId}`);
    }
  });

  const linkElement = document.createElement("a");
  if (link) {
    linkElement.href = link;
    linkElement.target = "_blank";
    linkElement.style.display = "inline-flex";
    linkElement.style.alignItems = "center";
    linkElement.style.textDecoration = "none";

    const leetCodeIcon = new Image();
    leetCodeIcon.src = "leetcode.svg";
    leetCodeIcon.alt = "LeetCode";
    leetCodeIcon.style.height = "34px";
    leetCodeIcon.style.width = "34px";
    leetCodeIcon.style.marginRight = "5px";
    leetCodeIcon.style.backgroundColor = "white";
    leetCodeIcon.style.borderRadius = "50%";
    leetCodeIcon.style.padding = "5px";
    leetCodeIcon.style.display = "flex";
    leetCodeIcon.style.justifyContent = "center";
    leetCodeIcon.style.alignItems = "center";
    leetCodeIcon.style.boxSizing = "border-box";

    linkElement.insertBefore(leetCodeIcon, linkElement.firstChild);
  }

  titleLinkContainer.appendChild(titleCheckbox);
  titleLinkContainer.appendChild(titleElement);
  titleLinkContainer.appendChild(linkElement);
  tableContainer.appendChild(titleLinkContainer);

  // If no company asked that questions, simply print the title and link
  if (Object.keys(data).length === 0) {
    const noDataMsg = document.createElement("p");
    noDataMsg.textContent = "The question was not asked in any company.";
    noDataMsg.style.textAlign = "center";
    noDataMsg.style.fontSize = "20px";
    tableContainer.appendChild(noDataMsg);
    return;
  }

  const companyCount = document.createElement("p");
  companyCount.textContent = `Number of companies: ${Object.keys(data).length}`;
  companyCount.style.textAlign = "center";
  companyCount.style.fontSize = "20px";
  tableContainer.appendChild(companyCount);

  const table = document.createElement("table");
  table.classList.add("styled-table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Create the header cells
  ["Company", "Frequency"].forEach(headerText => {
    const header = document.createElement("th");
    header.style.backgroundColor = "#556FB5";
    header.style.color = "white";
    header.textContent = headerText;
    headerRow.appendChild(header);
  });



  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Making the body of the table where each company is shown
  const tbody = document.createElement("tbody");
  Object.entries(data).forEach(([company, frequencies]) => {
    const row = document.createElement("tr"); // Create a new row

    // Create the company cell
    const companyNameCell = document.createElement("td");
    companyNameCell.style.display = "flex";
    companyNameCell.style.alignItems = "center";
    
    const companyLogo = document.createElement("img");
    companyLogo.src = `https://logo.clearbit.com/${company}.com`;
    companyLogo.style.height = "24px";
    companyNameCell.appendChild(companyLogo);
    companyNameCell.appendChild(
      document.createTextNode(
        company.charAt(0).toUpperCase() + company.slice(1).toLowerCase()
      )
    );
    row.appendChild(companyNameCell);

    // Create the frequency cell
    const frequencyCell = document.createElement("td");
    const periods = {
      "6months": "6 months",
      "1year": "1 year",
      "2year": "2 years",
      "alltime": "all time"
    };

    Object.entries(frequencies).forEach(([period, frequency]) => {
      const tag = document.createElement("span");
      const percentageValue = Math.ceil(parseFloat(frequency) * 100);
      tag.textContent = `${percentageValue}% (${periods[period]})`;
      tag.classList.add("frequency-tag");
      tag.style.marginRight = "10px";

      if (percentageValue >= 70) {
        tag.classList.add("high-frequency");
      } else if (percentageValue >= 40) {
        tag.classList.add("medium-frequency");
      } else {
        tag.classList.add("low-frequency");
      }
      frequencyCell.appendChild(tag);
    });
    row.appendChild(frequencyCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
}












// <----------------- Clear Functionality ----------------->
function clearUIElements() {
  // Clear the table
  document.getElementById("table-container").innerHTML = "";
  document.getElementById("current-selection").innerText = "";
  document.getElementById("company-logo").style.display = "none";
  document.getElementById("id-search").value = "";
  document.getElementById("options").style.display = "none"; // Show the dropdown

  document.getElementById("newEntryForm").classList.add("hidden");
  document.getElementById("summaryTable").classList.add("hidden");
  document.getElementById("uniqueId").value = "";

  if (window.problemsSolvedPerDayChart) {
    window.problemsSolvedPerDayChart.destroy();
  }
  if (window.problemsSolvedByHourChart) {
    window.problemsSolvedByHourChart.destroy();
  }

  document.getElementById("company-select").selectedIndex = 0;
  document.getElementById("duration-select").selectedIndex = 0;
  document.getElementById("sort-select").selectedIndex = 0;
  document.getElementById("difficulty-filter").selectedIndex = 0;
}

// Add the event listener to the clear button
document
  .getElementById("clear-button")
  .addEventListener("click", clearUIElements);

function clearTable() {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
}

















// <----------------- Analysis and Chart Functionality ----------------->
document.getElementById("analysisBtn").addEventListener("click", function () {
  document.getElementById("options").style.display = "block";
  updateCharts();
});

document.getElementById("timeFrame").addEventListener("change", function () {
  updateCharts();
});

function updateCharts() {
  const problemsSolvedPerDayCtx = document
    .getElementById("problemsSolvedPerDay")
    .getContext("2d");
  const problemsSolvedByHourCtx = document
    .getElementById("problemsSolvedByHour")
    .getContext("2d");
  const selectedTimeFrame = document.getElementById("timeFrame").value;

  if (window.problemsSolvedPerDayChart) {
    window.problemsSolvedPerDayChart.destroy();
  }
  if (window.problemsSolvedByHourChart) {
    window.problemsSolvedByHourChart.destroy();
  }

  const solvedData = {};
  const timeData = Array(24).fill(0);
  const now = new Date();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("date-")) {
      const value = localStorage.getItem(key);
      if (value) {
        const date = parseDate(value);
        const dayKey = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const hour = date.getHours();

        if (selectedTimeFrame === "month-wise") {
          solvedData[monthKey] = (solvedData[monthKey] || 0) + 1;
        } else {
          if (
            (selectedTimeFrame === "week" && isLast7Days(date, now)) ||
            (selectedTimeFrame === "month" && isLastMonth(date, now))
          ) {
            solvedData[dayKey] = (solvedData[dayKey] || 0) + 1;
          }
        }

        timeData[hour]++;
      }
    }
  }

  // Handle missing data for month-wise and time frames
  let labels, data;
  if (selectedTimeFrame === "month-wise") {
    const year = new Date().getFullYear();
    labels = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    data = labels.map((date) => ({
      x: date,
      y: solvedData[`${date.getFullYear()}-${date.getMonth() + 1}`] || 0,
    }));
  } else {
    const startDate =
      selectedTimeFrame === "week"
        ? new Date(now.setDate(now.getDate() - 7))
        : new Date(now.setMonth(now.getMonth() - 1));
    const endDate = new Date();
    labels = [];
    for (
      let dt = new Date(startDate);
      dt <= endDate;
      dt.setDate(dt.getDate() + 1)
    ) {
      labels.push(new Date(dt));
    }
    data = labels.map((date) => ({
      x: date,
      y:
        solvedData[
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        ] || 0,
    }));
  }

  window.problemsSolvedPerDayChart = new Chart(problemsSolvedPerDayCtx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Problems Solved",
          data: data,
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: selectedTimeFrame === "month-wise" ? "month" : "day",
            tooltipFormat: "do MMM yyyy",
            displayFormats: {
              day: "do MMM yyyy",
              month: "MMM yyyy",
            },
          },
          ticks: {
            color: "rgb(255, 253, 208)", // Cream color for X-axis ticks
          },
          title: {
            display: true,
            text: selectedTimeFrame === "month-wise" ? "Month" : "Date",
            color: "rgb(255, 253, 208)",
            font: {
              size: 16, // Increased font size for Y-axis title
            },
            padding: {
              top: 20, // Increase padding top for X-axis title
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Problems Solved",
            color: "rgb(255, 253, 208)",
            font: {
              size: 16, // Font size for Y-axis title
            },
            padding: {
              bottom: 20, // Increase padding bottom for Y-axis title
            },
          },
          ticks: {
            color: "rgb(255, 253, 208)", // Cream color for Y-axis ticks
          },
        },
      },
      plugins: {
        legend: {
          position: "top", // Positions the legend at the top
          align: "end", // Aligns the legend to the right
          labels: {
            color: "rgb(255, 253, 208)", // Cream color for legend labels
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
    },
  });

  window.problemsSolvedByHourChart = new Chart(problemsSolvedByHourCtx, {
    type: "bar",
    data: {
      labels: Array.from(
        { length: 24 },
        (_, i) => `${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`
      ),
      datasets: [
        {
          label: "Problems Solved",
          data: timeData,
          borderColor: "rgb(21, 179, 146)",
          borderWidth: 3,
          backgroundColor: "rgba(21, 179, 146, 0.4)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour of the Day",
            color: "rgb(255, 253, 208)",
            font: {
              size: 16, // Increased font size for Y-axis title
            },
            padding: {
              top: 20, // Increase padding top for X-axis title
            },
          },
          ticks: {
            color: "rgb(255, 253, 208)", // Cream color for Y-axis ticks
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Problems Solved",
            color: "rgb(255, 253, 208)",
            font: {
              size: 16, // Font size for Y-axis title
            },
            padding: {
              bottom: 20, // Increase padding bottom for Y-axis title
            },
          },
          ticks: {
            color: "rgb(255, 253, 208)", // Cream color for Y-axis ticks
          },
        },
      },
      plugins: {
        legend: {
          position: "top", // Positions the legend at the top
          align: "end", // Aligns the legend to the right
          labels: {
            color: "rgb(255, 253, 208)", // Cream color for legend labels
          },
        },
      },
    },
  });
}






















// <----------------- New Entry Functionality ----------------->
document
  .getElementById("dropdownButton")
  .addEventListener("click", function () {
    document.getElementById("dropdownMenu").classList.toggle("hidden");
  });

function toggleNewEntryForm() {
  document.getElementById("newEntryForm").classList.toggle("hidden");
}

let selectedCompanies = [];

document.addEventListener("DOMContentLoaded", function () {
  var multiSelectInstance = new MultiSelectTag("companies", {
    onChange: function (values) {
      selectedCompanies = values.map((item) => item.value); // Extract the value and store in the global variable
      console.log("Selected companies: ", selectedCompanies);
    },
  });
});




















// <----------------- Data Storage and Retrieval ----------------->
// Function to store the data in local storage
async function storeData() {
  const uniqueId = document.getElementById("uniqueId").value;
  const companies = selectedCompanies;
  const currentDate = formatDate(new Date());

  if (!uniqueId || isNaN(uniqueId)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter a numeric Unique ID.",
    });
    return;
  }

  if (localStorage.getItem(`attempt-${uniqueId}`)) {
    Swal.fire({
      icon: "error",
      title: "Duplicate Entry",
      text: "This Unique ID already exists. Please use a different ID.",
    });
    return;
  }

  if (companies.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please select at least one company.",
    });
    return;
  }

  localStorage.setItem(`attempt-${uniqueId}`, true);
  localStorage.setItem(`date-${uniqueId}`, currentDate);
  localStorage.setItem(`companies-${uniqueId}`, companies.join(", "));

  Swal.fire({
    title: "Success!",
    text: "Question submitted successfully!",
    icon: "success",
    confirmButtonText: "Cool",
  });

  document.getElementById("uniqueId").value = "";
  document.getElementById("companies").selectedIndex = -1;
}




















// <----------------- Summary Display ----------------->
// Function to display the summary of questions solved
async function showSummary() {
  const table = document.getElementById("summaryTable");
  const banner = document.getElementById("questionCountBanner");
  const heading = document.getElementById("summaryHeading");
  heading.classList.remove = "hidden";
  heading.style.display = "block";

  table.classList.remove("hidden");
  table.classList.add("styled-table");
  const tbody = table.querySelector("tbody");

  // Clear previous rows
  while (tbody.rows.length > 0) {
    tbody.deleteRow(0);
  }

  try {
    const response = await fetch("problem_data.json");
    const problems = await response.json();

    let entries = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("attempt-")) {
        const id = key.split("-")[1];
        const problem = problems[id];
        if (!problem) {
          console.log("This problem failed: ", id);
          return;
        }
        const name = problem["name"];
        const difficulty = problem["difficulty"];
        const linkURL =
          "https://leetcode.com/problems/" +
          name.replace(/\s+/g, "-").toLowerCase();
        const companies = localStorage.getItem(`companies-${id}`);
        const date = parseDate(localStorage.getItem(`date-${id}`));
        // Store entries for sorting
        entries.push({ id, name, linkURL, difficulty, companies, date });
      }
    });

    // Sort entries by date in descending order
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update banner with the count of questions solved
    banner.textContent = `Total Questions Solved: ${entries.length}`; // Update the banner with the count
    banner.style.padding = "10px";
    banner.style.marginBottom = "10px";
    banner.style.backgroundColor = "#4A249D";
    banner.style.textAlign = "center";
    banner.style.fontSize = "18px";
    banner.style.fontWeight = "bold";

    // Append rows based on sorted entries
    entries.forEach((entry) => {
      const row = tbody.insertRow(-1);
      const cells = [
        row.insertCell(0),
        row.insertCell(1),
        row.insertCell(2),
        row.insertCell(3),
        row.insertCell(4),
        row.insertCell(5),
      ];
      cells.forEach(
        (cell) => (cell.className = "border px-5 py-2 text-center")
      );

      cells[0].textContent = entry.id;
      cells[1].textContent = entry.name;

      cells[2].style.display = "flex";
      cells[2].style.justifyContent = "center";
      cells[2].style.alignItems = "center";

      const link = document.createElement("a");
      link.href = entry.linkURL;
      link.target = "_blank";
      const leetCodeIcon = new Image();
      leetCodeIcon.src = "leetcode.svg";
      leetCodeIcon.alt = "LeetCode";
      leetCodeIcon.style.height = "47px";
      leetCodeIcon.style.width = "30px";
      link.appendChild(leetCodeIcon);
      cells[2].appendChild(link);

      const difficultyTag = document.createElement("span");
      difficultyTag.classList.add("difficulty-tag");
      let diff = entry.difficulty;

      if (diff === "Easy") {
        difficultyTag.classList.add("difficulty-easy");
      } else if (diff === "Medium") {
        difficultyTag.classList.add("difficulty-medium");
      } else if (diff === "Hard") {
        difficultyTag.classList.add("difficulty-hard");
      }

      difficultyTag.textContent = diff;
      cells[3].appendChild(difficultyTag);

      cells[4].textContent = entry.companies;
      cells[5].textContent = formatDateWithEmoji(entry.date);
    });
  } catch (error) {
    console.error("Failed to fetch problem data:", error);
    Swal.fire({
      icon: "error",
      title: "Fetch Error",
      text: "Failed to retrieve problem data.",
    });
  }
}
















// <----------------- Star Rating and Feedback Box ----------------->
// To handle star rating interactivity
// document.addEventListener("DOMContentLoaded", () => {
//   const stars = document.querySelectorAll(".star");
//   let selectedRating = -1; // Store the selected rating index

//   stars.forEach((star, index) => {
//     // Click event to select and color the stars up to the clicked one
//     star.addEventListener("click", () => {
//       selectedRating = index; // Update the selected rating index
//       stars.forEach((s, i) => {
//         s.style.color = i <= selectedRating ? "#ffc107" : "#cccccc";
//       });
//     });

//     // Hover event to temporarily color stars up to the hovered one
//     star.addEventListener("mouseover", () => {
//       stars.forEach((s, i) => {
//         s.style.color = i <= index ? "#ffc107" : "#cccccc";
//       });
//     });

//     // Mouseout event to reset stars based on the selected rating
//     star.addEventListener("mouseout", () => {
//       stars.forEach((s, i) => {
//         s.style.color = i <= selectedRating ? "#ffc107" : "#cccccc";
//       });
//     });
//   });
// });

// // To close the feedback box temporarily
// document.getElementById("close-btn").addEventListener("click", () => {
//   const feedbackBox = document.getElementById("feedback-box");
//   feedbackBox.style.display = "none"; // Hide the feedback box
// });

// // To clear form after submission
// document.getElementById("feedback-box").addEventListener("submit", (e) => {
//   e.preventDefault(); // Prevent form's default submission
//   e.target.submit();  // Submit the form data to Formspree
//   e.target.reset();   // Reset the form fields after submission
// });






















// <----------------- Shortcut Keys ----------------->

// Shortcut keys for search and clear functionalities
document.addEventListener("keydown", function (event) {
  // Checking for the '/' key without any modifiers
  if (
    event.key === "/" &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    event.preventDefault(); // Prevent any default behavior
    document.getElementById("id-search").focus(); // Focus the search button
  }

  // Checking for 'Ctrl+M'
  if (
    event.key === "m" &&
    event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    event.preventDefault(); // Prevent any default behavior
    // Adding event listener to the 'clear-button'
    clearUIElements();
  }
});

// To close the shortcut box
document.getElementById("close-shortcut-btn").addEventListener("click", function () {
  document.getElementById("shortcut-box").style.display = "none";
});
