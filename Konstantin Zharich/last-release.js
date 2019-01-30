var Module = (function(){
    
    var COLOR_TASK_COMPLETE = 'rgb(46, 204, 113)';
    var COLOR_TASK_NOT_COMPLETE = 'rgb(192, 57, 43)';
    
    var obj = {};
    var mainContainer = document.querySelector('.main-container');

    var taskCounter = _checkNumberOfOldTasks();

    // Check if something exists in local storage
    // I use it as id for every task-item
    function _checkNumberOfOldTasks() {
        if(localStorage.getItem('LOCAL_TASK_ITEMS')) {
            var oldDataArray = JSON.parse(localStorage.getItem('LOCAL_TASK_ITEMS'));
            return oldDataArray.length;
        } else {
            return 0;
        }
    }
    
    function _filterByComplete() {
        if(document.querySelector('.task-item')){
            var listOfNodes = document.querySelectorAll('.task-item');
            var listOfNodesComplete = [];
            var listOfNodesNotComplete = [];

            for(var i = 0; i < listOfNodes.length; i++) {
                if(listOfNodes[i].style.background === COLOR_TASK_COMPLETE) {
                    listOfNodesComplete.push(listOfNodes[i]);
                } else {
                    listOfNodesNotComplete.push(listOfNodes[i]);
                }
                listOfNodes[i].remove();
            }

            var filteredArray = listOfNodesComplete.concat(listOfNodesNotComplete);

            var target = document.querySelector('.list-tasks');

            for(var i = 0; i < filteredArray.length; i++) {
                target.appendChild(filteredArray[i]);
            }

            console.log(filteredArray);
        }
    }
    
    function _filterByDay() {

        if(document.querySelector('.task-item')) {
            var listOfNodes = document.querySelectorAll('.task-item');
            var filterOneDay = [];
            var otherElements = [];
            var oneDayMillisec = 86400000;

            for(var i = 0; i < listOfNodes.length; i++) {
                // if the difference between user input time and time of creation task < oneDayMillisec
                if(listOfNodes[i].userInputTime - listOfNodes[i].createTime < oneDayMillisec) {
                    filterOneDay.push(listOfNodes[i]);
                } else {
                    otherElements.push(listOfNodes[i]);
                }
            }

            var filteredArray = filterOneDay.concat(otherElements);

            var target = document.querySelector('.list-tasks');

            for(var i = 0; i < filteredArray.length; i++) {
                target.appendChild(filteredArray[i]);
            }

        }
    }

    function _filterByWeek () {
        if(document.querySelector('.task-item')) {
            var listOfNodes = document.querySelectorAll('.task-item');
            var filterWeekDay = [];
            var otherElements = [];

            var oneWeekMillisec = 604800000;
            var oneDayMillisec = 86400000;

            for(var i = 0; i < listOfNodes.length; i++) {
                if((listOfNodes[i].userInputTime - listOfNodes[i].createTime < oneWeekMillisec) && (listOfNodes[i].userInputTime - listOfNodes[i].createTime > oneDayMillisec)) {
                    filterWeekDay.push(listOfNodes[i]);
                } else {
                    otherElements.push(listOfNodes[i]);
                }
            }

            var filteredArray = filterWeekDay.concat(otherElements);

            var target = document.querySelector('.list-tasks');

            for(var i = 0; i < filteredArray.length; i++) {
                target.appendChild(filteredArray[i]);
            }

        }
    }

    // Create timer for every task, check task for complete every minute/second
    function _deadLines(userInput, userDate, userTime, id) {
            
        var userInputTime = new Date(userDate + ' ' + userTime).getTime();
        var item = document.querySelector('#task-'+id);

        var createTime = new Date().getTime();

        var deadLineParagraph = new Component('p','deadline-text','Deadline ' + userDate + ' ' + userTime)
        item.childNodes[0].childNodes[1].appendChild(deadLineParagraph.element);

        // for filter day/week
        item.createTime = createTime;
        item.userInputTime = userInputTime;

        // for localStorage
        var localTaskItem = {
            "task-id": id,
            "task-name": userInput,
            "task-create-time": createTime,
            'task-deadline': userInputTime, 
        } 

        var timer = setInterval(function() {

            var itemCheck = document.querySelector('#task-'+id);
            
            var currentTime = new Date().getTime();
            console.log('current time ' + currentTime);
            console.log('input time ' + userInputTime);
            var distance = userInputTime - currentTime;

            // if list element exist
            if(itemCheck !== null){
                // if task is complete (color = green)
                if(itemCheck.style.background === COLOR_TASK_COMPLETE){
                    clearInterval(timer);
                    localTaskItem["task-status"] = "complete";
                }

                // if task is not complete (color = red)
                if(itemCheck.style.background === COLOR_TASK_NOT_COMPLETE) {
                    clearInterval(timer);
                    localTaskItem["task-status"] = "not_complete";
                }

                // if time has expired (color = red)
                if(distance < 0) {
                    clearInterval(timer);
                    document.querySelector('#task-'+id).style.background = COLOR_TASK_NOT_COMPLETE;
                    localTaskItem["task-status"] = "not_complete";
                    itemCheck.firstElementChild.lastElementChild.disabled = true;
                    itemCheck.firstElementChild.lastElementChild.previousSibling.disabled = true;
                }

            } else {
                clearInterval(timer);
                localTaskItem["task-status"] = "deleted";
            }

        }, 1000);
        // 1000
        // 60000

        _addToLocalStorage(localTaskItem);
    } 

    // Add task-data to local storage
    function _addToLocalStorage(task) {
        var existingArray = JSON.parse(localStorage.getItem('LOCAL_TASK_ITEMS'));
        console.log(existingArray);
        if(existingArray === null) existingArray = [];
        existingArray.push(task);
        localStorage.setItem('LOCAL_TASK_ITEMS', JSON.stringify(existingArray));
    }


    var COUNTER_LOCAL_STORAGE = 0;

    // Delete tasks-data from local storage
    function _clearFromLocalStorage() {
        var existingArray = JSON.parse(localStorage.getItem('LOCAL_TASK_ITEMS'));

        if(existingArray !== null) {
            for(var i = 0; i < existingArray.length; i++){
                if(existingArray[i] !== null){
                    if (existingArray[i]['task-id'] == this.id) {
                        console.log('HERE');
                        delete existingArray[i];
                        COUNTER_LOCAL_STORAGE++;
                    }
                }
            }
        }

        if(COUNTER_LOCAL_STORAGE === existingArray.length){
            localStorage.clear();
        } else {
            localStorage.setItem('LOCAL_TASK_ITEMS', JSON.stringify(existingArray));
        }
    }

    //Class for creating DOM-elements 
    function Component(wrapper,className,innerText,type) {
        this.element = document.createElement(wrapper);
        this.element.className = className;

        if(innerText) {
            this.element.innerHTML = innerText;
        }

        if(type) {
            this.element.type = type;
        }
    }

    // appendChild method for Component
    Component.prototype.addToElement = function(target) {
        if(target.element){
            target.element.appendChild(this.element);
        } else {
            target.appendChild(this.element);
        }
    }
    
    var btnAddTask = new Component('button','btn btn-success btn-add-task','Add new task');
    btnAddTask.clickedLessThanOne = true;
    var labelInputForm = new Component('label','task-label','Enter the task title');
    var inputForm = new Component('input','form-control form-control-sm input-text',undefined,'text');
    var listTasks = new Component('ul','list-group list-tasks');

    var inputWrapper = new Component('div','input-task-wrap');
    var acceptBtn = new Component('button','btn btn-success btn-accept','Add','button');
    var labelDateInput = new Component('label','date-label','Choose date and time for a deadline');
    var dateInput = new Component('input','date-input',undefined,'date');
    var timeInput = new Component('input','time-input',undefined,'time');

    var btnFilterComplete = new Component('button','btn btn-info filter-by-complete','filterByComplete','button');

    btnFilterComplete.element.onclick = function () {
        _filterByComplete();
    }

    var btnFilterDay = new Component('button','btn btn-info filter-by-day','filterByDay','button');

    btnFilterDay.element.onclick = function() {
        _filterByDay();
    }
    
    var btnFilterWeek = new Component('button','btn btn-info filter-by-week','filterByWeek','button');

    btnFilterWeek.element.onclick = function() {
        _filterByWeek();
    }

    // Set default values to inputs
    function _setCurrentTimeToInputs() {
        var currentTime = new Date();
        var year = currentTime.getFullYear();
        var month = currentTime.getMonth();
        var maxDaysInMonth = new Date(year, month, 0).getDate();

        var yearAndMonth = currentTime.toISOString().slice(0,7);
        var currentData = currentTime.toISOString().slice(0,10);
        var year = currentTime.toISOString().slice(0,4);
        var currentTimeClock = currentTime.toLocaleTimeString().slice(0,5);

        console.log(currentData);
        console.log(currentTimeClock);
        dateInput.element.value = currentData;
        dateInput.element.min = currentData;
        // dateInput.element.max = yearAndMonth+'-'+maxDaysInMonth;
        
        timeInput.element.value = currentTimeClock;
        timeInput.element.min = currentTime;
        timeInput.element.max = '24:00';
    }

    // Create input fields: text, data, time
    function _addInputFieldsToDom() {

        this.style.display = "none";
        timeInput.element.style.display = 'inline-block';
        dateInput.element.style.display = 'inline-block';        
        _setCurrentTimeToInputs();

        inputForm.element.style.display = 'inline-block';
        inputForm.element.value = '';
        acceptBtn.element.style.display = 'inline-block';
        
        if(btnAddTask.clickedLessThanOne) {
            labelInputForm.addToElement(inputWrapper);
            inputForm.addToElement(inputWrapper);
            labelDateInput.addToElement(inputWrapper);
            dateInput.addToElement(inputWrapper);
            timeInput.addToElement(inputWrapper);
            acceptBtn.addToElement(inputWrapper);
            mainContainer.insertBefore(inputWrapper.element, mainContainer.firstChild);
            btnAddTask.clickedLessThanOne = false;
        } else {
            labelInputForm.element.innerHTML = 'Enter the task title';
            labelDateInput.element.innerHTML = 'Choose date and time for a deadline';
            btnFilterDay.element.style.display = 'none';
            btnFilterWeek.element.style.display = 'none';
            btnFilterComplete.element.style.display = 'none';
        }
    }

    // Create task item, button-filters, buttons for task item
    function _addTaskToDom() {
        
        btnFilterComplete.element.style.display = 'inline-block';
        btnFilterDay.element.style.display = 'inline-block';
        btnFilterWeek.element.style.display = 'inline-block';

        if(inputForm.element.value) {
            console.log(dateInput);
            console.log(timeInput);
            taskCounter++;

            this.style.display = 'none';

            labelInputForm.element.style.display = 'none';
            labelInputForm.element.innerHTML = '';
            inputForm.element.style.display = 'none';
            labelDateInput.element.style.display = 'none';
            labelDateInput.element.innerHTML = '';
            dateInput.element.style.display = 'none';
            timeInput.element.style.display = 'none';

            var itemWrap = new Component('div','task-wrap');
            var closeBtn = new Component('button','btn btn-danger btn-task-cls','Delete Task','button');
            var itemText = new Component('p','task-text','Task Description \n');
            var completeBtn = new Component('button','btn btn-success btn-task-check','Check Complete','button');
            var notCompleteBtn = new Component('button','btn btn-warning btn-task-check','Check Not Complete','button');

            itemText.element.innerText += inputForm.element.value;
            closeBtn.addToElement(itemWrap);
            closeBtn.element.id = taskCounter;
            itemText.addToElement(itemWrap);
            completeBtn.addToElement(itemWrap);
            notCompleteBtn.addToElement(itemWrap);

            closeBtn.element.addEventListener('click', function(){
                this.parentElement.parentElement.remove();
                _clearFromLocalStorage.call(this);
            })

            completeBtn.element.addEventListener('click', function() {
                // if task has no color then add color and disable buttons
                if(this.parentElement.parentElement.style.background === '') {
                    this.parentElement.parentElement.style.background = COLOR_TASK_COMPLETE;
                    this.disabled = true;
                    this.nextSibling.disabled = true;
                }
            })
            
            notCompleteBtn.element.addEventListener('click', function() {
                // if task has no color then add color and disable buttons
                if(this.parentElement.parentElement.style.background === ''){
                    this.parentElement.parentElement.style.background = COLOR_TASK_NOT_COMPLETE;
                    this.disabled = true;
                    this.previousSibling.disabled = true;
                }
            })

            var listItem = new Component('li','list-group-item task-item');
            itemWrap.addToElement(listItem);
            listItem.addToElement(listTasks);
            listItem.element.id = 'task' + '-' + taskCounter;

            listTasks.addToElement(mainContainer);

            btnFilterComplete.addToElement(inputWrapper);
            btnFilterDay.addToElement(inputWrapper);
            btnFilterWeek.addToElement(inputWrapper);

            btnAddTask.element.style.display = 'inline-block';

            _deadLines(inputForm.element.value,dateInput.element.value,timeInput.element.value, taskCounter);


        } else {
            console.error('Write a task to do!');
        }             
    }

    // Start our application
    function _createInterface(){

        btnAddTask.addToElement(mainContainer);

        btnAddTask.element.onclick = function() { 
            _addInputFieldsToDom.call(this); 
        };

        acceptBtn.element.onclick = function () {
            _addTaskToDom.call(this);
        }
    }

    _createInterface();

    return obj;
}());


