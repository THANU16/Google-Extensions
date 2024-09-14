document.getElementById("calculate-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "calculateSGPA" },
      (response) => {
        if (response && response.sgpa) {
          document.getElementById(
            "sgpa-result"
          ).textContent = `SGPA: ${response.sgpa}`;
          document.getElementById(
            "total-credit"
          ).textContent = `Total Credits: ${response.totalCredits}`;
          document.getElementById(
            "total-non-gpa-creddit"
          ).textContent = `Total NonGPA Credits: ${response.totalNonGPACredits}`;
        } else {
          document.getElementById("sgpa-result").textContent =
            "Failed to calculate SGPA.";
        }
      }
    );
  });
});
