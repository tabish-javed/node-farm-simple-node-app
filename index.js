// internal imports

// [COMMON-JS IMPORTS]
// const fs = require('node:fs');
// const http = require('node:http');
// const url = require('node:url');

// [ES6 IMPORTS]
import fs from 'node:fs';
import http from 'node:http';
import url from 'node:url';


// external imports
// const { replaceTemplate } = require('./modules/replaceTemplate');
import { replaceTemplate } from './modules/replaceTemplate.js';


// FILE
//////////////////////////////////////

/* // BLOCKING, SYNCHRONOUS WAY ----
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File written successfully!'); */

/* // NON-BLOCKING, ASYNCHRONOUS WAY ----
fs.readFile('./txt/start.txt', 'utf-8', (error, data1) => {
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (error, data2) => {
        console.log(data2);
        fs.readFile('./txt/append.txt', 'utf-8', (error, data3) => {
            console.log(data3);
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', error => {
                console.log('Your file has been written.');
            });
        });
    });
});

console.log('Will read file...'); */

// WEB/API SERVER----
//////////////////////////////////////


// reading file from disk first so that it stays in memory and can be send frequently as response without reading from disk again and again.
const templateOverview = fs.readFileSync(`./templates/template-overview.html`, 'utf-8');
const templateCard = fs.readFileSync(`./templates/template-card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`./templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`./dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);
// console.log(dataObject);


// create a server for listening incoming requests using http module
const server = http.createServer((request, response) => {
    // JONAS CODE
    // console.log(request.url);
    // console.log(url.parse(request.url, true));

    const { query: { id: productID }, pathname: pathName } = url.parse(request.url, true);

    // MY CODE
    // const incomingURL = new URL(request.url, `https://${request.headers.host}`);
    // const pathName = incomingURL.pathname;
    // const productID = incomingURL.searchParams.get('id');


    // creating very easy and simple routes using if/else statements
    if (pathName === '/' || pathName === '/overview') {
        // overview page
        const cardsHtml = dataObject.map(element => replaceTemplate(templateCard, element)).join('');
        const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(output);
    } else if (pathName === '/product') {
        // product page
        const product = dataObject[productID];
        const output = replaceTemplate(templateProduct, product);

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(output);

    } else if (pathName === '/api') {
        // API
        // sending data (from file) as response which we already had on top level code
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(data);

    } else {
        // not found
        response.writeHead(404, {
            'Content-Type': 'text/html',
            'my-own-header': 'hello-world'
        });
        response.end('<h2>Page not found!</h2>');
    }
});


// start server using specific port on a TCP address (in this case it is localhost)
server.listen(3000, '127.0.0.1', () => {
    console.log('Listening to request on port 3000');
});
