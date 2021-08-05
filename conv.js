fetch('./personal_transactions.json')
.then( function(response){
  if (!response.ok){
    throw new Error(`HTTP error status: ${response.status}`)
  }
  return (response.json());
})
.then(data => {
  for (const item of data){
    let catName = item.Category;
    let expense = item.Description;
    let date = item.Date.split("/");
    date = date[2]+'-'+date[0]+'-'+date[1]
    let amount = item.Amount;
    addToDB(catName, expense, date, amount);
  }
})

