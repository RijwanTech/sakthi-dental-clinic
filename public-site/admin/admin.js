
const API_URL = "https://sakthi-dental-clinic-api.onrender.com/api/appointments";
const LOGIN_URL = "login.html";

const token = () => sessionStorage.getItem("adminToken");

const tableBody = document.getElementById("appointmentsTableBody");
const message = document.getElementById("dashboardMessage");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");

let appointments = [];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeStatus(status) {
  const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];
  return allowed.includes(status) ? status : "Pending";
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function setMessage(text, type = "info") {
  message.textContent = text;
  message.style.color =
    type === "error" ? "#c2414b" :
    type === "success" ? "#14816f" :
    "#687b90";
}

function handleUnauthorized(response) {
  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem("adminToken");
    window.location.replace(LOGIN_URL);
    return true;
  }

  return false;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token()}`,
      ...(options.headers || {}),
    },
  });

  if (handleUnauthorized(response)) {
    throw new Error("Your session has expired. Please log in again.");
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  return result;
}

function getAppointmentList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.appointments)) return result.appointments;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.data?.appointments)) {
    return result.data.appointments;
  }

  throw new Error(
    "The appointments API response format is unexpected. Check appointmentRoutes.js."
  );
}

function updateStats() {
  document.getElementById("totalAppointments").textContent =
    appointments.length;

  document.getElementById("pendingAppointments").textContent =
    appointments.filter((item) => item.status === "Pending").length;

  document.getElementById("confirmedAppointments").textContent =
    appointments.filter((item) => item.status === "Confirmed").length;

  document.getElementById("completedAppointments").textContent =
    appointments.filter((item) => item.status === "Completed").length;
}

function renderAppointments() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = appointments.filter((item) => {
    const searchableText = [
      item.patientName,
      item.phone,
      item.email,
      item.treatment,
      item.message,
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  document.getElementById("resultsCount").textContent =
    `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          No appointments match your search or filter.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map((item) => {
    const status = normalizeStatus(item.status);
    const id = escapeHTML(item._id || item.id || "");

    const email = String(item.email || "");
    const phone = String(item.phone || "");

    return `
      <tr>
        <td>
          <span class="patient-name">
            ${escapeHTML(item.patientName || "Unnamed patient")}
          </span>
          <span class="patient-message" title="${escapeHTML(item.message || "")}">
            ${escapeHTML(item.message || "No additional message")}
          </span>
        </td>

        <td>${escapeHTML(item.treatment || "Not specified")}</td>

        <td>${escapeHTML(formatDate(item.appointmentDate))}</td>

        <td>
          <div class="contact-details">
            <span>${escapeHTML(phone || "No phone")}</span>
            ${
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? `<a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a>`
                : `<span>${escapeHTML(email || "No email")}</span>`
            }
          </div>
        </td>

        <td>
          <span class="status-badge ${statusClass(status)}">
            ${escapeHTML(status)}
          </span>
        </td>

        <td>
          <select
            class="status-select"
            data-appointment-id="${id}"
            aria-label="Update appointment status"
            ${!id ? "disabled" : ""}
          >
            ${["Pending", "Confirmed", "Completed", "Cancelled"].map((option) => `
              <option value="${option}" ${status === option ? "selected" : ""}>
                ${option}
              </option>
            `).join("")}
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadAppointments() {
  if (!token()) {
    window.location.replace(LOGIN_URL);
    return;
  }

  refreshButton.disabled = true;
  setMessage("Loading appointments from your database...");

  try {
    const result = await apiRequest(API_URL);

    appointments = getAppointmentList(result).map((item) => ({
      ...item,
      status: normalizeStatus(item.status),
    }));

    updateStats();
    renderAppointments();

    setMessage(
      `Successfully loaded ${appointments.length} appointment(s).`,
      "success"
    );
  } catch (error) {
    if (!token()) return;

    setMessage(error.message || "Unable to load appointments.", "error");
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          Could not load appointments. Check the backend and API response.
        </td>
      </tr>
    `;
  } finally {
    refreshButton.disabled = false;
  }
}

async function updateAppointmentStatus(id, newStatus, selectElement) {
  const previous = appointments.find(
    (item) => String(item._id || item.id) === String(id)
  );

  if (!previous) return;

  const oldStatus = previous.status;
  selectElement.disabled = true;

  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    previous.status = newStatus;
    updateStats();
    renderAppointments();
    setMessage("Appointment status updated successfully.", "success");
  } catch (error) {
    selectElement.value = oldStatus;
    setMessage(error.message || "Could not update appointment status.", "error");
  } finally {
    selectElement.disabled = false;
  }
}

tableBody.addEventListener("change", (event) => {
  const selectElement = event.target.closest(".status-select");
  if (!selectElement) return;

  const id = selectElement.dataset.appointmentId;
  const newStatus = selectElement.value;

  updateAppointmentStatus(id, newStatus, selectElement);
});

searchInput.addEventListener("input", renderAppointments);
statusFilter.addEventListener("change", renderAppointments);
refreshButton.addEventListener("click", loadAppointments);

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("adminToken");
  window.location.replace(LOGIN_URL);
});

if (token()) {
  loadAppointments();
} else {
  window.location.replace(LOGIN_URL);
}
