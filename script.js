const form = document.getElementById("report-form");
const updateButton = document.getElementById("updateDashboard");
const downloadButton = document.getElementById("downloadPng");
const dashboard = document.getElementById("dashboard");

const prizeLabels = {
  prizeCoxinha: "Pote P de Coxinha",
  prizeShake: "Milk Shake",
  prizeCone: "Casquinha",
  prizeSundae: "Mini Sundae",
};

function getValue(id) {
  return document.getElementById(id).value.trim();
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
  document.getElementById(id).textContent = value;
}

function getTopPrize(prizes) {
  const orderedPrizes = Object.entries(prizes).sort((a, b) => b[1] - a[1]);
  const [topPrizeId, topPrizeValue] = orderedPrizes[0];
  return topPrizeValue > 0 ? prizeLabels[topPrizeId] : "Nenhum prêmio";
}

function collectReportData() {
  const revenueCoxinha = parseBrazilianCurrency(getValue("revenueCoxinha"));
  const revenueMix = parseBrazilianCurrency(getValue("revenueMix"));
  const revenueDelivery = parseBrazilianCurrency(getValue("revenueDelivery"));
  const totalRevenue = revenueCoxinha + revenueMix + revenueDelivery;

  const purchases20 = getNumber("purchases20");

  return {
    reportDate: getValue("reportDate") || "-",
    clients: getNumber("clients"),
    purchases20,
    participants: purchases20,
    morning: getNumber("morning"),
    afternoon: getNumber("afternoon"),
    night: getNumber("night"),
    busiestPeriod: getValue("busiestPeriod"),
    revenueCoxinha,
    revenueMix,
    revenueDelivery,
    totalRevenue,
    averageTicket: parseBrazilianCurrency(getValue("averageTicket")),
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

function updateDashboard() {
  const data = collectReportData();

  setText("viewDate", data.reportDate);
  setText("viewClients", data.clients);
  setText("viewPurchases20", data.purchases20);

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
  setText("summaryPurchases20", data.purchases20);
  setText("summaryParticipants", data.participants);
  setText("summaryDeliverySales", data.deliverySales);
  setText("summaryTotalRevenue", formatCurrency(data.totalRevenue));
}

async function downloadDashboardPng() {
  updateDashboard();

  if (!window.html2canvas) {
    alert("A biblioteca de imagem não carregou. Abra com internet ou publique no GitHub Pages para baixar o PNG.");
    return;
  }

  downloadButton.disabled = true;
  downloadButton.textContent = "Gerando PNG...";

  try {
    const canvas = await html2canvas(dashboard, {
      backgroundColor: "#07110f",
      scale: 2,
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
    downloadButton.disabled = false;
    downloadButton.textContent = "Baixar imagem PNG";
  }
}

updateButton.addEventListener("click", updateDashboard);
downloadButton.addEventListener("click", downloadDashboardPng);

// Atualiza a prévia enquanto a equipe preenche o formulário.
form.addEventListener("input", updateDashboard);
form.addEventListener("change", updateDashboard);

updateDashboard();
