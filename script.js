const moedaASerConvertida = document.getElementById("of_coin");
const moedaDeConversao = document.getElementById("to_coin");
const btnConverter = document.getElementById("btn-convert");
const campoValorASerConvertido = document.getElementById("field-value-to-convert");
const spanValorASerConvertido = document.getElementById("value-to-convert");
const spanValorConvertido = document.getElementById("value-converted");
const bandeiraValorASerConvertido = document.getElementById("of-coin-flag");
const bandeiraValorConvertido = document.getElementById("to-coin-flag");

let conversaoCalculada = false;

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
  const taxaConversaoDolarEuro = cotacoes.USDEUR.ask;
  const taxaConversaoEuroDolar = cotacoes.EURUSD.ask;

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

const obterMoedas = () => {
  return {
    moedaASerConvertida: moedaASerConvertida.value,
    moedaDeConversao: moedaDeConversao.value,
  };
};

const obterValorASerConvertido = () => {
  const valor = parseFloat(campoValorASerConvertido.value.trim());
  return isNaN(valor) ? 0 : valor;
};

const isValidarCampos = () => {
  let camposPreenchidos = true;

  if (moedaASerConvertida.value == "DEFAULT") {
    moedaASerConvertida.classList.add("err");
    camposPreenchidos = false;
  }

  if (moedaDeConversao.value == "DEFAULT") {
    moedaDeConversao.classList.add("err");
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
  const combinacao = `${moedaASerConvertida}_${moedaDeConversao}`;

  return efetuarConversao(combinacao, valor, taxasDeConversao);
};

const efetuarConversao = (combinacao, valor, taxasDeConversao) => {
  conversaoCalculada = true;

  if (
    combinacao.startsWith("BRL_BRL") ||
    combinacao.startsWith("USD_USD") ||
    combinacao.startsWith("EUR_EUR")
  ) {
    return valor;
  }

  const conversoes = {
    BRL_USD: (valor, taxasDeConversao) => valor * taxasDeConversao.BRL_USD,
    BRL_EUR: (valor, taxasDeConversao) => valor * taxasDeConversao.BRL_EUR,
    USD_BRL: (valor, taxasDeConversao) => valor * taxasDeConversao.USD_BRL,
    EUR_BRL: (valor, taxasDeConversao) => valor * taxasDeConversao.EUR_BRL,
    USD_EUR: (valor, taxasDeConversao) => valor * taxasDeConversao.USD_EUR,
    EUR_USD: (valor, taxasDeConversao) => valor * taxasDeConversao.EUR_USD,
  };

  const funcaoDeConversao = conversoes[combinacao];
  return funcaoDeConversao(valor, taxasDeConversao);
};

const converter = () => {
  const camposPreenchidos = isValidarCampos();

  if (camposPreenchidos) {
    const moedas = obterMoedas();
    const valor = obterValorASerConvertido();

    const valorResultado = calcularConversao(moedas, valor);

    setarResultados(moedas, valor, valorResultado);
  }
};

const setarResultados = (moedas, valor, valorResultado) => {
  const { moedaASerConvertida, moedaDeConversao } = moedas;

  const valorFormatado = formatar(moedaASerConvertida, valor);
  const valorResultadoFormatado = formatar(moedaDeConversao, valorResultado);

  spanValorASerConvertido.innerHTML = valorFormatado;
  spanValorConvertido.innerHTML = valorResultadoFormatado;
};

const formatar = (moeda, valor) => {
  if (moeda == "DEFAULT") return "0,00";

  const formatacoes = {
    BRL: { style: "currency", currency: "BRL", minimumFractionDigits: 2 },
    USD: { style: "currency", currency: "USD", minimumFractionDigits: 2 },
    EUR: { style: "currency", currency: "EUR", minimumFractionDigits: 2 },
  };

  const valorFormatado = valor.toLocaleString("pt-br", formatacoes[moeda]);

  return valorFormatado;
};

const setarBandeira = (moeda, bandeiraImg) => {
  const bandeiras = {
    DEFAULT: "./img/DEFAULT.svg",
    BRL: "./img/BRL.svg",
    USD: "./img/USD.svg",
    EUR: "./img/EUR.svg",
  };

  bandeiraImg.src = bandeiras[moeda];
};

const espelharAlteracao = (moeda, alteracoes, seraEspelhado) => {
  const valorFormatado = alteracoes
    ? formatar(moeda, alteracoes)
    : formatar(moeda, 0);

  seraEspelhado.innerHTML = valorFormatado;
};

const limparConversao = () => {
  const moedaSelecionada = obterMoedas().moedaDeConversao;

  spanValorConvertido.innerHTML = formatar(moedaSelecionada, 0);
};

const recalcularConversao = () => {
  const valor = obterValorASerConvertido();
  const moedas = obterMoedas();
  const valorResultado = calcularConversao(moedas, valor);

  setarResultados(moedas, valor, valorResultado);
};

moedaASerConvertida.addEventListener("change", () => {
  moedaASerConvertida.classList.remove("err");

  const moedaSelecionada = obterMoedas().moedaASerConvertida;
  const valorASerConvertido = parseFloat(campoValorASerConvertido.value);

  setarBandeira(moedaSelecionada, bandeiraValorASerConvertido);
  espelharAlteracao(
    moedaSelecionada,
    valorASerConvertido,
    spanValorASerConvertido
  );

  if (conversaoCalculada) {
    recalcularConversao();
  }
});

moedaDeConversao.addEventListener("change", () => {
  moedaDeConversao.classList.remove("err");

  const moedaSelecionada = obterMoedas().moedaDeConversao;
  const valorConvertido = parseFloat(0);

  setarBandeira(moedaSelecionada, bandeiraValorConvertido);
  espelharAlteracao(moedaSelecionada, valorConvertido, spanValorConvertido);

  if (conversaoCalculada) {
    recalcularConversao();
  }
});

campoValorASerConvertido.addEventListener("input", () => {
  campoValorASerConvertido.classList.remove("err");

  const moedaSelecionada = obterMoedas().moedaASerConvertida;
  const valorASerConvertido = parseFloat(campoValorASerConvertido.value);

  espelharAlteracao(
    moedaSelecionada,
    valorASerConvertido,
    spanValorASerConvertido
  );

  limparConversao();
});

btnConverter.addEventListener("click", () => {
  converter();
});

window.onload = () => {
  atualizarCotacoesPeriodicamente();
};
