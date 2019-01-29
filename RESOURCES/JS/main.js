var stars = {};
var storedTask = localStorage.getItem("task") ? 
                    JSON.parse(localStorage.getItem("task")):
                    {data: []};

var priorityGlobal = 1;

//check if there is any stored task
if(localStorage.getItem("last_task")){
    Play.setTask(JSON.parse(localStorage.getItem("last_task")));
}

//This variables will serte to store
//the timeOut function
var timeP;
var timeB;

//Store the time progress
var timeObjectP;
var timeObjectB;

//This variable will serve   to
//check if there is any task in
//progress
var inProgress = false;

//this class will help to initiate the 
//elements and fix time
class Time {
    constructor(task) {
        this.task = task;

        this.hh = 0;
        this.mm = task.workTime;
        this.ss = 0;
    }

    fixTime() {
        if (this.mm >= 60) {
            this.hh = (this.mm / 60) | 0;
            this.mm = this.mm % 60;
            this.ss = 59;

            if (this.mm === 0) {
                this.hh -= 1;
                this.mm = 59;
            }
            else {
                this.mm -= 1;
            }
        }
        return { hh: this.hh, mm: this.mm, ss: this.ss }
    }
}

class Play {

    static setInPause(pause){
        this.inPause = pause;
    }

    static getInPause(){
        return this.inPause;
    }

    static setTask(task){
        this.task = task;
        localStorage.setItem("last_task", JSON.stringify(task));
    }

    //this is for keep a second task
    static setTmpTask(tmp_task){
        this.tmp_task = tmp_task;
    }

    static getTmpTask(){
        return this.tmp_task;
    }

    static getTask(){
        return this.task;
    }

    static setTimeObjectP(timeObjectP) {
        this.timeObjectP = timeObjectP;
    }

    static setTimeObjectB(timeObjectB) {
        this.timeObjectB = timeObjectB;
    }

    static playSettings(task) {
        if(!task || task === undefined){
            task = {
                id: '_' + Math.random().toString(36).substr(2, 9),
                name: document.getElementById("input_task").value,
                description: document.getElementById("input_description").value,
                workTime: document.getElementById("input_work_time").value,
                longBreak: document.getElementById("input_long_break").value,
                shortBreak: document.getElementById("input_short_break").value,
                priority: priorityGlobal
            };

            var validate = ListBinding.validateFields(task);
            if (validate.flag) {
                //Clear fields
                ListBinding.clearFieldsCreate();
            }
        }   
        var time = new Time(task).fixTime();             

        //this is for progress
        timeObjectP = { h: time.hh, m: time.mm, s: time.ss };
        Play.setTimeObjectP(timeObjectP);
        //this is for break
        timeObjectB = { h: 0, m: task.shortBreak, s: 0 };
        Play.setTimeObjectB(timeObjectB);

        //The operator is because we need two digits
        var hh = (parseInt(timeObjectB.h) < 10) ? "0" + parseInt(timeObjectB.h) : timeObjectB.h;
        var mm = (parseInt(timeObjectB.m) < 10) ? "0" + parseInt(timeObjectB.m) : timeObjectB.m;
        var ss = (parseInt(timeObjectB.s) < 10) ? "0" + parseInt(timeObjectB.s) : timeObjectB.s;

        document.getElementById("timeBreak").innerHTML = hh + ":" + mm + ":" + ss;

        return task;
    }

    static playFromCreate(task) {
        if(!inProgress){            
            //This is the title of the progress task
            document.getElementById("titleProgressTask").innerText = task.name + " is in progress";

            //set the progress task
            Play.setTask(task);

            Play.playProgress();
        }
        else if(Play.getInPause()){
            document.getElementById("id_warning").style.display = "block";
            var task = Play.playSettings();
            
            //This is the title of the progress task
            document.getElementById("titleProgressTask").innerText = task.name + " is in progress";
            //set the progress task
            Play.setTask(task);
        }
        else{
            if(ListBinding.validateFields(task).flag){
                document.getElementById("id_warning").style.display = "block";
            }
        }  
    }

    //Start a task
    static playTask() {
        var button = this;
        var divButtons = button.parentElement;
        var container = divButtons.parentElement;
        var divItems = container.parentElement;
        var li = divItems.parentElement;
        var ul = li.parentElement;
        var id = divItems.childNodes[2].value;

        var pos = getPositionStored(id);
        if (!inProgress) {
            //Set the new progress task
            Play.setTask(storedTask[pos]);
            Play.playSettings(Play.getTask());
            Play.playProgress();
            //Remove task from pending list
            storedTask.splice(pos, 1);
            ul.removeChild(li);
        }
        else if(inProgress && Play.getInPause()){
            document.getElementById("id_warning").style.display = "block";
            //Set the new progress task
            Play.setTmpTask(storedTask[pos]);
        }
    }

    static playProgress() {

        //This is the title of the progress task
        document.getElementById("titleProgressTask").innerText = Play.getTask().name + " is in progress";

        //This is the play button from the section create task
        document.getElementById("btn_play").disabled = true;

        Play.disableItemsPlayButton(true);
        Play.setInPause(false);

        var btn_pause = document.getElementById("btn_control_pause");
        btn_pause.style.display = "block";

        var icon_pause = btn_pause.childNodes[1];
        icon_pause.classList.add("rotate_i");

        document.getElementById("btn_control_play").style.display = "none";

        //This is the section who contains the red time break
        document.getElementById("id_section_time_break").style.display = "flex";

        //Update the progress
        inProgress = true;

        //Start showing the progress
        Play.setTimeProgress(Play.timeObjectP);
    }

    //Stop task
    static stopTask() {
        //This is the play button from the section create task
        document.getElementById("btn_play").disabled = false;

        Play.disableItemsPlayButton(false);
        Play.setInPause(true);

        clearTimeout(timeP);

        var btn_pause = document.getElementById("btn_control_pause");
        btn_pause.style.display = "none";

        var icon_pause = btn_pause.childNodes[1];
        icon_pause.classList.remove("rotate_i");

        document.getElementById("btn_control_play").style.display = "block";
    }

    static disableItemsPlayButton(flag){
        //This are the play button of every pending task
        var x = document.getElementsByClassName("play_pending_task");

        for (var i = 0; i < x.length; i++) {
            x[i].disabled = flag;
        }
    }

    static finishWorkTime() {
        clearTimeout(timeB);
        Play.setTimeBreak(timeObjectB);

        Play.disableItemsPlayButton(false);
        Play.setInPause(true);

        var btn_pause = document.getElementById("btn_control_pause");
        btn_pause.style.display = "none";

        var icon_pause = btn_pause.childNodes[1];
        icon_pause.classList.remove("rotate_i");

        document.getElementById("btn_control_play").style.display = "block";

        //to see the animation
        var btn_play = document.getElementById("btn_control_play");
        btn_play.classList.add("auxStopTask");
        btn_play.disabled = true;

        document.getElementById("id_section_time_break").classList.add("auxTimeBreak");
    }

    static stopTaskBreak() {
        Play.disableItemsPlayButton(true);
        Play.setInPause(false);

        //to see the animation
        var btn_play = document.getElementById("btn_control_play");
        btn_play.classList.add("auxStopTask");
        //Hide play buton
        btn_play.style.display = "none";

        //Show pause button
        var btn_pause = document.getElementById("btn_control_pause");
        var icon_pause = btn_pause.childNodes[1];
        icon_pause.classList.add("rotate_i");
        btn_pause.style.display = "block";

        document.getElementById("id_section_time_break").classList.remove("auxTimeBreak");

        clearTimeout(timeP);
        Play.setTimeProgress(timeObjectP);
        clearTimeout(timeB);

        //The operator is because we need two digits
        var hh = (parseInt(timeObjectB.h) < 10) ? "0" + parseInt(timeObjectB.h) : timeObjectB.h;
        var mm = (parseInt(timeObjectB.m) < 10) ? "0" + parseInt(timeObjectB.m) : timeObjectB.m;
        var ss = (parseInt(timeObjectB.s) < 10) ? "0" + parseInt(timeObjectB.s) : timeObjectB.s;

        document.getElementById("timeBreak").innerHTML = hh + ":" + mm + ":" + ss;

        //Set title in progress
        let nameTask = document.getElementById("titleProgressTask").innerText;
        let index = nameTask.indexOf(" ");
        document.getElementById("titleProgressTask").innerText = nameTask.substring(0, index) + " is in progress";
    }

    static setTimeProgress(time) {
        //The operator is because we need two digits
        var hh = (parseInt(time.h) < 10) ? "0" + parseInt(time.h) : time.h;
        var mm = (parseInt(time.m) < 10) ? "0" + parseInt(time.m) : time.m;
        var ss = (parseInt(time.s) < 10) ? "0" + parseInt(time.s) : time.s;

        //This mean the work time has finished
        if (parseInt(hh) === 0 && parseInt(mm) === 0 && parseInt(ss) === 0) {
            Play.finishWorkTime();

            //This is for courtain animation
            //document.getElementById("id_curtain").style.display = "block";
            //document.getElementById("id_curtain").classList.add("curtain");

            var nameTask = document.getElementById("titleProgressTask").innerText;
            var index = nameTask.indexOf(" ");

            document.getElementById("titleProgressTask").innerText = nameTask.substring(0, index) + " is in break";

            //Set the time in zero
            document.getElementById("timeProgress").innerHTML = hh + ":" + mm + ":" + ss;
        }
        else {
            document.getElementById("timeProgress").innerHTML = hh + ":" + mm + ":" + ss;

            var update = Play.getTime(hh, mm, ss);
            Play.setTimeObjectP(update);

            timeP = setTimeout(function () {
                Play.setTimeProgress({ h: update.h, m: update.m, s: update.s });
            }, 500);
        }
    }

    static setTimeBreak(time) {
        //The operator is because we need two digits
        var hh = (parseInt(time.h) < 10) ? "0" + parseInt(time.h) : time.h;
        var mm = (parseInt(time.m) < 10) ? "0" + parseInt(time.m) : time.m;
        var ss = (parseInt(time.s) < 10) ? "0" + parseInt(time.s) : time.s;

        //It means it is time for the short break
        if (parseInt(hh) === 0 && parseInt(mm) === 0 && parseInt(ss) === 0) {
            Play.stopTaskBreak();
        }
        else {
            document.getElementById("timeBreak").innerHTML = hh + ":" + mm + ":" + ss;

            var update = Play.getTime(hh, mm, ss);
            Play.setTimeObjectB(update);

            timeB = setTimeout(function () {
                Play.setTimeBreak({ h: update.h, m: update.m, s: update.s });
            }, 500);
        }
    }

    static getTime(hh, mm, ss) {
        if (ss > 0) {
            ss--;
        }
        else {
            if (mm > 0) {
                mm--;
            }
            else {
                if (hh > 0) {
                    hh--;
                }
                else {
                    hh = 0;
                    mm = 0;
                    ss = 0;
                }
                mm = 0;
            }
            ss = 59;
        }

        if (hh < 10) {
            hh = "0" + hh;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        if (ss < 10) {
            ss = "0" + ss;
        }

        return { h: hh, m: mm, s: ss };
    }
}

class ListBinding {
    //Validate that fields are not empty
    static validateFields(newTask) {
        if (newTask.name === "") {
            return { flag: false, field: 0 };
        }
        if (newTask.description === "") {
            return { flag: false, field: 1 };
        }
        return { flag: true, field: -1 };
    }

    //After adding a task or playing a task
    static clearFieldsCreate() {
        document.getElementById("input_task").value = "";
        document.getElementById("input_description").value = "";
        document.getElementById("input_work_time").value = "25";
        document.getElementById("input_long_break").value = "15";
        document.getElementById("input_short_break").value = "5";

        //This is the word counter of the description field
        document.getElementById("cant_characters").innerText = "0/100";

        ListBinding.fillStarCrateTask(1);
    }

    static addItemToDOM(newTask, flag) {
        //get the list
        var list = document.getElementById('listTask');

        //Create un item for the list
        var item = document.createElement('li');

        //Global div
        var divItems = document.createElement('div');
        divItems.classList.add('items');


        var divItemTask = document.createElement('div');
        divItemTask.classList.add('itemTask');

        var task = document.createElement('h4');
        task.innerText = "Task";

        var nameTask = document.createElement('h3');
        nameTask.innerText = newTask.name;

        //Adding the elements to the div
        divItemTask.appendChild(task);
        divItemTask.appendChild(nameTask);

        //this is the div for the description
        var divDesc = document.createElement('div');
        divDesc.classList.add('itemDescription');

        var descriptionTitle = document.createElement('h4');
        descriptionTitle.innerText = "Description"

        var description = document.createElement('h3');
        description.innerText = newTask.description;

        //Adding the elements to the div
        divDesc.appendChild(descriptionTitle);
        divDesc.appendChild(description);

        var containerUp = document.createElement("div");
        containerUp.classList.add("container-up");

        containerUp.appendChild(divItemTask);
        containerUp.appendChild(divDesc);

        //Div for buttons and rating
        var container = document.createElement('div');
        container.classList.add("container");

        //Div for the rating bar
        var divRating = document.createElement('div');
        divRating.classList.add("ratingBar");



        //add the checked stars
        for (var i = 0; i < newTask.priority; i++) {
            var starChecked = document.createElement('i');
            starChecked.classList.add("fa", "fa-star", "checked");
            divRating.appendChild(starChecked);
        }

        //add the unchecked stars
        for (var i = newTask.priority; i < 5; i++) {
            var starUnChecked = document.createElement('i');
            starUnChecked.classList.add("fa", "fa-star", "nochecked");
            divRating.appendChild(starUnChecked);
        }

        //Div fot the buttons
        var divButtons = document.createElement('div');
        divButtons.classList.add("buttons");

        var btn_play = document.createElement('button');
        btn_play.classList.add("play_pending_task");
        var icon_play = document.createElement('i');
        icon_play.classList.add("material-icons");
        icon_play.innerText = "play_arrow";
        btn_play.appendChild(icon_play);

        btn_play.addEventListener('click', Play.playTask);
        if (inProgress && !Play.inPause) {
            btn_play.setAttribute("disabled", "");
        }

        var btn_remove = document.createElement('button');
        var icon_remove = document.createElement('i');
        icon_remove.classList.add("material-icons");
        icon_remove.innerText = "remove";
        btn_remove.appendChild(icon_remove);


        btn_remove.addEventListener('click', function(){ListBinding.removeItem(null, this)});
        divButtons.appendChild(btn_play);
        divButtons.appendChild(btn_remove);

        container.appendChild(divRating);
        container.appendChild(divButtons);

        //Hiden input to store the id
        var hiddenIn = document.createElement('input');
        hiddenIn.setAttribute("id", "hiddenInput");
        hiddenIn.setAttribute("type", "hidden");
        hiddenIn.setAttribute("value", newTask.id);

        //add all the div to the global div
        divItems.appendChild(containerUp);
        divItems.appendChild(container);

        //add the hidden element
        divItems.appendChild(hiddenIn);

        //add everthing to the item
        item.appendChild(divItems);

        
        debugger;
        //get the position where the item must be stored
        var pos = getPositionTask(newTask.priority);

        //if flag = true 
        //it means we are loading the stored task
        if(!flag){
            //splice allows us to add items at specific
            //index
            storedTask.data.splice(pos, 0, newTask);
            
            //update data in Local Storage
            localStorage.setItem("task", JSON.stringify(storedTask));
        }

        list.insertBefore(item, list.childNodes[pos]);
    }

    //Remove an item from the pending task
    static removeItem(id, e) {
        //if we get the id
        //we only have to search for the pos
        var pos;
        var li;
        var lu = document.getElementById("listTask");
        if(id === undefined || id === null){
            var items = e.parentElement.parentNode.parentElement;
            var li = items.parentElement;

            //get the input, it is placed 
            //in the 4 position
            var hiddenInput = items.childNodes[2];
            pos = getPositionStored(hiddenInput.value);
        }
        else{
            pos = getPositionStored(id);
            li = lu.childNodes[pos];
        }

        if (pos !== -1) {
            storedTask.data.splice(pos, 1);
            //update data in Local Storage
            localStorage.setItem("task", JSON.stringify(storedTask));
        }
        lu.removeChild(li);
    }

    static fillStarCrateTask(pos) {
        //store the priority
        priorityGlobal = pos;
        for (var i = 0; i < pos; i++) {
            stars[i].style.color = "rgb(255, 239, 12)";
        }

        for (var i = pos; i < 5; i++) {
            stars[i].style.color = "rgb(212, 212, 212)";
        }
    }
}

stars[0] = document.getElementById("star1");
stars[1] = document.getElementById("star2");
stars[2] = document.getElementById("star3");
stars[3] = document.getElementById("star4");
stars[4] = document.getElementById("star5");

stars[0].addEventListener("mouseover", function () { ListBinding.fillStarCrateTask(1) });
stars[1].addEventListener("mouseover", function () { ListBinding.fillStarCrateTask(2) });
stars[2].addEventListener("mouseover", function () { ListBinding.fillStarCrateTask(3) });
stars[3].addEventListener("mouseover", function () { ListBinding.fillStarCrateTask(4) });
stars[4].addEventListener("mouseover", function () { ListBinding.fillStarCrateTask(5) });

document.getElementById("input_description").addEventListener("input", function () {
    var can = this.value.length;
    if (can >= 100) {
        this.value = this.value.substring(0, 100);
        document.getElementById("cant_characters").innerText = "100/100";
    }
    else {
        document.getElementById("cant_characters").innerText = can + "/100";
    }
});

//when the users click the button
document.getElementById("btn_add").addEventListener("click", function () {
    var task = Play.playSettings();
    var validate = ListBinding.validateFields(task);

    if (validate.flag) {
        ListBinding.addItemToDOM(task);
        //Clear fields
        ListBinding.clearFieldsCreate();

    
        if(document.body.clientWidth <= 767){
            hideCreate();
        }
    }
    else {
        showSnackbar(validate.field);
    }   
});

document.querySelector(".add-hidden").addEventListener("click", showCreate);

document.getElementById("btn_play").addEventListener("click", function () {
    var task = Play.playSettings();
    Play.playFromCreate(task);

    if(document.body.clientWidth <= 767){
        hideCreate();
    }
});

document.getElementById("btn_control_pause").addEventListener("click", Play.stopTask);
document.getElementById("btn_control_play").addEventListener("click", Play.playProgress);
document.getElementById("btn_close_card").addEventListener("click", function(){
    document.getElementById("id_warning").style.display = "none";
    Play.setTask(null);
});
document.getElementById("btn_dont_save").addEventListener("click", function(){
    inProgress = false;

    //remove the item from pending list
    ListBinding.removeItem(Play.getTmpTask().id);

    //make the wrap
    Play.setTask(Play.getTmpTask());
    Play.setTmpTask(null);

    Play.playFromCreate(Play.getTask());
    document.getElementById("id_warning").style.display = "none";

});

document.getElementById("btn_save").addEventListener("click", function(){
    inProgress = false;
    //remove the item from pending list
    ListBinding.removeItem(Play.getTmpTask().id);

    //add the current task to pending
    ListBinding.addItemToDOM(Play.getTask());

    //set new task time
    Play.playSettings(Play.getTmpTask());

    Play.setTask(Play.getTmpTask());
    Play.setTmpTask(null);

    //start that task
    Play.playProgress();

    
    document.getElementById("id_warning").style.display = "none";
});

//load the stored task
function renderTasks(){
    //check that there are stored tasks
    if(!storedTask.data.length) return;

    //iterate over the stored task
    for(let i = 0; i < storedTask.data.length; i++){
        var task = storedTask.data[i];
        ListBinding.addItemToDOM(task, true);
    }
}
renderTasks();

//After adding the task
//set opcity to see the change
function setColorEffect(pos) {

    //To avoid problem with the effect
    document.getElementById("btn_add").disabled = true;

    var opacity = 1;
    //get the list
    var list = document.getElementById('listTask');
    //var get item
    var item = list.childNodes[pos];
    item.style.background = "rgba(243,95,95," + opacity + ")";

    setTimeout(fillItem, 100, opacity, pos);
}

function fillItem(opacity, pos) {
    //get the list
    var list = document.getElementById('listTask');
    //var get item
    var item = list.childNodes[pos];
    item.style.background = "rgba(243,95,95," + opacity + ")";
    if (opacity > 0) {
        opacity -= 0.8;
        setTimeout(fillItem, 50, opacity, pos);
    }
    else {
        document.getElementById("btn_add").disabled = false;
    }
}

function getPositionTask(priority) {
    //iterate through the list
    for (var i = 0; i < storedTask.data.length; i++) {
        var aux = storedTask.data[i].priority;
        if (aux <= priority) {
            return i;
        }
    }
    return storedTask.length;
}

function getPositionStored(id) {
    for (var i = 0; i < storedTask.data.length; i++) {
        var auxId = storedTask.data[i].id;
        if (auxId === id) {
            return i;
        }
    }
    return -1;
}

function showSnackbar(field) {
    var snack = document.getElementById("snackbar");

    //0 for the task field
    //1 for the description field
    if (field === 0) {
        snack.innerText = "Fill the Task name field";
    }
    else if (field === 1) {
        snack.innerText = "Fill the Description field";
    }

    //add the show class to snack
    snack.className = "show";

    //after 3 seconds, remove the show class from snackbar
    setTimeout(function () {
        snack.className = snack.className.replace("show", "");
    }, 3000);
}

function hideCreate(){
    if(document.body.clientWidth <= 767){
        document.getElementsByClassName("aux-selector")[0].classList.add("aux-create");
    }

    var btn = document.getElementsByClassName("close-hidden")[0];
    var i = btn.childNodes[1];
    i.innerText = "add";

    document.querySelector(".close-hidden").removeEventListener("click", hideCreate);
    btn.classList.replace("close-hidden", "add-hidden");

    document.querySelector(".add-hidden").addEventListener("click", showCreate);
}

function showCreate(){
    if(document.body.clientWidth <= 767){
        document.getElementsByClassName("aux-selector")[0].classList.remove("aux-create");
    }

    var btn = document.getElementsByClassName("add-hidden")[0];
    var i = btn.childNodes[1];
    i.innerText = "close";

    document.querySelector(".add-hidden").removeEventListener("click", showCreate);
    btn.classList.replace("add-hidden", "close-hidden");

    document.querySelector(".close-hidden").addEventListener("click", hideCreate);
}