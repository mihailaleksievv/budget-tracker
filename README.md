# Smart Budget Tracker

A lightweight budget tracker web app for adding income and expense entries, viewing summary totals, filtering transactions, and managing your money with a clean interface.

## Features

- Add income and expense transactions with description, amount, and category
- View current balance, total income, and total expenses
- Filter transactions by all, income, or expense
- Edit transaction amount and category directly from the list
- Delete individual transactions or clear all entries at once

## Files

- `index.html` — app structure and interface
- `styles.css` — responsive visual design and layout
- `script.js` — transaction logic, summary calculations, and DOM rendering

## Usage

1. Open `index.html` in any modern browser.
2. Enter a transaction description.
3. Add an amount and select `Income` or `Expense`.
4. Optionally provide a category.
5. Click `Add transaction` to update the tracker.
6. Use the filter buttons to view all entries, only income, or only expenses.
7. Click the delete icon to remove a transaction or `Delete all transactions` to clear the list.

## Notes

- All calculations are performed in-browser using JavaScript.
- Data is not persisted across page reloads.
- The app uses a simple array to store transactions during the current session.

## License

This project is available under the MIT License.

