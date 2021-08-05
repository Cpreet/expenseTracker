const categoryContainer = document.querySelector("#categoryContainer");
const categoryTpl = document.body.querySelector("#category");
const createCategoryDialog = document.body.querySelector("#newCategory");
const createCategoryBtn = document.body.querySelector("#saveCategory");

const createExpenseDialog = document.body.querySelector("#newExpense");
const expenseTpl = document.body.querySelector("#expense");
const createExpenseBtn = document.body.querySelector("#saveExpense");


let expensedb;
let dbObject= {};

window.onload = function() {
  let request = window.indexedDB.open('expensedDB', 1);
  
  request.onerror = function () {
    console.log('Database threw an error');
  };

  request.onsuccess = function () {
    console.log('Database Opened')

    expensedb = request.result;
    
    readFromDB();
  };

  request.onupgradeneeded = function(e) {
    let expensedb = e.target.result;

    let objectStore = expensedb.createObjectStore('expense_os',{ keyPath: 'id', autoIncrement:true });

    objectStore.createIndex('category', 'category', { unique: false });
    objectStore.createIndex('expense', 'expense', { unique: false });
    objectStore.createIndex('date', 'date', {unique: false});
    objectStore.createIndex('amount', 'amount', {unique: false});

    console.log('Database setup complete');

  };
};


function addToDB(cat, exp, dt, amt){
  let newEntry = { category:  cat, expense: exp, date: dt, amount: amt };

  let transaction = expensedb.transaction(['expense_os'], 'readwrite');
  let objectStore = transaction.objectStore('expense_os');

  let request = objectStore.add(newEntry);

  request.onsuccess = function () {
    console.log('stored in objectStore');
  };

  transaction.oncomplete = function () {
    console.log('database Updated');
  };

  transaction.onerror = function () {
    console.log('Transaction not opened due to error');
  };
};


// uncomment code for loading dummy data
/*
fetch('./personal_transactions.json')
.then( function(response){
  if (!response.ok){
    throw new Error(`HTTP error status: ${response.status}`)
  }
  return (response.json());
})
.then(data => {
  for (const item of data){
    if (item["Trasaction Type"] == "credit"){
      console.log("credit");
    }else{
      let catName = item.Category;
      let expense = item.Description;
      let date = item.Date.split("/");
      date = date[2]+'-'+date[0]+'-'+date[1]
      let amount = item.Amount;
      addToDB(catName, expense, date, amount);
    }
  }
});
*/

function readFromDB() {
  let objectStore = expensedb.transaction('expense_os').objectStore('expense_os');

  objectStore.openCursor().onsuccess = function(e) {

    let cursor = e.target.result;

    if(cursor) { 
//      console.log(cursor.value);
      let catName = cursor.value.category;
      let expense = cursor.value.expense;
      let date = cursor.value.date;
      let amount = cursor.value.amount;
      let clone = expenseTpl.content.cloneNode('True');
      if (document.querySelector('#cat-' + catName.split(' ').join('-'))){

	  clone.querySelector('p').innerHTML = expense;
	  clone.querySelector('.badge').innerHTML = "&#8377; " + amount;
	  clone.querySelector('.dt').innerHTML = "Date: " + date;
	  dbObject[catName].push({
	    expense: expense,
	    date: date,
	    amount: amount,
	  });
	  document.querySelector('#cat-' + catName.split(' ').join('-')).querySelector('ul').appendChild(clone)

      }else{
	  let nameVal = catName.split(' ').join('-');
	  let clone = categoryTpl.content.cloneNode('True');
	  clone.querySelector('a').id = 'cat-' + nameVal; 
  	  clone.querySelector('h5').innerHTML = catName;
  	  clone.querySelector('.list-group-flush').id = 'cat-' + nameVal + '-List';
  	  clone.querySelector('a').href = "#collapse" + nameVal;
  	  clone.querySelector('.collapse').id = "collapse" + nameVal;
  	  categoryContainer.appendChild(clone);
  	  clone = expenseTpl.content.cloneNode('True');
  	  clone.querySelector('p').innerHTML = expense;
  	  clone.querySelector('.badge').innerHTML = "&#8377; " + amount;
  	  clone.querySelector('.dt').innerHTML = "Date: " + date;
	  dbObject[catName] = [{
	    expense: expense,
	    date: date,
	    amount: amount,
	  }];
	  document.querySelector('#cat-' + catName.split(' ').join('-')).querySelector('ul').appendChild(clone)

      }
      
      cursor.continue();
    
    }else{
      console.log("all done");
      console.log("making Chart");
      makeChartData();
      console.log("made Chart");
    }
  };
};


createCategoryBtn.onclick = function saveCategory(){
  let name = createCategoryDialog.querySelector("#categoryName").value;
  let nameVal = name.split(' ').join('-')
  let clone = categoryTpl.content.cloneNode('True');
  clone.querySelector('a').id = 'cat-' + nameVal; 
  clone.querySelector('h5').innerHTML = name;
  clone.querySelector('.list-group-flush').id = 'cat-' + nameVal + '-List';
  clone.querySelector('a').href = "#collapse" + nameVal;
  clone.querySelector('.collapse').id = "collapse" + nameVal;
  categoryContainer.appendChild(clone);
};

createExpenseBtn.onclick = function saveExpense(){
  let catName = createExpenseDialog.querySelector("#expenseCategoryName").value;
  let expense = createExpenseDialog.querySelector("#expenseName").value;
  let date = createExpenseDialog.querySelector("#expenseDate").value;
  let amt = createExpenseDialog.querySelector("#expenseAmount").value;
  let clone = expenseTpl.content.cloneNode('True');
  clone.querySelector('p').innerHTML = expense;
  clone.querySelector('.badge').innerHTML = "&#8377; " + amt;
  clone.querySelector('.dt').innerHTML = "Date: " + date;
  addToDB(catName, expense, date, amt);
  let expenseContainer = document.querySelector('#cat-'+catName.split(' ').join('-'));
  expenseContainer.querySelector('ul').appendChild(clone)
};

function makeChartData(){
  let labels = Object.keys(dbObject);

  let data = {
    labels: labels,
    datasets: [{
      label: 'spending per category',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
    }],
  };

  for (let category of labels){
    let total = 0;
    for (let item of dbObject[category]){
      total += parseFloat(item.amount)
    }
    data.datasets[0].data.push(total)
  }

  let config = {
    type: 'bar',
    data: data,
    options:{
      scales: {
	y: {
	  beginAtZero: true,
	}
      }
    },
  };
  var myChart = new Chart(
    document.getElementById('mychart'),
    config,
  );
};

/*
const labels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
];

const data = {
  labels: labels,
  datasets: [{
     label: 'My First dataset',
     backgroundColor: 'rgb(255, 99, 132)',
     borderColor: 'rgb(255, 99, 132)',
     data: [0, 10, 5, 2, 20, 30, 45],
   }]
};

const config = {
  type: 'line',
  data,
  options: {}
};

const data2 = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};

const config2 = {
  type: 'doughnut',
  data: data2,
}

const data3 = {
  labels: [
    'cat1',
    'cat2',
    'cat3',
    'cat4',
    'cat5',
  ],
  datasets: [{
    label: 'Another Database',
    data: [20, 40, 60, 80, 100],
    fill: true,
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgb(255, 99, 132)',
    pointBackgroundColor: 'rgb(255, 99, 132)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(255, 99, 132)'
  }]
};

const config3 = {
  type: 'radar',
  data: data3,
};

var myChart = new Chart(
  document.getElementById('mychart'),
  config,
);

var myChart2 = new Chart(
  document.getElementById('mychart2'),
  config2,
);

var myChart3 = new Chart(
  document.getElementById('mychart3'),
  config3,
);*/
