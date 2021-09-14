const form = document.querySelector('form');
const imgRow = document.querySelector('#img-row');
const imgContainer = document.querySelector('#img-container');
const botaoBitcoin = document.querySelector('#bit-button');
const modalDialog = document.querySelector('.modal');
let currentBitcoinPrice;

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    //CARD STRUCTURE
    appendTip();
    createCard();
    formReset();
});

imgContainer.addEventListener('click', (e) => {
    // DELETE IMGS
    if(e.target.classList.contains('img-fluid')) { 
        e.target.parentElement.remove();
        if(imgRow.childNodes.length === 1){
            imgContainer.parentElement.removeChild(document.querySelector('#tip'));
        }
    }
});

form.addEventListener('input', (e) => {
    //VALIDATE FORM
    avaliaClick(e.target);
    verificaValue(e.target);
});

botaoBitcoin.addEventListener('click', (e) => {
    updateBitcoinPrice();
});

modalDialog.addEventListener('hide.bs.modal', (e) => {
    localStorage.bitcoin = currentBitcoinPrice;
});

let avaliaClick = (alvoDoClick) => {
    //VALIDATION LOGIC
    let palavrasDigitadas = alvoDoClick.value.split(' ');
    let hasAlertAlready = alvoDoClick.parentElement.contains(document.querySelector('.alert'));
    let biggerThanOneWord = palavrasDigitadas.filter(element => element!=='').length >= 2;
    let hasMoreThan150Characters = alvoDoClick.value.length > 150;
    let hasMoreThan30Characters = alvoDoClick.value.length > 30;
    let isValidLink = alvoDoClick.value.match("https://.*");
    
    // ACTUAL VALIDATION
    switch(alvoDoClick.id){
        case 'titulo':
            if((alvoDoClick.value!="" && !hasAlertAlready) &&  hasMoreThan30Characters) {
                messagePrep(alvoDoClick);
            }else if((hasAlertAlready && !hasMoreThan30Characters) || (alvoDoClick.value==="" && hasAlertAlready)){
                messageRm(alvoDoClick);
            }
            break;
        case 'descricao':
            if((alvoDoClick.value!="" && !hasAlertAlready) && (!biggerThanOneWord || hasMoreThan150Characters)) {
                messagePrep(alvoDoClick);
            }else if((hasAlertAlready && biggerThanOneWord && !hasMoreThan150Characters) || (alvoDoClick.value==="" && hasAlertAlready)){
                messageRm(alvoDoClick);
            }
            break;
        case 'url-imagem':
            if((alvoDoClick.value!="" && !hasAlertAlready) && (biggerThanOneWord || !isValidLink)) {
                messagePrep(alvoDoClick);
            }else if((hasAlertAlready && !biggerThanOneWord) || (alvoDoClick.value==="" && hasAlertAlready)){
                messageRm(alvoDoClick);
            }
            break;
    }
}

let createCard = () => {
    //TITLE AND DRESCRIPTION CREATION
    const title = document.createElement('h2');
    const description = document.createElement('p');
    title.textContent = document.querySelector('#titulo').value.toUpperCase();
    description.textContent = capitalizeFirstLetter(document.querySelector('#descricao').value);
    //URL GATHERING
    const imgUrl = document.querySelector('#url-imagem').value;
    //IMG CREATION
    const newImg = document.createElement('img');
    newImg.src = imgUrl;
    newImg.alt = 'Imagem do card';
    newImg.classList.add('img-fluid');
    // APPEND SECTION
    const imgCol = document.createElement('div');
    imgCol.classList.add('col-md-6', 'col-sm-12', 'gx-5', 'gy-4');
    imgCol.appendChild(title);
    imgCol.appendChild(newImg);
    imgCol.appendChild(description);
    imgRow.appendChild(imgCol);
}

let capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

let appendTip = () => {
    if(imgContainer.parentElement.contains(document.querySelector('#tip'))){
        console.log('hehehe');
    }else{
        // TIP CREATION
        const tip = document.createElement('h3');
        tip.textContent = 'Clique na imagem dos cards para deletá-los!';
        tip.classList.add('my-5');
        tip.setAttribute('id', 'tip');
        imgContainer.insertAdjacentElement('beforebegin', tip);
    }
}

let createAlertMessage = (element) => {
    let alert = document.createElement('div');
    alert.classList.add('alert', 'alert-danger', 'mt-2', 'mb-5');
    let ul = document.createElement('ul');
    ul.classList.add('msg-requirements');
    switch(element.id){
        case 'titulo':
            ul.innerHTML = '<li>- Máximo de 30 caracteres permitidos.</li>';
            break;
        case 'descricao':
            ul.innerHTML = '<li>- O campo deve conter mais de 2 palavras.</li>';
            ul.innerHTML += '<li>- Máximo de 150 caracteres permitidos.</li>';
            break;
        case 'url-imagem':
            ul.innerHTML = '<li>- Somente um link por imagem.</li>';
            ul.innerHTML += '<li>- Somente links iniciados com <strong>https://</strong> serão aceitos.</li>';
            break;
    }
    alert.appendChild(ul);
    return alert;
}

let desabilitarBotao = () => {
    let botao = document.querySelector('.btn');
    $('#popoverContainer').popover('enable');
    botao.disabled = true;
}

let habilitarBotao = () => {
    let botao = document.querySelector('.btn');
    $('#popoverContainer').popover('disable');
    botao.disabled = false;
}

let verificaValue = (alvoDoClick) => {;
    let titulo = document.querySelector('#titulo');
    let descricao = document.querySelector('#descricao');
    let urlImagem = document.querySelector('#url-imagem');
    let hasNoEmptyFields = titulo.value !== '' && descricao.value !== '' && urlImagem.value !== '';
    if(hasNoEmptyFields && !form.contains(document.querySelector('.alert'))){
        habilitarBotao();
    }else{
        desabilitarBotao();
    }
}

function formReset(){
    document.getElementById("formRegistration").reset();
    verificaValue();
}

let messagePrep = (alvoDoClick) => {
    alvoDoClick.classList.add('is-invalid');
    let alert = createAlertMessage(alvoDoClick);
    alvoDoClick.parentElement.appendChild(alert);
}

let messageRm = (alvoDoClick) => {
    alvoDoClick.classList.remove('is-invalid');
    alvoDoClick.parentElement.querySelector('.alert').remove();
}

let pegarPrecoBitcoin = async () => {
    try {
        let bitcoin = await axios.get('https://api.cryptonator.com/api/ticker/btc-usd');
        return bitcoin.data.ticker.price;
    } catch (error) {
        console.log('big f!',error);
        updateBitcoinPrice(null);
    }
}

let updateBitcoinPrice = async () => {
    currentBitcoinPrice = await pegarPrecoBitcoin();
    let oldBitcoinPrice = localStorage.bitcoin;
    let bitcoinPrice = document.querySelector('#bitPrice');
    let previousBitcoinPrice = document.querySelector('#previousBitPrice');
    bitcoinPrice.textContent = `O preço atual do bitcoin é de U$ ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentBitcoinPrice)}`;
    if(oldBitcoinPrice !== currentBitcoinPrice){
        previousBitcoinPrice.textContent = `Da última vez que você conferiu, o preço do bitcoin era de U$ ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(oldBitcoinPrice)}`;
        isStonk(oldBitcoinPrice, currentBitcoinPrice);
    }else if(oldBitcoinPrice === currentBitcoinPrice){
        previousBitcoinPrice.textContent = 'O preço do bitcoin permance inalterado desde sua última conferida.';
        document.querySelector('#bitcoinFigure').firstChild.src = 'img/smooth.jpeg';
    }else{
        previousBitcoinPrice.parentElement.hidden = true;
        document.querySelector('#bitcoinFigure').hidden = true;
    }
}

let isStonk = (oldPrice,currentPrice) => {
    let liItem = document.querySelector('#bitcoinFigure');
    if(oldPrice < currentPrice){
        liItem.firstChild.src = 'img/upward.jpg';
    }else{
        liItem.firstChild.src = 'img/downward.jpg';
    }
}
