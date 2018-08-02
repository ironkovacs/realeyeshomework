const fromValue = document.querySelector('#from-value');
const fromCurrency = document.querySelector('#from-select');
const toValue = document.querySelector('#to-value');
const toCurrency = document.querySelector('#to-select');
const latestDate = document.querySelector('#latest');
const chartContainer = document.querySelector("#chart_container");

const xhttp = new XMLHttpRequest();

let activeCurrencies = {
  from: { currency: 'EUR', rate: 1 },
  to: { currency: 'EUR', rate: 1 },
  exchRate: 1
}

let xmlDoc;
let data
let jsonObj;

xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    xmlDoc = this.responseXML;
    jsonObj = xmlToJson(xmlDoc).NODE.Cube.Cube;

    recalculate()
    appendDOM(fromCurrency);
    appendDOM(toCurrency);

    latestDate.innerText = jsonObj[0].time;
    data = getActiveCurrencyHistory()
  };
};

const xmlToJson = (xml) => { // Modified version from here: http://davidwalsh.name/convert-xml-json

  let obj = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj = {};
      for (let j = 0; j < xml.attributes.length; j += 1) {
        const attribute = xml.attributes.item(j);
        obj[attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i += 1) {
      let item = xml.childNodes.item(i);
      let nodeName;
      if (item.nodeName == 'gesmes:Envelope') {
        nodeName = 'NODE'
      } else {
        nodeName = item.nodeName
      }
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};

const appendDOM = (domElement) => {
  for (let i = 0; i < jsonObj[0].Cube.length; i++) {
    let option = document.createElement('option');
    let currency = document.createTextNode(jsonObj[0].Cube[i].currency)
    option.appendChild(currency)
    domElement.appendChild(option)
  }
};

const getActiveCurrencyHistory = () => {
  let history = [];

  for (let i = 0; i < jsonObj.length; i++) {
    if (activeCurrencies.from.currency == "EUR") {
      history.push(
        {
          'from': {
            x: getTimestamp(jsonObj[i].time),
            y: 1
          },
          'to': {
            x: getTimestamp(jsonObj[i].time),
            y: Number(getRate(activeCurrencies.to.currency, jsonObj, i))
          },
        }
      )
    }
    else if (activeCurrencies.from.currency == "EUR") {
      history.push(
        {
          'from': {
            x: getTimestamp(jsonObj[i].time),
            y: Number(getRate(activeCurrencies.from.currency, jsonObj, i))
          },
          'to': {
            x: getTimestamp(jsonObj[i].time),
            y: 1
          },
        }
      )
    }
    else {
      history.push(
        {
          'from': {
            x: getTimestamp(jsonObj[i].time),
            y: Number(getRate(activeCurrencies.from.currency, jsonObj, i))
          },
          'to': {
            x: getTimestamp(jsonObj[i].time),
            y: Number(getRate(activeCurrencies.to.currency, jsonObj, i))
          },
        }
      )
    }
  }
  return history
};

const recalculate = () => {
  if (toCurrency.innerText == 'EUR') {
    activeCurrencies.to.currency = 'EUR';
    activeCurrencies.to.rate = '1';
  }
  if (fromCurrency.innerText == 'EUR') {
    activeCurrencies.from.currency = 'EUR';
    activeCurrencies.from.rate = '1';
  }
  activeCurrencies.exchRate = (fromValue.value / activeCurrencies.from.rate * activeCurrencies.to.rate);
  toValue.innerText = finantial(activeCurrencies.exchRate);
};

const finantial = (n) => {
  return Number.parseFloat(n).toFixed(2);
};

const getRate = (currency, arr, i) => {
  let rate = "";
  arr[i].Cube.forEach(e => {
    if (e.currency == currency) {
      rate = e.rate;
    };
  });
  return rate;
};

const getTimestamp = (date) => {
  return Math.floor(new Date(date).getTime() / 1000)
}

const getData = (prefix) => {
  recalculate();
  data = getActiveCurrencyHistory()
  let arr = [];
  if (prefix == 'from' || prefix == 'to') {
    for (let i = data.length; i > 0; i--) {
      arr.push(data[i - 1][prefix])
    }
  } else if (prefix == 'exc') {
    for (let i = data.length; i > 0; i--) {
      arr.push(
        {
          x: data[i - 1].from.x,
          y: Number(data[i - 1].to.y / data[i - 1].from.y)
        }
      )
    }
  };
  return arr
}

fromValue.addEventListener('keyup', () => {
  recalculate();
  getActiveCurrencyHistory();
});

fromValue.addEventListener('change', () => {
  recalculate();
  getActiveCurrencyHistory();
});

fromCurrency.addEventListener('change', () => {
  if (fromCurrency.value == 'EUR') {
    activeCurrencies['from'] = { currency: 'EUR', rate: 1 }
  } else {
    activeCurrencies['from'] = { currency: fromCurrency.value, rate: getRate(fromCurrency.value, jsonObj, 0) }
  }
  recalculate();
  renderChart();
});

toCurrency.addEventListener('change', () => {
  if (toCurrency.value == 'EUR') {
    activeCurrencies['to'] = { currency: 'EUR', rate: 1 }
  } else {
    activeCurrencies['to'] = { currency: toCurrency.value, rate: getRate(toCurrency.value, jsonObj, 0) }
  }
  recalculate();
  renderChart();
});

window.addEventListener('resize', () => { renderChart() });

xhttp.open("GET", "https://thingproxy.freeboard.io/fetch/http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml", true);
xhttp.send();
