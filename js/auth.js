// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Auth state management
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// DOM Elements
const accountModal = $('#accountModal');
const accountForm = $('#accountForm');
const loginForm = $('#loginForm');
const authError = $('#authError');
const authSuccess = $('#authSuccess');
const accountButton = $('#accountButton');
const logoutButton = $('#logoutButton');
const loggedInContent = $('#loggedInContent');
const authForms = $('#authForms');
const userEmail = $('#userEmail');

// Show/hide auth elements based on login state
function updateAuthUI() {
    // Remove all existing click handlers first
    $('#saveButton').off('click');
    $('#accountButton').off('click');
    $('#logoutButton').off('click');

    if (authToken) {
        // Update main buttons
        $('#saveButton')
            .text('SAVE')
            .on('click', handleSave.bind($('#saveButton')[0]));
        $('#accountButton')
            .text('ACCOUNT')
            .show()
            .on('click', (e) => {
                e.preventDefault();
                $('#accountModal').modal('show');
            });
        $('#logoutButton').show();
        
        // Update modal content
        loggedInContent.show();
        authForms.hide();
        userEmail.text(currentUser.email);
        
        // Load resumes
        loadResumes();
    } else {
        // Update main buttons
        $('#saveButton')
            .text('LOGIN TO SAVE')
            .on('click', (e) => {
                e.preventDefault();
                $('#accountModal').modal('show');
            });
        $('#accountButton').hide();
        $('#logoutButton').hide();
        
        // Update modal content
        loggedInContent.hide();
        authForms.show();
        userEmail.text('');
        
        // Clear resume list
        $('#resumeList .list-group').empty();
    }
}

// Handle save button click
async function handleSave(e) {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    if (!authToken) {
        $('#accountModal').modal('show');
        return;
    }
    
    // Prevent multiple prompts
    if (this.isSaving) return;
    this.isSaving = true;
    
    try {
        const resumeName = prompt('Enter a name for this resume:');
        if (!resumeName) {
            this.isSaving = false;
            return;
        }
        
        const content = $('#page').html();
        await saveResume(resumeName, content);
    } finally {
        // Reset saving flag
        this.isSaving = false;
    }
}

// Handle registration
async function register(email, password) {
    try {
        console.log('Attempting registration for:', email);
        
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'same-origin'
        });

        console.log('Registration response status:', response.status);
        const data = await response.json();
        console.log('Registration response:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        // Store auth data
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update UI
        updateAuthUI();
        showSuccess('Registration successful!');
        accountModal.modal('hide');
        
        // Load user's resumes after successful registration
        await loadResumes();
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

// Handle login
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store auth data
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update UI
        updateAuthUI();
        showSuccess('Login successful!');
        accountModal.modal('hide');
    } catch (error) {
        showError(error.message);
    }
}

// Handle logout
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSuccess('Logged out successfully');
    accountModal.modal('hide');
}

// Save resume
async function saveResume(name, content) {
    if (!authToken) {
        $('#accountModal').modal('show');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save resume');
        }

        showSuccess('Resume saved successfully!');
        
        // Refresh the resume list immediately
        await loadResumes();
        
        // Show the account modal with the updated list
        $('#accountModal').modal('show');
    } catch (error) {
        showError(error.message);
    }
}

// Load saved resumes
async function loadResumes() {
    if (!authToken) return;

    const resumeList = $('#resumeList .list-group');
    const noResumes = $('#noResumes');
    
    try {
        // Show loading state
        resumeList.html('<div class="text-center"><p>Loading resumes...</p></div>');
        noResumes.hide();

        const response = await fetch(`${API_BASE_URL}/api/resumes`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load resumes');
        }

        // Update resume list in UI
        resumeList.empty();
        
        if (data.resumes && data.resumes.length > 0) {
            data.resumes.forEach(resume => {
                const lastModified = new Date(resume.lastModified).toLocaleString();
                const resumeId = resume._id || resume.id; // Handle both MongoDB and custom IDs
                resumeList.append(`
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-1">${resume.name}</h5>
                                <small class="text-muted">Last modified: ${lastModified}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-primary" onclick="loadResume('${resumeId}')">Load</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteResume('${resumeId}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `);
            });
            noResumes.hide();
        } else {
            resumeList.empty();
            noResumes.show();
        }
    } catch (error) {
        console.error('Error loading resumes:', error);
        resumeList.html(`
            <div class="alert alert-danger">
                Failed to load resumes: ${error.message}
            </div>
        `);
        noResumes.hide();
    }
}

// Load a specific resume
async function loadResume(resumeId) {
    if (!authToken) return;
    
    if (!resumeId) {
        showError('Invalid resume ID');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Failed to load resume (${response.status})`);
        }

        const data = await response.json();
        
        // Update the page content
        $('#page').html(data.content);
        showSuccess('Resume loaded successfully!');
        accountModal.modal('hide');
    } catch (error) {
        console.error('Error loading resume:', error);
        showError(error.message);
    }
}

// Delete a resume
async function deleteResume(resumeId) {
    if (!authToken) return;
    
    if (!resumeId) {
        showError('Invalid resume ID');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this resume?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Failed to delete resume (${response.status})`);
        }

        showSuccess('Resume deleted successfully!');
        await loadResumes(); // Refresh the list
    } catch (error) {
        console.error('Error deleting resume:', error);
        showError(error.message);
    }
}

// UI helpers
function showError(message) {
    authError.text(message).show();
    setTimeout(() => authError.fadeOut(), 5000);
}

function showSuccess(message) {
    authSuccess.text(message).show();
    setTimeout(() => authSuccess.fadeOut(), 5000);
}

// Event listeners
$(document).ready(() => {
    // Initialize auth UI
    updateAuthUI();

    // Handle logout button click
    logoutButton.on('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Handle registration form submission
    accountForm.on('submit', async (e) => {
        e.preventDefault();
        const email = $('#accountEmail').val();
        const password = $('#accountPassword').val();
        await register(email, password);
    });

    // Handle login form submission
    loginForm.on('submit', async (e) => {
        e.preventDefault();
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();
        await login(email, password);
    });
}); 