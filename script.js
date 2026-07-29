
document.getElementById("scan").onclick = function () {

    document.getElementById("status").innerHTML =
        "Status : Scanner Started...";

    setTimeout(function(){

        document.getElementById("status").innerHTML =
        "Found Stocks : Waiting for Fyers API connection";

    },2000);

};
