// Creating header for an api(i will call api what kind of data i will accept the data in Json format)

const options = {
    method: 'GET',
    headers: { 
        accept: 'application/json', 
        'x-cg-demo-api-key': 'CG-mDVVqLm5xBDjvcVq523LnAmB' 
    },
};


// State the variables
let coins=[];
let currentPage=1;
const fetchCoins = async (page = 1) => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${page}`, options);
        coins = await response.json();
    } catch (err) {
        console.error(err);
    }
    return coins;
};

// const getFavorites=()=> JSON.parse(localStorage.getItem('favorites') || []);
const getFavorites = () => {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
};


const renderCoinsRow=(coin,index,start,favorites)=>{
    const isFavorite=favorites.includes(coin.id);
    const row=document.createElement('tr');
    row.innerHTML = `
        <td>${start + index}</td>
        <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24" /></td>
        <td>${coin.name}</td>
        <td>$${coin.current_price.toLocaleString()}</td>
        <td>$${coin.total_volume.toLocaleString()}</td>
        <td>$${coin.market_cap.toLocaleString()}</td>
        <td>
            <i class="fas fa-star favorite-icon ${isFavorite ? 'favorite' : ''}" data-id="${coin.id}"></i>
        </td>
    `;
    return row;

}

// Class 2 fun
const renderCoins = (coinsToDisplay, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage + 1;
    const favorites = getFavorites();
    const tableBody = document.querySelector('#crypto-table tbody');

    console.log(tableBody);
    
    if (!tableBody) {
        console.error("Table body element not found!");
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows before rendering new data

    coinsToDisplay.forEach((coin, index) => {
        const row = renderCoinsRow(coin, index, start, favorites);
        tableBody.appendChild(row);
    });
};

const initializePage = async () => {
    coins = await fetchCoins(currentPage);
    
    if (coins.length === 0) {
        console.error("No coins data fetched!");
        return;
    }

    renderCoins(coins, currentPage, 25);
};
document.addEventListener('DOMContentLoaded', initializePage);
