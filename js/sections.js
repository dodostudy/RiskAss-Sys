/**
 * 섹션별 렌더링 및 이벤트 핸들링
 */

// =============================================
// ① 기인물 체크 리스트 (A7) — 작업분류별 그룹
// =============================================
const SectionHazard = (() => {
  let currentFilter = '전체';
  let currentSearch = '';
  let collapsedGroups = new Set();

  function getGrouped() {
    let hazards = Store.get('hazards');

    // 검색
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      hazards = hazards.filter(h =>
        h.기인물.toLowerCase().includes(q) ||
        h.기인물분류.toLowerCase().includes(q) ||
        h.다빈도_재해형태.toLowerCase().includes(q)
      );
    }

    // 필터
    if (currentFilter === '선택됨') {
      hazards = hazards.filter(h => h.checked);
    } else if (currentFilter !== '전체') {
      hazards = hazards.filter(h => h.작업분류 === currentFilter);
    }

    // 작업분류별 그룹화
    const groups = {};
    WORK_TYPE_ORDER.forEach(wt => { groups[wt] = []; });
    hazards.forEach(h => {
      const cat = h.작업분류 || '일반작업';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(h);
    });
    // 각 그룹 내 다빈도순 정렬 (사고건수 내림차순)
    Object.values(groups).forEach(arr => arr.sort((a, b) => b.총사고건수 - a.총사고건수));
    return groups;
  }

  function render() {
    const groups = getGrouped();
    const allHazards = Store.get('hazards');
    const container = document.getElementById('hazardGroupContainer');

    let html = '';
    WORK_TYPE_ORDER.forEach(wt => {
      const items = groups[wt];
      if (!items || items.length === 0) return;
      const colors = WORK_TYPE_COLORS[wt] || WORK_TYPE_COLORS['일반작업'];
      const isCollapsed = collapsedGroups.has(wt);
      const checkedCount = items.filter(h => h.checked).length;
      const totalAccidents = items.reduce((s, h) => s + h.총사고건수, 0);

      html += `
        <div class="mb-3 border ${colors.border} rounded-lg overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 ${colors.bg} cursor-pointer select-none"
            onclick="SectionHazard.toggleGroup('${wt}')">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold ${colors.text}">${isCollapsed ? '&#9654;' : '&#9660;'}</span>
              <span class="font-bold text-sm ${colors.text}">${wt}</span>
              <span class="text-[10px] text-gray-500">${items.length}개 기인물 | 총 ${totalAccidents.toLocaleString()}건</span>
              ${checkedCount > 0 ? `<span class="px-1.5 py-0.5 bg-cell-hit text-risk-vh text-[10px] rounded font-bold">${checkedCount}개 선택</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <button onclick="event.stopPropagation(); SectionHazard.toggleGroupAll('${wt}', true)"
                class="text-[10px] px-2 py-0.5 bg-white/70 hover:bg-white rounded border">전체선택</button>
              <button onclick="event.stopPropagation(); SectionHazard.toggleGroupAll('${wt}', false)"
                class="text-[10px] px-2 py-0.5 bg-white/70 hover:bg-white rounded border">해제</button>
            </div>
          </div>
          ${isCollapsed ? '' : `
            <table class="w-full text-xs border-collapse">
              <thead class="bg-header-navy text-white">
                <tr>
                  <th class="px-2 py-1.5 text-center w-10">순번</th>
                  <th class="px-2 py-1.5 text-left">기인물</th>
                  <th class="px-2 py-1.5 text-center w-16">사고건수</th>
                  <th class="px-2 py-1.5 text-center w-12">순위</th>
                  <th class="px-2 py-1.5 text-center w-16">체크</th>
                  <th class="px-2 py-1.5 text-left">다빈도 재해형태</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(h => {
                  const origIdx = allHazards.indexOf(h);
                  return `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 ${h.checked ? 'bg-yellow-50' : ''} ${h.구분 === '12대기인물' ? 'font-medium' : ''}">
                      <td class="px-2 py-1.5 text-center text-gray-400">${h.순번}</td>
                      <td class="px-2 py-1.5 font-medium">
                        ${h.기인물}
                        ${h.구분 === '12대기인물' ? ' <span class="px-1 py-0.5 bg-red-100 text-risk-vh text-[9px] rounded font-bold">12대</span>' : ''}
                      </td>
                      <td class="px-2 py-1.5 text-center font-mono">${h.총사고건수}</td>
                      <td class="px-2 py-1.5 text-center text-gray-500">${h.위험도순위}위</td>
                      <td class="px-2 py-1.5 text-center">
                        <select onchange="SectionHazard.toggle(${origIdx}, this.value)"
                          class="text-xs border rounded px-1 py-0.5 ${h.checked ? 'bg-cell-hit font-bold' : 'bg-white'}">
                          <option value="미해당" ${!h.checked ? 'selected' : ''}>미해당</option>
                          <option value="해당" ${h.checked ? 'selected' : ''}>해당</option>
                        </select>
                      </td>
                      <td class="px-2 py-1.5">
                        <span class="text-[10px]">${h.다빈도_재해형태}</span>
                        <span class="text-[10px] text-gray-400 ml-1">${(h.다빈도_재해형태비율 * 100).toFixed(1)}%</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}
        </div>
      `;
    });

    container.innerHTML = html;
    updateCount();
    updateSifSummary();
    updateFilterTabs();
  }

  function toggle(index, value) {
    const hazards = Store.get('hazards');
    hazards[index].checked = value === '해당';
    Store.set('hazards', [...hazards]);
  }

  function toggleAll(checked) {
    const hazards = Store.get('hazards');
    if (currentFilter === '전체') {
      hazards.forEach(h => { h.checked = checked; });
    } else if (currentFilter === '선택됨') {
      hazards.filter(h => h.checked).forEach(h => { h.checked = checked; });
    } else {
      hazards.filter(h => h.작업분류 === currentFilter).forEach(h => { h.checked = checked; });
    }
    Store.set('hazards', [...hazards]);
  }

  function toggleGroup(wt) {
    if (collapsedGroups.has(wt)) {
      collapsedGroups.delete(wt);
    } else {
      collapsedGroups.add(wt);
    }
    render();
  }

  function toggleGroupAll(wt, checked) {
    const hazards = Store.get('hazards');
    hazards.filter(h => h.작업분류 === wt).forEach(h => { h.checked = checked; });
    Store.set('hazards', [...hazards]);
  }

  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  function setSearch(query) {
    currentSearch = query;
    render();
  }

  function updateCount() {
    const count = Store.getSelectedHazards().length;
    document.getElementById('hazardCount').textContent = count;
  }

  function updateFilterTabs() {
    document.querySelectorAll('.hazard-filter-tab').forEach(btn => {
      if (btn.dataset.filter === currentFilter) {
        btn.classList.add('bg-header-navy', 'text-white', 'border-header-navy');
        btn.classList.remove('hover:bg-gray-100');
      } else {
        btn.classList.remove('bg-header-navy', 'text-white', 'border-header-navy');
        btn.classList.add('hover:bg-gray-100');
      }
    });
  }

  function updateSifSummary() {
    const selected = Store.getSelectedHazards();
    const panel = document.getElementById('sifSummaryPanel');
    if (selected.length === 0) {
      panel.classList.add('hidden');
      return;
    }
    const totalAccidents = selected.reduce((sum, h) => sum + h.총사고건수, 0);
    const top12Count = selected.filter(h => h.구분 === '12대기인물').length;

    const typeMap = {};
    selected.forEach(h => {
      typeMap[h.다빈도_재해형태] = (typeMap[h.다빈도_재해형태] || 0) + h.총사고건수;
    });
    const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div class="flex items-start gap-2">
        <span class="text-red-500 text-lg flex-shrink-0">&#9888;</span>
        <div>
          <p class="font-semibold text-red-800 mb-1">SIF 통합 요약</p>
          <p>본 작업에는 <strong>${selected.length}개</strong>의 SIF 기인물이 식별되었으며,
          관련 사고사망 사례가 총 <strong>${totalAccidents.toLocaleString()}건</strong>입니다.
          ${top12Count > 0 ? `(12대 기인물 <strong>${top12Count}개</strong> 포함)` : ''}</p>
          <p class="mt-1 text-gray-600 text-xs">주요 재해형태: ${topTypes.map(t => `${t[0]}(${t[1]}건)`).join(', ')}</p>
          <p class="mt-1 text-gray-500 text-xs">선택 기인물: ${selected.map(h => h.기인물).join(', ')}</p>
        </div>
      </div>
    `;
  }

  return { render, toggle, toggleAll, toggleGroup, toggleGroupAll, setFilter, setSearch };
})();


// =============================================
// ② 작업분류 자동판정 (H7)
// =============================================
const SectionWorkType = (() => {
  function render() {
    const types = Store.classifyWorkTypes();
    const grid = document.getElementById('workTypeGrid');
    grid.innerHTML = types.map((t, i) => `
      <div class="flex items-center gap-2 p-3 rounded-lg border
        ${t.result === '해당' ? 'bg-cell-hit border-red-300' : 'bg-white border-gray-200'}">
        ${t.kind === 'manual'
          ? `<select onchange="SectionWorkType.manualToggle(${i}, this.value)"
              class="text-xs border rounded px-1 py-0.5">
              <option value="미해당" ${!t.checked ? 'selected' : ''}>미해당</option>
              <option value="해당" ${t.checked ? 'selected' : ''}>해당</option>
            </select>`
          : `<span class="text-[10px] px-1.5 py-0.5 rounded ${t.auto ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">
              자동
            </span>`
        }
        <span class="text-sm font-medium">${t.id}</span>
        ${t.result === '해당' ? '<span class="ml-auto text-xs text-red-600 font-bold">해당</span>' : ''}
        ${t.note ? `<span class="text-[10px] text-gray-400">${t.note}</span>` : ''}
      </div>
    `).join('');

    document.getElementById('workTypeResult').textContent = Store.getWorkTypeText() || '(없음)';
    document.getElementById('ov-workType').value = Store.getWorkTypeText();
  }

  function manualToggle(index, value) {
    const types = Store.get('workTypes');
    types[index].checked = value === '해당';
    Store.set('workTypes', [...types]);
  }

  return { render, manualToggle };
})();


// =============================================
// ③ 참여자 명단 (H20)
// =============================================
const SectionMembers = (() => {
  function render() {
    const members = Store.get('members');
    const tbody = document.getElementById('memberTableBody');
    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-400">참여자를 추가해주세요.</td></tr>';
    } else {
      tbody.innerHTML = members.map((m, i) => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-3 py-1.5 text-center text-gray-400">${i + 1}</td>
          <td class="px-3 py-1.5">
            <input type="text" value="${m.affiliation || ''}" placeholder="소속"
              class="input-yellow w-full border border-gray-300 rounded px-2 py-1 text-sm"
              onchange="SectionMembers.update(${i}, 'affiliation', this.value)">
          </td>
          <td class="px-3 py-1.5">
            <input type="text" value="${m.name || ''}" placeholder="성명"
              class="input-yellow w-full border border-gray-300 rounded px-2 py-1 text-sm"
              onchange="SectionMembers.update(${i}, 'name', this.value)">
          </td>
          <td class="px-3 py-1.5 text-center">
            <button onclick="SectionMembers.remove(${i})"
              class="text-red-400 hover:text-red-600 text-xs">&#10005;</button>
          </td>
        </tr>
      `).join('');
    }
    document.getElementById('membersResult').textContent = Store.getMembersText() || '(없음)';
    document.getElementById('ov-members').value = Store.getMembersText();
  }

  function addRow() {
    const members = Store.get('members');
    if (members.length >= 50) return alert('참여자는 최대 50명까지 추가할 수 있습니다.');
    members.push({ affiliation: '', name: '', signature: '' });
    Store.set('members', [...members]);
  }

  function update(index, field, value) {
    const members = Store.get('members');
    members[index][field] = value;
    Store.set('members', [...members]);
  }

  function remove(index) {
    const members = Store.get('members');
    members.splice(index, 1);
    Store.set('members', [...members]);
  }

  return { render, addRow, update, remove };
})();


// =============================================
// ④ 작업개요 (O7)
// =============================================
const SectionOverview = (() => {
  function render() {
    document.getElementById('ov-refNo').value = Store.get('관리번호');
    document.getElementById('ov-workType').value = Store.getWorkTypeText();
    document.getElementById('ov-members').value = Store.getMembersText();
    document.getElementById('ov-equipment').value = Store.getEquipmentText();
  }

  function init() {
    document.querySelectorAll('.overview-input').forEach(input => {
      const field = input.dataset.field;
      if (field) {
        const val = Store.get('overview')[field];
        if (val) input.value = val;
        input.addEventListener('input', () => {
          Store.merge('overview', { [field]: input.value });
        });
      }
    });
  }

  return { render, init };
})();


// =============================================
// ⑤ 공정 내용 (U7) — 기인물 멀티셀렉트
// =============================================
const SectionProcess = (() => {
  function render() {
    const processes = Store.get('processes');
    const tbody = document.getElementById('processTableBody');
    const selectedHazards = Store.getSelectedHazards();

    if (processes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-gray-400">공정을 추가해주세요.</td></tr>';
      return;
    }

    tbody.innerHTML = processes.map((p, i) => {
      const hazardArr = p.hazards || (p.hazard ? [p.hazard] : []);
      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-3 py-1.5 text-center cell-auto text-xs text-gray-400">${Store.get('관리번호') || '-'}</td>
          <td class="px-3 py-1.5">
            <input type="text" value="${p.stage || ''}" placeholder="작업단계명"
              class="input-yellow w-full border border-gray-300 rounded px-2 py-1 text-sm"
              onchange="SectionProcess.update(${i}, 'stage', this.value)">
          </td>
          <td class="px-3 py-1.5">
            <input type="text" value="${p.content || ''}" placeholder="작업내용"
              class="input-yellow w-full border border-gray-300 rounded px-2 py-1 text-sm"
              onchange="SectionProcess.update(${i}, 'content', this.value)">
          </td>
          <td class="px-3 py-1.5">
            <div class="flex flex-col gap-1">
              <div class="flex flex-wrap gap-1 min-h-[24px]" id="proc-hazard-tags-${i}">
                ${hazardArr.map(h => `
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-700">
                    ${h}
                    <button onclick="SectionProcess.removeHazard(${i}, '${h}')" class="hover:text-red-900">&times;</button>
                  </span>
                `).join('')}
              </div>
              <select onchange="SectionProcess.addHazard(${i}, this.value); this.value='';"
                class="input-yellow w-full border border-gray-300 rounded px-2 py-1 text-xs">
                <option value="">+ 기인물 추가...</option>
                ${selectedHazards
                  .filter(h => !hazardArr.includes(h.기인물))
                  .map(h => `<option value="${h.기인물}">${h.기인물} (${h.총사고건수}건)</option>`).join('')}
              </select>
            </div>
          </td>
          <td class="px-3 py-1.5 text-center">
            <button onclick="SectionProcess.remove(${i})"
              class="text-red-400 hover:text-red-600 text-xs">&#10005;</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function addRow() {
    const processes = Store.get('processes');
    processes.push({ stage: '', content: '', hazards: [] });
    Store.set('processes', [...processes]);
  }

  function update(index, field, value) {
    const processes = Store.get('processes');
    processes[index][field] = value;
    Store.set('processes', [...processes]);
  }

  function addHazard(index, hazardName) {
    if (!hazardName) return;
    const processes = Store.get('processes');
    if (!processes[index].hazards) processes[index].hazards = [];
    if (!processes[index].hazards.includes(hazardName)) {
      processes[index].hazards.push(hazardName);
    }
    Store.set('processes', [...processes]);
  }

  function removeHazard(index, hazardName) {
    const processes = Store.get('processes');
    processes[index].hazards = (processes[index].hazards || []).filter(h => h !== hazardName);
    Store.set('processes', [...processes]);
  }

  function remove(index) {
    const processes = Store.get('processes');
    processes.splice(index, 1);
    Store.set('processes', [...processes]);
  }

  return { render, addRow, update, addHazard, removeHazard, remove };
})();


// =============================================
// ⑥ 위험성평가 본체 (AB7) + SIF 추천 팝업
// =============================================
const SectionAssessment = (() => {
  function nextNo(rows, stageName) {
    const sameStage = rows.filter(r => r.stage === stageName);
    if (sameStage.length > 0) {
      const [major] = sameStage[0].no.split('-').map(Number);
      const maxMinor = Math.max(...sameStage.map(r => +r.no.split('-')[1]));
      return `${major}-${maxMinor + 1}`;
    }
    const majors = [...new Set(rows.map(r => +r.no.split('-')[0]))];
    return `${(majors.length ? Math.max(...majors) : 0) + 1}-1`;
  }

  function render() {
    const rows = Store.get('rows');
    const tbody = document.getElementById('assessmentTableBody');
    const processes = Store.get('processes');
    const stageOptions = processes.map(p => p.stage).filter(Boolean);

    const stageHazardMap = {};
    processes.forEach(p => {
      if (p.stage) stageHazardMap[p.stage] = p.hazards || [];
    });

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" class="text-center py-6 text-gray-400">평가 행을 추가해주세요.</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((r, i) => {
      const riskBefore = (r.freqBefore || 0) * (r.sevBefore || 0);
      const riskAfter = (r.freqAfter || 0) * (r.sevAfter || 0);
      const gradeBefore = Store.getRiskGrade(riskBefore);
      const gradeAfter = Store.getRiskGrade(riskAfter);
      const stageHazards = stageHazardMap[r.stage] || [];
      const hasHazard = stageHazards.length > 0 || r.기인물;

      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-2 py-1 text-center cell-auto text-[11px] font-mono">${r.no || '-'}</td>
          <td class="px-2 py-1">
            <select onchange="SectionAssessment.update(${i}, 'stage', this.value)"
              class="input-yellow w-full border border-gray-300 rounded px-1 py-0.5 text-xs">
              <option value="">선택...</option>
              ${stageOptions.map(s => `<option value="${s}" ${r.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </td>
          <td class="px-2 py-1">
            <div class="flex gap-1">
              <input type="text" value="${r.hazard || ''}" placeholder="유해위험요인"
                class="input-yellow flex-1 border border-gray-300 rounded px-1 py-0.5 text-xs"
                onchange="SectionAssessment.update(${i}, 'hazard', this.value)">
              ${hasHazard ? `
                <button onclick="SifPopup.open(${i}, 'hazard')"
                  class="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[10px] hover:bg-blue-600 flex-shrink-0" title="SIF 추천">
                  SIF
                </button>
              ` : ''}
            </div>
          </td>
          <td class="px-2 py-1">
            <div class="flex gap-1">
              <input type="text" value="${r.safety || ''}" placeholder="안전조치사항"
                class="input-yellow flex-1 border border-gray-300 rounded px-1 py-0.5 text-xs"
                onchange="SectionAssessment.update(${i}, 'safety', this.value)">
              ${hasHazard ? `
                <button onclick="SifPopup.open(${i}, 'safety')"
                  class="px-1.5 py-0.5 bg-green-600 text-white rounded text-[10px] hover:bg-green-700 flex-shrink-0" title="SIF 추천">
                  SIF
                </button>
              ` : ''}
            </div>
          </td>
          <td class="px-2 py-1 text-center">
            <select onchange="SectionAssessment.update(${i}, 'freqBefore', +this.value)"
              class="input-yellow border rounded px-0.5 py-0.5 text-xs w-10">
              <option value="0">-</option>
              ${[1,2,3,4].map(v => `<option value="${v}" ${r.freqBefore === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </td>
          <td class="px-2 py-1 text-center">
            <select onchange="SectionAssessment.update(${i}, 'sevBefore', +this.value)"
              class="input-yellow border rounded px-0.5 py-0.5 text-xs w-10">
              <option value="0">-</option>
              ${[1,2,3,4,5].map(v => `<option value="${v}" ${r.sevBefore === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </td>
          <td class="px-2 py-1 text-center text-xs font-bold rounded ${riskBefore > 0 ? `risk-${gradeBefore.grade.toLowerCase()}` : ''}">
            ${riskBefore || '-'}
          </td>
          <td class="px-2 py-1 text-center">
            <select onchange="SectionAssessment.update(${i}, 'freqAfter', +this.value)"
              class="border rounded px-0.5 py-0.5 text-xs w-10 text-blue-600 font-medium">
              <option value="0">-</option>
              ${[1,2,3,4].map(v => `<option value="${v}" ${r.freqAfter === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </td>
          <td class="px-2 py-1 text-center">
            <select onchange="SectionAssessment.update(${i}, 'sevAfter', +this.value)"
              class="border rounded px-0.5 py-0.5 text-xs w-10 text-blue-600 font-medium">
              <option value="0">-</option>
              ${[1,2,3,4,5].map(v => `<option value="${v}" ${r.sevAfter === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </td>
          <td class="px-2 py-1 text-center text-xs font-bold rounded ${riskAfter > 0 ? `risk-${gradeAfter.grade.toLowerCase()}` : ''}">
            ${riskAfter || '-'}
          </td>
          <td class="px-2 py-1 text-center">
            <input type="checkbox" ${r.tbmChk ? 'checked' : ''}
              onchange="SectionAssessment.update(${i}, 'tbmChk', this.checked)"
              class="hazard-check w-4 h-4 cursor-pointer">
          </td>
          <td class="px-2 py-1 text-center">
            <button onclick="SectionAssessment.remove(${i})"
              class="text-red-400 hover:text-red-600 text-xs">&#10005;</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function addRow() {
    const rows = Store.get('rows');
    if (rows.length >= 300) return alert('위험성평가는 최대 300행까지 추가할 수 있습니다.');
    const no = nextNo(rows, '');
    rows.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      no,
      stage: '',
      hazard: '',
      safety: '',
      freqBefore: 0, sevBefore: 0, riskBefore: 0,
      freqAfter: 0, sevAfter: 0, riskAfter: 0,
      tbmChk: false,
      기인물: '',
    });
    Store.set('rows', [...rows]);
  }

  function update(index, field, value) {
    const rows = Store.get('rows');
    rows[index][field] = value;

    rows[index].riskBefore = (rows[index].freqBefore || 0) * (rows[index].sevBefore || 0);
    rows[index].riskAfter = (rows[index].freqAfter || 0) * (rows[index].sevAfter || 0);

    if (field === 'freqBefore' || field === 'sevBefore') {
      rows[index].tbmChk = rows[index].riskBefore >= 8;
    }

    if (field === 'stage' && value) {
      rows[index].no = nextNo(rows.filter((_, j) => j !== index), value);
      const proc = Store.get('processes').find(p => p.stage === value);
      if (proc && proc.hazards && proc.hazards.length > 0 && !rows[index].기인물) {
        rows[index].기인물 = proc.hazards[0];
      }
    }

    Store.set('rows', [...rows]);
  }

  function remove(index) {
    const rows = Store.get('rows');
    rows.splice(index, 1);
    Store.set('rows', [...rows]);
  }

  return { render, addRow, update, remove };
})();


// =============================================
// SIF 추천 팝업
// =============================================
const SifPopup = (() => {
  let targetRowIndex = -1;
  let targetField = '';
  let selectedItems = new Set();
  let currentTab = 'cases';
  let currentHazardName = '';

  function open(rowIndex, field) {
    targetRowIndex = rowIndex;
    targetField = field;
    selectedItems.clear();
    currentTab = field === 'safety' ? 'safety' : (field === 'hazard' ? 'hazards' : 'cases');

    const rows = Store.get('rows');
    const row = rows[rowIndex];
    if (row.기인물) {
      currentHazardName = row.기인물;
    } else if (row.stage) {
      const proc = Store.get('processes').find(p => p.stage === row.stage);
      if (proc && proc.hazards && proc.hazards.length > 0) {
        currentHazardName = proc.hazards[0];
      }
    }

    if (!currentHazardName) {
      const selected = Store.getSelectedHazards();
      if (selected.length > 0) currentHazardName = selected[0].기인물;
    }

    document.getElementById('sifPopupTitle').textContent =
      `SIF 사고사례 기반 추천 — 기인물: ${currentHazardName || '(없음)'}`;
    document.getElementById('sifPopup').classList.remove('hidden');

    switchTab(currentTab);
  }

  function close() {
    document.getElementById('sifPopup').classList.add('hidden');
  }

  function switchTab(tab) {
    currentTab = tab;
    selectedItems.clear();

    document.querySelectorAll('.sif-tab').forEach(el => {
      if (el.dataset.tab === tab) {
        el.classList.add('border-b-2', 'border-risk-vh', 'text-risk-vh');
        el.classList.remove('text-gray-500');
      } else {
        el.classList.remove('border-b-2', 'border-risk-vh', 'text-risk-vh');
        el.classList.add('text-gray-500');
      }
    });

    const content = document.getElementById('sifPopupContent');

    if (tab === 'cases') {
      renderCases(content);
    } else if (tab === 'hazards') {
      renderHazardSuggestions(content);
    } else if (tab === 'safety') {
      renderSafetySuggestions(content);
    }

    updateSelectionCount();
  }

  function renderCases(container) {
    const selectedHazards = Store.getSelectedHazards();
    const hazardNames = currentHazardName ? [currentHazardName] : selectedHazards.map(h => h.기인물);

    let allCases = [];
    hazardNames.forEach(name => {
      allCases = allCases.concat(getSifCasesByHazard(name));
    });

    if (allCases.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-400 py-8">해당 기인물의 사고사례 데이터가 없습니다.</p>';
      return;
    }

    const uniqueHazards = [...new Set(allCases.map(c => c.기인물))];
    let hazardFilter = '';
    if (uniqueHazards.length > 1) {
      hazardFilter = `
        <div class="flex flex-wrap gap-1 mb-3">
          <button onclick="SifPopup._filterCases('전체')" class="sif-case-filter px-2 py-1 text-xs rounded bg-header-navy text-white" data-hf="전체">전체</button>
          ${uniqueHazards.map(h => `
            <button onclick="SifPopup._filterCases('${h}')" class="sif-case-filter px-2 py-1 text-xs rounded border hover:bg-gray-100" data-hf="${h}">${h}</button>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      ${hazardFilter}
      <div class="space-y-3" id="sifCaseList">
        ${allCases.map((c, ci) => `
          <label class="sif-case-item block p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition ${selectedItems.has('case-' + ci) ? 'bg-blue-50 border-blue-300' : ''}" data-hazard="${c.기인물}">
            <div class="flex items-start gap-2">
              <input type="checkbox" class="mt-1 flex-shrink-0" onchange="SifPopup._toggleItem('case-${ci}', this.checked, '${c.재해유발요인.replace(/'/g, "\\'")}', '${c.위험성감소대책.replace(/'/g, "\\'")}')" ${selectedItems.has('case-' + ci) ? 'checked' : ''}>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-1.5 py-0.5 bg-red-100 text-risk-vh text-[10px] rounded font-bold">${c.기인물}</span>
                  <span class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded">${c.재해형태}</span>
                  <span class="text-[10px] text-gray-400">${c.공종} / ${c.작업명}</span>
                </div>
                <p class="text-xs text-gray-700 mb-1"><strong>재해개요:</strong> ${c.재해개요}</p>
                <p class="text-xs text-orange-700"><strong>유발요인:</strong> ${c.재해유발요인}</p>
                <p class="text-xs text-green-700"><strong>감소대책:</strong> ${c.위험성감소대책}</p>
              </div>
            </div>
          </label>
        `).join('')}
      </div>
    `;
  }

  function renderHazardSuggestions(container) {
    const selectedHazards = Store.getSelectedHazards();
    const hazardNames = currentHazardName ? [currentHazardName] : selectedHazards.map(h => h.기인물);

    let allSuggestions = [];
    hazardNames.forEach(name => {
      getSifHazardSuggestions(name).forEach(s => {
        const existing = allSuggestions.find(x => x.text === s.text);
        if (existing) {
          existing.count += s.count;
        } else {
          allSuggestions.push({ ...s, source: name });
        }
      });
    });

    if (allSuggestions.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-400 py-8">추천 유해위험요인이 없습니다.</p>';
      return;
    }

    container.innerHTML = `
      <p class="text-xs text-gray-500 mb-3">SIF DB에서 추출된 유해위험요인입니다. 선택 후 "선택 적용"을 누르면 위험성평가에 반영됩니다.</p>
      <div class="space-y-2">
        ${allSuggestions.map((s, si) => `
          <label class="flex items-center gap-3 p-2 border rounded hover:bg-blue-50 cursor-pointer">
            <input type="checkbox" onchange="SifPopup._toggleText('h-${si}', this.checked, '${s.text.replace(/'/g, "\\'")}')" ${selectedItems.has('h-' + si) ? 'checked' : ''}>
            <span class="flex-1 text-sm">${s.text}</span>
            <span class="text-[10px] text-gray-400">${s.재해형태 || ''}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function renderSafetySuggestions(container) {
    const selectedHazards = Store.getSelectedHazards();
    const hazardNames = currentHazardName ? [currentHazardName] : selectedHazards.map(h => h.기인물);

    let allSuggestions = [];
    hazardNames.forEach(name => {
      getSifSafetySuggestions(name).forEach(s => {
        const existing = allSuggestions.find(x => x.text === s.text);
        if (existing) {
          existing.count += s.count;
        } else {
          allSuggestions.push({ ...s });
        }
      });
    });

    if (allSuggestions.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-400 py-8">추천 안전조치가 없습니다.</p>';
      return;
    }

    container.innerHTML = `
      <p class="text-xs text-gray-500 mb-3">SIF DB에서 추출된 위험성감소대책입니다. 선택 후 "선택 적용"을 누르면 위험성평가에 반영됩니다.</p>
      <div class="space-y-2">
        ${allSuggestions.map((s, si) => `
          <label class="flex items-center gap-3 p-2 border rounded hover:bg-green-50 cursor-pointer">
            <input type="checkbox" onchange="SifPopup._toggleText('s-${si}', this.checked, '${s.text.replace(/'/g, "\\'")}')" ${selectedItems.has('s-' + si) ? 'checked' : ''}>
            <span class="flex-1 text-sm">${s.text}</span>
            <span class="text-[10px] text-gray-400">x${s.count}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  const _textMap = {};

  function _toggleItem(key, checked, hazardText, safetyText) {
    if (checked) {
      selectedItems.add(key);
      _textMap[key] = { hazard: hazardText, safety: safetyText };
    } else {
      selectedItems.delete(key);
      delete _textMap[key];
    }
    updateSelectionCount();
  }

  function _toggleText(key, checked, text) {
    if (checked) {
      selectedItems.add(key);
      _textMap[key] = { text };
    } else {
      selectedItems.delete(key);
      delete _textMap[key];
    }
    updateSelectionCount();
  }

  function _filterCases(hazardName) {
    document.querySelectorAll('.sif-case-filter').forEach(btn => {
      if (btn.dataset.hf === hazardName) {
        btn.classList.add('bg-header-navy', 'text-white');
        btn.classList.remove('border', 'hover:bg-gray-100');
      } else {
        btn.classList.remove('bg-header-navy', 'text-white');
        btn.classList.add('border', 'hover:bg-gray-100');
      }
    });
    document.querySelectorAll('.sif-case-item').forEach(el => {
      el.style.display = (hazardName === '전체' || el.dataset.hazard === hazardName) ? '' : 'none';
    });
  }

  function updateSelectionCount() {
    document.getElementById('sifPopupSelection').textContent = `선택된 항목: ${selectedItems.size}개`;
  }

  function apply() {
    if (selectedItems.size === 0) {
      close();
      return;
    }

    const rows = Store.get('rows');
    const row = rows[targetRowIndex];

    if (currentTab === 'cases') {
      const texts = { hazards: [], safeties: [] };
      selectedItems.forEach(key => {
        const data = _textMap[key];
        if (data) {
          if (data.hazard) texts.hazards.push(data.hazard);
          if (data.safety) texts.safeties.push(data.safety);
        }
      });
      if (texts.hazards.length > 0) {
        row.hazard = (row.hazard ? row.hazard + ', ' : '') + texts.hazards.join(', ');
      }
      if (texts.safeties.length > 0) {
        const cleaned = texts.safeties.join(' ').replace(/▶/g, ', ').replace(/^,\s*/, '').trim();
        row.safety = (row.safety ? row.safety + ', ' : '') + cleaned;
      }
    } else if (currentTab === 'hazards') {
      const texts = [];
      selectedItems.forEach(key => {
        if (_textMap[key]) texts.push(_textMap[key].text);
      });
      row.hazard = (row.hazard ? row.hazard + ', ' : '') + texts.join(', ');
    } else if (currentTab === 'safety') {
      const texts = [];
      selectedItems.forEach(key => {
        if (_textMap[key]) texts.push(_textMap[key].text);
      });
      row.safety = (row.safety ? row.safety + ', ' : '') + texts.join(', ');
    }

    Store.set('rows', [...rows]);
    close();
    App.showToast(`SIF 추천 ${selectedItems.size}건 적용 완료`, 'success');
  }

  return {
    open, close, switchTab, apply,
    _toggleItem, _toggleText, _filterCases,
  };
})();


// =============================================
// ⑦ 공정별 위험성 분석 (AL7) + ⑧ 차트 + KPI
// =============================================
const SectionAnalysis = (() => {
  let chartH = null, chartV = null;

  function render() {
    const analysis = Store.getStageAnalysis();
    const tbody = document.getElementById('analysisTableBody');

    if (analysis.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-400">위험성평가 데이터를 입력하면 자동 집계됩니다.</td></tr>';
    } else {
      tbody.innerHTML = analysis.map(s => `
        <tr class="border-b border-gray-100 ${s.avgBefore >= 8 ? 'bg-red-50' : ''}">
          <td class="px-3 py-2 font-medium">${s.avgBefore >= 8 ? '<span class="text-risk-vh mr-1">&#9679;</span>' : ''}${s.name}</td>
          <td class="px-3 py-2 text-center">${s.total}건</td>
          <td class="px-3 py-2 text-center font-bold ${s.highCount > 0 ? 'text-risk-vh' : ''}">${s.highCount}건</td>
          <td class="px-3 py-2 text-center font-mono">${s.avgBefore}</td>
          <td class="px-3 py-2 text-center font-mono text-blue-600">${s.avgAfter}</td>
          <td class="px-3 py-2 text-center text-green-600">${s.reduction > 0 ? `&darr;${(s.reduction * 100).toFixed(0)}%` : '-'}</td>
          <td class="px-3 py-2 text-center">
            <span class="px-2 py-0.5 rounded text-xs font-bold
              ${s.grade === '고위험' ? 'bg-red-100 text-risk-vh' : s.grade === '중위험' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
              ${s.grade}
            </span>
          </td>
        </tr>
      `).join('');
    }

    renderKPI();
    renderCharts();
    renderHighRiskPanel();
  }

  function renderKPI() {
    const rows = Store.get('rows');
    const analysis = Store.getStageAnalysis();
    const totalStages = analysis.length;
    const totalHazards = rows.length;
    const highStages = analysis.filter(s => s.avgBefore >= 8).length;
    const highRate = totalStages > 0 ? (highStages / totalStages * 100).toFixed(1) : 0;
    const risksBefore = rows.map(r => r.riskBefore).filter(v => v > 0);
    const risksAfter = rows.map(r => r.riskAfter).filter(v => v > 0);
    const avgBefore = risksBefore.length ? (risksBefore.reduce((a, b) => a + b, 0) / risksBefore.length).toFixed(1) : 0;
    const avgAfter = risksAfter.length ? (risksAfter.reduce((a, b) => a + b, 0) / risksAfter.length).toFixed(1) : 0;
    const reduction = avgBefore > 0 ? ((avgBefore - avgAfter) / avgBefore * 100).toFixed(0) : 0;

    document.getElementById('kpi-stages').textContent = totalStages;
    document.getElementById('kpi-hazards').textContent = totalHazards;
    document.getElementById('kpi-high').textContent = highStages;
    document.getElementById('kpi-high-rate').textContent = `(${highRate}%)`;
    document.getElementById('kpi-avg-before').textContent = avgBefore;
    document.getElementById('kpi-avg-after').textContent = avgAfter;
    document.getElementById('kpi-reduction').textContent = `감소율 ${reduction}%`;
  }

  function renderCharts() {
    const analysis = Store.getStageAnalysis();
    if (analysis.length === 0) return;

    const ctxH = document.getElementById('chart-horizontal-bar');
    if (chartH) chartH.destroy();
    chartH = new Chart(ctxH, {
      type: 'bar',
      data: {
        labels: analysis.map(s => s.name),
        datasets: [
          { label: '전체 위험요인', data: analysis.map(s => s.total), backgroundColor: '#BDD7EE', borderRadius: 4 },
          { label: '고위험(>=8)', data: analysis.map(s => s.highCount), backgroundColor: '#C00000', borderRadius: 4 },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });

    const ctxV = document.getElementById('chart-vertical-bar');
    if (chartV) chartV.destroy();
    chartV = new Chart(ctxV, {
      type: 'bar',
      data: {
        labels: analysis.map(s => s.name),
        datasets: [
          {
            label: '개선 전',
            data: analysis.map(s => s.avgBefore),
            backgroundColor: analysis.map(s =>
              s.avgBefore >= 12 ? '#C00000' : s.avgBefore >= 8 ? '#E26B0A' : s.avgBefore >= 4 ? '#FFC000' : '#375623'
            ),
            borderRadius: 4,
          },
          { label: '개선 후', data: analysis.map(s => s.avgAfter), backgroundColor: '#93C5FD', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, max: 20, ticks: { stepSize: 2 } } },
      },
    });

    renderDonut('chart-donut-before', Store.getRiskDistribution('before'), '개선 전');
    renderDonut('chart-donut-after', Store.getRiskDistribution('after'), '개선 후');
  }

  function renderDonut(canvasId, dist, label) {
    const ctx = document.getElementById(canvasId);
    const existing = Chart.getChart(ctx);
    if (existing) existing.destroy();
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['매우위험(VH)', '고위험(H)', '중위험(M)', '저위험(L)'],
        datasets: [{ data: [dist.VH, dist.H, dist.M, dist.L], backgroundColor: ['#C00000', '#E26B0A', '#FFC000', '#375623'] }],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: `${label} (총 ${dist.total}건)`, font: { size: 12 } },
          legend: { position: 'bottom', labels: { font: { size: 10 } } },
        },
      },
    });
  }

  function renderHighRiskPanel() {
    const analysis = Store.getStageAnalysis();
    const rows = Store.get('rows');
    const highRisk = analysis.filter(s => s.avgBefore >= 8).sort((a, b) => b.avgBefore - a.avgBefore);
    const panel = document.getElementById('highRiskList');

    if (highRisk.length === 0) {
      panel.innerHTML = '<p class="text-gray-400">위험성평가 데이터를 입력하면 고위험 공정이 표시됩니다.</p>';
      return;
    }

    const totalStages = analysis.length;
    panel.innerHTML = `
      <p class="text-sm text-gray-600 mb-2">전체 ${totalStages}개 작업단계 중 <strong class="text-risk-vh">${highRisk.length}개</strong> 고위험 (${(highRisk.length / totalStages * 100).toFixed(1)}%)</p>
      ${highRisk.map(s => {
        const top2 = rows.filter(r => r.stage === s.name).sort((a, b) => b.riskBefore - a.riskBefore).slice(0, 2).map(r => r.hazard).filter(Boolean);
        return `
          <div class="p-3 bg-white rounded border border-red-200">
            <div class="flex items-center gap-2">
              <span class="text-risk-vh font-bold">&#9679;</span>
              <strong>${s.name}</strong>
              <span class="text-xs text-gray-500">평균위험도 ${s.avgBefore}</span>
              <span class="text-xs text-gray-500">| 위험요인 ${s.total}건 중 ${s.highCount}건 고위험 (${s.total > 0 ? (s.highCount / s.total * 100).toFixed(0) : 0}%)</span>
            </div>
            ${top2.length > 0 ? `<p class="text-xs text-gray-600 ml-5 mt-1">&rarr; 주요 위험: ${top2.join(', ')}</p>` : ''}
          </div>
        `;
      }).join('')}
    `;
  }

  return { render };
})();


// =============================================
// ⑨ TBM 일지 (1면 + 2면)
// =============================================
const SectionTBM = (() => {
  const CHECKLIST_ITEMS = [
    { id: 'q1', text: '작업 전 안전교육을 실시하였는가?' },
    { id: 'q2', text: '개인보호구를 정확히 착용하였는가?' },
    { id: 'q3', text: '작업도구 및 장비 상태를 점검하였는가?' },
    { id: 'q4', text: '작업장 정리정돈 상태는 양호한가?' },
    { id: 'q5', text: '안전시설물(난간, 덮개 등)은 설치되었는가?' },
    { id: 'q6', text: '위험구역 출입통제 조치를 하였는가?' },
    { id: 'q7', text: '비상연락망 및 응급조치 방법을 숙지하였는가?' },
    { id: 'q8', text: '작업허가서(안전작업허가)를 발급받았는가?' },
  ];

  function render() {
    renderWorkInfo();
    renderRiskItems();
    renderChecklist();
    renderAttendees();
    renderTbmFields();
  }

  function renderWorkInfo() {
    const ov = Store.get('overview');
    const members = Store.get('members').filter(m => m.name);

    document.getElementById('tbm-company').textContent = ov.회사부서명 || '-';
    document.getElementById('tbm-date').textContent = ov.작성일자 || '-';
    document.getElementById('tbm-jobname').textContent = Store.get('작업명') || '-';
    document.getElementById('tbm-location').textContent = ov.작업장소 || '-';
    document.getElementById('tbm-time').textContent = ov.작업기간 || '-';
    document.getElementById('tbm-equipment').textContent = Store.getEquipmentText() || '-';
    document.getElementById('tbm-personnel').textContent =
      `${members.length}명 / ${ov.작성자 || '-'}`;
    document.getElementById('tbm-permit').textContent = Store.getWorkTypeText() || '-';
  }

  function renderRiskItems() {
    const tbmItems = Store.getTbmRiskItems();
    const tbody = document.getElementById('tbmRiskTableBody');

    if (tbmItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-400 border border-gray-300">위험성평가에서 TBM 체크된 항목이 자동 표시됩니다.</td></tr>';
      return;
    }

    tbody.innerHTML = tbmItems.map(item => {
      const grade = Store.getRiskGrade(item.riskBefore);
      return `
        <tr class="hover:bg-red-50">
          <td class="border border-gray-300 px-2 py-1.5 text-center font-mono">${item.no}</td>
          <td class="border border-gray-300 px-2 py-1.5">${item.hazard || ''}</td>
          <td class="border border-gray-300 px-2 py-1.5">${item.safety || ''}</td>
          <td class="border border-gray-300 px-2 py-1.5 text-center font-bold risk-${grade.grade.toLowerCase()}">${item.riskBefore}</td>
          <td class="border border-gray-300 px-2 py-1.5 text-center">
            <input type="checkbox" class="w-3.5 h-3.5">
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderChecklist() {
    const tbm = Store.get('tbm');
    const container = document.getElementById('tbmChecklist');
    container.innerHTML = CHECKLIST_ITEMS.map(item => {
      const val = tbm.checklist[item.id] || '';
      return `
        <div class="flex items-center gap-2 p-2 border rounded text-sm ${val === 'yes' ? 'bg-green-50 border-green-200' : val === 'no' ? 'bg-red-50 border-red-200' : ''}">
          <span class="flex-1 text-xs">${item.text}</span>
          <select onchange="SectionTBM.updateChecklist('${item.id}', this.value)"
            class="text-xs border rounded px-2 py-1 w-20">
            <option value="" ${!val ? 'selected' : ''}>선택</option>
            <option value="yes" ${val === 'yes' ? 'selected' : ''}>예</option>
            <option value="no" ${val === 'no' ? 'selected' : ''}>아니오</option>
          </select>
        </div>
      `;
    }).join('');
  }

  function renderAttendees() {
    const members = Store.get('members').filter(m => m.name && m.affiliation);
    const tbm = Store.get('tbm');
    const details = tbm.attendeeDetails || {};
    const tbody = document.getElementById('tbmAttendeeBody');

    if (members.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-gray-400 border border-gray-300">참여자 명단(H20)에서 자동 반영됩니다.</td></tr>';
      return;
    }

    tbody.innerHTML = members.map((m, i) => {
      const d = details[m.name] || {};
      return `
        <tr class="hover:bg-green-50">
          <td class="border border-gray-300 px-2 py-1 text-center cell-auto text-[10px]">${m.affiliation}</td>
          <td class="border border-gray-300 px-2 py-1 text-center cell-auto text-[10px] font-medium">${m.name}</td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <input type="text" value="${d.signature || ''}" placeholder=""
              class="w-full text-center text-[10px] border-0 bg-transparent"
              onchange="SectionTBM.updateAttendee('${m.name}', 'signature', this.value)">
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <input type="checkbox" ${d.helmet ? 'checked' : ''} class="w-3 h-3"
              onchange="SectionTBM.updateAttendee('${m.name}', 'helmet', this.checked)">
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <input type="checkbox" ${d.safetyBelt ? 'checked' : ''} class="w-3 h-3"
              onchange="SectionTBM.updateAttendee('${m.name}', 'safetyBelt', this.checked)">
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <input type="checkbox" ${d.safetyShoes ? 'checked' : ''} class="w-3 h-3"
              onchange="SectionTBM.updateAttendee('${m.name}', 'safetyShoes', this.checked)">
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <select class="text-[10px] border-0 bg-transparent w-full"
              onchange="SectionTBM.updateAttendee('${m.name}', 'healthBefore', this.value)">
              <option value="" ${!d.healthBefore ? 'selected' : ''}>-</option>
              <option value="양호" ${d.healthBefore === '양호' ? 'selected' : ''}>양호</option>
              <option value="주의" ${d.healthBefore === '주의' ? 'selected' : ''}>주의</option>
              <option value="불량" ${d.healthBefore === '불량' ? 'selected' : ''}>불량</option>
            </select>
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <select class="text-[10px] border-0 bg-transparent w-full"
              onchange="SectionTBM.updateAttendee('${m.name}', 'healthAfter', this.value)">
              <option value="" ${!d.healthAfter ? 'selected' : ''}>-</option>
              <option value="양호" ${d.healthAfter === '양호' ? 'selected' : ''}>양호</option>
              <option value="주의" ${d.healthAfter === '주의' ? 'selected' : ''}>주의</option>
              <option value="불량" ${d.healthAfter === '불량' ? 'selected' : ''}>불량</option>
            </select>
          </td>
          <td class="border border-gray-300 px-1 py-1 text-center">
            <input type="checkbox" ${d.abnormal ? 'checked' : ''} class="w-3 h-3"
              onchange="SectionTBM.updateAttendee('${m.name}', 'abnormal', this.checked)">
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTbmFields() {
    const tbm = Store.get('tbm');
    const el = (id) => document.getElementById(id);
    if (el('tbm-onepoint')) el('tbm-onepoint').value = tbm.onePoint || '';
    if (el('tbm-notes')) el('tbm-notes').value = tbm.notes || '';
    if (el('tbm-safetyGear')) el('tbm-safetyGear').checked = tbm.safetyGearProvided || false;
    if (el('tbm-procedure')) el('tbm-procedure').value = tbm.procedure || '';
    if (el('tbm-safetySheet')) el('tbm-safetySheet').value = tbm.safetySheet || '';
    if (tbm.feedback) {
      tbm.feedback.forEach((val, i) => {
        const inputs = document.querySelectorAll('[oninput*="updateFeedback"]');
        if (inputs[i]) inputs[i].value = val || '';
      });
    }
    if (tbm.contractorMessage) {
      if (el('tbm-contractor-content')) el('tbm-contractor-content').value = tbm.contractorMessage.content || '';
      if (el('tbm-contractor-datetime')) el('tbm-contractor-datetime').value = tbm.contractorMessage.deliveredAt || '';
      if (el('tbm-contractor-deliverer')) el('tbm-contractor-deliverer').value = tbm.contractorMessage.deliverer || '';
    }
  }

  function updateField(field, value) {
    Store.merge('tbm', { [field]: value });
  }

  function updateChecklist(id, value) {
    const tbm = Store.get('tbm');
    tbm.checklist[id] = value;
    Store.merge('tbm', { checklist: { ...tbm.checklist } });
    renderChecklist();
  }

  function updateFeedback(index, value) {
    const tbm = Store.get('tbm');
    tbm.feedback[index] = value;
    Store.merge('tbm', { feedback: [...tbm.feedback] });
  }

  function updateContractor(field, value) {
    const tbm = Store.get('tbm');
    tbm.contractorMessage[field] = value;
    Store.merge('tbm', { contractorMessage: { ...tbm.contractorMessage } });
  }

  function updateAttendee(name, field, value) {
    const tbm = Store.get('tbm');
    if (!tbm.attendeeDetails) tbm.attendeeDetails = {};
    if (!tbm.attendeeDetails[name]) tbm.attendeeDetails[name] = {};
    tbm.attendeeDetails[name][field] = value;
    Store.merge('tbm', { attendeeDetails: { ...tbm.attendeeDetails } });
  }

  return {
    render, updateField, updateChecklist, updateFeedback,
    updateContractor, updateAttendee,
  };
})();
