// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://your-production-api-url.com'; // Replace with your actual production API URL

// Auth state management
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let isSaving = false; // Global saving state

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
const saveButton = $('#saveButton');
const resumeList = $('#resumeList .list-group');

// Show/hide auth elements based on login state
function updateAuthUI() {
    // Remove all existing click handlers first
    saveButton.off('click');
    accountButton.off('click');
    logoutButton.off('click');

    if (authToken) {
        // Update main buttons
        saveButton
            .text('SAVE')
            .on('click', handleSave);
        accountButton
            .text('ACCOUNT')
            .show()
            .on('click', (e) => {
                e.preventDefault();
                accountModal.modal('show');
            });
        logoutButton.show();
        
        // Update modal content
        loggedInContent.show();
        authForms.hide();
        userEmail.text(currentUser.email);
        
        // Load resumes
        loadResumes();
    } else {
        // Update main buttons
        saveButton
            .text('LOGIN TO SAVE')
            .on('click', (e) => {
                e.preventDefault();
                accountModal.modal('show');
            });
        accountButton.hide();
        logoutButton.hide();
        
        // Update modal content
        loggedInContent.hide();
        authForms.show();
        userEmail.text('');
        
        // Clear resume list
        resumeList.empty();
    }
}

// Handle save operation
async function handleSave(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (!authToken) {
        accountModal.modal('show');
        return;
    }
    
    // Prevent multiple saves
    if (isSaving) {
        console.log('Save already in progress');
        return;
    }
    
    try {
        isSaving = true;
        saveButton.prop('disabled', true).text('SAVING...');
        
        const resumeName = prompt('Enter a name for this resume:');
        if (!resumeName) {
            return;
        }
        
        const content = $('#page').html();
        
        // Save the resume
        const response = await fetch(`${API_BASE_URL}/api/resumes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: resumeName, content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save resume');
        }

        // Update UI optimistically
        const resumeWithId = data.resume;
        const resumeItem = createResumeListItem(resumeWithId);
        resumeList.prepend(resumeItem);
        $('#noResumes').hide();
        
        showSuccess('Resume saved successfully!');
        
        // Show the account modal with the updated list
        accountModal.modal('show');
    } catch (error) {
        console.error('Save error:', error);
        showError(error.message);
    } finally {
        isSaving = false;
        saveButton.prop('disabled', false).text('SAVE');
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

// Create resume list item HTML
function createResumeListItem(resume) {
    const lastModified = new Date(resume.lastModified).toLocaleString();
    return `
        <div class="list-group-item" data-resume-id="${resume._id}">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${resume.name}</h5>
                    <small class="text-muted">Last modified: ${lastModified}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary load-resume">Load</button>
                    <button class="btn btn-sm btn-danger delete-resume">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Load saved resumes with optimized rendering
async function loadResumes() {
    if (!authToken) return;
    
    try {
        // Show loading state
        resumeList.html('<div class="text-center"><p>Loading resumes...</p></div>');
        $('#noResumes').hide();

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
        if (data.resumes && data.resumes.length > 0) {
            const fragment = document.createDocumentFragment();
            data.resumes.forEach(resume => {
                if (!resume._id) {
                    console.error('Resume missing ID:', resume);
                    return;
                }
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = createResumeListItem(resume);
                fragment.appendChild(tempDiv.firstElementChild);
            });
            resumeList.empty().append(fragment);
            $('#noResumes').hide();
        } else {
            resumeList.empty();
            $('#noResumes').show();
        }
    } catch (error) {
        console.error('Error loading resumes:', error);
        resumeList.html(`
            <div class="alert alert-danger">
                Failed to load resumes: ${error.message}
            </div>
        `);
        $('#noResumes').hide();
    }
}

// Load a specific resume with optimized UI updates
async function loadResume(resumeId) {
    if (!authToken || !resumeId) return;
    
    try {
        const loadButton = $(`.load-resume[data-resume-id="${resumeId}"]`);
        loadButton.prop('disabled', true).text('Loading...');
        
        console.log('Attempting to load resume:', resumeId);
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Failed to load resume (${response.status})`);
        }
        
        // Update the page content
        $('#page').html(data.content);
        showSuccess('Resume loaded successfully!');
        accountModal.modal('hide');
    } catch (error) {
        console.error('Error loading resume:', error);
        showError(error.message);
    } finally {
        const loadButton = $(`.load-resume[data-resume-id="${resumeId}"]`);
        loadButton.prop('disabled', false).text('Load');
    }
}

// Delete a resume with optimized UI updates
async function deleteResume(resumeId) {
    if (!authToken || !resumeId) return;
    
    const resumeItem = $(`.list-group-item[data-resume-id="${resumeId}"]`);
    if (!resumeItem.length) {
        console.log('Resume item not found in UI, refreshing list...');
        await loadResumes();
        return;
    }
    
    if (!confirm('Are you sure you want to delete this resume?')) {
        return;
    }

    try {
        const deleteButton = resumeItem.find('.delete-resume');
        deleteButton.prop('disabled', true).text('Deleting...');
        
        console.log('Attempting to delete resume:', resumeId);
        const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 404) {
            // Resume already deleted, refresh the list
            console.log('Resume not found, refreshing list...');
            await loadResumes();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Failed to delete resume (${response.status})`);
        }

        // Remove the item from UI immediately
        resumeItem.remove();
        
        // Show no resumes message if list is empty
        if ($('#resumeList .list-group-item').length === 0) {
            $('#noResumes').show();
        }
        
        showSuccess('Resume deleted successfully!');
    } catch (error) {
        console.error('Error deleting resume:', error);
        showError(error.message);
        
        // If we get a 404, refresh the list as the resume might have been deleted
        if (error.message.includes('404') || error.message.includes('not found')) {
            await loadResumes();
        }
    } finally {
        // Reset button state if it still exists
        const deleteButton = resumeItem.find('.delete-resume');
        if (deleteButton.length) {
            deleteButton.prop('disabled', false).text('Delete');
        }
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

    // Use event delegation for resume actions with optimized selectors
    resumeList.on('click', '.load-resume', function(e) {
        e.preventDefault();
        const resumeId = $(this).closest('.list-group-item').data('resume-id');
        if (resumeId) {
            loadResume(resumeId);
        }
    });

    resumeList.on('click', '.delete-resume', function(e) {
        e.preventDefault();
        const resumeId = $(this).closest('.list-group-item').data('resume-id');
        if (resumeId) {
            deleteResume(resumeId);
        }
    });
}); 