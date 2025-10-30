document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Participants section (render as a safe bulleted list)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants-section";

        const participantsTitle = document.createElement("p");
        participantsTitle.innerHTML = "<strong>Participants:</strong>";
        participantsDiv.appendChild(participantsTitle);

        const ul = document.createElement("ul");
        ul.className = "participants-list";


        if (!details.participants || details.participants.length === 0) {
          const li = document.createElement("li");
          li.className = "participant-item none";
          li.textContent = "No participants yet";
          ul.appendChild(li);
        } else {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            // Participant name
            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;
            li.appendChild(nameSpan);

            // Delete icon
            const deleteBtn = document.createElement("button");

            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = `Remove ${p}`;
            // Inline SVG trash icon for modern look
            deleteBtn.innerHTML = `
              <svg class="trash-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <rect x="6" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/>
                <rect x="9.25" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/>
                <rect x="12.5" y="8" width="1.5" height="6" rx="0.75" fill="#c62828"/>
                <path d="M4 6.5H16" stroke="#c62828" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="7" y="3" width="6" height="2" rx="1" fill="#c62828"/>
                <rect x="5" y="6.5" width="10" height="10" rx="2" stroke="#c62828" stroke-width="1.2" fill="none"/>
              </svg>
            `;
            deleteBtn.setAttribute("aria-label", `Remove ${p}`);
            deleteBtn.tabIndex = 0;
            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              // Call API to unregister participant
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, {
                  method: "POST",
                });
                if (response.ok) {
                  fetchActivities(); // Refresh list
                } else {
                  const result = await response.json();
                  alert(result.detail || "Failed to remove participant.");
                }
              } catch (error) {
                alert("Failed to remove participant. Please try again.");
              }
            });
            li.appendChild(deleteBtn);

            ul.appendChild(li);
          });
        }

        participantsDiv.appendChild(ul);
        activityCard.appendChild(participantsDiv);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
