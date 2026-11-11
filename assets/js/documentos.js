/* CipaFlow · gerador dos documentos da apuração (Ata de Apuração e Relatório de Integridade)
   O MESMO arquivo roda no navegador (cópia sem assinatura) e na função "assinar-documento"
   do Supabase (cópia assinada com o e-CPF). Não usa nada da página: recebe o jsPDF e os dados. */
(function (G) {
  'use strict';
  const TZ = 'America/Sao_Paulo';
  const fmtDT = iso => iso ? new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—';
  const fmtDM = iso => iso ? new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(',', '') : '—';
  const fmtD = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—';
  const pctN = (a, b) => b ? 100 * a / b : 0;
  const fmtPct = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  const faseNome = f => f === 1 ? '1º período' : 'Prorrogação ' + (f - 1);
  const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

  /* responsável técnico e prestadora do serviço */
  const RT = { nome: 'Jair Ronaldo de Oliveira', titulo: 'Engenheiro de Segurança do Trabalho', registro: 'CREA-SP 5069842910', empresa: 'Responsável técnico · JL Consultoria LTDA – CipaFlow' };
  const EMISSORA = { nome: 'JL Consultoria LTDA', cnpj: '44.984.429/0001-36', contato: 'www.cipaflow.com.br · jroliveira@icloud.com · (11) 91247-6797' };
  const MARCA = [15, 107, 79];
  const MUT = [86, 103, 95];

  const hex2rgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); const n = parseInt(m ? m[1] : '0f6b4f', 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const imgFmt = d => /^data:image\/png/i.test(d) ? 'PNG' : 'JPEG';

  /* SHA-256 próprio: mesmo resultado no navegador e no servidor */
  function sha256hex(str) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const bytes = Array.from(new TextEncoder().encode(str)); const bitLen = bytes.length * 8;
    bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 255);
    let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const r = (x, n) => (x >>> n) | (x << (32 - n)); const W = new Array(64);
    for (let o = 0; o < bytes.length; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) { const s0 = r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) | 0);
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  const baseVerificacao = R => JSON.stringify([R.aptos, R.votantes, R.brancos, R.nulos, R.encerrada_em, R.candidatos.map(c => [c.nome, c.votos, c.condicao])]);
  const hashResultado = R => sha256hex(baseVerificacao(R)).toUpperCase();
  const codigoVerificacao = R => hashResultado(R).slice(0, 16).match(/.{4}/g).join('-');

  function linhaDoTempo(R) {
    const cfg = R.config; const Pp = R.preparacao || {}; const prep = [];
    const add = (x, acao, det) => { if (x && x.em) prep.push({ quando: x.em, ator: x.por || '—', acao, detalhe: det, ordem: prep.length }); };
    add(Pp.empresa, 'Empresa cadastrada no sistema', [cfg.empresa, cfg.cnpj && 'CNPJ ' + cfg.cnpj].filter(Boolean).join(' · '));
    add(Pp.eleitores, 'Base de eleitores importada (planilha)', `${Pp.total_eleitores} empregados cadastrados, ${Pp.aptos} aptos a votar.`);
    add(Pp.candidatos, 'Cadastro de candidatos concluído', `${Pp.total_candidatos} candidato${Pp.total_candidatos === 1 ? '' : 's'} inscrito${Pp.total_candidatos === 1 ? '' : 's'}.`);
    add(Pp.equipe, 'Presidente e membros da comissão eleitoral cadastrados', `Presidente: ${Pp.presidente || '—'}. ${Pp.mesarios} ${Pp.mesarios === 1 ? 'membro' : 'membros'} da comissão eleitoral.`);
    add(Pp.codigos, 'Códigos de acesso gerados', `Cédulas individuais para os ${Pp.aptos} eleitores aptos.`);
    if (Pp.apta_em) prep.push({ quando: Pp.apta_em, ator: 'Sistema', acao: 'Eleição habilitada para abertura', detalhe: 'Todos os requisitos de preparação cumpridos.', ordem: 50 });
    return prep.concat((R.eventos || []).map(e => ({ ...e, ordem: 100 }))).sort((a, b) => Date.parse(a.quando) - Date.parse(b.quando) || a.ordem - b.ordem);
  }

  /* ------------------------------------------------------------------ */
  function kit(jsPDF, cfg, cor) {
    const d = new jsPDF({ unit: 'mm', format: 'a4' });
    const K = { d, W: 210, H: 297, M: 18, y: 18, cor: cor || hex2rgb(cfg.cor) };
    K.CW = K.W - 2 * K.M;
    K.T = (txt, x, yy, o = {}) => { d.setFont(o.f || 'helvetica', o.b ? 'bold' : 'normal'); d.setFontSize(o.s || 10); d.setTextColor(...(o.c || [20, 32, 27])); d.text(txt, x, yy, o.opt || {}); };
    K.quebra = h => { if (K.y + h > K.H - 22) { d.addPage(); K.y = K.M; return true; } return false; };
    K.cabecalho = (titulo, subtitulo) => {
      let lx = K.M;
      if (cfg.logo) { try { const p = d.getImageProperties(cfg.logo); const h = 16, w = Math.min(40, h * p.width / p.height); d.addImage(cfg.logo, imgFmt(cfg.logo), K.M, K.y, w, h); lx = K.M + w + 5; } catch (e) { /* logo inválido */ } }
      K.T(cfg.empresa || '', lx, K.y + 5.5, { b: 1, s: 13 });
      const sub = [cfg.cnpj && 'CNPJ ' + cfg.cnpj, cfg.endereco].filter(Boolean).join(' · ');
      if (sub) K.T(d.splitTextToSize(sub, K.W - K.M - lx), lx, K.y + 11, { s: 8.5, c: MUT });
      K.y += 20; d.setDrawColor(...K.cor); d.setLineWidth(0.8); d.line(K.M, K.y, K.W - K.M, K.y); K.y += 9;
      K.T(titulo, K.M, K.y, { b: 1, s: 15 }); K.y += 6;
      if (subtitulo) { K.T(subtitulo, K.M, K.y, { s: 10, c: MUT }); K.y += 4; }
      K.y += 5;
    };
    K.secao = t => { K.quebra(16); K.T(t.toUpperCase(), K.M, K.y, { b: 1, s: 9.5, c: K.cor }); K.y += 2.5; d.setDrawColor(210, 220, 214); d.setLineWidth(0.2); d.line(K.M, K.y, K.W - K.M, K.y); K.y += 5.5; };
    // parágrafo; com o.j (justificado) as linhas, menos a última, ocupam a largura toda
    K.paragrafo = (t, o = {}) => {
      const w = o.w || K.CW, x0 = o.x || K.M;
      d.setFont('helvetica', o.b ? 'bold' : 'normal'); d.setFontSize(o.s || 10);
      const ls = d.splitTextToSize(t, w);
      ls.forEach((l, i) => {
        K.quebra(6);
        const pal = l.trim().split(/\s+/);
        if (o.j && i < ls.length - 1 && pal.length > 1) {
          d.setFont('helvetica', o.b ? 'bold' : 'normal'); d.setFontSize(o.s || 10);
          const larg = pal.reduce((a, p) => a + d.getTextWidth(p), 0); const esp = (w - larg) / (pal.length - 1);
          let x = x0; pal.forEach(p => { K.T(p, x, K.y, o); x += d.getTextWidth(p) + esp; });
        } else K.T(l, x0, K.y, o);
        K.y += (o.s || 10) * 0.45;
      });
      K.y += 2;
    };
    // sinal de conferência desenhado (a fonte padrão do PDF não tem o caractere ✓)
    K.marca = (x, y, ok, raio) => {
      if (raio) { d.setFillColor(...(ok ? K.cor : [180, 110, 20])); d.circle(x, y, raio, 'F'); }
      const c = raio ? [255, 255, 255] : ok ? K.cor : [180, 110, 20]; const s = raio ? raio * 0.55 : 1.5;
      d.setDrawColor(...c); d.setLineWidth(raio ? 0.7 : 0.45); d.setLineCap && d.setLineCap('round');
      if (ok) d.lines([[s * 0.55, s * 0.6], [s * 1.05, -s * 1.25]], x - s * 0.7, y + s * 0.05);
      else { d.line(x, y - s * 0.8, x, y + s * 0.2); d.circle(x, y + s * 0.65, 0.12, 'S'); }
      d.setLineCap && d.setLineCap('butt');
    };
    // quadro "Declaração do responsável técnico", com o campo da assinatura digital ICP-Brasil (e-CPF)
    // o.carimbo = { nome, data } preenche o campo com a assinatura aplicada pelo servidor
    K.declaracaoRT = (texto, nota, o = {}) => {
      const x = K.M + 5, w = K.CW - 10;
      d.setFont('helvetica', 'normal'); d.setFontSize(9.5); const l1 = d.splitTextToSize(texto, w).length;
      d.setFontSize(8); const l2 = d.splitTextToSize(nota, w).length;
      const h = 7 + l1 * 4.3 + 2 + l2 * 3.6 + 4 + 26 + 4;
      if (!o.novaPagina && K.y + h + 12 > K.H - 22) { d.addPage(); K.y = K.M; }
      K.secao(K.tituloRT || 'Declaração do responsável técnico');
      const y0 = K.y; d.setDrawColor(207, 217, 210); d.setLineWidth(0.3); d.roundedRect(K.M, y0, K.CW, h, 2.5, 2.5);
      K.y = y0 + 7; K.paragrafo(texto, { s: 9.5, j: 1, x, w });
      K.paragrafo(nota, { s: 8, c: MUT, j: 1, x, w }); K.y += 2;
      const bw = w * 0.52, by = K.y;
      const cb = o.carimbo;
      d.setDrawColor(...(cb ? K.cor : [138, 165, 151])); d.setLineWidth(0.4); if (!cb) d.setLineDashPattern([1.6, 1.2], 0); d.setFillColor(...(cb ? [240, 248, 243] : [250, 252, 251]));
      d.roundedRect(x, by, bw, 26, 2, 2, 'FD'); d.setLineDashPattern([], 0);
      K.T('Assinatura digital ICP-Brasil (e-CPF)', x + 4, by + 7, { b: 1, s: 8.5, c: [85, 105, 95] });
      if (cb) {
        K.T('Assinado digitalmente por', x + 4, by + 12.8, { s: 8, c: [60, 77, 69] });
        d.setFont('helvetica', 'bold'); d.setFontSize(9);
        K.T(d.splitTextToSize(cb.nome, bw - 8)[0], x + 4, by + 17.2, { b: 1, s: 9 });
        K.T('Data: ' + cb.data, x + 4, by + 21.6, { s: 8, c: [60, 77, 69] });
      } else {
        K.T('Via sem assinatura digital. A via oficial é', x + 4, by + 12.5, { s: 8, c: [138, 154, 146] });
        K.T('assinada pelo responsável técnico.', x + 4, by + 16.5, { s: 8, c: [138, 154, 146] });
      }
      K.slot = { pagina: d.getNumberOfPages(), x, y: by, w: bw, h: 26 };
      const rx = x + bw + 8;
      K.T(RT.nome, rx, by + 6, { b: 1, s: 11 });
      K.T(RT.titulo, rx, by + 11.5, { s: 8.5, c: [60, 77, 69] });
      K.T(RT.registro, rx, by + 15.6, { s: 8.5, c: [60, 77, 69] });
      K.T(RT.empresa, rx, by + 19.7, { s: 8.5, c: [60, 77, 69] });
      K.T('Confira a assinatura em validar.iti.gov.br', rx, by + 25, { s: 8.5, c: [60, 77, 69] });
      K.y = y0 + h + 6;
    };
    // cols: { t, w, a:'r', f:'courier', m (marca) }; rows: { c:[...], b, fill, ok:[...] }
    K.tabela = (cols, rows, o = {}) => {
      const pad = 2, lh = 3.75, fs = o.s || 9;
      const tint = K.cor.map(v => Math.round(v + (255 - v) * 0.86));
      const head = () => { if (o.semCabecalho) return; d.setFillColor(...tint); d.rect(K.M, K.y, K.CW, 7, 'F'); let x = K.M; cols.forEach(c => { K.T(c.t, c.a === 'r' ? x + c.w - pad : x + pad, K.y + 4.7, { b: 1, s: 8, opt: c.a === 'r' ? { align: 'right' } : {} }); x += c.w; }); K.y += 7; };
      K.quebra(16); head();
      rows.forEach((r, i) => {
        const fo = j => r.semMono ? null : cols[j].f;
        const cells = r.c.map((v, j) => { d.setFont(fo(j) || 'helvetica', r.b ? 'bold' : 'normal'); d.setFontSize(fo(j) ? fs - 0.8 : fs); return cols[j].m ? [''] : d.splitTextToSize(String(v ?? ''), cols[j].w - 2 * pad); });
        const h = Math.max(...cells.map(l => l.length)) * lh + 3.2;
        if (K.y + h > K.H - 22) { d.addPage(); K.y = K.M; head(); }
        if (r.fill) { d.setFillColor(...r.fill); d.rect(K.M, K.y, K.CW, h, 'F'); } else if (i % 2 && !o.semZebra) { d.setFillColor(245, 248, 246); d.rect(K.M, K.y, K.CW, h, 'F'); }
        let x = K.M; cells.forEach((l, j) => {
          if (cols[j].m) K.marca(x + cols[j].w / 2, K.y + 3.3, r.c[j] !== false);
          else K.T(l, cols[j].a === 'r' ? x + cols[j].w - pad : x + pad, K.y + 4.4, { s: fo(j) ? fs - 0.8 : fs, b: r.b, f: fo(j), opt: cols[j].a === 'r' ? { align: 'right' } : {} });
          x += cols[j].w;
        });
        K.y += h;
      });
      d.setDrawColor(210, 220, 214); d.setLineWidth(0.2); d.line(K.M, K.y, K.W - K.M, K.y); K.y += 6;
    };
    K.rodape = txt => { const n = d.getNumberOfPages(); for (let i = 1; i <= n; i++) { d.setPage(i); K.T(txt, K.M, K.H - 10, { s: 7.5, c: [120, 132, 126] }); K.T(`Página ${i} de ${n}`, K.W - K.M, K.H - 10, { s: 7.5, c: [120, 132, 126], opt: { align: 'right' } }); } };
    return K;
  }

  const TXT_DECL = doc => `Declaro, na qualidade de responsável técnico pelo serviço de eleição eletrônica prestado pela JL Consultoria LTDA (CipaFlow), que a eleição acima identificada foi conduzida no sistema conforme os procedimentos descritos ${doc}, que o resultado apresentado corresponde aos dados registrados no banco de dados, sem qualquer alteração manual, e que o sigilo do voto foi preservado.`;

  /* ------------------------------------------------------------------ */
  /* ATA DE APURAÇÃO (para a comissão eleitoral e a empresa)             */
  function ata(jsPDF, R, o = {}) {
    const cfg = R.config; const K = kit(jsPDF, cfg); const d = K.d;
    const cod = codigoVerificacao(R);
    K.cabecalho('ATA DE APURAÇÃO DA ELEIÇÃO DA CIPA', [cfg.titulo, cfg.gestao && 'Gestão ' + cfg.gestao].filter(Boolean).join(' · '));
    K.secao('1. Andamento da votação');
    K.tabela([{ t: 'Data e hora', w: 32 }, { t: 'Evento', w: 44 }, { t: 'Responsável', w: 36 }, { t: 'Detalhe', w: K.CW - 112 }],
      linhaDoTempo(R).map(e => ({ c: [fmtDT(e.quando), e.acao, e.ator, e.detalhe] })));
    K.secao('2. Participação');
    const meta = R.fase === 1 ? '50% dos eleitores aptos' : '1/3 dos eleitores aptos (prorrogação)';
    K.tabela([{ t: 'Item', w: 90 }, { t: 'Valor', w: K.CW - 90, a: 'r' }], [
      { c: ['Eleitores aptos', R.aptos] }, { c: ['Votantes', R.votantes] }, { c: ['Participação', fmtPct(pctN(R.votantes, R.aptos))] },
      { c: ['Períodos de votação', R.fase === 1 ? '1 (sem prorrogação)' : `${R.fase} (${R.fase - 1} prorrogação${R.fase > 2 ? 'ões' : ''})`] },
      { c: ['Mínimo exigido no último período', R.encerramento_tipo === 'administrativo' ? 'Não verificado (encerramento administrativo)' : meta] }]);
    K.secao('3. Apuração');
    const tot = R.total_votos || 0;
    K.tabela([{ t: '#', w: 9, a: 'r' }, { t: 'Candidato', w: 74 }, { t: 'Setor', w: 34 }, { t: 'Admissão', w: 24 }, { t: 'Votos', w: 16, a: 'r' }, { t: '%', w: K.CW - 157, a: 'r' }],
      R.candidatos.map(c => ({ c: [c.posicao, `${c.apelido} (${c.nome})`, c.setor, fmtD(c.admissao), c.votos, fmtPct(pctN(c.votos, tot))] }))
        .concat([{ c: ['', 'Votos em branco', '', '', R.brancos, fmtPct(pctN(R.brancos, tot))] }, { c: ['', 'Votos nulos', '', '', R.nulos, fmtPct(pctN(R.nulos, tot))] },
          { c: ['', 'Total de votos', '', '', tot, '100,0%'], b: true }]));
    K.paragrafo('Candidatos em ordem de votação. Critério de desempate: maior tempo de serviço no estabelecimento (data de admissão mais antiga).', { s: 8.5, c: MUT, j: 1 });
    K.secao('4. Encerramento');
    const adm = R.encerramento_tipo === 'administrativo';
    K.paragrafo('A votação foi realizada por meio eletrônico, com identificação individual do eleitor por matrícula, data de nascimento e código de acesso de uso único, garantindo um voto por eleitor e o sigilo do voto. ' + (adm
      ? `A votação foi ENCERRADA ADMINISTRATIVAMENTE em ${fmtDT(R.encerrada_em)} por ${R.encerrada_por}, administrador do sistema, sem a verificação automática de prazo e de participação mínima. A apuração foi feita pelo sistema no momento do encerramento.`
      : `A votação foi encerrada em ${fmtDT(R.encerrada_em)}, a pedido de ${R.encerrada_por}, Presidente da Comissão Eleitoral, com a confirmação dos membros da comissão eleitoral ${(R.confirmacoes_encerramento || []).map(c => c.nome).join(', ') || '—'}. A apuração foi feita automaticamente pelo sistema no momento do encerramento.`), { j: 1 });
    if (adm) K.paragrafo(`Justificativa do encerramento administrativo: ${R.justificativa}`, { b: 1, s: 9.5, j: 1 });
    K.paragrafo(`Código de verificação deste resultado: ${cod}`, { b: 1, s: 9.5 });
    K.paragrafo('O Relatório de Integridade da Eleição, emitido pela CipaFlow e assinado digitalmente pelo responsável técnico, traz o resultado integral, as conferências de consistência, o registro completo das atividades da eleição e a impressão digital eletrônica (SHA-256) do resultado. O código de verificação acima corresponde aos 16 primeiros caracteres dessa impressão digital e permite comparar os dois documentos.', { s: 8.5, c: MUT, j: 1 });
    const eq = R.equipe || [];
    K.quebra(16 + 9 * (eq.length + 1));
    K.secao('5. Comissão eleitoral');
    K.tabela([{ t: 'Nome', w: 84 }, { t: 'Matrícula', w: 32 }, { t: 'Função', w: K.CW - 116 }],
      eq.map(m => ({ c: [m.nome, m.matricula || '—', m.perfil === 'presidente' ? 'Presidente da Comissão Eleitoral' : 'Membro da Comissão Eleitoral'] })));
    K.tituloRT = '6. Declaração do responsável técnico';
    K.declaracaoRT(TXT_DECL('nesta ata'),
      'Esta ata registra a apuração do processo eletrônico. A ata de eleição e posse prevista na NR-5 é de responsabilidade da empresa e de sua comissão eleitoral.', { carimbo: o.carimbo });
    K.rodape(`CipaFlow · Ata de apuração · ${cfg.empresa} · verificação ${cod}`);
    return { d, K, nome: `ata-apuracao-cipa-${slug(cfg.empresa)}${o.carimbo ? '-assinada' : ''}.pdf`, codigo: cod };
  }

  /* ------------------------------------------------------------------ */
  /* RELATÓRIO DE INTEGRIDADE DA ELEIÇÃO (emitido pela CipaFlow)          */
  const ALTERACOES = ['Eleitores importados', 'Candidato cadastrado', 'Candidato alterado', 'Candidato excluído', 'Códigos gerados', 'Equipe alterada'];
  function analise(R, L) {
    const logAsc = (L || []).slice().sort((a, b) => Date.parse(a.quando) - Date.parse(b.quando) || (a.id || 0) - (b.id || 0));
    const tot = R.total_votos || 0;
    const ab = Date.parse(R.aberta_em || 0), fe = Date.parse(R.encerrada_em || 0);
    const durante = l => { const t = Date.parse(l.quando); return R.aberta_em && t >= ab && (!R.encerrada_em || t <= fe); };
    const alteracoes = logAsc.filter(l => ALTERACOES.includes(l.acao) && durante(l)).length;
    const reemitidos = logAsc.filter(l => l.acao === 'Código reemitido').length;
    const adm = R.encerramento_tipo === 'administrativo';
    const cfg = R.config;
    const minimo = R.fase === 1 ? R.votantes * 2 >= R.aptos : R.votantes * 3 >= R.aptos;
    const nConf = (R.confirmacoes_encerramento || []).length, nNec = cfg.confirmacoes_necessarias || nConf;
    return { logAsc, tot, alteracoes, reemitidos, adm, minimo, nConf, nNec, consistente: tot === R.votantes, integro: tot === R.votantes && alteracoes === 0 && !adm && minimo && nConf >= nNec };
  }
  function relatorio(jsPDF, R, L, o = {}) {
    const cfg = R.config; const K = kit(jsPDF, cfg, MARCA); const d = K.d; const A = analise(R, L);
    const hash = hashResultado(R); const cod = hash.slice(0, 16).match(/.{4}/g).join('-');
    const hashLog = sha256hex(JSON.stringify(A.logAsc.map(l => [l.quando, l.ator, l.acao, l.detalhe]))).toUpperCase();
    const agora = o.agora || new Date().toISOString();
    const pct = fmtPct(pctN(R.votantes, R.aptos));

    // cabeçalho CipaFlow
    const y0 = K.y; const ix = K.M, iy = y0 + 1.2, is = 6.2;
    d.setDrawColor(...MARCA); d.setLineWidth(0.75); d.roundedRect(ix, iy, is, is, 1, 1, 'S');
    d.setLineWidth(0.85); d.setLineCap && d.setLineCap('round'); d.lines([[1.3, 1.35], [2.6, -2.95]], ix + 1.6, iy + 3.4); d.setLineCap && d.setLineCap('butt');
    K.T('cipa', ix + is + 2.2, y0 + 6.2, { b: 1, s: 17 }); d.setFont('helvetica', 'bold'); d.setFontSize(17);
    K.T('flow', ix + is + 2.2 + d.getTextWidth('cipa'), y0 + 6.2, { b: 1, s: 17, c: MARCA });
    d.setFont('helvetica', 'normal'); d.setFontSize(8);
    const e1 = `Emitido por ${EMISSORA.nome} · CNPJ ${EMISSORA.cnpj}`;
    K.T(e1, K.W - K.M, y0 + 2.6, { s: 8, c: MUT, opt: { align: 'right' } });
    K.T(EMISSORA.contato, K.W - K.M, y0 + 6.3, { s: 8, c: MUT, opt: { align: 'right' } });
    K.y = y0 + 9.5; d.setDrawColor(...MARCA); d.setLineWidth(0.7); d.line(K.M, K.y, K.W - K.M, K.y);
    K.y += 10; K.T('Relatório de Integridade da Eleição da CIPA', K.M, K.y, { b: 1, s: 18 });
    K.y += 6; d.setFont('helvetica', 'normal'); d.setFontSize(10); K.T(d.splitTextToSize([cfg.empresa, cfg.titulo, cfg.gestao && 'Gestão ' + cfg.gestao].filter(Boolean).join(' · '), K.CW), K.M, K.y, { s: 10, c: MUT });
    K.y += 6;

    // selo
    const sh = 15, sy = K.y; const ok = A.integro;
    const fundo = ok ? [220, 241, 227] : [253, 240, 214], borda = ok ? [159, 207, 178] : [222, 186, 120];
    d.setFillColor(...fundo); d.setDrawColor(...borda); d.setLineWidth(0.3); d.roundedRect(K.M, sy, K.CW, sh, 2, 2, 'FD');
    K.marca(K.M + 7, sy + sh / 2, ok, 3.9);
    const t1 = ok ? 'Eleição íntegra: nenhuma inconsistência encontrada.'
      : !A.consistente ? 'Atenção: inconsistência encontrada. Veja o item 3.'
      : A.adm ? 'Eleição encerrada administrativamente. Veja a justificativa no item 5.'
      : 'Atenção: há pontos que pedem verificação. Veja os itens 3 e 4.';
    const t2 = ok ? 'Votos registrados = eleitores que votaram · regras da NR-5 cumpridas no sistema · registro de atividades completo.'
      : `Votos registrados ${A.consistente ? '=' : 'diferente de'} eleitores que votaram · ${A.adm ? 'sem verificação automática de prazo e participação mínima' : 'confira as linhas marcadas com !'}.`;
    K.T(t1, K.M + 14, sy + 6.2, { b: 1, s: 10 });
    K.T(d.splitTextToSize(t2, K.CW - 64), K.M + 14, sy + 10.6, { s: 8.2, c: [40, 55, 48] });
    K.T('CÓDIGO DE VERIFICAÇÃO', K.W - K.M - 4, sy + 5.8, { s: 6.8, c: MUT, opt: { align: 'right' } });
    K.T(cod, K.W - K.M - 4, sy + 11, { f: 'courier', b: 1, s: 11, opt: { align: 'right' } });
    K.y = sy + sh + 3;

    // resumo em 4 quadros
    const rh = 13, cw = K.CW / 4, ry = K.y;
    const resumo = [['ELEITORES APTOS', String(R.aptos)], ['VOTANTES', `${R.votantes} (${pct})`],
      ['PERÍODO DE VOTAÇÃO', `${fmtDM(R.aberta_em)} – ${fmtDM(R.encerrada_em)}`], ['ENCERRAMENTO', A.adm ? 'Administrativo' : 'Normal · comissão']];
    d.setDrawColor(207, 217, 210); d.setLineWidth(0.3); d.roundedRect(K.M, ry, K.CW, rh, 2, 2, 'S');
    resumo.forEach(([k, v], i) => {
      const x = K.M + i * cw; if (i) d.line(x, ry, x, ry + rh);
      K.T(k, x + 3, ry + 4.6, { s: 6.6, c: MUT });
      d.setFont('helvetica', 'bold'); let fs = 11; d.setFontSize(fs); while (d.getTextWidth(v) > cw - 6 && fs > 7) { fs -= 0.5; d.setFontSize(fs); }
      K.T(v, x + 3, ry + 10.2, { b: 1, s: fs });
    });
    K.y = ry + rh + 7;

    // 1. identificação
    const eq = R.equipe || [];
    K.secao('1. Identificação');
    K.tabela([{ t: 'Item', w: 58 }, { t: 'Informação', w: K.CW - 58 }], [
      { c: ['Empresa contratante', [cfg.empresa, cfg.cnpj && 'CNPJ ' + cfg.cnpj].filter(Boolean).join(' · ')] },
      { c: ['Estabelecimento', cfg.endereco || '—'] },
      { c: ['Eleição', [cfg.titulo, cfg.gestao && 'Gestão ' + cfg.gestao].filter(Boolean).join(' · ')] },
      { c: ['Comissão eleitoral', eq.map(m => m.nome + (m.perfil === 'presidente' ? ' (presidente)' : '')).join(' · ') || '—'] },
      { c: ['Vagas', `${cfg.vagas_titulares} titulares e ${cfg.vagas_suplentes} suplentes`] },
      { c: ['Endereço da votação', cfg.url_site || 'www.cipaflow.com.br/votar'] },
      { c: ['Serviço prestado por', `${EMISSORA.nome} (CipaFlow) · responsável técnico ${RT.nome}`] }]);

    // 2. resultado
    K.secao('2. Resultado da apuração');
    const tot = A.tot;
    K.tabela([{ t: '#', w: 9, a: 'r' }, { t: 'Candidato', w: 74 }, { t: 'Setor', w: 34 }, { t: 'Admissão', w: 24 }, { t: 'Votos', w: 16, a: 'r' }, { t: '%', w: K.CW - 157, a: 'r' }],
      R.candidatos.map(c => ({ c: [c.posicao, `${c.apelido} (${c.nome})`, c.setor, fmtD(c.admissao), c.votos, fmtPct(pctN(c.votos, tot))] }))
        .concat([{ c: ['', 'Votos em branco', '', '', R.brancos, fmtPct(pctN(R.brancos, tot))] }, { c: ['', 'Votos nulos', '', '', R.nulos, fmtPct(pctN(R.nulos, tot))] },
          { c: ['', 'Total de votos', '', '', tot, '100,0%'], b: true }]));
    K.paragrafo('Critério de desempate: maior tempo de serviço no estabelecimento (data de admissão mais antiga).', { s: 8, c: MUT, j: 1 });

    // 3. consistência
    K.secao('3. Conferência de consistência');
    K.tabela([{ t: '', w: 8, m: 1 }, { t: 'Verificação', w: 122 }, { t: 'Resultado', w: K.CW - 130, a: 'r' }], [
      { c: [A.consistente, 'Votos registrados na urna × eleitores marcados como "já votou"', A.consistente ? `${tot} = ${R.votantes}` : `${tot} e ${R.votantes}`] },
      { c: [A.consistente, 'Eleitores que votaram mais de uma vez', String(Math.max(0, tot - R.votantes))] },
      { c: [true, 'Votos aceitos fora do período de votação *', '0'] },
      { c: [A.alteracoes === 0, 'Alterações na lista de eleitores, candidatos ou equipe durante a votação', String(A.alteracoes)] },
      { c: [true, 'Códigos de acesso reemitidos pela comissão (registrados)', String(A.reemitidos)] },
      { c: [true, 'Contagem por candidato acessada antes do encerramento *', 'nunca'] },
      { c: [true, 'Participação por período', (R.votos_por_fase || []).map(f => `${faseNome(f.fase)}: ${f.votos}`).join(' · ') || '—'] }]);
    K.paragrafo('Os itens com * são garantidos pelas regras do banco de dados, que recusam a operação; os demais são conferidos nos dados e no registro de atividades da eleição. Cada voto é gravado na mesma operação que marca o eleitor como "já votou"; por isso os dois números devem ser idênticos.', { s: 8, c: MUT, j: 1 });

    // 4. NR-5
    K.secao('4. Conformidade do processo com a NR-5');
    const linhaMin = R.fase === 1
      ? ['Participação mínima de 50% dos empregados no 1º período', `${pct} · sem prorrogação`]
      : ['Participação mínima de 1/3 dos empregados após a prorrogação', `${pct} · ${R.fase - 1} prorrogaç${R.fase > 2 ? 'ões' : 'ão'}`];
    K.tabela([{ t: '', w: 8, m: 1 }, { t: 'Requisito verificado pelo sistema', w: 112 }, { t: 'Situação', w: K.CW - 120 }], [
      { c: [true, 'Voto secreto: voto gravado sem nome, matrícula ou horário', 'Cumprido'] },
      { c: [A.consistente, 'Um voto por empregado apto, com identificação individual', A.consistente ? 'Cumprido' : 'Verificar item 3'] },
      { c: [A.adm ? false : A.minimo, linhaMin[0], A.adm ? 'Não verificado (encerramento administrativo)' : linhaMin[1]] },
      { c: [!A.adm && A.nConf >= A.nNec, 'Encerramento confirmado pela comissão eleitoral', A.adm ? 'Encerramento administrativo' : `${A.nConf} de ${A.nNec} confirmações`] },
      { c: [true, 'Desempate pelo maior tempo de serviço', 'Aplicado'] }]);
    if (A.adm) K.paragrafo(`Encerramento administrativo em ${fmtDT(R.encerrada_em)} por ${R.encerrada_por}. Justificativa registrada: ${R.justificativa || '—'}`, { s: 8.5, b: 1, j: 1 });

    // 5. linha do tempo
    K.secao('5. Linha do tempo da eleição');
    K.tabela([{ t: 'Data e hora', w: 32 }, { t: 'Evento', w: 46 }, { t: 'Responsável', w: 34 }, { t: 'Detalhe', w: K.CW - 112 }],
      linhaDoTempo(R).map(e => ({ c: [fmtDT(e.quando), e.acao, e.ator, e.detalhe] })), { s: 8.6 });

    // 6. autenticação
    K.secao('6. Elementos de autenticação');
    K.tabela([{ t: 'Elemento', w: 66 }, { t: 'Valor', w: K.CW - 66, f: 'courier' }], [
      { c: ['Código de verificação', cod], b: true },
      { c: ['Impressão digital do resultado (SHA-256)', hash.match(/.{16}/g).join(' ')] },
      { c: ['Impressão digital do registro de atividades (SHA-256)', hashLog.match(/.{16}/g).join(' ')] },
      { c: ['Registro completo de atividades', `${A.logAsc.length} registros · item 8`], semMono: 1 },
      { c: ['Emitido em', fmtDT(agora) + ' (horário de Brasília)'], semMono: 1 }]);
    K.paragrafo('Qualquer alteração nos números da apuração, nos nomes dos candidatos ou na data de encerramento produz uma impressão digital diferente. O código de verificação é o mesmo impresso na Ata de Apuração da comissão eleitoral. A JL Consultoria LTDA mantém os dados de verificação pelo prazo previsto na Política de Privacidade.', { s: 8, c: MUT, j: 1 });

    // 7. garantias
    K.secao('7. Garantias técnicas do sistema');
    ['Voto secreto: nenhum vínculo entre o voto e o eleitor; nenhum perfil, inclusive o administrador, vê a contagem antes do encerramento.',
      'Identificação individual por matrícula, data de nascimento e código de uso único; senhas e códigos guardados apenas como hash.',
      'Prazo, participação mínima, prorrogação e encerramento controlados automaticamente, com confirmações registradas da comissão.',
      'Datas e horários do servidor do banco de dados, no horário de Brasília.'
    ].forEach(t => K.paragrafo('•  ' + t, { s: 9, j: 1 }));

    // 8. registro completo
    K.secao('8. Registro completo de atividades');
    K.paragrafo(`${A.logAsc.length} registros, em ordem cronológica. O registro não contém nenhuma informação sobre em quem cada eleitor votou.`, { s: 8, c: MUT });
    K.tabela([{ t: 'Data e hora', w: 32 }, { t: 'Quem', w: 36 }, { t: 'Ação', w: 46 }, { t: 'Detalhe', w: K.CW - 114 }],
      A.logAsc.map(l => ({ c: [fmtDT(l.quando), l.ator, l.acao, l.detalhe] })), { s: 8.4 });

    // 9. declaração, sempre sozinha na última página
    d.addPage(); K.y = K.M;
    K.tituloRT = '9. Declaração do responsável técnico';
    K.declaracaoRT(TXT_DECL('neste relatório'),
      'Este relatório atesta a integridade do processo eletrônico. A ata de eleição e posse prevista na NR-5 é de responsabilidade da empresa e de sua comissão eleitoral.', { carimbo: o.carimbo, novaPagina: true });
    K.rodape(`CipaFlow · Relatório de integridade · ${cfg.empresa} · verificação ${cod}`);
    return { d, K, nome: `relatorio-integridade-cipa-${slug(cfg.empresa)}${o.carimbo ? '-assinado' : ''}.pdf`, codigo: cod, integro: A.integro };
  }

  G.CipaDocs = { ata, relatorio, kit, sha256hex, codigoVerificacao, linhaDoTempo, baseVerificacao, RT, slug, fmtDT };
})(typeof window !== 'undefined' ? window : globalThis);
