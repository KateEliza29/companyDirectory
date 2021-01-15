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
let departmentList = {};
let locationList = {};
let departmentToLocation = {};
let allResults;
let currentSelection;
let filterSearchResults = [];
let currentStaffId;
let isEdit;
let isCards = true;
let isAZ = true;
let isFiltered = false;

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
    fillLocationDepartments([$('#departmentToChange'), $('#departmentToDelete'), $('#addUpdateDepartment')], 'departments');
    fillLocationDepartments([$('#addUpdateLocation'), $('#locationToDelete'), $('#addNewDepartmentLocation')], 'locations');
});

//Preloader
$(window).on('load', function () {    
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    }});

    //1.1- Side menu
    $('#menu').click(function() {
        $('#sideMenu').toggle();
    });

    $('#close').click(function() {
        $('#sideMenu').toggle();
    });

    $('#reset').click(function() {
        currentSelection = allResults;
        isFiltered = false;
        if (isCards) {
            createCards(currentSelection);
        }
        else {
            createList(currentSelection);
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
        createCards(currentResults);
    });

    $('#listView').click(function() {
        isCards = false;
        $('#sortMenu div').hide();
        createList(currentResults);
    });


//2- RESPONSIVITY FUNCTIONS
$(window).resize(function() {
    displayIcons();
    reduceList();
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

function reduceList() {
    if (window.innerWidth <= 750) {
        $('#listDisplay td:nth-child(2),th:nth-child(2)').hide();
        $('#listDisplay td:nth-child(6),th:nth-child(6)').hide();
    }
    else {
        $('#listDisplay td:nth-child(2),th:nth-child(2)').show();
        $('#listDisplay td:nth-child(6),th:nth-child(6)').show();
    }
}

//3- FILTER MENU
$('.tableBody').on('click', 'td', function(e) {
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
    if (departmentFilterCriteria.length>0 && locationFilterCriteria.length>0) {
        filterSearchResults = currentSelection.filter(staff => departmentFilterCriteria.includes(staff.department) && locationFilterCriteria.includes(staff.location)); 
    }
    else if (departmentFilterCriteria.length>0 && locationFilterCriteria.length==0) {
        filterSearchResults = currentSelection.filter(staff => departmentFilterCriteria.includes(staff.department)); 
    }
    else if (departmentFilterCriteria.length==0 && locationFilterCriteria.length>0) {
        filterSearchResults = currentSelection.filter(staff => locationFilterCriteria.includes(staff.location)); 
    }
    if (filterSearchResults.length == 0 && departmentFilterCriteria.length > 0 || locationFilterCriteria.length > 0) {
        displayResults(filterSearchResults);
        isFiltered = true;
    }
    else if (filterSearchResults.length == 0 && departmentFilterCriteria.length == 0 && locationFilterCriteria.length == 0) {
        displayResults(currentSelection);
        departmentFilterCriteria = [];
        locationFilterCriteria = [];
        isFiltered = false;
    }
    else {
        displayResults(filterSearchResults);
        isFiltered = true;
    }

}

//3- SORT MENU 
$(document).on('click', '.sort', function(e){
    console.log("sort fired");
    console.log(e);
    let criteria = $(e.target).text() == "Name" ? "lname" : $(e.target).text() == "Location" ? "location" : "department";
    sortBy(criteria);
});


function sortBy(criteria) {
    if (isFiltered) {
        if (isAZ) {
            filterSearchResults.sort((a, b) => (a[criteria] > b[criteria]) ? 1 : -1);
            isAZ = false;
            displayResults(filterSearchResults);
        }
        else {
            filterSearchResults.sort((a, b) => (b[criteria] > a[criteria]) ? 1 : -1);
            isAZ = true;
            displayResults(filterSearchResults);
        }
    }
    else {
        if (isAZ) {
            currentSelection.sort((a, b) => (a[criteria] > b[criteria]) ? 1 : -1);
            isAZ = false;
            displayResults(currentSelection);
        }
        else {
            currentSelection.sort((a, b) => (b[criteria] > a[criteria]) ? 1 : -1);
            isAZ = true;
            displayResults(currentSelection);
        }
    }
}

//SEARCH FUNCTION
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
    //AddUpdate Modal
    $(document).on('click', '.edit', function(e){
        isEdit = true;
        currentStaffId = isCards ? $(e.target).parent().parent().attr('id') : $(e.target).parent().parent().parent().attr('id')
        fillDetailsEditModal();
        $('#addUpdateLabel').html("<i class='fas fa-pen m-2'></i> Edit Staff Member");
        $('#addUpdateConfirm').html("<i class='fas fa-save m-1'> Update");
    });


    $('#new').click(function() {
        isEdit = false;
        $('#addUpdateLabel').html("<i class='fas fa-user-plus m-2'></i> Add New Staff Member");
        $('#addUpdateConfirm').html("<i class='fas fa-user-plus m-2'></i> Add");
        let fields = [$('#firstName'), $('#lastName'), $('#email'), $('#jobTitle'), $('#location'), $('#addUpdateDepartment')];
        for (let i=0; i<fields.length; i++) {
            fields[i].val("");
        }
    });

    $("#addUpdateConfirm").click(function(e) {
        firstName = $('#firstName').val().trim();
        lastName = $('#lastName').val().trim();
        jobTitle = $('#jobTitle').val().trim();
        email = $('#email').val().trim(); 
        department = departmentList[$('#addUpdateDepartment').val()]; //ISSUEE HERE
        if (firstName && lastName && jobTitle && email && department) {
            if (isEdit) {
                editStaffMember(firstName, lastName, jobTitle, email, department, currentStaffId);
                //Refresh with new current selection
            }
            else {
                addNewStaffMember(firstName, lastName, jobTitle, email, department);
                //Refresh with new current selection
            }
        }
        e.preventDefault();
    });

    function fillDetailsEditModal() {
        firstName = $(`#fname${currentStaffId}`).text(); 
        lastName = $(`#lname${currentStaffId}`).text(); 
        department = $(`#department${currentStaffId}`).text(); 
        staffLocation = $(`#location${currentStaffId}`).text();
        jobTitle = $(`#jobTitle${currentStaffId}`).text(); 
        let emailpre = $(`#emailIcon${currentStaffId}`).attr('href'); 
        email = emailpre.slice(7);
        $('#firstName').val(firstName);
        $('#lastName').val(lastName);
        $('#addUpdateDepartment').val(department);
        $('#addUpdateLocation').val(staffLocation);
        $('#jobTitle').val(jobTitle);
        $('#email').val(email);
    }

    //Change location on selection of department
    $('#addUpdateDepartment').change(function() {
        department = $('#addUpdateDepartment').val();
        let locationId = departmentToLocation[department];
        changeLocationOnDepartmentChange(locationId);
    });

    //Delete Modal
    $(document).on('click', '.delete', function(e){
        currentStaffId = $(e.target).parent().parent().attr('id');
        $('#deleteFName').text($(`#fname${currentStaffId}`).text());
        $('#deleteLName').text($(`#lname${currentStaffId}`).text());
    });

    $('#deletePersonBtn').click(function(e) {
        deleteLocationDepartmentStaff(e, currentStaffId);
    });

    //Settings Modal
    $('#addDepartment').click(function(e) {
        department = $('#newDepartment').val();
        staffLocation = $('#addNewDepartmentLocation').val();
        let locationId = locationList[$('#addNewDepartmentLocation').val()];
        addNewDepartment(department, locationId);
        e.preventDefault();
    });

    $('#addLocation').click(function(e) {
        staffLocation = $('#newLocation').val();
        addNewLocation(staffLocation);
        e.preventDefault();
    });

    $('#deleteDepartmentBtn').click(function(e) {
        let departmentId = departmentList[$('#departmentToDelete').val()]; 
        deleteLocationDepartmentStaff(e, departmentId);
        e.preventDefault();
    });

    $('#deleteLocationBtn').click(function(e) {
        let locationId = locationList[$('#locationToDelete').val()]; 
        deleteLocationDepartmentStaff(e, locationId);
        alert("You want to delete " + locationId);
        e.preventDefault();
    })



    /*Card Pop Up
    $(document).on('click', '.staffRow', function(e){
        currentStaffId = $(e.target).attr('id').slice(-2);
        console.log(currentStaffId);
        $('#cardModal').modal('show');
    });*/


//Data Display
function createCards(resultArray) {
    $('#listSection').css({
        height: 0,
        width: 0,
        display: 'none'
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
        $("#cardSection").append(`<section class="staffMember rounded bg-light m-2 d-flex flex-column justify-content-center" id="${currentStaffId}">
            <h2 class="text-center mt-2"><span id="fname${currentStaffId}"> ${firstName}</span><span id="lname${currentStaffId}"> ${lastName} </span></h2>
            <div class="d-flex flex-row m-1 text-center justify-content-center align-items-center">
                <img class="m-2 rounded" src="https://i.pravatar.cc/100?img=${num2}">
                <div class="m-2 cardText">
                    <h3 id="department${currentStaffId}">${department}</h3>
                    <p id="location${currentStaffId}">${staffLocation}</p>
                    <p id="jobTitle${currentStaffId}">${jobTitle}</p>
                    <a id="skypeIcon${currentStaffId}" href="tel:000000000"><i class="fab fa-skype m-2" id="skype"></i></a>
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
        width: 0,
        display: 'none'        
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
        $('#listDisplay').append(`<tr id="${currentStaffId}" class="staffRow">
            <td class="text-center"><span class="p-0" id="fname${currentStaffId}">${firstName}</span><span class="p-0" id="lname${currentStaffId}"> ${lastName}</span></td>
            <td class="text-center"><a id="emailIcon${currentStaffId}" href="mailto:${email}"><i class="fas fa-envelope"></i></a></td>
            <td class="text-center"><p id="jobTitle${currentStaffId}">${jobTitle}</p></td>
            <td class="text-center"><p id="department${currentStaffId}">${department}</p></td>
            <td class="text-center"><p id="location${currentStaffId}">${staffLocation}</p></td>
            <td class="text-center"><a href="#" data-bs-toggle="modal" data-bs-target="#addUpdateModal"><i class="fas fa-pen edit"></i></a> <a href="#" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash-alt delete"></i></a></td>
        </tr>`);

        if (num2 >= 70) {
            num2 = 0;
        }
        num2++;
    }
    $('#resultNum').text(resultArray.length);
    currentResults = resultArray;
    reduceList();
}

//GENERAL FUNCTIONALITY
function refreshCurrentSelection() {
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
        createCards(results);
    }
    else {
        createList(results);
    } 
}

function modalTimeout(modal) {
    setTimeout(function() { 
        modal.modal('hide');
        $('#alert').fadeOut('fast');
    }, 2500);
}

function alertTimeout() {
    setTimeout(function() { 
        $('#alert').fadeOut('fast');
    }, 2500);
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
                console.log(result);
                if (result.status.code == 200) {
                    $("#addUpdateBody").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${fname} ${lname}, ${job} has been added to the database!
                    </div>`);
                    currentStaffId = result.data.id;
                    modalTimeout($("#addUpdateModal"));

                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#addUpdateBody").append(`<div class="alert alert-danger" id="alert" role="alert">
                        ${fname} ${lname}, ${job} could not be added to the database. Please try again later.
                    </div>`);
                    alertTimeout($("#addUpdateModal"));
                }
                else if (result.status.code == 202) {
                    $("#addUpdateBody").append(`<div class="alert alert-warning" id="alert" role="alert">
                        ${fname} ${lname} already exists.
                    </div>`);
                    alertTimeout($("#addUpdateModal"));
                }
            },
        });
    }

    function addNewDepartment(name, locationid) {
        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
                name: name, 
                locationID: locationid,
            },
            success: function(result) {
                console.log(result);
                if (result.status.code == 200) {
                    $("#addNewDepartment").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${department} in ${staffLocation} has been added to the database!
                    </div>`);
                    modalTimeout($("#settingsModal"));
                    setTimeout(function() { 
                        location.reload();
                    }, 2000);

                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#addNewDepartment").append(`<div class="alert alert-danger" id="alert" role="alert">
                        ${department} in ${staffLocation} could not be added to the database. Please try again later.
                    </div>`);
                    alertTimeout();
                }
            },
        });
    }

    //COMBINE THIS WITH ADD NEW DEPARTMENT?
    function addNewLocation(name) {
        $.ajax({
            url: "libs/php/insertLocation.php",
            type: 'POST',
            dataType: 'json',
            data: {
                name: name, 
            },
            success: function(result) {
                console.log(result);
                if (result.status.code == 200) {
                    $("#addNewLocation").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${staffLocation} has been added to the database!
                    </div>`);
                    modalTimeout($("#settingsModal"));
                    setTimeout(function() { 
                        location.reload();
                    }, 2000);

                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#addNewDepartment").append(`<div class="alert alert-danger" id="alert" role="alert">
                        ${staffLocation} could not be added to the database. Please try again later.
                    </div>`);
                    alertTimeout();
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

    function fillLocationDepartments(selectIds, keyword) {
        let url = keyword == 'departments' ? "libs/php/getAllDepartments.php" : "libs/php/getAllLocations.php";
        let tableId = keyword == 'departments' ? '#departmentTableBody' : '#locationTableBody';
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function(result) {
                console.log(result);
                for (let i=0; i<selectIds.length; i++) {
                    $.each(result.data, function(index) {
                        $(selectIds[i]).append($("<option>", {
                            value: result.data[index].name,
                            text: result.data[index].name
                        })); 
                    });
                }
                $.each(result.data, function(index) {
                    $(tableId).append(`<tr><td class='filter text-nowrap ${keyword}'>${result.data[index].name}</td><td class='text-end right'></td></tr>`);
                    if (keyword == 'departments') {
                        departmentList [result.data[index].name] = result.data[index].id;
                        departmentToLocation[result.data[index].name] = result.data[index].locationID;
                    }
                    if (keyword == 'locations') {
                        //create object of location and ids.
                        locationList [result.data[index].name] = result.data[index].id;
                    }
                }); 
            }
        });
    }

    function changeLocationOnDepartmentChange(id) {
        department = $(`#addUpdateDepartment`).val();
        $.ajax({
            url: "libs/php/getLocationByID.php",
            type: 'GET',
            dataType: 'json',
            data: {
                id: id
            },
            success: function(result) {
                console.log(result);
                $('#addUpdateLocation').val(result.data[0].name);
            }
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
                console.log(result);
                if (result.status.code == 200) {
                    $("#addUpdateBody").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${fname} ${lname}, ${job} has been updated!
                    </div>`);
                    modalTimeout($("#addUpdateModal"));
                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#addUpdateBody").append(`<div class="alert alert-danger" id="alert" role="alert">
                        ${fname} ${lname}, ${job} could not be added to the database. Please try again later.
                    </div>`);
                    alertTimeout();
                }
            },
        });
    }

    //Delete
    function deleteLocationDepartmentStaff(e, id) {
        let keyword;
        let url;
        let modal;
        let needRefresh;
        if ($(e.target).attr('id') == 'deleteDepartmentBtn') {
            keyword = 'department';
            url = 'libs/php/deleteDepartmentByID.php';
            modal = $('#deleteDepartment');
            needRefresh = true;
        }
        else if ($(e.target).attr('id') == 'deleteLocationBtn') {
            keyword = 'location';
            url = 'libs/php/deleteLocationByID.php';
            modal = $('#deleteLocation');
            needRefresh = true;
        }
        else if ($(e.target).attr('id') == 'deletePersonBtn') {
            keyword = 'person';
            url = 'libs/php/deleteStaffMember.php';
            modal = $('#deleteModalBody');
            needRefresh = false;
        }
        console.log(keyword, url, modal);
       $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
                id: id 
            },
            success: function(result) {
                console.log(result);
                if (result.status.code == 200) {
                    modal.append(`<div class="alert alert-success" id="alert" role="alert">
                        This ${keyword} has been deleted.
                    </div>`);
                    alertTimeout();
                    modalTimeout(modal.parent().parent().parent());
                    if (needRefresh) {
                        setTimeout(function() { 
                            location.reload();
                        }, 2000);
                    }
                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    modal.append(`<div class="alert alert-danger" id="alert" role="alert">
                        There was an error. Please try again later.
                    </div>`);
                    alertTimeout();
                }
                else if (result.status.code == 202) {
                    let type = keyword == 'department' ? 'staff members' : 'departments';
                    modal.append(`<div class="alert alert-danger" id="alert" role="alert">
                        There are ${type} assigned to this ${keyword}. Please ensure that there are no dependencies before deleting.
                    </div>`);
                    alertTimeout();
                }

            }
    });
}