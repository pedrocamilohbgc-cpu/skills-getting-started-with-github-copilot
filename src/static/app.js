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

        // Build participants list HTML
        const escapeHtml = (str) =>
          String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const participantsHTML =
          details.participants && details.participants.length > 0
            ? details.participants
                .map((p) => `
                  <li class="participant-item">
                    ${escapeHtml(p)}
                    <span class="delete-participant" title="Remove participant" data-activity="${escapeHtml(name)}" data-email="${escapeHtml(p)}">×</span>
                  </li>`)
                .join("")
            : `<li class="participants-empty">No participants yet</li>`;

        activityCard.innerHTML = `
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(details.description)}</p>
          <p><strong>Schedule:</strong> ${escapeHtml(details.schedule)}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>

          <div class="participants">
            <strong>Participants</strong>
            <ul class="participants-list">
              ${participantsHTML}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

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
        // Atualiza a lista de atividades para mostrar o novo participante
        fetchActivities();
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

  // Handle participant removal
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-participant')) {
      const activity = event.target.dataset.activity;
      const email = event.target.dataset.email;

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
          {
            method: 'DELETE',
          }
        );

        const result = await response.json();

        if (response.ok) {
          messageDiv.textContent = result.message || 'Participant removed successfully';
          messageDiv.className = 'success';
          // Refresh activities to show updated participants list
          fetchActivities();
        } else {
          messageDiv.textContent = result.detail || 'Failed to remove participant';
          messageDiv.className = 'error';
        }

        messageDiv.classList.remove('hidden');

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add('hidden');
        }, 5000);
      } catch (error) {
        messageDiv.textContent = 'Failed to remove participant. Please try again.';
        messageDiv.className = 'error';
        messageDiv.classList.remove('hidden');
        console.error('Error removing participant:', error);
      }
    }
  });

  // Initialize app
  fetchActivities();
});
