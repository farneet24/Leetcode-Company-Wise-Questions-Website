document.addEventListener("DOMContentLoaded", function () {
  fetch("company_data.json")
    .then((response) => response.json())
    .then((data) => initializeDropdowns(data))
    .catch((error) => console.error("Error loading company data:", error));
});

const companySelect = document.getElementById("company-select");
const durationSelect = document.getElementById("duration-select");
const sortSelect = document.getElementById("sort-select");
const difficultyFilter = document.getElementById("difficulty-filter");
const currentSelection = document.getElementById("current-selection");

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

function clearTable() {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
}

function updateCompanyLogo(companyName) {
  const logoImg = document.getElementById("company-logo");
  logoImg.src = `https://logo.clearbit.com/${companyName}.com`;
  logoImg.style.display = "block";
}

function loadCompanyQuestions(company, duration, sort, difficulty) {
  const csvFile = `data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
  fetch(csvFile)
    .then((response) => response.text())
    .then((csvText) => {
      displayTable(csvText, sort, difficulty);
    })
    .catch((error) => console.error("Failed to load data:", error));
}

function displayTable(csvData, sort, difficulty) {
  // Get the container for the table
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = ""; // Clear previous content

  // Split CSV data into rows and filter out any empty rows
  let rows = csvData.split("\n").filter((row) => row.trim());
  console.log("Rows", rows);
  // Extract the header row
  const header = rows.shift();
  rows.unshift(header + " ,Attempted");

  console.log("Header", header);
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

  // Iterate over each row to create table rows
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    const cells = row.split(",");
    if (index > 0) cells.push(""); // Ensuring an empty cell for 'Attempted' is added to each data row

    cells.forEach((cell, cellIndex) => {
      const cellElement = document.createElement(index === 0 ? "th" : "td");
      cellElement.classList.add("border", "px-4", "py-2", "text-center"); // Apply Tailwind CSS classes

      if (index === 0) {
        cellElement.style.backgroundColor = "#009879"; // Header cells background color
        cellElement.style.color = "white";
      }

      if (index === 0 && cellIndex === cells.length - 1) {
        // Set text for 'Attempted' header
        cellElement.textContent = "Attempted";
      } else if (index > 0 && cellIndex === cells.length - 1) {
        
        // Append checkbox for each data row in the 'Attempted' column
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-blue-600"); // Tailwind classes for checkboxes
        checkbox.id = `attempt-${cells[0]}`; // Assuming the first column is 'ID'
        checkbox.checked = JSON.parse(
          localStorage.getItem(checkbox.id) || "false"
        );
        checkbox.addEventListener("change", function () {
          localStorage.setItem(this.id, this.checked);
        });
        const label = document.createElement("label");
        label.classList.add("inline-flex", "justify-center", "items-center"); // Centering checkbox within its cell
        label.appendChild(checkbox);
        cellElement.appendChild(label);


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
        leetCodeIcon.style.height = "30px";
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
  // Create a style element
  const style = document.createElement("style");
  // Add style rules to the style element
  style.textContent = `
  .row-count-display {
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #025464;
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    font-size: 18px;
    text-align: center;
    color: #ffffff;
    width: 20%;
  }
`;
  // Append the style tag to the head of the document
  document.head.appendChild(style);

  // Create a div to display the number of questions
  const rowCountDisplay = document.createElement("div");
  rowCountDisplay.className = "row-count-display"; // Assign the class to the div
  rowCountDisplay.textContent = `Number of Questions: ${rows.length - 1}`;

  // Insert the row count above the table
  tableContainer.insertBefore(rowCountDisplay, tableContainer.firstChild);
  tableContainer.appendChild(table);
}

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

function filterRows(rows, difficulty, header) {
  const headerParts = header.split(",");
  const columnIndex = headerParts.indexOf("Difficulty");
  return rows.filter(
    (row) => row.split(",")[columnIndex].trim() === difficulty
  );
}

function formatDuration(duration) {
  return duration
    .replace("months", " Months")
    .replace("year", " Year")
    .replace("alltime", "All Time");
}

document.getElementById("clear-button").addEventListener("click", () => {
  // Clear the table
  document.getElementById("table-container").innerHTML = "";
  // Clear the current selection
  document.getElementById("current-selection").innerText = "";
  // Hide the company logo
  document.getElementById("company-logo").style.display = "none";
  document.getElementById("id-search").value = "";
  
  companySelect.selectedIndex = 0;
  durationSelect.selectedIndex = 0;
  sortSelect.selectedIndex = 0;
  difficultyFilter.selectedIndex = 0;
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
      event.preventDefault();  // Prevent the default action to avoid submitting the form
      const id = document.getElementById("id-search").value.trim();
      if (id) {
          searchByID(id);
      }
  }
});


function searchByID(id) {
  fetch("company_data.json")
    .then((response) => response.json())
    .then((data) => {
      const tableData = {};
      let foundTitle = "";
      let foundLink = "";
      Object.entries(data).forEach(([company, durations]) => {
        let hasID = false;
        const frequencyMap = {}; // Map to store total frequency for each duration
        durations.forEach((duration) => {
          const csvFile = `data/LeetCode-Questions-CompanyWise/${company}_${duration}.csv`;
          fetch(csvFile)
            .then((response) => response.text())
            .then((csvText) => {
              const rows = csvText.split("\n").filter((row) => row.trim());
              const header = rows.shift().split(",");
              const idIndex = header.findIndex((col) => col.trim() === "ID");
              const titleIndex = header.findIndex(
                (col) => col.trim() === "Title"
              );
              const linkIndex = header.findIndex(
                (col) => col.trim() === "Leetcode Question Link"
              );
              const frequencyIndex = header.findIndex(
                (col) => col.trim() === "Frequency"
              );
              rows.forEach((row) => {
                const cells = row.split(",");
                if (cells[idIndex].trim() === id) {
                  hasID = true;
                  foundTitle = cells[titleIndex].trim();
                  foundLink = cells[linkIndex].trim();
                  const frequency = parseFloat(cells[frequencyIndex].trim());
                  frequencyMap[duration] = frequencyMap[duration]
                    ? frequencyMap[duration] + frequency
                    : frequency;
                }
              });
              if (hasID) {
                const totalFrequency = Object.values(frequencyMap).reduce(
                  (acc, val) => acc + val,
                  0
                );
                if (totalFrequency > 0) {
                  tableData[company] = tableData[company] || {};
                  Object.entries(frequencyMap).forEach(
                    ([duration, frequency]) => {
                      tableData[company][duration] = frequency.toFixed(2);
                    }
                  );
                }
                displaySearchResults(tableData, foundTitle, foundLink);
              }
            })
            .catch((error) => console.error("Failed to load data:", error));
        });
      });
    })
    .catch((error) => console.error("Error loading company data:", error));
}

function displaySearchResults(data, title, link) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";

  // Create a container for title and link to display them inline
  const titleLinkContainer = document.createElement("div");
  titleLinkContainer.style.display = "flex";
  titleLinkContainer.style.alignItems = "center";
  titleLinkContainer.style.justifyContent = "center";
  titleLinkContainer.style.marginBottom = "10px";

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  titleElement.style.fontSize = "30px";
  titleElement.style.marginRight = "10px";

  // Create checkbox beside the title
  const titleCheckbox = document.createElement("input");
  titleCheckbox.type = "checkbox";
  titleCheckbox.id = "title-checkbox"; // Specific ID for the checkbox
  titleCheckbox.classList.add(
    "form-checkbox",
    "h-5",
    "w-5",
    "text-blue-600",
    "mr-2"
  ); // Tailwind CSS for style

  // Optional: Retrieve the state from localStorage if needed, using some ID from elsewhere like 'id-search'
  const checkboxId = document.getElementById("id-search").value; // Ensure this element exists and has a value
  titleCheckbox.checked = JSON.parse(
    localStorage.getItem(`attempt-${checkboxId}`) || "false"
  );

  // Event listener to update local storage or handle changes
  titleCheckbox.addEventListener("change", function () {
    localStorage.setItem(`attempt-${checkboxId}`, this.checked);
  });

  // Append the checkbox to the container

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", link);
  linkElement.style.display = "inline-flex";
  linkElement.style.alignItems = "center";
  linkElement.style.textDecoration = "none";

  const leetCodeIcon = new Image();
  leetCodeIcon.src = "leetcode.svg"; // Ensure this path correctly points to the LeetCode logo
  leetCodeIcon.alt = "LeetCode";
  leetCodeIcon.style.height = "34px"; // Icon height
  leetCodeIcon.style.width = "34px"; // Icon width
  leetCodeIcon.style.marginRight = "5px"; // Space between the icon and the text
  leetCodeIcon.style.backgroundColor = "white"; // Set the background color to white
  leetCodeIcon.style.borderRadius = "50%"; // Make the background circular
  leetCodeIcon.style.padding = "5px"; // Add padding to expand the background area
  leetCodeIcon.style.display = "flex"; // Ensures the icon centers correctly in its expanded background
  leetCodeIcon.style.justifyContent = "center"; // Center the icon horizontally within its padding
  leetCodeIcon.style.alignItems = "center"; // Center the icon vertically within its padding
  leetCodeIcon.style.boxSizing = "border-box"; // Includes padding in the width and height measurements

  linkElement.insertBefore(leetCodeIcon, linkElement.firstChild);

  titleLinkContainer.appendChild(titleCheckbox);
  titleLinkContainer.appendChild(titleElement);
  titleLinkContainer.appendChild(linkElement);
  tableContainer.appendChild(titleLinkContainer);

  if (Object.keys(data).length === 0) {
    const noDataMsg = document.createElement("p");
    noDataMsg.textContent = "The question was not asked in any company.";
    noDataMsg.style.textAlign = "center";
    noDataMsg.style.fontSize = "20px";
    tableContainer.appendChild(noDataMsg);
  } else {
    const companyCount = document.createElement("p");
    companyCount.textContent = `Number of companies: ${
      Object.keys(data).length
    }`;
    companyCount.style.textAlign = "center";
    companyCount.style.fontSize = "20px";
    tableContainer.appendChild(companyCount);

    const table = document.createElement("table");
    table.classList.add("styled-table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const companyNameHeader = document.createElement("th");
    companyNameHeader.style.backgroundColor = "#556FB5";
    companyNameHeader.style.color = "white";
    companyNameHeader.textContent = "Company";
    const frequencyHeader = document.createElement("th");
    frequencyHeader.textContent = "Frequency";
    frequencyHeader.style.backgroundColor = "#556FB5";
    frequencyHeader.style.color = "white";
    headerRow.appendChild(companyNameHeader);
    headerRow.appendChild(frequencyHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    Object.entries(data).forEach(([company, durations]) => {
      const row = document.createElement("tr");

      const companyNameCell = document.createElement("td");
      companyNameCell.style.display = "flex";
      companyNameCell.style.alignItems = "center";
      const companyLogo = document.createElement("img");
      companyLogo.src = `https://logo.clearbit.com/${company}.com`;
      companyLogo.style.height = "24px";
      companyNameCell.appendChild(companyLogo);
      companyNameCell.appendChild(
        document.createTextNode(
          company[0].toUpperCase() + company.slice(1).toLowerCase()
        )
      );
      row.appendChild(companyNameCell);

      const frequencyCell = document.createElement("td");
      Object.entries(durations).forEach(([duration, frequency]) => {
        const tag = document.createElement("span");
        tag.textContent = `${Math.ceil(frequency * 100)}% (${duration})`;
        tag.classList.add("frequency-tag");
        tag.style.marginRight = "10px";
        if (parseFloat(frequency) >= 0.7) {
          tag.classList.add("high-frequency");
        } else if (parseFloat(frequency) >= 0.4) {
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
}
