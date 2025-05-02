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
const itemsPerPage=25;
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

// Save favorites to local Storage
const saveFavorites=(favorites)=> localStorage.setItem('favorites',JSON.stringify(favorites));

//Toggle the favorite status
const toggleFavorites=(coinId)=>{
    const favorites=getFavorites();
    if(favorites.includes(coinId)){
        favorites=favorites.filter(id=> id!==coinId);    
    }else{
        favorites.push(coinId);

    }
    saveFavorites(favorites)
    return favorites;
}

const handleFavoriteClick  = (coinId,iconElement) =>{
    const favorites = toggleFavorites(coinId);
    iconElement.classList.toggle('favorite', favorites.includes(coinId));
}

document.addEventListener('click',(event)=>{
    if(event.target.classList.contains('favorite-icon')){
        event.stopPropagation();
        const coinId = event.target.dataset.id;
        handleFavoriteClick(coinId,event.target);
    }

    const row = event.target.closest('.coin-row');
    if(row && !event.target.classList.contains('favorite-icon')){
        const coinId = row.getAttribute('data-id');
        window.location.href = `coin.html?id-${coinId}`;
    }

})  
// pagination function
const updatePaginationControls=()=>{
    document.querySelector('#prev-button').disabled = currentPage === 1;
    document.querySelector('#next-button').disabled = coins.length<itemsPerPage;
}

//prev button pagination logic
const handlePrevButtonClick=async()=>{
    if(currentPage > 1){
        currentPage--;
        coins = await fetchCoins(currentPage);
        renderCoins(coins, currentPage, itemsPerPage);
        updatePaginationControls();
    }
}

//next button pagination logic

const handleNextButtonClick=async()=>{
    currentPage++;
    coins = await fetchCoins(currentPage);
    renderCoins(coins, currentPage, itemsPerPage);
    updatePaginationControls();
}

// event listener for pagination buttons
if(document.querySelector('#prev-button') && document.querySelector('#next-button')){
document.querySelector('#prev-button').addEventListener('click',handlePrevButtonClick);
document.querySelector('#next-button').addEventListener('click',handleNextButtonClick);
}


// Debounce function to limit the rate of function execution
let debounceTimeout;
const debounce = (func, delay) => {
    clearTimeout(debounceTimeout);
    debounceTimeout=setTimeout(func, delay);
}

// fetch search result from Api
const fetchSearchResult = async (query) => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`, options);
        const data= await response.json();
        return data.coins;
    } catch (err) {
        console.error("Error Fetching search result",err);
        return []
    }
};

// Show search result result in the dialog box
const showSearchResult= (results)=>{
    const searchDialog = document.querySelector('#search-dialog');
    const resultList=document.querySelector('#search-results');

    resultList.innerHTML ='';

    if(results.length !==0){
        results.slice(0,10).forEach(result=>{
            const listItem=document.createElement('li')
            listItem.innerHTML=`
                <img src="${result.thumb}" alt="${result.name}" width="24" height="24" />
                <span>${result.name}</span>
            `;
            listItem.dataset.id=result.id;
            resultList.appendChild(listItem);
    });
}
else{
    resultList.innerHTML='<li>No Coin Data!</li>'
}
resultList.querySelectorAll('li').forEach(item =>{
    item.addEventListener('click',(event)=>{
            const coinId=event.currentTarget.dataset.id;
            window.location.href = `coin.html?id=${coinId}`;
    });
});

    searchDialog.style.display='block';
};

//close search dialog
const closeSearchDialog=()=>{
    document.querySelector('#search-dialog').style.display='none';
}

// Handle search Input with debounce

const handleSearchInput=()=>{
    debounce(async()=>{
        const searchTerm=document.querySelector('#search-box').value.trim();
        if(searchTerm){
            const result=await fetchSearchResult(searchTerm);
            showSearchResult(result);
        }else{
            closeSearchDialog();
        }
    },300);
}



// Attach Event Listner
document.addEventListener('DOMContentLoaded', initializePage);
document.querySelector('#search-box').addEventListener('input',handleSearchInput);
document.querySelector('#search-icon').addEventListener('click',handleSearchInput);
document.querySelector('#close-dialog').addEventListener('click',closeSearchDialog);