let budgetController = ( () => {

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = parseFloat(value);
            this.sign = '+';
        }

        static ID = 0;
    }
    
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = parseFloat(value);
            this.sign = '-';
        }

        static ID = 0;
    }
            
    let data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0.00,
            exp: 0.00
        },
        percentage: 0
    };

    return {
        addItem: (type, desc, val) => {
            var newItem, ID;

            if (type === 'inc') {
                newItem = new Income(++budgetController.incomeID, desc, val);
            } else if (type === 'exp') {
                newItem = new Expense(++budgetController.expenseID, desc, val);
            }

            if (newItem) {
                data.allItems[type].push(newItem);
                data.totals[type] += parseFloat(newItem.value);
            }

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }

            return newItem;
        },
        incomeID: Income.ID,
        expenseID: Expense.ID,

        getBudget: () => {
            return {
                budget: data.totals.inc - data.totals.exp,
                incomes: data.totals.inc,
                expenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: (type, id) => {

            // Retorna um array com os ids dos elementos
            let ids = data.allItems[type].map((current) => {
                return current.id;
            });

            let index = ids.indexOf(id);
            
            if (index != -1) {
                // Atualiza o total
                data.totals[type] -= data.allItems[type][index].value;
                data.allItems[type].splice(index, 1);
            }
        },

        testing: () => {
            console.log(data);
            console.log(`Income totals: ${data.totals.inc}`);
            console.log(`Expense totals: ${data.totals.exp}`);
        }
    };
})();


let UIController = ( () => {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomesList: 'income__list',
        expensesList: 'expenses__list',
        incomesTotalClassName: 'budget__income--value',
        expensesTotalClassName: 'budget__expenses--value',
        budgetValueClassName: 'budget__value',
        expensesPctField: 'budget__expenses--percentage',
        containerClass: 'container'
    }

    let setDescriptionFocus = () => {
        document.querySelector(DOMstrings.inputType).focus();
    }

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        getDOMstrings: () => {
            return DOMstrings;
        },

        clearTotals: () => {
            let budgetVal = document.getElementsByClassName(DOMstrings.budgetValueClassName)[0];
            budgetVal.textContent = '+ 0.00';

            let incTotal = document.getElementsByClassName(DOMstrings.incomesTotalClassName)[0];
            incTotal.textContent = '+ 0.00';

            let expTotal = document.getElementsByClassName(DOMstrings.expensesTotalClassName)[0];
            expTotal.textContent = '- 0.00';

            let expPct = document.getElementsByClassName(DOMstrings.expensesPctField)[0];
            expPct.textContent = ' %';

            setDescriptionFocus();
        },

        addListItem: (item) => {
            let element, html, itemType;

            if (item.constructor.name === 'Income') {
                element = document.getElementsByClassName(DOMstrings.incomesList)[0];
                itemType = 'inc';
            } else if (item.constructor.name === 'Expense') {
                element = document.getElementsByClassName(DOMstrings.expensesList)[0];
                itemType = 'exp';
            }

            html = `<div class="item clearfix" id="${itemType}-${item.id}">\
                        <div class="item__description">${item.description}</div>\
                            <div class="right clearfix">\
                                <div class="item__value">${item.sign} ${item.value.toFixed(2)}
                                    </div>\
                                <div class="item__delete">\
                                <button class="item__delete--btn">\
                                <i class="ion-ios-close-outline"></i></button>\
                            </div>\
                        </div>\
                    </div>`;

            element.insertAdjacentHTML('beforeend', html);
            setDescriptionFocus();
        },

        deleteListItem: (selectorId) => {
            item = document.getElementById(selectorId);

            item.parentNode.removeChild(item);

            setDescriptionFocus();
        },

        displayBudget: (obj) => {
            
            document.getElementsByClassName(DOMstrings.incomesTotalClassName)[0]
                .textContent = `+ ${obj.incomes.toFixed(2)}`;
            document.getElementsByClassName(DOMstrings.expensesTotalClassName)[0]
                .textContent = `- ${obj.expenses.toFixed(2)}`;
            document.getElementsByClassName(DOMstrings.budgetValueClassName)[0]
                .textContent = `${obj.budget.toFixed(2)}`;
            if (obj.percentage > 0) {
                document.getElementsByClassName(DOMstrings.expensesPctField)[0]
                    .textContent = `${obj.percentage}%`;
                } else {
                    document.getElementsByClassName(DOMstrings.expensesPctField)[0]
                        .textContent = `--`;
                
            }
        },

        resetInput: () => {
            // Clear description input
            document.querySelector(DOMstrings.inputDescription).value = '';

            // Clear value input
            document.querySelector(DOMstrings.inputValue).value = '';
        }
    }
})();

let controller = ( (budgetCtrl, UICtrl) => {

    let setupEventListeners = () => {
        let DOMstr = UICtrl.getDOMstrings();

        document.querySelector(DOMstr.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', (event) => {
            // By pressing 'ENTER', the value is added
            if (event.keyCode === 13 && event.which === 13) {
                ctrlAddItem();
            }
        });

        document.getElementsByClassName(DOMstr.containerClass)[0]
            .addEventListener('click', ctrlDeleteItem);
    };
    
    let ctrlAddItem = () => {
        let input, newItem, budget;

        // 1. Get field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add it to the bugdet controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // 3. Add it to the UI
            UICtrl.addListItem(newItem);
            UICtrl.resetInput();
    
            // 4. Calculate budget
            updateBudget();
        }

    };

    let updateBudget = () => {
        // 4. Calculate the budget
        budget = budgetController.getBudget();

        // 5. Display the budget
        UICtrl.displayBudget(budget);
    };

    let ctrlDeleteItem = (event) => {
        let itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            // 1. delete the item from the intrastructure
            budgetController.deleteItem(type, id);
            
            // 2. delete from the UI
            UIController.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();
        }

    };

    return {
        init: () => {
            console.log('Application started.');
            setupEventListeners();
            UICtrl.clearTotals();
        }
    }
    

})(budgetController, UIController);

controller.init();