/**
 * ELISEE WORLD — UI GBA (layout identico ai video di riferimento)
 * Finestre bianche bordo nero, HUD argento, barre HP, menu 2x2, party verde.
 */
(function (global) {
  'use strict';

  var last = {
    command: [],
    moves: [],
    party: [],
    bag: [],
    cancel: null,
    pockets: []
  };

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function inRect(px, py, r) {
    return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  function hitIndex(list, px, py) {
    if (!list) return -1;
    for (var i = 0; i < list.length; i++) {
      if (inRect(px, py, list[i])) return i;
    }
    return -1;
  }

  function drawGbaWindow(ctx, x, y, w, h) {
    ctx.fillStyle = '#101010';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = '#f7f3e8';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    ctx.strokeStyle = '#c8c4b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  }

  function hpColor(pct) {
    if (pct > 0.5) return '#40c840';
    if (pct > 0.2) return '#f0c020';
    return '#e04040';
  }

  function drawHpBar(ctx, x, y, w, pct, withLabel) {
    pct = Math.max(0, Math.min(1, pct));
    var barX = x;
    var barW = w;
    if (withLabel !== false) {
      ctx.fillStyle = '#f8e000';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('HP', x, y + 4);
      barX = x + 18;
      barW = w - 18;
    }
    ctx.fillStyle = '#202020';
    ctx.fillRect(barX - 1, y - 1, barW + 2, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barX, y, barW, 8);
    ctx.fillStyle = '#101010';
    ctx.fillRect(barX + 1, y + 1, barW - 2, 6);
    ctx.fillStyle = hpColor(pct);
    ctx.fillRect(barX + 1, y + 1, Math.max(0, Math.floor((barW - 2) * pct)), 6);
  }

  function drawHudBox(ctx, x, y, w, h, info) {
    info = info || {};
    ctx.fillStyle = '#d8d4c8';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 2;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 7);
    ctx.stroke();
    ctx.fillStyle = '#ece8dc';
    ctx.fillRect(x + 6, y + 5, w - 12, h - 10);

    var name = String(info.name || '???');
    if (name.length > 12) name = name.slice(0, 11);
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(name, x + 12, y + 8);

    var gender = info.gender === 'F' ? '\u2640' : '\u2642';
    ctx.fillStyle = info.gender === 'F' ? '#d06090' : '#3070c0';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(gender, x + w - 78, y + 8);

    ctx.fillStyle = '#101010';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('Lv.' + (info.level || 1), x + w - 58, y + 8);

    var max = info.hpMax || 1;
    var cur = Math.max(0, info.hp == null ? max : info.hp);
    drawHpBar(ctx, x + 12, y + 28, w - 24, cur / max, true);

    if (info.showNumbers) {
      ctx.fillStyle = '#101010';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(cur + '/' + max, x + w - 12, y + 42);
    }
  }

  function drawPillButton(ctx, x, y, w, h, label, color, selected) {
    ctx.fillStyle = selected ? color : '#f0ece0';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = selected ? '#101010' : color;
    ctx.lineWidth = selected ? 3 : 2.5;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 9);
    ctx.stroke();
    ctx.fillStyle = selected ? '#ffffff' : '#101010';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var t = String(label || '-');
    if (t.length > 14) t = t.slice(0, 13);
    ctx.fillText(t, x + w / 2, y + h / 2 + 1);
  }

  function drawCommandMenu(ctx, x, y, w, h, selected, prompt) {
    last.command = [];
    var leftW = Math.floor(w * 0.46);
    drawGbaWindow(ctx, x, y, leftW, h);
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var lines = String(prompt || 'Cosa deve fare?').split('\n');
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, x + 12, y + 14 + i * 20);
    });

    var gridX = x + leftW + 8;
    var gridW = w - leftW - 8;
    var btnW = (gridW - 8) / 2;
    var btnH = (h - 10) / 2;
    var labels = [
      { t: 'TATTICA', c: '#e878a0' },
      { t: 'BORSONE', c: '#d4a04a' },
      { t: 'PANCHINA', c: '#58a048' },
      { t: 'RUN', c: '#4890d0' }
    ];
    labels.forEach(function (b, i) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      var bx = gridX + col * (btnW + 8);
      var by = y + 4 + row * (btnH + 4);
      var bw = btnW;
      var bh = btnH - 2;
      drawPillButton(ctx, bx, by, bw, bh, b.t, b.c, selected === i);
      last.command.push({ x: bx, y: by, w: bw, h: bh, i: i });
    });
  }

  function drawMoveMenu(ctx, x, y, w, h, moves, selected) {
    last.moves = [];
    moves = moves || [];
    var leftW = Math.floor(w * 0.72);
    var btnW = (leftW - 10) / 2;
    var btnH = (h - 10) / 2;
    var colors = ['#70a050', '#8b6914', '#4890d0', '#c07030'];
    for (var i = 0; i < 4; i++) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      var bx = x + 4 + col * (btnW + 6);
      var by = y + 4 + row * (btnH + 4);
      var mv = moves[i];
      var label = mv ? mv.name : '-';
      drawPillButton(ctx, bx, by, btnW, btnH - 2, label, colors[i], selected === i && !!mv);
      last.moves.push({ x: bx, y: by, w: btnW, h: btnH - 2, i: i });
    }
    var px = x + leftW + 6;
    var pw = w - leftW - 6;
    drawGbaWindow(ctx, px, y, pw, h);
    var cur = moves[selected] || moves[0] || { type: '—', currentPp: 0, pp: 0 };
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(String(cur.type || 'RUOLO'), px + pw / 2, y + 16);
    ctx.font = 'bold 12px monospace';
    ctx.fillText('PP: ' + (cur.currentPp != null ? cur.currentPp : (cur.pp || 0)) + '/' + (cur.pp || 0), px + pw / 2, y + 44);
  }

  function drawPortrait(ctx, x, y, size, member) {
    member = member || {};
    var jersey = member.jersey || '#1d4ed8';
    var hair = member.hair || '#1e293b';
    var skin = member.skin || '#f1c7a8';
    ctx.fillStyle = '#d8ecf8';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#203040';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    var s = size / 28;
    ctx.save();
    ctx.translate(x + size / 2, y + size * 0.72);
    ctx.scale(s, s);
    ctx.fillStyle = skin;
    ctx.fillRect(-8, -22, 16, 14);
    ctx.fillStyle = hair;
    ctx.fillRect(-9, -28, 18, 10);
    ctx.fillStyle = jersey;
    ctx.fillRect(-11, -10, 22, 16);
    ctx.fillStyle = '#111';
    ctx.fillRect(-5, -16, 2, 2);
    ctx.fillRect(3, -16, 2, 2);
    ctx.restore();
  }

  function drawBackPlayer(ctx, cx, cy, jersey, name) {
    jersey = jersey || '#1d4ed8';
    var s = 1.35;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-14, -52, 28, 16);
    ctx.fillStyle = jersey;
    ctx.fillRect(-18, -38, 36, 30);
    ctx.fillStyle = '#f8f8f8';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var tag = String(name || '').toUpperCase().slice(0, 8);
    ctx.fillText(tag, 0, -22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-16, -8, 32, 12);
    ctx.fillStyle = jersey;
    ctx.fillRect(-16, 4, 10, 14);
    ctx.fillRect(6, 4, 10, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-16, 16, 10, 5);
    ctx.fillRect(6, 16, 10, 5);
    ctx.restore();
  }

  function drawFrontPlayer(ctx, cx, cy, jersey, hair) {
    jersey = jersey || '#dc2626';
    hair = hair || '#1e293b';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1c7a8';
    ctx.fillRect(-10, -48, 20, 16);
    ctx.fillStyle = hair;
    ctx.fillRect(-11, -54, 22, 10);
    ctx.fillStyle = jersey;
    ctx.fillRect(-14, -32, 28, 24);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-12, -8, 24, 10);
    ctx.fillStyle = jersey;
    ctx.fillRect(-12, 2, 8, 16);
    ctx.fillRect(4, 2, 8, 16);
    ctx.fillStyle = '#111';
    ctx.fillRect(-12, 16, 8, 4);
    ctx.fillRect(4, 16, 8, 4);
    ctx.fillStyle = '#111';
    ctx.fillRect(-6, -40, 3, 3);
    ctx.fillRect(3, -40, 3, 3);
    ctx.restore();
  }

  function drawPlatform(ctx, cx, cy, rx, ry) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, rx + 6, ry + 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c4b896';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcb8';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,70,50,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawCancelBtn(ctx, x, y, w, h) {
    ctx.fillStyle = '#1d4ed8';
    roundRect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#0b1f66';
    ctx.lineWidth = 2;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 5);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CANCEL', x + w / 2, y + h / 2 + 1);
    last.cancel = { x: x, y: y, w: w, h: h };
  }

  function drawPartyCard(ctx, x, y, w, h, member, selected) {
    if (!member) {
      ctx.fillStyle = '#7ec8c0';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#5aa8a4';
      roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 4);
      ctx.fill();
      return;
    }
    ctx.fillStyle = selected ? '#3cb03c' : '#2e9a46';
    roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = '#e02020';
      ctx.lineWidth = 3;
      roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, 7);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#1e5c28';
      ctx.lineWidth = 2;
      roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 7);
      ctx.stroke();
    }

    ctx.fillStyle = '#f4f0e0';
    ctx.fillRect(x + 8, y + 8, 18, 18);
    ctx.strokeStyle = '#203040';
    ctx.strokeRect(x + 8.5, y + 8.5, 17, 17);
    ctx.fillStyle = '#203040';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u26A1', x + 17, y + 18);

    drawPortrait(ctx, x + 30, y + 6, 28, member);

    ctx.fillStyle = '#101010';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var nm = String(member.name || '???');
    if (nm.length > 12) nm = nm.slice(0, 11);
    ctx.fillText(nm, x + 64, y + 8);

    ctx.fillStyle = member.gender === 'F' ? '#d06090' : '#3070c0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(member.gender === 'F' ? '\u2640' : '\u2642', x + w - 10, y + 8);

    var max = member.hpMax || 1;
    var cur = Math.max(0, member.currentHp == null ? max : member.currentHp);
    drawHpBar(ctx, x + 64, y + 28, w - 78, cur / max, true);

    ctx.fillStyle = '#101010';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Lv.' + (member.level || 1), x + 10, y + h - 8);
    ctx.textAlign = 'right';
    ctx.fillText(cur + ' / ' + max, x + w - 10, y + h - 8);
  }

  function drawPartyScreen(ctx, w, h, party, selectedIndex, prompt) {
    last.party = [];
    last.cancel = null;
    ctx.fillStyle = '#5aa8b0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#4a98a4';
    for (var gy = 0; gy < h; gy += 8) {
      ctx.fillRect(0, gy, w, 1);
    }

    var gridX = 12;
    var gridY = 12;
    var botH = 70;
    var gridW = w - 24;
    var gridH = h - botH - 24;
    var cardW = Math.floor((gridW - 12) / 2);
    var cardH = Math.floor((gridH - 16) / 3);
    var list = party || [];

    for (var i = 0; i < 6; i++) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      var bx = gridX + col * (cardW + 12);
      var by = gridY + row * (cardH + 8);
      drawPartyCard(ctx, bx, by, cardW, cardH, list[i] || null, selectedIndex === i);
      last.party.push({ x: bx, y: by, w: cardW, h: cardH, i: i });
    }

    var cur = list[selectedIndex];
    var boxX = 12;
    var boxY = h - botH + 4;
    var boxW = w - 140;
    drawGbaWindow(ctx, boxX, boxY, boxW, botH - 12);
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var msg = prompt || (cur ? ('Che fare con ' + cur.name + '?') : 'Scegli un atleta o annulla.');
    ctx.fillText(msg, boxX + 14, boxY + (botH - 12) / 2);

    drawCancelBtn(ctx, w - 118, boxY + 8, 100, botH - 28);
  }

  function drawBagScreen(ctx, w, h, items, selectedIndex, pocketName) {
    last.bag = [];
    last.cancel = null;
    ctx.fillStyle = '#3a6a8c';
    ctx.fillRect(0, 0, w, h);

    drawGbaWindow(ctx, 12, 12, 150, 40);
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pocketName || 'BORSONE', 87, 32);

    var listX = 12;
    var listY = 60;
    var listW = w - 24;
    var rowH = 28;
    var vis = 8;
    items = items || [];
    var start = Math.max(0, selectedIndex - vis + 1);
    drawGbaWindow(ctx, listX, listY, listW, vis * rowH + 16);

    for (var n = 0; n < vis; n++) {
      var idx = start + n;
      var it = items[idx];
      var ry = listY + 8 + n * rowH;
      if (idx === selectedIndex) {
        ctx.fillStyle = '#d0e8f8';
        ctx.fillRect(listX + 8, ry, listW - 16, rowH - 2);
      }
      if (it) {
        ctx.fillStyle = '#101010';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx === selectedIndex ? '\u25B6 ' : '  ') + it.name, listX + 16, ry + 12);
        ctx.textAlign = 'right';
        ctx.fillText('\u00d7' + (it.qty != null ? it.qty : 1), listX + listW - 16, ry + 12);
        last.bag.push({ x: listX + 8, y: ry, w: listW - 16, h: rowH - 2, i: idx });
      }
    }

    var desc = items[selectedIndex];
    var dy = h - 86;
    drawGbaWindow(ctx, 12, dy, w - 140, 70);
    ctx.fillStyle = '#101010';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var dtxt = desc ? (desc.desc || desc.descrizione || '') : 'Il borsone è vuoto.';
    wrapText(ctx, dtxt, 26, dy + 12, w - 170, 16);
    drawCancelBtn(ctx, w - 118, dy + 16, 100, 40);
  }

  function wrapText(ctx, text, x, y, maxW, lh) {
    var words = String(text || '').split(' ');
    var line = '';
    var yy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line, x, yy);
        line = words[i] + ' ';
        yy += lh;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, yy);
  }

  function drawTitle(ctx, w, h, blink) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b1a3a');
    g.addColorStop(0.55, '#12305c');
    g.addColorStop(1, '#0a1628');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
    ctx.fillRect(40, 70, w - 80, 110);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 70, w - 80, 110);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ELISEE WORLD', w / 2, 112);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('FOOTBALL EDITION', w / 2, 152);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('Minigioco ufficiale Elisee Scout', w / 2, 210);

    if (blink) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('PREMI A / START', w / 2, h * 0.68);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('TATTICA  ·  BORSONE  ·  PANCHINA  ·  RUN', w / 2, h - 28);
  }

  function drawLocationBanner(ctx, x, y, title, sub) {
    drawGbaWindow(ctx, x, y, 210, sub ? 44 : 32);
    ctx.fillStyle = '#101010';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title || 'Campetto Elisee', x + 12, y + 8);
    if (sub) {
      ctx.font = '11px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(sub, x + 12, y + 24);
    }
  }

  global.EliseeGbaUi = {
    drawGbaWindow: drawGbaWindow,
    drawHudBox: drawHudBox,
    drawHpBar: drawHpBar,
    drawCommandMenu: drawCommandMenu,
    drawMoveMenu: drawMoveMenu,
    drawBackPlayer: drawBackPlayer,
    drawFrontPlayer: drawFrontPlayer,
    drawPlatform: drawPlatform,
    drawPillButton: drawPillButton,
    drawPortrait: drawPortrait,
    drawPartyScreen: drawPartyScreen,
    drawBagScreen: drawBagScreen,
    drawTitle: drawTitle,
    drawLocationBanner: drawLocationBanner,
    drawCancelBtn: drawCancelBtn,
    lastLayout: last,
    hitCommand: function (px, py) { return hitIndex(last.command, px, py); },
    hitMove: function (px, py) { return hitIndex(last.moves, px, py); },
    hitParty: function (px, py) { return hitIndex(last.party, px, py); },
    hitBag: function (px, py) { return hitIndex(last.bag, px, py); },
    hitCancel: function (px, py) { return inRect(px, py, last.cancel); }
  };
})(typeof window !== 'undefined' ? window : this);
