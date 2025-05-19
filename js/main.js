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
        const content = document.querySelector('#page').innerHTML;
        const userEmail = localStorage.getItem('userEmail');
        
        // Save content with user's email as part of the key
        const saveKey = userEmail ? `resumeContent_${userEmail}` : 'resumeContent';
        localStorage.setItem(saveKey, content);
        
        // Show save confirmation
        const saveButton = document.getElementById('saveButton');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'SAVED!';
        saveButton.classList.remove('btn-info');
        saveButton.classList.add('btn-success');
        
        // Reset button after 2 seconds
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
            document.querySelector('#page').innerHTML = savedContent;
            console.log('Resume content loaded successfully');
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

function toggleSection(sectionName,toggleState)
{
	if(toggleState==true)
		$('input[value="'+sectionName+'"]').attr('checked','true');
	else
		$('input[value="'+sectionName+'"]').removeAttr('checked');
	$('#'+sectionName).toggle();
}

function changeTemplate(toggleType,toggleValue)
{
	switch(toggleType)
	{
		case 'minor':
			if(toggleValue=='minorShow')
			{
				$('#contentMinor').show();
				$('#image_box').css('margin-top','35px');
			}
			else
			{
				$('#contentMinor').hide();
				$('#image_box').css('margin-top','25px');
			}
			break;
		case 'contact':
			if(toggleValue=='contact3')
			{
				$('#contactLink1').hide();
				$('#contactLink2').hide();
			}
			else if(toggleValue=='contact4')
			{
				$('#contactLink1').show();
				$('#contactLink2').hide();
			}
			else
			{
				$('#contactLink1').show();
				$('#contactLink2').show();
			}
			break;
		case 'margin':
			if(toggleValue=='margin1')
				$('#page').css('padding','0.2cm 1cm 1cm 1cm');
			else if(toggleValue=='margin2')
				$('#page').css('padding','0.2cm 1.1cm 1cm 1.1cm');
			else if(toggleValue=='margin3')
				$('#page').css('padding','0.2cm 1.2cm 1cm 1.2cm');
			else if(toggleValue=='margin4')
				$('#page').css('padding','0.2cm 1.3cm 1cm 1.3cm');
			else if(toggleValue=='margin5')
				$('#page').css('padding','0.2cm 1.4cm 1cm 1.4cm');
			else if(toggleValue=='margin6')
				$('#page').css('padding','0.2cm 1.5cm 1cm 1.5cm');
			break;
		case 'line':
			if(toggleValue=='line1')
				$('#page').css('line-height','1.1em');
			else if(toggleValue=='line2')
				$('#page').css('line-height','1.2em');
			else if(toggleValue=='line3')
				$('#page').css('line-height','1.3em');
			else if(toggleValue=='line4')
				$('#page').css('line-height','1.4em');
			else if(toggleValue=='line5')
				$('#page').css('line-height','1.5em');
			else if(toggleValue=='line6')
				$('#page').css('line-height','1.6em');
			break;
		case 'column':
			if(toggleValue=='column1')
				$('.table tbody tr td:nth-child(1)').toggleClass('text-center');
			else if(toggleValue=='column2')
				$('.table tbody tr td:nth-child(2)').toggleClass('text-center');
			else if(toggleValue=='column3')
				$('.table tbody tr td:nth-child(3)').toggleClass('text-center');
			else if(toggleValue=='column4')
				$('.table tbody tr td:nth-child(4)').toggleClass('text-center');
			break;

		case 'font':
			if(toggleValue=='fontVerdanaSans')
				$('#page').removeClass('droid').removeClass('roboto').removeClass('verdana-serif').addClass('verdana-sans');
			else if(toggleValue=='fontVerdanaSerif')
				$('#page').removeClass('verdana-sans').removeClass('droid').removeClass('roboto').addClass('verdana-serif');
			else if(toggleValue=='fontRoboto')
				$('#page').removeClass('verdana-serif').removeClass('verdana-sans').removeClass('droid').addClass('roboto');
			else if(toggleValue=='fontDroid')
				$('#page').removeClass('roboto').removeClass('verdana-serif').removeClass('verdana-sans').addClass('droid');
			break;
		case 'case':
			if(toggleValue=='caseNormal')
				$('.section-title').removeClass('uppercase');
			else
				$('.section-title').addClass('uppercase');
			break;
		case 'title':
			if(toggleValue=='titleRuled')
			{
				$('.section-title').removeClass('shaded');
				$('.section-title').addClass('ruled');
			}
			else
			{
				$('.section-title').removeClass('ruled');
				$('.section-title').addClass('shaded');
			}
			break;
		case 'rule':
			if(toggleValue=='ruleAbove')
			{
				$('.section-title').removeClass('rule-below');
				$('.section-title').addClass('rule-above');
			}
			else
			{
				$('.section-title').removeClass('rule-above');
				$('.section-title').addClass('rule-below');
			}
			break;

		case 'image':
			if(toggleValue=='imageShow')
			{
				$('#image_box').show();
				$('#info').css('margin-left','0px');
			}
			else
			{
				$('#image_box').hide();
				$('#info').css('margin-left','20px');
			}
			break;
		case 'roll':
			if(toggleValue=='rollShow')
			{
				$('#contentRoll').show();
				$('#info').css('margin-top','0px');
			}
			else
			{
				$('#contentRoll').hide();
				$('#info').css('margin-top','10px');
			}
			break;
		case 'course':
			if(toggleValue=='course1')
			{
				$('#contentBranch').hide();
				$('#contentCourse').text('B.Tech - '+$('#contentBranch').text());
			}
			else
			{
				$('#contentBranch').show();
				$('#contentCourse').text('B.Tech undergraduate');
			}
			break;
		case 'table':
			if(toggleValue=='tableShow')
			{
				$('#educationTable').removeClass('borderless');
				$('#educationTable').addClass('customBordered');
			}
			else
			{
				$('#educationTable').removeClass('customBordered');
				$('#educationTable').addClass('borderless');
			}
			break;
		case 'edyear':
			if(toggleValue=='edyearFirst')
			{
				$("#educationTable tr").each(function () {
					$(this).find("td").eq(0).before($(this).find("td").eq(3));
				});
				var temp = document.getElementById('column4').className;
				document.getElementById('column4').className = document.getElementById('column3').className;
				document.getElementById('column3').className = document.getElementById('column2').className;
				document.getElementById('column2').className = document.getElementById('column1').className;
				document.getElementById('column1').className = temp;
			}
			else
			{
				$("#educationTable tr").each(function () {
					$(this).find("td").eq(3).after($(this).find("td").eq(0));
				});
				var temp = document.getElementById('column1').className;
				document.getElementById('column1').className = document.getElementById('column2').className;
				document.getElementById('column2').className = document.getElementById('column3').className;
				document.getElementById('column3').className = document.getElementById('column4').className;
				document.getElementById('column4').className = temp;
			}
			break;
		case 'experience':
			if(toggleValue=='experience1')
			{
				$("#sectionExperience .title , #sectionExperience .time").css('display','inline-block');
				$("#sectionExperience .time").addClass('right').removeClass('tab');
				$("#sectionExperience .link").show();
			}
			else
			{
				$("#sectionExperience .title , #sectionExperience .time").css('display','block');
				$("#sectionExperience .time").removeClass('right').addClass('tab');
				$("#sectionExperience .link").hide();
			}
			break;
		case 'projects':
			if(toggleValue=='projects1')
			{
				$("#sectionProjects .title , #sectionProjects .time").css('display','inline-block');
				$("#sectionProjects .time").addClass('right').removeClass('tab');
				$("#sectionProjects .mentor , #sectionProjects .link").show();
			}
			else
			{
				$("#sectionProjects .title , #sectionProjects .time").css('display','block');
				$("#sectionProjects .time").removeClass('right').addClass('tab');
				$("#sectionProjects .mentor , #sectionProjects .link").hide();
			}
			break;
	}
}

function getSelectionContainerElement()
{
	var range, sel, container;
	if (document.selection && document.selection.createRange)
	{
		range = document.selection.createRange();
		return range.parentElement();
	}
	else if (window.getSelection)
	{
		sel = window.getSelection();
		if (sel.getRangeAt)
		{
			if (sel.rangeCount > 0)
				range = sel.getRangeAt(0);
		}
		else
		{
			// Old WebKit selection object has no getRangeAt, so
			// create a range from other selection properties
			range = document.createRange();
			range.setStart(sel.anchorNode, sel.anchorOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);
			// Handle the case when the selection was selected backwards (from the end to the start in the document)
			if (range.collapsed !== sel.isCollapsed)
			{
				range.setStart(sel.focusNode, sel.focusOffset);
				range.setEnd(sel.anchorNode, sel.anchorOffset);
			}
		}
		if (range)
		{
			container = range.commonAncestorContainer;
			// Check if the container is a text node and return its parent if so
			return container.nodeType === 3 ? container.parentNode : container;
		}
	}
}

function insertAfter(referenceNode,newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Section toggle handling
$(document).ready(function() {
    // Initialize section visibility based on checkboxes
    $('input[name="sectionToggle"]').each(function() {
        const sectionId = $(this).val();
        const isChecked = $(this).prop('checked');
        $(`#${sectionId}`).toggle(isChecked);
    });

    // Handle section toggle changes
    $('input[name="sectionToggle"]').on('change', function() {
        const sectionId = $(this).val();
        const isChecked = $(this).prop('checked');
        
        // Toggle section visibility with animation
        $(`#${sectionId}`).slideToggle(300, function() {
            // After animation, ensure proper visibility
            $(this).css('display', isChecked ? 'block' : 'none');
        });
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
            $(`#${sectionId}`).toggle(isVisible);
        });
    };
});