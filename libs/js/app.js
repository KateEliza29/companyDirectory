// Structure
//1- DOM EVENTS
    //1.1- Side menu
    //1.2- Icons
    //1.3- Filter menu
    //1.4- Modals
//2- RESPONSIVITY FUNCTIONS
//3- FILTER MENU
// SORT MENU
// SEARCH FUNCTION
//4- PHP CALLS TO DATABASE
//5- MODAL FUNCTIONS
//6- CARD FUNCTIONS


//GLOBAL VARIABLES
let departmentFilterCriteria = [];
let locationFilterCriteria = [];
let departmentList = ["None", "Accounting", "Business Development", "Engineering", "Human Resources", "Legal", "Marketing", "Product Management", "Research and Development", "Sales", "Services", "Support", "Training"];
let allResults;
let currentSelection;
let filterSearchResults = [];
let currentStaffId;
let isEdit;
let isCards = true;
let isAZ = true;

let firstName;
let lastName;
let jobTitle;
let email;
let department;
let staffLocation;

//1- DOM EVENTS
$('document').ready(function(){
    displayIcons();
    getAllDetails();
});

    //1.1- Side menu
    $('#menu').click(function() {
        $('#sideMenu').toggle();
    });

    $('#close').click(function() {
        $('#sideMenu').toggle();
    });

    $('#reset').click(function() {
        currentSelection = allResults;
        if (isCards) {
            createCards(currentSelection); //checked
        }
        else {
            createList(currentSelection); //checked
        }
        departmentFilterCriteria = [];
        locationFilterCriteria = [];
        let cells = $('#menuInner td');
        for (let i=0; i<cells.length; i++) {
            if ($(cells[i]).html() == '<i class="far fa-check-circle"></i>') {
                $(cells[i]).html("");
            }
        }
    });

    //1.2 Top Menu
    $('#gridView').click(function() {
        isCards = true;
        $('#sortMenu div').show();
        createCards(currentResults); //checked
    });

    $('#listView').click(function() {
        isCards = false;
        $('#sortMenu div').hide();
        createList(currentResults); //checked
    });


//2- RESPONSIVITY FUNCTIONS
$(window).resize(function() {
    displayIcons();
}); 

function displayIcons() {
    if (window.innerWidth >= 1180) {
        $('#menu').css("visibility", "hidden");
        $('#sideMenu').show();
    }
    else {
        $('#menu').css("visibility", "visible");
        $('#sideMenu').hide();
    }
}


//3- FILTER MENU
$('td').click(function(e) {
    //Add ticks
    addRemoveTicks(e);
    //Add criteria to location or department filter array.
    let filterKeyword = $(e.target).hasClass('departments') ? "department" : "location";
    filterSearchResults = [];
    addToFilterArray(e.target, filterKeyword);
    //Filter current selection based on which selections have been made. 
    filter();

});

function addRemoveTicks(e) {
    if ($(e.target).hasClass('filter')) {
        if ($(e.target).next().html() == '') {
            $(e.target).next().html('<i class="far fa-check-circle"></i>'); 
        }
        else {
            $(e.target).next().html('');
        }
    }
}

//THIS CAN BE REFACTORED
function addToFilterArray(target, keyword) {
    if (keyword == 'department') {
        //Remove the filter term if it already exists in the array. 
        if (departmentFilterCriteria.includes($(target).text())) {
            let index = departmentFilterCriteria.indexOf($(target).text());
            departmentFilterCriteria.splice(index, 1);
        }
        //If the filter term does not already exist in the array, add it.
        else {
            departmentFilterCriteria.push($(target).text());
        }
    }
    else {
        //Remove the filter term if it already exists in the array. 
        if (locationFilterCriteria.includes($(target).text())) {
            let index = locationFilterCriteria.indexOf($(target).text());
            locationFilterCriteria.splice(index, 1);
        }
        //If the filter term does not already exist in the array, add it.
        else {
            locationFilterCriteria.push($(target).text());
        }
    }
}

function filter() {
    console.log(departmentFilterCriteria);
    console.log(locationFilterCriteria);
    console.log(currentSelection);
    if (departmentFilterCriteria.length>0 && locationFilterCriteria.length>0) {
        filterSearchResults = currentSelection.filter(staff => departmentFilterCriteria.includes(staff.department) && locationFilterCriteria.includes(staff.location)); 
    }
    else if (departmentFilterCriteria.length>0 && locationFilterCriteria.length==0) {
        filterSearchResults = currentSelection.filter(staff => departmentFilterCriteria.includes(staff.department)); 
    }
    else if (departmentFilterCriteria.length==0 && locationFilterCriteria.length>0) {
        filterSearchResults = currentSelection.filter(staff => locationFilterCriteria.includes(staff.location)); 
    }
    console.log(filterSearchResults);
    if (filterSearchResults.length == 0 && departmentFilterCriteria.length > 0 || locationFilterCriteria.length > 0) {
        console.log("first option");
        displayResults(filterSearchResults);
    }
    else if (filterSearchResults.length == 0 && departmentFilterCriteria.length == 0 && locationFilterCriteria.length == 0) {
        console.log("second option");
        displayResults(currentSelection);
        departmentFilterCriteria = [];
        locationFilterCriteria = [];
    }
    else {
        console.log("last option");
        displayResults(filterSearchResults);
    }

}

//3- SORT MENU 
$(document).on('click', '.sort', function(e){
    let criteria = $(e.target).text() == "Name" ? "lname" : $(e.target).text() == "Location" ? "location" : "department";
    sortBy(criteria);
});

function sortBy(criteria) {
    if (isAZ) {
        currentResults.sort((a, b) => (a[criteria] > b[criteria]) ? 1 : -1);
        isAZ = false;
        if (isCards) {
            createCards(currentResults); //Checked
        }
        else {
            createList(currentResults); //Checked
        }
    }
    else {
        currentResults.sort((a, b) => (b[criteria] > a[criteria]) ? 1 : -1);
        isAZ = true;
        if (isCards) {
            createCards(currentResults); //checked
        }
        else {
            createList(currentResults); //checked
        }

    }

}

//SEARCH FUNCTION
// COME BACK TO THIS ONE. SEARCH RESULTS NEED TO BE STORED GLOBALLY SO THAT THEY CAN BE USED TO REFRESH WHEN NEW/EDIT/DELETE IS PERFORMED.
$('#searchType').keyup(function(e) {
    let searchType = $('#searchSelect').val() == "firstNameSearch" ? "p.firstName" : $('#searchSelect').val() == "lastNameSearch" ? "p.lastName" : "p.jobTitle";
    let searchTerm = ($('#searchType').val());
    searchDatabase(searchTerm, searchType);
});

function searchDatabase(searchTerm, searchType) {
    $.ajax({
        url: "libs/php/search.php",
        type: 'GET',
        dataType: 'json', 
        data: {
            searchTerm: searchTerm,
            searchType: searchType
        },
        success: function(result) {
            filterSearchResults = result.data;
            if (isCards) {
                createCards(filterSearchResults);
            }
            else {
                createList(filterSearchResults);
            } 
        },
    });
}

//5- MODAL FUNCTIONS
    //Edit and New Buttons
    $(document).on('click', '.edit', function(e){
        isEdit = true;
        currentStaffId = $(e.target).parent().parent().attr('id');
        fillDetailsEditModal();
        $('#addUpdateLabel').html("<i class='fas fa-pen m-2'></i> Edit Staff Member");
        $('#addUpdateConfirm').html("<i class='fas fa-save m-1'> Update");
    });


    $('#new').click(function() {
        isEdit = false;
        $('#addUpdateLabel').html("<i class='fas fa-user-plus m-2'></i> Add New Staff Member");
        $('#addUpdateConfirm').html("<i class='fas fa-user-plus m-2'></i> Add");
        let fields = [$('#firstName'), $('#lastName'), $('#email'), $('#jobTitle')];
        for (let i=0; i<fields.length; i++) {
            fields[i].val("");
        }
        $('#location').val("chooseLocation");
        $('#department').val("chooseDepartment");
    });

    $('#addUpdateConfirm').click(function() {
        firstName = $('#firstName').val();
        lastName = $('#lastName').val();
        jobTitle = $('#jobTitle').val();
        email = $('#email').val();
        department = departmentList.indexOf($('#department').val()); 
        // Format text. 
        //Check text. 
        if (isEdit) {
            editStaffMember(firstName, lastName, jobTitle, email, department, currentStaffId);
            //Refresh with new current selection
        } 
        else {
            addNewStaffMember(firstName, lastName, jobTitle, email, department);
            //Refresh with new current selection
            refreshCurrentSelection();
        }

    });

    //Delete buttons
    $(document).on('click', '.delete', function(e){
        currentStaffId = $(e.target).parent().parent().attr('id');
        $('#deleteFName').text($(`#fname${currentStaffId}`).text());
        $('#deleteLName').text($(`#lname${currentStaffId}`).text());
    });

    $('#delete').click(function() {
        deleteStaffMember(currentStaffId);
    });

    //Modal contents
    function fillDetailsEditModal() {
        firstName = $(`#fname${currentStaffId}`).text(); 
        lastName = $(`#lname${currentStaffId}`).text(); 
        department = $(`#department${currentStaffId}`).text(); 
        staffLocation = $(`#location${currentStaffId}`).text(); 
        jobTitle = $(`#jobTitle${currentStaffId}`).text(); 
        let emailpre = $(`#emailIcon${currentStaffId}`).attr('href'); 
        email = emailpre.slice(7);
        console.log(firstName, lastName, department, staffLocation, jobTitle);
        $('#firstName').val(firstName);
        $('#lastName').val(lastName);
        $('#location').val(staffLocation);
        $('#department').val(department);
        $('#jobTitle').val(jobTitle);
        $('#email').val(email);
    }


//Data Display
function createCards(resultArray) {
    $('#listSection').css({
        height: 0,
        width: 0
    });
    $('#cardSection').css({
        height: '70vh',
        width: '100%'
    });
    $('#cardSection').html("");
    let num2 = 0;
    for (let i=0; i<resultArray.length; i++) {
        currentStaffId = resultArray[i].id;
        firstName = resultArray[i].firstName;
        lastName = resultArray[i].lastName;
        department = resultArray[i].department; 
        staffLocation = resultArray[i].location;
        jobTitle = resultArray[i].jobTitle;
        email = resultArray[i].email;
        $("#cardSection").append(`<section class="staffMember rounded bg-light m-2" id="${currentStaffId}">
            <h2 class="text-center mt-2"><span id="fname${currentStaffId}"> ${firstName}</span><span id="lname${currentStaffId}"> ${lastName} </span></h2>
            <div class="d-flex flex-row m-2 text-center justify-content-center align-items-center">
                <img class="m-2 rounded" src="https://i.pravatar.cc/100?img=${num2}">
                <div class="m-2 cardText">
                    <h3 id="department${currentStaffId}">${department}</h3>
                    <p id="location${currentStaffId}">${staffLocation}</p>
                    <p id="jobTitle${currentStaffId}">${jobTitle}</p>
                    <i class="fab fa-skype m-2" id="skype"></i>
                    <a id="emailIcon${currentStaffId}" href="mailto:${email}"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
            <p class="text-center" id="email${currentStaffId}">${email}</p>
            <div class="d-flex flex-row justify-content-center m-2">
                <button class="m-2 p-1 btn btn-outline-dark edit" data-bs-toggle="modal" data-bs-target="#addUpdateModal"><i class="fas fa-pen"></i> Edit</button>
                <button class="m-2 p-1 btn btn-outline-danger delete" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        </section>`);
        if (num2 >= 70) {
            num2 = 0;
        }   
        num2++;
    }
    $('#resultNum').text(resultArray.length);
    currentResults = resultArray;
}

function createList(resultArray) {
    $('#cardSection').css({
        height: 0,
        width: 0
    });
    $('#listSection').css({
        display: 'block',
        height: '70vh',
        width: '100%'
    });
    $('#listDisplay tbody').html("");
    $('#cardSection').html("");
    let num2 = 0;
    for (let i=0; i<resultArray.length; i++) {
        currentStaffId = resultArray[i].id;
        firstName = resultArray[i].firstName;
        lastName = resultArray[i].lastName;
        department = resultArray[i].department; 
        staffLocation = resultArray[i].location;
        jobTitle = resultArray[i].jobTitle;
        email = resultArray[i].email;
        $('#listDisplay').append(`<tr id="${currentStaffId}">
            <td><span class="p-0" id="fname${currentStaffId}">${firstName}</span><span class="p-0" id="lname${currentStaffId}"> ${lastName}</span></td>
            <td><a id="emailIcon${currentStaffId}" href="mailto:${email}"><i class="fas fa-envelope"></i></a></td>
            <td><p id="jobTitle${currentStaffId}">${jobTitle}</p></td>
            <td><p id="location${currentStaffId}">${department}</p></td>
            <td id="department${currentStaffId}">${staffLocation}</td>
            <td><i data-bs-toggle="modal" data-bs-target="#addUpdateModal" class="fas fa-pen edit"></i> <i data-bs-toggle="modal" data-bs-target="#deleteModal" class="fas fa-trash-alt delete"></i></td>
        </tr>`);

        if (num2 >= 70) {
            num2 = 0;
        }
        num2++;
    }
    $('#resultNum').text(resultArray.length);
    currentResults = resultArray;
}

//GENERAL FUNCTIONALITY
function refreshCurrentSelection() {
    console.log("running refresh");
    //Get new results. 
    allResults = getAllDetails();
    //Run the result through the filter system. 
    filter();
    //Save this new array as the currentSelection. 

    //Create new cards. 
    //displayResults(currentSelection)
}

function displayResults(results) {
    if (isCards) {
        //$('#cardSection').show();
        //$('#listSection').hide();
        createCards(results);
    }
    else {
        //$('#cardSection').css({
          //  height: 0,
            //width: 0
        //});
        $('#listSection').show();
        createList(results);
    } 
}

//PHP CALLS TO DATABASE
    //Create
    function addNewStaffMember(fname, lname, job, email, department) {
        $.ajax({
            url: "libs/php/addNewStaffMember.php",
            type: 'POST',
            dataType: 'json',
            data: {
                firstName: fname, 
                lastName: lname,
                jobTitle: job,
                email: email,
                department: department
            },
            success: function(result) {
            if (result.status.code == 200) {
                console.log(result);
                $("#addUpdateBody").append(`<div class="alert alert-success" role="alert">
                    ${fname} ${lname}, ${job} has been added to the database!
                </div>`);
                currentStaffId = result.data.id;
                setTimeout(function() { 
                    $('#addUpdateModal').modal('hide');
                }, 1500);

            }
            else if (result.status.code == 400 || result.status.code == 300) {
                $("#addUpdateBody").append(`<div class="alert alert-danger" role="alert">
                    ${fname} ${lname}, ${job} could not be added to the database. Please try again later.
                </div>`);
            }
            else if (result.status.code == 202) {
                $("#addUpdateBody").append(`<div class="alert alert-warning" role="alert">
                    ${fname} ${lname}, ${job} already exists.
                </div>`);
            }
            },
        });
    }

    //Read 
    function getAllDetails() {
        $.ajax({
            url: "libs/php/getAll.php",
            type: 'GET',
            dataType: 'json',
            success: function(result) {
            console.log(result);
                allResults = result.data;
                currentSelection = result.data;
                displayResults(currentSelection);
            },
        });
    }

    //Update
    function editStaffMember(fname, lname, job, email, department, id) {
        $.ajax({
            url: "libs/php/updateStaffMember.php",
            type: 'POST',
            dataType: 'json',
            data: {
                firstName: fname, 
                lastName: lname,
                jobTitle: job,
                email: email,
                department: department,
                id: id
            },
            success: function(result) {
                if (result.status.code == 200) {
                    $("#addUpdateBody").append(`<div class="alert alert-success" id="confirmation" role="alert">
                        ${fname} ${lname}, ${job} has been updated!
                    </div>`);
                    setTimeout(function() { 
                        $('#addUpdateModal').modal('hide');
                        $('#confirmation').fadeOut('fast');
                    }, 1500);

                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#addUpdateBody").append(`<div class="alert alert-danger" role="alert">
                        ${fname} ${lname}, ${job} could not be added to the database. Please try again later.
                    </div>`);
                }
                else if (result.status.code == 202) {
                    $("#addUpdateBody").append(`<div class="alert alert-warning" role="alert">
                        ${fname} ${lname}, ${job} already exists.
                    </div>`);
                }
            },
        });
    }

    //Delete
    function deleteStaffMember(id) {
        $.ajax({
            url: "libs/php/deleteStaffMember.php",
            type: 'POST',
            dataType: 'json',
            data: {
                id: id 
            },
            success: function(result) {
                if (result.status.code == 200) {
                    $("#deleteModalBody").append(`<div class="alert alert-success" role="alert">
                        Staff member has been deleted.
                    </div>`);
                    setTimeout(function() { 
                        $('#deleteModal').modal('hide');
                    }, 1500);

                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#deleteModal").append(`<div class="alert alert-danger" role="alert">
                        Staff member could not be deleted. Please try again later.
                    </div>`);
                }
            }
        });
    }