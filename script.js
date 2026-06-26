let state = {
    mode: 'single', 
    sets: [],       
    matrices: []    
};

function setupHimpunan() {
    const totalSet = parseInt(document.getElementById('jumlahSetTotal').value);
    const container = document.getElementById('dynamicSetInputs');
    container.innerHTML = ""; 
    let html = "";
    
    if (totalSet === 3) {
        state.mode = 'komposisi';
        html += `<div style="background:#dff9fb; padding:10px; margin-bottom:15px; border-left:4px solid #22a6b3;">
                    <strong>Mode Komposisi (R o S)</strong><br>
                    Relasi akan dibuat dari A ke B, lalu B ke C.
                 </div>`;
        html += generateInputJumlah(3, ['A', 'B', 'C']);
    } else {
        html += `<div style="margin-bottom:15px;">
                    <label>Pilih Jenis Operasi:</label>
                    <select id="modeOperasi" onchange="updateModeState(this.value)" style="width:100%; padding:8px;">
                        <option value="single">Relasi Tunggal & Invers</option>
                        <option value="kombinasi">Kombinasi 2 Relasi</option>
                    </select>
                 </div>`;
        html += `<div id="inputJumlahContainer">${generateInputJumlah(2, ['A', 'B'])}</div>`;
        state.mode = 'single';
    }

    container.innerHTML = html;
    document.getElementById('step-intro').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
}

function generateInputJumlah(n, labels) {
    let html = "";
    for(let i = 0; i < n; i++) {
        html += `<label>Jumlah Elemen Himpunan ${labels[i]}:</label>`;
        html += `<input type="number" id="count_set_${i}" min="1" placeholder="Contoh: 3">`;
    }
    return html;
}

function updateModeState(val) { state.mode = val; }
function kembaliKeIntro() { document.getElementById('step-intro').style.display = 'block'; document.getElementById('step1').style.display = 'none'; }
function kembaliKeStep1() { document.getElementById('step1').style.display = 'block'; document.getElementById('step2').style.display = 'none'; document.getElementById('navbar').style.display = 'none'; }

function buatInputElemen() {
    let counts = [];
    let setLabels = (state.mode === 'komposisi') ? ['A', 'B', 'C'] : ['A', 'B'];
    for (let i = 0; i < setLabels.length; i++) {
        let val = document.getElementById(`count_set_${i}`).value;
        if (!val || val < 1) { alert("Jumlah elemen tidak valid."); return; }
        counts.push(parseInt(val));
    }

    const inputArea = document.getElementById('inputArea');
    let html = '<div class="app-input-box fade"><h3 class="step-title">Langkah 2: Definisi Anggota & Relasi</h3>';

    for (let i = 0; i < setLabels.length; i++) {
        html += `<h4>Anggota Himpunan ${setLabels[i]}</h4>`;
        for (let j = 0; j < counts[i]; j++) {
            let def = (i===0 ? 'a' : (i===1 ? 'b' : 'c')) + (j+1); 
            html += `<input type="text" id="member_${i}_${j}" value="${def}">`;
        }
    }
    
    html += `<hr>`;
    if (state.mode === 'single') {
        html += generateTableHTML(0, 'A', 'B', counts[0], counts[1], "Relasi R (A ke B)");
    } else if (state.mode === 'kombinasi') {
        html += generateTableHTML(0, 'A', 'B', counts[0], counts[1], "Relasi R1 (A ke B)");
        html += generateTableHTML(1, 'A', 'B', counts[0], counts[1], "Relasi R2 (A ke B)");
    } else {
        html += generateTableHTML(0, 'A', 'B', counts[0], counts[1], "Relasi R (A ke B)");
        html += generateTableHTML(1, 'B', 'C', counts[1], counts[2], "Relasi S (B ke C)");
    }

    html += `<button onclick="prosesData([${counts}])" style="width:100%;">Proses</button></div>`;
    inputArea.innerHTML = html;
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

function generateTableHTML(id, L1, L2, R, C, title) {
    let h = `<h4>${title}</h4><table style="width:100%;"><tr><th>${L1}\\${L2}</th>`;
    for(let j=0; j<C; j++) h += `<th>Tujuan-${j+1}</th>`;
    h += `</tr>`;
    for(let i=0; i<R; i++) {
        h += `<tr><td>Asal-${i+1}</td>`;
        for(let j=0; j<C; j++) h += `<td><input type="checkbox" id="rel_${id}_${i}_${j}"></td>`;
        h += `</tr>`;
    }
    return h + `</table>`;
}

function prosesData(counts) {
    state.sets = []; state.matrices = [];
    let nSets = (state.mode === 'komposisi') ? 3 : 2;
    for(let i=0; i<nSets; i++) {
        let m = [];
        for(let j=0; j<counts[i]; j++) m.push(document.getElementById(`member_${i}_${j}`).value);
        state.sets.push(m);
    }

    let nMat = (state.mode === 'single') ? 1 : 2;
    let sizes = (state.mode === 'komposisi') ? [{r:counts[0],c:counts[1]},{r:counts[1],c:counts[2]}] : [{r:counts[0],c:counts[1]},{r:counts[0],c:counts[1]}];

    for(let m=0; m<nMat; m++) {
        let mat = [];
        for(let i=0; i<sizes[m].r; i++) {
            let row = [];
            for(let j=0; j<sizes[m].c; j++) row.push(document.getElementById(`rel_${m}_${i}_${j}`).checked ? 1 : 0);
            mat.push(row);
        }
        state.matrices.push(mt = mat);
    }
    document.getElementById('navbar').style.display = 'block';
    tampilkan('tabelRelasi');
}

function tampilkan(tipe) {
    const out = document.getElementById('output');
    let html = '';
    let A = state.sets[0], B = state.sets[1], M = state.matrices[0];

    if (tipe === 'tabelRelasi') {
        html = renderTableRelasiHTML(M, A, B, "Tabel Representasi Relasi R");
    } else if (tipe === 'definisi') {
        let p = [];
        for(let i=0; i<A.length; i++) 
            for(let j=0; j<B.length; j++) 
                if(M[i][j]) p.push(`(${A[i]}, ${B[j]})`);
        html = `<div class="app-input-box"><h3>Pasangan Terurut</h3><p>{ ${p.join(', ') || '∅'} }</p></div>`;
    } else if (tipe === 'matriksRelasi') {
        html = renderMatrixHTML(M, A, B, "Matriks Relasi");
    } else if (tipe === 'grafRelasi') {
        html = `<div class="app-input-box"><h3>Graf Berarah</h3>`;
        for(let i=0; i<A.length; i++) {
            let t = [];
            for(let j=0; j<B.length; j++) if(M[i][j]) t.push(B[j]);
            html += `<div class="graf-item" style="padding:10px; border-bottom:1px solid #eee;"><strong>${A[i]}</strong> &rarr; ${t.join(', ') || '-'}</div>`;
        }
        html += `</div>`;
    } else if (tipe === 'invers') {
        let MT = M[0].map((_, c) => M.map(r => r[c]));
        html = renderTableRelasiHTML(MT, B, A, "Tabel Relasi Invers (R⁻¹)");
    } else if (tipe === 'kombinasi') {
        if(state.mode !== 'kombinasi') {
            // Logika Komplemen untuk Relasi Tunggal
            let komp = [];
            for(let i=0; i<A.length; i++) {
                for(let j=0; j<B.length; j++) {
                    if(!M[i][j]) komp.push(`(${A[i]},${B[j]})`);
                }
            }
            html = `<div class='app-input-box fade'><h3>Komplemen Relasi (R')</h3><p>Pasangan yang tidak ada dalam relasi R:</p><p>{ ${komp.join(', ') || '∅'} }</p></div>`;
        } else {
            let R1 = state.matrices[0], R2 = state.matrices[1], ir = [], gb = [], bd = [], sl = [], kp1 = [];
            for(let i=0; i<A.length; i++) {
                for(let j=0; j<B.length; j++) {
                    // Irisan
                    if(R1[i][j] && R2[i][j]) ir.push(`(${A[i]},${B[j]})`);
                    // Gabungan
                    if(R1[i][j] || R2[i][j]) gb.push(`(${A[i]},${B[j]})`);
                    // Beda Setangkup
                    if((R1[i][j] && !R2[i][j]) || (!R1[i][j] && R2[i][j])) bd.push(`(${A[i]},${B[j]})`);
                    // Selisih (R1 - R2)
                    if(R1[i][j] && !R2[i][j]) sl.push(`(${A[i]},${B[j]})`);
                    // Komplemen R1
                    if(!R1[i][j]) kp1.push(`(${A[i]},${B[j]})`);
                }
            }
            html = `
                <div class="app-input-box fade">
                    <h3>Operasi Kombinasi & Komplemen</h3>
                    <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap; margin-bottom:15px;">
                        <button onclick="showRes('ir')" style="font-size:11px;">Irisan</button>
                        <button onclick="showRes('gb')" style="font-size:11px;">Gabungan</button>
                        <button onclick="showRes('bd')" style="font-size:11px;">Beda Setangkup</button>
                        <button onclick="showRes('sl')" style="font-size:11px;">Selisih (R1-R2)</button>
                        <button onclick="showRes('kp')" style="font-size:11px;">Komplemen R1</button>
                    </div>
                    <div id="res-ir" class="fade" style="display:none; padding:10px; border:1px solid #ddd;"><strong>Irisan (∩):</strong><br>{${ir.join(', ') || '∅'}}</div>
                    <div id="res-gb" class="fade" style="display:none; padding:10px; border:1px solid #ddd;"><strong>Gabungan (∪):</strong><br>{${gb.join(', ') || '∅'}}</div>
                    <div id="res-bd" class="fade" style="display:none; padding:10px; border:1px solid #ddd;"><strong>Beda Setangkup (⊕):</strong><br>{${bd.join(', ') || '∅'}}</div>
                    <div id="res-sl" class="fade" style="display:none; padding:10px; border:1px solid #ddd;"><strong>Selisih (R1 - R2):</strong><br>{${sl.join(', ') || '∅'}}</div>
                    <div id="res-kp" class="fade" style="display:none; padding:10px; border:1px solid #ddd;"><strong>Komplemen R1 (R1'):</strong><br>{${kp1.join(', ') || '∅'}}</div>
                </div>`;
        }
    } else if (tipe === 'komposisi') {
        if(state.mode !== 'komposisi') html = "<p>Pilih mode komposisi (3 himpunan).</p>";
        else {
            let R = state.matrices[0], S = state.matrices[1], C = state.sets[2], res = [];
            for(let i=0; i<A.length; i++) {
                let row = [];
                for(let k=0; k<C.length; k++) {
                    let ok = false;
                    for(let j=0; j<B.length; j++) if(R[i][j] && S[j][k]) ok = true;
                    row.push(ok ? 1 : 0);
                }
                res.push(row);
            }
            html = renderTableRelasiHTML(res, A, C, "Tabel Hasil Komposisi (R o S)");
        }
    }
    out.innerHTML = html;
}

// Fungsi bantu untuk menampilkan hasil kombinasi spesifik
function showRes(id) {
    ['ir', 'gb', 'bd', 'sl', 'kp'].forEach(key => {
        document.getElementById('res-' + key).style.display = (key === id ? 'block' : 'none');
    });
}

function renderTableRelasiHTML(matrix, rows, cols, title) {
    let h = `<div class="app-input-box fade"><h4>${title}</h4><table style="width:100%;">
             <thead><tr style="background:#eee;"><th>Asal</th><th>Tujuan</th><th>Status</th></tr></thead><tbody>`;
    for(let i=0; i<rows.length; i++) {
        for(let j=0; j<cols.length; j++) {
            let isRel = matrix[i][j] === 1;
            h += `<tr><td>${rows[i]}</td><td>${cols[j]}</td><td ${isRel ? 'class="highlight-rel"' : ''}>${isRel ? 'Berhubungan' : '-'}</td></tr>`;
        }
    }
    return h + `</tbody></table></div>`;
}

function renderMatrixHTML(mat, rs, cs, title) {
    let h = `<div class="app-input-box fade"><h4>${title}</h4><div class="matrix">`;
    for(let i=0; i<rs.length; i++) {
        h += `<div class="matrix-row">`;
        for(let j=0; j<cs.length; j++) h += `<div class="matrix-cell ${mat[i][j]?'active':''}">${mat[i][j]}</div>`;
        h += `</div>`;
    }
    return h + `</div></div>`;
}