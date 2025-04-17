let taskId = 1;
let currentUser = { name: "", role: "", email: "" };
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let comments = JSON.parse(localStorage.getItem("comments")) || [];
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

function switchScreen(screenId) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'block';

    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.opacity = '0'; // Reset opacity
        });

        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.add('active');
        targetScreen.style.transition = 'opacity 0.3s ease';
        targetScreen.style.opacity = '1'; // Fade in

        spinner.style.display = 'none';

        if (screenId === 'dashboard-screen') {
            displayNotifications();
        } else if (screenId === 'tasks-screen') {
            displayTasks();
        } else if (screenId === 'profile-screen') {
            displayProfile();
        }
    }, 500);
}

function displayTasks() {
    const taskList = document.querySelector("#task-list tbody");
    const filterStatus = document.getElementById("filter-status").value;
    const sortBy = document.getElementById("sort-by").value;

    // Filter tasks
    let filteredTasks = tasks;
    if (filterStatus !== "All") {
        filteredTasks = tasks.filter(task => task.status === filterStatus);
    }

    // Sort tasks
    if (sortBy === "due-asc") {
        filteredTasks.sort((a, b) => new Date(a.due) - new Date(b.due));
    } else if (sortBy === "due-desc") {
        filteredTasks.sort((a, b) => new Date(b.due) - new Date(a.due));
    } else if (sortBy === "priority") {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    // Display tasks as table rows
    taskList.innerHTML = "";
    filteredTasks.forEach(task => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", task.id);
        tr.innerHTML = `
            <td data-label="Title">${task.title}</td>
            <td data-label="Assignee">${task.assignee}</td>
            <td data-label="Due Date">${task.due}</td>
            <td data-label="Status">
                <select class="status-update">
                    <option value="Not Started" ${task.status === "Not Started" ? "selected" : ""}>Not Started</option>
                    <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
                    <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
                </select>
            </td>
            <td data-label="Actions">
                <button class="collab-btn">Collaborate</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;
        taskList.appendChild(tr);
    });
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    notifications = notifications.filter(notif => !notif.message.includes(tasks.find(t => t.id === taskId)?.title));
    localStorage.setItem("notifications", JSON.stringify(notifications));
    displayTasks();
}

function displayNotifications() {
    const notificationList = document.getElementById("notification-list");
    notificationList.innerHTML = "";
    notifications
        .filter(notif => notif.user === currentUser.name)
        .forEach(notif => {
            const li = document.createElement("li");
            li.textContent = notif.message;
            notificationList.appendChild(li);
        });
}
window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.style.display = window.scrollY > 200 ? 'block' : 'none';
    }
});

function displayProfile() {
    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-email").value = currentUser.email;
    document.getElementById("profile-role").value = currentUser.role;
    document.getElementById("profile-password").value = "";
    document.getElementById("profile-confirm-password").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    displayTasks();
    displayNotifications();
    taskId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
});

document.getElementById("filter-status").addEventListener("change", displayTasks);
document.getElementById("sort-by").addEventListener("change", displayTasks);

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("login-error");

    if (!email || !password) {
        errorDiv.textContent = "Please fill in all fields.";
        return;
    }

    currentUser.name = email.split("@")[0];
    currentUser.email = email;
    currentUser.role = localStorage.getItem(`role_${email}`) || "Team Member";
    document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.name} (${currentUser.role})!`;
    errorDiv.textContent = "";
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    document.querySelector('.nav-link[data-screen="dashboard-screen"]').classList.add("active");
    switchScreen("dashboard-screen");
});

document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const role = document.getElementById("signup-role").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const errorDiv = document.getElementById("signup-error");

    if (!name || !email || !role || !password || !confirmPassword) {
        errorDiv.textContent = "Please fill in all fields.";
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match!";
        return;
    }

    localStorage.setItem(`role_${email}`, role);
    localStorage.setItem(`password_${email}`, password);
    errorDiv.textContent = "";
    currentUser.name = name;
    currentUser.email = email;
    currentUser.role = role;
    alert(`User ${name} registered successfully with email ${email} as ${role}!`);
    switchScreen("login-screen");
});

document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("profile-name").value;
    const email = document.getElementById("profile-email").value;
    const password = document.getElementById("profile-password").value;
    const confirmPassword = document.getElementById("profile-confirm-password").value;
    const errorDiv = document.getElementById("profile-error");

    if (!name || !email) {
        errorDiv.textContent = "Please fill in all required fields.";
        return;
    }

    if (password && password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match!";
        return;
    }

    const oldEmail = currentUser.email;
    currentUser.name = name;
    currentUser.email = email;
    if (password) {
        localStorage.setItem(`password_${email}`, password);
    }
    localStorage.setItem(`role_${email}`, currentUser.role);
    if (oldEmail !== email) {
        localStorage.removeItem(`role_${oldEmail}`);
        localStorage.removeItem(`password_${oldEmail}`);
    }

    errorDiv.textContent = "";
    alert("Profile updated successfully!");
    document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.name} (${currentUser.role})!`;
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        switchScreen(link.getAttribute("data-screen"));
    });
});

document.querySelectorAll("#logout").forEach(logout => {
    logout.addEventListener("click", (e) => {
        e.preventDefault();
        switchScreen("login-screen");
    });
});

document.getElementById("signup-link").addEventListener("click", (e) => {
    e.preventDefault();
    switchScreen("signup-screen");
});

document.getElementById("back-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    switchScreen("login-screen");
});

const taskForm = document.getElementById("task-form");
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-desc").value;
    const priority = document.getElementById("task-priority").value;
    const due = document.getElementById("task-due").value;
    const assignee = document.getElementById("task-assignee").value;
    const errorDiv = document.getElementById("task-error");

    if (!title || !due || !assignee) {
        errorDiv.textContent = "Please fill in all required fields.";
        return;
    }

    if (currentUser.role !== "Project Manager") {
        errorDiv.textContent = "Only Project Managers can create tasks.";
        return;
    }

    const task = { id: taskId++, title, desc, priority, due, assignee, status: "In Progress" };
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    if (assignee !== currentUser.name) {
        notifications.push({
            user: assignee,
            message: `You were assigned a new task: "${title}" due on ${due}.`
        });
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }

    errorDiv.textContent = "";
    displayTasks();
    taskForm.reset();
});

document.querySelector("#task-list").addEventListener("change", (e) => {
    if (e.target.classList.contains("status-update")) {
        const tr = e.target.closest("tr");
        const taskId = parseInt(tr.getAttribute("data-id"));
        const status = e.target.value;
        const task = tasks.find(t => t.id === taskId);
        task.status = status;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        displayTasks();
    }
});

document.querySelector("#task-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("collab-btn")) {
        const collabSection = document.getElementById("collab-section");
        collabSection.style.display = "block";
    }
});

document.getElementById("submit-comment").addEventListener("click", () => {
    const comment = document.getElementById("comment").value;
    if (comment) {
        const commentObj = { text: comment };
        comments.push(commentObj);
        localStorage.setItem("comments", JSON.stringify(comments));

        notifications.push({
            user: currentUser.name,
            message: `A new comment was added: "${comment}"`
        });
        localStorage.setItem("notifications", JSON.stringify(notifications));

        const li = document.createElement("li");
        li.textContent = comment;
        document.getElementById("comment-list").appendChild(li);
        document.getElementById("comment").value = "";
    }
});