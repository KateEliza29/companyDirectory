// Structure
//1- DOM EVENTS
    //1.1- Side menu
    //1.2- Icons
    //1.3- Filter menu
    //1.4- Modals
//2- RESPONSIVITY FUNCTIONS
//3- FILTER MENU
// SORT MENU
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
        createCards(allResults);
        departmentFilterCriteria = [];
        locationFilterCriteria = [];
        let cells = $('#menuInner td');
        for (let i=0; i<cells.length; i++) {
            if ($(cells[i]).html() == '<i class="far fa-check-circle"></i>') {
                $(cells[i]).html("");
            }
        }
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

$("td").click(function(e){
    addRemoveTicks(e);
    let passDown = [];
    let filterKeyword = $(e.target).hasClass('departments') ? "department" : "location";
    let filterArr;
    console.log(filterKeyword);
    filterArr = setCriteria(e.target, filterKeyword);
    let filterResultsArr = filterResults(allResults, filterKeyword, filterArr, passDown);
    if (filterResultsArr.length == 0) {
        createCards(allResults);
    }
    else {
        createCards(filterResultsArr);
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
        console.log(criteriaArr);
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
    let criteria = $(e.target).attr('id') == "sortName" ? "lname" : $(e.target).attr('id') == "sortLocation" ? "location" : "department";
    console.log(criteria); 
    sortBy(criteria);
});

function sortBy(criteria) {
    if (isAZ) {
        currentResults.sort((a, b) => (a[criteria] > b[criteria]) ? 1 : -1);
        console.log(currentResults);
        isAZ = false;
        createCards(currentResults);
    }
    else {
        currentResults.sort((a, b) => (b[criteria] > a[criteria]) ? 1 : -1);
        console.log(currentResults);
        isAZ = true;
        createCards(currentResults);
    }

}

//5- MODAL FUNCTIONS
    //Edit and New Buttons
    $(document).on('click', '.edit', function(e){
        isEdit = true;
        fillDetailsEditModal(e);
        currentStaffId = $(e.target).parent().parent().attr('id');
        console.log(currentStaffId);
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
        console.log(addDepartment);
        if (isEdit) {
            editStaffMember(addFName, addLName, addJob, addEmail, addDepartment, currentStaffId);
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
        console.log(currentStaffId);
    });

    $('#delete').click(function() {
        console.log(currentStaffId);
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
        let modalEmail = $(`#email${num}`).text(); 
        $('#firstName').val(modalFName);
        $('#lastName').val(modalLName);
        $('#location').val(modalLocation);
        $('#department').val(modalDepartment);
        $('#jobTitle').val(modalJobTitle);
        $('#email').val(modalEmail);
    }




//CARD CREATION
function createCards(resultArray) {
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
                    <i class="fas fa-envelope m-2" id="emailIcon${num}"></i>
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
                let passDown = result.data;
                createCards(passDown);
            },
        });
    }

    //Update
    function editStaffMember(fname, lname, job, email, department, id) {
        console.log(currentStaffId);
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
                console.log(result);
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