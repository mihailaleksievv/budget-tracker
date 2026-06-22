// ---------- DATA STORAGE (Array) ----------
let transactions = [];   // each object: { id, name, amount, type, category }

// ---------- DOM elements ----------
const balanceSpan = document.getElementById('totalBalanceDisplay');
const totalIncomeSpan = document.getElementById('totalIncomeDisplay');
const totalExpenseSpan = document.getElementById('totalExpenseDisplay');
const transactionsContainer = document.getElementById('transactionsList');
const itemCountSpan = document.getElementById('itemCount');

// input fields
const txNameInput = document.getElementById('txName');
const txAmountInput = document.getElementById('txAmount');
const txTypeSelect = document.getElementById('txType');
const txCategoryInput = document.getElementById('txCategory');
const addBtn = document.getElementById('addBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// filter state
let currentFilter = 'all';   // 'all', 'income', 'expense'

// helper: format currency
function formatMoney(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

// calculate totals (balance, totalIncome, totalExpense)
function calculateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;
    // using for loop (flow control)
    for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        if (tx.type === 'income') {
            totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
            totalExpense += tx.amount;
        }
    }
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
}

// update UI summary (balance, income, expense)
function updateSummary() {
    const { totalIncome, totalExpense, balance } = calculateTotals();
    balanceSpan.innerText = formatMoney(balance);
    totalIncomeSpan.innerText = formatMoney(totalIncome);
    totalExpenseSpan.innerText = formatMoney(totalExpense);
}

// render transaction list depending on current filter (DOM manipulation)
function renderTransactions() {
    // clear container
    transactionsContainer.innerHTML = '';

    // filter array based on currentFilter (using array filter method)
    let filteredTransactions = [];
    if (currentFilter === 'all') {
        filteredTransactions = transactions.slice(); // copy all
    } else if (currentFilter === 'income') {
        filteredTransactions = transactions.filter(tx => tx.type === 'income');
    } else if (currentFilter === 'expense') {
        filteredTransactions = transactions.filter(tx => tx.type === 'expense');
    }

    // update item count
    itemCountSpan.innerText = filteredTransactions.length + (filteredTransactions.length === 1 ? ' item' : ' items');

    // if no transactions, show placeholder
    if (filteredTransactions.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        emptyDiv.innerText = currentFilter === 'all' ? '📭 No transactions yet. Add one above!' : `😶 No ${currentFilter} transactions found.`;
        transactionsContainer.appendChild(emptyDiv);
        return;
    }

    // looping through filtered array to generate elements (for-of loop)
    for (const tx of filteredTransactions) {
        const transactionDiv = document.createElement('div');
        transactionDiv.className = `transaction-item ${tx.type === 'income' ? 'transaction-income' : 'transaction-expense'}`;
        transactionDiv.setAttribute('data-id', tx.id);

        // left side details
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'tx-details';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'tx-name';
        nameSpan.innerText = tx.name;

        const categorySpan = document.createElement('div');
        categorySpan.className = 'tx-category editable';
        categorySpan.innerText = tx.category && tx.category.trim() !== '' ? tx.category : (tx.type === 'income' ? 'Income' : 'Expense');
        categorySpan.title = 'Click to edit category';
        categorySpan.addEventListener('click', () => {
            editTransactionCategory(tx.id);
        });

        detailsDiv.appendChild(nameSpan);
        detailsDiv.appendChild(categorySpan);

        // amount + delete btn
        const rightWrapper = document.createElement('div');
        rightWrapper.style.display = 'flex';
        rightWrapper.style.alignItems = 'center';
        rightWrapper.style.gap = '12px';

        const amountSpan = document.createElement('div');
        amountSpan.className = `tx-amount editable ${tx.type === 'income' ? 'income-amount' : 'expense-amount'}`;
        const sign = tx.type === 'income' ? '+' : '-';
        amountSpan.innerHTML = `${sign} ${formatMoney(tx.amount)} <span class="edit-pencil" aria-hidden="true">✏️</span>`;
        amountSpan.title = 'Click to edit amount';
        amountSpan.addEventListener('click', () => {
            editTransactionAmount(tx.id);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '✖️';
        deleteBtn.setAttribute('aria-label', 'Delete transaction');
        // attach event listener to delete specific transaction
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteTransactionById(tx.id);
        });

        rightWrapper.appendChild(amountSpan);
        rightWrapper.appendChild(deleteBtn);
        transactionDiv.appendChild(detailsDiv);
        transactionDiv.appendChild(rightWrapper);
        transactionsContainer.appendChild(transactionDiv);
    }
}

// edit only the category for a transaction
function editTransactionCategory(id) {
    const tx = transactions.find(item => item.id === id);
    if (!tx) return;

    const newCategory = prompt('Enter a new category for this transaction:', tx.category);
    if (newCategory === null) return; // user cancelled

    const trimmedCategory = newCategory.trim();
    tx.category = trimmedCategory !== '' ? trimmedCategory : (tx.type === 'income' ? 'General Income' : 'General Expense');
    renderTransactions();
}

// edit only the amount for a transaction
function editTransactionAmount(id) {
    const tx = transactions.find(item => item.id === id);
    if (!tx) return;

    const newAmountRaw = prompt('Enter a new amount for this transaction:', tx.amount.toFixed(2));
    if (newAmountRaw === null) return; // user cancelled

    const newAmount = parseFloat(newAmountRaw.trim());
    if (isNaN(newAmount) || newAmount <= 0) {
        alert('❌ Please enter a valid positive amount.');
        return;
    }

    tx.amount = newAmount;
    updateSummary();
    renderTransactions();
}

// delete transaction by ID (array manipulation + re-render)
function deleteTransactionById(id) {
    // find index using standard loop
    let indexToDelete = -1;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            indexToDelete = i;
            break;
        }
    }
    if (indexToDelete !== -1) {
        transactions.splice(indexToDelete, 1);   // remove from array
        updateSummary();
        renderTransactions();     // refresh list under current filter
    }
}

// delete all transactions (reset array)
function deleteAllTransactions() {
    if (transactions.length === 0) return;
    const userConfirm = confirm('⚠️ Are you sure you want to delete ALL transactions? This action cannot be undone.');
    if (userConfirm) {
        transactions = [];    // reset array
        updateSummary();
        renderTransactions();
    }
}

// add new transaction (validation, push to array)
function addTransaction() {
    // get values
    let name = txNameInput.value.trim();
    let amountRaw = txAmountInput.value.trim();
    let type = txTypeSelect.value;
    let category = txCategoryInput.value.trim();

    // validation with if/else flow control
    if (name === "") {
        alert("❌ Please enter a description (e.g., 'Groceries', 'Salary')");
        return;
    }
    if (amountRaw === "") {
        alert("❌ Please enter an amount.");
        return;
    }
    let amount = parseFloat(amountRaw);
    if (isNaN(amount) || amount <= 0) {
        alert("❌ Amount must be a positive number greater than zero.");
        return;
    }
    if (category === "") {
        // default category based on type
        category = type === 'income' ? 'General Income' : 'General Expense';
    }

    // create transaction object
    const newTransaction = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: name,
        amount: amount,
        type: type,
        category: category
    };

    transactions.push(newTransaction);   // add to array

    // clear input fields
    txNameInput.value = '';
    txAmountInput.value = '';
    txCategoryInput.value = '';
    txTypeSelect.value = 'expense';

    // update UI totals and re-render with current filter
    updateSummary();
    renderTransactions();
}

// change active filter style and re-render
function setFilter(filterType) {
    currentFilter = filterType;
    // update active class on buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    for (let btn of filterBtns) {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
    renderTransactions();
}

// load sample data to demonstrate functionality
function loadSampleData() {
    if (transactions.length === 0) {
        const sample = [
            { id: 1001, name: "Freelance Project", amount: 850.00, type: "income", category: "Work" },
            { id: 1002, name: "Grocery Shopping", amount: 125.40, type: "expense", category: "Food" },
            { id: 1003, name: "Netflix Subscription", amount: 15.99, type: "expense", category: "Entertainment" },
            { id: 1004, name: "Salary Deposit", amount: 2450.00, type: "income", category: "Job" },
            { id: 1005, name: "Dinner out", amount: 48.70, type: "expense", category: "Restaurant" }
        ];
        for (let i = 0; i < sample.length; i++) {
            transactions.push(sample[i]);
        }
        updateSummary();
        renderTransactions();
    }
}

// EVENT LISTENERS
addBtn.addEventListener('click', addTransaction);
deleteAllBtn.addEventListener('click', deleteAllTransactions);

// filter buttons events
const filterButtons = document.querySelectorAll('.filter-btn');
for (let btn of filterButtons) {
    btn.addEventListener('click', (e) => {
        const filterValue = btn.getAttribute('data-filter');
        setFilter(filterValue);
    });
}

// allow pressing "Enter" on any input to add quickly
const inputsForEnter = [txNameInput, txAmountInput, txCategoryInput];
for (let input of inputsForEnter) {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTransaction();
        }
    });
}

// Initialize with sample data
loadSampleData();