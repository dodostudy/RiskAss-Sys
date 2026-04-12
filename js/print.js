/**
 * PDF 인쇄용 붙임서식 생성 (서식3 + TBM 양식 기반)
 * - window.print() 호출 전에 인쇄 전용 컨테이너를 동적 생성
 */
const PrintManager = (() => {
  function print() {
    const old = document.getElementById('printContainer');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'printContainer';
    container.className = 'print-only';

    container.innerHTML = [
      page1_작업개요(),
      page2_위험성평가표(),
      page3_감소대책(),
      page4_개선결과(),
      page5_결과확인(),
      page6_TBM1면(),
      page7_TBM2면(),
    ].join('');

    document.body.appendChild(container);
    window.print();
  }

  // === 공통 스타일 ===
  const S = {
    table: 'width:100%; border-collapse:collapse; font-size:9pt;',
    td: 'border:1px solid #000; padding:3px 5px; font-size:9pt;',
    th: 'border:1px solid #000; padding:3px 5px; font-size:9pt; background:#E3F4E3; font-weight:bold; text-align:center;',
    thNavy: 'border:1px solid #000; padding:3px 5px; font-size:9pt; background:#1F3864; color:white; font-weight:bold; text-align:center;',
    title: 'text-align:center; font-size:16pt; font-weight:bold; margin-bottom:10px; font-family:"Noto Serif KR",serif;',
    subtitle: 'font-size:10pt; font-weight:bold; margin:8px 0 4px;',
    stamp: 'border:1px solid #000; padding:2px; font-size:8pt; text-align:center;',
  };

  function riskColor(v) {
    if (v >= 12) return 'background:#C00000;color:white;font-weight:bold;';
    if (v >= 8) return 'background:#E26B0A;color:white;font-weight:bold;';
    if (v >= 4) return 'background:#FFC000;font-weight:bold;';
    if (v >= 1) return 'background:#375623;color:white;font-weight:bold;';
    return '';
  }

  /** 결재란 생성 */
  function 결재란(titles) {
    return `
      <table style="border-collapse:collapse; float:right; margin-bottom:8px;">
        <tr>
          <td style="${S.stamp} background:#E3F4E3; font-weight:bold;" rowspan="2">결<br>재</td>
          ${titles.map(t => `<td style="${S.stamp} width:50px; background:#F3F4F6;">${t}</td>`).join('')}
        </tr>
        <tr>
          ${titles.map(() => `<td style="${S.stamp} height:40px; width:50px;"></td>`).join('')}
        </tr>
      </table>
      <div style="clear:both;"></div>
    `;
  }

  // === 1쪽: 작업개요 (서식3 기반) ===
  function page1_작업개요() {
    const ov = Store.get('overview');
    const workTypes = Store.classifyWorkTypes();
    const workTypeChecks = workTypes.map(t =>
      `${t.result === '해당' ? '■' : '□'} ${t.id}`
    ).join('  ');

    return `
      <div class="print-page" style="padding:0;">
        ${결재란(['승인', '담당', '차장', '부장'])}
        <div style="${S.title}">위험성평가 작업개요</div>
        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:18%;">관리번호</td>
            <td style="${S.td} width:32%;">${Store.get('관리번호') || ''}</td>
            <td style="${S.th} width:18%;">회사(부서)명</td>
            <td style="${S.td} width:32%;">${ov.회사부서명 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업명</td>
            <td style="${S.td}" colspan="3">${Store.get('작업명') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업내용</td>
            <td style="${S.td}" colspan="3">${Store.get('작업내용') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작성일자</td>
            <td style="${S.td}">${ov.작성일자 || ''}</td>
            <td style="${S.th}">작성자</td>
            <td style="${S.td}">${ov.작성자 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업기간(시간)</td>
            <td style="${S.td}" colspan="3">${ov.작업기간 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업장소</td>
            <td style="${S.td}" colspan="3">${ov.작업장소 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업분류</td>
            <td style="${S.td} font-size:8pt;" colspan="3">${workTypeChecks}</td>
          </tr>
          <tr>
            <td style="${S.th}">유사재해/<br>아차사고사례</td>
            <td style="${S.td}" colspan="3">
              ${Store.getSelectedHazards().length > 0
                ? `SIF DB 연계 기인물 ${Store.getSelectedHazards().length}개, 총 ${Store.getSelectedHazards().reduce((s, h) => s + h.총사고건수, 0).toLocaleString()}건 사고사례 참조`
                : '-'}
            </td>
          </tr>
          <tr>
            <td style="${S.th}">중점관리사항</td>
            <td style="${S.td}" colspan="3">${ov.중점관리사항 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">보호구</td>
            <td style="${S.td}" colspan="3">${ov.필요한보호구 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">공기구</td>
            <td style="${S.td}" colspan="3">${ov.필요한공기구 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">투입중장비</td>
            <td style="${S.td}" colspan="3">${Store.getEquipmentText() || '-'}</td>
          </tr>
          <tr>
            <td style="${S.th}">평가참여자</td>
            <td style="${S.td}" colspan="3">${Store.getMembersText() || '-'}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // === 2쪽: 위험성평가표 (서식3 기반) ===
  function page2_위험성평가표() {
    const rows = Store.get('rows');
    return `
      <div class="print-page">
        <div style="${S.title}">위험성평가표</div>
        <p style="font-size:8pt; text-align:right; margin-bottom:4px;">관리번호: ${Store.get('관리번호') || ''}</p>
        <table style="${S.table}">
          <thead>
            <tr>
              <th style="${S.thNavy}" rowspan="2">관리<br>번호</th>
              <th style="${S.thNavy}" rowspan="2">작업(공정)단계</th>
              <th style="${S.thNavy}" rowspan="2">유해위험요인</th>
              <th style="${S.thNavy}" rowspan="2">현재<br>안전조치사항</th>
              <th style="${S.thNavy}" colspan="3">위험성 추정(전)</th>
              <th style="${S.thNavy}" rowspan="2">추가<br>안전조치사항</th>
              <th style="${S.thNavy}" colspan="3">위험성 추정(후)</th>
              <th style="${S.thNavy}" rowspan="2">조치<br>일자</th>
              <th style="${S.thNavy}" rowspan="2">담당자</th>
            </tr>
            <tr>
              <th style="${S.thNavy} font-size:7pt; width:24px;">가능성<br>(빈도)</th>
              <th style="${S.thNavy} font-size:7pt; width:24px;">중대성<br>(강도)</th>
              <th style="${S.thNavy} font-size:7pt; width:28px;">위험성</th>
              <th style="${S.thNavy} font-size:7pt; width:24px;">가능성<br>(빈도)</th>
              <th style="${S.thNavy} font-size:7pt; width:24px;">중대성<br>(강도)</th>
              <th style="${S.thNavy} font-size:7pt; width:28px;">위험성</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => {
              const rb = r.riskBefore || (r.freqBefore || 0) * (r.sevBefore || 0);
              const ra = r.riskAfter || (r.freqAfter || 0) * (r.sevAfter || 0);
              return `
                <tr>
                  <td style="${S.td} text-align:center; font-size:7pt;">${r.no || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.stage || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.hazard || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.safety || ''}</td>
                  <td style="${S.td} text-align:center; font-size:8pt;">${r.freqBefore || ''}</td>
                  <td style="${S.td} text-align:center; font-size:8pt;">${r.sevBefore || ''}</td>
                  <td style="${S.td} text-align:center; ${riskColor(rb)}">${rb || ''}</td>
                  <td style="${S.td} font-size:8pt;"></td>
                  <td style="${S.td} text-align:center; font-size:8pt; color:#0000FF;">${r.freqAfter || ''}</td>
                  <td style="${S.td} text-align:center; font-size:8pt; color:#0000FF;">${r.sevAfter || ''}</td>
                  <td style="${S.td} text-align:center; ${riskColor(ra)}">${ra || ''}</td>
                  <td style="${S.td} font-size:8pt;"></td>
                  <td style="${S.td} font-size:8pt;"></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // === 3쪽: 감소대책 고려사항 ===
  function page3_감소대책() {
    return `
      <div class="print-page">
        <div style="${S.title}">위험성 감소대책 수립 시 고려사항</div>
        <table style="${S.table}">
          <tr><th style="${S.thNavy}" colspan="2">위험성 감소대책 수립 원칙</th></tr>
          <tr>
            <td style="${S.th} width:30%;">1. 본질적 대책</td>
            <td style="${S.td}">위험한 작업의 폐지·변경, 유해·위험물질 대체 등 설계나 계획 단계에서 위험요인 자체를 제거</td>
          </tr>
          <tr>
            <td style="${S.th}">2. 공학적 대책</td>
            <td style="${S.td}">인터록, 안전장치, 방호울 등 설비적 대책</td>
          </tr>
          <tr>
            <td style="${S.th}">3. 관리적 대책</td>
            <td style="${S.td}">매뉴얼 정비, 출입금지, 노출시간 관리, 교육훈련</td>
          </tr>
          <tr>
            <td style="${S.th}">4. 개인보호구</td>
            <td style="${S.td}">개인보호구의 사용 (최후의 수단)</td>
          </tr>
        </table>

        <div style="${S.subtitle}; margin-top:20px;">위험성 수준별 조치 기준 (빈도 1~4 x 강도 1~5 = 최대 20)</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:15%; text-align:center;">등급</th>
            <th style="${S.thNavy} width:15%; text-align:center;">위험도</th>
            <th style="${S.thNavy} text-align:center;">조치 내용</th>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#C00000; color:white; font-weight:bold;">매우위험(VH)</td>
            <td style="${S.td} text-align:center;">12~20</td>
            <td style="${S.td}">즉시 작업중지, 개선 시까지 작업 불가</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#E26B0A; color:white; font-weight:bold;">고위험(H)</td>
            <td style="${S.td} text-align:center;">8~11</td>
            <td style="${S.td}">추가 안전조치 후 작업 가능, TBM 시 필수 전달</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#FFC000; font-weight:bold;">���위험(M)</td>
            <td style="${S.td} text-align:center;">4~7</td>
            <td style="${S.td}">주의 관찰 필요, 가능한 경감 조치</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#375623; color:white; font-weight:bold;">저위험(L)</td>
            <td style="${S.td} text-align:center;">1~3</td>
            <td style="${S.td}">현재 수준 유지</td>
          </tr>
        </table>
      </div>
    `;
  }

  // === 4쪽: 개선결과 (서식3 기반) ===
  function page4_개선결과() {
    const rows = Store.get('rows').filter(r => r.riskBefore >= 8);
    const ov = Store.get('overview');
    return `
      <div class="print-page">
        <div style="${S.title}">개선 결과</div>
        <table style="${S.table}; margin-bottom:10px;">
          <tr>
            <td style="${S.th} width:18%;">회사 및 부서명</td>
            <td style="${S.td} width:32%;">${ov.회사부서명 || ''}</td>
            <td style="${S.th} width:18%;">관리번호</td>
            <td style="${S.td} width:32%;">${Store.get('관리번호') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업(공정)명</td>
            <td style="${S.td}">${Store.get('작업명') || ''}</td>
            <td style="${S.th}">담당자</td>
            <td style="${S.td}">${ov.작성자 || ''}</td>
          </tr>
        </table>

        ${rows.length === 0
          ? '<p style="text-align:center; padding:40px; color:#999;">고위험 항목 없음</p>'
          : rows.map((r, idx) => {
              const rb = r.riskBefore;
              const ra = r.riskAfter || 0;
              return `
                <table style="${S.table}; margin-bottom:12px;">
                  <tr>
                    <td style="${S.th} width:18%;">작업내용</td>
                    <td style="${S.td}" colspan="3">${r.stage || ''} - ${r.hazard || ''}</td>
                  </tr>
                  <tr>
                    <td style="${S.th}">개선내용</td>
                    <td style="${S.td}" colspan="3">${r.safety || ''}</td>
                  </tr>
                  <tr>
                    <td style="${S.th} width:18%;">개선 전 위험성</td>
                    <td style="${S.td} width:32%; text-align:center;"><span style="${riskColor(rb)} padding:2px 8px; border-radius:3px;">${rb}</span> (빈도${r.freqBefore} x 강도${r.sevBefore})</td>
                    <td style="${S.th} width:18%;">개선 후 위험성</td>
                    <td style="${S.td} width:32%; text-align:center;"><span style="${riskColor(ra)} padding:2px 8px; border-radius:3px;">${ra}</span> (빈도${r.freqAfter} x 강도${r.sevAfter})</td>
                  </tr>
                  <tr>
                    <td style="${S.th}">개선 전 사진</td>
                    <td style="${S.td} height:80px; text-align:center; color:#999; font-size:8pt;">(사진 첨부)</td>
                    <td style="${S.th}">개선 후 사진</td>
                    <td style="${S.td} height:80px; text-align:center; color:#999; font-size:8pt;">(사진 첨부)</td>
                  </tr>
                </table>
              `;
            }).join('')
        }
      </div>
    `;
  }

  // === 5쪽: 결과확인 (서명란) ===
  function page5_결과확인() {
    const members = Store.get('members').filter(m => m.name);
    return `
      <div class="print-page">
        <div style="${S.title}">위험성평가 결과확인</div>
        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:25%;">관리번호</td>
            <td style="${S.td}">${Store.get('관리번호')}</td>
            <td style="${S.th} width:25%;">작성일자</td>
            <td style="${S.td}">${Store.get('overview').작성일자}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업명</td>
            <td style="${S.td}" colspan="3">${Store.get('작업명')}</td>
          </tr>
        </table>

        <div style="${S.subtitle}; margin-top:16px;">평가참여자 서명란</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:40px;">순번</th>
            <th style="${S.thNavy}">소속</th>
            <th style="${S.thNavy}">성명</th>
            <th style="${S.thNavy} width:120px;">서명</th>
          </tr>
          ${members.map((m, i) => `
            <tr style="height:30px;">
              <td style="${S.td} text-align:center;">${i + 1}</td>
              <td style="${S.td} text-align:center;">${m.affiliation}</td>
              <td style="${S.td} text-align:center;">${m.name}</td>
              <td style="${S.td}"></td>
            </tr>
          `).join('')}
          ${members.length < 10 ? Array(10 - members.length).fill(0).map((_, i) => `
            <tr style="height:30px;">
              <td style="${S.td} text-align:center;">${members.length + i + 1}</td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
            </tr>
          `).join('') : ''}
        </table>

        <div style="margin-top:40px; text-align:center;">
          <p style="font-size:10pt;">상기 위험성평가 결과를 확인합니다.</p>
          <p style="font-size:10pt; margin-top:30px;">
            ${Store.get('overview').작성일자 || '____년 __월 __일'}
          </p>
          <p style="font-size:11pt; margin-top:20px;">
            작성자: ${Store.get('overview').작성자 || '________________'} (서명)
          </p>
        </div>
      </div>
    `;
  }

  // === 6쪽: TBM 일지 1면 (TBM 양식.pdf 기반) ===
  function page6_TBM1면() {
    const ov = Store.get('overview');
    const members = Store.get('members').filter(m => m.name);
    const tbm = Store.get('tbm');
    const tbmItems = Store.getTbmRiskItems();
    const details = tbm.attendeeDetails || {};
    const workTypes = Store.classifyWorkTypes();

    // 안전허가 체크박스
    const permitChecks = workTypes.map(t =>
      `${t.result === '해당' ? '■' : '□'} ${t.id}`
    ).join('  ');

    // 위험예지활동 행 (최소 3행)
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

    return `
      <div class="print-page">
        ${결재란(['소장', '관리감독자', '담당'])}
        <div style="${S.title}">TBM (Tool Box Meeting) 일지</div>

        <table style="${S.table}; margin-bottom:8px;">
          <tr>
            <td style="${S.th} width:18%;">시행부서명</td>
            <td style="${S.td} width:32%;">${ov.회사부서명 || ''}</td>
            <td style="${S.th} width:18%;">시행일</td>
            <td style="${S.td} width:32%;">${ov.작성일자 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">회사명</td>
            <td style="${S.td}">${ov.회사부서명 || ''}</td>
            <td style="${S.th}">작업책임자(조장)</td>
            <td style="${S.td}">${ov.작성자 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업명</td>
            <td style="${S.td}" colspan="3">${Store.get('작업명') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업내용</td>
            <td style="${S.td}" colspan="3">${Store.get('작업내용') || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업장소</td>
            <td style="${S.td}">${ov.작업장소 || ''}</td>
            <td style="${S.th}">작업시간</td>
            <td style="${S.td}">${ov.작업기간 || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">투입장비</td>
            <td style="${S.td}">${Store.getEquipmentText() || '-'}</td>
            <td style="${S.th}">투입인원</td>
            <td style="${S.td}">${members.length}명</td>
          </tr>
        </table>

        <table style="${S.table}; margin-bottom:8px;">
          <tr>
            <td style="${S.th} width:18%;">안전허가</td>
            <td style="${S.td} font-size:8pt;" colspan="3">${permitChecks}</td>
          </tr>
        </table>

        <div style="${S.subtitle}; color:#C00000;">위험예지활동</div>
        <table style="${S.table}; margin-bottom:4px;">
          <tr>
            <th style="${S.thNavy} width:30px;">순번</th>
            <th style="${S.thNavy}">유해 · 위험요인</th>
            <th style="${S.thNavy}">안전대책</th>
            <th style="${S.thNavy} width:30px;">확인</th>
          </tr>
          ${riskRows.join('')}
        </table>
        ${tbm.onePoint ? `<p style="font-size:8pt; margin-bottom:6px;"><strong style="color:#C00000;">One Point:</strong> ${tbm.onePoint}</p>` : '<p style="font-size:8pt; margin-bottom:6px;"><strong style="color:#C00000;">One Point:</strong></p>'}

        <div style="${S.subtitle};">참석자 및 건강상태 확인</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:50px;">소속</th>
            <th style="${S.thNavy} width:50px;">성명</th>
            <th style="${S.thNavy} width:50px;">서명</th>
            <th style="${S.thNavy}" colspan="3">안전장구</th>
            <th style="${S.thNavy}" colspan="3">건강상태</th>
          </tr>
          <tr>
            <th style="${S.thNavy}" colspan="3"></th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">안전모</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">안전대</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">기타</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">전</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">후</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">이상</th>
          </tr>
          ${members.map(m => {
            const d = details[m.name] || {};
            return `
              <tr>
                <td style="${S.td} text-align:center; font-size:8pt;">${m.affiliation}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${m.name}</td>
                <td style="${S.td}"></td>
                <td style="${S.td} text-align:center;">${d.helmet ? 'O' : ''}</td>
                <td style="${S.td} text-align:center;">${d.safetyBelt ? 'O' : ''}</td>
                <td style="${S.td} text-align:center;">${d.safetyShoes ? 'O' : ''}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${d.healthBefore || ''}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${d.healthAfter || ''}</td>
                <td style="${S.td} text-align:center;">${d.abnormal ? 'O' : ''}</td>
              </tr>
            `;
          }).join('')}
          ${members.length < 8 ? Array(8 - members.length).fill(0).map(() => `
            <tr style="height:22px;">
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
            </tr>
          `).join('') : ''}
        </table>
      </div>
    `;
  }

  // === 7쪽: TBM 일지 2면 (TBM 양식.pdf 기반) ===
  function page7_TBM2면() {
    const tbm = Store.get('tbm');
    const CHECKLIST = [
      '작업 전 안전교육을 실시하였는가?',
      '개인보호구를 정확히 착용하였는가?',
      '작업도구 및 장비 상태를 점검하였는가?',
      '작업장 정리정돈 상태는 양호한가?',
      '안전시설물(난간, 덮개 등)은 설치되었는가?',
      '위험구역 출입통제 조치를 하였는가?',
      '비상연락망 및 응급조치 방법을 숙지하였는가?',
      '작업허가서(안전작업허가)를 발급받았는가?',
    ];

    // 2열 레이아웃 체크리스트
    const half = Math.ceil(CHECKLIST.length / 2);
    const col1 = CHECKLIST.slice(0, half);
    const col2 = CHECKLIST.slice(half);

    return `
      <div class="print-page">
        <div style="${S.subtitle}">점검사항 Check List</div>
        <table style="${S.table}; margin-bottom:10px;">
          <tr>
            <th style="${S.thNavy} width:25px;">No</th>
            <th style="${S.thNavy}">점검 항목</th>
            <th style="${S.thNavy} width:30px;">예</th>
            <th style="${S.thNavy} width:30px;">아니오</th>
            <th style="${S.thNavy} width:25px;">No</th>
            <th style="${S.thNavy}">점검 항목</th>
            <th style="${S.thNavy} width:30px;">예</th>
            <th style="${S.thNavy} width:30px;">아니오</th>
          </tr>
          ${col1.map((q, i) => {
            const val1 = tbm.checklist[`q${i + 1}`] || '';
            const q2 = col2[i];
            const val2 = q2 ? (tbm.checklist[`q${i + half + 1}`] || '') : '';
            return `
              <tr>
                <td style="${S.td} text-align:center;">${i + 1}</td>
                <td style="${S.td} font-size:8pt;">${q}</td>
                <td style="${S.td} text-align:center;">${val1 === 'yes' ? 'V' : ''}</td>
                <td style="${S.td} text-align:center;">${val1 === 'no' ? 'V' : ''}</td>
                <td style="${S.td} text-align:center;">${q2 ? i + half + 1 : ''}</td>
                <td style="${S.td} font-size:8pt;">${q2 || ''}</td>
                <td style="${S.td} text-align:center;">${val2 === 'yes' ? 'V' : ''}</td>
                <td style="${S.td} text-align:center;">${val2 === 'no' ? 'V' : ''}</td>
              </tr>
            `;
          }).join('')}
        </table>

        <table style="${S.table}; margin-bottom:10px;">
          <tr>
            <td style="${S.th} width:25%;">감시자 안전장구 지급 여부</td>
            <td style="${S.td}">${tbm.safetyGearProvided ? '■ 지급완료' : '□ 미지급'}</td>
          </tr>
        </table>

        <div style="${S.subtitle};">작업 종료 후 피드백 미팅</div>
        <table style="${S.table}; margin-bottom:10px;">
          ${(tbm.feedback || ['','','','']).map((f, i) => `
            <tr>
              <td style="${S.td} width:30px; text-align:center;">${i + 1}</td>
              <td style="${S.td} min-height:20px;">${f || ''}</td>
            </tr>
          `).join('')}
        </table>

        <div style="${S.subtitle};">도급인 전달사항</div>
        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:18%;">내용</td>
            <td style="${S.td}" colspan="3">${tbm.contractorMessage?.content || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">전달일시</td>
            <td style="${S.td}">${tbm.contractorMessage?.deliveredAt || ''}</td>
            <td style="${S.th} width:18%;">전달자</td>
            <td style="${S.td}">${tbm.contractorMessage?.deliverer || ''}</td>
          </tr>
          <tr>
            <td style="${S.th}">서명</td>
            <td style="${S.td} height:30px;" colspan="3"></td>
          </tr>
        </table>
      </div>
    `;
  }

  return { print };
})();
