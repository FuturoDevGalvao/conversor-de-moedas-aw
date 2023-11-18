const converterDe = document.getElementById("of_coin");
const converterPara = document.getElementById("to_coin");
const btnConverter = document.getElementById("btn-convert");
const campoValorASerConvertido = document.getElementById(
  "field-value-to-convert"
);
const valorParaConverter = document.getElementById("value-to-convert");
const valorConvertido = "";

const obterCotacoesOnline = (callback) => {
  const url =
    "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,BRL-USD,BRL-EUR";

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((cotacoes) => {
      organizarTaxasDeConversao(cotacoes, callback);
    })
    .catch((err) => {
      console.error(err);
    });
};

const organizarTaxasDeConversao = (cotacoes, callback) => {
  const taxaConversaoRealDolar = cotacoes.BRLUSD.ask;
  const taxaConversaoRealEuro = cotacoes.BRLEUR.ask;
  const taxaConversaoDolarReal = cotacoes.USDBRL.ask;
  const taxaConversaoEuroReal = cotacoes.EURBRL.ask;

  callback({
    BR_USD: taxaConversaoRealDolar,
    BR_EUR: taxaConversaoRealEuro,
    USD_BR: taxaConversaoDolarReal,
    EUR_BR: taxaConversaoEuroReal,
  });
};

const persitirCotacoes = (taxasDeConversao) => {
  localStorage.clear();
  localStorage.setItem("taxas_de_conversao", JSON.stringify(taxasDeConversao));
};

const atualizarCotacoesPeriodicamente = () => {
  obterCotacoesOnline(persitirCotacoes);

  setInterval(() => {
    obterCotacoesOnline(persitirCotacoes);
  }, 1 * 60 * 1000);
};

const obterTaxasDeConversao = () => {
  return JSON.parse(localStorage.getItem("taxas_de_conversao"));
};

const obterMoedasParaConversao = () => {
  const moedaASerConvertida = converterDe.value;
  const moedaDeConversao = converterPara.value;

  return {
    moedaASerConvertida: moedaASerConvertida,
    moedaDeConversao: moedaDeConversao,
  };
};

const obterValorASerConvertido = () => {
  return parseFloat(campoValorASerConvertido.value);
};

const isValidarCampos = () => {
  let camposPreenchidos = true;

  if (converterDe.value == "DEFAULT") {
    converterDe.classList.add("err");
    camposPreenchidos = false;
  }

  if (converterPara.value == "DEFAULT") {
    converterPara.classList.add("err");
    camposPreenchidos = false;
  }

  if (campoValorASerConvertido.value == "") {
    campoValorASerConvertido.classList.add("err");
    camposPreenchidos = false;
  }

  return camposPreenchidos;
};

const calcularConversao = (moedas, valor) => {
  const taxasDeConversao = obterTaxasDeConversao();

  const { moedaASerConvertida, moedaDeConversao } = moedas;
  const combinacao = `${moedaASerConvertida}-${moedaDeConversao}`;

  console.log(taxasDeConversao);
  console.log(combinacao);
  console.log(efetuarConversao(combinacao, valor, taxasDeConversao));
};

const efetuarConversao = (combinacao, valor, taxasDeConversao) => {
  const conversoes = {
    "BR-USD": (valor, taxasDeConversao) => valor * taxasDeConversao.BR_EUR,
    "BR-EUR": (valor, taxasDeConversao) => valor * taxasDeConversao.BR_USD,
    "USD-BR": (valor, taxasDeConversao) => valor * taxasDeConversao.USD_BR,
    "EUR-BR": (valor, taxasDeConversao) => valor * taxasDeConversao.EUR_BR,
  };

  const funcaoDeConversao = conversoes[combinacao];
  return funcaoDeConversao(valor, taxasDeConversao);
};

const converter = () => {
  const camposPreenchidos = isValidarCampos();

  if (camposPreenchidos) {
    const moedas = obterMoedasParaConversao();
    const valor = obterValorASerConvertido();

    const valorConvertido = calcularConversao(moedas, valor);
  }
};

atualizarCotacoesPeriodicamente();

btnConverter.addEventListener("click", () => {
  converter();
});

converterDe.addEventListener("change", () => {
  converterDe.classList.remove("err");
});

converterPara.addEventListener("change", () => {
  converterPara.classList.remove("err");
});

campoValorASerConvertido.addEventListener("input", () => {
  campoValorASerConvertido.classList.remove("err");
});
