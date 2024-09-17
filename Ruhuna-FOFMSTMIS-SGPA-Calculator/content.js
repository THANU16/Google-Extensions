const FDN = "FDN";
const FDN_GPA_COURSES_FOR_FW = [
  "FDN1131", // FDN1131 - Snorkelling and Life saving. This subject GPA for FW students
];

// Function to extract grades and credits from the table
function extractResults() {
  let courses = [];
  let resultTable = document.querySelector("#result2fmfw240 table");
  if (!resultTable) {
    return Error("No result table found.");
  }
  let allResults = [];

  for (let i = 1; i < resultTable.rows.length; i++) {
    let GPA = false;
    let credit = 0;
    let row = resultTable.rows[i];

    if (row.cells[0].getAttribute("colspan") === "2") {
      let repeatText = row.cells[0].innerText || "";
      let courseMatch = repeatText.match(/\[ ([A-Z0-9]+) - (.+?) \]/);
      if (courseMatch) {
        let courseCode = courseMatch[1];
        let subjectName = courseMatch[2];
        let grade = row.cells[1].innerText || "";
        let year = row.cells[2].innerText || "";

        let courseIndex = allResults.findIndex(
          (course) => course.courseUnit === courseCode
        );
        let course = allResults.find(
          (course) => course.courseUnit === courseCode
        );
        if (courseIndex !== -1) {
          let existingCourse = allResults[courseIndex];
          if (
            convertGradeToPoint(grade) >
            convertGradeToPoint(existingCourse.grade)
          ) {
            console.log(
              `Removing old entry for ${courseCode} with grade ${existingCourse.grade} and updating to ${grade}`
            );

            allResults.splice(courseIndex, 1);
            course.grade = grade;
            course.year = year;
            allResults.push(course);
          }
        }
      }
    } else if (row.cells.length >= 4) {
      let courseUnit = row.cells[0].innerText || "";
      let subjectName = row.cells[1].innerText || "";
      let grade = row.cells[2].innerText || "";
      let year = row.cells[3].innerText || "";
      if (courseUnit) {
        if (courseUnit.includes(FDN)) {
          GPA = false;
        } else {
          GPA = true;
        }
        credit = Number(courseUnit[courseUnit.length - 1]);
      }

      if (courseUnit) {
        allResults.push({
          courseUnit: courseUnit,
          subjectName: subjectName,
          grade: grade,
          year: year,
          gpa: GPA,
          credit: credit,
        });
      }
    } else {
      console.warn(`Row ${i} does not have enough cells.`);
    }
  }

  return allResults;
}

// Function to convert grades to grade points
function convertGradeToPoint(grade) {
  switch (grade.toUpperCase()) {
    case "A+":
    case "A":
      return 4.0;
    case "A-":
      return 3.7;
    case "B+":
      return 3.3;
    case "B":
      return 3.0;
    case "B-":
      return 2.7;
    case "C+":
      return 2.3;
    case "C":
      return 2.0;
    case "C-":
      return 1.7;
    case "D+":
      return 1.3;
    case "D":
      return 1.0;
    case "F":
    case "E":
      return 0.0;
    default:
      return 0.0;
  }
}

// Function to calculate SGPA
function calculateSGPA(courses) {
  let totalGPACredit = 0;
  let totalNonGPACredit = 0;
  let totalPoints = 0;

  courses.forEach((course) => {
    if (course.gpa) {
      totalGPACredit += course.credit;
      totalPoints += course.credit * convertGradeToPoint(course.grade);
    } else {
      if (FDN_GPA_COURSES_FOR_FW.includes(course.courseUnit)) {
        totalGPACredit += course.credit;
        totalPoints += course.credit * convertGradeToPoint(course.grade);
      } else {
        totalNonGPACredit += course.credit;
      }
    }
  });

  let sgpa =
    totalGPACredit > 0 ? (totalPoints / totalGPACredit).toFixed(2) : "N/A";

  return [sgpa, totalGPACredit, totalNonGPACredit];
}

// Automatically calculate SGPA when the page loads
window.addEventListener("load", () => {
  try {
    const results = extractResults();
    if (results.length > 0) {
      const [sgpa, totalGPACredit, totalNonGPACredit] = calculateSGPA(results);

      // Create a new table to display SGPA, total credits, and non-GPA credits
      const resultTable = document.createElement("table");
      resultTable.innerHTML = `
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            <tbody>
              <tr>
                <td>SGPA</td>
                <td>${sgpa}</td>
              </tr>
              <tr>
                <td>Total GPA Credits</td>
                <td>${totalGPACredit}</td>
              </tr>
              <tr>
                <td>Total Non-GPA Credits</td>
                <td>${totalNonGPACredit}</td>
              </tr>
            </tbody>
          `;

      // Add some styling to the new table
      resultTable.style.border = "1px solid #ccc";
      resultTable.style.borderCollapse = "collapse";
      resultTable.style.width = "770px";
      resultTable.style.marginTop = "20px";
      resultTable.style.marginBottom = "20px";
      // i want to align the table to the center
      resultTable.style.marginLeft = "auto";
      resultTable.style.marginRight = "auto";
      // resultTable.style.backgroundColor = "#f98f79";
      resultTable.style.backgroundColor = "#FFFFFF";

      resultTable.style.color = "black";
      resultTable.style.fontWeight = "bold";

      const cells = resultTable.querySelectorAll("td");
      cells.forEach((cell) => {
        cell.style.border = "1px solid #ddd";
        cell.style.padding = "8px";
      });

      const disclaimer = document.createElement("p");
      disclaimer.innerHTML =
        "Disclaimer: The SGPA is calculated based on the grades and credits extracted from the official result table. <br> All " +
        FDN +
        " courses are treated as non-GPA courses, with the exception of " +
        FDN_GPA_COURSES_FOR_FW +
        ", which is considered a GPA course. <br> The last digit of the course unit is assumed to represent the credit value of the respective course.";
      disclaimer.style.fontStyle = "italic";
      disclaimer.style.fontSize = "12px";
      disclaimer.style.color = "#666";
      disclaimer.style.marginTop = "20px";
      disclaimer.style.marginBottom = "20px";

      disclaimer.style.textAlign = "center";

      // Append the new table to the body, after the existing result table
      document.body.appendChild(resultTable);
      document.body.appendChild(disclaimer);
    } else {
      console.log("No results found for SGPA calculation.");
    }
  } catch (error) {
    console.error("Error calculating SGPA:", error);
  }
});
