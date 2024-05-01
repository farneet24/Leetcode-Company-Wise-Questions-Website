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
  rows.unshift(header);

  // Create a new table element
  const table = document.createElement("table");
  table.classList.add("styled-table"); // Apply custom table styles

  // Iterate over each row to create table rows
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Split each row into cells and process each cell
    row.split(",").forEach((cell, cellIndex) => {
      const cellElement = document.createElement(index === 0 ? "th" : "td");
      cellElement.classList.add("border", "px-4", "py-2", "text-center"); // Apply Tailwind CSS classes

      if (index === 0) {
        // This condition is true for header cells
        cellElement.style.backgroundColor = "#009879"; // Set header background color to green
        cellElement.style.color = "white"; // Set header background color to green
      }
      // Special handling for link cells
      if (index > 0 && cellIndex === 5) {
        cellElement.style.display = "flex";
        cellElement.style.flexDirection = "row-reverse";
        cellElement.style.justifyContent = "space-around";
        const link = document.createElement("a");
        link.href = cell;
        link.target = "_blank";
        // LeetCode Icon
        const leetCodeIcon = new Image();
        leetCodeIcon.src = "leetcode.svg";
        leetCodeIcon.alt = "LeetCode";
        leetCodeIcon.style.alignItems = "center";
        leetCodeIcon.style.height = "30px";
        leetCodeIcon.style.width = "30px";

        link.appendChild(leetCodeIcon);
        cellElement.appendChild(link);
      }
      // Special formatting for the Difficulty column
      else if (cellIndex === 3) {
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
      }
      // Formatting for frequency cells, assuming these are percentage values
      else if (index > 0 && cellIndex === 4) {
        cellElement.textContent = `${parseFloat(cell).toFixed(2)}%`;
      } else {
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

  companySelect.selectedIndex = 0;
  durationSelect.selectedIndex = 0;
  sortSelect.selectedIndex = 0;
  difficultyFilter.selectedIndex = 0;
});
