const toggleButton = document.getElementById("toggleButton");
const body = document.body;
const toggleicon = document.getElementById("svg");
const modeIcon = document.getElementById("toggleIcon");
const checkboxes = document.querySelectorAll('.checkbox'); // Use querySelectorAll instead of getElementsByClassName to get a NodeList

let isDragging = false;
let initialX, initialY;

toggleButton.addEventListener("click", () => {
  if (toggleButton.checked) {
    body.classList.add("night-mode");
    modeIcon.classList.remove("fa-sun");
    modeIcon.classList.add("fa-moon");
    localStorage.setItem("isNightMode", "true");
  } else {
    body.classList.remove("night-mode"); // Use remove instead of toggle to ensure night-mode is removed when unchecked
    modeIcon.classList.remove("fa-moon");
    modeIcon.classList.add("fa-sun");
    localStorage.setItem("isNightMode", "false")
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const isNightMode = localStorage.getItem("isNightMode");
  if (isNightMode === "true") {
    body.classList.add("night-mode");
    modeIcon.classList.remove("fa-sun");
    modeIcon.classList.add("fa-moon");
    toggleButton.checked = true;
  }
});

if (checkboxes) {
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', () => {
      const index = checkbox.getAttribute('data-index');
      const todoText = checkbox.nextElementSibling; // Get the <span> element containing the todo text

      if (checkbox.checked) {
        // Add cross mark if checkbox is checked
        todoText.style.textDecoration = 'line-through';

        // Remove the item from the list immediately
        todoText.parentElement.remove();

        // Send a request to the server to delete the item by its ID
        const itemId = checkbox.value;
        fetch(`/delete/${itemId}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => {
            // Log the response from the server if needed
            console.log(data);
          })
          .catch(error => console.error(error));
      } else {
        // Remove cross mark if checkbox is unchecked
        todoText.style.textDecoration = 'none';
      }
    });
  });
}
