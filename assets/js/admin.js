// Admin functions

function showAdminSection(sectionName) {
  // Hide all admin sections
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.style.display = "none";
  });

  // Show the selected section
  const targetSection = document.getElementById(
    "admin" + sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
  );

  if (targetSection) {
    targetSection.style.display = "block";

    // Load data for specific sections
    if (sectionName === "requests") {
      loadRequests();
    } else if (sectionName === "users") {
      loadUsers();
    } else if (sectionName === "clubs") {
      loadClubs();
    } else if (sectionName === "events") {
      loadEvents();
    }
  } else {
    console.error(
      `Section not found: admin${
        sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
      }`
    );
  }
}

function showAddClubModal() {
  // Load users for leader selection
  fetch("actions/admin/clubs.php?action=get_users")
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        const select = document.getElementById("clubLeader");
        select.innerHTML =
          '<option value="">Select Leader (Optional)</option>' +
          d.data
            .map(
              (user) =>
                `<option value="${user.id}">${user.name} (${user.email})</option>`
            )
            .join("");
      }
    });
  document.getElementById("addClubModal").style.display = "block";
}

function showAddEventModal() {
  // Load clubs for event creation
  fetch("actions/admin/clubs.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        const select = document.getElementById("addEventClub");
        if (select) {
          select.innerHTML =
            '<option value="">Select Club</option>' +
            d.data
              .map((club) => `<option value="${club.id}">${club.name}</option>`)
              .join("");
        }
      } else {
        const select = document.getElementById("addEventClub");
        if (select)
          select.innerHTML = '<option value="">No clubs available</option>';
        if (typeof showNotification === "function")
          showNotification(d.message || "No clubs available", "error");
      }
    })
    .catch((err) => {
      console.error("Failed to load clubs for event modal:", err);
      const select = document.getElementById("addEventClub");
      if (select)
        select.innerHTML = '<option value="">No clubs available</option>';
      if (typeof showNotification === "function")
        showNotification("Failed to load clubs", "error");
    });
  document.getElementById("addEventModal").style.display = "block";
}

function handleAddEvent(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("action", "create");
  formData.append("name", document.getElementById("eventName").value);
  formData.append("club_id", document.getElementById("addEventClub").value);
  formData.append("date", document.getElementById("eventDate").value);
  formData.append("location", document.getElementById("eventLocation").value);
  formData.append(
    "max_participants",
    document.getElementById("eventMaxParticipants").value
  );
  formData.append(
    "description",
    document.getElementById("eventDescription").value
  );
  const eventImg = document.getElementById("eventImageInput")
    ? document.getElementById("eventImageInput").files[0]
    : null;
  if (eventImg) formData.append("event_image", eventImg);

  fetch("actions/admin/events.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Event added successfully!", "success");
        closeModal("addEventModal");
        event.target.reset();
        loadEvents();
      } else {
        showNotification(d.message || "Failed to add event", "error");
      }
    })
    .catch(() => showNotification("Failed to add event", "error"));
}

function handleAddClub(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("action", "create");
  formData.append("name", document.getElementById("clubName").value);
  formData.append(
    "description",
    document.getElementById("clubDescription").value
  );
  formData.append(
    "category",
    document.getElementById("clubCategorySelect").value
  );
  formData.append("leader_id", document.getElementById("clubLeader").value);
  formData.append(
    "schedule_meeting",
    document.getElementById("clubSchedule").value
  );
  // include activities and optional image
  const activities = document.getElementById("clubActivitiesInput")
    ? document.getElementById("clubActivitiesInput").value
    : "";
  if (activities) formData.append("activities", activities);
  const img = document.getElementById("clubImageInput")
    ? document.getElementById("clubImageInput").files[0]
    : null;
  if (img) formData.append("club_image", img);

  fetch("actions/admin/clubs.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Club added successfully!", "success");
        closeModal("addClubModal");
        event.target.reset();
        loadClubs();
      } else {
        showNotification(d.message || "Failed to add club", "error");
      }
    })
    .catch(() => showNotification("Failed to add club", "error"));
}

function editClub(clubId) {
  const row = document.querySelector(`#clubsTableBody tr[data-id="${clubId}"]`);
  if (!row) return;

  // Load users for leader selection
  fetch("actions/admin/clubs.php?action=get_users")
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        const select = document.getElementById("editClubLeader");
        select.innerHTML =
          '<option value="">Select Leader (Optional)</option>' +
          d.data
            .map(
              (user) =>
                `<option value="${user.id}">${user.name} (${user.email})</option>`
            )
            .join("");
      }
    });

  // Populate form with current data
  document.getElementById("editClubId").value = clubId;
  document.getElementById("editClubName").value = row
    .querySelector('[data-field="name"]')
    .textContent.trim();
  document.getElementById("editClubDescription").value =
    row.getAttribute("data-description") || "";
  document.getElementById("editClubCategory").value =
    row.getAttribute("data-category") || "";
  document.getElementById("editClubLeader").value =
    row.getAttribute("data-leader-id") || "";
  document.getElementById("editClubSchedule").value =
    row.getAttribute("data-schedule") || "";
  // populate activities and image preview
  const activities = row.getAttribute("data-activities") || "";
  if (document.getElementById("editClubActivitiesInput"))
    document.getElementById("editClubActivitiesInput").value = activities;
  const imgUrl = row.getAttribute("data-club-image") || "";
  const preview = document.getElementById("editClubImagePreview");
  if (preview) {
    preview.innerHTML = imgUrl
      ? `<img src="${imgUrl}" alt="Club Image" style="max-width:120px; max-height:80px; border-radius:6px;">`
      : "";
  }

  document.getElementById("editClubModal").style.display = "block";
}

function handleEditClub(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("action", "update");
  formData.append("id", document.getElementById("editClubId").value);
  formData.append("name", document.getElementById("editClubName").value);
  formData.append(
    "description",
    document.getElementById("editClubDescription").value
  );
  formData.append(
    "category",
    document.getElementById("editClubCategory").value
  );
  formData.append("leader_id", document.getElementById("editClubLeader").value);
  formData.append(
    "schedule_meeting",
    document.getElementById("editClubSchedule").value
  );
  // include activities and optional new image
  const activities = document.getElementById("editClubActivitiesInput")
    ? document.getElementById("editClubActivitiesInput").value
    : "";
  if (activities) formData.append("activities", activities);
  const newImg = document.getElementById("editClubImageInput")
    ? document.getElementById("editClubImageInput").files[0]
    : null;
  if (newImg) formData.append("club_image", newImg);

  fetch("actions/admin/clubs.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Club updated successfully!", "success");
        closeModal("editClubModal");
        loadClubs();
      } else {
        showNotification(d.message || "Update failed", "error");
      }
    })
    .catch(() => showNotification("Update failed", "error"));
}

function deleteClub(clubId) {
  if (confirm("Are you sure you want to delete this club?")) {
    const fd = new FormData();
    fd.append("action", "delete");
    fd.append("id", clubId);
    fetch("actions/admin/clubs.php", { method: "POST", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          showNotification("Club deleted successfully!", "success");
          loadClubs();
        } else {
          showNotification(d.message || "Delete failed", "error");
        }
      })
      .catch(() => showNotification("Delete failed", "error"));
  }
}

function editEvent(eventId) {
  const row = document.querySelector(
    `#eventsTableBody tr[data-id="${eventId}"]`
  );
  if (!row) return;

  // Load clubs for event editing
  fetch("actions/admin/clubs.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        const select = document.getElementById("editEventClub");
        select.innerHTML =
          '<option value="">Select Club</option>' +
          d.data
            .map((club) => `<option value="${club.id}">${club.name}</option>`)
            .join("");
      }
    });

  // Populate form with current data
  document.getElementById("editEventId").value = eventId;
  document.getElementById("editEventName").value = row.querySelector(
    '[data-field="name"]'
  ).textContent;
  document.getElementById("editEventClub").value =
    row.getAttribute("data-club-id");
  document.getElementById("editEventDate").value =
    row.getAttribute("data-date");
  document.getElementById("editEventLocation").value = row.querySelector(
    '[data-field="location"]'
  ).textContent;
  document.getElementById("editEventMaxParticipants").value =
    row.getAttribute("data-max");
  document.getElementById("editEventDescription").value =
    row.getAttribute("data-description") || "";

  document.getElementById("editEventModal").style.display = "block";
}

function handleEditEvent(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("action", "update");
  formData.append("id", document.getElementById("editEventId").value);
  formData.append("name", document.getElementById("editEventName").value);
  formData.append("club_id", document.getElementById("editEventClub").value);
  formData.append("date", document.getElementById("editEventDate").value);
  formData.append(
    "location",
    document.getElementById("editEventLocation").value
  );
  formData.append(
    "max_participants",
    document.getElementById("editEventMaxParticipants").value
  );
  formData.append(
    "description",
    document.getElementById("editEventDescription").value
  );
  const newEventImg = document.getElementById("editEventImageInput")
    ? document.getElementById("editEventImageInput").files[0]
    : null;
  if (newEventImg) formData.append("event_image", newEventImg);

  fetch("actions/admin/events.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Event updated successfully!", "success");
        closeModal("editEventModal");
        loadEvents();
      } else {
        showNotification(d.message || "Update failed", "error");
      }
    })
    .catch(() => showNotification("Update failed", "error"));
}

function deleteEvent(eventId) {
  if (confirm("Are you sure you want to delete this event?")) {
    const fd = new FormData();
    fd.append("action", "delete");
    fd.append("id", eventId);
    fetch("actions/admin/events.php", { method: "POST", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          showNotification("Event deleted successfully!", "success");
          loadEvents();
        } else {
          showNotification(d.message || "Delete failed", "error");
        }
      })
      .catch(() => showNotification("Delete failed", "error"));
  }
}

function exportToExcel() {
  showNotification("Exporting to Excel... (Demo)", "success");
}

function exportToPDF() {
  showNotification("Exporting to PDF... (Demo)", "success");
}

// Member management functions

function viewMemberDetails(memberId) {
  // Sample member data - in a real app, this would come from a database
  const memberData = {
    1: {
      name: "Sarah Johnson",
      studentId: "CS2021001",
      email: "sarah.johnson@uth.edu",
      department: "Computer Science",
      year: "3rd Year",
      phone: "+1 (555) 123-4567",
      joinDate: "Sep 15, 2023",
      status: "Active",
      clubs: ["Tech Club (Leader)"],
      events: ["Tech Innovation Workshop", "AI & Machine Learning Seminar"],
      gpa: "3.85",
      address: "123 University Ave, Campus Housing",
    },
  };

  const member = memberData[memberId] || memberData[1];

  const content = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #008689; margin-bottom: 1rem;">📋 Personal Information</h4>
                <p><strong>Name:</strong> ${member.name}</p>
                <p><strong>Student ID:</strong> ${member.studentId}</p>
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Address:</strong> ${member.address}</p>
            </div>
            <div>
                <h4 style="color: #008689; margin-bottom: 1rem;">🎓 Academic Information</h4>
                <p><strong>Department:</strong> ${member.department}</p>
                <p><strong>Year:</strong> ${member.year}</p>
                <p><strong>GPA:</strong> ${member.gpa}</p>
                <p><strong>Join Date:</strong> ${member.joinDate}</p>
                <p><strong>Status:</strong> <span class="badge badge-success">${
                  member.status
                }</span></p>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="color: #008689; margin-bottom: 1rem;">🏛️ Club Memberships</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${member.clubs
                  .map(
                    (club) => `<span class="badge badge-info">${club}</span>`
                  )
                  .join("")}
            </div>
        </div>
        
        <div>
            <h4 style="color: #008689; margin-bottom: 1rem;">📅 Event Participation</h4>
            <ul style="margin: 0; padding-left: 1.5rem;">
                ${member.events.map((event) => `<li>${event}</li>`).join("")}
            </ul>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="editMember(${memberId}); closeModal('memberDetailsModal');">Edit Member</button>
            <button class="btn btn-secondary" onclick="closeModal('memberDetailsModal')">Close</button>
        </div>
    `;

  document.getElementById("memberDetailsContent").innerHTML = content;
  document.getElementById("memberDetailsModal").style.display = "block";
}

function editMember(memberId) {
  // Sample data for editing
  const memberData = {
    1: {
      name: "Sarah Johnson",
      studentId: "CS2021001",
      email: "sarah.johnson@uth.edu",
      department: "Computer Science",
      year: "3rd Year",
      status: "Active",
    },
  };

  const member = memberData[memberId];
  if (member) {
    document.getElementById("editMemberId").value = memberId;
    document.getElementById("editMemberName").value = member.name;
    document.getElementById("editMemberStudentId").value = member.studentId;
    document.getElementById("editMemberEmail").value = member.email;
    document.getElementById("editMemberDepartment").value = member.department;
    document.getElementById("editMemberYear").value = member.year;
    document.getElementById("editMemberStatus").value = member.status;

    document.getElementById("editMemberModal").style.display = "block";
  }
}

function handleEditMember(event) {
  event.preventDefault();

  const memberId = document.getElementById("editMemberId").value;
  const name = document.getElementById("editMemberName").value;

  showNotification(`Member ${name} updated successfully!`, "success");
  closeModal("editMemberModal");
}

function suspendMember(memberId) {
  if (confirm("Are you sure you want to suspend this member?")) {
    showNotification("Member suspended successfully!", "success");
  }
}

function activateMember(memberId) {
  showNotification("Member activated successfully!", "success");
}

function filterAdminMembers() {
  const searchTerm = document
    .getElementById("adminMemberSearch")
    .value.toLowerCase();
  const department = document.getElementById("adminMemberDepartment").value;
  const year = document.getElementById("adminMemberYear").value;
  const status = document.getElementById("adminMemberStatus").value;
  const club = document.getElementById("adminMemberClub").value;

  const rows = document.querySelectorAll("#adminMembersTableBody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    const name = row.cells[2].textContent.toLowerCase();
    const email = row.cells[3].textContent.toLowerCase();
    const studentId = row.cells[1].textContent.toLowerCase();
    const rowDepartment = row.getAttribute("data-department");
    const rowYear = row.getAttribute("data-year");
    const rowStatus = row.getAttribute("data-status");
    const rowClubs = row.getAttribute("data-clubs");

    const matchesSearch =
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      studentId.includes(searchTerm);
    const matchesDepartment = !department || rowDepartment === department;
    const matchesYear = !year || rowYear === year;
    const matchesStatus = !status || rowStatus === status;
    const matchesClub = !club || rowClubs.includes(club);

    if (
      matchesSearch &&
      matchesDepartment &&
      matchesYear &&
      matchesStatus &&
      matchesClub
    ) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });
}

function toggleSelectAllMembers() {
  const selectAll = document.getElementById("selectAllMembers");
  const checkboxes = document.querySelectorAll(".member-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });

  updateBulkActionsPanel();
}

function updateBulkActionsPanel() {
  const checkboxes = document.querySelectorAll(".member-checkbox:checked");
  const bulkPanel = document.getElementById("bulkActionsPanel");
  const selectedCount = document.getElementById("selectedCount");

  if (checkboxes.length > 0) {
    bulkPanel.style.display = "block";
    selectedCount.textContent = `${checkboxes.length} member(s) selected`;
  } else {
    bulkPanel.style.display = "none";
  }
}

function bulkEditMembers() {
  const selected = document.querySelectorAll(".member-checkbox:checked");
  if (selected.length === 0) {
    showNotification("Please select members to edit!", "error");
    return;
  }
  showNotification(
    `Bulk edit for ${selected.length} members would be implemented here!`,
    "success"
  );
}

function bulkActivateMembers() {
  const selected = document.querySelectorAll(".member-checkbox:checked");
  if (selected.length === 0) {
    showNotification("Please select members to activate!", "error");
    return;
  }

  if (
    confirm(
      `Are you sure you want to activate ${selected.length} selected members?`
    )
  ) {
    showNotification(
      `${selected.length} members activated successfully!`,
      "success"
    );

    // Clear selections
    selected.forEach((checkbox) => (checkbox.checked = false));
    document.getElementById("selectAllMembers").checked = false;
    updateBulkActionsPanel();
  }
}

function bulkSuspendMembers() {
  const selected = document.querySelectorAll(".member-checkbox:checked");
  if (selected.length === 0) {
    showNotification("Please select members to suspend!", "error");
    return;
  }

  if (
    confirm(
      `Are you sure you want to suspend ${selected.length} selected members?`
    )
  ) {
    showNotification(
      `${selected.length} members suspended successfully!`,
      "success"
    );

    // Clear selections
    selected.forEach((checkbox) => (checkbox.checked = false));
    document.getElementById("selectAllMembers").checked = false;
    updateBulkActionsPanel();
  }
}

function bulkExportMembers() {
  const selected = document.querySelectorAll(".member-checkbox:checked");
  if (selected.length === 0) {
    showNotification("Please select members to export!", "error");
    return;
  }
  showNotification(
    `Exporting ${selected.length} selected members... (Demo)`,
    "success"
  );
}

function exportMembersData() {
  showNotification("Exporting all members data... (Demo)", "success");
}

// Users CRUD helpers
function showAddUserModal() {
  document.getElementById("addUserModal").style.display = "block";
}
function handleAddUser(e) {
  e.preventDefault();
  const fd = new FormData();
  fd.append("action", "create");
  fd.append("name", document.getElementById("userName").value);
  fd.append("email", document.getElementById("userEmail").value);
  fd.append("student_id", document.getElementById("userStudentId").value);
  fd.append("role", document.getElementById("userRole").value);
  const pw = document.getElementById("userPassword").value;
  if (pw) fd.append("password", pw);
  fetch("actions/admin/users.php", { method: "POST", body: fd })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("User added!", "success");
        closeModal("addUserModal");
        e.target.reset();
        loadUsers();
      } else {
        showNotification(d.message || "Add user failed", "error");
      }
    })
    .catch(() => showNotification("Add user failed", "error"));
}
function editUser(id) {
  const row = document.querySelector(`#usersTableBody tr[data-id="${id}"]`);
  if (!row) return;

  // Populate form with current data
  document.getElementById("editUserId").value = id;
  document.getElementById("editUserName").value = row.querySelector(
    '[data-field="name"]'
  ).textContent;
  document.getElementById("editUserEmail").value = row.querySelector(
    '[data-field="email"]'
  ).textContent;
  document.getElementById("editUserStudentId").value = row.querySelector(
    '[data-field="student_id"]'
  ).textContent;
  document.getElementById("editUserRole").value = row
    .querySelector('[data-field="role"]')
    .textContent.toLowerCase();

  document.getElementById("editUserModal").style.display = "block";
}

function handleEditUser(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append("action", "update");
  formData.append("id", document.getElementById("editUserId").value);
  formData.append("name", document.getElementById("editUserName").value);
  formData.append("email", document.getElementById("editUserEmail").value);
  formData.append(
    "student_id",
    document.getElementById("editUserStudentId").value
  );
  formData.append("role", document.getElementById("editUserRole").value);

  fetch("actions/admin/users.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("User updated successfully!", "success");
        closeModal("editUserModal");
        loadUsers();
      } else {
        showNotification(d.message || "Update failed", "error");
      }
    })
    .catch(() => showNotification("Update failed", "error"));
}
function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  const fd = new FormData();
  fd.append("action", "delete");
  fd.append("id", id);
  fetch("actions/admin/users.php", { method: "POST", body: fd })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("User deleted!", "success");
        loadUsers();
      } else {
        showNotification(d.message || "Delete failed", "error");
      }
    })
    .catch(() => showNotification("Delete failed", "error"));
}

function loadRequests() {
  if (!currentUser || currentUser.role !== "admin") {
    return;
  }

  fetch("actions/admin/requests.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) return;
      const tbody = document.getElementById("requestsTableBody");
      if (tbody) {
        tbody.innerHTML = d.data
          .map(
            (req) => `
          <tr data-id="${req.id}">
            <td>${req.user_name}<br><small>${req.email}</small></td>
            <td>${req.club_name}</td>
            <td>${new Date(req.joined_date).toLocaleDateString()}</td>
            <td><span class="badge badge-warning">Pending</span></td>
            <td>
              <button class="btn btn-success" onclick="approveRequest(${
                req.id
              })">Approve</button>
              <button class="btn btn-danger" onclick="rejectRequest(${
                req.id
              })">Reject</button>
            </td>
          </tr>
        `
          )
          .join("");
      }
    })
    .catch((error) => console.error("Error loading requests:", error));
}

function approveRequest(id) {
  const fd = new FormData();
  fd.append("action", "approve");
  fd.append("id", id);
  fetch("actions/admin/requests.php", { method: "POST", body: fd })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Request approved!", "success");
        loadRequests();
      } else {
        showNotification(d.message || "Approve failed", "error");
      }
    })
    .catch(() => showNotification("Approve failed", "error"));
}

function rejectRequest(id) {
  if (!confirm("Are you sure you want to reject this request?")) return;
  const fd = new FormData();
  fd.append("action", "reject");
  fd.append("id", id);
  fetch("actions/admin/requests.php", { method: "POST", body: fd })
    .then((r) => r.json())
    .then((d) => {
      if (d.success) {
        showNotification("Request rejected!", "success");
        loadRequests();
      } else {
        showNotification(d.message || "Reject failed", "error");
      }
    })
    .catch(() => showNotification("Reject failed", "error"));
}

// Loaders
function loadStats() {
  // Check session first
  if (!currentUser || currentUser.role !== "admin") {
    showNotification("Session expired. Please login again.", "error");
    showSection("home");
    return;
  }

  Promise.all([
    fetch("actions/admin/clubs.php?action=list").then((r) => r.json()),
    fetch("actions/admin/events.php?action=list").then((r) => r.json()),
    fetch("actions/admin/users.php?action=list").then((r) => r.json()),
  ])
    .then(([c, e, u]) => {
      if (!c.success || !e.success || !u.success) return;
      const stats = document.getElementById("adminStats");
      if (stats) {
        stats.innerHTML = `
        <div class="stat-card"><div class="stat-number">${c.data.length}</div><div class="stat-label">Total Clubs</div></div>
        <div class="stat-card"><div class="stat-number">${e.data.length}</div><div class="stat-label">Events</div></div>
        <div class="stat-card"><div class="stat-number">${u.data.length}</div><div class="stat-label">Users</div></div>
      `;
      }
    })
    .catch((error) => {
      console.error("Error loading stats:", error);
      showNotification("Error loading dashboard data", "error");
    });
}
function loadClubs() {
  if (!currentUser || currentUser.role !== "admin") {
    return;
  }

  fetch("actions/admin/clubs.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) return;
      const tbody = document.getElementById("clubsTableBody");
      if (tbody) {
        tbody.innerHTML = d.data
          .map(
            (row) => `
        <tr data-id="${row.id}" data-category="${
              row.category || ""
            }" data-schedule="${row.schedule_meeting || ""}" data-leader-id="${
              row.leader_id || ""
            }" data-description="${row.description || ""}" data-activities="${(
              row.activities || ""
            ).replace(/"/g, "&quot;")}" data-club-image="${
              row.club_image || ""
            }">
          <td data-field="name"><strong>${row.name}</strong></td>
          <td data-field="leader">${row.leader_name || "N/A"}</td>
          <td data-field="members">${row.member_count || 0}</td>
          <td data-field="category">${row.category || ""}</td>
          <td>
              <button class="btn btn-secondary" onclick="editClub(${
                row.id
              })">Edit</button>
              <button class="btn btn-danger" onclick="deleteClub(${
                row.id
              })">Delete</button>
          </td>
        </tr>
      `
          )
          .join("");
      }
      // Also populate event selects so add/edit event modals have the latest clubs
      try {
        const eventSelect = document.getElementById("addEventClub");
        const editEventSelect = document.getElementById("editEventClub");
        const options =
          '<option value="">Select Club</option>' +
          d.data
            .map((c) => `<option value="${c.id}">${c.name}</option>`)
            .join("");
        if (eventSelect) eventSelect.innerHTML = options;
        if (editEventSelect) editEventSelect.innerHTML = options;
      } catch (e) {
        console.error("Error populating event selects:", e);
      }
    })
    .catch((error) => {
      console.error("Error loading clubs:", error);
    });
}
function loadEvents() {
  if (!currentUser || currentUser.role !== "admin") {
    return;
  }

  fetch("actions/admin/events.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      console.log("Events response:", d);
      if (!d.success) {
        console.error("Failed to load events:", d.message);
        return;
      }
      const tbody = document.getElementById("eventsTableBody");
      if (!tbody) {
        console.error("eventsTableBody element not found");
        return;
      }
      tbody.innerHTML = d.data
        .map(
          (row) => `
      <tr data-id="${row.id}" data-club-id="${row.club_id}" data-date="${
            row.date || ""
          }" data-max="${row.max_participants || 0}" data-description="${
            row.description || ""
          }">
        <td data-field="name">${row.name}</td>
        <td data-field="club">${row.club_name || ""}</td>
        <td data-field="date">${new Date(row.date).toLocaleDateString()}</td>
        <td data-field="location">${row.location || ""}</td>
        <td data-field="registrations">${row.registration_count || 0}/${
            row.max_participants || 0
          }</td>
        <td>
            <button class="btn btn-secondary" onclick="editEvent(${
              row.id
            })">Edit</button>
            <button class="btn btn-danger" onclick="deleteEvent(${
              row.id
            })">Delete</button>
        </td>
      </tr>
    `
        )
        .join("");
    })
    .catch((error) => {
      console.error("Error loading events:", error);
    });
}
function loadUsers() {
  if (!currentUser || currentUser.role !== "admin") {
    return;
  }

  fetch("actions/admin/users.php?action=list")
    .then((r) => r.json())
    .then((d) => {
      console.log("Users response:", d);
      if (!d.success) {
        console.error("Failed to load users:", d.message);
        return;
      }
      const tbody = document.getElementById("usersTableBody");
      if (!tbody) {
        console.error("usersTableBody element not found");
        return;
      }
      tbody.innerHTML = d.data
        .map(
          (u) => `
      <tr data-id="${u.id}">
        <td>${u.id}</td>
        <td data-field="name">${u.name}</td>
        <td data-field="email">${u.email}</td>
        <td data-field="student_id">${u.student_id || ""}</td>
        <td data-field="role">${u.role}</td>
        <td>
            <button class="btn btn-secondary" onclick="editUser(${
              u.id
            })">Edit</button>
            <button class="btn btn-danger" onclick="deleteUser(${
              u.id
            })">Delete</button>
        </td>
      </tr>
    `
        )
        .join("");
    })
    .catch((error) => {
      console.error("Error loading users:", error);
    });
}

// Initialize admin functions when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Re-attach event listeners for admin section buttons
  const adminButtons = document.querySelectorAll(
    'button[onclick*="showAdminSection"]'
  );
  adminButtons.forEach((button) => {
    const onclick = button.getAttribute("onclick");
    if (onclick) {
      const match = onclick.match(/showAdminSection\('([^']+)'\)/);
      if (match) {
        const sectionName = match[1];
        button.addEventListener("click", (e) => {
          e.preventDefault();
          showAdminSection(sectionName);
          // Load requests when requests section is shown
          if (sectionName === "requests") {
            loadRequests();
          }
        });
      }
    }
  });

  // Load admin data when dashboard shows
  const dashboardLink = document.querySelector('a[onclick*="dashboard"]');
  if (dashboardLink) {
    dashboardLink.addEventListener("click", () => {
      setTimeout(() => {
        if (currentUser && currentUser.role === "admin") {
          loadStats();
          loadUsers();
          loadClubs();
          loadEvents();
          loadRequests();
          showAdminSection("users");
        }
      }, 100);
    });
  }
});

// Re-initialize admin functions when needed
function initializeAdminFunctions() {
  if (currentUser && currentUser.role === "admin") {
    loadStats();
    loadUsers();
    loadClubs();
    loadEvents();
    loadRequests();
    showAdminSection("users");
  }
}

// Make functions globally available
window.showAdminSection = showAdminSection;
window.initializeAdminFunctions = initializeAdminFunctions;
window.loadStats = loadStats;
window.loadUsers = loadUsers;
window.loadClubs = loadClubs;
window.loadEvents = loadEvents;
window.loadRequests = loadRequests;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
