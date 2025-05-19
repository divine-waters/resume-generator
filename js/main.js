// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make the page content editable
    document.querySelector('#page').contentEditable = true;

    // Add event listener for the save button
    document.getElementById('saveButton').addEventListener('click', handleSave);

    // Add event listener for account form submission
    document.getElementById('accountForm').addEventListener('submit', handleAccountCreation);

    // Load any saved content
    loadResumeContent();

    // Add auto-save functionality with debounce
    let saveTimeout;
    document.querySelector('#page').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(handleSave, 1000); // Save 1 second after last change
    });

    initializeSectionToggles();
    
    // Add event listeners to section toggle checkboxes
    document.querySelectorAll('.section-toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const sectionId = this.getAttribute('data-section');
            toggleSection(sectionId, this.checked);
        });
    });
});

// Handle save attempt
function handleSave() {
    const hasAccount = localStorage.getItem('hasAccount');
    if (!hasAccount) {
        // Show account creation modal
        $('#accountModal').modal('show');
        return;
    }
    // If user has account, proceed with save
    saveResumeContent();
}

// Handle account creation
function handleAccountCreation(event) {
    event.preventDefault();
    
    const email = document.getElementById('accountEmail').value;
    const password = document.getElementById('accountPassword').value;

    // Here you would typically make an API call to create the account
    // For now, we'll just simulate a successful account creation
    try {
        // Store account info (in a real app, this would be handled by your backend)
        localStorage.setItem('userEmail', email);
        localStorage.setItem('hasAccount', 'true');
        
        // Close the modal
        $('#accountModal').modal('hide');
        
        // Show success message
        alert('Account created successfully! Your resume will now be saved.');
        
        // Proceed with saving the resume
        saveResumeContent();
    } catch (error) {
        console.error('Error creating account:', error);
        alert('There was an error creating your account. Please try again.');
    }
}

// Save resume content function
function saveResumeContent() {
    try {
        // Get the current page content
        const pageContent = document.querySelector('#page').innerHTML;
        
        // Define sections in their original order with their template settings
        const sectionTemplates = [
            {
                id: 'sectionMission',
                template: {
                    title: 'Mission Statement',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: '<blockquote style="font-size:1.1em; color:#444;">Your mission statement here...</blockquote>'
                }
            },
            {
                id: 'sectionEducation',
                template: {
                    title: 'Education',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <table class="table customBordered" id="educationTable">
                                <tbody>
                                    <tr>
                                        <td class="header">Degree</td>
                                        <td class="header">Institute</td>
                                        <td class="header">Location</td>
                                        <td class="header">Year</td>
                                    </tr>
                                    <tr>
                                        <td>B.Tech</td>
                                        <td>Indian Institute of Technology Guwahati</td>
                                        <td>Guwahati</td>
                                        <td>2018</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>`
                }
            },
            {
                id: 'sectionExperience',
                template: {
                    title: 'Experience',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: '<div><div><div class="title">Position Title</div><div class="time right">Duration</div></div><div><ul class="disc"></ul></div></div>'
                }
            },
            {
                id: 'sectionSkills',
                template: {
                    title: 'Technical Skills',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: '<div><strong><span class="skillCategory">Category</span> :</strong> Skills here...</div>'
                }
            },
            {
                id: 'sectionProjects',
                template: {
                    title: 'Projects',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <div>
                                <div class="title">Project Title</div>
                                <div class="time right">Duration</div>
                            </div>
                            <div>
                                <ul class="disc">
                                    <li>Project description point 1</li>
                                    <li>Project description point 2</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div>
                                <div class="title">Another Project</div>
                                <div class="time right">Duration</div>
                            </div>
                            <div>
                                <ul class="disc">
                                    <li>Project description point 1</li>
                                    <li>Project description point 2</li>
                                </ul>
                            </div>
                        </div>`
                }
            },
            {
                id: 'sectionPublications',
                template: {
                    title: 'Publications',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <div>
                                <div class="title">Publication Title</div>
                                <div class="time right">Year</div>
                            </div>
                            <div>
                                <ul class="disc">
                                    <li>Published in Journal Name</li>
                                    <li>Authors: Author 1, Author 2</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div>
                                <div class="title">Another Publication</div>
                                <div class="time right">Year</div>
                            </div>
                            <div>
                                <ul class="disc">
                                    <li>Published in Conference Name</li>
                                    <li>Authors: Author 1, Author 2</li>
                                </ul>
                            </div>
                        </div>`
                }
            },
            {
                id: 'sectionAchievements',
                template: {
                    title: 'Achievements',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <ul class="disc">
                                <li>Achievement 1 - Description of the achievement</li>
                                <li>Achievement 2 - Description of the achievement</li>
                                <li>Achievement 3 - Description of the achievement</li>
                            </ul>
                        </div>`
                }
            },
            {
                id: 'sectionResponsibility',
                template: {
                    title: 'Positions of Responsibility',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <ul class="disc">
                                <li>Position 1 - Description of responsibilities</li>
                                <li>Position 2 - Description of responsibilities</li>
                                <li>Position 3 - Description of responsibilities</li>
                            </ul>
                        </div>`
                }
            },
            {
                id: 'sectionCourses',
                template: {
                    title: 'Key Courses Taken',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <ul class="disc">
                                <li>Course 1 - Brief description</li>
                                <li>Course 2 - Brief description</li>
                                <li>Course 3 - Brief description</li>
                            </ul>
                        </div>`
                }
            },
            {
                id: 'sectionCurricular',
                template: {
                    title: 'Extra Curriculars',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <ul class="disc">
                                <li>Activity 1 - Description of involvement</li>
                                <li>Activity 2 - Description of involvement</li>
                                <li>Activity 3 - Description of involvement</li>
                            </ul>
                        </div>`
                }
            },
            {
                id: 'sectionFooterMessage',
                template: {
                    title: 'References',
                    classes: ['section-title', 'ruled', 'rule-above'],
                    defaultContent: `
                        <div>
                            <p class="text">Available upon request</p>
                        </div>`
                }
            }
        ];
        
        // Create a temporary div to check content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pageContent;
        
        // Check if any sections are missing and restore them with proper template
        const missingSections = sectionTemplates.filter(section => !tempDiv.querySelector(`#${section.id}`));
        
        if (missingSections.length > 0) {
            console.warn('Restoring missing sections with templates:', missingSections.map(s => s.id));
            
            // Create and append missing sections with proper template
            missingSections.forEach(section => {
                const sectionHtml = `
                    <div class="section" id="${section.id}">
                        <div class="${section.template.classes.join(' ')}">
                            <hr class="hr-above">
                            <h4><strong>${section.template.title}</strong></h4>
                            <hr class="hr-below">
                        </div>
                        ${section.template.defaultContent}
                    </div>
                `;
                tempDiv.innerHTML += sectionHtml;
            });
        }
        
        // Save the complete content
        const userEmail = localStorage.getItem('userEmail');
        const saveKey = userEmail ? `resumeContent_${userEmail}` : 'resumeContent';
        localStorage.setItem(saveKey, tempDiv.innerHTML);
        
        // Show save confirmation
        const saveButton = document.getElementById('saveButton');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'SAVED!';
        saveButton.classList.remove('btn-info');
        saveButton.classList.add('btn-success');
        
        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.classList.remove('btn-success');
            saveButton.classList.add('btn-info');
        }, 2000);
    } catch (error) {
        console.error('Error saving resume:', error);
        alert('There was an error saving your changes. Please try again.');
    }
}

// Load saved content function
function loadResumeContent() {
    try {
        const userEmail = localStorage.getItem('userEmail');
        const saveKey = userEmail ? `resumeContent_${userEmail}` : 'resumeContent';
        const savedContent = localStorage.getItem(saveKey);
        
        if (savedContent) {
            // Store the current section visibility state
            const currentVisibility = window.getSectionVisibility ? window.getSectionVisibility() : null;
            
            // Create a temporary div to check content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = savedContent;
            
            // Use the same section templates as in saveResumeContent
            const sectionTemplates = [
                {
                    id: 'sectionMission',
                    template: {
                        title: 'Mission Statement',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: '<blockquote style="font-size:1.1em; color:#444;">Your mission statement here...</blockquote>'
                    }
                },
                {
                    id: 'sectionEducation',
                    template: {
                        title: 'Education',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <table class="table customBordered" id="educationTable">
                                    <tbody>
                                        <tr>
                                            <td class="header">Degree</td>
                                            <td class="header">Institute</td>
                                            <td class="header">Location</td>
                                            <td class="header">Year</td>
                                        </tr>
                                        <tr>
                                            <td>B.Tech</td>
                                            <td>Indian Institute of Technology Guwahati</td>
                                            <td>Guwahati</td>
                                            <td>2018</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>`
                    }
                },
                {
                    id: 'sectionExperience',
                    template: {
                        title: 'Experience',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: '<div><div><div class="title">Position Title</div><div class="time right">Duration</div></div><div><ul class="disc"></ul></div></div>'
                    }
                },
                {
                    id: 'sectionSkills',
                    template: {
                        title: 'Technical Skills',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: '<div><strong><span class="skillCategory">Category</span> :</strong> Skills here...</div>'
                    }
                },
                {
                    id: 'sectionProjects',
                    template: {
                        title: 'Projects',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <div>
                                    <div class="title">Project Title</div>
                                    <div class="time right">Duration</div>
                                </div>
                                <div>
                                    <ul class="disc">
                                        <li>Project description point 1</li>
                                        <li>Project description point 2</li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div class="title">Another Project</div>
                                    <div class="time right">Duration</div>
                                </div>
                                <div>
                                    <ul class="disc">
                                        <li>Project description point 1</li>
                                        <li>Project description point 2</li>
                                    </ul>
                                </div>
                            </div>`
                    }
                },
                {
                    id: 'sectionPublications',
                    template: {
                        title: 'Publications',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <div>
                                    <div class="title">Publication Title</div>
                                    <div class="time right">Year</div>
                                </div>
                                <div>
                                    <ul class="disc">
                                        <li>Published in Journal Name</li>
                                        <li>Authors: Author 1, Author 2</li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div class="title">Another Publication</div>
                                    <div class="time right">Year</div>
                                </div>
                                <div>
                                    <ul class="disc">
                                        <li>Published in Conference Name</li>
                                        <li>Authors: Author 1, Author 2</li>
                                    </ul>
                                </div>
                            </div>`
                    }
                },
                {
                    id: 'sectionAchievements',
                    template: {
                        title: 'Achievements',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <ul class="disc">
                                    <li>Achievement 1 - Description of the achievement</li>
                                    <li>Achievement 2 - Description of the achievement</li>
                                    <li>Achievement 3 - Description of the achievement</li>
                                </ul>
                            </div>`
                    }
                },
                {
                    id: 'sectionResponsibility',
                    template: {
                        title: 'Positions of Responsibility',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <ul class="disc">
                                    <li>Position 1 - Description of responsibilities</li>
                                    <li>Position 2 - Description of responsibilities</li>
                                    <li>Position 3 - Description of responsibilities</li>
                                </ul>
                            </div>`
                    }
                },
                {
                    id: 'sectionCourses',
                    template: {
                        title: 'Key Courses Taken',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <ul class="disc">
                                    <li>Course 1 - Brief description</li>
                                    <li>Course 2 - Brief description</li>
                                    <li>Course 3 - Brief description</li>
                                </ul>
                            </div>`
                    }
                },
                {
                    id: 'sectionCurricular',
                    template: {
                        title: 'Extra Curriculars',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <ul class="disc">
                                    <li>Activity 1 - Description of involvement</li>
                                    <li>Activity 2 - Description of involvement</li>
                                    <li>Activity 3 - Description of involvement</li>
                                </ul>
                            </div>`
                    }
                },
                {
                    id: 'sectionFooterMessage',
                    template: {
                        title: 'References',
                        classes: ['section-title', 'ruled', 'rule-above'],
                        defaultContent: `
                            <div>
                                <p class="text">Available upon request</p>
                            </div>`
                    }
                }
            ];
            
            // Check if any sections are missing and restore them with proper template
            const missingSections = sectionTemplates.filter(section => !tempDiv.querySelector(`#${section.id}`));
            
            if (missingSections.length > 0) {
                console.warn('Restoring missing sections with templates:', missingSections.map(s => s.id));
                
                // Create and append missing sections with proper template
                missingSections.forEach(section => {
                    const sectionHtml = `
                        <div class="section" id="${section.id}">
                            <div class="${section.template.classes.join(' ')}">
                                <hr class="hr-above">
                                <h4><strong>${section.template.title}</strong></h4>
                                <hr class="hr-below">
                            </div>
                            ${section.template.defaultContent}
                        </div>
                    `;
                    tempDiv.innerHTML += sectionHtml;
                });
            }
            
            // Update the page content
            document.querySelector('#page').innerHTML = tempDiv.innerHTML;
            console.log('Resume content loaded successfully');
            
            // Wait for DOM to update
            setTimeout(() => {
                // Restore section visibility if we had it
                if (currentVisibility && window.setSectionVisibility) {
                    window.setSectionVisibility(currentVisibility);
                } else {
                    // Otherwise initialize with default state
                    initializeSectionToggles();
                }
                
                // Reapply template settings
                defaultTemplateVars.forEach(templateVar => {
                    $(`#${templateVar}`).click();
                });
            }, 0);
        }
    } catch (error) {
        console.error('Error loading resume:', error);
        alert('There was an error loading your saved content.');
    }
}

defaultTemplateVars = [ "fontDroid" , "caseNormal" , "titleRuled" , "ruleAbove" , "imageShow" , "rollShow" , "course1" , "tableShow" , "edyearFirst" , "experience1" , "projects1" ]

$('.toggle-option').click(function(){
	toggleType = $(this).attr('data-toggle');
	toggleValue = $(this).attr('id');
	if(!$(this).hasClass('multi-select'))
	{
		if(!$(this).hasClass('selected'))
		{
			$('.toggle-option',$(this).parent()).removeClass('selected');
			$(this).addClass('selected');
			changeTemplate(toggleType,toggleValue);
		}
	}
	else
	{
		if($(this).hasClass('selected'))
			$(this).removeClass('selected');
		else
			$(this).addClass('selected');
		changeTemplate(toggleType,toggleValue);
	}
});

$('input[name="sectionToggle"]').change(function(){
	toggleSection($(this).val(),$(this).is(':checked'));
});


function template(value)
{
	if(value=='default')
	{
		$('#defaultTemplateBtn').removeClass('btn-default').addClass('btn-danger');
		$('#customTemplateBtn').removeClass('btn-danger').addClass('btn-default');
		$('#customTemplateOptions').hide();
		for(i=0;i<defaultTemplateVars.length;i++)
			$('#'+defaultTemplateVars[i]).click();
	}
	else
	{
		$('#customTemplateBtn').removeClass('btn-default').addClass('btn-danger');
		$('#defaultTemplateBtn').removeClass('btn-danger').addClass('btn-default');
		$('#customTemplateOptions').show();
	}
}

// Section toggle handling
function toggleSection(sectionId, isVisible) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = isVisible ? 'block' : 'none';
        
        // Update saved state
        const savedState = JSON.parse(localStorage.getItem('sectionVisibility') || '{}');
        savedState[sectionId] = isVisible;
        localStorage.setItem('sectionVisibility', JSON.stringify(savedState));
    }
}

// Initialize section toggles
function initializeSectionToggles() {
    // Initialize section visibility based on saved state or defaults
    const defaultVisibleSections = {
        'sectionMission': true,
        'sectionEducation': true,
        'sectionExperience': true,
        'sectionSkills': true,
        'sectionProjects': true,
        'sectionPublications': true,
        'sectionAchievements': true,
        'sectionResponsibility': true,
        'sectionCourses': true,
        'sectionExtraCurriculars': true,
        'sectionReferences': true
    };

    // Load saved visibility state or use defaults
    const savedState = localStorage.getItem('sectionVisibility');
    const visibilityState = savedState ? JSON.parse(savedState) : defaultVisibleSections;

    // Apply visibility state to sections and checkboxes
    Object.entries(visibilityState).forEach(([sectionId, isVisible]) => {
        const section = document.getElementById(sectionId);
        const checkbox = document.querySelector(`input[data-section="${sectionId}"]`);
        
        if (section && checkbox) {
            section.style.display = isVisible ? 'block' : 'none';
            checkbox.checked = isVisible;
        }
    });

    // Save initial state if none exists
    if (!savedState) {
        localStorage.setItem('sectionVisibility', JSON.stringify(visibilityState));
    }
}

// Initialize on document ready
$(document).ready(function() {
    console.log('Document ready, initializing toggles');
    initializeSectionToggles();
    
    // Reinitialize after loading saved content
    $(window).on('loadResumeContent', function() {
        console.log('Content loaded, reinitializing toggles');
        initializeSectionToggles();
    });

    // Save section visibility state when saving resume
    window.getSectionVisibility = function() {
        const visibility = {};
        $('input[name="sectionToggle"]').each(function() {
            visibility[$(this).val()] = $(this).prop('checked');
        });
        return visibility;
    };

    // Restore section visibility state when loading resume
    window.setSectionVisibility = function(visibility) {
        if (!visibility) return;
        
        Object.entries(visibility).forEach(([sectionId, isVisible]) => {
            const checkbox = $(`input[name="sectionToggle"][value="${sectionId}"]`);
            checkbox.prop('checked', isVisible);
            const section = $(`#${sectionId}`);
            if (section.length) {
                section.toggle(isVisible);
            }
        });
        
        // Reinitialize toggle handlers after restoring visibility
        initializeSectionToggles();
    };
});