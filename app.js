//Tüm Elementleri Seçelim

const form = document.querySelector("#todoAddForm");
const addInput = document.querySelector("#todoName");
const todoList = document.querySelector(".list-group");
const firstCardBody = document.querySelectorAll(".card-body")[0];
const secondCardBody = document.querySelectorAll(".card-body")[1];
const clearButton = document.querySelector("#clearButton");
const filterInput = document.querySelector("#todoSearch");
const buttonCheck = document.querySelector(".checkButton");
const prioritySelect = document.querySelector("#todoPriority");
const container = document.querySelector(".container");


let todos = [];


runEvents();


function runEvents() {
    form.addEventListener("submit", addTodo);
    //sayfa yenilendiğinde metot çalıştırıp, oradan storage'taki todo'ları aldık
    document.addEventListener("DOMContentLoaded", pageLoaded);
    secondCardBody.addEventListener("click", removeTodo);
    clearButton.addEventListener("click", clearAllTodos);
    filterInput.addEventListener("keyup", filter);
    document.addEventListener("change", checkedTodo)
}

function addTodo(e) {
    const inputText = addInput.value.trim();
    const prioritySelect = document.querySelector("#todoPriority");

    if (inputText == null || inputText == "") {
        showAlert("warning", "Lütfen boş bırakmayınız.");
    } else {

        const newTodo = {
            id: Date.now(), // benzersiz ID
            text: inputText,
            completed: false,
            priority: prioritySelect.value || "Low"
        };

        //Arayüze todo eklemek için
        addTodoToUI(newTodo);

        //Storage'a todo eklemek için (sayfa yenilenince kaybolmasınlar diye)
        addTodoToStorage(newTodo);

        filterInput.disabled = false;
        if (prioritySelect) prioritySelect.value = "Low";

        //Başarılı olursa uyarı verelim
        showAlert("success", "Todo eklendi!");

    }

    e.preventDefault(); //submit farklı sayfaya göndermesin diye engelledik
}


function addTodoToUI(newTodo) {

    const priorityMap = {
        Low: {
            text: "Low Priority",
            color: "primary"
        },
        Medium: {
            text: "Medium Priority",
            color: "warning"
        },
        High: {
            text: "High Priority",
            color: "danger"
        }
    };

    const pr = priorityMap[newTodo.priority] || priorityMap["Low"];

    const addingTodo = `<li class="input-group mb-3" data-id="${newTodo.id}">
            <div class="input-group-prepend">
                <div class="input-group-text">
                    <input class="checkButton" type="checkbox" ${newTodo.completed ? 'checked' : ""}>
                </div>
            </div>

            <input type="text" class="listedtodo form-control" value="${newTodo.text}" disabled>
            <span style="width: 15%" class="badge badge-${pr.color} d-flex align-items-center justify-content-center mr-4">
          ${pr.text}
        </span>
        
            <div class="input-group-text">
                <a href="#" class="delete-item">
                    <i class="fa fa-remove"></i>
                </a>
            </div>
        </li>`;

    todoList.insertAdjacentHTML('beforeend', addingTodo);

    //checked işaretliyse:
    const li = todoList.lastElementChild;
    const input = li.querySelector(".listedtodo");
    if (newTodo.completed) {
        li.classList.add("completed-bg");
        input.classList.add("done");
    }

    //bir todo girildikten sonra inputu sıfırlamak için
    addInput.value = "";

}

function addTodoToStorage(newTodo) {

    //daha önceden todo var mı diye storage'ı kontrol etmek
    checkTodosFromStorage();

    //yeni todo'yu  ekleyip storage'a gömmek
    todos.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todos));

}

function checkTodosFromStorage() {

    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
}

//Dinamik olarak başarılı veya uyarı mesajını oluşturmak için
function showAlert(type, message) {

    const alert = `
        <div class="alert alert-${type} mt-3" role="alert">
        ${message}
        </div> `

    container.insertAdjacentHTML('beforeend', alert);

    const alertElem = container.lastElementChild;
    //1.5 saniye sonra uyarı kaybolsun diye
    setTimeout(function () {
        alertElem.remove();
    }, 1300);
}

function pageLoaded() {
    //önce var olan güncel todo'ları alalım check ile
    checkTodosFromStorage();
    todos.forEach(function (todo) {
        addTodoToUI(todo); //ve UI ya gönderelim
    });
    if (todos.length === 0) {
        disableInput();
    }
}

function removeTodo(e) {
    //basılan yerin çarpı olduğunu almak için
    if (e.target.className === "fa fa-remove") {

        const li = e.target.closest("li");
        const id = Number(li.dataset.id);
        li.remove();
        removeTodoFromStorage(id);

        showAlert("primary", "Todo başarıyla silindi.");

        if (todos.length === 0) {
            disableInput();
        }
    }
}

function removeTodoFromStorage(id) {
    checkTodosFromStorage(); //önce güncel değerleri aldık

    todos = todos.filter(todo => todo.id !== id);

    //güncel halini tekrar set edelim
    localStorage.setItem("todos", JSON.stringify(todos));
}

function clearAllTodos() {
    //tüm li'leri yani todoları almak için
    const todolistesi = document.querySelectorAll(".input-group");

    if (todolistesi.length > 0) {
        todolistesi.forEach(function (todo) {
            todo.remove(); //Ekrandan silme
        });

        //Storage'dan da silme
        todos = [];
        localStorage.setItem("todos", JSON.stringify(todos));

        showAlert("success", "Başarılı bir şekilde silindi.");

        if (todos.length === 0) {
            disableInput();
        }

    } else {
        showAlert("danger", "Silmek için en az bir todo olmaldıır.");
    }

}


function filter(e) {
    const filterValue = e.target.value.toLowerCase().trim();
    const todolistesi = document.querySelectorAll(".input-group");

    if (todolistesi.length > 0) {
        todolistesi.forEach(function (li) {

            const input = li.querySelector(".listedtodo");
            const todoText = input.value.toLowerCase();

            if (todoText.toLowerCase().trim().includes(filterValue)) {
                li.style.display = "flex";
            } else {
                li.style.display = "none";
            }
        });
    }
}

function disableInput() {
    filterInput.value = "";
    filterInput.disabled = true;
}

function checkedTodo(e) {
    if (e.target.classList.contains("checkButton")) {

        const li = e.target.closest("li");
        const input = li.querySelector(".listedtodo");
        const id = Number(li.dataset.id);


        input.classList.toggle("done", e.target.checked);
        input.classList.toggle("checked-animation", e.target.checked);
        //li.classList.toggle("completed-bg", e.target.checked);

        // Arka plan animasyonu
        // if (e.target.checked) {
        //     li.classList.add("completed-bg");
        //     setTimeout(() => {
        //         li.classList.add("checked-animation");
        //     }, 10); // CSS transition için minik gecikme
        // } else {
        //     li.classList.remove("completed-bg", "checked-animation");
        // }

        //storage'da güncellemek için
        const index = todos.findIndex(todo => todo.id === id);
        if (index > -1) {
            todos[index].completed = e.target.checked;
            localStorage.setItem("todos", JSON.stringify(todos));
        }


    }

}

const starryBg = document.querySelector('.starry-bg');
const numStars = 1000; // yıldız sayısı

for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 3 + 1; // 1px - 4px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    starryBg.appendChild(star);
}