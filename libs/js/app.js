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
let allResults;
let currentResults;
let isEdit;
let currentStaffId;
let isCards = true;

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
        if (isCards) {
            createCards(allResults);
        }
        else {
            createList(allResults);
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
//Change to use currentResults
$("td").click(function(e){
    addRemoveTicks(e);
    let passDown = [];
    let filterKeyword = $(e.target).hasClass('departments') ? "department" : "location";
    let filterArr;
    filterArr = setCriteria(e.target, filterKeyword);
    let filterResultsArr = filterResults(allResults, filterKeyword, filterArr, passDown);
    if (filterResultsArr.length == 0) {
        if (isCards) {
            createCards(allResults);
        }
        else {
            createList(allResults);
        }

    }
    else {
        if (isCards) {
            createCards(filterResultsArr);
        }
        else {
            createList(filterResultsArr);
        }

    }
});

function addRemoveTicks(e) {
    let target = e.target;
    if ($(target).hasClass('filter')) {
        if ($(target).next().html() == '') {
            $(target).next().html('<i class="far fa-check-circle"></i>'); 
        }
        else {
            $(target).next().html('');
        }
    }
}

function setCriteria(target, keyword) {
    let criteriaArr;
    if (keyword == "department") {
        criteriaArr = departmentFilterCriteria;
    }
    else {
        criteriaArr = locationFilterCriteria;
    }
    if (criteriaArr.includes($(target).text())) {
        let index = criteriaArr.indexOf($(target).text());
        criteriaArr.splice(index, 1);
    }
    else {
        criteriaArr.push($(target).text());
    }
    return criteriaArr;
}

function filterResults(initialArr, filterKeyword, filterCriteriaArr, finalArr) {
    for (let i=0; i<initialArr.length; i++) {
        for (let j=0; j<filterCriteriaArr.length; j++) {
            if (initialArr[i][filterKeyword] == filterCriteriaArr[j]) {
                finalArr.push(initialArr[i]);
            }
        }
    }
    return finalArr;
}


//3- SORT MENU 
let isAZ = true;

$(document).on('click', '.sort', function(e){
    let criteria = $(e.target).text() == "Name" ? "lname" : $(e.target).text() == "Location" ? "location" : "department";
    sortBy(criteria);
});

function sortBy(criteria) {
    if (isAZ) {
        currentResults.sort((a, b) => (a[criteria] > b[criteria]) ? 1 : -1);
        isAZ = false;
        if (isCards) {
            createCards(currentResults);
        }
        else {
            createList(currentResults);
        }

    }
    else {
        currentResults.sort((a, b) => (b[criteria] > a[criteria]) ? 1 : -1);
        isAZ = true;
        if (isCards) {
            createCards(currentResults);
        }
        else {
            createList(currentResults);
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
            if (isCards) {
                createCards(result.data);
            }
            else {
                createList(result.data);
            } 
        },
    });
}

//5- MODAL FUNCTIONS
    //Edit and New Buttons
    $(document).on('click', '.edit', function(e){
        isEdit = true;
        fillDetailsEditModal(e);
        currentStaffId = $(e.target).parent().parent().attr('id');
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
        let addFName = $('#firstName').val();
        let addLName = $('#lastName').val();
        let addJob = $('#jobTitle').val();
        let addEmail = $('#email').val();
        let departmentList = ["None", "Accounting", "Business Development", "Engineering", "Human Resources", "Legal", "Marketing", "Product Management", "Research and Development", "Sales", "Services", "Support", "Training"];
        let addDepartment = departmentList.indexOf($('#department').val()); 
        // Format text. 


        //Check text. 
        if (isEdit) {
            editStaffMember(addFName, addLName, addJob, addEmail, addDepartment, currentStaffId);
            refreshCurrentSelection();
        } 
        else {
            addNewStaffMember(addFName, addLName, addJob, addEmail, addDepartment);
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
    //Change 'num' to currentStaffId
    function fillDetailsEditModal(e) {
        let num = $(e.target).parent().parent().attr('id');
        let modalFName = $(`#fname${num}`).text(); 
        let modalLName = $(`#lname${num}`).text(); 
        let modalDepartment = $(`#department${num}`).text(); 
        let modalLocation = $(`#location${num}`).text(); 
        let modalJobTitle = $(`#jobTitle${num}`).text(); 
        let modalEmailpre = $(`#emailIcon${num}`).attr('href'); 
        let modalEmail = modalEmailpre.slice(7);
        $('#firstName').val(modalFName);
        $('#lastName').val(modalLName);
        $('#location').val(modalLocation);
        $('#department').val(modalDepartment);
        $('#jobTitle').val(modalJobTitle);
        $('#email').val(modalEmail);
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
        let num = resultArray[i].id;
        let cardFName = resultArray[i].firstName;
        let cardLName = resultArray[i].lastName;
        let cardDepartment = resultArray[i].department; 
        let cardLocation = resultArray[i].location;
        let cardJobTitle = resultArray[i].jobTitle;
        let cardEmail = resultArray[i].email;
        $("#cardSection").append(`<section class="staffMember rounded bg-light m-2" id="${num}">
            <h2 class="text-center mt-2"><span id="fname${num}"> ${cardFName}</span><span id="lname${num}"> ${cardLName} </span></h2>
            <div class="d-flex flex-row m-2 text-center justify-content-center align-items-center">
                <img class="m-2 rounded" src="https://i.pravatar.cc/100?img=${num2}">
                <div class="m-2 cardText">
                    <h3 id="department${num}">${cardDepartment}</h3>
                    <p id="location${num}">${cardLocation}</p>
                    <p id="jobTitle${num}">${cardJobTitle}</p>
                    <i class="fab fa-skype m-2" id="skype"></i>
                    <a id="emailIcon${num}" href="mailto:${cardEmail}"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
            <p class="text-center" id="email${num}">${cardEmail}</p>
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
        let num = resultArray[i].id;
        let listFName = resultArray[i].firstName;
        let listLName = resultArray[i].lastName;
        let listDepartment = resultArray[i].department; 
        let listLocation = resultArray[i].location;
        let listJobTitle = resultArray[i].jobTitle;
        let listEmail = resultArray[i].email;
        $('#listDisplay').append(`<tr id="${num}">
            <td><span class="p-0" id="fname${num}">${listFName}</span><span class="p-0" id="lname${num}"> ${listLName}</span></td>
            <td><a id="emailIcon${num}" href="mailto:${listEmail}"><i class="fas fa-envelope"></i></a></td>
            <td><p id="jobTitle${num}">${listJobTitle}</p></td>
            <td><p id="location${num}">${listDepartment}</p></td>
            <td id="department${num}">${listLocation}</td>
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
    //go through allresults, identify that id, push to current
    allResults = getAllDetails();
    for (let i=0; i<allResults.length; i++) {
        if (allResults[i].id == currentStaffId) {
            currentResults.push(allResults[i]);
        }
    }
    if (isCards) {
        createCards(currentResults);
    }
    else {
        createList(currentResults);
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
                $("#addUpdateBody").append(`<div class="alert alert-success" role="alert">
                    ${fname} ${lname}, ${job} has been added to the database!
                </div>`);
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
                if (isCards) {
                    $('#cardSection').show();
                    $('#listSection').hide();
                    createCards(allResults);
                }
                else {
                    $('#cardSection').css({
                        height: 0,
                        width: 0
                    });
                    $('#listSection').show();
                    createList(allResults);
                }

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