import Table from './core';
import Services from './services';

const table = new Table(new Services);
table.createTable();
const left = document.querySelector('.left');
const right = document.querySelector('.right');

left.addEventListener('click', () => {
    table.firstDateIndex -= 7;
    table.updateDate();
});

right.addEventListener('click', () => {
    table.firstDateIndex += 7;
    table.updateDate();
});