const converterDe = document.getElementById("of_coin");
const converterPara = document.getElementById("to_coin");
const btnConverter = document.getElementById("btn-convert");
const campoValorASerConvertido = document.getElementById("field-value-to-convert");
const valorASerConverter = document.getElementById("value-to-convert");
const valorConvertido = document.getElementById("value-converted");

const obterCotacoesOnline = (callback) => {
  const url =
    "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BRL-USD,BRL-EUR,USD-EUR,EUR-USD";

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
  const taxaConversaoDolarEuro = cotacoes.EURUSD.ask;
  const taxaConversaoEuroDolar = cotacoes.USDEUR.ask;

  callback({
    BRL_USD: taxaConversaoRealDolar,
    BRL_EUR: taxaConversaoRealEuro,
    USD_BRL: taxaConversaoDolarReal,
    EUR_BRL: taxaConversaoEuroReal,
    USD_EUR: taxaConversaoDolarEuro,
    EUR_USD: taxaConversaoEuroDolar,
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

  return efetuarConversao(combinacao, valor, taxasDeConversao);
};

const efetuarConversao = (combinacao, valor, taxasDeConversao) => {
  const conversoes = {
    "BRL-USD": (valor, taxasDeConversao) => valor * taxasDeConversao.BRL_USD,
    "BRL-EUR": (valor, taxasDeConversao) => valor * taxasDeConversao.BRL_EUR,
    "USD-BRL": (valor, taxasDeConversao) => valor * taxasDeConversao.USD_BRL,
    "EUR-BRL": (valor, taxasDeConversao) => valor * taxasDeConversao.EUR_BRL,
    "USD-EUR": (valor, taxasDeConversao) => valor * taxasDeConversao.USD_EUR,
    "EUR-USD": (valor, taxasDeConversao) => valor * taxasDeConversao.EUR_USD,
  };

  const funcaoDeConversao = conversoes[combinacao];
  return funcaoDeConversao(valor, taxasDeConversao);
};

const converter = () => {
  const camposPreenchidos = isValidarCampos();

  if (camposPreenchidos) {
    const moedas = obterMoedasParaConversao();
    const valor = obterValorASerConvertido();

    const valorResultado = calcularConversao(moedas, valor);

    setarResultados(moedas, valor, valorResultado);
  }
};

const setarResultados = (moedas, valor, valorResultado) => {
  const { moedaASerConvertida, moedaDeConversao } = moedas;

  const valorEmMoeda = formatar(moedaASerConvertida, valor);
  const valorResultadoEmMoeda = formatar(moedaDeConversao, valorResultado);

  valorASerConverter.innerHTML = valorEmMoeda;
  valorConvertido.innerHTML = valorResultadoEmMoeda;
};

const formatar = (moeda, valor) => {
  const formatacoes = {
    BRL: {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    },
    USD: {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    },
    EUR: {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    },
  };

  const valorFormatado = valor.toLocaleString("pt-br", formatacoes[moeda]);
  return valorFormatado;
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
