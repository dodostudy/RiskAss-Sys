/**
 * PDF 인쇄용 서식 생성 — KOEN [분당지침-안전-036] 위험성평가 서식 기반
 * - 1쪽: 수시 위험성평가 (작업개요 + 공정 6행/페이지)
 * - 2쪽~: 위험성평가표 (헤더 반복 페이지네이션, 후(전) 형식)
 * - 3쪽: 위험성평가 실시결과 확인 (3단 30명)
 * - 4쪽~: TBM 일지
 */
const PrintManager = (() => {
  function print() {
    const old = document.getElementById('printContainer');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'printContainer';
    container.className = 'print-only';

    const pages = [
      ...pages_수시위험성평가(),
      ...pages_위험성평가표(),
      ...pages_실시결과확인(),
      page_TBM1면(),
      page_TBM2면(),
    ];

    container.innerHTML = pages.join('');
    document.body.appendChild(container);
    window.print();
  }

  // ============================================================
  //  공통 스타일
  // ============================================================
  const S = {
    table: 'width:100%; border-collapse:collapse; font-size:8.5pt;',
    td: 'border:1px solid #000; padding:2px 3px; font-size:8.5pt;',
    th: 'border:1px solid #000; padding:2px 3px; font-size:8.5pt; background:#E3F4E3; font-weight:bold; text-align:center;',
    thNavy: 'border:1px solid #000; padding:2px 3px; font-size:8.5pt; background:#1F3864; color:white; font-weight:bold; text-align:center;',
    title: 'text-align:center; font-size:16pt; font-weight:bold; margin-bottom:4px; font-family:"Noto Serif KR",serif; letter-spacing:8px;',
    subtitle: 'font-size:9pt; font-weight:bold; margin:4px 0 2px;',
    stamp: 'border:1px solid #000; padding:1px; font-size:7pt; text-align:center;',
    pageNum: 'text-align:center; font-size:7pt; color:#666; margin-top:2px;',
  };

  function riskColor(v) {
    if (v >= 12) return 'background:#C00000;color:white;font-weight:bold;';
    if (v >= 8) return 'background:#E26B0A;color:white;font-weight:bold;';
    if (v >= 4) return 'background:#FFC000;font-weight:bold;';
    if (v >= 1) return 'background:#375623;color:white;font-weight:bold;';
    return '';
  }

  // ============================================================
  //  결재란
  // ============================================================

  /** KOEN 서식: 좌측 «승인» 협력기업 + 우측 «확인» 남동발전 */
  function 결재란_KOEN() {
    return `
      <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
        <table style="border-collapse:collapse;">
          <tr>
            <td style="${S.stamp} background:#E3F4E3; font-weight:bold; font-size:6pt;" rowspan="2">≪승인≫<br>협 력<br>기 업</td>
            <td style="${S.stamp} width:45px; background:#F3F4F6; font-size:7pt;">담 당</td>
            <td style="${S.stamp} width:45px; background:#F3F4F6; font-size:7pt;">과 장</td>
            <td style="${S.stamp} width:45px; background:#F3F4F6; font-size:7pt;">팀 장</td>
          </tr>
          <tr>
            <td style="${S.stamp} height:30px; width:45px;"></td>
            <td style="${S.stamp} height:30px; width:45px;"></td>
            <td style="${S.stamp} height:30px; width:45px;"></td>
          </tr>
        </table>
        <table style="border-collapse:collapse;">
          <tr>
            <td style="${S.stamp} background:#E3F4E3; font-weight:bold; font-size:6pt;" rowspan="2">≪확인≫<br>남 동<br>발 전</td>
            <td style="${S.stamp} width:45px; background:#F3F4F6;"></td>
          </tr>
          <tr>
            <td style="${S.stamp} height:30px; width:45px;"></td>
          </tr>
        </table>
      </div>
    `;
  }

  /** TBM 결재란 */
  function 결재란TBM() {
    return `
      <table style="border-collapse:collapse; float:right; margin-bottom:3px;">
        <tr>
          <td style="${S.stamp} background:#E3F4E3; font-weight:bold; font-size:7pt;" rowspan="2">결<br>재</td>
          <td style="${S.stamp} width:50px; background:#F3F4F6; font-size:7pt;">담 당</td>
          <td style="${S.stamp} width:50px; background:#F3F4F6; font-size:7pt;">관리감독자</td>
          <td style="${S.stamp} width:50px; background:#F3F4F6; font-size:7pt;">소 장</td>
        </tr>
        <tr>
          <td style="${S.stamp} height:28px; width:50px;"></td>
          <td style="${S.stamp} height:28px; width:50px;"></td>
          <td style="${S.stamp} height:28px; width:50px;"></td>
        </tr>
      </table>
      <div style="clear:both;"></div>
    `;
  }

  // ============================================================
  //  1쪽: 수시 위험성평가 (페이지당 공정 6행, 넘치면 새 페이지)
  // ============================================================
  function pages_수시위험성평가() {
    const ov = Store.get('overview');
    const processes = Store.get('processes');
    const members = Store.get('members').filter(m => m.name);
    const workTypes = Store.classifyWorkTypes();
    const workTypeChecks = workTypes.map(t =>
      `${t.result === '해당' ? '■' : '□'} ${t.id}`
    ).join('&nbsp;&nbsp;');

    const ROWS_PER_PAGE = 6;
    const totalPages = Math.max(1, Math.ceil(processes.length / ROWS_PER_PAGE));
    const pages = [];

    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * ROWS_PER_PAGE;
      const pageProcesses = processes.slice(startIdx, startIdx + ROWS_PER_PAGE);

      // 공정 행 (빈 행으로 6행 채우기)
      const processRows = [];
      for (let i = 0; i < ROWS_PER_PAGE; i++) {
        const p = pageProcesses[i];
        const num = startIdx + i + 1;
        const hazardArr = p ? (p.hazards || (p.hazard ? [p.hazard] : [])) : [];
        processRows.push(`
          <tr style="height:22px;">
            <td style="${S.td} text-align:center; width:35px;">${p ? num : ''}</td>
            <td style="${S.td} width:25%;">${p ? (p.stage || '') : ''}</td>
            <td style="${S.td}">${p ? (p.content || '') : ''}</td>
            <td style="${S.td} width:20%; font-size:7.5pt;">${p ? hazardArr.join(', ') : ''}</td>
          </tr>
        `);
      }

      let html = '<div class="print-page" style="padding:0;">';

      if (page === 0) {
        // 첫 페이지: 결재란 + 작업개요 전체
        html += 결재란_KOEN();
        html += `<div style="${S.title}">수 시  위 험 성 평 가</div>`;
        html += `
          <table style="${S.table}">
            <tr>
              <td style="${S.th} width:14%;">작 업 명</td>
              <td style="${S.td} width:36%;">${Store.get('작업명') || ''}</td>
              <td style="${S.th} width:14%;">평가 일자</td>
              <td style="${S.td} width:36%;">${ov.작성일자 || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">작업 기간</td>
              <td style="${S.td}">${ov.작업기간 || ''}</td>
              <td style="${S.th}">소 속</td>
              <td style="${S.td}">${ov.회사부서명 || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">작업 장소</td>
              <td style="${S.td}">${ov.작업장소 || ''}</td>
              <td style="${S.th}">작업 인원</td>
              <td style="${S.td}">${members.length}명</td>
            </tr>
            <tr>
              <td style="${S.th}">필요한 보호구</td>
              <td style="${S.td}" colspan="3">${ov.필요한보호구 || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">필요한 공기구</td>
              <td style="${S.td}" colspan="3">${ov.필요한공기구 || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">투입 중장비</td>
              <td style="${S.td}" colspan="3">${Store.getEquipmentText() || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">위험성평가자</td>
              <td style="${S.td}" colspan="3">${Store.getMembersText() || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">작업절차서</td>
              <td style="${S.td}" colspan="3">${ov.작업절차서 || ''}</td>
            </tr>
            <tr>
              <td style="${S.th}">작업분류</td>
              <td style="${S.td} font-size:8pt;" colspan="3">${workTypeChecks}</td>
            </tr>
          </table>
        `;
      } else {
        // 후속 페이지: 제목만 간단히
        html += `<div style="text-align:center; font-size:12pt; font-weight:bold; margin-bottom:8px;">수시 위험성평가 (계속)</div>`;
      }

      // 공정 테이블 (모든 페이지 공통)
      html += `
        <table style="${S.table}; margin-top:3px;">
          <tr>
            <td style="${S.th} width:35px;">순번</td>
            <td style="${S.th} width:25%;">작 업 단 계</td>
            <td style="${S.th}">작 업 내 용</td>
            <td style="${S.th} width:20%;">기 인 물</td>
          </tr>
          ${processRows.join('')}
        </table>
      `;

      // 페이지 번호
      html += `<div style="${S.pageNum}">- ${page + 1} -</div>`;
      html += '</div>';
      pages.push(html);
    }

    return pages;
  }

  // ============================================================
  //  2쪽~: 위험성평가표 (헤더 반복 페이지네이션, 후(전) 형식)
  // ============================================================
  function pages_위험성평가표() {
    const rows = Store.get('rows');
    if (rows.length === 0) return [];

    const ROWS_PER_PAGE = 20;
    const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
    const pages = [];

    function headerHTML() {
      return `
        <div style="${S.title}">위 험 성 평 가 표</div>
        <table style="${S.table}">
          <thead>
            <tr>
              <th style="${S.th} width:35px;" rowspan="2">관리<br>번호</th>
              <th style="${S.th} width:15%;" rowspan="2">세부 작업단계</th>
              <th style="${S.th} width:22%;" rowspan="2">유해·위험요인</th>
              <th style="${S.th}" rowspan="2">현재 안전조치사항</th>
              <th style="${S.th}" colspan="3">현재 위험성</th>
              <th style="${S.th} width:40px;" rowspan="2">현장<br>확인</th>
            </tr>
            <tr>
              <th style="${S.th} font-size:7pt; width:32px;">가능성<br>(빈도)</th>
              <th style="${S.th} font-size:7pt; width:32px;">중대성<br>(강도)</th>
              <th style="${S.th} font-size:7pt; width:36px;">위험성</th>
            </tr>
          </thead>
      `;
    }

    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * ROWS_PER_PAGE;
      const pageRows = rows.slice(startIdx, startIdx + ROWS_PER_PAGE);

      const rowsHTML = pageRows.map(r => {
        const fb = r.freqBefore || 0;
        const sb = r.sevBefore || 0;
        const fa = r.freqAfter || 0;
        const sa = r.sevAfter || 0;
        const rb = r.riskBefore || fb * sb;
        const ra = r.riskAfter || fa * sa;

        // 후(전) 형식: 개선후값(개선전값)
        const freqDisplay = fa ? `${fa}(${fb})` : (fb ? `(${fb})` : '');
        const sevDisplay = sa ? `${sa}(${sb})` : (sb ? `(${sb})` : '');
        const riskDisplay = ra ? `${ra}(${rb})` : (rb ? `(${rb})` : '');

        return `
          <tr>
            <td style="${S.td} text-align:center; font-size:7pt;">${r.no || ''}</td>
            <td style="${S.td} font-size:7.5pt;">${r.stage || ''}</td>
            <td style="${S.td} font-size:7.5pt;">${r.hazard || ''}</td>
            <td style="${S.td} font-size:7.5pt;">${r.safety || ''}</td>
            <td style="${S.td} text-align:center; font-size:7.5pt;">${freqDisplay}</td>
            <td style="${S.td} text-align:center; font-size:7.5pt;">${sevDisplay}</td>
            <td style="${S.td} text-align:center; font-size:7.5pt; ${riskColor(ra || rb)}">${riskDisplay}</td>
            <td style="${S.td}"></td>
          </tr>
        `;
      }).join('');

      // 빈 행으로 페이지 채우기
      const emptyCount = ROWS_PER_PAGE - pageRows.length;
      const emptyRows = emptyCount > 0
        ? Array(emptyCount).fill(`
            <tr style="height:18px;">
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
            </tr>
          `).join('')
        : '';

      const pageNumGlobal = pages_수시위험성평가_count + page + 1;
      pages.push(`
        <div class="print-page">
          ${headerHTML()}
          <tbody>
            ${rowsHTML}
            ${emptyRows}
          </tbody>
          </table>
          <div style="${S.pageNum}">- ${pageNumGlobal} -</div>
        </div>
      `);
    }

    return pages;
  }

  // 페이지 카운트 추적 (동적)
  let pages_수시위험성평가_count = 0;

  // ============================================================
  //  위험성평가 실시결과 확인 (3단 30명 — KOEN 서식 4페이지)
  // ============================================================
  function pages_실시결과확인() {
    const members = Store.get('members').filter(m => m.name);
    const totalSlots = 30;

    function makeCol(start, end) {
      let rows = '';
      for (let i = start; i <= end; i++) {
        const m = members[i - 1];
        rows += `
          <tr style="height:18px;">
            <td style="${S.td} text-align:center; width:24px; font-size:7.5pt;">${i}</td>
            <td style="${S.td} text-align:center; font-size:7.5pt;">${m ? (m.affiliation || '') : ''}</td>
            <td style="${S.td} text-align:center; font-size:7.5pt;">${m ? (m.name || '') : ''}</td>
            <td style="${S.td} width:40px;"></td>
          </tr>
        `;
      }
      return rows;
    }

    return [`
      <div class="print-page">
        <div style="${S.title}">위험성평가 실시결과 확인</div>

        <div style="border:2px solid #000; padding:6px 10px; margin-bottom:8px; font-size:8.5pt; line-height:1.6;">
          <p>□ 작업 시작 전 관리감독자로부터 유해·위험요인에 대한 정보를 제공 받고 그 내용을 확인 하였으며,</p>
          <p style="padding-left:14px;">유해·위험작업으로부터 보호를 받을 수 있는 보호구를 지급받고 착용 하였습니다.</p>
          <p>□ 해당 작업에 대한 위험성평가 결과를 확인하고 숙지하였습니다.</p>
          <p style="font-size:8pt; margin-top:4px;">※ 유해·위험요인 개선 요청은 Safety365 모바일웹 안전제안에서 하실 수 있습니다.( http://koenergy.kr/safety365)</p>
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top; width:33.3%; padding-right:2px;">
              <table style="${S.table}">
                <tr>
                  <th style="${S.th} width:28px;">순번</th>
                  <th style="${S.th}">소 속</th>
                  <th style="${S.th}">성 명</th>
                  <th style="${S.th} width:45px;">서 명</th>
                </tr>
                ${makeCol(1, 10)}
              </table>
            </td>
            <td style="vertical-align:top; width:33.3%; padding:0 1px;">
              <table style="${S.table}">
                <tr>
                  <th style="${S.th} width:28px;">순번</th>
                  <th style="${S.th}">소 속</th>
                  <th style="${S.th}">성 명</th>
                  <th style="${S.th} width:45px;">서 명</th>
                </tr>
                ${makeCol(11, 20)}
              </table>
            </td>
            <td style="vertical-align:top; width:33.3%; padding-left:2px;">
              <table style="${S.table}">
                <tr>
                  <th style="${S.th} width:28px;">순번</th>
                  <th style="${S.th}">소 속</th>
                  <th style="${S.th}">성 명</th>
                  <th style="${S.th} width:45px;">서 명</th>
                </tr>
                ${makeCol(21, 30)}
              </table>
            </td>
          </tr>
        </table>

        <!-- 비고 -->
        <table style="${S.table}; margin-top:6px;">
          <tr>
            <td style="${S.th}; font-size:10pt; letter-spacing:6px;">비 고</td>
          </tr>
          <tr>
            <td style="${S.td} height:60px; vertical-align:top;"></td>
          </tr>
        </table>
      </div>
    `];
  }

  // ============================================================
  //  TBM 일지 1면
  // ============================================================
  function page_TBM1면() {
    const ov = Store.get('overview');
    const members = Store.get('members').filter(m => m.name);
    const tbm = Store.get('tbm');
    const tbmItems = Store.getTbmRiskItems();
    const details = tbm.attendeeDetails || {};
    const workTypes = Store.classifyWorkTypes();

    const permitOrder = ['화기작업', '일반작업', '밀폐작업', '고소작업', '정전작업', '굴착작업', '잠수작업', '중장비작업', '방사선작업'];
    const permitChecks = permitOrder.map(id => {
      const t = workTypes.find(wt => wt.id === id);
      return `${t && t.result === '해당' ? '■' : '□'} ${id}`;
    }).join('&nbsp;&nbsp;');

    const riskRows = [];
    for (let i = 0; i < Math.max(3, tbmItems.length); i++) {
      const item = tbmItems[i];
      riskRows.push(`
        <tr>
          <td style="${S.td} text-align:center; width:30px;">${i + 1}</td>
          <td style="${S.td}">${item ? item.hazard : ''}</td>
          <td style="${S.td}">${item ? item.safety : ''}</td>
          <td style="${S.td} text-align:center; width:30px;"></td>
        </tr>
      `);
    }

    const CHECKLIST = [
      '작업에 필요한 안전작업허가서는 발행되었는가?',
      '작업조건과 작업범위는 검토되었는가?',
      '유해·위험요인에 대하여 교육 및 안전조치는 하였는가?',
      '작업에 필요한 안전한 작업방법은 알고 있는가?(장비, 공구사용법 등)',
      '도면 및 정비절차서는 검토하였는가?',
      '사용장비에 대한 안전확인점검 실시여부를 확인 하였는가?',
      '작업대상 설비는 계통과 격리되어 위험은 없는가?',
      '안전사고 발생시 비상조치계획을 알고 있는가?',
    ];
    const half = Math.ceil(CHECKLIST.length / 2);
    const col1 = CHECKLIST.slice(0, half);
    const col2 = CHECKLIST.slice(half);

    const dateStr = ov.작성일자 || '';
    const dayOfWeek = dateStr ? (() => {
      const d = new Date(dateStr);
      return isNaN(d) ? '' : ['일','월','화','수','목','금','토'][d.getDay()];
    })() : '';

    return `
      <div class="print-page-landscape">
        ${결재란TBM()}
        <div style="${S.title}">TBM 일지</div>

        <table style="${S.table}; margin-bottom:2px;">
          <tr>
            <td style="${S.td} width:11%;">○ 회사명 :</td>
            <td style="${S.td} width:39%;">${ov.회사부서명 || ''}</td>
            <td style="${S.td} width:13%;">○ 시행부서명 :</td>
            <td style="${S.td} width:37%;">${ov.회사부서명 || ''}</td>
          </tr>
          <tr>
            <td style="${S.td}">○ 시행일 :</td>
            <td style="${S.td}">${dateStr}${dayOfWeek ? `(${dayOfWeek})` : ''}</td>
            <td style="${S.td}">작업책임자(조장) :</td>
            <td style="${S.td}">${ov.작성자 || ''}　(서명)</td>
          </tr>
        </table>

        <table style="${S.table}; margin-bottom:2px;">
          <tr>
            <td style="${S.th} width:11%;">▣ 작 업 명 :</td>
            <td style="${S.td}" colspan="3">${Store.get('작업명') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}" colspan="4">▣ 작 업 내 용</td>
          </tr>
          <tr>
            <td style="${S.td} width:11%;">○ 작업장소 :</td>
            <td style="${S.td} width:39%;">${ov.작업장소 || ''}</td>
            <td style="${S.td} width:13%;">○ 작업시간 :</td>
            <td style="${S.td} width:37%;">${ov.작업기간 || ''}</td>
          </tr>
          <tr>
            <td style="${S.td}">○ 투입장비 :</td>
            <td style="${S.td}">${Store.getEquipmentText() || '-'}</td>
            <td style="${S.td}">○ 투입인원 :</td>
            <td style="${S.td}">${members.length}명</td>
          </tr>
          <tr>
            <td style="${S.td}">○ 안전허가 :</td>
            <td style="${S.td} font-size:6.5pt;" colspan="3">${permitChecks}</td>
          </tr>
        </table>

        <div style="${S.subtitle}; color:#000; margin:2px 0 1px;">▣ 위험예지활동 (위험성평가 활용)</div>
        <table style="${S.table}; margin-bottom:1px;">
          <tr>
            <th style="${S.thNavy} width:25px;">순번</th>
            <th style="${S.thNavy}">유해 · 위험요인</th>
            <th style="${S.thNavy}">안전대책</th>
            <th style="${S.thNavy} width:25px;">확인</th>
          </tr>
          ${riskRows.join('')}
        </table>
        <table style="${S.table}; margin-bottom:2px;">
          <tr>
            <td style="${S.td} font-weight:bold; width:55px;">One Point</td>
            <td style="${S.td}">${tbm.onePoint || ''}</td>
          </tr>
        </table>

        <div style="${S.subtitle}; margin:2px 0 1px;">▣ 점검사항 및 확인(Check List)</div>
        <table style="${S.table}; margin-bottom:1px;">
          <tr>
            <td style="${S.td} font-size:7.5pt; width:50%;"><strong>적용 절차서</strong>　${tbm.procedure || ''}</td>
            <td style="${S.td} font-size:7.5pt;"><strong>적용 작업 전 안전점검표</strong>　${tbm.safetySheet || ''}</td>
          </tr>
        </table>
        <table style="${S.table}; margin-bottom:2px;">
          <tr>
            <th style="${S.thNavy} width:22px;">NO</th>
            <th style="${S.thNavy}">점검 및 확인</th>
            <th style="${S.thNavy} width:22px;">예</th>
            <th style="${S.thNavy} width:22px;">아니오</th>
            <th style="${S.thNavy} width:22px;">NO</th>
            <th style="${S.thNavy}">점검 및 확인</th>
            <th style="${S.thNavy} width:22px;">예</th>
            <th style="${S.thNavy} width:22px;">아니오</th>
          </tr>
          ${col1.map((q, i) => {
            const val1 = tbm.checklist[`q${i + 1}`] || '';
            const q2 = col2[i];
            const val2 = q2 ? (tbm.checklist[`q${i + half + 1}`] || '') : '';
            return `
              <tr>
                <td style="${S.td} text-align:center; font-size:7pt;">${i + 1}</td>
                <td style="${S.td} font-size:7pt;">${q}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${val1 === 'yes' ? '■' : '□'}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${val1 === 'no' ? '■' : '□'}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${q2 ? i + half + 1 : ''}</td>
                <td style="${S.td} font-size:7pt;">${q2 || ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${val2 === 'yes' ? '■' : '□'}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${val2 === 'no' ? '■' : '□'}</td>
              </tr>
            `;
          }).join('')}
        </table>

        <div style="${S.subtitle}; margin:2px 0 1px;">▣ 참석자 및 건강상태 확인</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} font-size:7pt;" rowspan="2">소속</th>
            <th style="${S.thNavy} font-size:7pt;" rowspan="2">성명</th>
            <th style="${S.thNavy} font-size:7pt;" rowspan="2">서명</th>
            <th style="${S.thNavy} font-size:6.5pt;" colspan="3">안전장구/보호구 착용</th>
            <th style="${S.thNavy} font-size:6.5pt;" colspan="2">건강상태 확인</th>
            <th style="${S.thNavy} font-size:6pt;" rowspan="2">이상자<br>발생여부</th>
          </tr>
          <tr>
            <th style="${S.thNavy} font-size:6.5pt; width:24px;">안전모</th>
            <th style="${S.thNavy} font-size:6.5pt; width:24px;">안전대</th>
            <th style="${S.thNavy} font-size:6.5pt; width:24px;">기타</th>
            <th style="${S.thNavy} font-size:6.5pt; width:40px;">작업 전</th>
            <th style="${S.thNavy} font-size:6.5pt; width:40px;">작업 후</th>
          </tr>
          ${members.map(m => {
            const d = details[m.name] || {};
            return `
              <tr>
                <td style="${S.td} text-align:center; font-size:7pt;">${m.affiliation || ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${m.name}</td>
                <td style="${S.td}"></td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.helmet ? 'O' : ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.safetyBelt ? 'O' : ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.safetyShoes ? 'O' : ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.healthBefore || ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.healthAfter || ''}</td>
                <td style="${S.td} text-align:center; font-size:7pt;">${d.abnormal ? 'O' : ''}</td>
              </tr>
            `;
          }).join('')}
          ${members.length < 10 ? Array(10 - members.length).fill(0).map(() => `
            <tr style="height:16px;">
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
            </tr>
          `).join('') : ''}
        </table>
      </div>
    `;
  }

  // ============================================================
  //  TBM 일지 2면
  // ============================================================
  function page_TBM2면() {
    const tbm = Store.get('tbm');

    return `
      <div class="print-page-landscape">
        <div style="${S.subtitle}; font-weight:bold; margin:0 0 2px;">▣ 작업 종료 후 피드백 미팅</div>
        <table style="${S.table}; margin-bottom:6px;">
          <tr><td style="${S.td} height:18px;">○</td></tr>
          <tr><td style="${S.td} height:18px;">○</td></tr>
          <tr><td style="${S.td} height:18px;">○</td></tr>
          <tr><td style="${S.td} height:18px;">○</td></tr>
        </table>

        <table style="${S.table}; margin-bottom:6px;">
          <tr>
            <td style="${S.th} width:40px;" rowspan="2">기타</td>
            <td style="${S.td} font-size:7.5pt; font-weight:bold;"><u>TBM을 주관하는 조장이 당일 작업 중, 특이사항 및 이상사항 발생여부, 근무조 건강 이상상태 등 기재</u></td>
          </tr>
          <tr>
            <td style="${S.td}">감시자에게 필요한 안전장구를 지급하였습니까? &nbsp;&nbsp; ${tbm.safetyGearProvided ? '■' : '□'} 예, &nbsp; ${tbm.safetyGearProvided ? '□' : '■'} 아니오</td>
          </tr>
        </table>

        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:60px;" rowspan="2">도급인<br>전달<br>사항</td>
            <td style="${S.td} min-height:60px;" colspan="3">${tbm.contractorMessage?.content || ''}</td>
          </tr>
          <tr>
            <td style="${S.td}"><strong>전달일시</strong>　${tbm.contractorMessage?.deliveredAt || ''}</td>
            <td style="${S.td}"><strong>전달자</strong>　${tbm.contractorMessage?.deliverer || ''}</td>
            <td style="${S.td}"><strong>서명</strong></td>
          </tr>
        </table>
      </div>
    `;
  }

  // ============================================================
  //  print() 래퍼: 페이지 카운트 추적
  // ============================================================
  function printAll() {
    const old = document.getElementById('printContainer');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'printContainer';
    container.className = 'print-only';

    // 수시 위험성평가 페이지 생성
    const p1 = pages_수시위험성평가();
    pages_수시위험성평가_count = p1.length;

    // 위험성평가표 페이지
    const p2 = pages_위험성평가표();

    // 실시결과확인
    const p3 = pages_실시결과확인();

    // TBM
    const p4 = page_TBM1면();
    const p5 = page_TBM2면();

    container.innerHTML = [
      ...p1,
      ...p2,
      ...p3,
      p4,
      p5,
    ].join('');

    document.body.appendChild(container);
    window.print();
  }

  return { print: printAll };
})();
