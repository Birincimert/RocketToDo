//Tüm Elementleri Seçelim

const form = document.querySelector("#todoAddForm");
const addInput = document.querySelector("#todoName");
const todoList = document.querySelector(".list-group");
const firstCardBody = document.querySelectorAll(".card-body")[0];
const secondCardBody = document.querySelectorAll(".card-body")[1];
const clearButton = document.querySelector("#clearButton");
const filterInput = document.querySelector("#todoSearch");

let todos = [];

runEvents();

function runEvents() {
    form.addEventListener("submit", addTodo);
    //sayfa yenilendiğinde metot çalıştırıp, oradan storage'taki todo'ları aldık
    document.addEventListener("DOMContentLoaded", pageLoaded);
    secondCardBody.addEventListener("click", removeTodo);
    clearButton.addEventListener("click", ClearAllTodos);
    filterInput.addEventListener("keyup", filter);
}

function addTodo(e) {
    const inputText = addInput.value.trim();
    if (inputText == null || inputText == "") {
        showAlert("warning", "Lütfen boş bırakmayınız.");
    } else {
        //Arayüze todo eklemek için
        addTodoToUI(inputText);

        //Storage'a todo eklemek için (sayfa yenilenince kaybolmasınlar diye)
        addTodoToStorage(inputText);

        filterInput.disabled = false;

        //Başarılı olursa uyarı verelim
        showAlert("success", "Todo eklendi!");

    }

    e.preventDefault(); //submit farklı sayfaya göndermesin diye engelledik
}


function addTodoToUI(newTodo) {
    /* 
        <li class="list-group-item d-flex justify-content-between">Todo 1
            <a href="#" class="delete-item">
                <i class="fa fa-remove"></i>
            </a>
         </li> 
    */

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between";
    li.textContent = newTodo;

    const a = document.createElement("a");
    a.href = "#";
    a.className = "delete-item";

    const i = document.createElement("i");
    i.className = "fa fa-remove";

    //hiyerarşik olarak ekliyoruz
    a.appendChild(i);
    li.appendChild(a);
    todoList.appendChild(li);

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

    //     <div class="alert alert-success" role="alert">
    //     This is a success alert—check it out!
    //     </div>

    const div = document.createElement("div");
    //div.className = "alert alert-" + type;
    div.className = `alert alert-${type}`; //literal template ile class verdik
    div.textContent = message;

    //first card-body'in sonuna attık
    firstCardBody.appendChild(div);

    //1.5 saniye sonra uyarı kaybolsun diye
    setTimeout(function () {
        div.remove();
    }, 1500);
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

        //i'nin parent'ı a idi onun da parent'ı li idi biz de todo yu silmek için 
        //list item'dan kaldırırız
        const todo = e.target.parentElement.parentElement;
        todo.remove(); //ekrandan silindi

        //Storage'dan silme
        removeTodoFromStorage(todo.textContent);

        showAlert("primary", "Todo başarıyla silindi.");

        if (todos.length === 0) {
            disableInput();
        }
    }
}

function removeTodoFromStorage(removeTodo) {
    checkTodosFromStorage(); //önce güncel değerleri aldık
    todos.forEach(function (todo, index) {
        if (removeTodo === todo) { //foreach ile dönüp verilen index'teki
            todos.splice(index, 1); //' todo'yu silmiş olduk.
        }
    });
    //güncel halini tekrar set edelim
    localStorage.setItem("todos", JSON.stringify(todos));
}

function ClearAllTodos() {
    //tüm li'leri yani todoları almak için
    const todolistesi = document.querySelectorAll(".list-group-item");

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
    const todolistesi = document.querySelectorAll(".list-group-item");
    console.log(todolistesi);

    if (todolistesi.length > 0) {
        todolistesi.forEach(function (todo) {
            if (todo.textContent.toLowerCase().trim().includes(filterValue)) {
                todo.setAttribute("style", "display: block");
            } else {
                todo.setAttribute("style", "display: none !important");
            }
        });
    }
}

function disableInput() {
    filterInput.value = "";
    filterInput.disabled = true;
}