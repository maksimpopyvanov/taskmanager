export default class Table {
    
    users = [];
    usersId = [];
    dates = [];
    tasks = [];
    actualDate = new Date();
    firstDateIndex = -3;
    idleTaskIndex = null;

    constructor(services) {
        this.services = services;
    }

    createTable = () => {
        this.services.getUsers()
            .then(users => {
                users.forEach(user => {
                    this.users.push(user);
                    this.usersId.push(user.id)
                });
                const wrapperTable = document.querySelector('.table');

                for (let i = 0; i < this.users.length; i++) { 
                    let userDiv = document.createElement('div');
                    userDiv.textContent = `${this.users[i].firstName}`;
                    userDiv.classList.add('user');
                    userDiv.dataset.userId = `${this.users[i].id}`
                    userDiv.style.gridRow = `${i+2}/${i+3}`;
                    wrapperTable.append(userDiv);
                }

                for (let i = 2; i < 9; i++) {

                    for (let k = 2; k < this.users.length + 2; k++) {
                        let wrapperTask = document.createElement('div');
                        wrapperTask.style.gridColumn = `${i}/${i+1}`;
                        wrapperTask.style.gridRow = `${k}/${k+1}`;
                        wrapperTask.classList.add('wrapper__task');
                        wrapperTask.dataset.cell = `c${i}_r${k}`;
                        wrapperTable.append(wrapperTask);
                    }

                }
                
                this.setData();
            });
    }

    setData = () => {

        const wrapperTable = document.querySelector('.table');

        for (let i = this.firstDateIndex; i < this.firstDateIndex + 7; i++) {
            let date = new Date(this.actualDate);
            let dateDiv = document.createElement('div');
            date.setDate(date.getDate() + i);
            dateDiv.textContent = `${date.getDate()}.${date.getMonth()+1}`;
            dateDiv.classList.add('date');
            dateDiv.dataset.dateIndex = `${i - this.firstDateIndex}`;
            dateDiv.style.gridColumn = `${i - this.firstDateIndex  + 2}/${i - this.firstDateIndex  + 3}`;
            wrapperTable.append(dateDiv);
            date = date.toISOString();
            date = date.slice(0, date.indexOf('T'));
            this.dates[i-this.firstDateIndex] = date;
        }

        this.services.getTasks()
            .then(tasks => {
                tasks.forEach(task => this.tasks.push(task));
                this.updateTaskDivs();
                this.updateUnaddressedTasks();
            });
        
    }

    updateTaskDivs = () => {
        const taskDivs = document.querySelectorAll('.task');
        taskDivs.forEach(task => task.remove());
        this.tasks.forEach(task => {
            let startDate = new Date(task.planStartDate);
            let endDate = new Date(task.planEndDate);
            startDate = startDate.toISOString();
            startDate = startDate.slice(0, startDate.indexOf('T'));

            if (this.usersId.indexOf(task.executor) >= 0 && this.dates.indexOf(startDate) >= 0) {
                let row = this.usersId.indexOf(task.executor) + 2;
                let column = this.dates.indexOf(startDate) + 2;
                let wrapperTask = document.querySelector(`[data-cell="c${column}_r${row}"]`);
                let taskDiv = document.createElement('div');
                taskDiv.classList.add('task');
                taskDiv.dataset.planEnd = `План завершения: ${task.planEndDate}`;
                let timeLeft = Math.floor((endDate - this.actualDate) / 1000 / 60 / 60);

                if (timeLeft < 0) {
                    timeLeft = 0;
                }
                
                taskDiv.textContent = `${task.subject} (${timeLeft}ч)`;
                wrapperTask.append(taskDiv);

            }

        });
    }

    updateUnaddressedTasks = () => {
        const backlog = document.querySelector('.backlog');
        const backlogTasks = document.querySelectorAll('.backlog__task');

        backlogTasks.forEach(task => {
            task.remove();
        });

        this.tasks.forEach(task => {
            if (task.executor == null) {
                
                let taskDiv = document.createElement('div');
                taskDiv.textContent = `${task.subject}`;
                taskDiv.classList.add('backlog__task');
                taskDiv.dataset.taskId = `${task.id}`;
                taskDiv.setAttribute("draggable", true);
                backlog.append(taskDiv);
                taskDiv.addEventListener('dragstart', (e) => {
                    this.idleTaskIndex = e.target.dataset.taskId;
                    setTimeout(() => {
                        e.target.classList.add('hide');
                    }, 0);
                });
                taskDiv.addEventListener('dragend', (e) => {
                    e.target.classList.remove('hide');
                    this.idleTaskIndex = null;
                    
                })
            }
        });

        const users = document.querySelectorAll('.user');
        users.forEach(user => {
            user.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            user.addEventListener('dragenter', (e) => {
                e.target.classList.add('hovered');
            })
            user.addEventListener('dragleave', (e) => {
                e.target.classList.remove('hovered');
            })
            user.addEventListener('drop', (e) => {
                const id = +user.dataset.userId;
                this.tasks.forEach(task => {

                   if (task.id == this.idleTaskIndex) {
                        task.executor = id;
                        this.updateTaskDivs();
                    }
                });
                const backlogTasks = document.querySelectorAll('.backlog__task');
                backlogTasks.forEach(task => {
                    if (task.dataset.taskId == `${this.idleTaskIndex}`) {
                        task.remove();
                    }
                });
                e.target.classList.remove('hovered');
            })
        });
        const wrapperTasks = document.querySelectorAll('.wrapper__task');
        wrapperTasks.forEach(wrapper => {
            wrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            wrapper.addEventListener('dragenter', (e) => {
                e.currentTarget.classList.add('hovered');
            })
            wrapper.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('hovered');
            })
            wrapper.addEventListener('drop', (e) => {
                let reg = /r/;
                const cell = e.currentTarget.dataset.cell;
                const indexOfUsersId = +cell.slice(cell.search(reg) + 1) - 2;
                reg = /_/;
                const indexOfDatesArr = +cell.slice(1, cell.search(reg)) - 2;
                this.usersId.forEach((id, i) => {
                    if(i == indexOfUsersId) {
                        this.tasks.forEach(task => {
                            if (task.id == this.idleTaskIndex) {
                                task.executor = id;
                            }
                        });
                    }
                });
                this.dates.forEach((date, i) => {
                    if (i == indexOfDatesArr) {
                        this.tasks.forEach(task => {
                            if (task.id == this.idleTaskIndex) {
                            task.planStartDate = date;
                            }
                        });
                    }
                });
                this.updateTaskDivs();
                const backlogTasks = document.querySelectorAll('.backlog__task');
                backlogTasks.forEach(task => {
                    if (task.dataset.taskId == `${this.idleTaskIndex}`) {
                        task.remove();
                    }
                });
                e.currentTarget.classList.remove('hovered');
            })
        });
    }
    
    updateDate = () => {
        
        for (let i = 0; i < 7; i++) {
            let date = new Date(this.actualDate);
            let dateDiv = document.querySelector(`[data-date-index="${i}"]`);
            date.setDate(this.actualDate.getDate() + this.firstDateIndex + i);
            dateDiv.textContent = `${date.getDate()}.${date.getMonth()+1}`;
            date = date.toISOString();
            date = date.slice(0, date.indexOf('T'));
            this.dates[i] = date;
            this.updateTaskDivs();
        }
    }
}