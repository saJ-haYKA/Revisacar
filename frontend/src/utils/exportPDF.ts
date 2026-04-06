import { SECTIONS, STATUS_CONFIG } from "../constants";
import { nowDate, escapeHtml } from "./index";

/**
 * Gera a janela de impressão/PDF da OS.
 * Todos os valores interpolados são sanitizados com escapeHtml.
 */
export const exportPDF = (osHeader, cliente, veiculo, tecnico, selected, checklist, photos) => {
  const activeSections = SECTIONS.filter((s) => selected.has(s.id));

  const statuses = activeSections.flatMap((s) =>
    s.items.map((n) => checklist[`${s.id}:${n}`]?.status)
  );
  const ok   = statuses.filter((v) => v === "ok").length;
  const warn = statuses.filter((v) => v === "warn").length;
  const crit = statuses.filter((v) => v === "crit").length;
  const na   = statuses.filter((v) => v === "na").length;

  const critItems = activeSections.flatMap((s) =>
    s.items
      .filter((n) => checklist[`${s.id}:${n}`]?.status === "crit")
      .map((n) => ({ sec: s.label, name: n, obs: checklist[`${s.id}:${n}`]?.obs }))
  );

  const badgeFor = (status) => {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return `<span class="badge badge-nd">—</span>`;
    return `<span class="badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border}">${cfg.label}</span>`;
  };

  const checklistHTML = activeSections
    .map(
      (sec) => `
    <div class="checklist-section">
      <div class="checklist-head">${escapeHtml(sec.label)}</div>
      ${sec.items
        .map((name) => {
          const d = checklist[`${sec.id}:${name}`];
          return `
        <div class="checklist-item">
          <div>
            <span class="item-name">${escapeHtml(name)}</span>
            ${d?.obs ? `<div class="item-obs">${escapeHtml(d.obs)}</div>` : ""}
          </div>
          ${badgeFor(d?.status)}
        </div>`;
        })
        .join("")}
    </div>`
    )
    .join("");

  const photosHTML =
    photos.length > 0
      ? `
    <hr class="divider">
    <div class="section-title" style="margin-bottom:10px">Registro fotográfico (${photos.length})</div>
    <div class="photos-grid">
      ${photos.map((p) => `<img src="${p.src}" alt="${escapeHtml(p.name)}">`).join("")}
    </div>`
      : "";

  const critHTML =
    critItems.length > 0
      ? `
    <div class="crit-block">
      <div class="crit-title">Itens que requerem atenção crítica</div>
      ${critItems
        .map(
          (ci) => `
      <div class="crit-item">
        <div class="crit-dot"></div>
        <div>
          <span class="crit-sec">${escapeHtml(ci.sec)}</span>
          ${escapeHtml(ci.name)}
          ${ci.obs ? `<div style="font-size:.72rem;color:#6b6860;margin-top:1px">${escapeHtml(ci.obs)}</div>` : ""}
        </div>
      </div>`
        )
        .join("")}
    </div>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OS ${escapeHtml(osHeader.os_num)} — RevisaCar</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1a1a;background:#fff}
@media print{body{padding:0}.no-print{display:none}@page{margin:18mm 16mm;size:A4}}
.page{max-width:820px;margin:0 auto;padding:36px}
.header{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #1a1a1a;padding-bottom:22px;margin-bottom:28px}
.brand-wrap{display:flex;align-items:center;gap:11px}
.brand-bar{width:3px;height:32px;background:#CC1400;border-radius:1.5px;flex-shrink:0}
.brand{font-family:'DM Sans',sans-serif;font-size:1.2rem;font-weight:600;letter-spacing:-.02em;color:#1a1a1a;line-height:1}
.brand span{color:#CC1400}
.brand-sub{font-family:'DM Mono',monospace;font-size:.52rem;color:#a8a5a0;letter-spacing:.14em;text-transform:uppercase;margin-top:3px}
.os-meta{text-align:right;font-family:'DM Mono',monospace;font-size:.68rem;color:#6b6760;line-height:1.8}
.os-meta strong{color:#1a1a1a;font-size:.88rem;font-family:'DM Sans',sans-serif;font-weight:600;display:block;margin-bottom:2px}
.section{margin-bottom:20px}
.section-title{font-family:'DM Mono',monospace;font-size:.58rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9a958c;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.section-title::before{content:'';display:block;width:12px;height:2px;background:#CC1400;border-radius:1px;flex-shrink:0}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
.field{display:flex;flex-direction:column;gap:1px;padding:7px 0;border-bottom:1px solid #f0eeea}
.field-label{font-family:'DM Mono',monospace;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:#b8b5b0}
.field-value{font-size:.85rem;font-weight:500;color:#1a1a1a}
.checklist-section{margin-bottom:18px}
.checklist-head{font-family:'DM Mono',monospace;font-size:.6rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#1a1a1a;padding:7px 0;border-bottom:2px solid #e5e3de;margin-bottom:1px}
.checklist-item{display:flex;align-items:baseline;justify-content:space-between;padding:6px 10px;background:#fff;border-bottom:1px solid #f0eeea;gap:12px}
.checklist-item:nth-child(even){background:#fafaf8}
.item-name{flex:1;font-size:.82rem;color:#1a1a1a}
.item-obs{font-size:.7rem;color:#6b6760;margin-top:2px;font-style:italic}
.badge{font-family:'DM Mono',monospace;font-size:.58rem;font-weight:500;padding:2px 8px;border-radius:3px;white-space:nowrap;flex-shrink:0}
.badge-nd{background:#f5f4f0;color:#b8b5b0;border:1px solid #e5e3de}
.summary-bar{display:flex;margin:22px 0;border:1px solid #e5e3de;border-radius:4px;overflow:hidden}
.summary-cell{flex:1;text-align:center;padding:14px 8px;border-right:1px solid #e5e3de}
.summary-cell:last-child{border-right:none}
.summary-num{font-family:'DM Mono',monospace;font-size:1.5rem;font-weight:300;line-height:1;display:block;letter-spacing:-.02em}
.summary-lbl{font-family:'DM Mono',monospace;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:#b8b5b0;margin-top:4px;display:block}
.crit-block{background:#fef2f2;border:1px solid rgba(204,20,0,0.15);border-radius:4px;padding:14px 16px;margin-bottom:22px;border-left:3px solid #CC1400}
.crit-title{font-family:'DM Mono',monospace;font-size:.6rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#CC1400;margin-bottom:10px}
.crit-item{display:flex;gap:10px;margin-bottom:7px;font-size:.82rem}
.crit-dot{width:5px;height:5px;border-radius:50%;background:#CC1400;margin-top:6px;flex-shrink:0}
.crit-sec{font-family:'DM Mono',monospace;font-size:.55rem;text-transform:uppercase;letter-spacing:.07em;color:#CC1400;display:block;margin-bottom:1px}
.sig-section{border-top:1px solid #e5e3de;padding-top:24px;margin-top:28px;display:flex;justify-content:flex-end}
.sig-box{text-align:center;width:260px}
.sig-line{height:56px;border-bottom:1px solid #1a1a1a;margin-bottom:7px}
.sig-name{font-family:'DM Mono',monospace;font-size:.62rem;color:#9a958c}
.divider{border:none;border-top:1px solid #e5e3de;margin:22px 0}
.photos-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
.photos-grid img{width:100%;height:88px;object-fit:cover;border-radius:3px;border:1px solid #e5e3de}
.print-btn{position:fixed;bottom:24px;right:24px;background:#1a1a1a;color:#fff;border:none;padding:11px 22px;font-family:'DM Mono',monospace;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:4px;transition:.15s}
.print-btn:hover{background:#CC1400}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand-wrap">
      <div class="brand-bar"></div>
      <div>
        <div class="brand">Revisa<span>Car</span></div>
        <div class="brand-sub">Inspeção Veicular</div>
      </div>
    </div>
    <div class="os-meta">
      <strong>OS Nº ${escapeHtml(osHeader.os_num)}</strong>
      Entrada: ${escapeHtml(osHeader.os_date)} às ${escapeHtml(osHeader.os_time)}<br>
      Quilometragem: ${escapeHtml(osHeader.os_km) || "—"}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 36px;margin-bottom:22px">
    <div class="section">
      <div class="section-title">Cliente</div>
      <div class="field"><span class="field-label">Nome</span><span class="field-value">${escapeHtml(cliente.nome) || "—"}</span></div>
      <div class="field"><span class="field-label">CPF / CNPJ</span><span class="field-value">${escapeHtml(cliente.doc) || "—"}</span></div>
      <div class="field"><span class="field-label">Telefone</span><span class="field-value">${escapeHtml(cliente.tel) || "—"}</span></div>
      <div class="field"><span class="field-label">E-mail</span><span class="field-value">${escapeHtml(cliente.email) || "—"}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Veículo</div>
      <div class="grid-2">
        <div class="field"><span class="field-label">Placa</span><span class="field-value">${escapeHtml(veiculo.placa) || "—"}</span></div>
        <div class="field"><span class="field-label">Ano</span><span class="field-value">${escapeHtml(veiculo.ano) || "—"}</span></div>
      </div>
      <div class="field"><span class="field-label">Modelo</span><span class="field-value">${escapeHtml(veiculo.modelo) || "—"}</span></div>
      <div class="grid-2">
        <div class="field"><span class="field-label">Cor</span><span class="field-value">${escapeHtml(veiculo.cor) || "—"}</span></div>
        <div class="field"><span class="field-label">Combustível</span><span class="field-value">${escapeHtml(veiculo.combustivel) || "—"}</span></div>
      </div>
      <div class="field"><span class="field-label">Chassi</span><span class="field-value">${escapeHtml(veiculo.chassi) || "—"}</span></div>
      ${veiculo.obs_entrada ? `<div class="field"><span class="field-label">Obs. entrada</span><span class="field-value">${escapeHtml(veiculo.obs_entrada)}</span></div>` : ""}
    </div>
  </div>

  <hr class="divider">

  <div class="summary-bar">
    <div class="summary-cell" style="color:#1a7f4b"><span class="summary-num">${ok}</span><span class="summary-lbl">OK</span></div>
    <div class="summary-cell" style="color:#b35c00"><span class="summary-num">${warn}</span><span class="summary-lbl">Atenção</span></div>
    <div class="summary-cell" style="color:#CC1400"><span class="summary-num">${crit}</span><span class="summary-lbl">Crítico</span></div>
    <div class="summary-cell"><span class="summary-num">${na}</span><span class="summary-lbl">N/A</span></div>
    <div class="summary-cell"><span class="summary-num" style="color:#1a1a1a">${ok + warn + crit + na}</span><span class="summary-lbl">Avaliados</span></div>
  </div>

  ${critHTML}

  <div class="section-title" style="margin-bottom:14px">Checklist detalhado</div>
  ${checklistHTML}
  ${photosHTML}

  <hr class="divider">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 36px;margin-bottom:20px">
    <div class="section">
      <div class="section-title">Técnico responsável</div>
      <div class="field"><span class="field-label">Nome</span><span class="field-value">${escapeHtml(tecnico.nome) || "—"}</span></div>
      <div class="field"><span class="field-label">Registro / CREA</span><span class="field-value">${escapeHtml(tecnico.registro) || "—"}</span></div>
      <div class="grid-2">
        <div class="field"><span class="field-label">Data saída</span><span class="field-value">${escapeHtml(tecnico.data_saida) || "—"}</span></div>
        <div class="field"><span class="field-label">Hora saída</span><span class="field-value">${escapeHtml(tecnico.hora_saida) || "—"}</span></div>
      </div>
      <div class="field"><span class="field-label">Km saída</span><span class="field-value">${escapeHtml(tecnico.km_saida) || "—"}</span></div>
    </div>
    ${tecnico.parecer_geral ? `
    <div class="section">
      <div class="section-title">Parecer geral</div>
      <div style="font-size:.85rem;line-height:1.65;color:#1a1a1a;padding-top:4px">${escapeHtml(tecnico.parecer_geral)}</div>
    </div>` : ""}
  </div>

  <div class="sig-section">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-name">${escapeHtml(tecnico.nome) || "Técnico responsável"} &nbsp;·&nbsp; ${escapeHtml(tecnico.data_saida) || nowDate()}</div>
    </div>
  </div>
</div>
<button class="print-btn no-print" onclick="window.print()">Imprimir / Salvar PDF</button>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Bloqueador de pop-ups ativo. Permita pop-ups para gerar o PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
};
