const form = document.getElementById("report-form");
const updateButton = document.getElementById("updateDashboard");
const downloadButton = document.getElementById("downloadPng");
const dashboard = document.getElementById("dashboard");
const validationMessage = document.getElementById("validationMessage");

const prizeLabels = {
  prizeCoxinha: "Pote P de Coxinha",
  prizeShake: "Milk Shake",
  prizeCone: "Casquinha",
  prizeSundae: "Mini Sundae",
};

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function getNumber(id) {
  const value = Number(getValue(id));
  return Number.isFinite(value) ? value : 0;
}

// Aceita entradas como "514,50", "R$ 514,50" ou "1.101,40".
function parseBrazilianCurrency(value) {
  if (!value) return 0;
  const cleanValue = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(cleanValue);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function getTopPrize(prizes) {
  const orderedPrizes = Object.entries(prizes).sort((a, b) => b[1] - a[1]);
  const [topPrizeId, topPrizeValue] = orderedPrizes[0];
  return topPrizeValue > 0 ? prizeLabels[topPrizeId] : "Nenhum prêmio";
}

function getBusiestPeriod(periods) {
  const highestValue = Math.max(periods.morning, periods.afternoon, periods.night);

  if (highestValue <= 0) {
    return "-";
  }

  const names = [];

  if (periods.morning === highestValue) names.push("Manhã");
  if (periods.afternoon === highestValue) names.push("Tarde");
  if (periods.night === highestValue) names.push("Noite");

  return names.join(" / ");
}

function collectReportData() {
  const revenueCoxinha = parseBrazilianCurrency(getValue("revenueCoxinha"));
  const revenueMix = parseBrazilianCurrency(getValue("revenueMix"));
  const revenueDelivery = parseBrazilianCurrency(getValue("revenueDelivery"));
  const totalRevenue = revenueCoxinha + revenueMix + revenueDelivery;

  const clients = getNumber("clients");
  const morning = getNumber("morning");
  const afternoon = getNumber("afternoon");
  const night = getNumber("night");
  const participants = morning + afternoon + night;
  const averageTicket = clients > 0 ? totalRevenue / clients : 0;
  const busiestPeriod = getBusiestPeriod({ morning, afternoon, night });

  return {
    reportDate: getValue("reportDate") || "-",
    clients,
    participants,
    morning,
    afternoon,
    night,
    busiestPeriod,
    revenueCoxinha,
    revenueMix,
    revenueDelivery,
    totalRevenue,
    averageTicket,
    deliverySales: getNumber("deliverySales"),
    adInvestment: parseBrazilianCurrency(getValue("adInvestment")),
    prizes: {
      prizeCoxinha: getNumber("prizeCoxinha"),
      prizeShake: getNumber("prizeShake"),
      prizeCone: getNumber("prizeCone"),
      prizeSundae: getNumber("prizeSundae"),
    },
    problems: getNumber("problems"),
    difficulties: getNumber("difficulties"),
    missingItems: getNumber("missingItems"),
  };
}

function validateReportData(data) {
  if (data.participants > data.clients) {
    return {
      isValid: false,
      message: "Confira os números: participantes da roleta não podem ser maiores que as vendas do dia.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

function applyValidationState(validation) {
  if (validationMessage) {
    validationMessage.textContent = validation.message;
  }

  downloadButton.disabled = !validation.isValid;
  downloadButton.title = validation.isValid ? "" : validation.message;
}

function updateDashboard() {
  const data = collectReportData();
  const validation = validateReportData(data);

  setText("viewDate", data.reportDate);
  setText("viewClients", data.clients);
  setText("viewParticipants", data.participants);

  setText("viewTotalRevenue", formatCurrency(data.totalRevenue));
  setText("viewRevenueCoxinha", formatCurrency(data.revenueCoxinha));
  setText("viewRevenueMix", formatCurrency(data.revenueMix));
  setText("viewRevenueDelivery", formatCurrency(data.revenueDelivery));
  setText("viewTotalRevenueTable", formatCurrency(data.totalRevenue));

  setText("viewMorning", data.morning);
  setText("viewAfternoon", data.afternoon);
  setText("viewNight", data.night);

  setText("viewPrizeCoxinha", data.prizes.prizeCoxinha);
  setText("viewPrizeShake", data.prizes.prizeShake);
  setText("viewPrizeCone", data.prizes.prizeCone);
  setText("viewPrizeSundae", data.prizes.prizeSundae);
  setText("viewTopPrize", getTopPrize(data.prizes));

  setText("viewAverageTicket", formatCurrency(data.averageTicket));
  setText("viewBusiestPeriod", data.busiestPeriod);
  setText("viewDeliverySales", data.deliverySales);
  setText("viewDeliveryRevenueAgain", formatCurrency(data.revenueDelivery));
  setText("viewAdInvestment", formatCurrency(data.adInvestment));

  setText("viewProblems", data.problems);
  setText("viewDifficulties", data.difficulties);
  setText("viewMissingItems", data.missingItems);

  setText("summaryClients", data.clients);
  setText("summaryParticipants", data.participants);
  setText("summaryAverageTicket", formatCurrency(data.averageTicket));
  setText("summaryDeliverySales", data.deliverySales);
  setText("summaryTotalRevenue", formatCurrency(data.totalRevenue));

  applyValidationState(validation);

  return { data, validation };
}

async function downloadDashboardPng() {
  const { validation } = updateDashboard();

  if (!validation.isValid) {
    alert(validation.message);
    return;
  }

  if (!window.html2canvas) {
    alert("A biblioteca de imagem não carregou. Abra com internet ou publique no GitHub Pages para baixar o PNG.");
    return;
  }

  downloadButton.disabled = true;
  downloadButton.textContent = "Gerando PNG...";
  document.body.classList.add("exporting-dashboard");

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(dashboard, {
      backgroundColor: "#07110f",
      width: 1080,
      height: 1920,
      windowWidth: 1200,
      windowHeight: 2100,
      scale: 1,
      useCORS: true,
    });

    const fileName = `relatorio-diario-${getValue("reportDate").replaceAll("/", "-") || "dashboard"}.png`;

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Não foi possível gerar a imagem. Tente novamente pelo navegador Chrome.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error(error);
    alert("Não foi possível baixar a imagem. Se estiver abrindo como arquivo local, publique no GitHub Pages ou rode em um servidor local.");
  } finally {
    document.body.classList.remove("exporting-dashboard");
    downloadButton.textContent = "Baixar imagem PNG";
    updateDashboard();
  }
}

updateButton.addEventListener("click", updateDashboard);
downloadButton.addEventListener("click", downloadDashboardPng);

// Atualiza a prévia enquanto a equipe preenche o formulário.
form.addEventListener("input", updateDashboard);
form.addEventListener("change", updateDashboard);

updateDashboard();
