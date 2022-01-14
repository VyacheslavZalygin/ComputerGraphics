onload = () => {
    const userInput = prompt("Введите что-нибудь");
    for (let i = 0; i < 10; i += 1) {
        const newElement = document.createElement('h1');
        newElement.innerHTML = userInput;
        document.body.appendChild(newElement);
    }
};