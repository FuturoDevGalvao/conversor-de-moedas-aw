const converterDe = document.getElementById("of_coin");
const converterPara = document.getElementById("to_coin");
const btnConverter = document.getElementById("btn-convert");
const campoValorASerConvertido = document.getElementById(
  "field-value-to-convert"
);

const obterCotacoesOnline = (callback) => {
  const url = "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL";

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((dados) => {
      const precoDeCompradoDolar = dados.USDBRL.ask;
      const precoDeCompradoEuro = dados.EURBRL.ask;
      callback({ Dolar: precoDeCompradoDolar, Euro: precoDeCompradoEuro });
    })
    .catch((err) => {
      console.error(err);
    });
};

const persitirCotacoes = (cotacoes) => {
  localStorage.clear();

  localStorage.setItem("cotacoes", JSON.stringify(cotacoes));
};

const atualizarCotacoesPeriodicamente = () => {
  obterCotacoesOnline(persitirCotacoes);

  setInterval(() => {
    obterCotacoesOnline(persitirCotacoes);
  }, 1 * 60 * 1000);
};

const obterCotacoes = () => {
  return JSON.parse(localStorage.getItem("cotacoes"));
};

const obterMoedasParaConversao = () => {
  const moedaASerConvertida = converterDe.value;
  const moedaDeConversao = converterPara.value;

  return { de: moedaASerConvertida, para: moedaDeConversao };
};

const obterValorASerConvertido = () => {
  // [. . .]
};

btnConverter.addEventListener("click", () => {});
