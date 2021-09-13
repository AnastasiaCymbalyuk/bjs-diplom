'use strict'

const logoutButton = new LogoutButton();

logoutButton.action = () => {
    ApiConnector.logout(response => {
        if (response.success) {
            location.reload();
        };
    });
};

ApiConnector.current(response => {
    if (response.success) {
        ProfileWidget.showProfile(response.data);
    };
});

const ratesBoard = new RatesBoard();

function getRates () {
    ApiConnector.getStocks(response => {
        if (response.success) {
            ratesBoard.clearTable();
            ratesBoard.fillTable(response.data);
        };
    });
};

getRates();

setTimeout(getRates, 1000 * 60);

const moneyManager = new MoneyManager();

function checkRequest (response, data, message) {
    if (response.success) {
        ProfileWidget.showProfile(response.data);
        moneyManager.setMessage(response.success, message);
    } else {
        moneyManager.setMessage(response.success, response.error);
    };
};

moneyManager.addMoneyCallback = data => {
    ApiConnector.addMoney(data, response => {
        const message = `Пополнение счета на ${data.amount} ${data.currency}`;
        checkRequest(response, data, message);
    });
};

moneyManager.conversionMoneyCallback = data => {
    ApiConnector.convertMoney(data, response => {
        const message = `Конвертация ${data.fromAmount} ${data.fromCurrency} в ${data.targetCurrency}`;
        checkRequest(response, data, message);
    });
};

moneyManager.sendMoneyCallback = data => {
    ApiConnector.transferMoney(data, response => {
        const message = `Перевод ${data.amount} ${data.currency} пользователю ID ${data.to}`;
        checkRequest(response, data, message);
    });
};

const favoritesWidget = new FavoritesWidget();

function getFavoritesList (response) {
    favoritesWidget.clearTable();
    favoritesWidget.fillTable(response.data);
    moneyManager.updateUsersList(response.data);
};

ApiConnector.getFavorites(response => {
    if (response.success) {
        getFavoritesList(response);
    };
});

favoritesWidget.addUserCallback = data => {
    ApiConnector.addUserToFavorites(data, response => {
        if (response.success) {
            getFavoritesList(response);
            moneyManager.setMessage(response.success, `${data.name} добавлен`);
        } else {
            moneyManager.setMessage(response.success, response.error);
        };
    });
};

favoritesWidget.removeUserCallback = data => {
    ApiConnector.removeUserFromFavorites(data, response => {
        if (response.success) {
            getFavoritesList(response);
            moneyManager.setMessage(response.success, `ID ${data} удален`);
        } else {
            moneyManager.setMessage(response.success, response.error);
        };
    });
};