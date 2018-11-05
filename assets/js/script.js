/*
** Created By Arijit Roy Chowdhury
** Date 5/11/2018
*/



//Budget Controller
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentages = function(totalInc) {

    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    }else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function() {
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current, index, arr) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percent: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, Id;

      //Create new ID
      if(data.allItems[type].length > 0) {
        Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }else {Id = 0;}

      //Create new Item based on Income or Expension
      if(type === 'exp') {
        newItem = new Expense(Id, des, val);
      }
      else if(type === 'inc') {
        newItem = new Income(Id, des, val);
      }

      //Push it into data structure
      data.allItems[type].push(newItem);

      //Return the New Item
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
       return current.id;
      });

      index = ids.indexOf(id);
      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {

      //1. Calculate total income & expenses
      calculateTotal('inc');
      calculateTotal('exp');

      //2. Calculate the Budget: (Income - Expense)
      data.budget = data.totals.inc - data.totals.exp;

      //3. Calculate the percentage of income that we spent
      if(data.totals.inc > 0) {
          data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
      }else {
        data.percent = -1;
      }
    },

    calculatePercentages: function() {

      //1. Calculate Expense percentages
      data.allItems.exp.forEach(function(current) {
        current.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function() {

      var percentages = data.allItems.exp.map(function(current) {
        return current.getPercentages();
      });
      return percentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percent: data.percent
      };
    },

    test: function() {
      return data;
    }
  };

})();



//**************************************************************************************************//


//UI Controller
var uiController = (function() {

  var DOMstrings = {
    inputType        : '.add__type',
    inputDescription : '.add__description',
    inputValue       : '.add__value',
    inputButton      : '.add__btn',
    incContainer     : '.income__list',
    expContainer     : '.expenses__list',
    budgetLabel      : '.budget__value',
    incomeLabel      : '.budget__income--value',
    expenseLabel     : '.budget__expenses--value',
    percentLabel     : '.budget__expenses--percentage',
    container        : '.container',
    expPercentLabel  : '.item__percentage',
    monthLabel       : '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, newNum;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    int = parseInt(numSplit[0]);
    dec = numSplit[1].toString();

    int = int.toLocaleString('en-IN');
    newNum = int + '.' + dec;

    return (type === 'exp' ? '-' : '+') + ' ' + newNum;
  };

  var nodeListForEach = function(list, callback) {
    for(var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      ///1. Create HTML string with placeholder text
      if(type === 'inc') {
        element = DOMstrings.incContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }else if(type === 'exp') {
        element = DOMstrings.expContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      ///2. Replace the placeholder text with actual date
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      ///3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId) {
      var element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);

    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, arr) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {

      if(obj.budget >= 0) {
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, 'inc');
      }else {
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, 'exp');
      }

      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percent > 0) {
        document.querySelector(DOMstrings.percentLabel).textContent = obj.percent + '%';
      }else {
        document.querySelector(DOMstrings.percentLabel).textContent = '--%';
      }
    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expPercentLabel);

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        }else {
          current.textContent = '--%';
        }
      });

    },

    displayMonth: function() {

      var now, year, month, months;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ', ' + year;
    },

    changeType: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

        nodeListForEach(fields, function(current) {
          current.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputButton).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


//**************************************************************************************************//


//Global Controller
var controller = (function(budgetCtrl, uiCtrl) {

  var setupEventListeners = function() {
    var DOM = uiCtrl.getDOMstrings();
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItems);

    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItems();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
  };


  var updateBudget = function() {
    //// TODO:
    ///1. Calculate the Budget
    budgetCtrl.calculateBudget();

    ///2. Return the Budget
    var budget = budgetCtrl.getBudget();

    ///3. Display the Budget on UI
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    var percentages;
    ////TODO:
    //1. Calculate Parcentages
    budgetCtrl.calculatePercentages();

    //2. Get percentages from Budget controller
    percentages = budgetCtrl.getPercentages();

    //3. Update percentages in UI
    uiCtrl.displayPercentages(percentages);
  };


  var ctrlAddItems = function() {

    var input, item;
    //// TODO:
    ///1. Get all the Field input data
    input = uiCtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

      ///2. Add Items to the Budget controller
      item = budgetCtrl.addItem(input.type, input.description, input. value);
      //console.log(item);

      ///3. Add Item to UI
      uiCtrl.addListItem(item, input.type);

      ///4. Clear the fields
      uiCtrl.clearFields();

      ///5. Calculate and Update Budget
      updateBudget();

      //6. Calculate and Update Percentages in all expense
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {

    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);
      ////TODO:
      ///1.Delete item from data structure
      budgetCtrl.deleteItem(type, id);

      ///2.Delete item from UI
      uiCtrl.deleteListItem(itemID);

      ///3.Calculate and Update Budget
      updateBudget();

      //4. Calculate and Update Percentages in all expense
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('App Started');
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percent: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, uiController);


controller.init();
