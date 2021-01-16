// Structure
//1- GLOBAL VARIABLES
//2- DOM EVENTS
    //2.1- Preloader
    //2.2- Side Menu
    //2.3- Top Menu
//3- RESPONSIVITY FUNCTIONS
//4- FILTER MENU
//5- SORT MENU
//6- SEARCH FUNCTION
//7- MODAL FUNCTIONS
    //7.1- Add/Edit Modal
    //7.2- Delete Modal
    //7.3- Settings Modal
//8- DATA DISPLAY
//9- GENERAL FUNCTIONALITY
//10- PHP CALLS TO DATABASE
    //10.1- Create
    //10.2- Read
    //10.3- Update
    //10.4- Delete


//1- GLOBAL VARIABLES
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
let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

let firstName;
let lastName;
let jobTitle;
let email;
let department;
let staffLocation;

//2- DOM EVENTS
$('document').ready(function(){
    displayIcons();
    getAllDetails();
    fillLocationDepartments([$('#departmentToChange'), $('#departmentToDelete'), $('#addUpdateDepartment')], 'departments');
    fillLocationDepartments([$('#addUpdateLocation'), $('#locationToDelete'), $('#addNewDepartmentLocation'), $('#updateDepartmentLocation')], 'locations');
});

    //2.1- Preloader
    $(window).on('load', function () {    
        if ($('#preloader').length) {
            $('#preloader').delay(100).fadeOut('slow', function () {
                $(this).remove();
            });
        }});

    //2.2- Side Menu
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

    //2.3 Top Menu
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


//3- RESPONSIVITY FUNCTIONS
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
        $('#listDisplay td:nth-child(3),th:nth-child(3)').hide();
    }
    else {
        $('#listDisplay td:nth-child(2),th:nth-child(2)').show();
        $('#listDisplay td:nth-child(3),th:nth-child(3)').show();
    }
}

//4- FILTER MENU
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

//5- SORT MENU 
$(document).on('click', '.sort', function(e){
    let criteria = $(e.target).text() == "Name" ? "lastName" : $(e.target).text() == "Location" ? "location" : "department";
    sortBy(criteria);
});


function sortBy(criteria) {
    if (isFiltered) {
        if (isAZ) {
            filterSearchResults.sort((a, b) => (a[criteria].toLowerCase() > b[criteria].toLowerCase()) ? 1 : -1);
            displayResults(filterSearchResults);
            isAZ = false;
        }
        else {
            filterSearchResults.sort((a, b) => (b[criteria].toLowerCase() > a[criteria].toLowerCase()) ? 1 : -1);
            displayResults(filterSearchResults);
            isAZ = true;
        }
    }
    else {
        if (isAZ) {
            currentSelection.sort((a, b) => (a[criteria].toLowerCase() > b[criteria].toLowerCase()) ? 1 : -1);
            displayResults(currentSelection);
            isAZ = false;
        }
        else {
            currentSelection.sort((a, b) => (b[criteria].toLowerCase() > a[criteria].toLowerCase()) ? 1 : -1);
            displayResults(currentSelection);
            isAZ = true;
        }
    }
}

//6- SEARCH FUNCTION
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

//7- MODAL FUNCTIONS
    //7.1 Add/Update Modal
    $(document).on('click', '.edit', function(e){
        $('#cardModal').modal('hide');
        isEdit = true;
        currentStaffId = isCards ? $(e.target).parent().parent().attr('id') : $(e.target).parent().parent().parent().attr('id');
        console.log("on edit fire, currentStaffId = " + currentStaffId);
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
        department = departmentList[$('#addUpdateDepartment').val()];
        let validEmail = emailRegex.test(email);
        if (firstName && lastName && jobTitle && validEmail && department) {
            if (isEdit) {
                editStaffMember(firstName, lastName, jobTitle, email, department, currentStaffId);
                //Refresh with new current selection
            }
            else {
                addNewStaffMember(firstName, lastName, jobTitle, email, department);
                //Refresh with new current selection
            }
        }
        else {
            alertInvalidEntry($('#addUpdateBody'));
        }
    });

    function fillDetailsEditModal() {
        console.log("on fill details call, currentStaffId = " + currentStaffId);
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

    //7.2- Delete Modal
    $(document).on('click', '.delete', function(e){
        currentStaffId = $(e.target).parent().parent().attr('id');
        $('#deleteFName').text($(`#fname${currentStaffId}`).text());
        $('#deleteLName').text($(`#lname${currentStaffId}`).text());
    });

    $('#deletePersonBtn').click(function(e) {
        deleteLocationDepartmentStaff(e, currentStaffId);
    });

    //7.3- Settings Modal
    $('#addDepartment').click(function(e) {
        department = $('#newDepartment').val();
        staffLocation = $('#addNewDepartmentLocation').val();
        let locationId = locationList[$('#addNewDepartmentLocation').val()];
        if (department && locationId) {
            addNewDepartment(department, locationId);
        } 
        else {
            alertInvalidEntry($('#addNewDepartment'));
        }
    });

    $('#addLocation').click(function(e) {
        staffLocation = $('#newLocation').val();
        if (staffLocation) {
            addNewLocation(staffLocation);
        }
        else {
            alertInvalidEntry($('#addNewLocation'));
        }
    });

    $('#deleteDepartmentBtn').click(function(e) {
        let departmentId = departmentList[$('#departmentToDelete').val()]; 
        if (departmentId) {
            deleteLocationDepartmentStaff(e, departmentId);
        }
        else {
            alertInvalidEntry($('#deleteDepartment'));
        }
    });

    $('#deleteLocationBtn').click(function(e) {
        let locationId = locationList[$('#locationToDelete').val()]; 
        if (locationId) {
            deleteLocationDepartmentStaff(e, locationId);
        }
        else {
            alertInvalidEntry($('#deleteLocation'));
        }
        
    });

    $('#editDepartmentBtn').click(function(e) {
        let locationId = locationList[$('#updateDepartmentLocation').val()]; 
        let departmentId = departmentList[$('#departmentToChange').val()];
        department = $('#departmentToChange').val();
        staffLocation = $('#updateDepartmentLocation').val();
        if (department && locationId) {
            updateDepartment(departmentId, locationId);
        }
        else {
            alertInvalidEntry($('#updateDepartment'));
        }
    });

    //Show card on table click.
    $('#listBody').on('click', 'td', function(e) { //Change this to target everything but the edit box.
        currentStaffId = $(e.target).attr('id').slice(-2);
        console.log("on list body click, currentStaffId = " + currentStaffId);
        $('#cardModal').modal('show');
        console.log(allResults); //find that id first, not the index. 
        let person =[];
        for (let i=0; i<currentSelection.length; i++) {
            if (currentSelection[i].id == currentStaffId) {
                person.push(currentSelection[i]);
            }
        } 
        firstName = person[0].firstName;
        lastName = person[0].lastName;
        department = person[0].department;
        staffLocation = person[0].location;
        jobTitle = person[0].jobTitle;
        email = person[0].email;
        $("#cardModalContent").append(`<section class="cardPopup rounded bg-light mx-auto my-2 d-flex flex-column justify-content-center" id="${currentStaffId}">
            <h2 class="text-center mt-2"><span id="fname${currentStaffId}"> ${firstName}</span><span id="lname${currentStaffId}"> ${lastName} </span></h2>
            <div class="d-flex flex-row m-1 text-center justify-content-center align-items-center">
                <img class="m-2 rounded" src="https://i.pravatar.cc/100?img=${currentStaffId}">
                <div class="m-2 cardText">
                    <h3 id="department${currentStaffId}">${department}</h3>
                    <p id="location${currentStaffId}">${staffLocation}</p>
                    <p id="jobTitle${currentStaffId}">${jobTitle}</p>
                    <a id="skypeIcon${currentStaffId}" href="tel:000000000"><i class="fab fa-skype m-2" id="skype"></i></a>
                    <a id="emailIcon${currentStaffId}" href="mailto:${email}"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
            <p class="text-center" id="email${currentStaffId}">${email}</p>
        </section>`);
    });

    $('#cardModal').on('hidden.bs.modal', function () {
        $("#cardModalContent").text('');
    });

//8- DATA DISPLAY
function createCards(resultArray) {
    $('#listSection').css({
        height: 0,
        width: 0,
        display: 'none'
    });
    $('#cardSection').css({
        display: 'block',
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

//9- GENERAL FUNCTIONALITY
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

function alertInvalidEntry(modal) {
    modal.append(`<div class="alert alert-warning" id="alert" role="alert">
        Please make sure all fields are correctly filled in and try again.
    </div>`);
    alertTimeout();
}

//10- PHP CALLS TO DATABASE
    //10.1- Create
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
                    $("#addUpdateBody").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${fname} ${lname}, ${job} has been added to the database!
                    </div>`);
                    currentStaffId = result.data.id;
                    modalTimeout($("#addUpdateModal"));
                    setTimeout(function() { 
                        location.reload();
                    }, 2000);
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

    //10.2- Read 
    function getAllDetails() {
        $.ajax({
            url: "libs/php/getAll.php",
            type: 'GET',
            dataType: 'json',
            success: function(result) {
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
                $('#addUpdateLocation').val(result.data[0].name);
            }
        });
    } 


    //10.3- Update
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
                    $("#addUpdateBody").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${fname} ${lname}, ${job} has been updated!
                    </div>`);
                    modalTimeout($("#addUpdateModal"));
                    setTimeout(function() { 
                        location.reload();
                    }, 2000);
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

    function updateDepartment(departmentId, locationId) {
        $.ajax({
            url: "libs/php/updateDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
                locationId: locationId,
                id: departmentId
            },
            success: function(result) {
                if (result.status.code == 200) {
                    $("#updateDepartment").append(`<div class="alert alert-success" id="alert" role="alert">
                        ${department} is now located in ${staffLocation}!
                    </div>`);
                    modalTimeout($("#settingsModal"));
                    setTimeout(function() { 
                        location.reload();
                    }, 2000);
                }
                else if (result.status.code == 400 || result.status.code == 300) {
                    $("#updateDepartment").append(`<div class="alert alert-danger" id="alert" role="alert">
                        ${department} could not be changed. Please try again later.
                    </div>`);
                    alertTimeout();
                }
            },
        });
    }

    //10.4- Delete
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
       $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
                id: id 
            },
            success: function(result) {
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