/**
 * 중량물 작업계획서 모달
 */
const HeavyLiftPlanModal = (() => {
  const fields = [
    { id: 'hlp-jobName', key: '작업명' },
    { id: 'hlp-datetime', key: '작업일시' },
    { id: 'hlp-location', key: '작업장소' },
    { id: 'hlp-itemName', key: '중량물명칭' },
    { id: 'hlp-weight', key: '중량' },
    { id: 'hlp-spec', key: '규격' },
    { id: 'hlp-equipment', key: '양중장비' },
    { id: 'hlp-method', key: '양중방법' },
    { id: 'hlp-safety', key: '안전조치사항' },
    { id: 'hlp-manager', key: '작업책임자' },
    { id: 'hlp-writer', key: '작성자' },
    { id: 'hlp-writeDate', key: '작성일' },
  ];

  function open() {
    const plan = Store.get('heavyLiftPlan');
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) el.value = plan[f.key] || '';
    });
    // 기본값 자동 승계
    if (!plan.작업명) document.getElementById('hlp-jobName').value = Store.get('작업명') || '';
    if (!plan.작업장소) document.getElementById('hlp-location').value = Store.get('overview').작업장소 || '';
    document.getElementById('heavyLiftModal').classList.remove('hidden');
  }

  function close() {
    document.getElementById('heavyLiftModal').classList.add('hidden');
  }

  function save() {
    const plan = {};
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      plan[f.key] = el ? el.value : '';
    });
    Store.set('heavyLiftPlan', plan);
    if (typeof showToast === 'function') showToast('중량물 작업계획서 저장 완료', 'success');
  }

  function print() {
    save();
    const plan = Store.get('heavyLiftPlan');
    const S = {
      table: 'width:100%; border-collapse:collapse; font-size:9pt;',
      td: 'border:1px solid #000; padding:4px 6px; font-size:9pt;',
      th: 'border:1px solid #000; padding:4px 6px; font-size:9pt; background:#E3F4E3; font-weight:bold; text-align:center;',
      title: 'text-align:center; font-size:16pt; font-weight:bold; margin-bottom:12px; font-family:"Noto Serif KR",serif;',
    };

    const html = `
      <div style="padding:12mm; font-family:'Noto Sans KR',sans-serif;">
        <div style="${S.title}">중량물 작업계획서</div>
        <table style="${S.table}">
          <tr><td style="${S.th} width:25%;">작업명</td><td style="${S.td}">${plan.작업명 || ''}</td>
              <td style="${S.th} width:20%;">작업일시</td><td style="${S.td} width:25%;">${plan.작업일시 || ''}</td></tr>
          <tr><td style="${S.th}">작업장소</td><td style="${S.td}" colspan="3">${plan.작업장소 || ''}</td></tr>
          <tr><td style="${S.th}">중량물 명칭</td><td style="${S.td}">${plan.중량물명칭 || ''}</td>
              <td style="${S.th}">중량</td><td style="${S.td}">${plan.중량 || ''}</td></tr>
          <tr><td style="${S.th}">규격</td><td style="${S.td}">${plan.규격 || ''}</td>
              <td style="${S.th}">양중장비</td><td style="${S.td}">${plan.양중장비 || ''}</td></tr>
          <tr><td style="${S.th}">양중방법</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap;">${plan.양중방법 || ''}</td></tr>
          <tr><td style="${S.th}">안전조치사항</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap; min-height:80px;">${plan.안전조치사항 || ''}</td></tr>
          <tr><td style="${S.th}">작업책임자</td><td style="${S.td}">${plan.작업책임자 || ''}</td>
              <td style="${S.th}">작성자/일자</td><td style="${S.td}">${plan.작성자 || ''} / ${plan.작성일 || ''}</td></tr>
        </table>
        <div style="margin-top:30px;">
          <table style="border-collapse:collapse; float:right;">
            <tr>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">작업책임자</td>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">관리감독자</td>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">소 장</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
            </tr>
          </table>
          <div style="clear:both;"></div>
        </div>
      </div>
    `;

    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(`<!DOCTYPE html><html><head><title>중량물 작업계획서</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@700&display=swap" rel="stylesheet">
      <style>@page{size:A4 portrait;margin:12mm;} body{margin:0;}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  return { open, close, save, print };
})();


/**
 * 중장비 작업계획서 모달 (산업안전보건법 제38조 기반)
 */
const HeavyEquipmentPlanModal = (() => {
  const fields = [
    { id: 'hep-jobName', key: '작업명' },
    { id: 'hep-datetime', key: '작업일시' },
    { id: 'hep-location', key: '작업장소' },
    { id: 'hep-equipType', key: '중장비종류' },
    { id: 'hep-equipSpec', key: '중장비규격' },
    { id: 'hep-equipNo', key: '장비번호' },
    { id: 'hep-operator', key: '운전원' },
    { id: 'hep-operatorCert', key: '운전면허번호' },
    { id: 'hep-workScope', key: '작업범위' },
    { id: 'hep-workMethod', key: '작업방법' },
    { id: 'hep-signalPerson', key: '신호수' },
    { id: 'hep-guide', key: '유도자' },
    { id: 'hep-safety', key: '안전조치사항' },
    { id: 'hep-emergencyPlan', key: '비상시조치계획' },
    { id: 'hep-manager', key: '작업책임자' },
    { id: 'hep-writer', key: '작성자' },
    { id: 'hep-writeDate', key: '작성일' },
  ];

  function open() {
    const plan = Store.get('heavyEquipmentPlan') || {};
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) el.value = plan[f.key] || '';
    });
    if (!plan.작업명) document.getElementById('hep-jobName').value = Store.get('작업명') || '';
    if (!plan.작업장소) document.getElementById('hep-location').value = Store.get('overview').작업장소 || '';

    // 신호수/유도자 자동 반영
    const assignments = Store.get('roleAssignments');
    const members = Store.get('members');
    const signalIndices = assignments['중장비_신호수'] || [];
    const guideIndices = assignments['중장비_유도자'] || [];
    if (!plan.신호수 && signalIndices.length > 0) {
      document.getElementById('hep-signalPerson').value = signalIndices.map(i => members[i]?.name).filter(Boolean).join(', ');
    }
    if (!plan.유도자 && guideIndices.length > 0) {
      document.getElementById('hep-guide').value = guideIndices.map(i => members[i]?.name).filter(Boolean).join(', ');
    }

    // 중장비 종류 자동 반영
    if (!plan.중장비종류) {
      document.getElementById('hep-equipType').value = Store.getEquipmentText() || '';
    }

    document.getElementById('heavyEquipmentModal').classList.remove('hidden');
  }

  function close() {
    document.getElementById('heavyEquipmentModal').classList.add('hidden');
  }

  function save() {
    const plan = {};
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      plan[f.key] = el ? el.value : '';
    });
    Store.set('heavyEquipmentPlan', plan);
    if (typeof App !== 'undefined') App.showToast('중장비 작업계획서 저장 완료', 'success');
  }

  function print() {
    save();
    const plan = Store.get('heavyEquipmentPlan') || {};
    const S = {
      table: 'width:100%; border-collapse:collapse; font-size:9pt;',
      td: 'border:1px solid #000; padding:4px 6px; font-size:9pt;',
      th: 'border:1px solid #000; padding:4px 6px; font-size:9pt; background:#DAEEF3; font-weight:bold; text-align:center;',
      title: 'text-align:center; font-size:16pt; font-weight:bold; margin-bottom:12px; font-family:"Noto Serif KR",serif;',
    };

    const html = `
      <div style="padding:12mm; font-family:'Noto Sans KR',sans-serif;">
        <div style="${S.title}">중장비 작업계획서</div>
        <div style="text-align:right; font-size:8pt; margin-bottom:6px; color:#666;">산업안전보건법 제38조 (안전조치) 근거</div>
        <table style="${S.table}">
          <tr><td style="${S.th} width:20%;">작업명</td><td style="${S.td}">${plan.작업명 || ''}</td>
              <td style="${S.th} width:15%;">작업일시</td><td style="${S.td} width:25%;">${plan.작업일시 || ''}</td></tr>
          <tr><td style="${S.th}">작업장소</td><td style="${S.td}" colspan="3">${plan.작업장소 || ''}</td></tr>
          <tr><td style="${S.th}">중장비 종류</td><td style="${S.td}">${plan.중장비종류 || ''}</td>
              <td style="${S.th}">규격/용량</td><td style="${S.td}">${plan.중장비규격 || ''}</td></tr>
          <tr><td style="${S.th}">장비번호</td><td style="${S.td}">${plan.장비번호 || ''}</td>
              <td style="${S.th}">운전원</td><td style="${S.td}">${plan.운전원 || ''}</td></tr>
          <tr><td style="${S.th}">운전면허번호</td><td style="${S.td}" colspan="3">${plan.운전면허번호 || ''}</td></tr>
          <tr><td style="${S.th}">작업범위</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap;">${plan.작업범위 || ''}</td></tr>
          <tr><td style="${S.th}">작업방법</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap;">${plan.작업방법 || ''}</td></tr>
          <tr><td style="${S.th}">신호수</td><td style="${S.td}">${plan.신호수 || ''}</td>
              <td style="${S.th}">유도자</td><td style="${S.td}">${plan.유도자 || ''}</td></tr>
          <tr><td style="${S.th}">안전조치사항</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap; min-height:80px;">${plan.안전조치사항 || ''}</td></tr>
          <tr><td style="${S.th}">비상시 조치계획</td><td style="${S.td}" colspan="3" style="white-space:pre-wrap;">${plan.비상시조치계획 || ''}</td></tr>
          <tr><td style="${S.th}">작업책임자</td><td style="${S.td}">${plan.작업책임자 || ''}</td>
              <td style="${S.th}">작성자/일자</td><td style="${S.td}">${plan.작성자 || ''} / ${plan.작성일 || ''}</td></tr>
        </table>
        <div style="margin-top:20px; font-size:8pt; color:#666; border-top:1px solid #ccc; padding-top:6px;">
          <p>* 중장비 작업 시 유도자·신호수를 반드시 배치하여야 합니다.</p>
          <p>* 운전원은 해당 중장비 운전면허를 소지하여야 합니다.</p>
          <p>* 작업반경 내 근로자 출입통제 조치를 하여야 합니다.</p>
        </div>
        <div style="margin-top:30px;">
          <table style="border-collapse:collapse; float:right;">
            <tr>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">작업책임자</td>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">관리감독자</td>
              <td style="border:1px solid #000; padding:3px 8px; font-size:8pt; background:#F3F4F6; text-align:center;">소 장</td>
            </tr>
            <tr>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
              <td style="border:1px solid #000; width:70px; height:50px;"></td>
            </tr>
          </table>
          <div style="clear:both;"></div>
        </div>
      </div>
    `;

    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(`<!DOCTYPE html><html><head><title>중장비 작업계획서</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@700&display=swap" rel="stylesheet">
      <style>@page{size:A4 portrait;margin:12mm;} body{margin:0;}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  return { open, close, save, print };
})();


/**
 * 밀폐작업 출입대장 모달
 */
const ConfinedEntryModal = (() => {
  let entries = [];

  function open() {
    entries = Store.get('confinedEntryLog') || [];
    // 감시자 자동 반영
    const assignments = Store.get('roleAssignments');
    const members = Store.get('members');
    const watcherIndices = assignments['밀폐감시자'] || [];
    const watcherNames = watcherIndices.map(i => members[i]?.name).filter(Boolean).join(', ');
    document.getElementById('cel-watcher').value = watcherNames || '(미지정)';

    // 기본값 승계
    document.getElementById('cel-jobName').value = Store.get('작업명') || '';
    document.getElementById('cel-location').value = '';
    document.getElementById('cel-date').value = Store.get('overview').작성일자 || '';

    renderEntries();
    document.getElementById('confinedEntryModal').classList.remove('hidden');
  }

  function close() {
    document.getElementById('confinedEntryModal').classList.add('hidden');
  }

  function addEntry() {
    const members = Store.get('members').filter(m => m.name);
    entries.push({
      name: members.length > 0 ? members[0].name : '',
      affiliation: members.length > 0 ? members[0].affiliation : '',
      entryTime: '',
      exitTime: '',
      confirmed: false,
    });
    renderEntries();
  }

  function renderEntries() {
    const tbody = document.getElementById('confinedEntryBody');
    const members = Store.get('members').filter(m => m.name);

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-400 border border-gray-300">출입 기록을 추가해주세요.</td></tr>';
      return;
    }

    tbody.innerHTML = entries.map((e, i) => `
      <tr class="hover:bg-purple-50">
        <td class="border border-gray-300 px-2 py-1 text-center">${i + 1}</td>
        <td class="border border-gray-300 px-1 py-1">
          <select onchange="ConfinedEntryModal.updateEntry(${i}, 'name', this.value)"
            class="w-full border-0 bg-transparent text-xs py-0.5">
            <option value="">선택</option>
            ${members.map(m => `<option value="${m.name}" ${e.name === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </td>
        <td class="border border-gray-300 px-2 py-1 text-xs text-gray-500">${
          members.find(m => m.name === e.name)?.affiliation || ''
        }</td>
        <td class="border border-gray-300 px-1 py-1">
          <input type="time" value="${e.entryTime || ''}"
            onchange="ConfinedEntryModal.updateEntry(${i}, 'entryTime', this.value)"
            class="w-full border-0 bg-transparent text-xs">
        </td>
        <td class="border border-gray-300 px-1 py-1">
          <input type="time" value="${e.exitTime || ''}"
            onchange="ConfinedEntryModal.updateEntry(${i}, 'exitTime', this.value)"
            class="w-full border-0 bg-transparent text-xs">
        </td>
        <td class="border border-gray-300 px-2 py-1 text-center">
          <input type="checkbox" ${e.confirmed ? 'checked' : ''}
            onchange="ConfinedEntryModal.updateEntry(${i}, 'confirmed', this.checked)"
            class="w-3.5 h-3.5">
        </td>
        <td class="border border-gray-300 px-2 py-1 text-center">
          <button onclick="ConfinedEntryModal.removeEntry(${i})" class="text-red-400 hover:text-red-600">&#10005;</button>
        </td>
      </tr>
    `).join('');
  }

  function updateEntry(index, field, value) {
    entries[index][field] = value;
    if (field === 'name') {
      const members = Store.get('members').filter(m => m.name);
      const member = members.find(m => m.name === value);
      entries[index].affiliation = member?.affiliation || '';
    }
    renderEntries();
  }

  function removeEntry(index) {
    entries.splice(index, 1);
    renderEntries();
  }

  function save() {
    Store.set('confinedEntryLog', [...entries]);
    if (typeof showToast === 'function') showToast('밀폐작업 출입대장 저장 완료', 'success');
  }

  function print() {
    save();
    const jobName = document.getElementById('cel-jobName').value;
    const location = document.getElementById('cel-location').value;
    const date = document.getElementById('cel-date').value;
    const watcher = document.getElementById('cel-watcher').value;
    const o2Before = document.getElementById('cel-o2-before').value;
    const o2During = document.getElementById('cel-o2-during').value;
    const gas = document.getElementById('cel-gas').value;

    const S = {
      table: 'width:100%; border-collapse:collapse; font-size:9pt;',
      td: 'border:1px solid #000; padding:3px 5px; font-size:9pt;',
      th: 'border:1px solid #000; padding:3px 5px; font-size:9pt; background:#F3E8FF; font-weight:bold; text-align:center;',
      title: 'text-align:center; font-size:16pt; font-weight:bold; margin-bottom:12px; font-family:"Noto Serif KR",serif;',
    };

    const html = `
      <div style="padding:12mm; font-family:'Noto Sans KR',sans-serif;">
        <div style="${S.title}">밀폐공간 출입대장</div>
        <table style="${S.table}; margin-bottom:10px;">
          <tr><td style="${S.th} width:20%;">작업명</td><td style="${S.td}">${jobName}</td>
              <td style="${S.th} width:15%;">작업일자</td><td style="${S.td} width:20%;">${date}</td></tr>
          <tr><td style="${S.th}">밀폐공간 위치</td><td style="${S.td}">${location}</td>
              <td style="${S.th}">감시자</td><td style="${S.td}">${watcher}</td></tr>
        </table>

        <div style="font-size:10pt; font-weight:bold; margin:8px 0 4px;">산소농도 측정 기록</div>
        <table style="${S.table}; margin-bottom:10px;">
          <tr><td style="${S.th} width:33%;">작업 전 O2(%)</td>
              <td style="${S.th} width:33%;">작업 중 O2(%)</td>
              <td style="${S.th} width:34%;">유해가스 (ppm)</td></tr>
          <tr><td style="${S.td} text-align:center;">${o2Before || '-'}</td>
              <td style="${S.td} text-align:center;">${o2During || '-'}</td>
              <td style="${S.td} text-align:center;">${gas || '-'}</td></tr>
        </table>

        <div style="font-size:10pt; font-weight:bold; margin:8px 0 4px;">출입 기록</div>
        <table style="${S.table}">
          <thead>
            <tr>
              <th style="${S.th} width:8%;">순번</th>
              <th style="${S.th}">성명</th>
              <th style="${S.th} width:18%;">소속</th>
              <th style="${S.th} width:15%;">입장시간</th>
              <th style="${S.th} width:15%;">퇴장시간</th>
              <th style="${S.th} width:10%;">확인</th>
            </tr>
          </thead>
          <tbody>
            ${entries.length > 0 ? entries.map((e, i) => `
              <tr>
                <td style="${S.td} text-align:center;">${i + 1}</td>
                <td style="${S.td}">${e.name || ''}</td>
                <td style="${S.td}">${e.affiliation || ''}</td>
                <td style="${S.td} text-align:center;">${e.entryTime || ''}</td>
                <td style="${S.td} text-align:center;">${e.exitTime || ''}</td>
                <td style="${S.td} text-align:center;">${e.confirmed ? '&#10004;' : ''}</td>
              </tr>
            `).join('') : `<tr><td style="${S.td} text-align:center;" colspan="6">기록 없음</td></tr>`}
            ${Array.from({ length: Math.max(0, 15 - entries.length) }, (_, i) => `
              <tr>
                <td style="${S.td} text-align:center; color:#ccc;">${entries.length + i + 1}</td>
                <td style="${S.td}">&nbsp;</td>
                <td style="${S.td}">&nbsp;</td>
                <td style="${S.td}">&nbsp;</td>
                <td style="${S.td}">&nbsp;</td>
                <td style="${S.td}">&nbsp;</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top:20px; font-size:8pt; color:#666;">
          <p>* 밀폐공간 출입 시 반드시 감시자 확인 후 입장</p>
          <p>* 산소농도 18% 미만 또는 유해가스 검출 시 즉시 작업 중지</p>
        </div>
      </div>
    `;

    const w = window.open('', '_blank', 'width=800,height=600');
    w.document.write(`<!DOCTYPE html><html><head><title>밀폐공간 출입대장</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@700&display=swap" rel="stylesheet">
      <style>@page{size:A4 portrait;margin:12mm;} body{margin:0;}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  return { open, close, addEntry, updateEntry, removeEntry, save, print };
})();
